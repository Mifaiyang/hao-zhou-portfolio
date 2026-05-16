const body = document.body;
const meter = document.querySelector(".scroll-meter span");
const canvas = document.getElementById("signal-field");
const ctx = canvas.getContext("2d");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const pointer = { x: 0.62, y: 0.38 };
let particles = [];
let animationId = 0;

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  createParticles();
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

function drawSignalField() {
  if (body.classList.contains("motion-off") || prefersReducedMotion.matches) return;
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  ctx.globalAlpha = .92;
  ctx.fillStyle = getComputedStyle(body).getPropertyValue("--paper");
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  const accent = getComputedStyle(body).getPropertyValue("--accent").trim();
  const accentTwo = getComputedStyle(body).getPropertyValue("--accent-2").trim();
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

  ctx.globalAlpha = .18;
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

function updateScrollMeter() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const progress = max <= 0 ? 0 : window.scrollY / max;
  meter.style.width = `${Math.round(progress * 100)}%`;
}

function handleInternalLinks() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const id = link.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 18;
      window.scrollTo({ top, behavior: prefersReducedMotion.matches ? "auto" : "smooth" });
    });
  });
}

function setupTweaks() {
  const toggle = document.querySelector(".tweaks-toggle");
  const panel = document.getElementById("tweaks-panel");
  const modeSelect = document.getElementById("mode-select");
  const motionToggle = document.getElementById("motion-toggle");

  toggle.addEventListener("click", () => {
    const open = panel.hasAttribute("hidden");
    panel.toggleAttribute("hidden", !open);
    toggle.setAttribute("aria-expanded", String(open));
  });

  modeSelect.addEventListener("change", () => {
    body.dataset.mode = modeSelect.value;
  });

  motionToggle.addEventListener("change", () => {
    body.classList.toggle("motion-off", !motionToggle.checked);
    if (motionToggle.checked) {
      window.cancelAnimationFrame(animationId);
      drawSignalField();
    }
  });
}

function setupCopy() {
  const copyButton = document.getElementById("copy-wechat");
  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText("zhouhao200417");
      copyButton.textContent = "已复制微信 zhouhao200417";
      window.setTimeout(() => {
        copyButton.textContent = "复制微信 zhouhao200417";
      }, 1600);
    } catch {
      copyButton.textContent = "微信 zhouhao200417";
    }
  });
}

function setupPortfolioVideo() {
  const stage = document.querySelector(".video-stage");
  const poster = document.querySelector(".video-poster");
  const button = document.querySelector(".load-video");
  const iframe = document.querySelector(".video-stage iframe");
  button.addEventListener("click", () => {
    iframe.src = iframe.dataset.src;
    iframe.hidden = false;
    poster.hidden = true;
    stage.classList.add("is-loaded");
  });
}

window.addEventListener("resize", resizeCanvas);
window.addEventListener("scroll", updateScrollMeter, { passive: true });
window.addEventListener("pointermove", (event) => {
  pointer.x = event.clientX / window.innerWidth;
  pointer.y = event.clientY / window.innerHeight;
}, { passive: true });

resizeCanvas();
updateScrollMeter();
handleInternalLinks();
setupTweaks();
setupCopy();
setupPortfolioVideo();
drawSignalField();
