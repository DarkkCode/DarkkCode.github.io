// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

/* ==========================================
   PART 1: THREE.JS 3D SCENE SETUP
   ========================================== */
const canvasContainer = document.getElementById('canvas-container');

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); // alpha: true makes bg transparent
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
canvasContainer.appendChild(renderer.domElement);

// Create the "Digital Core" (A central gem with an outer ring)
const coreGroup = new THREE.Group();
scene.add(coreGroup);

// The Inner Core (Icosahedron)
const innerGeometry = new THREE.IcosahedronGeometry(1.5, 0);
const innerMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xff512f, 
    wireframe: true,
    transparent: true,
    opacity: 0.8
});
const innerCore = new THREE.Mesh(innerGeometry, innerMaterial);
coreGroup.add(innerCore);

// The Outer Data Ring (Torus)
const ringGeometry = new THREE.TorusGeometry(2.5, 0.05, 16, 100);
const ringMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xdd2476,
    transparent: true,
    opacity: 0.5
});
const dataRing = new THREE.Mesh(ringGeometry, ringMaterial);
dataRing.rotation.x = Math.PI / 2;
coreGroup.add(dataRing);

// Positioning Camera
camera.position.z = 6;

// Constant ambient rotation (happens even when not scrolling)
function animate() {
    requestAnimationFrame(animate);
    innerCore.rotation.y += 0.005;
    innerCore.rotation.x += 0.002;
    dataRing.rotation.z -= 0.003;
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
   PART 2: GSAP SCROLL-SCRUBBING ANIMATION
   ========================================== */

// Make the HTML text sections fade in as you scroll to them
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
                start: "top 60%", // Triggers when section is 60% down the screen
                end: "bottom 20%",
                toggleActions: "play reverse play reverse" // Fades out if you scroll past it
            }
        }
    );
});

// THE MAGIC: Tie the 3D Core to the Scroll Wheel!

// 1. Home to About: Move Core to the Right
gsap.to(coreGroup.position, {
    x: 3, // Move 3 units right
    y: 0,
    z: -1, // Push back slightly
    ease: "none",
    scrollTrigger: {
        trigger: "#about",
        start: "top bottom",
        end: "top center",
        scrub: true // THIS connects it strictly to the scroll wheel
    }
});
// Also rotate the ring wildly
gsap.to(dataRing.rotation, {
    x: Math.PI,
    ease: "none",
    scrollTrigger: {
        trigger: "#about",
        start: "top bottom",
        end: "top center",
        scrub: true
    }
});

// 2. About to Certs: Move Core to the Left
gsap.to(coreGroup.position, {
    x: -3, // Move 3 units left
    ease: "none",
    scrollTrigger: {
        trigger: "#certs",
        start: "top bottom",
        end: "top center",
        scrub: true
    }
});

// 3. Certs to Projects: Move Core to Center and Scale Up MASSIVELY
gsap.to(coreGroup.position, {
    x: 0,
    z: 2, // Pull it closer to the camera
    ease: "none",
    scrollTrigger: {
        trigger: "#projects",
        start: "top bottom",
        end: "center center",
        scrub: true
    }
});
gsap.to(coreGroup.scale, {
    x: 3,
    y: 3,
    z: 3,
    ease: "none",
    scrollTrigger: {
        trigger: "#projects",
        start: "top bottom",
        end: "center center",
        scrub: true
    }
});

/* ==========================================
   PART 3: TYPEWRITER EFFECT
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