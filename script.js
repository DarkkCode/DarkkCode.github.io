// 1. Initialize 3D Cyber Network Background (Vanta/Three.js)
VANTA.NET({
  el: "#vanta-bg",
  mouseControls: true,
  touchControls: true,
  gyroControls: false,
  minHeight: 200.00,
  minWidth: 200.00,
  scale: 1.00,
  scaleMobile: 1.00,
  color: 0xff512f,      // Matches your primary red/orange
  backgroundColor: 0x070709, // Matches your dark bg
  points: 12.00,        // Density of the network
  maxDistance: 22.00,   // Line connection distance
  spacing: 18.00        // Space between nodes
});

// 2. Initialize GSAP Scroll Animations
gsap.registerPlugin(ScrollTrigger);

// Hero Section Entrance Animation
gsap.from(".hero-content > *", {
    y: 50,
    opacity: 0,
    duration: 1,
    stagger: 0.2,
    ease: "power3.out",
    delay: 0.2
});

// Scroll Reveal for all Glass Cards
const gsapCards = gsap.utils.toArray('.gsap-card');
gsapCards.forEach(card => {
    gsap.fromTo(card, 
        { 
            y: 100, 
            opacity: 0, 
            rotationX: -10, // Slight 3D rotation on entrance
            autoAlpha: 0 
        },
        {
            y: 0,
            opacity: 1,
            rotationX: 0,
            autoAlpha: 1,
            duration: 1.2,
            ease: "power4.out",
            scrollTrigger: {
                trigger: card,
                start: "top 85%", // Triggers when the top of the card hits 85% down the screen
                toggleActions: "play none none reverse" // Plays on scroll down, reverses on scroll up
            }
        }
    );
});

// Scroll Reveal for Titles
const sectionTitles = gsap.utils.toArray('.section-title');
sectionTitles.forEach(title => {
    gsap.fromTo(title,
        { x: -50, opacity: 0, autoAlpha: 0 },
        {
            x: 0, opacity: 1, autoAlpha: 1, duration: 1, ease: "power3.out",
            scrollTrigger: {
                trigger: title,
                start: "top 90%"
            }
        }
    );
});

// 3. Typewriter Effect Logic
const textElement = document.getElementById('typewriter');
const phrases = ["Laravel Developer", "CS Student", "Backend Engineer", "Tech Enthusiast"];
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;

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
        typeSpeed = 2000;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typeSpeed = 500;
    }

    setTimeout(type, typeSpeed);
}

// 4. UNIVERSAL PORTFOLIO LIGHTBOX (Zoom)
function openPortfolioLightbox(imageSrc) {
    const overlay = document.getElementById('portfolioLightboxOverlay');
    const lightboxImage = document.getElementById('portfolioLightboxImage');
    
    lightboxImage.src = imageSrc;
    overlay.style.display = 'flex'; 
    document.body.style.overflow = 'hidden';
}

function closePortfolioLightbox() {
    const overlay = document.getElementById('portfolioLightboxOverlay');
    overlay.style.display = 'none';
    document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', type);