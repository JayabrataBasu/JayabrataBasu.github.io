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

  /* Skills sphere (delay init to avoid measuring before CSS grid finalizes) */
  const initSphere = () => {
    const container = document.getElementById('tech-sphere');
    if (!container || typeof createIconSphere !== 'function' || typeof techStackIcons === 'undefined') return;
    // Avoid re-init
    if (container.__sphereInitialized) return;
    const rect = container.getBoundingClientRect();
    // If width still too small, retry (race with layout)
    if (rect.width < 100 && initSphere._tries < 20) {
      initSphere._tries++;
      return setTimeout(initSphere, 50);
    }
    // Compute desired size BEFORE creating sphere so internal layout uses final dims
    const applySizing = () => {
      const wrapper = container.closest('.sphere-wrapper');
      const wrapperW = wrapper?.clientWidth || 0;
      const base = Math.min(wrapperW || 600, window.innerHeight * 0.65, 520);
      const size = Math.max(340, Math.round(base));
      container.style.width = size + 'px';
      container.style.height = size + 'px';
      if (wrapper && wrapper.classList.contains('orb-left')) {
        container.style.transform = 'translate(130%,-100%)';
      } else {
        container.style.transform = 'translate(-52%, -54%)';
      }
    };
    applySizing();
    container.__sphereInitialized = true;
    createIconSphere(container, techStackIcons);
    // Re-apply sizing on resize (debounced)
    let resizeTimer;
    window.addEventListener('resize', () => {
      if (!container.__sphereInitialized) return;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        applySizing();
        // Optional: if sphere.js exposes a resize method, call it here
        if (typeof container.__sphereResize === 'function') container.__sphereResize();
      }, 120);
    });
  };
  initSphere._tries = 0;
  // Two rAFs + timeout to push after layout & potential font loading adjustments
  requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(initSphere, 60)));
});

// Expose for sphere.js if needed
window.__portfolio = { version: '1.0.0' };
