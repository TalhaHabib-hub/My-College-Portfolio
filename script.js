
document.getElementById('year').textContent = new Date().getFullYear();
 
// ===== Ambient background: starlight headliner effect =====
// A field of fixed, independently twinkling points (like a Rolls-Royce
// starlight roof) plus the occasional shooting star streaking across.
// Purely decorative — skipped entirely if the visitor prefers reduced motion.
(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;
 
  const field = document.getElementById('bg-fx');
  const isSmall = window.innerWidth < 640;
  const starCount = isSmall ? 70 : 150;
 
  for (let i = 0; i < starCount; i++) {
    const s = document.createElement('span');
    s.className = 'fx-star';
    const big = Math.random() < 0.08; // a handful of brighter "signature" stars
    const size = big ? (2 + Math.random() * 1.4) : (0.8 + Math.random() * 1.4);
    s.style.top = (Math.random() * 100) + 'vh';
    s.style.left = (Math.random() * 100) + 'vw';
    s.style.width = size.toFixed(1) + 'px';
    s.style.height = size.toFixed(1) + 'px';
    s.style.setProperty('--min-o', big ? '0.35' : (0.1 + Math.random() * 0.15).toFixed(2));
    s.style.setProperty('--max-o', big ? '1' : (0.55 + Math.random() * 0.35).toFixed(2));
    s.style.animationDuration = (2.2 + Math.random() * 4.5).toFixed(2) + 's';
    s.style.animationDelay = (-Math.random() * 8).toFixed(2) + 's';
    if (big) s.style.boxShadow = '0 0 4px 1px rgba(143,243,236,0.6)';
    field.appendChild(s);
  }
 
  // Occasional shooting star, crossing at a random angle/position/speed.
  function spawnShootingStar() {
    const star = document.createElement('span');
    star.className = 'fx-shooting-star';
    const startTop = Math.random() * 60;
    const startLeft = Math.random() * 70;
    const angle = -15 - Math.random() * 20;
    const distance = 260 + Math.random() * 220;
    star.style.top = startTop + 'vh';
    star.style.left = startLeft + 'vw';
    star.style.setProperty('--angle', angle + 'deg');
    star.style.setProperty('--dx', distance + 'px');
    star.style.setProperty('--dy', (distance * 0.42) + 'px');
    star.style.animationDuration = (1 + Math.random() * 0.6).toFixed(2) + 's';
    field.appendChild(star);
    star.addEventListener('animationend', () => star.remove());
  }
 
  function scheduleShootingStar() {
    const delay = 4000 + Math.random() * 7000;
    setTimeout(() => {
      spawnShootingStar();
      scheduleShootingStar();
    }, delay);
  }
  scheduleShootingStar();
})();
 
// ===== Scroll-reveal for panels, cards and tiles =====
// Fades + lifts each [data-reveal] element in as it enters the viewport,
// staggering siblings slightly so grids feel like they cascade in.
(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const items = document.querySelectorAll('[data-reveal]');
 
  if (reduceMotion || !('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('is-visible'));
    return;
  }
 
  const groups = new Map();
  items.forEach(el => {
    const parent = el.parentElement;
    if (!groups.has(parent)) groups.set(parent, []);
    groups.get(parent).push(el);
  });
  groups.forEach(siblings => {
    siblings.forEach((el, i) => el.style.transitionDelay = Math.min(i * 70, 350) + 'ms');
  });
 
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
 
  items.forEach(el => io.observe(el));
})();
 
// ===== Hero entrance =====
// A short staggered fade-up for the hero's own text lines, run once on load
// rather than on scroll (it's already in view).
(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const items = document.querySelectorAll('[data-intro-item]');
  if (reduceMotion) {
    items.forEach(el => el.classList.add('is-visible'));
    return;
  }
  items.forEach((el, i) => {
    el.style.transitionDelay = (i * 90) + 'ms';
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('is-visible')));
  });
})();
 
// ===== Contact form =====
// Sends the form in the background via Formspree (no page reload, no backend to host).
// Setup needed once: create a free form at https://formspree.io using
// talhahabib8426@gmail.com, then replace YOUR_FORM_ID in the <form action="..."> in
// index.html with the ID Formspree gives you.
const form = document.getElementById('contactForm');
const status = document.getElementById('cf-status');
const submitBtn = document.getElementById('cf-submit');
 
if (form) {
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    status.textContent = '';
    status.className = 'cf-status';
 
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        status.textContent = "Message sent — I'll get back to you soon.";
        status.classList.add('cf-status--ok');
        form.reset();
      } else {
        throw new Error('Send failed');
      }
    } catch (err) {
      status.textContent = "Couldn't send — email me directly at talhahabib8426@gmail.com";
      status.classList.add('cf-status--err');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
    }
  });
}
 
