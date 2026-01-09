/* cv-playground.js
   Interactive particle field adapted from user's snippet, integrated into CV page.
*/

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');
  const info = document.getElementById('pg-info');
  const modeBtn = document.getElementById('modeBtn');
  const modeText = document.getElementById('modeText');
  const resetBtn = document.getElementById('resetBtn');
  const container = document.querySelector('.playground-container');

  // Responsive sizing function
  function resizeCanvas() {
    // Use container's width for canvas clarity and site layout
    const w = Math.min(container.clientWidth * 0.98, 1200);
    const h = Math.min(window.innerHeight * 0.66, 700);
    canvas.width = Math.max(320, Math.floor(w));
    canvas.height = Math.max(200, Math.floor(h));
  }

  // Particle system parameters (close to user-provided defaults)
  const particles = [];
  const particleCount = 150;
  const connectionDistance = 120;
  let mouseX = 0;
  let mouseY = 0;
  let isMouseDown = false;
  let attractMode = false;

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.radius = Math.random() * 2 + 1;
      this.originalVx = this.vx;
      this.originalVy = this.vy;
    }
    update() {
      const dx = mouseX - this.x;
      const dy = mouseY - this.y;
      const distance = Math.sqrt(dx*dx + dy*dy);
      const maxDistance = 150;

      if (distance < maxDistance) {
        const force = (maxDistance - distance) / maxDistance;
        const angle = Math.atan2(dy, dx);
        if (attractMode || isMouseDown) {
          this.vx += Math.cos(angle) * force * 0.2;
          this.vy += Math.sin(angle) * force * 0.2;
        } else {
          this.vx -= Math.cos(angle) * force * 0.15;
          this.vy -= Math.sin(angle) * force * 0.15;
        }
      }

      // Return to original velocity slowly
      this.vx += (this.originalVx - this.vx) * 0.01;
      this.vy += (this.originalVy - this.vy) * 0.01;

      this.x += this.vx;
      this.y += this.vy;

      // Bounce
      if (this.x < 0 || this.x > canvas.width) {
        this.vx *= -1; this.originalVx *= -1; this.x = Math.max(0, Math.min(canvas.width, this.x));
      }
      if (this.y < 0 || this.y > canvas.height) {
        this.vy *= -1; this.originalVy *= -1; this.y = Math.max(0, Math.min(canvas.height, this.y));
      }

      // Limit speed
      const speed = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
      if (speed > 3) { this.vx = (this.vx / speed) * 3; this.vy = (this.vy / speed) * 3; }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
      ctx.fillStyle = '#354F52'; // match site dark charcoal
      ctx.fill();
    }
  }

  function initParticles() {
    particles.length = 0;
    for (let i=0;i<particleCount;i++) particles.push(new Particle());
  }

  function drawConnections() {
    for (let i=0;i<particles.length;i++){
      for (let j=i+1;j<particles.length;j++){
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx*dx + dy*dy);
        if (distance < connectionDistance){
          const opacity = (1 - distance/connectionDistance) * 0.3;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(183,183,164, ${opacity})`; // #B7B7A4
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animate(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  }

  // Mouse & touch events
  function setMousePos(e){
    const rect = canvas.getBoundingClientRect();
    mouseX = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    mouseY = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
  }

  canvas.addEventListener('mousemove', (e)=>{ setMousePos(e); if (!info.classList.contains('hidden')) setTimeout(()=>info.classList.add('hidden'),2000); });
  canvas.addEventListener('mousedown', ()=> isMouseDown = true);
  canvas.addEventListener('mouseup', ()=> isMouseDown = false);
  canvas.addEventListener('mouseleave', ()=> { isMouseDown=false; mouseX = canvas.width/2; mouseY = canvas.height/2; });
  canvas.addEventListener('touchmove', (e)=>{ e.preventDefault(); setMousePos(e); }, {passive:false});
  canvas.addEventListener('touchstart', (e)=>{ e.preventDefault(); isMouseDown=true; setMousePos(e); }, {passive:false});
  canvas.addEventListener('touchend', ()=> isMouseDown=false );

  modeBtn.addEventListener('click', ()=>{
    attractMode = !attractMode;
    if (attractMode) { modeBtn.textContent = 'Repel Mode'; modeText.textContent = 'Attracting Particles'; }
    else { modeBtn.textContent = 'Attract Mode'; modeText.textContent = 'Hover to Explore'; }
  });

  resetBtn.addEventListener('click', ()=>{ particles.forEach(p => p.reset()); });

  // Handle resize
  window.addEventListener('resize', ()=>{ resizeCanvas(); particles.forEach(p => p.reset()); });

  // Init
  resizeCanvas(); initParticles(); animate();
});
