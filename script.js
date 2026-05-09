gsap.registerPlugin(ScrollTrigger);

/* ==========================================
   PART 1: THE HOLOGRAPHIC PARTICLE SCENE
   ========================================== */
const canvasContainer = document.getElementById('canvas-container');

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050505, 0.12);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 6;

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
canvasContainer.appendChild(renderer.domElement);

// We create TWO groups. 
// parallaxGroup listens ONLY to the mouse.
// masterGroup listens ONLY to the scroll wheel. (This prevents them from fighting!)
const parallaxGroup = new THREE.Group();
scene.add(parallaxGroup);

const masterGroup = new THREE.Group();
parallaxGroup.add(masterGroup);

// --- 1. The Holographic Core ---
const coreGeometry = new THREE.TorusKnotGeometry(1.2, 0.4, 300, 40);
const coreMaterial = new THREE.PointsMaterial({ 
    size: 0.025, 
    color: 0xff512f, 
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending 
});
const coreMesh = new THREE.Points(coreGeometry, coreMaterial);
masterGroup.add(coreMesh);

// --- 2. The Outer Data Ring ---
const ringGeom = new THREE.TorusGeometry(3, 0.1, 30, 200);
const ringMat = new THREE.PointsMaterial({ 
    size: 0.02, 
    color: 0xdd2476, 
    transparent: true, 
    blending: THREE.AdditiveBlending 
});
const ringMesh = new THREE.Points(ringGeom, ringMat);
ringMesh.rotation.x = Math.PI / 2;
masterGroup.add(ringMesh);

// --- 3. The Stardust Background ---
const particlesGeom = new THREE.BufferGeometry();
const particlesCount = 3500;
const posArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 25; 
}
particlesGeom.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMat = new THREE.PointsMaterial({
    size: 0.03,
    color: 0xffaa00,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending
});
const particlesMesh = new THREE.Points(particlesGeom, particlesMat);
parallaxGroup.add(particlesMesh); 


/* ==========================================
   PART 2: HIGH-RESPONSIVE MOUSE PARALLAX
   ========================================== */
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
});

const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Constant ambient floating
    coreMesh.rotation.y += 0.002;
    coreMesh.rotation.x += 0.001;
    ringMesh.rotation.z -= 0.002;
    particlesMesh.rotation.y = elapsedTime * 0.015; 

    // Flawless Mouse Tracking: We physically tilt the entire scene
    targetX = mouseX * 0.001;
    targetY = mouseY * 0.001;
    
    // Lerp makes it buttery smooth
    parallaxGroup.rotation.y += (targetX - parallaxGroup.rotation.y) * 0.05;
    parallaxGroup.rotation.x += (targetY - parallaxGroup.rotation.x) * 0.05;

    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


/* ==========================================
   PART 3: THE MASTER SCROLL TIMELINE (Zero Snap)
   ========================================== */

// 1. Text Fade-ins (Kept separate so they trigger as you reach them)
const textSections = gsap.utils.toArray('.text-content');
textSections.forEach(section => {
    gsap.fromTo(section, 
        { autoAlpha: 0, y: 40 }, 
        { 
            autoAlpha: 1, 
            y: 0, 
            duration: 1.5, 
            ease: "power2.out",
            scrollTrigger: {
                trigger: section,
                start: "top 75%", 
                end: "bottom 25%",
                toggleActions: "play reverse play reverse"
            }
        }
    );
});

// 2. The 1:1 Scroll Master Timeline (This completely fixes the snapping)
const masterTl = gsap.timeline({
    scrollTrigger: {
        trigger: ".story-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 2 // Heavy, lag-free momentum
    }
});

// Sequence 1: Home to About
masterTl.to(masterGroup.position, { x: 2.8, z: -1.5, ease: "power1.inOut" }, 0)
        .to(coreMesh.rotation, { z: Math.PI, ease: "power1.inOut" }, 0);

// Sequence 2: About to Certs
masterTl.to(masterGroup.position, { x: -2.8, z: -1.5, ease: "power1.inOut" }, 1)
        .to(coreMaterial.color, { r: 0.6, g: 0.1, b: 0.9, ease: "power1.inOut" }, 1);

// Sequence 3: Certs to Projects (The Breathtaking Zoom)
masterTl.to(masterGroup.position, { x: 0, z: 4.2, ease: "power2.inOut" }, 2)
        .to(masterGroup.rotation, { x: Math.PI / 2, ease: "power2.inOut" }, 2);

// Sequence 4: Projects to Contact (Sinks away cleanly)
masterTl.to(masterGroup.position, { y: -5, z: 0, ease: "power1.inOut" }, 3);


/* ==========================================
   PART 4: TYPEWRITER EFFECT
   ========================================== */
const textElement = document.getElementById('typewriter');
const phrases = ["Laravel Developer.", "CS Student.", "Logic Builder."];
let phraseIndex = 0; let charIndex = 0; let isDeleting = false;

function type() {
    const currentPhrase = phrases[phraseIndex];
    if (isDeleting) {
        textElement.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
    } else {
        textElement.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
    }
    let typeSpeed = isDeleting ? 50 : 100;
    if (!isDeleting && charIndex === currentPhrase.length) {
        typeSpeed = 2000; isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false; phraseIndex = (phraseIndex + 1) % phrases.length; typeSpeed = 500;
    }
    setTimeout(type, typeSpeed);
}
document.addEventListener('DOMContentLoaded', type);