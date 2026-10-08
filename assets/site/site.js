/* VibeNotch — page behaviour: language, bar, the travelling notch, film, showcase. */
(() => {
    'use strict';

    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const portrait = window.matchMedia('(orientation: portrait)');
    const hasIO = 'IntersectionObserver' in window;
    const store = {
        get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
        set(key, value) { try { localStorage.setItem(key, value); } catch (e) { /* private mode */ } }
    };

    // ── Language ────────────────────────────────────────────────────────
    const DICT = window.VN_I18N || {};
    const LANG_KEY = 'vibenotch-language';
    const LANGS = ['es', 'en', 'zh'];
    const HTML_LANG = { es: 'es', en: 'en', zh: 'zh-Hans' };
    const original = { text: new Map(), html: new Map(), attr: new Map() };
    const metaDesc = $('meta[name="description"]');
    const base = { title: document.title, desc: metaDesc ? metaDesc.content : '' };
    const langListeners = [];
    let lang = 'es';

    $$('[data-i18n]').forEach((el) => original.text.set(el, el.textContent));
    $$('[data-i18n-html]').forEach((el) => original.html.set(el, el.innerHTML));
    $$('[data-i18n-attr]').forEach((el) => {
        const pairs = el.dataset.i18nAttr.split(';').map((p) => p.split(':'));
        original.attr.set(el, pairs.map(([attr, key]) => [attr, key, el.getAttribute(attr) || '']));
    });

    function detectLang() {
        const forced = new URLSearchParams(location.search).get('lang');
        if (LANGS.includes(forced)) return forced;
        const saved = store.get(LANG_KEY);
        if (LANGS.includes(saved)) return saved;
        const prefs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'es'];
        for (const pref of prefs) {
            const code = String(pref).toLowerCase();
            if (/^(es|ca|gl|eu)\b/.test(code)) return 'es';
            if (code.startsWith('zh')) return 'zh';
            if (code.startsWith('en')) return 'en';
        }
        return 'en';
    }

    function applyLang(next, persist) {
        lang = LANGS.includes(next) ? next : 'es';
        const dict = DICT[lang] || {};
        const t = (key, fallback) => (lang === 'es' ? fallback : (dict[key] ?? fallback));
        original.text.forEach((value, el) => { el.textContent = t(el.dataset.i18n, value); });
        original.html.forEach((value, el) => { el.innerHTML = t(el.dataset.i18nHtml, value); });
        original.attr.forEach((pairs, el) => pairs.forEach(([attr, key, value]) => el.setAttribute(attr, t(key, value))));
        document.documentElement.lang = HTML_LANG[lang];
        const metaKey = document.body.dataset.meta || 'meta';
        document.title = t(`${metaKey}.title`, base.title);
        if (metaDesc) metaDesc.content = t(`${metaKey}.desc`, base.desc);
        $$('select[data-lang]').forEach((sel) => { sel.value = lang; });
        if (persist) store.set(LANG_KEY, lang);
        langListeners.forEach((fn) => fn(lang));
    }

    // ── Bar + menu ──────────────────────────────────────────────────────
    const bar = $('#bar');
    const menuBtn = $('#menu-btn');
    const menu = $('#menu');

    if (menuBtn && menu) {
        const setMenu = (open) => {
            menuBtn.setAttribute('aria-expanded', String(open));
            menu.hidden = !open;
        };
        menuBtn.addEventListener('click', () => setMenu(menu.hidden));
        menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
    }

    // App switcher popover
    const appsBtn = $('#apps-btn');
    const appsPop = $('#apps-pop');
    if (appsBtn && appsPop) {
        const setApps = (open) => {
            appsBtn.setAttribute('aria-expanded', String(open));
            appsPop.hidden = !open;
        };
        appsBtn.addEventListener('click', (e) => { e.stopPropagation(); setApps(appsPop.hidden); });
        document.addEventListener('click', (e) => { if (!appsPop.hidden && !appsPop.contains(e.target)) setApps(false); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setApps(false); });
    }

    if (bar && hasIO) {
        let darkObserver;
        const watchDark = () => {
            if (darkObserver) darkObserver.disconnect();
            const line = 28;
            const active = new Set();
            darkObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry) => (entry.isIntersecting ? active.add(entry.target) : active.delete(entry.target)));
                bar.classList.toggle('is-dark', active.size > 0);
            }, { rootMargin: `-${line}px 0px -${Math.max(0, window.innerHeight - line - 1)}px 0px` });
            $$('.dark').forEach((el) => darkObserver.observe(el));
        };
        watchDark();
        let t;
        window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(watchDark, 200); });
    }

    // ── Reveal on scroll ────────────────────────────────────────────────
    if (hasIO && !reduceMotion) {
        const revealer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-in');
                revealer.unobserve(entry.target);
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
        $$('.reveal').forEach((el) => revealer.observe(el));
    } else {
        $$('.reveal').forEach((el) => el.classList.add('is-in'));
    }

    const islandOK = typeof window.VibeIsland === 'function' && CSS.supports('clip-path', 'path("M0 0Z")');
    const ART = 'assets/optimized/album-art-256.jpg';

    // ── Story: title → the bezel settles under each feature → the film ──
    const story = $('#story');
    const host = $('#hero-island');
    if (story && host && islandOK) {
        const pin = $('#pin');
        const heroBlock = $('#story-hero');
        const texts = $('#story-texts');
        const track = $('#story-track');
        const edge = $('#edge');
        const items = $$('.story-item', track);
        const HERO = 0.8;
        const EXIT = 0.45;
        const N = items.length;
        let SEG = 0.5;
        story.style.setProperty('--hero-units', (HERO + 0.04).toFixed(3));
        // The film rises over the screen edge while it fades: no blank screen in between.
        document.documentElement.style.setProperty('--exit-units', String(EXIT));

        const island = new window.VibeIsland(host, { art: ART, lang, fit: 520, maxScale: 1.4, minScale: 0.5 });
        island.setGlass(false);
        const sync = (s) => document.documentElement.style.setProperty('--s', s.toFixed(4));
        sync(island.scale);
        island.on('scale', sync);
        langListeners.push((l) => island.setLang(l));

        let timers = [];
        const clear = () => { timers.forEach(clearTimeout); timers = []; };
        const later = (ms, fn) => timers.push(setTimeout(fn, ms));
        const reset = (mode = 'notch') => {
            clear();
            island.setDisco(false);
            island.setLive(false);
            island.highlightQuick(false);
            island.setMode(mode);
            if (!island.state.playing) island.togglePlay();
        };
        const cycleAlerts = () => {
            const types = ['airpods', 'charging', 'silent', 'wifi'];
            types.forEach((type, i) => later(350 + i * 4400, () => island.notify(type)));
            later(350 + types.length * 4400, cycleAlerts);
        };

        const STATES = {
            media: () => { reset(); island.show('media'); },
            alerts: () => { reset(); island.expand(false); cycleAlerts(); },
            events: () => { reset(); island.show('events'); },
            shortcuts: () => { reset(); island.show('media'); island.highlightQuick(true); },
            tele: () => { reset(); island.show('tele'); },
            disco: () => { reset(); island.expand(false); island.show('media', false); island.setDisco(true); },
            bubble: () => { reset('bubble'); island.show('media', false); island.expand(false); later(900, () => island.expand(true)); },
            sports: () => { reset(); island.setLive(true); island.show('sports'); later(1600, () => island.notify('goal')); }
        };

        // While the title is on screen the notch plays the real states on its own.
        const SCRIPT = [
            [0, () => island.notify('welcome')],
            [4200, () => island.expand(true)],
            [7600, () => island.show('events')],
            [10800, () => island.expand(false)],
            [11600, () => island.notify('airpods')],
            [16000, () => island.notify('charging')],
            [20400, () => island.notify('wifi')]
        ];
        const LOOP = 25000;
        let auto = [];
        let autoRunning = false;
        let firstRun = true;
        let userTimer = 0;
        let state = '';

        const stopAuto = () => { auto.forEach(clearTimeout); auto = []; autoRunning = false; };
        const playAuto = () => {
            if (autoRunning || reduceMotion || state !== 'intro') return;
            autoRunning = true;
            const steps = firstRun ? SCRIPT : SCRIPT.slice(1);
            const shift = firstRun ? 0 : SCRIPT[1][0] - 1200;
            firstRun = false;
            steps.forEach(([at, fn]) => auto.push(setTimeout(fn, at - shift)));
            auto.push(setTimeout(() => { stopAuto(); reset(); playAuto(); }, LOOP - shift));
        };

        const setState = (name) => {
            if (name === state) return;
            state = name;
            stopAuto();
            clearTimeout(userTimer);
            const wantMode = name === 'bubble' ? 'bubble' : 'notch';
            if (island.state.mode !== wantMode && STATES[name]) {
                // Switching between notch and bubble: fold, change shape, then show.
                clear();
                island.setDisco(false);
                island.setLive(false);
                island.expand(false);
                later(420, () => island.setMode(wantMode));
                later(1000, () => { if (state === name) STATES[name](); });
                return;
            }
            if (name === 'intro') {
                reset();
                island.expand(false);
                userTimer = setTimeout(playAuto, 500);
            } else if (name === 'out') {
                reset();
                island.expand(false);
            } else {
                STATES[name]();
            }
        };

        // Leaving the notch with the mouse puts the current feature back.
        island.root.addEventListener('pointerenter', (e) => {
            if (e.pointerType !== 'mouse') return;
            clearTimeout(userTimer);
            if (state === 'intro') stopAuto();
        });
        island.root.addEventListener('pointerleave', (e) => {
            if (e.pointerType !== 'mouse') return;
            clearTimeout(userTimer);
            userTimer = setTimeout(() => {
                if (state === 'intro') { reset(); island.expand(false); playAuto(); }
                else if (STATES[state] && !island.isTeleLive) STATES[state]();
            }, state === 'intro' ? 8000 : 1400);
        });
        island.root.addEventListener('pointerdown', () => { if (state === 'intro') stopAuto(); });

        // Geometry: where the texts live and the bezel's two resting places.
        let vh = 0;
        let textH = 0;
        let heroY = 0;
        let featY = 0;
        let top = 0;
        let phase = '';
        const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
        const easeOut = (t) => 1 - (1 - t) ** 3;
        const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

        // On big screens the simulation zooms in once the bezel has settled.
        let zoomTarget = 1;
        let zoomTimer = 0;
        const placeEdge = () => {
            edge.style.setProperty('--edge-y', `${phase === 'hero' ? heroY : featY}px`);
            edge.classList.toggle('is-gone', phase === 'exit');
            clearTimeout(zoomTimer);
            if (phase === 'features' && zoomTarget > 1) zoomTimer = setTimeout(() => island.setZoom(zoomTarget), 1050);
            else island.setZoom(1);
        };

        const layout = () => {
            vh = pin.clientHeight;
            const narrow = window.innerWidth <= 640;
            const textTop = 56 + Math.round(vh * 0.04);
            textH = Math.round(vh * (narrow ? 0.4 : 0.33));
            featY = textTop + textH + 4;
            SEG = (textH / vh) * 1.3;
            story.style.setProperty('--units', (HERO + (N - 0.5) * SEG + EXIT + 1).toFixed(3));
            const base = island.baseScale || island.scale;
            const bezel = edge.offsetHeight || 16;
            const roomScale = (vh - featY - bezel - 24) / 215;
            const widthScale = (window.innerWidth - 40) / 520;
            const target = Math.min(roomScale, widthScale, 2.4);
            zoomTarget = target > base * 1.08 ? target / base : 1;
            host.style.height = `${Math.ceil(250 * base * zoomTarget + 40)}px`;
            heroY = Math.min(heroBlock.offsetTop + heroBlock.offsetHeight + Math.round(vh * 0.06), vh - 140);
            pin.style.setProperty('--text-top', `${textTop}px`);
            pin.style.setProperty('--text-h', `${textH}px`);
            top = story.getBoundingClientRect().top + window.scrollY;
            placeEdge();
            update();
        };

        let ticking = false;
        let scrollRest = 0;
        const touch = window.matchMedia('(pointer: coarse)').matches;
        const last = {};
        // Write a style only when it changes: fewer style recalcs while scrolling.
        const put = (el, prop, value) => {
            const key = el.id + prop;
            if (last[key] === value) return;
            last[key] = value;
            el.style[prop] = value;
        };
        const update = () => {
            ticking = false;
            const u = (window.scrollY - top) / vh;

            const h = clamp(u / (HERO * 0.55), 0, 1);
            put(heroBlock, 'opacity', String(+(1 - h).toFixed(3)));
            put(heroBlock, 'transform', `translate3d(0, ${(-h * 70).toFixed(1)}px, 0)`);
            put(heroBlock, 'visibility', h >= 1 ? 'hidden' : 'visible');

            const enter = clamp((u - HERO * 0.6) / (HERO * 0.4), 0, 1);
            const local = (u - HERO) / SEG;
            let offset;
            if (local < 0) {
                offset = -(1 - easeOut(enter));
            } else if (touch) {
                // Touch: the text follows the finger 1:1, no settling.
                offset = Math.min(local, N - 0.5);
            } else {
                // Text follows the scroll freely, with only a soft settle on each feature.
                const i = Math.min(N - 1, Math.floor(local));
                const f = clamp(local - i, 0, 1);
                offset = i + f * 0.7 + easeInOut(f) * 0.3;
            }
            const x = clamp((u - (HERO + (N - 0.5) * SEG)) / EXIT, 0, 1);
            put(texts, 'opacity', String(+Math.min(enter, 1 - x).toFixed(3)));
            put(track, 'transform', `translate3d(0, ${(-offset * textH).toFixed(1)}px, 0)`);

            const next = u < HERO * 0.55 ? 'hero' : (x > 0.08 ? 'exit' : 'features');
            if (next !== phase) {
                phase = next;
                placeEdge();
            }
            if (phase === 'hero') {
                setState('intro');
                // Touch: pause the demo while the finger is scrolling, resume when it rests.
                if (touch && autoRunning && u > 0.01) stopAuto();
                if (touch) {
                    clearTimeout(scrollRest);
                    scrollRest = setTimeout(() => { if (state === 'intro') playAuto(); }, 900);
                }
            } else if (phase === 'exit') setState('out');
            else setState(items[clamp(Math.round(offset), 0, N - 1)].dataset.state);
        };

        window.addEventListener('scroll', () => {
            if (!ticking) { ticking = true; requestAnimationFrame(update); }
        }, { passive: true });
        let resizeTimer;
        window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(layout, 120); });
        layout();
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);

        if (hasIO) {
            new IntersectionObserver((entries) => {
                if (!entries[0].isIntersecting) stopAuto();
                else if (state === 'intro' && !autoRunning) playAuto();
            }).observe(pin);
        }
    }

    // ── Native carousel: changes slowly on its own ──────────────────────
    const carousel = $('#carousel');
    if (carousel) {
        const slides = $$('.slide', carousel);
        const dots = $$('.dots button', carousel);
        const MS = 5200;
        carousel.style.setProperty('--slide-ms', `${MS}ms`);
        let index = 0;
        let timer = 0;
        let visible = false;
        const go = (i) => {
            index = (i + slides.length) % slides.length;
            slides.forEach((el, k) => el.classList.toggle('is-on', k === index));
            dots.forEach((el, k) => {
                el.classList.remove('is-on');
                if (k === index) { void el.offsetWidth; el.classList.add('is-on'); }
                el.setAttribute('aria-selected', String(k === index));
            });
        };
        const run = () => {
            clearInterval(timer);
            if (visible && !reduceMotion && !carousel.classList.contains('is-paused')) timer = setInterval(() => go(index + 1), MS);
        };
        dots.forEach((dot, k) => dot.addEventListener('click', () => { go(k); run(); }));
        $$('.arrow', carousel).forEach((btn) => btn.addEventListener('click', () => { go(index + Number(btn.dataset.step)); run(); }));
        carousel.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') { go(index - 1); run(); }
            if (e.key === 'ArrowRight') { go(index + 1); run(); }
        });
        // Drag or swipe sideways to change slide.
        const area = $('.slides', carousel);
        let startX = null;
        area.addEventListener('pointerdown', (e) => {
            if (e.target.closest('.vni')) return;
            startX = e.clientX;
            area.classList.add('is-dragging');
        });
        const end = (e) => {
            if (startX === null) return;
            const dx = e.clientX - startX;
            startX = null;
            area.classList.remove('is-dragging');
            if (Math.abs(dx) > 40) { go(index + (dx < 0 ? 1 : -1)); run(); }
        };
        area.addEventListener('pointerup', end);
        area.addEventListener('pointercancel', () => { startX = null; area.classList.remove('is-dragging'); });
        area.addEventListener('pointerleave', (e) => { if (startX !== null) end(e); });
        carousel.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { carousel.classList.add('is-paused'); clearInterval(timer); } });
        carousel.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') { carousel.classList.remove('is-paused'); go(index); run(); } });
        if (hasIO) {
            new IntersectionObserver((entries) => {
                visible = entries[0].isIntersecting;
                if (visible) { go(index); run(); } else clearInterval(timer);
            }, { threshold: 0.3 }).observe(carousel);
        }
    }

    // ── "Works on your Mac": a live floating bubble ─────────────────────
    const pillHost = $('#pill-island');
    if (pillHost && islandOK) {
        const pill = new window.VibeIsland(pillHost, { art: ART, lang, fit: 300, maxScale: 1.2, minScale: 1 });
        pill.setGlass(false);
        pill.setMode('bubble');
        pill.locked = true;
        langListeners.push((l) => pill.setLang(l));
    }

    // ── Film: full-screen background, muted, always looping ─────────────
    const film = $('#film-video');
    if (film) {
        let wanted = '';
        const source = () => `assets/media/film-${lang === 'es' ? 'es' : 'en'}${portrait.matches ? '-v' : ''}.mp4`;
        const load = () => {
            const src = source();
            if (src === wanted) return;
            wanted = src;
            film.src = src;
            if (!reduceMotion) film.play().catch(() => {});
        };
        if (hasIO) {
            new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        load();
                        if (!reduceMotion) film.play().catch(() => {});
                    } else {
                        film.pause();
                    }
                });
            }, { rootMargin: '400px 0px' }).observe(film);
        } else {
            load();
        }
        portrait.addEventListener('change', () => { if (wanted) load(); });
        langListeners.push(() => { if (wanted) load(); });
    }

    // ── Display showcase: the notch changes with the tool you use ───────
    const show = $('#display-show');
    if (show) {
        const slides = $$('.display-notch img', show);
        let index = 0;
        let timer = 0;
        const next = () => {
            slides[index].classList.remove('is-on');
            index = (index + 1) % slides.length;
            slides[index].classList.add('is-on');
        };
        if (hasIO && !reduceMotion) {
            new IntersectionObserver((entries) => {
                clearInterval(timer);
                if (entries[0].isIntersecting) timer = setInterval(next, 2800);
            }, { threshold: 0.3 }).observe(show);
        }
    }

    // ── Metrics: the numbers count to their value when they come into view ──
    const metrics = $('#metrics');
    if (metrics && hasIO && !reduceMotion) {
        const counters = $$('[data-count-to]', metrics);
        counters.forEach((el) => { el.textContent = el.dataset.countFrom; });
        const observer = new IntersectionObserver((entries) => {
            if (!entries[0].isIntersecting) return;
            observer.disconnect();
            const start = performance.now();
            const duration = 1800;
            const frame = (now) => {
                const t = Math.min(1, (now - start) / duration);
                const e = 1 - (1 - t) ** 4;
                counters.forEach((el) => {
                    const from = Number(el.dataset.countFrom);
                    const to = Number(el.dataset.countTo);
                    el.textContent = String(Math.round(from + (to - from) * e));
                });
                if (t < 1) requestAnimationFrame(frame);
            };
            requestAnimationFrame(frame);
        }, { threshold: 0.5 });
        observer.observe(metrics);
    }

    // ── Reviews marquee: duplicate once for a seamless loop ──────────────
    const track = $('.marquee-track');
    if (track && !reduceMotion) {
        $$('.review', track).forEach((card) => {
            const clone = card.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            track.appendChild(clone);
        });
    }

    // ── Newsletter ──────────────────────────────────────────────────────
    const form = $('#news');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = form.querySelector('input');
            if (!input.checkValidity()) {
                input.reportValidity();
                return;
            }
            const body = new URLSearchParams({ 'entry.1921152412': input.value });
            const done = () => {
                form.querySelector('.news-row').hidden = true;
                form.querySelector('.news-ok').hidden = false;
            };
            fetch('https://docs.google.com/forms/d/e/1FAIpQLSe3GrX4FudiQN3LfmSx-BB33I0tPNWUKVPMXFKJGgDw3HoeNQ/formResponse', {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: body.toString()
            }).then(done, done);
        });
    }

    // ── Boot ────────────────────────────────────────────────────────────
    $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
    $$('select[data-lang]').forEach((sel) => sel.addEventListener('change', () => applyLang(sel.value, true)));
    applyLang(detectLang(), false);
})();
