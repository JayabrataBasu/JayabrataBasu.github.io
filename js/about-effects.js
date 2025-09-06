// About section effects - typewriter and 3D tilt
document.addEventListener('DOMContentLoaded', function() {
    
    // Typewriter effect for About card text
    function initTypewriter() {
        const textEl = document.querySelector('.about-card-text');
        if (!textEl) return;
        
        const fullText = textEl.textContent.trim();
        textEl.textContent = '';
        let i = 0;
        
        function type() {
            if (i <= fullText.length) {
                textEl.textContent = fullText.slice(0, i);
                i++;
                setTimeout(type, 18 + Math.random() * 32);
            } else {
                textEl.textContent = fullText;
            }
        }
        
        // Start typewriter when the card comes into view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    type();
                    observer.disconnect();
                }
            });
        }, { threshold: 0.3 });
        
        observer.observe(textEl);
    }
    
    // Interactive 3D tilt for About card
    function init3DTilt() {
        const card = document.querySelector('.about-tilt-card');
        if (!card) return;
        
        let req = null;
        
        function getRelPos(e) {
            const r = card.getBoundingClientRect();
            let x, y;
            
            if (e.touches && e.touches.length) {
                x = e.touches[0].clientX;
                y = e.touches[0].clientY;
            } else {
                x = e.clientX;
                y = e.clientY;
            }
            
            return {
                x: (x - r.left) / r.width - 0.5,
                y: (y - r.top) / r.height - 0.5
            };
        }
        
        function onMove(e) {
            if (req) return;
            req = requestAnimationFrame(() => {
                const {x, y} = getRelPos(e);
                const rotX = (y * -18).toFixed(2);
                const rotY = (x * 18).toFixed(2);
                card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.025)`;
                req = null;
            });
        }
        
        function resetTilt() {
            card.style.transform = '';
        }
        
        // Add event listeners
        card.addEventListener('mousemove', onMove);
        card.addEventListener('mouseleave', resetTilt);
        card.addEventListener('touchmove', onMove);
        card.addEventListener('touchend', resetTilt);
    }
    
    // Initialize both effects
    initTypewriter();
    init3DTilt();
});
