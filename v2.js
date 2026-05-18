const links = document.querySelectorAll('a[href^="#"]');
const meter = document.querySelector(".scroll-meter span");
const canvas = document.getElementById("signal-field");
const ctx = canvas ? canvas.getContext("2d") : null;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const pointer = { x: 0.62, y: 0.38 };
let particles = [];
let animationId = 0;

links.forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 24;
    window.scrollTo({ top, behavior: prefersReducedMotion.matches ? "auto" : "smooth" });
  });
});

const cards = document.querySelectorAll(".project-card, .case-block, .metric-box");

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

cards.forEach((card) => observer.observe(card));

function updateScrollMeter() {
  if (!meter) return;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const progress = max <= 0 ? 0 : window.scrollY / max;
  meter.style.width = `${Math.round(progress * 100)}%`;
}

function createParticles() {
  const count = Math.min(96, Math.max(42, Math.floor(window.innerWidth / 16)));
  particles = Array.from({ length: count }, (_, index) => ({
    x: (index * 97) % window.innerWidth,
    y: (index * 53) % window.innerHeight,
    vx: (Math.random() - .5) * .35,
    vy: (Math.random() - .5) * .35,
    r: 1 + Math.random() * 2.2
  }));
}

function resizeCanvas() {
  if (!canvas || !ctx) return;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  createParticles();
}

function drawSignalField() {
  if (!canvas || !ctx || prefersReducedMotion.matches) return;
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  ctx.globalAlpha = .92;
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--bg");
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  const styles = getComputedStyle(document.documentElement);
  const accent = styles.getPropertyValue("--accent").trim();
  const accentTwo = styles.getPropertyValue("--accent-2").trim();
  const targetX = pointer.x * window.innerWidth;
  const targetY = pointer.y * window.innerHeight;

  particles.forEach((particle, index) => {
    const dx = targetX - particle.x;
    const dy = targetY - particle.y;
    const distance = Math.max(80, Math.sqrt(dx * dx + dy * dy));
    particle.vx += (dx / distance) * .002;
    particle.vy += (dy / distance) * .002;
    particle.vx *= .985;
    particle.vy *= .985;
    particle.x += particle.vx;
    particle.y += particle.vy;

    if (particle.x < -20) particle.x = window.innerWidth + 20;
    if (particle.x > window.innerWidth + 20) particle.x = -20;
    if (particle.y < -20) particle.y = window.innerHeight + 20;
    if (particle.y > window.innerHeight + 20) particle.y = -20;

    ctx.beginPath();
    ctx.fillStyle = index % 5 === 0 ? accentTwo : accent;
    ctx.globalAlpha = index % 5 === 0 ? .34 : .2;
    ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.strokeStyle = "#11110f";
  ctx.lineWidth = 1;
  for (let i = 0; i < particles.length; i += 1) {
    for (let j = i + 1; j < particles.length; j += 1) {
      const a = particles[i];
      const b = particles[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 118) {
        ctx.globalAlpha = (118 - distance) / 900;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  animationId = window.requestAnimationFrame(drawSignalField);
}

window.addEventListener("resize", resizeCanvas);
window.addEventListener("scroll", updateScrollMeter, { passive: true });
window.addEventListener("pointermove", (event) => {
  pointer.x = event.clientX / window.innerWidth;
  pointer.y = event.clientY / window.innerHeight;
}, { passive: true });

resizeCanvas();
updateScrollMeter();
drawSignalField();
