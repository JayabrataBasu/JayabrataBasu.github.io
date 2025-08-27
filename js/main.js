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

  // Sphere tooltip bridge removed: disables black label box on hover
  window.__showSkillTooltip = () => {};
  window.__hideSkillTooltip = () => {};

  /* Background crossfade layer */
  const bgFader = document.getElementById('bg-fader');

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

  /* THEME TOGGLE + SCROLL-BASED FALLBACK */
  const THEMES = ['theme-1','theme-2','theme-3','theme-4'];
  const LS_KEY = 'user-preferred-theme';
  const body = document.body;
  const toggleBtn = document.getElementById('theme-toggle-btn');
  const resetBtn = document.getElementById('theme-reset-btn');
  const themeMenuTrigger = document.getElementById('theme-menu-trigger');
  const themeMenu = document.getElementById('theme-menu');
  let manualOverride = false;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function applyTheme(theme) {
    // crossfade: duplicate current bg color, then fade out after class swap
    if (bgFader) {
      const prev = getComputedStyle(document.body).backgroundColor;
      bgFader.style.background = prev;
      bgFader.style.opacity = 1;
    }
    THEMES.forEach(t => body.classList.remove(t));
    body.classList.add(theme);
    // Update icon
    if (toggleBtn) {
      const i = toggleBtn.querySelector('i');
      if (i) {
        // Simple icon heuristic
        if (theme === 'theme-2' || theme === 'theme-3') { i.className = 'fa-solid fa-sun'; }
        else { i.className = 'fa-solid fa-moon'; }
      }
      toggleBtn.setAttribute('aria-pressed', String(manualOverride));
      toggleBtn.title = `Theme: ${theme}`;
    }
    // Highlight active theme in menu
    if (themeMenu) {
      themeMenu.querySelectorAll('button[data-theme]').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-theme') === theme);
      });
  }
  if (bgFader) requestAnimationFrame(()=> { bgFader.style.opacity = 0; });
  }

  function cycleTheme() {
    const current = THEMES.find(t => body.classList.contains(t)) || THEMES[0];
    const next = THEMES[(THEMES.indexOf(current)+1) % THEMES.length];
    applyTheme(next);
    localStorage.setItem(LS_KEY, next);
  }

  // On load: check saved preference
  const saved = localStorage.getItem(LS_KEY);
  if (saved && THEMES.includes(saved)) {
    manualOverride = true;
    applyTheme(saved);
  } else {
    // Ensure default theme class present for consistency
    if (!THEMES.some(t => body.classList.contains(t))) body.classList.add(THEMES[0]);
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      manualOverride = true;
      cycleTheme();
  dispatchEvent(new CustomEvent('theme:manual-select'));
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      localStorage.removeItem(LS_KEY);
      manualOverride = false;
      // Reconnect scroll observer by reloading (simplest) or manually re-attaching
      sectionThemeMap.forEach(conf => conf.el && io.observe(conf.el));
      showToast('Auto theme re-enabled');
      dispatchEvent(new CustomEvent('theme:auto-reset'));
    });
  }

  /* Theme menu logic */
  if (themeMenuTrigger && themeMenu) {
    themeMenuTrigger.addEventListener('click', () => {
      const expanded = themeMenuTrigger.getAttribute('aria-expanded') === 'true';
      themeMenuTrigger.setAttribute('aria-expanded', String(!expanded));
      themeMenu.hidden = expanded;
    });
    themeMenu.querySelectorAll('button[data-theme]').forEach(btn => {
      btn.addEventListener('click', () => {
        const th = btn.getAttribute('data-theme');
        if (!th) return;
        manualOverride = true;
        applyTheme(th);
        localStorage.setItem(LS_KEY, th);
        themeMenuTrigger.setAttribute('aria-expanded','false');
        themeMenu.hidden = true;
        showToast(`Theme set: ${th}`);
        dispatchEvent(new CustomEvent('theme:manual-select'));
      });
    });
    document.addEventListener('click', (e) => {
      if (!themeMenu.contains(e.target) && e.target !== themeMenuTrigger) {
        themeMenuTrigger.setAttribute('aria-expanded','false');
        themeMenu.hidden = true;
      }
    });
  }

  // Scroll based theme (only if no manual override)
  const sectionThemeMap = [
    { sel: '#home', theme: 'theme-1' },
    { sel: '#about', theme: 'theme-2' },
    { sel: '#projects', theme: 'theme-3' },
    { sel: '#contact', theme: 'theme-4' }
  ];
  const observedSections = [];
  // Improved scroll theme mapping via midpoint calculation fallback (still using observer for perf)
  const options = { root: null, threshold: 0.25 };
  let activeScrollTheme = null;
  const io = new IntersectionObserver(entries => {
    if (manualOverride) return;
    // Determine which section midpoint is closest to viewport center
    const center = window.innerHeight / 2;
    let best; let bestDelta = Infinity;
    sectionThemeMap.forEach(conf => {
      if (!conf.el) return;
      const rect = conf.el.getBoundingClientRect();
      const mid = rect.top + rect.height/2;
      const delta = Math.abs(mid - center);
      if (delta < bestDelta) { bestDelta = delta; best = conf; }
    });
    if (best && best.theme !== activeScrollTheme) {
      activeScrollTheme = best.theme;
      applyTheme(best.theme);
    }
  }, options);
  sectionThemeMap.forEach(conf => {
    const el = document.querySelector(conf.sel);
    if (el) { conf.el = el; io.observe(el); observedSections.push(el); }
  });
  // If manual override happens later, disconnect observer
  const manualCheckInterval = setInterval(() => {
    if (manualOverride) { io.disconnect(); clearInterval(manualCheckInterval); }
  }, 1000);

  /* ABOUT PANELS STAGGERED REVEAL */
  // About panels removed; terminal stack static reveal (optional future animation)
  const aboutPanels = document.querySelectorAll('.mini-terminal');
  aboutPanels.forEach((p,i)=> { p.style.opacity=0; p.style.transform='translateY(20px)'; setTimeout(()=> { p.style.transition='opacity .8s ease, transform .8s cubic-bezier(.16,.84,.44,1)'; p.style.opacity=1; p.style.transform='translateY(0)'; }, 120 + i*90); });

  /* Cursor ring */
  const cursorRing = document.getElementById('cursor-ring');
  if (cursorRing) {
    let xr=0, yr=0, tx=0, ty=0; let raf;
    const animate = () => { xr += (tx - xr)*0.18; yr += (ty - yr)*0.18; cursorRing.style.transform = `translate(${xr}px,${yr}px) translate(-50%,-50%)`; raf = requestAnimationFrame(animate); };
    document.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; if (!body.classList.contains('cursor-active')) body.classList.add('cursor-active'); });
    animate();
    document.addEventListener('mousedown', ()=> cursorRing.style.transform += ' scale(.8)');
    document.addEventListener('mouseup', ()=> cursorRing.style.transform += '');
  }

  /* Toast helper */
  function showToast(msg) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'toast';
    div.textContent = msg;
    container.appendChild(div);
    setTimeout(()=> div.remove(), 4500);
  }

  /* Keyboard shortcuts */
  document.addEventListener('keydown', e => {
    if (e.target && ['INPUT','TEXTAREA'].includes(e.target.tagName)) return;
    if (e.key.toLowerCase() === 't' && !e.shiftKey) {
      manualOverride = true; cycleTheme(); showToast('Theme cycled');
    } else if (e.key.toLowerCase() === 't' && e.shiftKey) {
      localStorage.removeItem(LS_KEY); manualOverride = false; showToast('Auto theme re-enabled'); sectionThemeMap.forEach(conf => conf.el && io.observe(conf.el));
    }
  });

  /* Project & paper reveal */
  const cards = document.querySelectorAll('.project-card, .paper-card');
  if (cards.length) {
    const cardObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          cardObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    cards.forEach(c => cardObs.observe(c));
  }

  /* Dynamic stacked project background: only two color schemes (light/dark) with slow transitions */
  const stackedProjects = document.querySelector('.projects-section.projects-stack');
  if (stackedProjects) {
    const projectCards = stackedProjects.querySelectorAll('.project-card.project-wide');
    let lastActive = null;
    // Define two color schemes
    const schemes = {
      dark: {
        bg: '#18181b',
        text: '#f8fafc',
        accent: '#6366f1'
      },
      light: {
        bg: '#f8fafc',
        text: '#18181b',
        accent: '#6366f1'
      }
    };
    const bgObserver = new IntersectionObserver(entries => {
      let found = false;
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          found = true;
          const card = entry.target;
          const tone = card.getAttribute('data-tone');
          const scheme = tone === 'dark' ? schemes.dark : schemes.light;
          document.body.style.setProperty('--dynamic-bg', scheme.bg);
          document.body.style.setProperty('--dynamic-text', scheme.text);
          document.body.style.setProperty('--dynamic-accent', scheme.accent);
          lastActive = card;
        }
      });
      // If no card is active, restore theme defaults
      if (!found && lastActive) {
        document.body.style.removeProperty('--dynamic-bg');
        document.body.style.removeProperty('--dynamic-text');
        document.body.style.removeProperty('--dynamic-accent');
        lastActive = null;
      }
    }, { threshold: 0.5 });
    projectCards.forEach(p => bgObserver.observe(p));
  }

  /* Resume (CV) scroll auto palette cycling (interval sections) */
  const cvSection = document.getElementById('cv');
  if (cvSection) {
    let lastIndex = 0;
    const autoCycle = () => {
      if (manualOverride) return; // don't fight manual
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = docH > 0 ? window.scrollY / docH : 0;
      // Map ratio to 0..(THEMES.length*4 -1) for more frequent shifts
      const slots = THEMES.length * 4;
      const idx = Math.min(slots-1, Math.floor(ratio * slots));
      const themeIndex = Math.floor(idx / 4) % THEMES.length;
      if (themeIndex !== lastIndex) {
        lastIndex = themeIndex;
        applyTheme(THEMES[themeIndex]);
      }
      requestAnimationFrame(autoCycle);
    };
    requestAnimationFrame(autoCycle);
  }

  /* Persisted panel reveal avoidance (session) */
  if (sessionStorage.getItem('panels-revealed')) {
    aboutPanels.forEach(p => p.classList.add('revealed'));
  } else {
    window.addEventListener('beforeunload', () => sessionStorage.setItem('panels-revealed','1'));
  }

  /* Analytics hook (basic dispatch) */
  window.addEventListener('theme:manual-select', () => {
    // placeholder for future analytics integration
    // console.log('[analytics] manual theme select');
  });
  window.addEventListener('theme:auto-reset', () => {
    // console.log('[analytics] auto theme reset');
  });

  /* --- New Section Enhancements (Hero untouched) --- */
  /* Skill bar animation */
  const skillSection = document.getElementById('skills');
  if (skillSection) {
    const bars = skillSection.querySelectorAll('.skill-bar');
    const sbObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          bars.forEach(bar => {
            const lvl = parseInt(bar.getAttribute('data-level')||'0',10);
            const fill = bar.querySelector('.fill');
            if (fill && !fill.dataset.animated) {
              fill.dataset.animated = '1';
              requestAnimationFrame(()=> fill.style.width = lvl + '%');
            }
          });
          sbObs.unobserve(entry.target);
        }
      });
    }, { threshold:0.3 });
    sbObs.observe(skillSection);
  }

  /* Section background subtle transition */
  const bgSections = document.querySelectorAll('[data-section-bg]');
  if (bgSections.length) {
    bgSections.forEach(sec => {
      const color = sec.getAttribute('data-section-bg');
      sec.style.setProperty('--section-bg-color', color);
    });
    const secObs = new IntersectionObserver(entries => {
      let best; let bestDelta = Infinity; const center = window.innerHeight/2;
      entries.forEach(() => {}); // noop to satisfy observer param usage
      bgSections.forEach(sec => {
        const r = sec.getBoundingClientRect();
        const mid = r.top + r.height/2; const d = Math.abs(mid-center);
        if (d < bestDelta) { bestDelta = d; best = sec; }
      });
      bgSections.forEach(s => s.classList.toggle('active-bg', s === best));
    }, { threshold:[0.1,0.25,0.5] });
    bgSections.forEach(s => secObs.observe(s));
  }

  /* Carousels */
  const carousels = document.querySelectorAll('[data-carousel]');
  carousels.forEach(carousel => {
    const track = carousel.querySelector('.carousel-track');
    if (!track) return;
    const slides = Array.from(track.children);
    let index = 0; let animating = false;
    const prevBtn = carousel.querySelector('.carousel-nav.prev');
    const nextBtn = carousel.querySelector('.carousel-nav.next');
    const dotsWrap = carousel.querySelector('.carousel-dots');
    // Build dots
    slides.forEach((_,i) => {
      const b = document.createElement('button');
      b.type='button'; b.setAttribute('aria-label', 'Go to slide '+(i+1));
      b.setAttribute('role','tab');
      if (i===0) b.setAttribute('aria-selected','true');
      b.addEventListener('click', () => go(i));
      dotsWrap.appendChild(b);
    });
    function update() {
      track.style.transform = `translateX(-${index*100}%)`;
      slides.forEach((s,i)=>{ const active = i===index; s.classList.toggle('is-active', active); s.setAttribute('aria-hidden', String(!active)); });
      dotsWrap.querySelectorAll('button').forEach((d,i)=> d.setAttribute('aria-selected', i===index? 'true':'false'));
    }
    function go(i) { if (animating || i===index || i<0 || i>=slides.length) return; animating=true; index=i; update(); setTimeout(()=>animating=false, 950); }
    prevBtn?.addEventListener('click', () => go((index-1+slides.length)%slides.length));
    nextBtn?.addEventListener('click', () => go((index+1)%slides.length));
    // Auto-advance
    let auto = setInterval(()=> go((index+1)%slides.length), 6000);
    carousel.addEventListener('mouseenter', ()=> clearInterval(auto));
    carousel.addEventListener('mouseleave', ()=> auto = setInterval(()=> go((index+1)%slides.length), 6000));
    update();
  });

  /* Case study modal */
  const caseModal = document.getElementById('case-modal');
  const caseBody = document.getElementById('case-body');
  const caseTitle = document.getElementById('case-title');
  function openCase(id) {
    if (!caseModal || !caseBody || !caseTitle) return;
    const content = getCaseStudyContent(id);
    caseTitle.textContent = content.title;
    caseBody.innerHTML = content.html;
    caseModal.hidden = false;
    document.body.style.overflow='hidden';
    const closeBtn = caseModal.querySelector('[data-case-close]');
    closeBtn?.focus();
  }
  function closeCase() {
    if (!caseModal) return; caseModal.hidden = true; document.body.style.overflow='';
  }
  function getCaseStudyContent(id) {
    switch(id) {
      case 'alpha': return { title: 'Project Alpha – Real-time Analytics', html: `<p><strong>Problem:</strong> Teams needed a dashboard that held up under bursty websocket traffic while maintaining smooth visuals.</p><p><strong>Approach:</strong> Virtualized list rendering, frame budget guard (drops non-critical paints when >8ms), adaptive batching of socket messages.</p><p><strong>Outcome:</strong> 42% reduction in main-thread blocking at P95 load; layout thrash near-zero.</p>` };
      case 'modelforge': return { title: 'Model Forge – Experiment Toolkit', html: `<p><strong>Goal:</strong> Shrink iteration time for structured ML baselines.</p><p><strong>Design:</strong> Declarative YAML run specs, lightweight artifact log (JSONL), pluggable evaluation modules.</p><p><strong>Result:</strong> Repro runs diffable; cold start baseline in &lt; 30s.</p>` };
      case 'ledgerlite': return { title: 'LedgerLite – Minimal Finance Tool', html: `<p><strong>Need:</strong> Simpler budgeting model for students new to expense tracking.</p><p><strong>Key Ideas:</strong> Envelope buffers, anomaly highlighting, progressive onboarding.</p><p><strong>Impact (beta):</strong> Users reported clearer monthly mental model; churn under 10% in first 4 weeks.</p>` };
      default: return { title: 'Case Study', html: '<p>Details coming soon.</p>' };
    }
  }
  document.querySelectorAll('[data-case-open]')?.forEach(btn => btn.addEventListener('click', e => {
    const id = btn.getAttribute('data-case-open'); if (id) openCase(id);
  }));
  caseModal?.addEventListener('click', e => { if (e.target instanceof HTMLElement && (e.target.hasAttribute('data-case-close') || e.target === caseModal)) closeCase(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !caseModal?.hidden) closeCase(); });

  /* Contact form (static) – simulate send */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      const status = document.getElementById('form-status');
      const data = new FormData(contactForm);
      // Simple validation
      let valid = true;
      ['name','email','message'].forEach(field => {
        const val = (data.get(field)||'').toString().trim();
        const errEl = contactForm.querySelector(`[data-error-for="${field}"]`);
        if (!val) { valid=false; if(errEl) errEl.textContent='Required'; } else if (field==='email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val)) { valid=false; if(errEl) errEl.textContent='Invalid email'; } else { if(errEl) errEl.textContent=''; }
      });
      if (!valid) { status.textContent='Please fix errors.'; return; }
      status.textContent='Sending...';
      setTimeout(()=> { status.textContent='Message queued locally (static site).'; contactForm.reset(); }, 900);
    });
  }
});

// Expose for sphere.js if needed
window.__portfolio = { version: '1.0.0' };
