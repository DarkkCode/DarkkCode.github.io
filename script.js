gsap.registerPlugin(ScrollTrigger);

/* ==========================================
   PART 1: THREE.JS "QUANTUM CORE" SCENE
   ========================================== */
const canvasContainer = document.getElementById('canvas-container');

const scene = new THREE.Scene();
// Add subtle fog to make distant particles fade beautifully
scene.fog = new THREE.FogExp2(0x050505, 0.15);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
canvasContainer.appendChild(renderer.domElement);

// --- THE MASTER GROUP ---
const masterGroup = new THREE.Group();
scene.add(masterGroup);

// --- 1. The Core (Complex Torus Knot) ---
const coreGeometry = new THREE.TorusKnotGeometry(1.2, 0.4, 150, 20);
const coreMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xff512f, 
    wireframe: true,
    transparent: true,
    opacity: 0.6
});
const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
masterGroup.add(coreMesh);

// --- 2. The Inner Orbiting Ring ---
const ringGeom = new THREE.TorusGeometry(2.8, 0.02, 16, 100);
const ringMat = new THREE.MeshBasicMaterial({ color: 0xdd2476, transparent: true, opacity: 0.5 });
const ringMesh = new THREE.Mesh(ringGeom, ringMat);
ringMesh.rotation.x = Math.PI / 2;
masterGroup.add(ringMesh);

// --- 3. The Particle Galaxy (3,000 dots) ---
const particlesGeom = new THREE.BufferGeometry();
const particlesCount = 3000;
const posArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++) {
    // Spread particles randomly in a large area
    posArray[i] = (Math.random() - 0.5) * 20; 
}
particlesGeom.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMat = new THREE.PointsMaterial({
    size: 0.03,
    color: 0xffaa00,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending // Makes them glow when overlapping
});
const particlesMesh = new THREE.Points(particlesGeom, particlesMat);
masterGroup.add(particlesMesh);

// Initial Camera Position
camera.position.z = 6;


/* ==========================================
   PART 2: MOUSE PARALLAX ENGINE (The Fix!)
   ========================================== */
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
    // Calculate mouse position relative to center of screen
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
});

// The Animation Loop
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // 1. Ambient Rotations (Always spinning slightly)
    coreMesh.rotation.y += 0.005;
    coreMesh.rotation.x += 0.002;
    ringMesh.rotation.z -= 0.005;
    particlesMesh.rotation.y = elapsedTime * 0.05; // Galaxy spins slowly

    // 2. Smooth Mouse Tracking (Camera Parallax)
    // Camera glides towards mouse position smoothly
    targetX = mouseX * 0.002;
    targetY = mouseY * 0.002;
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (-targetY - camera.position.y) * 0.05;
    camera.lookAt(scene.position); // Always look at the center

    renderer.render(scene, camera);
}
animate();

// Handle Window Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


/* ==========================================
   PART 3: GSAP SCROLL-SCRUBBING
   ========================================== */

// Text Fade-ins
const textSections = gsap.utils.toArray('.text-content');
textSections.forEach(section => {
    gsap.fromTo(section, 
        { autoAlpha: 0, y: 50 }, 
        { 
            autoAlpha: 1, 
            y: 0, 
            duration: 1, 
            scrollTrigger: {
                trigger: section,
                start: "top 60%",
                end: "bottom 20%",
                toggleActions: "play reverse play reverse"
            }
        }
    );
});

// The Scroll Story: Moving the 3D Master Group
// Note: We use scrub: 1 (instead of true) to make the object movement buttery smooth

// 1. Home to About: Push Right, Rotate wildly
gsap.to(masterGroup.position, {
    x: 3,
    z: -2,
    ease: "power1.inOut",
    scrollTrigger: { trigger: "#about", start: "top bottom", end: "top center", scrub: 1 }
});
gsap.to(coreMesh.rotation, {
    z: Math.PI * 2, // Spin a full circle
    scrollTrigger: { trigger: "#about", start: "top bottom", end: "top center", scrub: 1 }
});

// 2. About to Certs: Push Left, Change Core Color
gsap.to(masterGroup.position, {
    x: -3,
    ease: "power1.inOut",
    scrollTrigger: { trigger: "#certs", start: "top bottom", end: "top center", scrub: 1 }
});
// Shift color to a bright pink/purple
gsap.to(coreMaterial.color, {
    r: 0.8, g: 0.1, b: 0.8,
    scrollTrigger: { trigger: "#certs", start: "top bottom", end: "top center", scrub: 1 }
});

// 3. Certs to Projects: Center it, Zoom in close (Explosion effect)
gsap.to(masterGroup.position, {
    x: 0,
    z: 3, // Pull very close to camera
    ease: "power2.inOut",
    scrollTrigger: { trigger: "#projects", start: "top bottom", end: "center center", scrub: 1 }
});
gsap.to(particlesMesh.scale, {
    x: 3, y: 3, z: 3, // Particles explode outward
    scrollTrigger: { trigger: "#projects", start: "top bottom", end: "center center", scrub: 1 }
});

// 4. Projects to Contact: Sink to the bottom
gsap.to(masterGroup.position, {
    y: -3,
    z: 0,
    scrollTrigger: { trigger: "#contact", start: "top bottom", end: "center center", scrub: 1 }
});

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