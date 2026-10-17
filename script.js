/* ============================================================
   VISHESH MADAN — PORTFOLIO SCRIPTS
   Pure vanilla ES6+ · Zero external dependencies
   ============================================================ */

(function () {
    'use strict';

    /* ----- DOM REFS ----- */
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

    const nav         = $('#siteNav');
    const navToggle   = $('#navToggle');
    const navLinks    = $('#navLinks');
    const navItems    = $$('.nav-link');
    const filterPills = $$('.filter-pill');
    const bentoCards  = $$('.bento-card');
    const toast       = $('#toast');
    const toastMsg    = $('#toastMsg');
    const typeTarget  = $('#typeTarget');
    const contactForm = $('#contactForm');
    const nameInput   = $('#formName');
    const emailInput  = $('#formEmail');
    const msgInput    = $('#formMessage');

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


    /* ----- NAV: Scroll state ----- */
    let ticking = false;

    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(() => {
                const y = window.scrollY;
                nav.classList.toggle('scrolled', y > 32);
                ticking = false;
            });
            ticking = true;
        }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // init


    /* ----- NAV: Mobile toggle & lifecycle ----- */
    function closeMobileMenu() {
        if (navLinks.classList.contains('open')) {
            navLinks.classList.remove('open');
            navToggle.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.setAttribute('aria-label', 'Open menu');
            document.body.style.overflow = '';
        }
    }

    navToggle.addEventListener('click', () => {
        const open = navLinks.classList.toggle('open');
        navToggle.classList.toggle('open', open);
        navToggle.setAttribute('aria-expanded', String(open));
        navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        document.body.style.overflow = open ? 'hidden' : '';
    });

    // Close on mobile link click
    navItems.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('open')) {
            closeMobileMenu();
            navToggle.focus();
        }
    });

    // Release scroll lock on resize / orientation change past mobile breakpoint
    const mqlMobile = window.matchMedia('(max-width: 768px)');
    if (mqlMobile.addEventListener) {
        mqlMobile.addEventListener('change', (e) => {
            if (!e.matches) closeMobileMenu();
        });
    }
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) closeMobileMenu();
    }, { passive: true });


    /* ----- NAV: Active link tracking ----- */
    const sections = $$('section[id]');
    const sectionMap = new Map();

    function updateActiveNav() {
        const scrollBottom = window.innerHeight + window.scrollY;
        const docHeight = document.documentElement.scrollHeight;
        if (scrollBottom >= docHeight - 60) {
            navItems.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === '#contact');
            });
            return;
        }

        for (const section of sections) {
            if (sectionMap.get(section.id)) {
                navItems.forEach(link => {
                    const href = link.getAttribute('href').slice(1);
                    link.classList.toggle('active', href === section.id);
                });
                break;
            }
        }
    }

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            sectionMap.set(entry.target.id, entry.isIntersecting);
        });
        updateActiveNav();
    }, {
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
    });

    sections.forEach(sec => navObserver.observe(sec));
    window.addEventListener('scroll', updateActiveNav, { passive: true });


    /* ----- REVEAL: IntersectionObserver for scroll animations ----- */
    const reveals = $$('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.1
    });

    reveals.forEach(el => revealObserver.observe(el));

    // Bento card reveals with staggered timing
    const bentoObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, i * 80);
                bentoObserver.unobserve(entry.target);
            }
        });
    }, {
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.05
    });

    bentoCards.forEach(card => bentoObserver.observe(card));


    /* ----- HERO: Counter animation ----- */
    const metricValues = $$('.metric-value[data-count]');
    let countersAnimated = false;

    function animateCounters() {
        if (countersAnimated) return;
        countersAnimated = true;

        metricValues.forEach(el => {
            const target = parseInt(el.dataset.count, 10);
            if (prefersReducedMotion) {
                el.textContent = target;
                return;
            }
            const duration = 1200;
            const start = performance.now();

            function step(now) {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                el.textContent = Math.round(eased * target);
                if (progress < 1) requestAnimationFrame(step);
            }
            requestAnimationFrame(step);
        });
    }

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                counterObserver.disconnect();
            }
        });
    }, { threshold: 0.2 });

    const heroSection = $('#hero');
    if (heroSection) {
        counterObserver.observe(heroSection);
        // If already visible at load
        const rect = heroSection.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            animateCounters();
        }
    }


    /* ----- HERO: Typewriter effect (glitch-free + reduced motion aware) ----- */
    const phrases = [
        'ship and sell.',
        'move metrics.',
        'solve real problems.',
        'work in production.'
    ];

    if (typeTarget && !prefersReducedMotion) {
        let phraseIdx = 0;
        let charIdx   = phrases[0].length;
        let deleting  = true;
        let pauseMs   = 2400;

        function typeStep() {
            const current = phrases[phraseIdx];

            if (!deleting) {
                charIdx++;
                typeTarget.textContent = current.slice(0, charIdx);

                if (charIdx === current.length) {
                    pauseMs = 2400;
                    deleting = true;
                } else {
                    pauseMs = 50 + Math.random() * 35;
                }
            } else {
                charIdx--;
                typeTarget.textContent = current.slice(0, charIdx);

                if (charIdx === 0) {
                    deleting = false;
                    phraseIdx = (phraseIdx + 1) % phrases.length;
                    pauseMs = 400;
                } else {
                    pauseMs = 30;
                }
            }

            setTimeout(typeStep, pauseMs);
        }

        setTimeout(typeStep, pauseMs);
    }


    /* ----- CARD SPOTLIGHT INTERACTION (Vercel/Linear aura) ----- */
    if (window.matchMedia('(pointer: fine)').matches) {
        const spotlightCards = $$('.bento-card, .detail-card, .leadership-card, .cert-card');
        spotlightCards.forEach(card => {
            card.addEventListener('pointermove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            });
        });
    }


    /* ----- PROJECTS: Filter ----- */
    filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            const filter = pill.dataset.filter;

            // Update active pill
            filterPills.forEach(p => {
                const isActive = p === pill;
                p.classList.toggle('active', isActive);
                p.setAttribute('aria-selected', String(isActive));
            });

            // Filter cards
            bentoCards.forEach(card => {
                const cats = (card.dataset.category || '').split(/\s+/);
                const show = filter === 'all' || cats.includes(filter);
                card.classList.toggle('hidden', !show);

                // Re-trigger entrance for visible cards
                if (show) {
                    card.classList.remove('visible');
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            card.classList.add('visible');
                        });
                    });
                }
            });
        });
    });


    /* ----- PROJECTS: Bento Card Clickability & Keyboard Activation ----- */
    bentoCards.forEach(card => {
        if (card.dataset.hasLink === 'true') {
            card.addEventListener('click', (e) => {
                if (e.target.closest('a') || e.target.closest('button')) return;
                const primaryLink = card.querySelector('.bento-links a');
                if (primaryLink) {
                    window.open(primaryLink.href, primaryLink.target || '_self', 'noopener,noreferrer');
                }
            });

            card.addEventListener('keydown', (e) => {
                if ((e.key === 'Enter' || e.key === ' ') && document.activeElement === card) {
                    e.preventDefault();
                    const primaryLink = card.querySelector('.bento-links a');
                    if (primaryLink) {
                        window.open(primaryLink.href, primaryLink.target || '_self', 'noopener,noreferrer');
                    }
                }
            });
        }
    });


    /* ----- CONTACT: Clipboard copy with toast & tactile feedback ----- */
    let toastTimeout;

    function showToast(message, isSuccess = true) {
        toastMsg.textContent = message;
        const icon = toast.querySelector('i');
        if (icon) {
            icon.className = isSuccess ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
        }
        toast.classList.add('show');
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 2600);
    }

    $$('[data-copy]').forEach(btn => {
        const hintEl = btn.querySelector('.contact-action-hint');
        const defaultHint = hintEl ? hintEl.textContent : 'Click to copy';
        let hintResetTimer;

        btn.addEventListener('click', async () => {
            const text = btn.dataset.copy;
            try {
                await navigator.clipboard.writeText(text);
            } catch {
                const ta = document.createElement('textarea');
                ta.value = text;
                ta.style.cssText = 'position:fixed;left:-9999px;opacity:0;';
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
            }

            // Local in-place tactile feedback
            btn.classList.add('copied');
            if (hintEl) hintEl.textContent = '✓ Copied!';
            clearTimeout(hintResetTimer);
            hintResetTimer = setTimeout(() => {
                btn.classList.remove('copied');
                if (hintEl) hintEl.textContent = defaultHint;
            }, 2200);

            showToast(`Copied ${text} to clipboard!`, true);
        });
    });


    /* ----- CONTACT: Form handling with precision validation ----- */
    if (contactForm) {
        [nameInput, emailInput, msgInput].forEach(inp => {
            if (inp) {
                inp.addEventListener('input', () => {
                    inp.removeAttribute('aria-invalid');
                });
            }
        });

        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name    = nameInput ? nameInput.value.trim() : '';
            const email   = emailInput ? emailInput.value.trim() : '';
            const message = msgInput ? msgInput.value.trim() : '';

            if (!name) {
                if (nameInput) {
                    nameInput.setAttribute('aria-invalid', 'true');
                    nameInput.focus();
                }
                showToast('Please enter your name', false);
                return;
            }

            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                if (emailInput) {
                    emailInput.setAttribute('aria-invalid', 'true');
                    emailInput.focus();
                }
                showToast('Please enter a valid email address', false);
                return;
            }

            if (!message) {
                if (msgInput) {
                    msgInput.setAttribute('aria-invalid', 'true');
                    msgInput.focus();
                }
                showToast('Please write a message', false);
                return;
            }

            // Construct mailto dispatch
            const subject = encodeURIComponent('Portfolio Inquiry: ' + name);
            const body    = encodeURIComponent(
                'Name: ' + name + '\nEmail: ' + email + '\n\n' + message
            );
            window.location.href = 'mailto:visheshmadan10@gmail.com?subject=' + subject + '&body=' + body;

            showToast('Opening email client...', true);
            contactForm.reset();
        });
    }


    /* ----- SMART TV & ACCESSIBILITY: D-Pad spatial navigation (directional-weighted) ----- */
    const FOCUSABLE_SEL = [
        '.bento-card[tabindex="0"]',
        '.filter-pill',
        '.contact-action',
        '.btn',
        '.nav-link',
        '.btn-nav-resume',
        'a[href]',
        'button',
        'input',
        'textarea'
    ].join(',');

    document.addEventListener('keydown', (e) => {
        const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
        if (!keys.includes(e.key)) return;

        const active = document.activeElement;

        // Skip D-pad navigation when typing inside input / textarea
        if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return;

        const focusables = $$(FOCUSABLE_SEL).filter(el => {
            return el.offsetParent !== null && !el.classList.contains('hidden') && el.tabIndex !== -1;
        });

        if (focusables.length === 0) return;

        // If body is active (initial TV load), focus first interactive control
        if (!active || active === document.body) {
            e.preventDefault();
            focusables[0].focus();
            return;
        }

        const rect = active.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        let best = null;
        let bestDist = Infinity;

        focusables.forEach(el => {
            if (el === active) return;

            const r = el.getBoundingClientRect();
            const ex = r.left + r.width / 2;
            const ey = r.top + r.height / 2;
            const dx = ex - cx;
            const dy = ey - cy;

            let valid = false;
            let cost = Infinity;

            switch (e.key) {
                case 'ArrowUp':
                    if (dy < -10 && Math.abs(dx) <= Math.abs(dy) * 2.5) {
                        valid = true;
                        cost = Math.abs(dy) + Math.abs(dx) * 3;
                    }
                    break;
                case 'ArrowDown':
                    if (dy > 10 && Math.abs(dx) <= Math.abs(dy) * 2.5) {
                        valid = true;
                        cost = Math.abs(dy) + Math.abs(dx) * 3;
                    }
                    break;
                case 'ArrowLeft':
                    if (dx < -10 && Math.abs(dy) <= Math.abs(dx) * 2.5) {
                        valid = true;
                        cost = Math.abs(dx) + Math.abs(dy) * 3;
                    }
                    break;
                case 'ArrowRight':
                    if (dx > 10 && Math.abs(dy) <= Math.abs(dx) * 2.5) {
                        valid = true;
                        cost = Math.abs(dx) + Math.abs(dy) * 3;
                    }
                    break;
            }

            if (valid && cost < bestDist) {
                bestDist = cost;
                best = el;
            }
        });

        if (best) {
            e.preventDefault();
            best.focus({ preventScroll: false });
        }
    });


    /* ----- SMOOTH ANCHOR SCROLL & ACCESSIBILITY FOCUS TRANSFER ----- */
    $$('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const id = anchor.getAttribute('href');
            if (id === '#') return;
            const target = $(id);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                if (history.pushState) history.pushState(null, null, id);
                if (id === '#main-content' || target.hasAttribute('tabindex')) {
                    target.focus({ preventScroll: true });
                }
            }
        });
    });

})();