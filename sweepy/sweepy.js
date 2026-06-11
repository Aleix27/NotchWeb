/* ============================================================
   SWEEPY — vibenotch.es/sweepy/ · JS de la página (vanilla)
   Secciones: utilidades · ticker rAF · starfield · órbitas 3D
   parallax · reveal/contadores · tabs · odómetro · demo escaneo
   tilt · magnéticos · galería/lightbox · precios · FAQ · nav
   ============================================================ */
(() => {
  'use strict';
  /* ============ 01. UTILIDADES ============ */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reduceMotion = motionQuery.matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const fmtNum = (value, decimals = 0) =>
    value.toFixed(decimals).replace('.', ',');
  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
  const smoothstep = (p) => p * p * (3 - 2 * p);
  /* ============ 02. TICKER GLOBAL ============ */
  const ticker = {
    fns: new Set(),
    rafId: null,
    loop(t) {
      ticker.fns.forEach((fn) => fn(t));
      ticker.rafId = requestAnimationFrame(ticker.loop);
    },
    start() {
      if (ticker.rafId !== null || reduceMotion || document.hidden) return;
      ticker.rafId = requestAnimationFrame(ticker.loop);
    },
    stop() {
      if (ticker.rafId !== null) {
        cancelAnimationFrame(ticker.rafId);
        ticker.rafId = null;
      }
    }
  };
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) ticker.stop();
    else ticker.start();
  });
  /* ============ 03. STARFIELD ============ */
  function initStarfield() {
    const canvas = $('#starfield');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let stars = [], w = 0, h = 0;
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(Math.round((w * h) / 9000), 170);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.4 + Math.random() * 1.1,
        base: 0.2 + Math.random() * 0.6,
        speed: 0.0004 + Math.random() * 0.0014,
        phase: Math.random() * Math.PI * 2,
        hue: Math.random() < 0.18 ? 'rgba(120,220,255,' : 'rgba(255,255,255,'
      }));
    }
    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        const a = s.base * (0.5 + 0.5 * Math.sin(s.phase + t * s.speed));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.hue + a.toFixed(3) + ')';
        ctx.fill();
      }
    }
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
        if (reduceMotion) draw(0);
      }, 180);
    });
    resize();
    if (reduceMotion) {
      draw(0); // un fotograma estático: ambiente sin animación
    } else {
      ticker.fns.add(draw);
    }
  }
  /* ============ 04. SISTEMA DE ÓRBITAS ============ */
  const ORBIT_PLANES = [
    { tilt: 0.34, rot: -0.32, dir: 1, speed: 0.00022, radius: 0.78 },
    { tilt: 0.52, rot: 0.24, dir: -1, speed: 0.00017, radius: 0.92 },
    { tilt: 0.28, rot: 0.66, dir: 1, speed: 0.00028, radius: 0.66 }
  ];
  function createOrbitSystem(stage) {
    if (!stage) return null;
    const els = $$('.orbiter', stage);
    if (!els.length) return null;
    const items = els.map((el, i) => ({
      el,
      plane: ORBIT_PLANES[(parseInt(el.dataset.plane, 10) || 0) % ORBIT_PLANES.length],
      phase: (i / els.length) * Math.PI * 2 + i * 0.55
    }));
    const ABSORB_DUR = 950, ABSORB_STAG = 120;
    let mode = 'orbit', absorbT0 = 0, onAbsorbed = null; // orbit | absorbing | absorbed
    function update(now) {
      const half = stage.offsetWidth / 2;
      if (!half) return;
      let pending = 0;
      items.forEach((it, i) => {
        let shrink = 1;
        let spiral = 0;
        let fade = 1;
        if (mode === 'absorbing') {
          const p = clamp((now - absorbT0 - i * ABSORB_STAG) / ABSORB_DUR, 0, 1);
          const e = smoothstep(p);
          shrink = 1 - e;
          spiral = e * 4.6;
          fade = 1 - e;
          if (p < 1) pending++;
        } else if (mode === 'absorbed') {
          it.el.style.opacity = '0';
          return;
        }
        const pl = it.plane;
        const angle = it.phase + now * pl.speed * pl.dir + spiral;
        const r = half * pl.radius * shrink;
        // posición en el plano de la órbita (elipse) + rotación del plano
        const ex = Math.cos(angle) * r;
        const ey = Math.sin(angle) * r * pl.tilt;
        const cosR = Math.cos(pl.rot);
        const sinR = Math.sin(pl.rot);
        const x = ex * cosR - ey * sinR;
        const y = ex * sinR + ey * cosR;
        // profundidad: delante (sin > 0) o detrás de la esfera
        const depth = (Math.sin(angle) + 1) / 2; // 0 = atrás, 1 = delante
        const scale = (0.72 + 0.34 * depth) * (0.55 + 0.45 * shrink);
        it.el.style.transform =
          `translate(-50%,-50%) translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) scale(${scale.toFixed(3)})`;
        it.el.style.opacity = (fade * (0.5 + 0.5 * depth)).toFixed(3);
        it.el.style.zIndex = depth > 0.5 ? '7' : '2';
        it.el.style.filter = depth > 0.5 ? 'none' : 'blur(1.2px)';
      });
      if (mode === 'absorbing' && pending === 0) {
        mode = 'absorbed';
        if (onAbsorbed) {
          const cb = onAbsorbed;
          onAbsorbed = null;
          cb();
        }
      }
    }
    function absorb(cb) {
      if (mode !== 'orbit') return;
      if (reduceMotion) {
        mode = 'absorbed';
        items.forEach((it) => { it.el.style.opacity = '0'; });
        if (cb) cb();
        return;
      }
      mode = 'absorbing';
      absorbT0 = performance.now();
      onAbsorbed = cb || null;
    }
    function reset() {
      mode = 'orbit';
      items.forEach((it) => { it.el.style.opacity = ''; });
      if (reduceMotion) update(0);
    }
    // primer fotograma inmediato: chips bien colocados desde el primer paint
    update(reduceMotion ? 0 : performance.now());
    // pausa cuando la esfera no está en pantalla
    if (!reduceMotion) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            update(performance.now()); // coloca los chips sin esperar al primer tick
            ticker.fns.add(update);
          } else {
            ticker.fns.delete(update);
          }
        });
      }, { rootMargin: '120px' });
      io.observe(stage);
    }
    return { absorb, reset, update };
  }
  /* ============ 05. PARALLAX DE LA ESFERA ============ */
  function initSphereParallax(stages) {
    if (reduceMotion || !finePointer || !stages.length) return;
    let pending = false, mx = 0, my = 0;
    window.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        stages.forEach((stage) => {
          const rect = stage.getBoundingClientRect();
          if (rect.bottom < 0 || rect.top > window.innerHeight) return;
          const px = clamp((mx - (rect.left + rect.width / 2)) / rect.width, -1, 1);
          const py = clamp((my - (rect.top + rect.height / 2)) / rect.height, -1, 1);
          stage.style.setProperty('--px', px.toFixed(3));
          stage.style.setProperty('--py', py.toFixed(3));
        });
      });
    }, { passive: true });
  }
  /* ============ 06. SCROLL-REVEAL + CONTADORES ============ */
  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    if (Number.isNaN(target)) return;
    const decimals = parseInt(el.dataset.decimals, 10) || 0;
    if (reduceMotion) {
      el.textContent = fmtNum(target, decimals);
      return;
    }
    const dur = 1400;
    const t0 = performance.now();
    const step = (t) => {
      const p = clamp((t - t0) / dur, 0, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmtNum(target * eased, decimals);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  function initReveals() {
    // reparte data-reveal con retraso escalonado dentro de los grupos
    $$('[data-reveal-group]').forEach((group) => {
      Array.from(group.children).forEach((child, i) => {
        child.setAttribute('data-reveal', '');
        child.style.setProperty('--d', `${Math.min(i * 80, 560)}ms`);
      });
    });
    const counted = new Set();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        $$('[data-count]', entry.target).forEach((el) => {
          if (!counted.has(el)) {
            counted.add(el);
            animateCount(el);
          }
        });
        io.unobserve(entry.target);
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -7% 0px' });
    $$('[data-reveal]').forEach((el) => io.observe(el));
    // contadores fuera de elementos con data-reveal (banda de cifras, salud)
    const ioCount = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        if (!counted.has(entry.target)) {
          counted.add(entry.target);
          animateCount(entry.target);
        }
        ioCount.unobserve(entry.target);
      });
    }, { threshold: 0.4 });
    $$('[data-count]').forEach((el) => ioCount.observe(el));
    // micro-visualizaciones del módulo Salud
    const ioViz = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('viz-on');
        ioViz.unobserve(entry.target);
      });
    }, { threshold: 0.35 });
    $$('[data-viz]').forEach((el) => ioViz.observe(el));
  }
  /* ============ 07. TABS DE CATEGORÍAS ============ */
  function initTabs() {
    const tablist = $('.tabs[role="tablist"]');
    if (!tablist) return;
    const tabs = $$('[role="tab"]', tablist);
    const panels = tabs
      .map((tab) => document.getElementById(tab.getAttribute('aria-controls')))
      .filter(Boolean);
    function select(tab) {
      tabs.forEach((t) => {
        const active = t === tab;
        t.setAttribute('aria-selected', String(active));
        t.tabIndex = active ? 0 : -1;
      });
      panels.forEach((panel) => {
        const show = panel.id === tab.getAttribute('aria-controls');
        panel.hidden = !show;
        panel.classList.remove('switching');
        if (show && !reduceMotion) {
          void panel.offsetWidth; // reinicia la animación en cascada
          panel.classList.add('switching');
        }
      });
    }
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', (e) => {
        let next = null;
        if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
        if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === 'Home') next = tabs[0];
        if (e.key === 'End') next = tabs[tabs.length - 1];
        if (next) {
          e.preventDefault();
          next.focus();
          select(next);
        }
      });
    });
  }
  /* ============ 08. ODÓMETRO ============ */
  function createOdometer(el) {
    if (!el) return null;
    let current = '';
    function build(str) {
      el.textContent = '';
      for (const ch of str) {
        if (ch >= '0' && ch <= '9') {
          const slot = document.createElement('span');
          slot.className = 'odo-slot';
          const reel = document.createElement('span');
          reel.className = 'odo-reel';
          for (let d = 0; d <= 9; d++) {
            const digit = document.createElement('span');
            digit.textContent = String(d);
            reel.appendChild(digit);
          }
          slot.appendChild(reel);
          el.appendChild(slot);
        } else {
          const sep = document.createElement('span');
          sep.className = 'odo-sep';
          sep.textContent = ch;
          el.appendChild(sep);
        }
      }
    }
    function set(value) {
      const str = fmtNum(value, 1);
      if (str.length !== current.length) build(str);
      const slots = $$('.odo-reel', el);
      let si = 0;
      for (const ch of str) {
        if (ch >= '0' && ch <= '9') {
          const reel = slots[si++];
          if (reel) reel.style.transform = `translateY(-${ch}em)`;
        }
      }
      current = str;
    }
    set(0);
    return { set };
  }
  /* ============ 09. DEMO DE ESCANEO ============ */
  function initScanDemo(demoOrbits) {
    const scanBtn = $('#scanBtn');
    const cleanBtn = $('#cleanBtn');
    const rescanBtn = $('#rescanBtn');
    const list = $('#scanList');
    const statusEl = $('#scanStatus');
    const sphereStatus = $('#sphereStatus');
    const proMoment = $('#proMoment');
    const stage = $('#demoSphere');
    const odometer = createOdometer($('#scanOdometer'));
    if (!scanBtn || !list || !odometer) return;
    const rows = $$('.scan-row', list).map((row) => ({
      row,
      sizeEl: $('.scan-size', row),
      gb: parseFloat(row.dataset.gb) || 0
    }));
    const TOTAL = rows.reduce((sum, r) => sum + r.gb, 0); // 47,3
    const ROW_STAG = 520;
    const ROW_DUR = 680;
    let running = false;
    let rafId = null;
    function resetRows() {
      rows.forEach(({ row, sizeEl, gb }) => {
        row.classList.remove('show');
        sizeEl.textContent = `${fmtNum(gb, 1)} GB`;
      });
    }
    function setStatus(text) {
      if (statusEl) statusEl.textContent = text;
    }
    function finishScan() {
      odometer.set(TOTAL);
      rows.forEach(({ row, sizeEl, gb }) => {
        row.classList.add('show');
        sizeEl.textContent = `${fmtNum(gb, 1)} GB`;
      });
      if (stage) {
        stage.classList.remove('is-feeding');
        stage.classList.add('is-charged');
      }
      setStatus(`${fmtNum(TOTAL, 1)} GB de basura regenerable encontrados. Listos para limpiar.`);
      if (sphereStatus) sphereStatus.textContent = 'La esfera ha absorbido la basura y se ha teñido con sus colores.';
      if (cleanBtn) cleanBtn.hidden = false;
      scanBtn.hidden = true;
      running = false;
    }
    function runScan() {
      if (running) return;
      running = true;
      scanBtn.disabled = true;
      setStatus('Escaneando rutas conocidas…');
      if (sphereStatus) sphereStatus.textContent = 'Absorbiendo cachés, builds y temporales…';
      if (stage) stage.classList.add('is-feeding');
      if (demoOrbits) demoOrbits.absorb();
      if (reduceMotion) {
        finishScan();
        return;
      }
      rows.forEach(({ sizeEl }) => { sizeEl.textContent = '0,0 GB'; });
      const t0 = performance.now();
      let lastOdo = 0;
      const frame = (t) => {
        const elapsed = t - t0;
        let runningTotal = 0;
        let done = 0;
        rows.forEach(({ row, sizeEl, gb }, i) => {
          const start = i * ROW_STAG;
          if (elapsed < start) return;
          if (!row.classList.contains('show')) row.classList.add('show');
          const p = clamp((elapsed - start) / ROW_DUR, 0, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          const val = gb * eased;
          runningTotal += val;
          sizeEl.textContent = `${fmtNum(val, 1)} GB`;
          if (p >= 1) done++;
        });
        if (t - lastOdo > 90) {
          lastOdo = t;
          odometer.set(runningTotal);
        }
        if (done < rows.length) {
          rafId = requestAnimationFrame(frame);
        } else {
          finishScan();
        }
      };
      rafId = requestAnimationFrame(frame);
    }
    function resetDemo() {
      if (rafId) cancelAnimationFrame(rafId);
      running = false;
      if (proMoment) proMoment.hidden = true;
      if (cleanBtn) cleanBtn.hidden = true;
      scanBtn.hidden = false;
      scanBtn.disabled = false;
      resetRows();
      rows.forEach(({ row }) => row.classList.remove('show'));
      odometer.set(0);
      setStatus('Pulsa «Escanear a fondo» para empezar.');
      if (sphereStatus) sphereStatus.textContent = 'Los iconos de tus apps orbitan la esfera. Al escanear, los absorbe.';
      if (stage) stage.classList.remove('is-feeding', 'is-charged');
      if (demoOrbits) demoOrbits.reset();
    }
    // estado inicial (JS activo): demo a cero
    resetRows();
    rows.forEach(({ row }) => row.classList.remove('show'));
    odometer.set(0);
    scanBtn.addEventListener('click', runScan);
    if (cleanBtn) {
      cleanBtn.addEventListener('click', () => {
        if (proMoment) proMoment.hidden = false;
        setStatus('El análisis es gratis. La limpieza con un clic, con Sweepy Pro.');
      });
    }
    if (rescanBtn) rescanBtn.addEventListener('click', resetDemo);
  }
  /* ============ 10. TILT 3D ============ */
  function initTilt() {
    if (reduceMotion || !finePointer) return;
    $$('[data-tilt]').forEach((card) => {
      let raf = null;
      card.addEventListener('mousemove', (e) => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = null;
          const rect = card.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;
          card.style.transform =
            `perspective(820px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg) translateY(-3px)`;
        });
      });
      card.addEventListener('mouseleave', () => {
        if (raf) {
          cancelAnimationFrame(raf);
          raf = null;
        }
        card.style.transform = '';
      });
    });
  }
  /* ============ 11. BOTONES MAGNÉTICOS ============ */
  function initMagnetic() {
    if (reduceMotion || !finePointer) return;
    $$('.magnetic').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        btn.style.transform =
          `translate(${clamp(dx * 0.18, -8, 8).toFixed(1)}px, ${clamp(dy * 0.3, -6, 6).toFixed(1)}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }
  /* ============ 12. GALERÍA + LIGHTBOX ============ */
  function initGallery() {
    const track = $('#galleryTrack');
    if (!track) return;
    const slides = $$('.shot', track);
    const dotsBox = $('#galleryDots');
    const prev = $('#galPrev');
    const next = $('#galNext');
    let dots = [];
    if (dotsBox) {
      dots = slides.map((_, i) => {
        const dot = document.createElement('span');
        dot.className = 'dot' + (i === 0 ? ' active' : '');
        dotsBox.appendChild(dot);
        return dot;
      });
    }
    const ioDots = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const idx = slides.indexOf(entry.target);
        dots.forEach((d, i) => d.classList.toggle('active', i === idx));
      });
    }, { root: track, threshold: 0.6 });
    slides.forEach((slide) => ioDots.observe(slide));
    const step = () => Math.max(track.clientWidth * 0.85, 260);
    if (prev) prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: reduceMotion ? 'auto' : 'smooth' }));
    if (next) next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: reduceMotion ? 'auto' : 'smooth' }));
    // Lightbox
    const lightbox = $('#lightbox');
    const lightboxImg = $('#lightboxImg');
    const lightboxClose = $('#lightboxClose');
    if (!lightbox || !lightboxImg) return;
    let lastFocus = null;
    function openLightbox(btn) {
      const img = $('img', btn);
      lightboxImg.src = btn.dataset.full || (img ? img.src : '');
      lightboxImg.alt = img ? img.alt : '';
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
      lastFocus = document.activeElement;
      if (lightboxClose) lightboxClose.focus();
    }
    function closeLightbox() {
      lightbox.hidden = true;
      lightboxImg.src = '';
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    }
    $$('.shot-btn', track).forEach((btn) => {
      btn.addEventListener('click', () => openLightbox(btn));
    });
    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (lightbox.hidden) return;
      if (e.key === 'Escape') {
        closeLightbox();
        return;
      }
      if (e.key === 'Tab') {
        // Trampa de foco: mantiene Tab dentro del diálogo mientras está abierto.
        const focusables = $$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', lightbox)
          .filter((el) => !el.disabled && el.offsetParent !== null);
        if (!focusables.length) {
          e.preventDefault();
          return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (!lightbox.contains(document.activeElement)) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }
  /* ============ 13. TOGGLE DE PRECIOS ============ */
  function initBilling() {
    const toggle = $('#billingToggle');
    if (!toggle) return;
    const buttons = $$('.bt-opt', toggle);
    const priceEl = $('#proPrice');
    const periodEl = $('#proPeriod');
    const noteEl = $('#proNote');
    const COPY = {
      monthly: { price: '2,99 €', period: '/mes', note: 'Cancela cuando quieras desde el App Store.' },
      yearly:  { price: '19,99 €', period: '/año', note: 'Equivale a 1,67 €/mes · ahorras un 44 %.' }
    };
    function flip(el, text) {
      if (!el) return;
      el.classList.remove('flip');
      void el.offsetWidth;
      el.textContent = text;
      el.classList.add('flip');
    }
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const period = btn.dataset.period;
        if (!period || toggle.dataset.period === period) return;
        toggle.dataset.period = period;
        buttons.forEach((b) => {
          const active = b === btn;
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-pressed', String(active));
        });
        const copy = COPY[period];
        flip(priceEl, copy.price);
        flip(periodEl, copy.period);
        flip(noteEl, copy.note);
      });
    });
  }
  /* ============ 14. FAQ (ACORDEÓN) ============ */
  function initFaq() {
    const items = $$('.faq-item');
    items.forEach((item) => {
      item.addEventListener('toggle', () => {
        if (!item.open) return;
        items.forEach((other) => {
          if (other !== item && other.open) other.open = false;
        });
      });
    });
  }
  /* ============ 15. NAVEGACIÓN ============ */
  function initNav() {
    const pill = $('#navPill');
    const burger = $('#navBurger');
    if (!pill) return;
    let scrollPending = false;
    window.addEventListener('scroll', () => {
      if (scrollPending) return;
      scrollPending = true;
      requestAnimationFrame(() => {
        scrollPending = false;
        pill.classList.toggle('scrolled', window.scrollY > 10);
      });
    }, { passive: true });
    pill.classList.toggle('scrolled', window.scrollY > 10);
    if (!burger) return;
    function setMenu(open) {
      pill.classList.toggle('menu-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    }
    burger.addEventListener('click', () => {
      setMenu(!pill.classList.contains('menu-open'));
    });
    $$('#navLinks a').forEach((link) => {
      link.addEventListener('click', () => setMenu(false));
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && pill.classList.contains('menu-open')) {
        setMenu(false);
        burger.focus();
      }
    });
    document.addEventListener('click', (e) => {
      if (pill.classList.contains('menu-open') && !pill.contains(e.target)) {
        setMenu(false);
      }
    });
  }
  /* ============ ARRANQUE ============ */
  function boot() {
    initStarfield();
    const heroOrbits = createOrbitSystem($('#heroSphere'));
    const demoOrbits = createOrbitSystem($('#demoSphere'));
    void heroOrbits; // el hero solo orbita; la demo además absorbe
    initSphereParallax($$('.sphere-stage'));
    initReveals();
    initTabs();
    initScanDemo(demoOrbits);
    initTilt();
    initMagnetic();
    initGallery();
    initBilling();
    initFaq();
    initNav();
    ticker.start();
    // si el usuario cambia su preferencia de movimiento en caliente
    const onMotionChange = (e) => {
      reduceMotion = e.matches;
      if (reduceMotion) ticker.stop();
      else ticker.start();
    };
    if (typeof motionQuery.addEventListener === 'function') {
      motionQuery.addEventListener('change', onMotionChange);
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
