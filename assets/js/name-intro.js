/* ArtCraft-inspired blade reveal. Keep the real heading intact for the scroll ruler. */
(() => {
  const heading = document.getElementById('name');
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const config = Object.freeze({ wordAt: 350, wordDuration: 850, fadeDuration: 300, fastForward: 4, tuckEm: .12 });
  let animation = null, lastText = '', queued = false;
  function finish() {
    if (animation) { cancelAnimationFrame(animation.raf); animation.layer.remove(); animation = null; }
    heading?.classList.remove('name-intro-active');
    root.classList.remove('name-intro-pending');
  }
  function play() {
    queued = false;
    finish();
    if (!heading) return;
    const text = heading.textContent.trim();
    if (text === lastText) return;
    lastText = text;
    if (reduce.matches || !heading.animate || scrollY > 40 || heading.firstChild?.nodeType !== Node.TEXT_NODE) return;
    const box = heading.getBoundingClientRect(), hero = heading.closest('.ac-hero');
    const parent = hero.getBoundingClientRect(), style = getComputedStyle(heading);
    const range = document.createRange(), glyphs = [];
    let offset = 0;
    for (const char of Array.from(text)) {
      range.setStart(heading.firstChild, offset); offset += char.length; range.setEnd(heading.firstChild, offset);
      const rect = range.getBoundingClientRect();
      glyphs.push({ char, x: rect.left - box.left, y: rect.top - box.top, width: rect.width, height: rect.height });
    }
    if (!glyphs.length || box.width === 0) return;
    const layer = document.createElement('div');
    layer.className = 'name-intro-layer'; layer.setAttribute('aria-hidden', 'true');
    Object.assign(layer.style, { left: `${box.left-parent.left}px`, top: `${box.top-parent.top}px`, width: `${box.width}px`, height: `${box.height}px`, font: style.font, letterSpacing: style.letterSpacing, color: style.color });
    for (const g of glyphs) {
      g.node = document.createElement('span'); g.node.textContent = g.char;
      Object.assign(g.node.style, { left: `${g.x}px`, top: `${g.y}px`, height: `${g.height}px`, lineHeight: `${g.height}px` });
      layer.append(g.node);
    }
    hero.append(layer); heading.classList.add('name-intro-active');
    const first = glyphs[0], end = glyphs.at(-1), center = (first.x + end.x + end.width) / 2;
    const startX = center - (first.x + first.width / 2);
    const tuck = -(end.x + end.width - first.x - first.width) - parseFloat(style.fontSize) * config.tuckEm;
    const state = { layer, raf: 0, time: 0, previous: performance.now(), speed: 1 };
    animation = state;
    const clamp = n => Math.max(0, Math.min(1, n));
    function frame(now) {
      state.time += Math.min(now-state.previous, 100) * state.speed; state.previous = now;
      const p = clamp((state.time-config.wordAt)/config.wordDuration);
      const glide = p < .5 ? 4*p*p*p : 1-Math.pow(-2*p+2,3)/2;
      const firstShift = startX * (1-glide), shift = tuck * Math.pow(1-p,3);
      first.node.style.transform = `translateX(${firstShift}px)`;
      first.node.style.opacity = clamp(state.time/config.fadeDuration);
      const blade = first.x + first.width + firstShift;
      for (const g of glyphs.slice(1)) {
        g.node.style.transform = `translateX(${shift}px)`;
        g.node.style.clipPath = `inset(-20% -20% -20% ${Math.max(0,blade-g.x-shift)}px)`;
      }
      if (p === 1) finish(); else state.raf = requestAnimationFrame(frame);
    }
    frame(state.previous);
  }
  function schedule() { if (!queued) { queued = true; queueMicrotask(play); } }
  if (heading) new MutationObserver(schedule).observe(heading, { childList: true, characterData: true, subtree: true });
  function accelerate() { if (animation) animation.speed = config.fastForward; }
  ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(type => window.addEventListener(type, accelerate, { passive: true }));
  window.addEventListener('scroll', () => { if (scrollY > 40) finish(); }, { passive: true });
  window.addEventListener('resize', finish);
  window.addEventListener('pagehide', finish);
  window.addEventListener('pageshow', event => { if (event.persisted) finish(); });
  reduce.addEventListener('change', () => { if (reduce.matches) finish(); });
  play();
})();
