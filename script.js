/* ================================================================
   VISHESH MADAN — WEBGL & SCROLL ORCHESTRATION V3.0
   System: Three.js r128 + GSAP ScrollTrigger + Custom Post-Processing
   ================================================================ */

gsap.registerPlugin(ScrollTrigger);

/* --- MAIN CONTROLLER SYSTEM --- */
const App = {
    init() {
        this.setupCursor();
        this.setupNavigation();
        this.setupTimeline();
        this.setupWebGL();
        this.setupScrollTriggers();
        this.setupTypewriter();
        this.setupSkillsAnimation();
    },

    /* --- DYNAMIC HUD CURSOR --- */
    setupCursor() {
        const cursor = document.getElementById('customCursor');
        const dot = document.getElementById('customCursorDot');
        if (!cursor || !dot) return;

        let mouseX = 0, mouseY = 0;
        let cursorX = 0, cursorY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            dot.style.left = `${mouseX}px`;
            dot.style.top = `${mouseY}px`;
        });

        // Smooth cursor follow
        gsap.ticker.add(() => {
            const dt = 1.0 - Math.pow(0.1, gsap.ticker.deltaRatio() * 0.1);
            cursorX += (mouseX - cursorX) * dt;
            cursorY += (mouseY - cursorY) * dt;
            cursor.style.left = `${cursorX}px`;
            cursor.style.top = `${cursorY}px`;
        });

        // Interactive hover states
        const interactiveElements = document.querySelectorAll('a, button, .timeline-header, .glass-card');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.style.width = '40px';
                cursor.style.height = '40px';
                cursor.style.backgroundColor = 'rgba(6, 182, 212, 0.08)';
                cursor.style.borderColor = 'var(--accent-magenta)';
            });
            el.addEventListener('mouseleave', () => {
                cursor.style.width = '20px';
                cursor.style.height = '20px';
                cursor.style.backgroundColor = 'transparent';
                cursor.style.borderColor = 'var(--accent-cyan)';
            });
        });
    },

    /* --- RESPONSIVE MENU HUD --- */
    setupNavigation() {
        const nav = document.getElementById('mainNav');
        const toggle = document.getElementById('navToggle');
        const links = document.getElementById('navLinks');
        
        if (nav) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 50) {
                    nav.classList.add('scrolled');
                } else {
                    nav.classList.remove('scrolled');
                }
            });
        }

        if (toggle && links) {
            toggle.addEventListener('click', () => {
                links.classList.toggle('mobile-open');
                const isOpen = links.classList.contains('mobile-open');
                toggle.innerHTML = isOpen ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
            });

            // Close when clicking link
            links.querySelectorAll('a').forEach(a => {
                a.addEventListener('click', () => {
                    links.classList.remove('mobile-open');
                    toggle.innerHTML = '<i class="fas fa-bars"></i>';
                });
            });
        }
    },

    /* --- INTERACTIVE ACCORDION TIMELINE --- */
    setupTimeline() {
        const cards = document.querySelectorAll('.timeline-card');
        cards.forEach(card => {
            const header = card.querySelector('.timeline-header');
            if (header) {
                header.addEventListener('click', () => {
                    const isActive = card.classList.contains('active');
                    cards.forEach(c => c.classList.remove('active'));
                    if (!isActive) {
                        card.classList.add('active');
                    }
                });
            }
        });
    },

    /* --- ADVANCED THREE.JS SCENE PIPELINE --- */
    setupWebGL() {
        const container = document.getElementById('canvas-container');
        if (!container) return;

        // Scene
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x020108, 0.08);

        // Camera
        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 8;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;
        container.appendChild(renderer.domElement);

        // Dynamic Lighting System
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.15);
        scene.add(ambientLight);

        const pointLight1 = new THREE.PointLight(0x7c3aed, 2, 50);
        pointLight1.position.set(10, 10, 10);
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x06b6d4, 2, 50);
        pointLight2.position.set(-10, -10, 10);
        scene.add(pointLight2);

        // Core 3D Geometry mesh (Hologram Node)
        const nodeGeometry = new THREE.IcosahedronGeometry(1.6, 2);
        const nodeMaterial = new THREE.MeshBasicMaterial({
            color: 0x06b6d4,
            wireframe: true,
            transparent: true,
            opacity: 0.15
        });
        const nodeMesh = new THREE.Mesh(nodeGeometry, nodeMaterial);
        scene.add(nodeMesh);

        // Morphing Particle Field Generation (2000 points)
        const particleCount = 2000;
        const geometry = new THREE.BufferGeometry();
        
        // Define coordinate arrays for each morph stage
        const posArray = new Float32Array(particleCount * 3);
        const state0Positions = new Float32Array(particleCount * 3); // Spiral Vortex
        const state1Positions = new Float32Array(particleCount * 3); // DNA Helix
        const state2Positions = new Float32Array(particleCount * 3); // Data Highway (Wave Plane)
        const state3Positions = new Float32Array(particleCount * 3); // Constellation grid
        const state4Positions = new Float32Array(particleCount * 3); // Centered project sphere
        const state5Positions = new Float32Array(particleCount * 3); // Sinking black hole vortex

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;

            // State 0: Spiral Vortex
            const theta0 = (i / particleCount) * Math.PI * 40;
            const r0 = 1.5 + (i / particleCount) * 8.0;
            state0Positions[i3] = Math.cos(theta0) * r0;
            state0Positions[i3 + 1] = (Math.random() - 0.5) * 4.0;
            state0Positions[i3 + 2] = Math.sin(theta0) * r0;

            // State 1: DNA Helix
            const theta1 = (i / particleCount) * Math.PI * 16;
            const helixSide = i % 2 === 0 ? 1 : -1;
            const r1 = 1.8;
            state1Positions[i3] = Math.cos(theta1) * r1 * helixSide;
            state1Positions[i3 + 1] = ((i / particleCount) - 0.5) * 12.0;
            state1Positions[i3 + 2] = Math.sin(theta1) * r1 * helixSide;

            // State 2: Data Highway (Plane)
            state2Positions[i3] = ((i % 40) - 20) * 0.5;
            state2Positions[i3 + 1] = Math.sin(i * 0.05) * 0.8;
            state2Positions[i3 + 2] = (Math.floor(i / 40) - 25) * 0.4;

            // State 3: Constellation Grid
            state3Positions[i3] = (Math.random() - 0.5) * 16.0;
            state3Positions[i3 + 1] = (Math.random() - 0.5) * 16.0;
            state3Positions[i3 + 2] = (Math.random() - 0.5) * 16.0;

            // State 4: Centered Project Sphere
            const u = Math.random();
            const v = Math.random();
            const theta4 = u * 2.0 * Math.PI;
            const phi4 = Math.acos(2.0 * v - 1.0);
            const r4 = 2.0 + Math.random() * 0.8;
            state4Positions[i3] = r4 * Math.sin(phi4) * Math.cos(theta4);
            state4Positions[i3 + 1] = r4 * Math.sin(phi4) * Math.sin(theta4);
            state4Positions[i3 + 2] = r4 * Math.cos(phi4);

            // State 5: Imploding Black Hole
            const theta5 = (i / particleCount) * Math.PI * 60;
            const r5 = Math.pow(i / particleCount, 2.0) * 6.0;
            state5Positions[i3] = Math.cos(theta5) * r5;
            state5Positions[i3 + 1] = (Math.random() - 0.5) * 1.5 - r5 * 0.5;
            state5Positions[i3 + 2] = Math.sin(theta5) * r5;

            // Set initial positions (State 0)
            posArray[i3] = state0Positions[i3];
            posArray[i3 + 1] = state0Positions[i3 + 1];
            posArray[i3 + 2] = state0Positions[i3 + 2];
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

        // Shader styling for holographic dust
        const material = new THREE.PointsMaterial({
            size: 0.04,
            color: 0x06b6d4,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        const particleSystem = new THREE.Points(geometry, material);
        scene.add(particleSystem);

        // Post-Processing Composer (UnrealBloom)
        const composer = new THREE.EffectComposer(renderer);
        composer.addPass(new THREE.RenderPass(scene, camera));

        const bloomPass = new THREE.UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.2, // strength
            0.5, // radius
            0.15 // threshold
        );
        composer.addPass(bloomPass);

        // Window Resizing
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            composer.setSize(window.innerWidth, window.innerHeight);
        });

        // Expose state objects for animation controls
        this.webgl = {
            scene,
            camera,
            renderer,
            composer,
            nodeMesh,
            particleSystem,
            particleCount,
            states: [
                state0Positions,
                state1Positions,
                state2Positions,
                state3Positions,
                state4Positions,
                state5Positions
            ],
            currentMorphIndex: 0,
            morphProgress: 0.0
        };

        // Render Tick
        let clock = new THREE.Clock();
        const tick = () => {
            const delta = clock.getDelta();
            const elapsed = clock.getElapsedTime();

            // Constant floating rotations
            nodeMesh.rotation.y = elapsed * 0.15;
            nodeMesh.rotation.x = elapsed * 0.1;
            particleSystem.rotation.y = elapsed * 0.02;

            // Interleaved particle morph logic
            const currentPositions = particleSystem.geometry.attributes.position.array;
            const stateIdx = Math.min(Math.max(Math.floor(this.webgl.morphProgress), 0), 4);
            const ratio = this.webgl.morphProgress % 1.0;
            const fromState = this.webgl.states[stateIdx];
            const toState = this.webgl.states[stateIdx + 1];

            if (fromState && toState) {
                for (let i = 0; i < this.webgl.particleCount * 3; i++) {
                    const fromVal = fromState[i];
                    const toVal = toState[i];
                    // Dynamic lerp based on GSAP scroll animation index
                    currentPositions[i] = fromVal + (toVal - fromVal) * ratio;
                }
                particleSystem.geometry.attributes.position.needsUpdate = true;
            }

            // Pulse bloom threshold based on time
            bloomPass.strength = 1.0 + Math.sin(elapsed * 2) * 0.15;

            composer.render();
            requestAnimationFrame(tick);
        };
        tick();
    },

    /* --- GSAP SCROLLTRIGGERS AND MORPHS --- */
    setupScrollTriggers() {
        if (!this.webgl) return;

        // Map page scroll range to the 3D particle morph stages
        gsap.to(this.webgl, {
            morphProgress: 5.0, // Ranges 0 to 5 for the 6 states
            ease: 'none',
            scrollTrigger: {
                trigger: '.story-container',
                start: 'top top',
                end: 'bottom bottom',
                scrub: 1.5
            }
        });

        // Position camera adjustments on scroll
        gsap.to(this.webgl.camera.position, {
            z: 6,
            ease: 'none',
            scrollTrigger: {
                trigger: '#projects',
                start: 'top bottom',
                end: 'bottom top',
                scrub: true
            }
        });

        // GSAP: Reveal headings and text word by word
        const revealElements = document.querySelectorAll('.reveal-up');
        revealElements.forEach(el => {
            gsap.fromTo(el,
                { y: 50, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1.2,
                    ease: 'power4.out',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 85%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        });

        // Pin navigation link highlights based on scroll position
        const navLinks = document.querySelectorAll('.nav-links a');
        const sections = document.querySelectorAll('section');

        window.addEventListener('scroll', () => {
            let currentSec = '';
            sections.forEach(sec => {
                const secTop = sec.offsetTop;
                if (window.scrollY >= secTop - 250) {
                    currentSec = sec.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSec}`) {
                    link.classList.add('active');
                }
            });
        });
    },

    /* --- SKILLS VISUAL REVEAL --- */
    setupSkillsAnimation() {
        const tracks = document.querySelectorAll('.skill-progress');
        tracks.forEach(track => {
            const targetWidth = track.getAttribute('data-width');
            ScrollTrigger.create({
                trigger: track,
                start: 'top 90%',
                onEnter: () => {
                    track.style.width = targetWidth;
                }
            });
        });
    },

    /* --- LITE TYPEWRITER HUD --- */
    setupTypewriter() {
        const element = document.getElementById('typewriter');
        if (!element) return;

        const phrases = [
            "React Native Architectures.",
            "Full-Stack Web Systems.",
            "Optimized Relational Schemes.",
            "Holographic User Interfaces."
        ];
        
        let phraseIdx = 0;
        let charIdx = 0;
        let isDeleting = false;

        const typeAction = () => {
            const current = phrases[phraseIdx];
            if (isDeleting) {
                element.textContent = current.substring(0, charIdx - 1);
                charIdx--;
            } else {
                element.textContent = current.substring(0, charIdx + 1);
                charIdx++;
            }

            let speed = isDeleting ? 40 : 80;
            if (!isDeleting && charIdx === current.length) {
                speed = 2200; // Pause at end of phrase
                isDeleting = true;
            } else if (isDeleting && charIdx === 0) {
                isDeleting = false;
                phraseIdx = (phraseIdx + 1) % phrases.length;
                speed = 400; // Brief pause before typing next
            }
            setTimeout(typeAction, speed);
        };
        typeAction();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});