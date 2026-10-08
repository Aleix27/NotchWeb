#!/usr/bin/env python3
"""Build a minimal, reference-complete GitHub Pages artifact."""

from __future__ import annotations

import argparse
import ast
import datetime
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
GENERATED_DIRS = {"en", "zh"}
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
    if "${" in value:
        return None  # template literal in a script, resolved at runtime

    parsed = urlsplit(value)
    if parsed.scheme:
        if parsed.scheme not in {"http", "https"} or (parsed.hostname or "").lower() not in PUBLIC_HOSTS:
            return None
        raw_path = unquote(parsed.path or "/")
        if raw_path.lstrip("/").split("/")[0] in GENERATED_DIRS:
            return None  # language versions are written by this build
        candidate = ROOT / raw_path.lstrip("/")
    else:
        raw_path = unquote(parsed.path)
        if not raw_path:
            return None
        suffix = Path(raw_path).suffix.lower()
        if raw_path.startswith("/"):
            candidate = ROOT / raw_path.lstrip("/")
        elif source.suffix.lower() == ".js":
            # Script paths are resolved by the browser against the page, which lives at the root.
            candidate = ROOT / raw_path
        else:
            candidate = source.parent / raw_path
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
    # EdgeFlow is published next to VibeNotch. Sweepy and VibeCapture stay in
    # the repository but are not published.
    for suffix in ("*.html", "*.css", "*.js"):
        seeds.update((ROOT / "edgeflow").rglob(suffix))
    # Site media is picked at runtime (language, screen size), so publish it whole.
    seeds.update(path for path in (ROOT / "assets" / "media").rglob("*") if path.is_file())
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


# ── Language versions ────────────────────────────────────────────────────
# Spanish lives at the root. English and Chinese get their own static URLs
# (/en/, /zh/) built from the Spanish pages and the site dictionaries, so
# search engines can index every language without running JavaScript.
SITE = "https://vibenotch.es/"
LANG_PAGES = {"index.html": "meta", "support.html": "su.meta", "privacy.html": "pv.meta"}
LANGS = {
    "es": {"html": "es", "locale": "es_ES"},
    "en": {"html": "en", "locale": "en_US"},
    "zh": {"html": "zh-Hans", "locale": "zh_CN"},
}
TEXT_RE = re.compile(r'(<(\w+)\b[^>]*?\sdata-i18n="([^"]+)"[^>]*>)([^<]*)(</\2>)')
HTML_RE = re.compile(r'(<(\w+)\b[^>]*?\sdata-i18n-html="([^"]+)"[^>]*>)(.*?)(</\2>)', re.S)
ATTR_TAG_RE = re.compile(r'<[^>]*?\sdata-i18n-attr="([^"]+)"[^>]*>')
LOCAL_PATH_RE = re.compile(r'(\s(?:src|href|poster|data-src|srcset)=")((?:assets|edgeflow)/)')
FAQ_RE = re.compile(r'<details><summary[^>]*>(.*?)</summary><p[^>]*>(.*?)</p></details>', re.S)


def load_dictionaries() -> dict[str, dict[str, str]]:
    dictionaries: dict[str, dict[str, str]] = {"en": {}, "zh": {}}
    for source in ("assets/site/i18n.js", "assets/site/i18n-pages.js"):
        text = (ROOT / source).read_text(encoding="utf-8")
        for lang, table in dictionaries.items():
            match = re.search(rf"\n\s+{lang}: \{{(.*?)\n\s+\}}", text, re.S)
            if not match:
                raise RuntimeError(f"Sin diccionario '{lang}' en {source}")
            table.update(ast.literal_eval("{" + match.group(1) + "}"))
    return dictionaries


def page_url(lang: str, page: str) -> str:
    path = "" if page == "index.html" else page
    return SITE + ("" if lang == "es" else f"{lang}/") + path


def faq_json_ld(document: str) -> str:
    def plain(fragment: str) -> str:
        return html.unescape(re.sub(r"<[^>]+>", "", fragment)).strip()

    questions = [
        {"@type": "Question", "name": plain(q), "acceptedAnswer": {"@type": "Answer", "text": plain(a)}}
        for q, a in FAQ_RE.findall(document)
    ]
    data = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": questions}
    return '<script type="application/ld+json" id="ld-faq">' + json.dumps(data, ensure_ascii=False) + "</script>"


def localize(document: str, lang: str, page: str, table: dict[str, str]) -> str:
    def attrs(match: re.Match) -> str:
        tag = match.group(0)
        for pair in match.group(1).split(";"):
            attribute, key = pair.split(":")
            if key in table:
                value = html.escape(table[key], quote=True)
                tag = re.sub(rf'(\s{attribute}=")[^"]*(")', lambda m: m.group(1) + value + m.group(2), tag, count=1)
        return tag

    document = ATTR_TAG_RE.sub(attrs, document)
    document = HTML_RE.sub(lambda m: m.group(1) + table.get(m.group(3), m.group(4)) + m.group(5), document)
    document = TEXT_RE.sub(lambda m: m.group(1) + (html.escape(table[m.group(3)], quote=False) if m.group(3) in table else m.group(4)) + m.group(5), document)

    meta = LANG_PAGES[page]
    title = html.escape(table.get(f"{meta}.title", ""), quote=True)
    description = html.escape(table.get(f"{meta}.desc", ""), quote=True)
    url = page_url(lang, page)
    document = document.replace('<html lang="es" ', f'<html lang="{LANGS[lang]["html"]}" data-page-lang="{lang}" ', 1)
    if title:
        document = re.sub(r"<title>.*?</title>", f"<title>{title}</title>", document, count=1)
        document = re.sub(r'(<meta (?:property="og:title"|name="twitter:title") content=")[^"]*', lambda m: m.group(1) + title, document)
    if description:
        document = re.sub(r'(<meta (?:name="description"|property="og:description"|name="twitter:description") content=")[^"]*', lambda m: m.group(1) + description, document)
    document = re.sub(r'(<link rel="canonical" href=")[^"]*', lambda m: m.group(1) + url, document, count=1)
    document = re.sub(r'(<meta property="og:url" content=")[^"]*', lambda m: m.group(1) + url, document, count=1)
    others = [LANGS[other]["locale"] for other in LANGS if other != lang]
    document = re.sub(
        r'    <meta property="og:locale" content="[^"]*">\n(?:    <meta property="og:locale:alternate" content="[^"]*">\n)*',
        lambda m: f'    <meta property="og:locale" content="{LANGS[lang]["locale"]}">\n'
        + "".join(f'    <meta property="og:locale:alternate" content="{o}">\n' for o in others),
        document, count=1)
    document = document.replace('"inLanguage": "es"', f'"inLanguage": "{LANGS[lang]["html"]}"')
    # Pages live one folder down: point shared files back to the root.
    document = LOCAL_PATH_RE.sub(lambda m: m.group(1) + "../" + m.group(2), document)
    return document


def write_language_versions(output: Path) -> list[Path]:
    dictionaries = load_dictionaries()
    written: list[Path] = []
    for page in LANG_PAGES:
        source = (ROOT / page).read_text(encoding="utf-8")
        versions = {"es": source}
        for lang, table in dictionaries.items():
            versions[lang] = localize(source, lang, page, table)
        for lang, document in versions.items():
            if 'id="ld-faq"' in document:
                document = re.sub(r'<script type="application/ld\+json" id="ld-faq">.*?</script>', lambda m: faq_json_ld(document), document, count=1, flags=re.S)
            target = output / page if lang == "es" else output / lang / page
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(document, encoding="utf-8")
            written.append(target)
    return written


def write_sitemap(output: Path) -> None:
    today = datetime.date.today().isoformat()
    priority = {"index.html": "1.0", "support.html": "0.5", "privacy.html": "0.3"}
    rows = []
    for page in LANG_PAGES:
        alternates = "".join(
            f'\n    <xhtml:link rel="alternate" hreflang="{LANGS[l]["html"]}" href="{page_url(l, page)}"/>' for l in LANGS
        ) + f'\n    <xhtml:link rel="alternate" hreflang="x-default" href="{page_url("es", page)}"/>'
        for lang in LANGS:
            rows.append(
                f"  <url>\n    <loc>{page_url(lang, page)}</loc>\n    <lastmod>{today}</lastmod>\n"
                f"    <priority>{priority[page]}</priority>{alternates}\n  </url>"
            )
    rows.append(f"  <url>\n    <loc>{SITE}edgeflow/</loc>\n    <lastmod>{today}</lastmod>\n    <priority>0.4</priority>\n  </url>")
    (output / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
        + "\n".join(rows) + "\n</urlset>\n",
        encoding="utf-8",
    )


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
    languages = write_language_versions(output)
    write_sitemap(output)
    print(f"Idiomas: {len(languages)} páginas (es, en, zh) y sitemap con alternativas")

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
