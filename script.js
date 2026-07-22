const header = document.querySelector('[data-header]');
const hero = document.querySelector('.hero');
const signalStage = document.querySelector('[data-signal-stage]');
const signalDisc = document.querySelector('[data-signal-disc]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const supportsFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const cursorFollower = document.querySelector('[data-cursor-follower]');
const cursorDot = document.querySelector('[data-cursor-dot]');

document.querySelector('[data-year]').textContent = new Date().getFullYear();

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.02, rootMargin: '0px 0px -4% 0px' });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

let headerFrame = null;
const updateHeader = () => {
  header.classList.toggle('is-scrolled', window.scrollY > 80);
  headerFrame = null;
};
updateHeader();
window.addEventListener('scroll', () => {
  if (headerFrame === null) headerFrame = window.requestAnimationFrame(updateHeader);
}, { passive: true });

if (!reducedMotion && supportsFinePointer && hero && signalStage && signalDisc) {
  hero.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse') return;
    const rect = signalStage.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    signalDisc.style.setProperty('--ry', `${Math.max(-1, Math.min(1, x)) * 13}deg`);
    signalDisc.style.setProperty('--rx', `${Math.max(-1, Math.min(1, y)) * -13}deg`);
  });
  hero.addEventListener('pointerleave', () => {
    signalDisc.style.setProperty('--ry', '0deg');
    signalDisc.style.setProperty('--rx', '0deg');
  });
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', () => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) target.setAttribute('tabindex', '-1');
  });
});

if (!reducedMotion && supportsFinePointer && cursorFollower && cursorDot) {
  const cursor = {
    currentX: 0,
    currentY: 0,
    targetX: 0,
    targetY: 0,
    initialized: false,
    hovering: false,
  };
  const speed = 0.05;
  const cursorOffset = 30;
  let cursorFrame = null;

  const isInteractive = (element) =>
    element instanceof Element && (
      element.tagName === 'A' ||
      element.tagName === 'BUTTON' ||
      element.classList.contains('cursor-clickable') ||
      element.closest('a, button, .cursor-clickable')
    );

  const renderCursor = () => {
    if (cursor.initialized) {
      cursor.currentX += (cursor.targetX - cursor.currentX) * speed;
      cursor.currentY += (cursor.targetY - cursor.currentY) * speed;
      cursorFollower.style.transform = `translate3d(${cursor.currentX}px, ${cursor.currentY}px, 0)`;
      cursorDot.style.scale = cursor.hovering ? '1.5' : '1';
    }
    const moving = Math.abs(cursor.targetX - cursor.currentX) > 0.1 || Math.abs(cursor.targetY - cursor.currentY) > 0.1;
    cursorFrame = moving ? window.requestAnimationFrame(renderCursor) : null;
  };

  const scheduleCursor = () => {
    if (cursorFrame === null) cursorFrame = window.requestAnimationFrame(renderCursor);
  };

  document.addEventListener('mousemove', (event) => {
    cursor.targetX = event.clientX + cursorOffset;
    cursor.targetY = event.clientY + cursorOffset;
    cursor.hovering = Boolean(isInteractive(event.target));
    if (!cursor.initialized) {
      cursor.currentX = cursor.targetX;
      cursor.currentY = cursor.targetY;
      cursorFollower.style.transform = `translate3d(${cursor.currentX}px, ${cursor.currentY}px, 0)`;
      cursor.initialized = true;
      cursorFollower.classList.add('is-active');
    }
    scheduleCursor();
  });

  document.addEventListener('mouseover', (event) => {
    if (isInteractive(event.target)) cursor.hovering = true;
  });

  document.addEventListener('mouseout', (event) => {
    if (isInteractive(event.target)) cursor.hovering = false;
  });

}
