// Main interactive scripts
document.addEventListener('DOMContentLoaded', () => {
  /* Typewriter */
  const roles = [
    'Software Engineer',
    'Systems Enthusiast',
    'Machine Learning Explorer',
    'Fintech Builder',
  ];
  let typeIndex = 0, charIndex = 0, deleting = false;
  const speed = { type: 65, delete: 40, hold: 1400 };
  const el = document.getElementById('typewriter-text');
  function cycle() {
    if (!el) return;
    const current = roles[typeIndex];
    if (!deleting) {
      el.textContent = current.slice(0, ++charIndex);
      if (charIndex === current.length) { deleting = true; setTimeout(cycle, speed.hold); return; }
    } else {
      el.textContent = current.slice(0, --charIndex);
      if (charIndex === 0) { deleting = false; typeIndex = (typeIndex + 1) % roles.length; }
    }
    setTimeout(cycle, deleting ? speed.delete : speed.type);
  }
  cycle();

  /* Mobile nav */
  const burger = document.querySelector('.hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      const expanded = burger.getAttribute('aria-expanded') === 'true';
      burger.classList.toggle('active');
      burger.setAttribute('aria-expanded', String(!expanded));
      mobileMenu.classList.toggle('active');
      mobileMenu.hidden = false; // ensure available for animation
    });
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      burger.classList.remove('active');
      burger.setAttribute('aria-expanded', 'false');
      mobileMenu.classList.remove('active');
      setTimeout(()=>{ if(!mobileMenu.classList.contains('active')) mobileMenu.hidden = true; }, 600);
    }));
  }

  /* Scroll reveal (simple) */
  const revealEls = document.querySelectorAll('.reveal-on-scroll');
  const handleReveal = () => {
    const vp = window.innerHeight;
    revealEls.forEach(el => {
      const top = el.getBoundingClientRect().top;
      if (top < vp - 120) el.classList.add('active');
    });
  };
  window.addEventListener('scroll', handleReveal, { passive: true });
  handleReveal();

  /* Project filtering */
  const grid = document.getElementById('projects-grid');
  const search = document.getElementById('project-search');
  const filters = document.querySelectorAll('.tag-filter');
  function applyFilters() {
    if (!grid) return;
    const term = (search?.value || '').trim().toLowerCase();
    const active = document.querySelector('.tag-filter.active')?.getAttribute('data-tag') || 'all';
    grid.querySelectorAll('.project-card').forEach(card => {
      const tags = card.getAttribute('data-tags') || '';
      const text = card.textContent?.toLowerCase() || '';
      const tagMatch = active === 'all' || tags.includes(active);
      const termMatch = !term || text.includes(term);
      card.style.display = tagMatch && termMatch ? '' : 'none';
    });
  }
  filters.forEach(btn => btn.addEventListener('click', () => {
    filters.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    applyFilters();
  }));
  search?.addEventListener('input', applyFilters);

  /* Year */
  const yearSpan = document.querySelector('.year');
  if (yearSpan) yearSpan.textContent = String(new Date().getFullYear());

  /* Sphere tooltip bridge (icons MUST set data-skill attr from sphere.js) */
  const tooltip = document.getElementById('skill-tooltip');
  if (tooltip) {
    document.addEventListener('mousemove', e => {
      if (!tooltip.hasAttribute('hidden')) {
        tooltip.style.left = e.pageX + 'px';
        tooltip.style.top = e.pageY + 'px';
      }
    });
  }
  window.__showSkillTooltip = (label, x, y) => {
    if (!tooltip) return; 
    tooltip.textContent = label; 
    tooltip.hidden = false; 
  };
  window.__hideSkillTooltip = () => { if (tooltip) tooltip.hidden = true; };

  /* Scroll reactive background gradient */
  const scrollGradient = document.querySelector('.scroll-gradient');
  let lastShift = -1;
  const onScrollBG = () => {
    if (!scrollGradient) return;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    if (docH <= 0) return;
    const p = window.scrollY / docH; // 0..1
    const shift = p < 0.25 ? 0 : p < 0.5 ? 1 : p < 0.75 ? 2 : 3;
    if (shift !== lastShift) {
      scrollGradient.classList.remove('shift-1','shift-2','shift-3');
      if (shift>0) scrollGradient.classList.add(`shift-${shift}`);
      lastShift = shift;
    }
  };
  document.addEventListener('scroll', onScrollBG, { passive:true });
  onScrollBG();
});

// Expose for sphere.js if needed
window.__portfolio = { version: '1.0.0' };
