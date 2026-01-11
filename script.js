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

    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        notch.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (!notch.contains(e.target) && !trigger.contains(e.target)) {
            notch.classList.remove('active');
        }
    });

    // Handle touch/hover for desktop feel but keep click as primary
    notch.addEventListener('mouseleave', () => {
        if (window.innerWidth > 768) {
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

    // 3.1 OBTENER SCROLL
    const getBtn = document.querySelector('.as-btn-get');
    if (getBtn) {
        getBtn.addEventListener('click', () => {
            const footer = document.querySelector('footer');
            if (footer) {
                footer.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }
        });
    }

    // 4. WAITLIST FORM (Google Forms Integration)
    // Google Forms handles submission natively - no JavaScript interception needed

    // 5. PARALLAX HERO & MAC
    const hero = document.querySelector('.hero');
    const mac = document.querySelector('.macbook-air');
    const appstoreSection = document.querySelector('.appstore-hero');

    window.addEventListener('scroll', () => {
        const scroll = window.pageYOffset;

        if (hero) {
            hero.style.transform = `translateY(${scroll * 0.2}px)`;
            hero.style.opacity = 1 - (scroll / 700);
        }

        if (mac && scroll < 1000) {
            mac.style.transform = `perspective(1000px) rotateX(${scroll * 0.02}deg) translateY(${scroll * 0.08}px)`;
        }
    });

    // 6. SIMPLE HOVER BUTTONS (No lag) - Only for simple buttons, let CSS handle the rest
    document.querySelectorAll('.btn-primary, .btn-waitlist').forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'scale(1.06)';
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'scale(1)';
        });

        btn.addEventListener('mousedown', () => {
            btn.style.transform = 'scale(0.95)';
        });

        btn.addEventListener('mouseup', () => {
            btn.style.transform = 'scale(1.06)';
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

});
