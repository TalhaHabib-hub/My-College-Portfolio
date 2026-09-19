
document.getElementById('year').textContent = new Date().getFullYear();
 
// ===== Ambient background particles =====
// Soft glowing dots drifting upward behind everything — purely decorative,
// skipped entirely if the visitor's system prefers reduced motion.
(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;
 
  const field = document.getElementById('bg-fx');
  const count = window.innerWidth < 640 ? 22 : 42;
  const palette = ['var(--accent)', '#8FF3EC', '#5AC8C0'];
 
  for (let i = 0; i < count; i++) {
    const p = document.createElement('span');
    p.className = 'fx-particle';
    const size = (Math.random() * 3 + 1.5).toFixed(1);
    p.style.left = (Math.random() * 100) + 'vw';
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.background = palette[Math.floor(Math.random() * palette.length)];
    p.style.setProperty('--o', (0.25 + Math.random() * 0.45).toFixed(2));
    p.style.animationDuration = (10 + Math.random() * 14) + 's';
    p.style.animationDelay = (-Math.random() * 20) + 's';
    field.appendChild(p);
  }
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
 
