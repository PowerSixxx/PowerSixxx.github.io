/* ==========================================================================
   Site status card (footer): "online for N days · today X visitors · Y total"
   - Uptime is computed from LAUNCHED (first commit of the site).
   - Visitor numbers come from GoatCounter (privacy-friendly, no cookies,
     free for personal use). Setup:
       1. Sign up at https://www.goatcounter.com and pick a code, e.g. "baowenliu"
       2. Settings → "Allow adding visitor counts on your website" → enable
       3. Put the code in GOATCOUNTER below.
     Until then the card only shows the uptime.
   ========================================================================== */
(function () {
    'use strict';
    if (window.__baowenSiteStats) return;
    window.__baowenSiteStats = true;

    const GOATCOUNTER = 'baowenliu';                 
    const LAUNCHED = '2025-12-19';          // first deploy of the site

    const footer = document.querySelector('footer.watermark-footer');
    if (!footer) return;

    /* ---------------- styles ---------------- */
    const style = document.createElement('style');
    style.textContent = `
    .site-stats{display:inline-flex;align-items:center;flex-wrap:wrap;justify-content:center;gap:.35rem .6rem;margin-top:.55rem;
      padding:.4rem .9rem;border-radius:999px;border:1px solid rgba(255,255,255,.55);background:rgba(255,255,255,.03);
      box-shadow:0 4px 14px rgba(0,0,0,.03),inset 0 1px 0 rgba(255,255,255,.45);font-size:.78rem;color:rgba(51,65,85,.7);
      font-variant-numeric:tabular-nums;}
    .site-stats .dot{width:7px;height:7px;border-radius:50%;background:#22c55e;box-shadow:0 0 0 3px rgba(34,197,94,.18);}
    .site-stats .sep{opacity:.35;}
    .site-stats b{font-weight:600;color:rgba(28,25,23,.85);}
    .site-stats .pending{opacity:.55;}
    html[data-theme="dark"] .site-stats{border-color:rgba(255,255,255,.12);background:rgba(255,255,255,.02);
      box-shadow:0 6px 18px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.08);color:#9ca3af;}
    html[data-theme="dark"] .site-stats b{color:#e5e7eb;}
    `;
    document.head.appendChild(style);

    /* ---------------- DOM ---------------- */
    const card = document.createElement('p');
    card.className = 'site-stats';
    card.setAttribute('aria-live', 'polite');
    const copyright = footer.querySelector('.footer-copyright');
    footer.insertBefore(card, copyright || null);

    const lang = () => (localStorage.getItem('lang') || 'en');
    const days = Math.max(1, Math.floor((Date.now() - new Date(LAUNCHED + 'T00:00:00').getTime()) / 86400000));
    const fmt = (n) => (typeof n === 'number' && isFinite(n) ? n.toLocaleString(lang() === 'zh' ? 'zh-CN' : 'en-US') : null);
    let today = null, total = null, configured = !!GOATCOUNTER;

    function render() {
        const zh = lang() === 'zh';
        // each segment is one flex item so the gap only appears between segments
        const seg = (inner) => `<span>${inner}</span>`;
        let html = `<span class="dot" aria-hidden="true"></span>` +
            seg(zh ? `本站已运行 <b>${days}</b> 天` : `Online for <b>${days}</b> days`);
        if (configured) {
            const t = fmt(today), a = fmt(total);
            const b = (v) => `<b${v === null ? ' class="pending"' : ''}>${v ?? '…'}</b>`;
            html += `<span class="sep">·</span>` + seg(zh ? `今日访客 ${b(t)}` : `Today ${b(t)} visitors`);
            html += `<span class="sep">·</span>` + seg(zh ? `累计 ${b(a)}` : `${b(a)} total`);
        }
        card.innerHTML = html;
    }
    render();
    new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

    if (!configured) return;

    /* ---------------- GoatCounter: tracking + public counts ---------------- */
    const base = `https://${GOATCOUNTER}.goatcounter.com`;

    // Tracking script (no cookies, no personal data). Skips localhost automatically.
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://gc.zgo.at/count.js';
    s.setAttribute('data-goatcounter', base + '/count');
    document.head.appendChild(s);

    // Public counter endpoint: /counter/TOTAL.json = whole site; ?start=YYYY-MM-DD limits the range
    const num = (v) => { const n = parseInt(String(v ?? '').replace(/[^\d]/g, ''), 10); return isNaN(n) ? null : n; };
    const pick = (j) => num(j.count_unique) ?? num(j.count);
    const isoToday = new Date().toISOString().slice(0, 10);
    Promise.allSettled([
        fetch(`${base}/counter/TOTAL.json`).then((r) => r.json()),
        fetch(`${base}/counter/TOTAL.json?start=${isoToday}`).then((r) => r.json()),
    ]).then(([all, day]) => {
        if (all.status === 'fulfilled') total = pick(all.value);
        if (day.status === 'fulfilled') today = pick(day.value);
        if (total === null && today === null) configured = false;   // endpoint not enabled yet → hide counts
        render();
    });
})();
