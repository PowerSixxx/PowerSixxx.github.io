(() => {
  'use strict';
  const previews = window.PHOTO_PREVIEWS || {};
  const states = new WeakMap();
  const observer = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) load(entry.target);
    }), { rootMargin: '300px', threshold: 0 }) : null;

  function load(frame) {
    const state = states.get(frame);
    if (!state || state.loading || state.loaded) return;
    observer?.unobserve(frame);
    state.loading = true;
    frame.classList.remove('is-error');
    frame.setAttribute('aria-busy', 'true');
    const { image, source } = state;
    // Explicit observation sets src; browser-native lazy thresholds are much larger.
    image.loading = 'eager';
    image.decoding = 'async';
    image.addEventListener('load', async () => {
      try { await image.decode(); } catch (_) { /* A loaded image may already be decoded. */ }
      if (!image.naturalWidth) return;
      state.loaded = true;
      frame.setAttribute('aria-busy', 'false');
      requestAnimationFrame(() => frame.classList.add('is-loaded'));
    }, { once: true });
    image.addEventListener('error', () => {
      state.loading = false;
      frame.setAttribute('aria-busy', 'false');
      frame.classList.add('is-error');
      // Keep the colour + preview; never paint a broken-image icon over it.
      image.removeAttribute('src');
    }, { once: true });
    image.src = source;
  }

  function mount(frame, image, source) {
    if (states.has(frame)) return;
    const meta = previews[source];
    frame.classList.add('progressive-photo');
    image.classList.add('progressive-photo-image');
    image.dataset.src = source;
    if (meta) {
      frame.style.setProperty('--photo-colour', meta.colour);
      // Custom-property URLs otherwise resolve against the consuming CSS file.
      const previewURL = new URL(meta.preview, document.baseURI).href;
      frame.style.setProperty('--photo-preview', `url("${previewURL}")`);
      image.width = meta.width; image.height = meta.height;
    }
    states.set(frame, { image, source, loading: false, loaded: false });
    if (observer) observer.observe(frame); else load(frame);
  }

  window.ProgressivePhotos = {
    mount, load,
    unmount(frame) { observer?.unobserve(frame); states.delete(frame); }
  };
  document.querySelectorAll('[data-progressive-photo]').forEach(frame => {
    const image = frame.querySelector('img[data-src]');
    if (image) mount(frame, image, image.dataset.src);
  });
})();
