/* ============================================================
   EdgeFlow — interacciones de la landing
   Índice:
   01. Utilidades
   02. Fondo de partículas (canvas)
   03. Revelado por scroll (IntersectionObserver único)
   04. Contadores animados
   05. Tilt 3D en tarjetas
   06. CTA magnético
   07. Navegación móvil
   08. Demo interactiva: escritorio Mac + paneles de borde
   09. Vídeo: reproducir solo cuando es visible
   10. Newsletter (Google Forms)
   ============================================================ */
(() => {
  'use strict';

  /* ============ 01. Utilidades ============ */
  const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mqFine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ============ 02. Fondo de partículas (canvas) ============ */
  const canvas = document.getElementById('bg-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const COLORS = [[34, 211, 238], [59, 130, 246], [99, 102, 241]];
    let w = 0;
    let h = 0;
    let dpr = 1;
    let parts = [];
    let raf = 0;
    let running = false;

    const spawn = () => {
      const c = COLORS[(Math.random() * COLORS.length) | 0];
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        r: (Math.random() * 1.6 + 0.5) * dpr,
        vx: (Math.random() - 0.5) * 0.14 * dpr,
        vy: (-Math.random() * 0.16 - 0.04) * dpr,
        a: Math.random() * 0.45 + 0.12,
        c
      };
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + p.c[0] + ',' + p.c[1] + ',' + p.c[2] + ',' + p.a + ')';
        ctx.fill();
      }
    };

    const frame = () => {
      for (const p of parts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -12 || p.x < -12 || p.x > w + 12) {
          Object.assign(p, spawn(), { y: h + 8, x: Math.random() * w });
        }
      }
      draw();
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running || mqReduce.matches) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.width = Math.round(window.innerWidth * dpr);
      h = canvas.height = Math.round(window.innerHeight * dpr);
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      const n = clamp(Math.round((window.innerWidth * window.innerHeight) / 24000), 28, 90);
      parts = Array.from({ length: n }, spawn);
      if (mqReduce.matches) draw();
    };

    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else start();
    });
    mqReduce.addEventListener('change', () => {
      if (mqReduce.matches) {
        stop();
        draw();
      } else {
        start();
      }
    });
    if (mqReduce.matches) draw();
    else start();
  }

  /* ============ 03. Revelado por scroll ============ */
  document.querySelectorAll('[data-stagger]').forEach((group) => {
    group.querySelectorAll('.reveal').forEach((el, i) => {
      el.style.transitionDelay = (i * 90) + 'ms';
    });
  });

  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        revealIO.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -36px 0px' });

  document.querySelectorAll('.reveal').forEach((el) => revealIO.observe(el));

  /* ============ 04. Contadores animados ============ */
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    if (mqReduce.matches) {
      el.textContent = prefix + target + suffix;
      return;
    }
    const t0 = performance.now();
    const dur = 1300;
    const tick = (t) => {
      const p = clamp((t - t0) / dur, 0, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      countIO.unobserve(entry.target);
      animateCount(entry.target);
    });
  }, { threshold: 0.6 });

  document.querySelectorAll('[data-count]').forEach((el) => countIO.observe(el));

  /* ============ 05. Tilt 3D en tarjetas ============ */
  if (mqFine.matches && !mqReduce.matches) {
    document.querySelectorAll('.tilt').forEach((card) => {
      let raf = 0;
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          card.style.transform =
            'perspective(900px) rotateX(' + (-py * 7).toFixed(2) + 'deg) rotateY(' +
            (px * 9).toFixed(2) + 'deg) translateY(-4px)';
        });
      });
      card.addEventListener('pointerleave', () => {
        cancelAnimationFrame(raf);
        card.style.transform = '';
      });
    });
  }

  /* ============ 06. CTA magnético ============ */
  if (mqFine.matches && !mqReduce.matches) {
    document.querySelectorAll('.magnetic').forEach((btn) => {
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        const dx = clamp((e.clientX - (r.left + r.width / 2)) * 0.18, -8, 8);
        const dy = clamp((e.clientY - (r.top + r.height / 2)) * 0.22, -6, 6);
        btn.style.transform = 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px)';
      });
      btn.addEventListener('pointerleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* ============ 07. Navegación móvil ============ */
  const burger = document.getElementById('nav-burger');
  const navLinks = document.getElementById('nav-links');
  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      const open = document.body.classList.toggle('nav-open');
      burger.setAttribute('aria-expanded', String(open));
    });
    navLinks.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        document.body.classList.remove('nav-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
        document.body.classList.remove('nav-open');
        burger.setAttribute('aria-expanded', 'false');
        burger.focus();
      }
    });
  }

  /* ============ 08. Demo interactiva: escritorio Mac ============ */
  const mac = document.getElementById('mac-demo');
  if (mac) {
    const desktop = mac.querySelector('.mac__desktop');
    const cursor = mac.querySelector('.demo-cursor');
    const toast = mac.querySelector('.mac-toast');
    const toastIcon = toast.querySelector('.mac-toast__icon');
    const toastText = toast.querySelector('.mac-toast__text');
    const panels = {
      left: mac.querySelector('.epanel--left'),
      right: mac.querySelector('.epanel--right')
    };
    const beams = {
      left: mac.querySelector('.edge-beam--left'),
      right: mac.querySelector('.edge-beam--right')
    };

    const HOT = 30;          /* franja de activación (px dentro de la maqueta) */
    let openSide = null;     /* 'left' | 'right' | null */
    let userUntil = 0;       /* hasta cuándo el usuario tiene el control */
    let gen = 0;             /* generación: invalida secuencias automáticas */
    let demoVisible = false;
    let toastTimer = 0;

    const rect = () => desktop.getBoundingClientRect();

    const setCursor = (x, y, ms) => {
      cursor.style.transitionDuration = ms + 'ms';
      cursor.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    };

    const resetGoo = (panel) => {
      panel.querySelectorAll('.ep-btn').forEach((b) => {
        b.style.transform = '';
      });
    };

    /* Efecto "gota": el botón más cercano al cursor crece (caída gaussiana) */
    const goo = (panel, clientY, side) => {
      panel.querySelectorAll('.ep-btn').forEach((b) => {
        if (b.classList.contains('is-press')) return;
        const r = b.getBoundingClientRect();
        const d = Math.abs(clientY - (r.top + r.height / 2));
        const f = Math.exp(-(d * d) / (2 * 52 * 52));
        const s = 1 + 0.5 * f;
        const tx = (side === 'left' ? 1 : -1) * 20 * f;
        b.style.transform = 'translateX(' + tx.toFixed(1) + 'px) scale(' + s.toFixed(3) + ')';
      });
    };

    const openPanel = (side) => {
      if (openSide === side) return;
      closePanels();
      openSide = side;
      panels[side].classList.add('is-open');
      beams[side].classList.add('is-on');
    };

    const closePanels = () => {
      ['left', 'right'].forEach((s) => {
        panels[s].classList.remove('is-open');
        beams[s].classList.remove('is-on');
        resetGoo(panels[s]);
      });
      openSide = null;
    };

    const ripple = (btn) => {
      const s = document.createElement('span');
      s.className = 'ep-ripple';
      btn.appendChild(s);
      setTimeout(() => s.remove(), 720);
    };

    const showToast = (btn) => {
      const svg = btn.querySelector('svg');
      toastIcon.innerHTML = svg ? svg.outerHTML : '';
      toastText.textContent = btn.dataset.toast || ('Abriendo ' + (btn.dataset.name || '') + '…');
      toast.classList.add('is-show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove('is-show'), 1700);
    };

    const launch = (btn) => {
      btn.classList.add('is-press');
      ripple(btn);
      setTimeout(() => btn.classList.remove('is-press'), 220);
      showToast(btn);
    };

    /* --- Interacción real del visitante --- */
    desktop.addEventListener('pointermove', (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      userUntil = Date.now() + 4500;
      gen += 1;
      mac.classList.add('is-user');
      const r = rect();
      const x = e.clientX - r.left;
      if (x <= HOT) {
        openPanel('left');
      } else if (x >= r.width - HOT) {
        openPanel('right');
      } else if (openSide) {
        /* Igual que la app real: se repliega al alejarse del borde */
        const dist = openSide === 'left' ? x : r.width - x;
        const reach = panels[openSide].getBoundingClientRect().width + 42;
        if (dist > reach) closePanels();
      }
      if (openSide) goo(panels[openSide], e.clientY, openSide);
    });

    desktop.addEventListener('pointerleave', () => {
      closePanels();
      mac.classList.remove('is-user');
    });

    /* Toque en los bordes (móvil / trackpad sin hover) */
    [['left', '.edge-hot--left'], ['right', '.edge-hot--right']].forEach(([side, sel]) => {
      const hot = mac.querySelector(sel);
      hot.addEventListener('click', () => {
        userUntil = Date.now() + 5000;
        gen += 1;
        if (openSide === side) closePanels();
        else openPanel(side);
      });
    });

    desktop.addEventListener('click', (e) => {
      const btn = e.target.closest('.ep-btn');
      if (btn) {
        userUntil = Date.now() + 5000;
        launch(btn);
      }
    });

    /* --- Bucle automático (cursor fantasma) --- */
    const visIO = new IntersectionObserver((entries) => {
      demoVisible = entries[0].isIntersecting;
    }, { threshold: 0.35 });
    visIO.observe(mac);

    const autoStep = async (side, btnIndex, toastFallback) => {
      const myGen = ++gen;
      /* espera "cancelable": false si el usuario tomó el control */
      const ok = async (ms) => {
        await sleep(ms);
        return gen === myGen && demoVisible && !document.hidden && Date.now() > userUntil;
      };
      /* Cancelación: si el usuario tomó el control, no cerramos el panel que acaba de abrir */
      const bail = () => {
        if (Date.now() >= userUntil) {
          closePanels();
          return;
        }
        /* Solo apagamos el destello huérfano (encendido antes de abrir el panel) */
        ['left', 'right'].forEach((s) => {
          if (openSide !== s) beams[s].classList.remove('is-on');
        });
      };

      mac.classList.remove('is-user');
      const r = rect();
      const cx = r.width * 0.5;
      const cy = r.height * 0.55;
      setCursor(cx, cy, 0);
      cursor.style.opacity = '1';
      if (!await ok(520)) return bail();

      /* 1) El cursor empuja contra el borde */
      setCursor(side === 'left' ? 6 : r.width - 20, r.height * 0.42, 950);
      if (!await ok(1010)) return bail();

      /* 2) El borde se ilumina y el panel emerge */
      beams[side].classList.add('is-on');
      if (!await ok(240)) return bail();
      openPanel(side);
      if (!await ok(680)) return bail();

      /* 3) El cursor viaja hasta un atajo */
      const btns = panels[side].querySelectorAll('.ep-btn');
      const btn = btns[Math.min(btnIndex, btns.length - 1)];
      const br = btn.getBoundingClientRect();
      const bx = br.left - r.left + br.width / 2;
      const by = br.top - r.top + br.height / 2;
      setCursor(bx, by, 640);
      if (!await ok(700)) return bail();

      /* 4) El atajo burbujea, clic y feedback de lanzamiento */
      btn.classList.add('is-grow');
      if (!await ok(280)) {
        btn.classList.remove('is-grow');
        return bail();
      }
      if (!btn.dataset.toast && toastFallback) btn.dataset.toast = toastFallback;
      launch(btn);
      const stillMine = await ok(1050);
      btn.classList.remove('is-grow');
      if (!stillMine) return bail();

      /* 5) El panel se repliega y el cursor descansa */
      closePanels();
      setCursor(cx, cy, 900);
      await sleep(950);
    };

    const autoLoop = async () => {
      const script = [
        ['right', 1, null],
        ['left', 4, null]
      ];
      let i = 0;
      for (;;) {
        if (mqReduce.matches) {
          await sleep(1500);
          continue;
        }
        if (!demoVisible || document.hidden || Date.now() < userUntil) {
          cursor.style.opacity = '0';
          await sleep(650);
          continue;
        }
        const [side, idx, fallback] = script[i % script.length];
        await autoStep(side, idx, fallback);
        i += 1;
        await sleep(1500);
      }
    };

    const applyReduced = () => {
      if (mqReduce.matches) {
        cursor.style.opacity = '0';
        openPanel('right');
      }
    };
    applyReduced();
    mqReduce.addEventListener('change', applyReduced);

    autoLoop();
  }

  /* ============ 09. Vídeo: reproducir solo si es visible ============ */
  const demoVideo = document.getElementById('demo-video');
  if (demoVideo) {
    const videoIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) demoVideo.play().catch(() => {});
        else demoVideo.pause();
      });
    }, { threshold: 0.25 });
    videoIO.observe(demoVideo);
  }

  /* ============ 10. Newsletter (Google Forms, lista compartida) ============ */
  const nlForm = document.getElementById('newsletter-form');
  if (nlForm) {
    const success = document.getElementById('nl-success');
    nlForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = nlForm.querySelector('button');
      btn.disabled = true;
      btn.textContent = 'Enviando…';
      try {
        await fetch(
          'https://docs.google.com/forms/d/e/1FAIpQLSe3GrX4FudiQN3LfmSx-BB33I0tPNWUKVPMXFKJGgDw3HoeNQ/formResponse',
          { method: 'POST', mode: 'no-cors', body: new FormData(nlForm) }
        );
      } catch (err) {
        /* no-cors: la respuesta es opaca; lo damos por enviado */
      }
      nlForm.hidden = true;
      if (success) success.hidden = false;
    });
  }
})();
