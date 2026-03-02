import './style.css'
import { initI18n, applyLanguage, getTranslation, currentLang } from './i18n'

// Apply saved language before any other DOM-dependent code
initI18n()

// --- Space Background System ---
const canvas = document.getElementById('space-canvas') as HTMLCanvasElement;
const ctx = canvas ? canvas.getContext('2d') : null;

if (canvas && ctx) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // State for animation
  let isLightMode = document.body.classList.contains('light-theme');

  // Observer to detect theme changes (or we can check in loop)
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'class') {
        isLightMode = document.body.classList.contains('light-theme');
      }
    });
  });
  observer.observe(document.body, { attributes: true });


  class Star {
    x: number;
    y: number;
    size: number;
    opacity: number; // For twinkle
    speed: number;

    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2;
      this.opacity = Math.random();
      this.speed = Math.random() * 0.05;
    }

    draw() {
      if (!ctx) return;
      // Color depends on mode
      if (isLightMode) {
        ctx.fillStyle = `rgba(202, 138, 4, ${this.opacity * 0.5})`; // Gold particles
      } else {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`; // White stars
      }

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }

    update() {
      if (isLightMode) {
        // Formatting: Float UPwards nicely like bubbles/pollen
        this.y -= this.speed * 5;
        this.x += Math.sin(this.y * 0.01) * 0.2; // Wobbly movement

        if (this.y < 0) this.y = canvas.height;
      } else {
        // Classic Star Twinkle
        this.opacity += (Math.random() - 0.5) * 0.1;
        if (this.opacity < 0.2) this.opacity = 0.2;
        if (this.opacity > 1) this.opacity = 1;
      }

      this.draw();
    }
  }

  class Meteor {
    x: number;
    y: number;
    length: number;
    speedX: number;
    speedY: number;
    opacity: number;

    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * -100; // Start above screen
      this.length = Math.random() * 80 + 10;
      this.speedX = Math.random() * 2 - 1; // Slight angle
      this.speedY = Math.random() * 5 + 3; // Fast down
      this.opacity = 0;
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * -100;
      this.speedX = Math.random() * 4 - 2;
      this.speedY = Math.random() * 7 + 3;
      this.opacity = 1;
    }

    draw() {
      if (!ctx) return;
      if (this.opacity <= 0) return;

      // No meteors in light mode, or maybe 'falling leaves'? 
      // Let's hide meteors in light mode for cleanliness
      if (isLightMode) return;

      ctx.beginPath();
      ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity})`;
      ctx.lineWidth = 2;
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x - this.speedX * 5, this.y - this.speedY * 5); // Trail
      ctx.stroke();
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.opacity -= 0.01;

      if (this.y > canvas.height || this.opacity <= 0) {
        // Random chance to respawn immediately or wait
        if (Math.random() < 0.02) {
          this.reset();
        }
      }
      this.draw();
    }
  }

  const stars: Star[] = [];
  const meteors: Meteor[] = [];

  // Init
  for (let i = 0; i < 200; i++) {
    stars.push(new Star());
  }
  // Just a couple of meteors active at a time usually
  meteors.push(new Meteor());
  meteors.push(new Meteor());

  function animateSpace() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    stars.forEach(star => star.update());
    meteors.forEach(meteor => meteor.update());

    requestAnimationFrame(animateSpace);
  }

  animateSpace();

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

// --- Star Cursor: always update position; CSS hides it on touch devices ---
const cursor = document.getElementById('star-cursor');
document.addEventListener('mousemove', (e) => {
  if (cursor) {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;
  }
  document.body.style.setProperty('--mouse-x', `${e.clientX}px`);
  document.body.style.setProperty('--mouse-y', `${e.clientY}px`);
});

const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.getElementById('nav-links');
const themeToggle = document.getElementById('theme-toggle');
const contactForm = document.getElementById('contact-form') as HTMLFormElement;

// Handle Contact Form
if (contactForm) {
  // Form handling is done via Formspree in HTML
}

// Theme Toggle
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const icon = themeToggle.querySelector('i');
    if (icon) {
      if (document.body.classList.contains('light-theme')) {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
      } else {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
      }
    }
  });
}

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');

    // Animate icon (simple switch)
    const icon = menuToggle.querySelector('i');
    if (icon) {
      if (navLinks.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
      } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
      }
    }
  });

  // Close menu when clicking a link
  const links = navLinks.querySelectorAll('a');
  links.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      const icon = menuToggle.querySelector('i');
      if (icon) {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
      }
    });
  });
}

// 3D Tilt Effect for Cards - only when hover is supported (desktop)
const prefersHover = () => window.matchMedia('(hover: hover)').matches;
if (prefersHover()) {
  const cards = document.querySelectorAll<HTMLElement>('.project-card, .skill-card, .about-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate rotation (max +/- 10deg)
    const xPct = x / rect.width;
    const yPct = y / rect.height;

    const xRot = (yPct - 0.5) * 20; // -10 to +10
    const yRot = (xPct - 0.5) * -20; // +10 to -10

    card.style.transform = `perspective(1000px) rotateX(${xRot}deg) rotateY(${yRot}deg) scale(1.02)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
  });
  });
}

// Typing Animation
const typeText = (element: HTMLElement, text: string, speed: number = 100) => {
  let i = 0;
  element.innerHTML = ''; // Clear content

  const type = () => {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      setTimeout(type, speed);
    } else {
      // Remove cursor blink effect if desired, or keep it
      element.classList.add('typing-complete');
    }
  };

  type();
};

const heroTitle = document.getElementById('hero-name');
if (heroTitle) {
  const originalText = getTranslation('hero.name');
  heroTitle.textContent = "";
  heroTitle.classList.add('typing-cursor');

  setTimeout(() => {
    typeText(heroTitle, originalText, 100);
  }, 800);
}

// Language toggle: switch between English and Arabic
const langToggle = document.getElementById('lang-toggle');
if (langToggle) {
  langToggle.addEventListener('click', () => {
    const newLang = currentLang === 'en' ? 'ar' : 'en';
    applyLanguage(newLang);
    if (heroTitle) {
      heroTitle.textContent = getTranslation('hero.name');
      heroTitle.classList.remove('typing-cursor');
      heroTitle.classList.add('typing-complete');
    }
  });
}

// Scroll Animations (Intersection Observer)
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible'); // You might need to define .visible in CSS if using a different class
      // In our CSS we defined .animate-up with animation, 
      // but to trigger it on scroll we can reset it or use a class that enables it.
      // Actually, our CSS has .animate-up which runs immediately. 
      // Let's modify the strategy: Add 'show' class to trigger animation.
      entry.target.classList.add('show-animation');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Select elements to animate
// We can auto-add animation classes to section titles or cards
document.querySelectorAll('section h2, .project-card, .skill-card, .timeline-item').forEach(el => {
  el.classList.add('scroll-hidden'); // Initial state
  observer.observe(el);
});
