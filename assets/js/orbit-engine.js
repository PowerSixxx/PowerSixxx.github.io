(() => {
  'use strict';
  const config = window.ORBIT_CONFIG;
  const stage = document.querySelector('.universe');
  const canvas = document.querySelector('#tracks');
  const context = canvas.getContext('2d');
  const layer = document.querySelector('#cards');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const clamp = x => Math.max(0, Math.min(1, x));
  const fract = x => (x % 1 + 1) % 1;
  const smooth = x => { x = clamp(x); return x * x * (3 - 2 * x); };
  const ease = x => 1 - Math.pow(1 - clamp(x), 3);
  const damp = (v, target, dt, tau) => v + (target - v) * (1 - Math.exp(-dt / tau));
  let layout, cards = [], width = 0, height = 0, raf = 0, last = 0;
  let time = 0, idle = 0, spin = 0, target = -1, hold = 0, rest = 0;
  let paused = false, visible = true, boost = -1, boostAmount = 0, ripples = [];
  let pointer = { x: 0, y: 0, active: false };
  let colors;

  function readColors() {
    const css = getComputedStyle(document.documentElement);
    colors = { ink: css.getPropertyValue('--ink').trim(), accent: css.getPropertyValue('--accent').trim() };
  }
  function rebuild() {
    const rect = stage.getBoundingClientRect(); width = rect.width; height = rect.height;
    const area = width * height / 1e6, mobile = area < config.mobile.belowMegapixels;
    const l = config.layout, m = config.mobile;
    const arms = mobile ? m.arms : l.arms;
    const requestedCount = mobile ? m.cardCount : Math.max(6, Math.min(l.cardCount, Math.round(l.cardCount * area / l.referenceMegapixels)));
    const count = config.uniqueImages ? Math.min(requestedCount, config.images.length) : requestedCount;
    const diagonal = Math.hypot(width, height) / 2;
    const radius = diagonal * (mobile ? m.radiusFraction : l.radiusFraction);
    const thetaMax = (mobile ? m.turns : l.turns) * Math.PI * 2;
    const pitch = radius / thetaMax;
    const cap = Math.min(340, Math.max(70, height * (mobile ? m.cardHeightFraction : l.cardHeightFraction)));
    layout = { mobile, arms, count, radius, thetaMax, pitch, cap,
      birth: thetaMax * (mobile ? m.birthFraction : l.birthFraction),
      cardExit: diagonal * (mobile ? m.cardRadiusFraction : l.cardRadiusFraction) / pitch,
      exit: (diagonal + 1.5 * cap) / pitch, slots: Math.ceil(count / arms) };
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    cards.forEach(card => window.ProgressivePhotos?.unmount(card.element));
    layer.replaceChildren(); target = -1; boost = -1; boostAmount = 0;
    const fragment = document.createDocumentFragment();
    cards = Array.from({ length: count }, (_, i) => {
      const element = document.createElement('div'); element.className = 'orbit-card';
      const image = document.createElement('img');
      const source = config.images[i % config.images.length];
      if (window.ProgressivePhotos) window.ProgressivePhotos.mount(element, image, source);
      else image.src = source;
      image.alt = ''; image.draggable = false; image.decoding = 'async';
      if (!window.ProgressivePhotos) image.addEventListener('error', () => {
        image.hidden = true; element.style.background = `hsl(${i * 47 % 360} 25% 65%)`;
      });
      element.append(image); fragment.append(element);
      return { element, i, arm: i % arms, slot: Math.floor(i / arms), offset: 0,
        x: 0, y: 0, p: 0, h: 0, w: 0, focus: 0, drawX: 0, drawY: 0 };
    });
    layer.append(fragment); readColors(); render(0); schedule();
  }
  function position(card, journey, dt, wave) {
    const m = config.motion, p = config.pointer, l = layout;
    card.offset -= journey * (card.i === target ? Math.max(hold, rest) : rest);
    const phase = config.layout.evenPhases ? (card.i + .5) / l.count : (card.slot + .5 + card.arm * config.layout.armJitter) / l.slots;
    card.p = Math.max(0, fract(phase + idle + (reduce.matches ? 0 : scrollY * m.scrollJourneysPer1000px / 1000) + card.offset) - (reduce.matches ? 0 : m.rollChunk * (1 - wave)));
    const theta = l.birth + card.p * (l.cardExit - l.birth), radius = l.pitch * theta;
    const angle = theta + card.arm * Math.PI * 2 / l.arms;
    const wobble = reduce.matches ? 0 : m.wobblePixels * (1 + (p.holdWobbleMultiplier - 1) * rest) * (1 - card.focus);
    const a = Math.sin(time * m.wobbleHz * Math.PI * 2 + 2.399 * card.i);
    const b = Math.cos(time * m.wobbleHz * Math.PI * 1.4 + 1.713 * card.i);
    const x = radius * Math.cos(angle) + wobble * (-a * Math.sin(angle) + .6 * b * Math.cos(angle));
    const y = radius * Math.sin(angle) + wobble * (a * Math.cos(angle) + .6 * b * Math.sin(angle));
    card.x = x * Math.cos(spin) - y * Math.sin(spin);
    card.y = x * Math.sin(spin) + y * Math.cos(spin);
    if (pointer.active && !reduce.matches) {
      const dx = pointer.x - card.x, dy = pointer.y - card.y, distance = Math.hypot(dx, dy);
      const force = p.tugPixels * Math.exp(-distance * distance / (p.fieldPixels * p.fieldPixels)) * (1 - hold) * (1 - card.focus) / Math.max(1, distance);
      card.x += dx * force; card.y += dy * force;
    }
  }
  function findTarget() {
    if (!pointer.active || reduce.matches) return -1;
    const hit = c => Math.abs(pointer.x - c.x) < c.w / 2 + 16 && Math.abs(pointer.y - c.y) < c.h / 2 + 16 && c.p > .04;
    if (target >= 0 && hit(cards[target])) return target;
    return cards.filter(hit).sort((a, b) => b.p - a.p)[0]?.i ?? -1;
  }
  function drawTracks(wave) {
    context.clearRect(0, 0, width, height);
    context.save(); context.translate(width / 2, height / 2); context.scale(1, -1); context.rotate(spin);
    const l = layout, look = config.look;
    const point = (theta, arm) => [l.pitch * theta * Math.cos(theta + arm * 2 * Math.PI / l.arms), l.pitch * theta * Math.sin(theta + arm * 2 * Math.PI / l.arms)];
    for (let arm = 0; arm < l.arms; arm++) {
      context.beginPath();
      for (let i = 0; i <= 200; i++) {
        const theta = .3 * l.birth + i / 200 * (l.exit - .3 * l.birth), [x, y] = point(theta, arm);
        i ? context.lineTo(x, y) : context.moveTo(x, y);
      }
      context.strokeStyle = colors.ink; context.globalAlpha = look.lineAlpha * wave;
      context.lineWidth = look.linePixels; context.stroke();
      if (!reduce.matches) {
        // Same outward band phase and asymmetric Gaussian as the captured ribbon shader.
        for (let segment = 0; segment < 200; segment++) {
          const progress = (segment + .5) / 200;
          const phase = fract(progress * look.pulsesPerArm - time * look.pulseSpeed + arm * .618) - .5;
          const sigma = look.pulseWidth * (phase < 0 ? 1.7 : .55);
          let strength = Math.exp(-.5 * (phase / sigma) ** 2) * smooth((progress - .04) / .1);
          const theta = .3 * l.birth + progress * (l.exit - .3 * l.birth);
          strength *= clamp((wave * l.pitch * l.exit - l.pitch * theta) / 220);
          if (strength < .01) continue;
          const [x, y] = point(theta, arm), [x2, y2] = point(theta + (l.exit - .3 * l.birth) / 200, arm);
          context.beginPath(); context.moveTo(x, y); context.lineTo(x2, y2);
          context.strokeStyle = document.documentElement.dataset.theme === 'dark' ? colors.accent : colors.ink;
          context.globalAlpha = look.pulseAlpha * strength * .62;
          context.lineWidth = look.linePixels + look.pulseExtraPixels * strength; context.stroke();
        }
      }
      context.globalAlpha = look.tickAlpha * wave; context.lineWidth = 1; context.strokeStyle = colors.ink;
      context.beginPath();
      for (let tick = 0; tick < config.layout.ticksPerArm; tick++) {
        const theta = l.thetaMax * (.45 + .55 * (tick + .5) / config.layout.ticksPerArm);
        const angle = theta + arm * 2 * Math.PI / l.arms, r = l.pitch * theta;
        context.moveTo((r - 6) * Math.cos(angle), (r - 6) * Math.sin(angle));
        context.lineTo((r + 6) * Math.cos(angle), (r + 6) * Math.sin(angle));
      }
      context.stroke();
    }
    context.globalAlpha = look.lineAlpha * wave; context.lineWidth = 1; context.setLineDash([14, 14]);
    context.beginPath(); context.arc(0, 0, l.radius * config.layout.circleFraction, 0, Math.PI * 2); context.stroke();
    context.restore();
  }
  function render(dt) {
    const m = config.motion, p = config.pointer, look = config.look;
    const still = reduce.matches;
    const wave = still ? 1 : ease((time - m.cardsAt) / m.introSeconds);
    const burst = still ? 1 : 1 + (m.burstMultiplier - 1) * (1 - ease((time - m.cardsAt) / m.burstSeconds));
    const previous = idle + (still ? 0 : (render.previousScroll || 0) * m.scrollJourneysPer1000px / 1000);
    if (!still) { idle += dt * m.journeysPerMinute * burst / 60; spin += dt * m.spinDegreesPerMinute * Math.PI / 180 / 60 * (1 - rest); }
    const journey = idle + (still ? 0 : scrollY * m.scrollJourneysPer1000px / 1000) - previous;
    render.previousScroll = scrollY;
    hold = damp(hold, target >= 0 ? 1 : 0, dt, p.holdSeconds);
    rest = damp(rest, target >= 0 ? 1 : 0, dt, p.restSeconds);
    cards.forEach(card => position(card, journey, dt, wave));
    target = findTarget(); if (target !== boost) boost = -1;
    boostAmount = damp(boostAmount, boost >= 0 ? 1 : 0, dt, p.boostSeconds);
    for (const card of cards) {
      card.focus = damp(card.focus, card.i === target ? 1 : 0, dt, p.targetSeconds);
      let gap = Infinity, pinGap = Infinity;
      for (const other of cards) {
        if (card === other) continue;
        const distance = Math.max(9 * Math.abs(other.x - card.x) / 16, Math.abs(other.y - card.y));
        if (other.i === target && other.focus > .3) pinGap = Math.min(pinGap, .98 * Math.max(0, 2 * distance - other.h));
        else gap = Math.min(gap, distance);
      }
      const wanted = Math.min(layout.cap * (look.innerCap + (1 - look.innerCap) * card.p), look.density * (layout.mobile ? config.mobile.densityMultiplier : 1) * gap, pinGap);
      card.h = dt === 0 ? wanted : wanted < card.h && card.focus <= .3 ? wanted : damp(card.h, wanted, dt, card.focus > .3 ? 1 / 6 : 1 / 3);
      const h = Math.max(.01, card.h) * (card.i === boost ? 1 + (p.boostScale - 1) * boostAmount : 1);
      card.w = card.h * (1 + (16 / 9 - 1) * smooth(card.p / look.squareUntil));
      const w = h * (1 + (16 / 9 - 1) * smooth(card.p / look.squareUntil));
      const reveal = still ? 1 : clamp((wave * layout.pitch * layout.exit - layout.pitch * (layout.birth + card.p * (layout.exit - layout.birth))) / 220);
      const opacity = clamp(card.p / look.birthFade) * smooth((1 - card.p) / look.exitFade) * reveal;
      const blur = (1 - smooth(card.p / look.blurEnd)) * 12 * (1 - card.focus) + (1 - reveal) * 10;
      const distance = Math.hypot(pointer.x - card.x, pointer.y - card.y);
      const field = pointer.active ? Math.exp(-(distance ** 2) / p.fieldPixels ** 2) * (1 - hold) : 0;
      const tilt = p.tiltDegrees * field * (1 - card.focus);
      const el = card.element;
      el.style.width = `${w.toFixed(2)}px`; el.style.height = `${h.toFixed(2)}px`;
      el.style.transform = `translate3d(${(width / 2 + card.x - w / 2).toFixed(2)}px,${(height / 2 - card.y - h / 2).toFixed(2)}px,0) perspective(800px) rotateX(${tilt.toFixed(2)}deg) rotateY(${(-tilt).toFixed(2)}deg)`;
      el.style.opacity = opacity.toFixed(3); el.style.filter = `blur(${blur.toFixed(2)}px)`;
      el.style.borderRadius = `${Math.min(look.cornerPixels, .49 * h)}px`;
      el.style.zIndex = String(10 + Math.round(card.p * 100) + Math.round(card.focus * 500));
      card.drawX = width / 2 + card.x; card.drawY = height / 2 - card.y;
    }
    drawTracks(still ? 1 : smooth(time / 1.2));
    ripples = ripples.filter(r => time - r.start < p.rippleSeconds);
    for (const r of ripples) {
      const age = time - r.start;
      context.beginPath(); context.arc(r.x, r.y, age * p.ripplePixelsPerSecond, 0, Math.PI * 2);
      context.strokeStyle = colors.accent; context.globalAlpha = .12 * (1 - age / p.rippleSeconds); context.lineWidth = 2; context.stroke();
    }
    context.globalAlpha = 1;
    // Read-only diagnostics for measured browser validation; no runtime dependencies.
    stage.dataset.state = still ? 'reduced' : paused ? 'paused' : 'running';
    stage.dataset.target = String(target);
    stage.dataset.pointer = JSON.stringify(pointer);
    stage.dataset.hold = rest.toFixed(3);
    stage.dataset.journey = idle.toFixed(5);
  }
  function frame(now) {
    raf = 0; const dt = last ? Math.min((now - last) / 1000, .05) : 0; last = now;
    time += dt; render(dt); schedule();
  }
  function schedule() { if (!raf && !paused && !reduce.matches && visible && !document.hidden) raf = requestAnimationFrame(frame); }
  function stop() { cancelAnimationFrame(raf); raf = 0; last = 0; }
  stage.addEventListener('pointermove', event => {
    if (!finePointer.matches) return;
    const r = stage.getBoundingClientRect();
    pointer = { x: event.clientX - r.left - width / 2, y: -(event.clientY - r.top - height / 2), active: true };
  });
  stage.addEventListener('pointerleave', () => { pointer.active = false; });
  stage.addEventListener('pointercancel', () => { pointer.active = false; });
  stage.addEventListener('pointerdown', event => {
    if (reduce.matches) return;
    if (target >= 0) boost = boost === target ? -1 : target;
    const r = stage.getBoundingClientRect(); ripples.push({ x: event.clientX - r.left, y: event.clientY - r.top, start: time });
  });
  const motion = document.querySelector('#motion');
  motion.addEventListener('click', () => {
    paused = !paused; motion.textContent = paused ? '▷' : 'Ⅱ';
    motion.setAttribute('aria-pressed', String(paused)); motion.setAttribute('aria-label', paused ? 'Resume animation' : 'Pause animation');
    if (paused) { stop(); render(0); } else schedule();
  });
  function reducedChange() {
    stop(); pointer.active = false; target = -1; hold = rest = 0;
    motion.disabled = reduce.matches; motion.title = reduce.matches ? 'System reduced motion is enabled' : '';
    render(0); schedule();
  }
  reduce.addEventListener('change', reducedChange);
  document.addEventListener('visibilitychange', () => { stop(); schedule(); });
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (!visible) stop(); else schedule(); }, { rootMargin: '80px' }).observe(stage);
  new MutationObserver(() => { readColors(); if (layout && (paused || reduce.matches)) render(0); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  new ResizeObserver(rebuild).observe(stage);
  rebuild(); reducedChange();
})();
