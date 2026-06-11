document.addEventListener('DOMContentLoaded', () => {
    // 1. REVEAL OBSERVER WITH STAGGER
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('active');
                }, index * 100);

                if (entry.target.classList.contains('review-pill')) {
                    animateStars(entry.target);
                }
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal-scroll, .reveal-spec, .review-pill, .metric-item-h, .as-badge').forEach(el => observer.observe(el));

    // 2. STAR ANIMATION LOGIC
    function animateStars(container) {
        const starBox = container.querySelector('.stars-container');
        if (starBox.children.length > 0) return;

        const starCount = parseInt(starBox.getAttribute('data-stars')) || 5;
        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('span');
            star.classList.add('star');
            star.textContent = '★';
            starBox.appendChild(star);

            setTimeout(() => {
                star.classList.add('active');
            }, i * 150);
        }
    }

    // 3. INTERACTIVE WEB NOTCH
    const trigger = document.querySelector('.web-notch-hitbox');
    const notch = document.getElementById('web-notch');
    const playBtn = document.querySelector('.control-btn.play');
    const statusText = document.querySelector('.status-text');
    let isPlaying = false;

    const checkHover = () => {
        if (window.innerWidth > 768) {
            setTimeout(() => {
                if (!notch.matches(':hover') && !trigger.matches(':hover')) {
                    notch.classList.remove('active');
                }
            }, 50);
        }
    };

    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        notch.classList.toggle('active');
    });

    trigger.addEventListener('mouseenter', () => {
        if (window.innerWidth > 768) {
            notch.classList.add('active');
        }
    });

    notch.addEventListener('mouseenter', () => {
        if (window.innerWidth > 768) {
            notch.classList.add('active');
        }
    });

    trigger.addEventListener('mouseleave', checkHover);
    notch.addEventListener('mouseleave', checkHover);

    document.addEventListener('click', (e) => {
        if (!notch.contains(e.target) && !trigger.contains(e.target)) {
            notch.classList.remove('active');
        }
    });

    if (playBtn) {
        playBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            isPlaying = !isPlaying;
            playBtn.textContent = isPlaying ? '⏸' : '▶';
            statusText.textContent = isPlaying ? 'PLAYING' : 'PAUSED';

            const bars = document.querySelectorAll('.compact-visualizer span');
            bars.forEach(bar => {
                bar.style.animationPlayState = isPlaying ? 'running' : 'paused';
            });
        });
    }

    // 3.1 DOWNLOAD ACTIONS
    const appStoreUrl = 'https://apps.apple.com/app/vibenotch/id6757723688';

    // Add logic here if needed for tracking or dynamic URL updates

    // 4. WAITLIST FORM (Google Forms Integration)
    // Google Forms handles submission natively - no JavaScript interception needed

    // 5. PARALLAX HERO & MAC & INTRO VIDEO SCRUBBING
    const hero = document.querySelector('.hero');
    const mac = document.querySelector('.macbook-air');
    const introSection = document.querySelector('.intro-scroll-section');
    const introVideo = document.getElementById('intro-video');
    const nav = document.querySelector('nav');
    const isMobile = window.innerWidth <= 768;
    let videoUnlocked = false;

    // MOBILE: Unlock video on first touch (required by iOS/Android)
    const unlockVideo = () => {
        if (introVideo && !videoUnlocked) {
            introVideo.play().then(() => {
                introVideo.pause();
                introVideo.currentTime = 0;
                videoUnlocked = true;
            }).catch(() => { });
        }
        document.removeEventListener('touchstart', unlockVideo);
        document.removeEventListener('touchend', unlockVideo);
    };
    document.addEventListener('touchstart', unlockVideo, { passive: true });
    document.addEventListener('touchend', unlockVideo, { passive: true }); // Safari sometimes needs touchend

    // Throttle for video seeking to prevent decoder overload
    let lastSeekTime = 0;
    let lastScrollPercent = 0;
    let ticking = false;

    const updateVideoFrame = () => {
        const scroll = window.pageYOffset;
        const vh = window.innerHeight;

        if (introSection && introVideo && introVideo.duration) {
            // DESKTOP LOGIC (Smooth & Instant)
            if (!isMobile) {
                const sectionHeight = introSection.offsetHeight;
                const scrollPercent = Math.min(Math.max(scroll / (sectionHeight - vh), 0), 1);
                const targetTime = introVideo.duration * scrollPercent;

                // Direct update without throttle for desktop
                if (Math.abs(introVideo.currentTime - targetTime) > 0.05) {
                    introVideo.currentTime = targetTime;
                }
            }
            // MOBILE LOGIC (Unleashed - Max Fluidity)
            else if (videoUnlocked) {
                const sectionHeight = introSection.offsetHeight;
                const scrollPercent = Math.min(Math.max(scroll / (sectionHeight - vh), 0), 1);

                // Direct update without throttle, relying on browser's rAF
                const targetTime = introVideo.duration * scrollPercent;

                // Only update if difference exists (to save minimal redundant work)
                if (Math.abs(introVideo.currentTime - targetTime) > 0.03) {
                    introVideo.currentTime = targetTime;
                }
            }
        }

        // Nav visibility
        if (introSection) {
            const sectionHeight = introSection.offsetHeight;
            if (scroll > sectionHeight - 100) {
                nav.classList.add('visible');
            } else {
                nav.classList.remove('visible');
            }
        }

        // Hero parallax
        const introOffset = introSection ? introSection.offsetHeight : 0;
        const relativeScroll = scroll - introOffset;

        if (hero && relativeScroll > -vh) {
            hero.style.transform = `translateY(${Math.max(relativeScroll * 0.2, 0)}px)`;
            hero.style.opacity = 1 - (relativeScroll / 700);
        }

        if (mac && relativeScroll > -vh && relativeScroll < 1000) {
            mac.style.transform = `perspective(1000px) rotateX(${Math.max(relativeScroll * 0.02, 0)}deg) translateY(${Math.max(relativeScroll * 0.08, 0)}px)`;
        }

        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateVideoFrame);
            ticking = true;
        }
    });

    // Mobile autoplay removed to enforce scroll scrubbing

    // 6. SIMPLE HOVER BUTTONS
    document.querySelectorAll('.btn-primary, .btn-blue, .btn-yellow, .btn-appstore, .as-btn-get').forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = btn.style.transform + ' scale(1.06)';
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = btn.style.transform.replace(' scale(1.06)', '');
        });
    });

    // 7. CURSOR GLOW EFFECT
    const cursor = document.createElement('div');
    cursor.classList.add('cursor-glow');
    document.body.appendChild(cursor);

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    // 8. TILT EFFECT ON APP STORE CARD
    const asCard = document.querySelector('.appstore-container');
    if (asCard) {
        asCard.addEventListener('mousemove', (e) => {
            const rect = asCard.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            asCard.style.transform = `perspective(1000px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale(1.02)`;
        });

        asCard.addEventListener('mouseleave', () => {
            asCard.style.transform = 'perspective(1000px) rotateY(0) rotateX(0) scale(1)';
        });
    }

    // 9. TEXT SCRAMBLE EFFECT REMOVED - was too fast/distracting

    // 10. COUNTER ANIMATION FOR METRICS
    const metricValues = document.querySelectorAll('.h-value');
    const countObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.counted) {
                entry.target.dataset.counted = 'true';
                const target = entry.target.textContent.match(/\d+/);
                if (target) {
                    const finalValue = parseInt(target[0]);
                    const prefix = entry.target.textContent.includes('<') ? '< ' : '';
                    const suffix = entry.target.textContent.includes('MB') ? 'MB' : '';
                    let current = 0;
                    const increment = finalValue / 60;

                    const counter = setInterval(() => {
                        current += increment;
                        if (current >= finalValue) {
                            current = finalValue;
                            clearInterval(counter);
                        }
                        entry.target.textContent = prefix + Math.floor(current) + suffix;
                    }, 16);
                }
            }
        });
    }, { threshold: 0.5 });

    metricValues.forEach(el => countObserver.observe(el));

    // 11. FAST SMOOTH SCROLL LINKS
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href || href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - 60; // Offset for fixed nav
                const startPosition = window.pageYOffset;
                const distance = targetPosition - startPosition;
                const duration = 800; // Fast and snappy
                let start = null;

                function animation(currentTime) {
                    if (start === null) start = currentTime;
                    const timeElapsed = currentTime - start;
                    const progress = Math.min(timeElapsed / duration, 1);
                    const ease = progress < 0.5
                        ? 4 * progress * progress * progress
                        : 1 - Math.pow(-2 * progress + 2, 3) / 2; // easeInOutCubic
                    window.scrollTo(0, startPosition + distance * ease);
                    if (timeElapsed < duration) requestAnimationFrame(animation);
                }

                requestAnimationFrame(animation);
            }
        });
    });

    // 12. INITIAL NUDGE
    setTimeout(() => {
        notch.style.transform = 'translateX(-50%) translateY(5px)';
        setTimeout(() => {
            notch.style.transform = 'translateX(-50%) translateY(0)';
        }, 400);
    }, 1200);

    // 13. MOBILE MENU TOGGLE
    const menuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menuBtn.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // 14. FLOATING PARTICLES
    const particleContainer = document.createElement('div');
    particleContainer.classList.add('particles');
    document.body.appendChild(particleContainer);

    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 10 + 's';
        particle.style.animationDuration = (15 + Math.random() * 20) + 's';
        particleContainer.appendChild(particle);
    }

    // 15. APP CABINET PULL-DOWN
    const cabinet = document.getElementById('app-cabinet');
    let pullStartY = 0;
    let isPulling = false;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 200) {
            cabinet.classList.remove('show');
        }
    }, { passive: true });

    // Desktop/Wheel "Force Down"
    window.addEventListener('wheel', (e) => {
        if (window.scrollY === 0 && e.deltaY < -15) {
            cabinet.classList.add('show');
        }
    }, { passive: true });

    // Mobile "Pull Down"
    window.addEventListener('touchstart', (e) => {
        if (window.scrollY === 0) pullStartY = e.touches[0].pageY;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        if (window.scrollY === 0) {
            const pullDist = e.touches[0].pageY - pullStartY;
            if (pullDist > 40) {
                cabinet.classList.add('show');
            }
        }
    }, { passive: true });

    // ==========================================
    // 16. AUTOMATIC NOTCH ROTATION SHOWCASE
    // ==========================================
    const shortcutSlides = document.querySelectorAll('.shortcut-notch-img');
    let activeShortcutSlide = 0;
    let shortcutInterval;

    const showShortcutSlide = (index) => {
        shortcutSlides.forEach((slide, idx) => {
            if (idx === index) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });
        activeShortcutSlide = index;
    };

    const startShortcutRotation = () => {
        shortcutInterval = setInterval(() => {
            if (shortcutSlides.length > 0) {
                let next = (activeShortcutSlide + 1) % shortcutSlides.length;
                showShortcutSlide(next);
            }
        }, 4000); // Rotate automatically every 4 seconds
    };

    if (shortcutSlides.length > 0) {
        startShortcutRotation();
    }

    // ==========================================
    // 17. PROMO VIDEO CONTROL BUTTONS
    // ==========================================
    const promoVideo = document.getElementById('promo-video');
    const promoMuteBtn = document.getElementById('promo-mute-btn');
    const promoPlayBtn = document.getElementById('promo-play-btn');

    if (promoVideo) {
        if (promoMuteBtn) {
            promoMuteBtn.addEventListener('click', () => {
                promoVideo.muted = !promoVideo.muted;
                promoMuteBtn.textContent = promoVideo.muted ? '🔇 Silencio' : '🔊 Sonido';
            });
        }
        if (promoPlayBtn) {
            promoPlayBtn.addEventListener('click', () => {
                if (promoVideo.paused) {
                    promoVideo.play();
                    promoPlayBtn.textContent = '⏸ Pausar';
                } else {
                    promoVideo.pause();
                    promoPlayBtn.textContent = '▶ Reproducir';
                }
            });
        }
    }
});
