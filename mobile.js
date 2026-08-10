(() => {
  const sourceNav = document.querySelector('.desktop-nav, .chapter-nav, .project-nav-links');
  if (!sourceNav || document.querySelector('.mobile-tabbar')) return;

  const mobileNav = document.createElement('nav');
  mobileNav.className = 'mobile-tabbar';
  mobileNav.setAttribute('aria-label', '移动端主导航');

  sourceNav.querySelectorAll('a').forEach((link) => {
    const mobileLink = link.cloneNode(true);
    mobileLink.removeAttribute('style');
    mobileNav.appendChild(mobileLink);
  });
  document.body.appendChild(mobileNav);

  const detailNav = document.querySelector('.project-nav');
  const currentSection = sourceNav.querySelector('[aria-current="page"]');
  if (detailNav && currentSection) {
    const sectionName = currentSection.textContent.trim();
    const backLabel = `返回${sectionName.startsWith('AI') ? ' ' : ''}${sectionName}`;
    const backLink = document.createElement('a');
    backLink.className = 'mobile-back-link';
    backLink.href = currentSection.href;
    backLink.textContent = backLabel;
    backLink.setAttribute('aria-label', `${backLabel}总览`);
    detailNav.insertBefore(backLink, detailNav.querySelector('.project-nav-links'));
  }

  const mobileQuery = window.matchMedia('(max-width: 900px)');
  const contact = document.querySelector('.resume-contact');
  const contactButton = contact?.querySelector('button');
  const contactPopover = contact?.querySelector('.resume-contact__popover');
  const contactNote = contactPopover?.querySelector('p');

  if (!contact || !contactButton || !contactPopover) return;

  if (!contactPopover.id) contactPopover.id = 'contact-popover';
  contactPopover.setAttribute('role', 'dialog');
  contactPopover.setAttribute('aria-label', '微信联系方式');
  contactButton.setAttribute('aria-controls', contactPopover.id);
  contactButton.setAttribute('aria-expanded', 'false');

  const closeContact = () => {
    contact.classList.remove('is-open');
    contactButton.setAttribute('aria-expanded', 'false');
    contactButton.blur();
  };

  const syncMobileContactCopy = () => {
    if (mobileQuery.matches) {
      contactButton.setAttribute('aria-label', '联系我，点按查看微信二维码');
      if (contactNote) contactNote.innerHTML = '长按保存二维码<br />再到微信中识别';
    } else {
      contactButton.setAttribute('aria-label', '联系我，悬停查看微信二维码');
      if (contactNote) contactNote.innerHTML = '微信联系我<br />扫码添加微信';
      closeContact();
    }
  };

  contactButton.addEventListener('click', (event) => {
    if (!mobileQuery.matches) return;
    event.stopPropagation();
    const willOpen = !contact.classList.contains('is-open');
    if (willOpen) {
      contact.classList.add('is-open');
      contactButton.setAttribute('aria-expanded', 'true');
    } else {
      closeContact();
    }
  });

  document.addEventListener('pointerdown', (event) => {
    if (mobileQuery.matches && !contact.contains(event.target)) closeContact();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeContact();
  });

  if (mobileQuery.addEventListener) {
    mobileQuery.addEventListener('change', syncMobileContactCopy);
  } else {
    mobileQuery.addListener(syncMobileContactCopy);
  }
  syncMobileContactCopy();
})();
