const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const meter = document.querySelector(".scroll-meter span");
const ambient = document.querySelector(".ambient");

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 24;
    window.scrollTo({ top, behavior: prefersReducedMotion.matches ? "auto" : "smooth" });
  });
});

const revealTargets = document.querySelectorAll(
  ".intro, .frame-strip article, .work-item, .film-layout, .timeline-list article, .skill-cloud span, .contact-grid"
);

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("is-visible");
    observer.unobserve(entry.target);
  });
}, { threshold: 0.16 });

revealTargets.forEach((target) => observer.observe(target));

function updateScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const progress = max <= 0 ? 0 : window.scrollY / max;
  if (meter) meter.style.width = `${Math.round(progress * 100)}%`;
  if (ambient && !prefersReducedMotion.matches) {
    ambient.style.transform = `translate3d(0, ${Math.round(window.scrollY * -0.035)}px, 0)`;
  }
}

window.addEventListener("scroll", updateScroll, { passive: true });
window.addEventListener("resize", updateScroll);
updateScroll();
