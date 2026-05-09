gsap.registerPlugin(ScrollTrigger);

/* ==========================================
   PART 1: THE HOLOGRAPHIC PARTICLE SCENE
   ========================================== */
const canvasContainer = document.getElementById('canvas-container');

const scene = new THREE.Scene();
// Deep fog fades out the distant stars
scene.fog = new THREE.FogExp2(0x050505, 0.12);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 6;

// High-performance WebGL renderer
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Stops lag on high-res monitors
canvasContainer.appendChild(renderer.domElement);

const masterGroup = new THREE.Group();
scene.add(masterGroup);

// --- 1. The Holographic Core (Made of 12,000 glowing dots!) ---
const coreGeometry = new THREE.TorusKnotGeometry(1.2, 0.4, 300, 40);
const coreMaterial = new THREE.PointsMaterial({ 
    size: 0.025, 
    color: 0xff512f, 
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending // Makes the dots glow intensely when they overlap
});
const coreMesh = new THREE.Points(coreGeometry, coreMaterial);
masterGroup.add(coreMesh);

// --- 2. The Outer Data Ring (Also glowing dots) ---
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
scene.add(particlesMesh); // Added to scene so it surrounds the camera


/* ==========================================
   PART 2: BUTTERY-SMOOTH MOUSE ENGINE
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

    // Smooth Camera Glide (Interpolation)
    targetX = mouseX * 0.0015;
    targetY = mouseY * 0.0015;
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (-targetY - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


/* ==========================================
   PART 3: FLAWLESS SCROLL SCRUBBING
   ========================================== */

// 1. Smooth Text Fade-ins (Fixed trigger points so it doesn't snap)
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
                start: "top 75%", // Triggers nicely as it enters the bottom of the screen
                end: "bottom 25%",
                toggleActions: "play reverse play reverse"
            }
        }
    );
});

// 2. The 3D Object Timeline
const scrubSpeed = 2.5; // High scrub value = heavy, cinematic, lag-free momentum

// Home to About
gsap.to(masterGroup.position, {
    x: 2.8,
    z: -1.5,
    ease: "sine.inOut",
    scrollTrigger: { trigger: "#about", start: "top bottom", end: "center center", scrub: scrubSpeed }
});
gsap.to(coreMesh.rotation, {
    z: Math.PI,
    ease: "sine.inOut",
    scrollTrigger: { trigger: "#about", start: "top bottom", end: "center center", scrub: scrubSpeed }
});

// About to Certs
gsap.to(masterGroup.position, {
    x: -2.8,
    ease: "sine.inOut",
    scrollTrigger: { trigger: "#certs", start: "top bottom", end: "center center", scrub: scrubSpeed }
});
// Smooth color transition to deep purple
gsap.to(coreMaterial.color, {
    r: 0.6, g: 0.1, b: 0.9,
    scrollTrigger: { trigger: "#certs", start: "top bottom", end: "center center", scrub: scrubSpeed }
});

// Certs to Projects (THE BREATHTAKING ZOOM)
// It moves to the center, flips 90 degrees like a portal, and pushes RIGHT into the camera
gsap.to(masterGroup.position, {
    x: 0,
    z: 4.8, // Pushes it extremely close to the camera lens
    ease: "power2.inOut",
    scrollTrigger: { trigger: "#projects", start: "top bottom", end: "center center", scrub: scrubSpeed }
});
gsap.to(masterGroup.rotation, {
    x: Math.PI / 2, // Flips it flat
    ease: "power2.inOut",
    scrollTrigger: { trigger: "#projects", start: "top bottom", end: "center center", scrub: scrubSpeed }
});

// Projects to Contact (Sinks into the abyss)
gsap.to(masterGroup.position, {
    y: -5,
    z: 0,
    ease: "sine.inOut",
    scrollTrigger: { trigger: "#contact", start: "top bottom", end: "center center", scrub: scrubSpeed }
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