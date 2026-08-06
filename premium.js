/* ==========================================================================
   VibeNotch — Premium Layer (JS)
   Se carga DESPUÉS de script.js. Solo añade; no reemplaza nada existente.
   Para revertir: elimina <script src="premium.js"></script>
   ========================================================================== */
(function () {
    'use strict';

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const recording = document.documentElement.classList.contains('recording-ad');
    const coarse = window.matchMedia('(pointer: coarse)').matches;

    const ready = (fn) =>
        document.readyState === 'loading'
            ? document.addEventListener('DOMContentLoaded', fn, { once: true })
            : fn();

    ready(function () {

        /* ------------------------------------------------------------------
           1. Barra de progreso de lectura
           ------------------------------------------------------------------ */
        if (!recording) {
            const bar = document.createElement('div');
            bar.className = 'vn-progress';
            document.body.appendChild(bar);

            let raf = null;
            const paint = () => {
                const max = document.documentElement.scrollHeight - window.innerHeight;
                const p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
                bar.style.transform = `scaleX(${p})`;
                raf = null;
            };
            window.addEventListener('scroll', () => {
                if (!raf) raf = requestAnimationFrame(paint);
            }, { passive: true });
            paint();
        }

        /* ------------------------------------------------------------------
           2. Nav: se oculta al bajar y reaparece al subir
           ------------------------------------------------------------------ */
        const nav = document.querySelector('nav');
        if (nav && !recording) {
            let last = window.scrollY;
            let navRaf = null;

            const updateNav = () => {
                const y = window.scrollY;
                const delta = y - last;

                nav.classList.toggle('vn-scrolled', y > 12);

                const menuOpen = document.querySelector('.nav-links.active');
                if (!menuOpen && Math.abs(delta) > 6) {
                    // bajando y ya lejos del inicio -> ocultar; subiendo -> mostrar
                    nav.classList.toggle('vn-hidden', delta > 0 && y > 120);
                }
                if (y <= 40) nav.classList.remove('vn-hidden');

                last = y;
                navRaf = null;
            };

            window.addEventListener('scroll', () => {
                if (!navRaf) navRaf = requestAnimationFrame(updateNav);
            }, { passive: true });
            updateNav();
        }

        /* ------------------------------------------------------------------
           3. Enlace de navegación activo según la sección visible
           ------------------------------------------------------------------ */
        const navAnchors = Array.from(
            document.querySelectorAll('.nav-links a[href^="#"]:not(.btn-yellow)')
        );
        const targets = navAnchors
            .map(a => document.querySelector(a.getAttribute('href')))
            .filter(Boolean);

        if (targets.length && 'IntersectionObserver' in window) {
            const setActive = (id) => {
                navAnchors.forEach(a => {
                    const on = a.getAttribute('href') === '#' + id;
                    a.classList.toggle('vn-active', on);
                    a.style.color = on ? 'var(--ink)' : '';
                    a.style.background = on ? 'rgba(0,0,0,.05)' : '';
                });
            };
            const spy = new IntersectionObserver((entries) => {
                entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
            }, { rootMargin: '-45% 0px -50% 0px' });
            targets.forEach(t => spy.observe(t));
        }

        /* ------------------------------------------------------------------
           4. Cierre del menú móvil con Escape / cambio de tamaño
           ------------------------------------------------------------------ */
        const menuBtn = document.getElementById('mobile-menu-btn');
        const navLinks = document.querySelector('.nav-links');
        const closeMenu = () => {
            if (!navLinks || !navLinks.classList.contains('active')) return;
            navLinks.classList.remove('active');
            if (menuBtn) menuBtn.classList.remove('active');
            document.body.style.overflow = '';
        };
        document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
        window.addEventListener('resize', () => { if (window.innerWidth > 768) closeMenu(); });
        if (menuBtn) {
            menuBtn.setAttribute('role', 'button');
            menuBtn.setAttribute('aria-label', 'Abrir menú');
            menuBtn.setAttribute('tabindex', '0');
            menuBtn.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); menuBtn.click(); }
            });
        }

        /* ------------------------------------------------------------------
           5. Halos ambientales en secciones oscuras
           ------------------------------------------------------------------ */
        if (!reduced && !recording && !coarse) {
            const orbSpecs = [
                { sel: '.simulations-section', color: 'rgba(0,113,227,.30)', size: '46vw', top: '-8%', left: '-6%' },
                { sel: '.simulations-section', color: 'rgba(255,212,90,.16)', size: '34vw', top: '55%', left: '72%' },
                { sel: '.teleprompter-section', color: 'rgba(255,212,90,.18)', size: '40vw', top: '62%', left: '8%' }
            ];
            orbSpecs.forEach(s => {
                const host = document.querySelector(s.sel);
                if (!host) return;
                if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
                const orb = document.createElement('div');
                orb.className = 'vn-orb';
                Object.assign(orb.style, {
                    background: s.color, width: s.size, height: s.size,
                    top: s.top, left: s.left
                });
                host.prepend(orb);
            });
        }

        /* ------------------------------------------------------------------
           5b. Trama de puntos del hero que reacciona al ratón
           ------------------------------------------------------------------ */
        (function heroDots() {
            const hero = document.querySelector('.hero');
            if (!hero || recording) return;

            const dots = document.createElement('div');
            dots.className = 'hero-dots';
            dots.setAttribute('aria-hidden', 'true');
            hero.prepend(dots);

            if (coarse || reduced) return;

            let x = 0, y = 0, pending = false;
            const paint = () => {
                dots.style.setProperty('--mx', x + 'px');
                dots.style.setProperty('--my', y + 'px');
                pending = false;
            };

            hero.addEventListener('pointermove', (e) => {
                const r = hero.getBoundingClientRect();
                x = e.clientX - r.left;
                y = e.clientY - r.top;
                dots.classList.add('is-live');
                if (!pending) { pending = true; requestAnimationFrame(paint); }
            }, { passive: true });

            hero.addEventListener('pointerleave', () => dots.classList.remove('is-live'));
        })();

        /* ------------------------------------------------------------------
           6. Contadores animados en las métricas
           script.js ya anima .h-value; aquí solo se refuerza el suavizado.
           ------------------------------------------------------------------ */
        document.querySelectorAll('.h-value').forEach(el => {
            el.style.transition = 'opacity .4s var(--ease-out)';
        });

        /* ------------------------------------------------------------------
           7. Vídeos: cargar solo cuando se acercan al viewport
           ------------------------------------------------------------------ */
        const lazyVideos = document.querySelectorAll('video[data-lazy]');
        if (lazyVideos.length && 'IntersectionObserver' in window) {
            const loader = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    const v = entry.target;
                    v.querySelectorAll('source[data-src]').forEach(s => {
                        s.src = s.dataset.src;
                        s.removeAttribute('data-src');
                    });
                    v.load();
                    v.removeAttribute('data-lazy');
                    obs.unobserve(v);
                });
            }, { rootMargin: '300px 0px' });
            lazyVideos.forEach(v => loader.observe(v));
        }

        /* ------------------------------------------------------------------
           8. Pausar vídeos cuando la pestaña no está visible (batería)
           ------------------------------------------------------------------ */
        document.addEventListener('visibilitychange', () => {
            document.querySelectorAll('video[autoplay]').forEach(v => {
                if (document.hidden) { v.pause(); }
                else if (v.dataset.vnWasPlaying !== 'no') { v.play().catch(() => { }); }
            });
        });

        /* ------------------------------------------------------------------
           9. Parallax suave en imágenes destacadas (solo escritorio)
           ------------------------------------------------------------------ */
        if (!reduced && !recording && !coarse && window.innerWidth > 1024) {
            const layers = document.querySelectorAll(
                '.teleprompter-fullscreen-frame img, .mac-showcase-container'
            );
            if (layers.length) {
                let pending = false;
                const move = () => {
                    layers.forEach(el => {
                        const r = el.getBoundingClientRect();
                        const mid = r.top + r.height / 2 - window.innerHeight / 2;
                        const shift = Math.max(-24, Math.min(24, mid * -0.035));
                        el.style.transform = `translate3d(0, ${shift.toFixed(2)}px, 0)`;
                    });
                    pending = false;
                };
                window.addEventListener('scroll', () => {
                    if (!pending) { pending = true; requestAnimationFrame(move); }
                }, { passive: true });
                move();
            }
        }

        /* ------------------------------------------------------------------
           10. Vídeo principal controlado por scroll
           Bajar = avanza · Subir = retrocede
           ------------------------------------------------------------------ */
        (function scrubHero() {
            const section = document.getElementById('demo');
            const video = document.querySelector('.notch-demo-video');
            const story = section?.closest('.hero-demo-story');
            if (!section || !video || recording) return;

            const mobileScrub = coarse || window.innerWidth <= 900;

            // El movimiento reducido conserva una reproducción convencional.
            if (reduced) {
                video.setAttribute('autoplay', '');
                video.play().catch(() => { });
                return;
            }

            // En escritorio se sube a la copia de alta resolución; el móvil se
            // queda con la ligera y ahorra varios megas.
            const hdSource = video.querySelector('source[data-hd]');
            if (hdSource && !mobileScrub) {
                hdSource.src = hdSource.dataset.hd;
                video.load();
            }

            section.classList.add('vn-scrub');
            section.classList.toggle('vn-scrub-mobile', mobileScrub);
            if (mobileScrub) story?.classList.add('is-scrubbing');
            video.removeAttribute('autoplay');
            video.pause();

            const bar = document.createElement('div');
            bar.className = 'vn-scrub-bar';
            bar.innerHTML = '<i></i>';
            const fill = bar.firstElementChild;
            const stage = section.querySelector('.notch-ad-stage');
            (stage || section).appendChild(bar);

            let duration = 0;
            let target = 0;
            let current = 0;
            let running = false;
            let top = 0, span = 1;
            let mobileSeekFrame = 0;
            let failed = false;

            const measure = () => {
                const r = section.getBoundingClientRect();
                top = r.top + window.scrollY;
                const viewportHeight = stage?.clientHeight
                    || window.visualViewport?.height
                    || window.innerHeight;
                span = Math.max(1, section.offsetHeight - viewportHeight);
            };
            window.addEventListener('resize', measure);
            window.addEventListener('orientationchange', measure);
            window.visualViewport?.addEventListener('resize', measure, { passive: true });
            measure();

            // Si el navegador no puede decodificar el vídeo, se vuelve al modo normal
            const bailOut = () => {
                if (failed) return;
                failed = true;
                section.classList.remove('vn-scrub');
                section.classList.remove('vn-scrub-mobile');
                story?.classList.remove('is-scrubbing');
                story?.classList.remove('video-copy-hidden');
                story?.style.removeProperty('--hero-support-opacity');
                bar.remove();
                video.style.removeProperty('transform');
                video.setAttribute('autoplay', '');
                video.play().catch(() => { });
            };
            video.addEventListener('error', bailOut, { once: true });
            setTimeout(() => { if (!duration) bailOut(); }, 6000);

            // Escritorio: interpolación suave entre la posición y el fotograma.
            const tick = () => {
                const diff = target - current;
                if (Math.abs(diff) < 0.008) {
                    current = target;
                    running = false;
                } else {
                    current += diff * 0.16;
                    requestAnimationFrame(tick);
                }
                if (duration) {
                    try { video.currentTime = current; } catch (e) { }
                    fill.style.width = ((current / duration) * 100).toFixed(2) + '%';
                }
            };

            // Móvil: una única búsqueda pendiente. Al terminar se aplica solo el
            // objetivo más reciente, evitando saturar el decodificador de Safari.
            const seekMobile = () => {
                mobileSeekFrame = 0;
                if (!duration || failed || video.seeking) return;
                if (Math.abs(video.currentTime - target) < 0.05) return;
                try { video.currentTime = target; } catch (e) { }
            };

            const queueMobileSeek = () => {
                if (!mobileSeekFrame) mobileSeekFrame = requestAnimationFrame(seekMobile);
            };

            video.addEventListener('seeked', () => {
                if (mobileScrub && Math.abs(video.currentTime - target) >= 0.05) {
                    queueMobileSeek();
                }
            });

            const onScroll = () => {
                if (!duration || failed) return;
                const p = Math.min(Math.max((window.scrollY - top) / span, 0), 1);
                target = p * (duration - 0.05);
                section.classList.toggle('vn-playing', p > 0.02);
                fill.style.width = (p * 100).toFixed(2) + '%';

                if (mobileScrub && story) {
                    const supportProgress = Math.min(
                        Math.max((window.scrollY - Math.max(top, 0)) / span, 0),
                        1
                    );
                    const supportOpacity = Math.max(0, 1 - (supportProgress / 0.055));
                    story.style.setProperty('--hero-support-opacity', supportOpacity.toFixed(3));
                    story.classList.toggle('video-copy-hidden', supportOpacity <= 0.02);
                }

                // Zoom acompañando al del propio clip: llena la pantalla pero
                // deja un respiro blanco en la parte superior.
                const zoomBase = mobileScrub ? 1.08 : 1;
                const zoomAmount = mobileScrub ? 0.03 : 0.31;
                const zoom = zoomBase + zoomAmount * Math.min(p / 0.2, 1);
                video.style.transform = 'scale(' + zoom.toFixed(3) + ')';

                if (mobileScrub) queueMobileSeek();
                else if (!running) { running = true; requestAnimationFrame(tick); }
            };

            window.addEventListener('scroll', onScroll, { passive: true });

            // Un primer toque prepara el decodificador de iOS sin dejar el vídeo
            // reproduciéndose por su cuenta; después manda siempre el scroll.
            if (mobileScrub) {
                window.addEventListener('touchstart', () => {
                    const priming = video.play();
                    if (priming?.then) {
                        priming.then(() => {
                            video.pause();
                            queueMobileSeek();
                        }).catch(() => { });
                    }
                }, { once: true, passive: true });
            }

            const onMeta = () => {
                duration = video.duration || 0;
                current = video.currentTime || 0;
                measure();
                onScroll();
            };
            if (video.readyState >= 1 && video.duration) onMeta();
            else video.addEventListener('loadedmetadata', onMeta, { once: true });

            onScroll();
        })();

        /* ------------------------------------------------------------------
           10b. Tráiler de YouTube sin coste de carga
           El iframe solo se inserta al pulsar. Si no hay ID, el bloque no
           se muestra: basta con rellenar data-yt en el HTML.
           ------------------------------------------------------------------ */
        (function trailer() {
            const box = document.querySelector('.sports-trailer');
            if (!box) return;

            const raw = (box.dataset.yt || '').trim();
            if (!raw) return;

            // Acepta el ID suelto o cualquier URL de YouTube
            const m = raw.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([\w-]{6,})/);
            const id = m ? m[1] : raw;

            box.style.backgroundImage = `url(https://i.ytimg.com/vi/${id}/maxresdefault.jpg)`;
            box.classList.add('is-ready');

            const btn = box.querySelector('.yt-facade');
            btn && btn.addEventListener('click', () => {
                const f = document.createElement('iframe');
                f.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
                f.title = 'Tráiler de VibeNotch Sports';
                f.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture';
                f.allowFullscreen = true;
                box.appendChild(f);
                btn.remove();
            }, { once: true });
        })();

        /* ------------------------------------------------------------------
           11. Accesibilidad: etiquetas en los controles de vídeo
           ------------------------------------------------------------------ */
        const mute = document.getElementById('promo-mute-btn');
        const play = document.getElementById('promo-play-btn');
        if (mute) mute.setAttribute('aria-label', 'Activar o desactivar el sonido del vídeo');
        if (play) play.setAttribute('aria-label', 'Reproducir o pausar el vídeo');
    });
})();
