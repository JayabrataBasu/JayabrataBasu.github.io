// Scroll Reveal
function reveal() {
  const reveals = document.querySelectorAll('.reveal');
  
  reveals.forEach(element => {
      const windowHeight = window.innerHeight;
      const elementTop = element.getBoundingClientRect().top;
      const elementVisible = 150;
      
      if (elementTop < windowHeight - elementVisible) {
          element.classList.add('active');
      }
  });
}

window.addEventListener('scroll', reveal);

// Typewriter Effect
class TypewriterEffect {
    constructor(element, words, speed = 100, deleteSpeed = 50, pauseTime = 2000) {
        this.element = element;
        this.words = words;
        this.speed = speed;
        this.deleteSpeed = deleteSpeed;
        this.pauseTime = pauseTime;
        this.currentWordIndex = 0;
        this.currentCharIndex = 0;
        this.isDeleting = false;
        
        this.type();
    }
    
    type() {
        const currentWord = this.words[this.currentWordIndex];
        
        if (this.isDeleting) {
            this.element.textContent = currentWord.substring(0, this.currentCharIndex - 1);
            this.currentCharIndex--;
        } else {
            this.element.textContent = currentWord.substring(0, this.currentCharIndex + 1);
            this.currentCharIndex++;
        }
        
        let typeSpeed = this.isDeleting ? this.deleteSpeed : this.speed;
        
        if (!this.isDeleting && this.currentCharIndex === currentWord.length) {
            typeSpeed = this.pauseTime;
            this.isDeleting = true;
        } else if (this.isDeleting && this.currentCharIndex === 0) {
            this.isDeleting = false;
            this.currentWordIndex = (this.currentWordIndex + 1) % this.words.length;
            typeSpeed = 500;
        }
        
        setTimeout(() => this.type(), typeSpeed);
    }
}

// Loader
window.addEventListener('load', () => {
  document.body.style.overflow = 'hidden';
  setTimeout(() => {
      document.body.style.overflow = 'auto';
  }, 2500);
});

// Initialize Typewriter Effect
document.addEventListener('DOMContentLoaded', () => {
    const typewriterElement = document.getElementById('typewriter-text');
    if (typewriterElement) {
        const words = [
            "I build stuff I think is cool!",
            "I create innovative solutions.",
            "I love machine learning & finance.",
            "I develop full-stack applications."
        ];
        new TypewriterEffect(typewriterElement, words);
    }
    
    // Initialize Project Filter
    initProjectFilter();
});

// Project Filter Functionality
function initProjectFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Filter projects
            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                if (filter === 'all' || category === filter) {
                    card.style.display = 'grid';
                    card.style.opacity = '0';
                    setTimeout(() => {
                        card.style.opacity = '1';
                    }, 100);
                } else {
                    card.style.opacity = '0';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');

if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
    });
}
