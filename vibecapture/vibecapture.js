(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealTargets = document.querySelectorAll('[data-reveal], [data-reveal-group]');

  if ('IntersectionObserver' in window && !reducedMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -4% 0px', threshold: 0.04 });

    revealTargets.forEach((target) => revealObserver.observe(target));
  } else {
    revealTargets.forEach((target) => target.classList.add('is-visible'));
  }

  const heroDemo = document.getElementById('heroDemo');
  const demoToggle = document.getElementById('demoToggle');
  const demoIcon = demoToggle?.querySelector('[data-demo-icon]');
  const demoLabel = demoToggle?.querySelector('[data-demo-label]');
  let demoWantsPlayback = !reducedMotion;
  let demoIsVisible = true;

  const syncDemoControl = () => {
    if (!heroDemo || !demoToggle || !demoIcon || !demoLabel) return;
    const playing = !heroDemo.paused;
    demoToggle.setAttribute('aria-pressed', String(playing));
    demoToggle.setAttribute('aria-label', playing ? 'Pausar vídeo' : 'Reproducir vídeo');
    demoIcon.textContent = playing ? 'Ⅱ' : '▶';
    demoLabel.textContent = playing ? 'Pausar' : 'Reproducir';
  };

  const playDemo = async () => {
    if (!heroDemo || !demoWantsPlayback || !demoIsVisible || document.hidden) return;
    try {
      await heroDemo.play();
    } catch {
      demoWantsPlayback = false;
      syncDemoControl();
    }
  };

  if (heroDemo && demoToggle) {
    heroDemo.addEventListener('play', syncDemoControl);
    heroDemo.addEventListener('pause', syncDemoControl);
    demoToggle.addEventListener('click', () => {
      if (heroDemo.paused) {
        demoWantsPlayback = true;
        playDemo();
      } else {
        demoWantsPlayback = false;
        heroDemo.pause();
      }
    });

    if ('IntersectionObserver' in window) {
      const demoObserver = new IntersectionObserver((entries) => {
        demoIsVisible = entries.some((entry) => entry.isIntersecting);
        if (demoIsVisible) playDemo();
        else heroDemo.pause();
      }, { threshold: 0.25 });
      demoObserver.observe(heroDemo);
    } else {
      playDemo();
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) heroDemo.pause();
      else playDemo();
    });
    syncDemoControl();
  }

  const progress = document.getElementById('pageProgress');
  let ticking = false;

  const updateScrollState = () => {
    const currentY = window.scrollY;
    const scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    progress.style.transform = `scaleX(${Math.min(currentY / scrollable, 1)})`;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateScrollState);
  }, { passive: true });
  updateScrollState();

  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  const closeMenu = () => {
    navLinks?.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
    navToggle?.setAttribute('aria-label', 'Abrir menú');
    document.body.classList.remove('menu-open');
  };

  navToggle?.addEventListener('click', () => {
    const willOpen = !navLinks.classList.contains('open');
    navLinks.classList.toggle('open', willOpen);
    navToggle.setAttribute('aria-expanded', String(willOpen));
    navToggle.setAttribute('aria-label', willOpen ? 'Cerrar menú' : 'Abrir menú');
    document.body.classList.toggle('menu-open', willOpen);
  });

  navLinks?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

  const appSwitcher = document.querySelector('.app-switcher');
  document.addEventListener('click', (event) => {
    if (appSwitcher?.open && !appSwitcher.contains(event.target)) appSwitcher.removeAttribute('open');
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    closeMenu();
    appSwitcher?.removeAttribute('open');
  });

  const deviceCanvas = document.getElementById('deviceCanvas');
  const deviceTabs = Array.from(document.querySelectorAll('.device-tabs [role="tab"]'));
  const deviceLabels = {
    macbook: 'Studio · Hero move',
    imac: 'Gallery · Push in',
    iphone: 'Social · Portrait'
  };

  const selectDevice = (tab) => {
    const device = tab.dataset.device;
    deviceCanvas.dataset.device = device;
    deviceCanvas.querySelector('.scene-badge').textContent = deviceLabels[device];
    deviceTabs.forEach((item) => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
    });
  };

  deviceTabs.forEach((tab, index) => {
    tab.tabIndex = index === 0 ? 0 : -1;
    tab.addEventListener('click', () => selectDevice(tab));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let nextIndex = index;
      if (event.key === 'ArrowLeft') nextIndex = (index - 1 + deviceTabs.length) % deviceTabs.length;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % deviceTabs.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = deviceTabs.length - 1;
      deviceTabs[nextIndex].focus();
      selectDevice(deviceTabs[nextIndex]);
    });
  });

  const sectionLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
  const observedSections = sectionLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        sectionLinks.forEach((link) => {
          const active = link.getAttribute('href') === `#${entry.target.id}`;
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });

    observedSections.forEach((section) => sectionObserver.observe(section));
  }

  window.addEventListener('resize', () => {
    if (window.innerWidth > 980) closeMenu();
  });
})();
