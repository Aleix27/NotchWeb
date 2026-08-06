#!/usr/bin/env python3
"""Build a minimal, reference-complete GitHub Pages artifact."""

from __future__ import annotations

import argparse
import html
import json
import re
import shutil
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parent.parent
PUBLIC_HOSTS = {"vibenotch.es", "www.vibenotch.es"}
TEXT_SUFFIXES = {".html", ".css", ".js", ".webmanifest", ".json"}
REFERENCE_SUFFIXES = {
    ".css", ".gif", ".htm", ".html", ".ico", ".ics", ".jpeg", ".jpg",
    ".js", ".json", ".m4a", ".mov", ".mp3", ".mp4", ".otf", ".pdf",
    ".png", ".svg", ".ttf", ".webm", ".webmanifest", ".webp", ".woff",
    ".woff2", ".xml",
}
MAX_ARTIFACT_BYTES = 80 * 1024 * 1024
CSS_URL_RE = re.compile(r"url\(\s*(['\"]?)(.*?)\1\s*\)", re.IGNORECASE)
QUOTED_RE = re.compile(r"(['\"`])([^\n'\"`]+)\1")
PUBLIC_URL_RE = re.compile(r"https?://(?:www\.)?vibenotch\.es/[^\s'\"`<>)]+", re.IGNORECASE)
URL_ATTRIBUTES = {"action", "content", "data-full", "data-hd", "data-src", "formaction", "href", "poster", "src"}


class AttributeCollector(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.values: list[str] = []

    def handle_starttag(self, _tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self._collect(attrs)

    def handle_startendtag(self, _tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self._collect(attrs)

    def _collect(self, attrs: list[tuple[str, str | None]]) -> None:
        for name, value in attrs:
            if not value:
                continue
            attribute = name.lower()
            if attribute in {"srcset", "data-srcset"}:
                for candidate in value.split(","):
                    item = candidate.strip().split(maxsplit=1)[0]
                    if item:
                        self.values.append(item)
            elif attribute in URL_ATTRIBUTES:
                self.values.append(value)


def iter_json_strings(value: object):
    if isinstance(value, str):
        yield value
    elif isinstance(value, list):
        for item in value:
            yield from iter_json_strings(item)
    elif isinstance(value, dict):
        for item in value.values():
            yield from iter_json_strings(item)


def extract_candidates(source: Path) -> set[str]:
    text = html.unescape(source.read_text(encoding="utf-8", errors="ignore"))
    candidates: set[str] = set(PUBLIC_URL_RE.findall(text))

    if source.suffix.lower() == ".html":
        parser = AttributeCollector()
        parser.feed(text)
        candidates.update(parser.values)

    if source.suffix.lower() == ".css":
        candidates.update(match.group(2).strip() for match in CSS_URL_RE.finditer(text))
    if source.suffix.lower() in {".js", ".json", ".webmanifest"}:
        candidates.update(match.group(2).strip() for match in QUOTED_RE.finditer(text))

    if source.suffix.lower() in {".json", ".webmanifest"}:
        try:
            candidates.update(iter_json_strings(json.loads(text)))
        except json.JSONDecodeError as error:
            raise RuntimeError(f"JSON inválido en {source.relative_to(ROOT)}: {error}") from error

    return {candidate for candidate in candidates if candidate}


def resolve_reference(source: Path, raw_value: str) -> Path | None:
    value = raw_value.strip()
    if not value or value.startswith(("#", "data:", "mailto:", "tel:", "javascript:", "blob:", "//")):
        return None

    parsed = urlsplit(value)
    if parsed.scheme:
        if parsed.scheme not in {"http", "https"} or (parsed.hostname or "").lower() not in PUBLIC_HOSTS:
            return None
        raw_path = unquote(parsed.path or "/")
        candidate = ROOT / raw_path.lstrip("/")
    else:
        raw_path = unquote(parsed.path)
        if not raw_path:
            return None
        suffix = Path(raw_path).suffix.lower()
        candidate = ROOT / raw_path.lstrip("/") if raw_path.startswith("/") else source.parent / raw_path
        try:
            candidate_exists = len(raw_path) <= 512 and candidate.exists()
        except OSError:
            candidate_exists = False
        looks_local = (
            suffix in REFERENCE_SUFFIXES
            or raw_path == "/"
            or raw_path.endswith("/")
            or candidate_exists
        )
        if not looks_local:
            return None

    resolved = candidate.resolve()
    if resolved != ROOT and ROOT not in resolved.parents:
        raise RuntimeError(f"Referencia fuera del proyecto en {source.relative_to(ROOT)}: {raw_value}")
    if resolved == ROOT or resolved.is_dir() or raw_path.endswith("/"):
        resolved = resolved / "index.html"
    return resolved


def seed_files() -> set[Path]:
    seeds: set[Path] = set()
    for suffix in ("*.html", "*.css", "*.js"):
        seeds.update(ROOT.glob(suffix))
    for section in ("edgeflow", "sweepy", "vibecapture"):
        section_root = ROOT / section
        for suffix in ("*.html", "*.css", "*.js"):
            seeds.update(section_root.rglob(suffix))
    for relative in ("CNAME", "robots.txt", "sitemap.xml", "assets/favicon/site.webmanifest"):
        candidate = ROOT / relative
        if candidate.is_file():
            seeds.add(candidate)
    return {path.resolve() for path in seeds if path.is_file()}


def collect_public_files() -> set[Path]:
    public_files = seed_files()
    queue = sorted(public_files)
    missing: set[tuple[str, str]] = set()
    scanned: set[Path] = set()

    while queue:
        source = queue.pop(0)
        if source in scanned or source.suffix.lower() not in TEXT_SUFFIXES:
            continue
        scanned.add(source)
        for raw_value in extract_candidates(source):
            target = resolve_reference(source, raw_value)
            if target is None:
                continue
            if not target.is_file():
                missing.add((source.relative_to(ROOT).as_posix(), raw_value))
                continue
            if target not in public_files:
                public_files.add(target)
                queue.append(target)

    if missing:
        details = "\n".join(f"  - {source}: {value}" for source, value in sorted(missing))
        raise RuntimeError(f"Referencias locales ausentes:\n{details}")
    return public_files


def build(output_name: str) -> tuple[int, int]:
    output = (ROOT / output_name).resolve()
    if output.name != "_site" or output.parent != ROOT:
        raise RuntimeError("El destino debe ser exactamente _site dentro del proyecto")
    if output.is_symlink():
        raise RuntimeError("_site no puede ser un enlace simbólico")
    if output.exists():
        shutil.rmtree(output)
    output.mkdir()

    public_files = collect_public_files()
    total_bytes = sum(path.stat().st_size for path in public_files)
    if total_bytes > MAX_ARTIFACT_BYTES:
        raise RuntimeError(
            f"El sitio público pesa {total_bytes / 1048576:.2f} MiB; "
            f"supera el límite preventivo de {MAX_ARTIFACT_BYTES / 1048576:.0f} MiB"
        )

    for source in sorted(public_files):
        relative = source.relative_to(ROOT)
        destination = output / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, destination)
    (output / ".nojekyll").touch()

    print(f"Sitio público: {len(public_files)} archivos, {total_bytes / 1048576:.2f} MiB")
    for source in sorted(public_files, key=lambda path: path.stat().st_size, reverse=True)[:10]:
        print(f"  {source.stat().st_size / 1048576:7.2f} MiB  {source.relative_to(ROOT)}")
    return len(public_files), total_bytes


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default="_site")
    args = parser.parse_args()
    try:
        build(args.output)
    except RuntimeError as error:
        print(f"ERROR: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
