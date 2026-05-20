const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const meter = document.querySelector(".scroll-meter span");

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 24;
    window.scrollTo({ top, behavior: prefersReducedMotion.matches ? "auto" : "smooth" });
  });
});

function updateScrollMeter() {
  if (!meter) return;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const progress = max <= 0 ? 0 : window.scrollY / max;
  meter.style.width = `${Math.round(progress * 100)}%`;
}

const revealItems = document.querySelectorAll(".reveal, .project-card, .case-block, .metric-box");

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealItems.forEach((item) => observer.observe(item));

const countItems = document.querySelectorAll(".metric-box span");
const countObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting || prefersReducedMotion.matches) return;
    const el = entry.target;
    const match = el.textContent.trim().match(/^(\d+)(\+)?$/);
    if (!match) {
      countObserver.unobserve(el);
      return;
    }
    const target = Number(match[1]);
    const suffix = match[2] || "";
    const start = performance.now();
    const duration = 700;
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      el.textContent = `${Math.round(target * progress)}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    countObserver.unobserve(el);
  });
}, { threshold: 0.6 });

countItems.forEach((item) => countObserver.observe(item));

window.addEventListener("scroll", updateScrollMeter, { passive: true });
updateScrollMeter();
