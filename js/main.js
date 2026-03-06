/**
 * ARTools Precision Pen — main.js
 * Base: design_system.html
 * Dependências: GSAP 3.12 + ScrollTrigger
 */

(function() {
    'use strict';

    function init() {
        gsap.registerPlugin(ScrollTrigger);

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const duration = prefersReducedMotion ? 0.3 : 0.8;

        /* =============================================
           ANIMAÇÕES DE ENTRADA (page load)
           ============================================= */
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        tl.to('#nav', { opacity: 1, y: 0, duration }, 0.2)
          .to('#heroTopMeta', { opacity: 1, duration: prefersReducedMotion ? 0.2 : 0.5 }, 0.25)
          .to('#titleLine1', { y: 0, opacity: 1, duration: prefersReducedMotion ? 0.2 : 0.9 }, 0.4)
          .to('#titleLine2', { y: 0, opacity: 1, duration: prefersReducedMotion ? 0.2 : 0.9 }, 0.5)
          .to('#titleLine3', { y: 0, opacity: 1, duration: prefersReducedMotion ? 0.2 : 0.9 }, 0.55)
          .to('#subtitleRow', { y: 0, opacity: 1, duration: prefersReducedMotion ? 0.2 : 0.8 }, 0.75)
          .to('#heroVideoWrap', { opacity: 1, duration: prefersReducedMotion ? 0.3 : 1.2 }, 0.5)
          .to('#heroMeta', { opacity: 1, duration: prefersReducedMotion ? 0.2 : 0.6 }, 1.0)
          .to('#scrollIndicator', { opacity: 1, duration: prefersReducedMotion ? 0.2 : 0.6 }, 1.1);

        const navEl = document.getElementById('nav');
        if (navEl) navEl.classList.add('loaded');

        /* Navbar — escurece ao rolar (IntersectionObserver) */
        const nav = document.getElementById('nav');
        const hero = document.getElementById('hero');
        if (nav && hero) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(e => {
                    nav.classList.toggle('scrolled', !e.isIntersecting);
                });
            }, { threshold: 0.1 });
            observer.observe(hero);
        }

        /* Barra de progresso do scroll */
        const scrollProgress = document.getElementById('scrollProgress');
        if (scrollProgress) {
            window.addEventListener('scroll', () => {
                const h = document.documentElement.scrollHeight - window.innerHeight;
                const p = h > 0 ? (window.scrollY / h) * 100 : 0;
                scrollProgress.style.width = p + '%';
            }, { passive: true });
        }

        /* =============================================
           VÍDEO HERO — rodando em loop + recuperação de travamento
           ============================================= */
        const video = document.getElementById('heroVideo');
        const heroVideoWrap = document.getElementById('heroVideoWrap');
        if (video && heroVideoWrap) {
            video.loop = true;
            video.muted = true;
            video.playsInline = true;
            video.setAttribute('playsinline', '');
            video.setAttribute('webkit-playsinline', '');

            let retryCount = 0;
            const maxRetries = 5;

            function playVideo() {
                if (!video.paused) return;
                video.muted = true;
                video.play().then(() => {
                    retryCount = 0;
                }).catch(() => {});
            }

            video.addEventListener('error', () => heroVideoWrap.classList.add('video-failed'));
            video.addEventListener('loadeddata', playVideo);
            video.addEventListener('canplay', playVideo);
            video.addEventListener('canplaythrough', playVideo);
            playVideo();

            video.addEventListener('pause', () => {
                if (document.hidden) return;
                if (retryCount < maxRetries) {
                    retryCount++;
                    setTimeout(playVideo, 300 * retryCount);
                }
            });

            video.addEventListener('stalled', () => {
                if (!document.hidden && retryCount < maxRetries) {
                    retryCount++;
                    setTimeout(playVideo, 500);
                }
            });

            video.addEventListener('waiting', () => {
                if (!document.hidden && video.paused && retryCount < maxRetries) {
                    retryCount++;
                    setTimeout(playVideo, 800);
                }
            });

            document.addEventListener('visibilitychange', () => {
                if (!document.hidden) {
                    retryCount = 0;
                    playVideo();
                }
            });

            const unlockVideo = () => {
                playVideo();
                document.removeEventListener('click', unlockVideo);
                document.removeEventListener('touchstart', unlockVideo);
            };
            document.addEventListener('click', unlockVideo, { once: true });
            document.addEventListener('touchstart', unlockVideo, { once: true });
        }

        /* =============================================
           SEÇÃO 2 — Produto (reveal no scroll)
           ============================================= */
        const sectionProduct = document.querySelector('.section-product');
        if (sectionProduct) {
            gsap.utils.toArray('.section-product .reveal').forEach((el, i) => {
                const isImage = el.classList.contains('section-product-image');
                const isCard = el.classList.contains('tech-card');
                gsap.fromTo(el,
                    {
                        opacity: 0,
                        y: isImage ? 40 : 28,
                        scale: isImage ? 0.96 : 1
                    },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: isImage ? 1 : 0.8,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: el,
                            start: 'top 88%',
                            toggleActions: 'play none none none'
                        },
                        delay: isCard ? i * 0.08 : i * 0.06
                    }
                );
            });
        }

        /* Flashlight nos tech-cards — design_system */
        document.querySelectorAll('.tech-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                card.style.setProperty('--mouse-x', x + '%');
                card.style.setProperty('--mouse-y', y + '%');
            });
        });

        /* =============================================
           SEÇÃO 3 — Especificações (reveal no scroll)
           ============================================= */
        gsap.utils.toArray('.section-specs .reveal').forEach((el, i) => {
            const isCard = el.classList.contains('spec-card');
            const isHeadline = el.classList.contains('section-specs-headline');
            gsap.fromTo(el,
                {
                    opacity: 0,
                    y: isHeadline ? 36 : 28,
                    scale: isCard ? 0.95 : 1
                },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: isHeadline ? 1 : 0.85,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 88%',
                        toggleActions: 'play none none none'
                    },
                    delay: isCard ? i * 0.06 : i * 0.05
                }
            );
        });

        /* Flashlight nos spec-cards */
        document.querySelectorAll('.spec-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                card.style.setProperty('--mouse-x', x + '%');
                card.style.setProperty('--mouse-y', y + '%');
            });
        });

        /* =============================================
           SEÇÃO 4 — Vídeo + Glow box
           ============================================= */
        const videoGlow = document.querySelector('.section-glow-video video');
        const sectionGlowVideo = document.querySelector('.section-glow-video');
        if (videoGlow && sectionGlowVideo) {
            videoGlow.loop = true;
            videoGlow.muted = true;
            videoGlow.playsInline = true;
            videoGlow.addEventListener('error', () => sectionGlowVideo.classList.add('video-failed'));
            videoGlow.play().catch(() => {});
        }

        gsap.utils.toArray('.section-glow .reveal').forEach((el) => {
            gsap.fromTo(el,
                { opacity: 0, y: 40, scale: 0.95 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 85%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
