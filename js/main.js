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

// Loader
window.addEventListener('load', () => {
  document.body.style.overflow = 'hidden';
  setTimeout(() => {
      document.body.style.overflow = 'auto';
  }, 2500);
});

// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  mobileMenu.classList.toggle('active');
});
