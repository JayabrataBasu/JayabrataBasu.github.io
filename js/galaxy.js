// Clickable planets and sun: open side panel with info
const planetInfo = {
  Sun: 'The Sun is the star at the center of our solar system.',
  Mercury: 'Mercury is the closest planet to the Sun.',
  Venus: 'Venus is the second planet from the Sun.',
  Earth: 'Earth is our home planet.',
  Mars: 'Mars is known as the Red Planet.'
};

document.addEventListener('DOMContentLoaded', function() {
  const planets = document.querySelectorAll('.solar-syst .planet');
  const sun = document.querySelector('.solar-syst .sun');
  const panel = document.getElementById('planet-panel');
  const panelTitle = document.getElementById('planet-panel-title');
  const panelContent = document.getElementById('planet-panel-content');
  const closeBtn = document.getElementById('close-planet-panel');

  function openPanel(name) {
    panelTitle.textContent = name;
    panelContent.textContent = planetInfo[name] || '';
    panel.style.display = 'block';
    panel.style.right = '0';
    panel.style.left = 'auto';
    panel.style.top = '50%';
    panel.style.transform = 'translateY(-50%)';
  }

  planets.forEach(planet => {
    planet.style.cursor = 'pointer';
    planet.addEventListener('click', function(e) {
      const name = planet.getAttribute('data-planet');
      openPanel(name);
    });
  });

  if (sun) {
    sun.style.cursor = 'pointer';
    sun.addEventListener('click', function() {
      openPanel('Sun');
    });
  }

  closeBtn.addEventListener('click', function() {
    panel.style.display = 'none';
  });

  // Optional: close panel when clicking outside
  window.addEventListener('click', function(e) {
    if (panel.style.display === 'block' && !panel.contains(e.target) && !e.target.classList.contains('planet') && e.target !== sun) {
      panel.style.display = 'none';
    }
  });
});
