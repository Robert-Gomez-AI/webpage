/* ============================================
   Robert Gomez — Portfolio JS
   ============================================ */

// --- Neural Network Canvas Animation ---
class NeuralNetwork {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.connections = [];
        this.mouse = { x: null, y: null };
        this.particleCount = window.innerWidth < 768 ? 40 : 80;
        this.connectionDistance = window.innerWidth < 768 ? 120 : 180;
        this.resize();
        this.init();
        this.bindEvents();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.2,
            });
        }
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            this.resize();
            this.init();
        });

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
    }

    drawParticle(p) {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(108, 92, 231, ${p.opacity})`;
        this.ctx.fill();
    }

    drawConnection(p1, p2, distance) {
        const opacity = (1 - distance / this.connectionDistance) * 0.15;
        this.ctx.beginPath();
        this.ctx.moveTo(p1.x, p1.y);
        this.ctx.lineTo(p2.x, p2.y);
        this.ctx.strokeStyle = `rgba(108, 92, 231, ${opacity})`;
        this.ctx.lineWidth = 0.5;
        this.ctx.stroke();
    }

    update() {
        for (const p of this.particles) {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

            // Mouse interaction
            if (this.mouse.x !== null) {
                const dx = this.mouse.x - p.x;
                const dy = this.mouse.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 200) {
                    p.vx += dx * 0.00005;
                    p.vy += dy * 0.00005;
                }
            }

            // Damping
            p.vx *= 0.999;
            p.vy *= 0.999;
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw connections
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < this.connectionDistance) {
                    this.drawConnection(this.particles[i], this.particles[j], distance);
                }
            }
        }

        // Draw particles
        for (const p of this.particles) {
            this.drawParticle(p);
        }

        // Mouse connections
        if (this.mouse.x !== null) {
            for (const p of this.particles) {
                const dx = this.mouse.x - p.x;
                const dy = this.mouse.y - p.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 250) {
                    const opacity = (1 - distance / 250) * 0.2;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.mouse.x, this.mouse.y);
                    this.ctx.lineTo(p.x, p.y);
                    this.ctx.strokeStyle = `rgba(0, 206, 201, ${opacity})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            }
        }
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// --- Typed Text Effect ---
class TypeWriter {
    constructor(element, phrases, speed = 80) {
        this.element = element;
        this.phrases = phrases;
        this.speed = speed;
        this.deleteSpeed = 40;
        this.pauseTime = 2000;
        this.currentPhrase = 0;
        this.currentChar = 0;
        this.isDeleting = false;
        this.type();
    }

    type() {
        const phrase = this.phrases[this.currentPhrase];

        if (this.isDeleting) {
            this.element.textContent = phrase.substring(0, this.currentChar - 1);
            this.currentChar--;
        } else {
            this.element.textContent = phrase.substring(0, this.currentChar + 1);
            this.currentChar++;
        }

        let delay = this.isDeleting ? this.deleteSpeed : this.speed;

        if (!this.isDeleting && this.currentChar === phrase.length) {
            delay = this.pauseTime;
            this.isDeleting = true;
        } else if (this.isDeleting && this.currentChar === 0) {
            this.isDeleting = false;
            this.currentPhrase = (this.currentPhrase + 1) % this.phrases.length;
            delay = 500;
        }

        setTimeout(() => this.type(), delay);
    }
}

// --- Scroll Reveal ---
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
    });

    document.querySelectorAll('.reveal').forEach((el) => {
        observer.observe(el);
    });
}

// --- Counter Animation ---
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number[data-target]');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.dataset.target);
                const duration = 2000;
                const start = performance.now();

                function updateCounter(currentTime) {
                    const elapsed = currentTime - start;
                    const progress = Math.min(elapsed / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    const current = Math.floor(eased * target);
                    entry.target.textContent = current;

                    if (progress < 1) {
                        requestAnimationFrame(updateCounter);
                    } else {
                        entry.target.textContent = target;
                    }
                }

                requestAnimationFrame(updateCounter);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach((counter) => observer.observe(counter));
}

// --- Navigation ---
function initNav() {
    const nav = document.getElementById('nav');
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');

    // Scroll effect
    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 50);
    });

    // Mobile toggle
    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        links.classList.toggle('open');
    });

    // Close on link click
    links.querySelectorAll('.nav-link').forEach((link) => {
        link.addEventListener('click', () => {
            toggle.classList.remove('active');
            links.classList.remove('open');
        });
    });
}

// --- Cursor Glow ---
function initCursorGlow() {
    const glow = document.getElementById('cursorGlow');
    if (window.innerWidth < 768) return;

    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        glow.classList.add('active');
    });

    function updateGlow() {
        glowX += (mouseX - glowX) * 0.08;
        glowY += (mouseY - glowY) * 0.08;
        glow.style.left = glowX + 'px';
        glow.style.top = glowY + 'px';
        requestAnimationFrame(updateGlow);
    }

    updateGlow();
}

// --- Smooth Scroll ---
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                const navHeight = document.getElementById('nav').offsetHeight;
                const top = target.offsetTop - navHeight;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });
}

// --- Active Nav Link ---
function initActiveNavLink() {
    const sections = document.querySelectorAll('.section, .hero');
    const navLinks = document.querySelectorAll('.nav-link');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach((link) => {
                    link.classList.toggle('active',
                        link.getAttribute('href') === `#${id}`
                    );
                });
            }
        });
    }, { threshold: 0.3 });

    sections.forEach((section) => observer.observe(section));
}

// --- Initialize ---
document.addEventListener('DOMContentLoaded', () => {
    // Neural network background
    const canvas = document.getElementById('neuralCanvas');
    if (canvas) new NeuralNetwork(canvas);

    // Typed text
    const typedEl = document.getElementById('typedText');
    if (typedEl) {
        new TypeWriter(typedEl, [
            'Mathematician',
            'AI Researcher',
            'CTO @ AIMedic',
            'Generative Models',
            'Quantum Computing',
            'Open Source Advocate',
        ]);
    }

    // Init all modules
    initScrollReveal();
    animateCounters();
    initNav();
    initCursorGlow();
    initSmoothScroll();
    initActiveNavLink();
});
