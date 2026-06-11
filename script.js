/* ==========================================================================
   VibeNotch — script.js (vibenotch.es)
   Secciones:
     01. Helpers y flags
     02. Fondo de partículas (canvas)
     03. Scroll-reveal (IntersectionObserver)
     04. Contadores animados
     05. Demo interactiva del notch (hero)
     06. Comparador Liquid Glass
     07. Teleprompter (cambio de modo)
     08. Tilt 3D en tarjetas
     09. Hover magnético en CTAs
     10. Menú móvil
     11. Newsletter (Google Forms, no-cors)
   Todo está protegido con comprobaciones de null: el archivo es seguro
   aunque falte cualquier bloque de marcado.
   ========================================================================== */

(function () {
    'use strict';

    /* ======================================================================
       01. HELPERS Y FLAGS
       ====================================================================== */
    document.documentElement.classList.add('js');

    var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
    var $$ = function (sel, ctx) {
        return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
    };

    var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    var reducedMotion = motionQuery.matches;
    motionQuery.addEventListener && motionQuery.addEventListener('change', function (e) {
        reducedMotion = e.matches;
    });

    var isCoarse = window.matchMedia('(pointer: coarse)').matches;

    /* ======================================================================
       02. FONDO DE PARTÍCULAS (CANVAS)
       Estrellas suaves con deriva lenta y leve parallax al ratón.
       Se pausa cuando la pestaña está oculta y se omite con motion reduce.
       ====================================================================== */
    (function initCanvas() {
        var canvas = $('#bg-canvas');
        if (!canvas || reducedMotion) { return; }

        var ctx = canvas.getContext('2d');
        if (!ctx) { return; }

        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        var width = 0;
        var height = 0;
        var particles = [];
        var mouseX = 0.5;
        var mouseY = 0.35;
        var rafId = null;
        var running = false;

        var PALETTE = [
            [167, 139, 250],  // violeta
            [96, 165, 250],   // azul
            [56, 189, 248],   // cian
            [235, 238, 255]   // blanco frío
        ];

        function resize() {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = Math.floor(width * dpr);
            canvas.height = Math.floor(height * dpr);
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        function spawn() {
            particles = [];
            var count = Math.min(110, Math.floor(width * height / 16000));
            for (var i = 0; i < count; i++) {
                var color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    r: 0.5 + Math.random() * 1.7,
                    vx: (Math.random() - 0.5) * 0.16,
                    vy: (Math.random() - 0.5) * 0.12,
                    depth: 0.3 + Math.random() * 0.7,
                    twinkle: Math.random() * Math.PI * 2,
                    color: color
                });
            }
        }

        function frame(now) {
            ctx.clearRect(0, 0, width, height);
            var offsetX = (mouseX - 0.5) * 18;
            var offsetY = (mouseY - 0.5) * 12;

            for (var i = 0; i < particles.length; i++) {
                var p = particles[i];
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < -8) { p.x = width + 8; }
                if (p.x > width + 8) { p.x = -8; }
                if (p.y < -8) { p.y = height + 8; }
                if (p.y > height + 8) { p.y = -8; }

                var alpha = 0.25 + 0.3 * Math.abs(Math.sin(p.twinkle + now * 0.0006 * p.depth));
                ctx.beginPath();
                ctx.arc(
                    p.x + offsetX * p.depth,
                    p.y + offsetY * p.depth,
                    p.r, 0, Math.PI * 2
                );
                ctx.fillStyle = 'rgba(' + p.color[0] + ',' + p.color[1] + ',' +
                    p.color[2] + ',' + (alpha * p.depth).toFixed(3) + ')';
                ctx.fill();
            }
            rafId = window.requestAnimationFrame(frame);
        }

        function start() {
            if (running) { return; }
            running = true;
            rafId = window.requestAnimationFrame(frame);
        }

        function stop() {
            running = false;
            if (rafId) { window.cancelAnimationFrame(rafId); rafId = null; }
        }

        window.addEventListener('resize', function () {
            resize();
            spawn();
        });

        document.addEventListener('visibilitychange', function () {
            if (document.hidden) { stop(); } else { start(); }
        });

        if (!isCoarse) {
            window.addEventListener('pointermove', function (e) {
                mouseX = e.clientX / Math.max(width, 1);
                mouseY = e.clientY / Math.max(height, 1);
            }, { passive: true });
        }

        resize();
        spawn();
        start();
    })();

    /* ======================================================================
       03. SCROLL-REVEAL
       Un único IntersectionObserver con stagger por lotes.
       ====================================================================== */
    (function initReveal() {
        var items = $$('[data-reveal]');
        if (!items.length) { return; }

        if (!('IntersectionObserver' in window) || reducedMotion) {
            items.forEach(function (el) { el.classList.add('revealed'); });
            return;
        }

        var batchIndex = 0;
        var lastBatchTime = 0;

        var observer = new IntersectionObserver(function (entries) {
            var now = performance.now();
            if (now - lastBatchTime > 350) { batchIndex = 0; }
            lastBatchTime = now;

            entries.forEach(function (entry) {
                if (!entry.isIntersecting) { return; }
                var el = entry.target;
                el.style.setProperty('--rd', (Math.min(batchIndex, 6) * 0.09).toFixed(2) + 's');
                batchIndex++;
                el.classList.add('revealed');
                observer.unobserve(el);
            });
        }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });

        // Lo que ya está a la vista al cargar se revela de inmediato
        // (sin esperar al primer ciclo del observer); el resto, al hacer scroll.
        var vh = window.innerHeight || document.documentElement.clientHeight;
        var immediate = 0;
        items.forEach(function (el) {
            var rect = el.getBoundingClientRect();
            if (rect.top < vh * 0.94 && rect.bottom > 0) {
                el.style.setProperty('--rd', (Math.min(immediate, 6) * 0.09).toFixed(2) + 's');
                immediate++;
                el.classList.add('revealed');
            } else {
                observer.observe(el);
            }
        });
    })();

    /* ======================================================================
       04. CONTADORES ANIMADOS
       ====================================================================== */
    (function initCounters() {
        var counters = $$('[data-count]');
        if (!counters.length) { return; }

        function animate(el) {
            var target = parseInt(el.getAttribute('data-count'), 10) || 0;
            if (reducedMotion || target === 0) {
                el.textContent = String(target);
                return;
            }
            var duration = 1500;
            var startTime = null;

            function tick(now) {
                if (startTime === null) { startTime = now; }
                var t = Math.min((now - startTime) / duration, 1);
                var eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
                el.textContent = String(Math.round(target * eased));
                if (t < 1) { window.requestAnimationFrame(tick); }
            }
            window.requestAnimationFrame(tick);
        }

        if (!('IntersectionObserver' in window)) {
            counters.forEach(function (el) {
                el.textContent = el.getAttribute('data-count');
            });
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) { return; }
                animate(entry.target);
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.6 });

        counters.forEach(function (el) { observer.observe(el); });
    })();

    /* ======================================================================
       05. DEMO INTERACTIVA DEL NOTCH (HERO)
       Hover para expandir en escritorio, toque/click para alternar,
       play/pause funcional que pausa las animaciones del ecualizador.
       ====================================================================== */
    (function initNotch() {
        var notch = $('#hero-notch');
        if (!notch) { return; }

        var playBtn = $('#ctl-play');
        var openedByHover = false;

        function setOpen(open) {
            notch.classList.toggle('open', open);
        }

        if (!isCoarse) {
            notch.addEventListener('mouseenter', function () {
                openedByHover = true;
                setOpen(true);
            });
            notch.addEventListener('mouseleave', function () {
                if (openedByHover) {
                    openedByHover = false;
                    setOpen(false);
                }
            });
        }

        notch.addEventListener('click', function (e) {
            // Los controles internos gestionan sus propios clicks.
            if (e.target.closest('.ctl')) { return; }
            openedByHover = false;
            setOpen(!notch.classList.contains('open'));
        });

        notch.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                if (e.target !== notch) { return; }
                e.preventDefault();
                setOpen(!notch.classList.contains('open'));
            }
        });

        if (playBtn) {
            playBtn.addEventListener('click', function () {
                var paused = notch.classList.toggle('paused');
                playBtn.setAttribute('aria-pressed', String(paused));
                playBtn.setAttribute('aria-label',
                    paused ? 'Reanudar reproducción' : 'Pausar reproducción');
            });
        }

        // Pequeño guiño: la isla se abre sola un instante al cargar.
        if (!reducedMotion) {
            window.setTimeout(function () {
                if (notch.classList.contains('open')) { return; }
                setOpen(true);
                window.setTimeout(function () {
                    if (!openedByHover) { setOpen(false); }
                }, 1700);
            }, 1400);
        }
    })();

    /* ======================================================================
       06. COMPARADOR LIQUID GLASS
       Un input range invisible controla el clip-path del panel de cristal.
       Funciona con ratón, táctil y teclado.
       ====================================================================== */
    (function initCompare() {
        var range = $('#lg-range');
        var pane = $('#lg-pane-glass');
        var handle = $('#lg-handle');
        if (!range || !pane || !handle) { return; }

        function update() {
            var pos = range.value + '%';
            pane.style.setProperty('--pos', pos);
            handle.style.left = pos;
        }

        range.addEventListener('input', update);
        update();
    })();

    /* ======================================================================
       07. TELEPROMPTER — CAMBIO DE MODO
       ====================================================================== */
    (function initTeleprompter() {
        var stage = $('#tp-notch');
        var chips = $$('.tp-controls .chip');
        if (!stage || !chips.length) { return; }

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                var mode = chip.getAttribute('data-tp');
                if (!mode) { return; }
                stage.setAttribute('data-mode', mode);
                chips.forEach(function (c) {
                    var active = c === chip;
                    c.classList.toggle('is-active', active);
                    c.setAttribute('aria-pressed', String(active));
                });
            });
        });
    })();

    /* ======================================================================
       08. TILT 3D EN TARJETAS
       ====================================================================== */
    (function initTilt() {
        if (isCoarse || reducedMotion) { return; }
        var cards = $$('.tilt');
        if (!cards.length) { return; }

        var MAX_DEG = 7;

        cards.forEach(function (card) {
            var rect = null;

            card.addEventListener('mouseenter', function () {
                rect = card.getBoundingClientRect();
                card.style.transition = 'transform .18s ease-out';
            });

            card.addEventListener('mousemove', function (e) {
                if (!rect) { rect = card.getBoundingClientRect(); }
                var px = (e.clientX - rect.left) / rect.width - 0.5;
                var py = (e.clientY - rect.top) / rect.height - 0.5;
                card.style.transform =
                    'perspective(900px) rotateX(' + (-py * MAX_DEG).toFixed(2) +
                    'deg) rotateY(' + (px * MAX_DEG).toFixed(2) + 'deg) translateY(-3px)';
            });

            card.addEventListener('mouseleave', function () {
                rect = null;
                card.style.transition = 'transform .6s cubic-bezier(0.16, 1, 0.3, 1)';
                card.style.transform = '';
            });
        });
    })();

    /* ======================================================================
       09. HOVER MAGNÉTICO EN CTAs
       ====================================================================== */
    (function initMagnetic() {
        if (isCoarse || reducedMotion) { return; }
        var buttons = $$('.magnetic');
        if (!buttons.length) { return; }

        var STRENGTH = 0.22;
        var LIMIT = 9;

        buttons.forEach(function (btn) {
            btn.addEventListener('mousemove', function (e) {
                var rect = btn.getBoundingClientRect();
                var dx = (e.clientX - rect.left - rect.width / 2) * STRENGTH;
                var dy = (e.clientY - rect.top - rect.height / 2) * STRENGTH;
                dx = Math.max(-LIMIT, Math.min(LIMIT, dx));
                dy = Math.max(-LIMIT, Math.min(LIMIT, dy));
                btn.style.transform = 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px)';
            });

            btn.addEventListener('mouseleave', function () {
                btn.style.transform = '';
            });
        });
    })();

    /* ======================================================================
       10. MENÚ MÓVIL
       ====================================================================== */
    (function initMobileNav() {
        var burger = $('#nav-burger');
        var center = $('#nav-center');
        if (!burger || !center) { return; }

        function close() {
            document.body.classList.remove('nav-open');
            burger.setAttribute('aria-expanded', 'false');
            burger.setAttribute('aria-label', 'Abrir menú de navegación');
        }

        burger.addEventListener('click', function () {
            var open = document.body.classList.toggle('nav-open');
            burger.setAttribute('aria-expanded', String(open));
            burger.setAttribute('aria-label',
                open ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
        });

        $$('a', center).forEach(function (link) {
            link.addEventListener('click', close);
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') { close(); }
        });
    })();

    /* ======================================================================
       11. NEWSLETTER (Google Forms, modo no-cors)
       ====================================================================== */
    (function initNewsletter() {
        var form = $('#newsletter-form');
        var msg = $('#nl-msg');
        if (!form) { return; }

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var input = $('input[type="email"]', form);
            if (!input || !input.value) { return; }

            var data = new FormData(form);
            fetch(form.action, {
                method: 'POST',
                mode: 'no-cors',
                body: data
            }).then(done, done);

            function done() {
                form.reset();
                if (msg) { msg.textContent = '¡Gracias por suscribirte!'; }
            }
        });
    })();

})();
