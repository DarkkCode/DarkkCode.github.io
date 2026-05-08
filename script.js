// 1. Initialize Animation on Scroll (AOS)
AOS.init({
    duration: 1000, // Animation speed
    once: true      // Animation happens only once
});

// 2. Typewriter Effect Logic
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
        typeSpeed = 2000; // Pause at end of phrase
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typeSpeed = 500; // Pause before new phrase
    }

    setTimeout(type, typeSpeed);
}

// 3. UNIVERSAL PORTFOLIO LIGHTBOX (Zoom) FUNCTIONS
// Opens the full-screen lightbox and sets the image source
function openPortfolioLightbox(imageSrc) {
    const overlay = document.getElementById('portfolioLightboxOverlay');
    const lightboxImage = document.getElementById('portfolioLightboxImage');
    
    lightboxImage.src = imageSrc;
    overlay.style.display = 'flex'; // Uses flex for centering
    
    // Prevent scrolling behind the overlay
    document.body.style.overflow = 'hidden';
}

// Closes the full-screen lightbox
function closePortfolioLightbox() {
    const overlay = document.getElementById('portfolioLightboxOverlay');
    
    overlay.style.display = 'none';
    
    // Restore scrolling
    document.body.style.overflow = '';
}

// Start typing on load
document.addEventListener('DOMContentLoaded', type);