(() => {
  'use strict';
  const root = document.documentElement;
  const nav = document.querySelector('.ac-nav');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  function applyLanguage(lang) {
    const legacy = window.applyLanguage;
    if (typeof legacy === 'function') { legacy(lang); return; }
    root.lang = lang === 'zh' ? 'zh-CN' : 'en';
    document.querySelectorAll('[data-en]').forEach(el => {
      el.innerHTML = el.getAttribute(lang === 'zh' ? 'data-zh' : 'data-en') || el.getAttribute('data-en');
    });
    document.querySelectorAll('[data-href-en]').forEach(el => {
      el.href = el.getAttribute(lang === 'zh' ? 'data-href-zh' : 'data-href-en');
    });
  }
  const newLang = document.querySelector('#ac-lang');
  newLang?.addEventListener('click', () => {
    const oldLang = document.querySelector('#lang-toggle');
    if (oldLang) { oldLang.click(); return; }
    const lang = root.lang.startsWith('zh') ? 'en' : 'zh';
    localStorage.setItem('lang', lang); applyLanguage(lang);
  });
  const newTheme = document.querySelector('#ac-theme');
  newTheme?.addEventListener('click', () => {
    const oldTheme = document.querySelector('#theme-toggle');
    if (oldTheme) { oldTheme.click(); return; }
    const dark = root.dataset.theme !== 'dark';
    root.dataset.theme = dark ? 'dark' : 'light'; localStorage.setItem('theme', dark ? 'dark' : 'light');
  });
  const menu = document.querySelector('.ac-menu-toggle');
  function closeMenu() { nav?.classList.remove('is-open'); menu?.setAttribute('aria-expanded', 'false'); }
  menu?.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open'); menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });

  // Keep the photographic grid browsable without navigating away from About.
  const photographs = [...document.querySelectorAll('.photo-card')];
  if (photographs.length) {
    const dialog = document.createElement('dialog'); dialog.className = 'ac-lightbox';
    dialog.setAttribute('aria-label', 'Photography viewer');
    dialog.innerHTML = '<button class="ac-lightbox-close" aria-label="Close photography viewer">×</button><img alt=""><p></p><div class="ac-lightbox-controls"><button aria-label="Previous photograph">←</button><span></span><button aria-label="Next photograph">→</button></div>';
    document.body.append(dialog);
    let photoIndex = 0;
    function showPhoto(index) {
      photoIndex = (index + photographs.length) % photographs.length;
      const source = photographs[photoIndex].querySelector('img');
      const image = dialog.querySelector('img'); image.src = source.dataset.src || source.src; image.alt = source.alt;
      dialog.querySelector('p').textContent = photographs[photoIndex].querySelector('figcaption')?.textContent.trim() || source.alt;
      dialog.querySelector('.ac-lightbox-controls span').textContent = `${photoIndex + 1} / ${photographs.length}`;
    }
    photographs.forEach((figure, i) => {
      const imageWrapper = figure.querySelector('.progressive-photo, .img-skeleton'); if (!imageWrapper) return;
      const button = document.createElement('button'); button.className = 'ac-photo-open';
      button.setAttribute('aria-label', `Open photograph: ${figure.querySelector('img').alt}`);
      imageWrapper.replaceWith(button); button.append(imageWrapper);
      button.addEventListener('click', () => { showPhoto(i); dialog.showModal(); });
    });
    dialog.querySelector('.ac-lightbox-close').addEventListener('click', () => dialog.close());
    dialog.querySelector('[aria-label="Previous photograph"]').addEventListener('click', () => showPhoto(photoIndex - 1));
    dialog.querySelector('[aria-label="Next photograph"]').addEventListener('click', () => showPhoto(photoIndex + 1));
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight') showPhoto(photoIndex + 1);
      if (event.key === 'ArrowLeft') showPhoto(photoIndex - 1);
    });
  }

  const skip = document.createElement('a'); skip.href = '#site-content'; skip.className = 'ac-skip'; skip.textContent = 'Skip to content';
  document.body.prepend(skip);
  const firstContent = document.querySelector('.hero, .header, .container, main, .box');
  if (firstContent && !firstContent.id) firstContent.id = 'site-content';
  else if (firstContent) skip.href = `#${firstContent.id}`;
  document.querySelector('footer.watermark-footer')?.setAttribute('data-rail', 'CONTACT');
  const sectionList = [...document.querySelectorAll('[data-rail], .ac-resume-section')];
  sectionList.forEach((section, i) => {
    if (!section.id) section.id = `chapter-${i + 1}`;
    if (!section.dataset.rail) section.dataset.rail = section.querySelector('h2')?.textContent.trim() || `Chapter ${i + 1}`;
  });
  let instrument;
  function schedule() { instrument?.refresh(); }
  function syncLabels() {
    document.querySelectorAll('.ac-language').forEach(button => { button.textContent = root.lang.startsWith('zh') ? '中文 / EN' : 'EN / 中文'; });
    document.querySelectorAll('.ac-theme').forEach(button => { button.setAttribute('aria-label', root.dataset.theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'); });
    sectionList.forEach((section, i) => {
      const translated = { HOME: '首页', CONTACT: '联系', 'IN PROGRESS': '近况', EDUCATION: '教育', EXPERIENCE: '经历', LEARNING: '学习', PROJECTS: '项目', CAPABILITIES: '技能', GUESTBOOK: '留言', INTRODUCTION: '介绍', INTERESTS: '兴趣', PHOTOGRAPHY: '摄影' };
      const label = translated[section.dataset.rail] || section.querySelector('h2')?.textContent.trim();
      section.dataset.instrumentLabel = root.lang.startsWith('zh') && label ? label : section.dataset.rail;
    });
    schedule();
  }
  new MutationObserver(syncLabels).observe(root, { attributes: true, attributeFilter: ['lang', 'data-theme'] });
  const revealTargets = [...document.querySelectorAll('.ac-section>h2,.ac-photo-break>div,.ac-page-heading,.header-title-row')];
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
  }), { rootMargin: '60px', threshold: .08 });
  revealTargets.forEach(el => { el.classList.add('ac-reveal'); observer.observe(el); });
  reduced.addEventListener('change', () => { if (reduced.matches) revealTargets.forEach(el => el.classList.add('is-visible')); });
  applyLanguage(localStorage.getItem('lang') || 'en'); syncLabels();
  instrument = window.createScrollInstrument?.(sectionList);
})();
