'use strict';

// Simple toast for copy actions
const copyToast = document.getElementById('copy-toast');
function showCopyToast() {
    if (!copyToast) return;
    copyToast.classList.add('show');
    setTimeout(() => {
        copyToast.classList.remove('show');
    }, 1600);
}


// Canvas+ live demo (iframe): follow this page's language and light / dark mode.
(function () {
    const f = document.getElementById('cp-demo');
    if (!f) return;
    const send = () => { try { f.contentWindow.postMessage({ cpDemo: 1, lang: document.documentElement.lang === 'zh-CN' ? 'zh' : 'en',
        theme: document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light' }, '*'); } catch (e) {} };
    f.addEventListener('load', send);
    // The demo scales itself down below 400px wide; shrink the frame's height to match.
    const fit = () => { const s = Math.min(1, f.clientWidth / 400); f.style.setProperty('height', Math.ceil(526 * s) + 'px', 'important'); };
    fit(); addEventListener('resize', fit);
    new MutationObserver(send).observe(document.documentElement, { attributes: true, attributeFilter: ['lang', 'data-theme'] });
})();

// Theme Toggle Logic (Daytime 米白色 vs Dark Mode 纯黑色)
const themeToggle = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;
const icon = themeToggle.querySelector('i');

// Company logos ship a dark-mode variant (light text on transparent bg)
function syncThemedLogos(isDark) {
    document.querySelectorAll('img[data-dark-src]').forEach(img => {
        const next = isDark ? img.dataset.darkSrc : img.dataset.lightSrc;
        if (img.getAttribute('src') !== next) img.setAttribute('src', next);
    });
}

// Saved preference wins; otherwise follow the OS setting (prefers-color-scheme)
const storedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
if (storedTheme ? storedTheme === 'dark' : prefersDark) {
    htmlElement.setAttribute('data-theme', 'dark');
    icon.className = 'fas fa-sun';
    syncThemedLogos(true);
} else {
    htmlElement.removeAttribute('data-theme');
    icon.className = 'fas fa-moon';
    syncThemedLogos(false);
}

themeToggle.addEventListener('click', () => {
    if (htmlElement.getAttribute('data-theme') === 'dark') {
        htmlElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        icon.className = 'fas fa-moon';
        syncThemedLogos(false);
    } else {
        htmlElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        icon.className = 'fas fa-sun';
        syncThemedLogos(true);
    }
});

// Tech Beam Logic
const profilePic = document.getElementById('profile-pic');
// Click: shockwave + toggle an 8-bit pixel-art version of the photo (drawn on a canvas)
const originalSrc = profilePic.getAttribute('src');
let pixelSrc = null, pixelOn = false;
function makePixelArt(img, blocks) {
    // Same crop as object-fit: cover / center top → a square from the top of the image
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    const sx = (img.naturalWidth - side) / 2;
    const small = document.createElement('canvas');
    small.width = small.height = blocks;
    const sctx = small.getContext('2d');
    sctx.drawImage(img, sx, 0, side, side, 0, 0, blocks, blocks);
    const out = document.createElement('canvas');
    out.width = out.height = 512;
    const octx = out.getContext('2d');
    octx.imageSmoothingEnabled = false;
    octx.drawImage(small, 0, 0, out.width, out.height);
    return out.toDataURL('image/png');
}
profilePic.addEventListener('click', () => {
    profilePic.classList.remove('beam-active');
    void profilePic.offsetWidth; // Trigger reflow
    profilePic.classList.add('beam-active');

    try {
        if (!pixelSrc) pixelSrc = makePixelArt(profilePic, 32);
    } catch (e) {
        return; // canvas tainted (e.g. opened via file://) → keep the shockwave only
    }
    pixelOn = !pixelOn;
    profilePic.classList.add('pixel-swap');
    setTimeout(() => {
        profilePic.src = pixelOn ? pixelSrc : originalSrc;
        profilePic.classList.toggle('pixel-mode', pixelOn);
        profilePic.classList.remove('pixel-swap');
    }, 160);
});

// Click-to-copy WeChat ID
const wechatBtn = document.getElementById('wechat-btn');
if (wechatBtn && navigator.clipboard) {
    wechatBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const wechatID = "_6Jan-Baower";
        navigator.clipboard.writeText(wechatID).then(() => {
            wechatBtn.style.color = "var(--primary)";
            showCopyToast();
            setTimeout(() => {
                wechatBtn.style.color = "";
            }, 1500);
        });
    });
}

// Language Toggle Logic (shared across pages)
const langToggle = document.getElementById('lang-toggle');
// Load saved language or default to English
let currentLang = localStorage.getItem('lang') || 'en';

function updateCardToggleLabels(lang) {
    const currentL = lang || currentLang || 'en';
    document.querySelectorAll('.collapsible-card').forEach(card => {
        const labelEl = card.querySelector('.card-toggle-label');
        const btnEl = card.querySelector('.card-toggle-btn');
        if (!labelEl) return;
        const isExp = card.classList.contains('is-expanded');
        if (isExp) {
            labelEl.textContent = currentL === 'zh' ? '收起详情' : 'Collapse';
            if (btnEl) btnEl.setAttribute('aria-expanded', 'true');
        } else {
            labelEl.textContent = currentL === 'zh' ? '展开详情' : 'View details';
            if (btnEl) btnEl.setAttribute('aria-expanded', 'false');
        }
    });
}

function applyLanguage(lang) {

    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    const currentYear = new Date().getFullYear();
    document.querySelectorAll('[data-en]').forEach(el => {
        const enText = el.getAttribute('data-en');
        const zhText = el.getAttribute('data-zh');
        let text = (lang === 'zh' ? (zhText || enText) : enText) || '';
        if (text) {
            text = text.replace('{YEAR}', currentYear);
            el.innerHTML = text;
        }
    });

    // Update Resume PDF links based on language
    const resumeHref = lang === 'zh' ? 'Baowen_Resume_CN.pdf' : 'Baowen_Resume.pdf';
    document.querySelectorAll('a[href*="Baowen_Resume"]').forEach(a => {
        a.setAttribute('href', resumeHref);
    });
    document.querySelectorAll('[data-href-en]').forEach(el => {
        const enHref = el.getAttribute('data-href-en');
        const zhHref = el.getAttribute('data-href-zh');
        el.setAttribute('href', lang === 'zh' ? (zhHref || enHref) : enHref);
    });

    updateCardToggleLabels(lang);
}

function updateLangToggleLabel() {
    if (!langToggle) return;
    langToggle.textContent = currentLang === 'en' ? 'EN | 中文' : '中 | EN';
}

// Initialize language on page load
applyLanguage(currentLang);
updateLangToggleLabel();

if (langToggle) {
    langToggle.addEventListener('click', () => {
        currentLang = currentLang === 'en' ? 'zh' : 'en';
        localStorage.setItem('lang', currentLang);
        applyLanguage(currentLang);
        updateLangToggleLabel();
    });
}

// --------------------------------------------------------------------------
// Universal Collapsible Cards (Experience, Projects & Skills)
// --------------------------------------------------------------------------
document.querySelectorAll('.collapsible-card').forEach(card => {
    card.addEventListener('click', (e) => {
        // Don't toggle if clicking on links or interactive buttons
        if (e.target.closest('a') || e.target.closest('button')) return;

        const isBodyClick = e.target.closest('.card-collapsible-body');
        const isExpanded = card.classList.contains('is-expanded');

        // If already expanded and clicking inside the body text, don't collapse (allows reading/scrolling/selecting)
        if (isExpanded && isBodyClick) {
            return;
        }

        card.classList.toggle('is-expanded');
        updateCardToggleLabels(currentLang);
    });

    const toggleBtn = card.querySelector('.card-toggle-btn');
    if (toggleBtn) {
        toggleBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.classList.toggle('is-expanded');
                updateCardToggleLabels(currentLang);
            }
        });
    }
});

// --------------------------------------------------------------------------

(function () {
    const FACTS = [
        { emoji: '📷', en: 'Amateur photographer — the gallery is on the About page.', zh: '业余摄影爱好者——About 页有我的照片。' },
        { emoji: '🎮', en: 'PUBG Ace rank. Tactical, not reckless — same as my code.', zh: 'PUBG 王牌段位。讲究战术不莽——写代码也一样。' },
        { emoji: '⛏️', en: 'Minecraft creative-mode builder since forever.', zh: 'Minecraft 创造模式老建筑师。' },
        { emoji: '🎵', en: 'Alan Walker on the way to class, Jay Chou on the way back.', zh: '上课路上听 Alan Walker，回来路上听周杰伦。' },
        { emoji: '📐', en: 'Math minor: I genuinely enjoy linear algebra.', zh: '辅修数学：我是真心喜欢线性代数。' },
        { emoji: '⌨️', en: 'Press ` on this page for a terminal. Try "sudo hire-me".', zh: '在本页按 ` 键有个终端，试试 sudo hire-me。' },
        { emoji: '🔍', en: 'Press ⌘K / Ctrl+K — this site has a command palette.', zh: '按 ⌘K / Ctrl+K——这个网站有命令面板。' },
    ];

    const el = document.getElementById('fun-fact');
    if (!el || !FACTS.length) return;
    const emojiEl = el.querySelector('.fun-fact-emoji');
    const textEl = el.querySelector('.fun-fact-text');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const INTERVAL = 5000;

    // Start on a random fact so repeat visitors see something new
    let i = Math.floor(Math.random() * FACTS.length);
    let timer = null;

    function render() {
        const lang = localStorage.getItem('lang') || 'en';
        emojiEl.textContent = FACTS[i].emoji;
        textEl.textContent = lang === 'zh' ? FACTS[i].zh : FACTS[i].en;
    }
    function next() {
        i = (i + 1) % FACTS.length;
        if (reduceMotion) { render(); return; }
        el.classList.add('swap');
        setTimeout(() => { render(); el.classList.remove('swap'); }, 350);
    }
    function start() { stop(); timer = setInterval(next, INTERVAL); }
    function stop() { if (timer) clearInterval(timer); timer = null; }

    render();
    start();
    el.addEventListener('click', () => { next(); start(); });
    el.addEventListener('mouseenter', stop);
    el.addEventListener('mouseleave', start);
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
    // Re-render in the new language when the toggle is used
    new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();

(function () {
    // ---- Comments live in the repo's Discussions ("Announcements" category, so only
    //      giscus can open threads). IDs come from https://giscus.app for this repo.
    const GISCUS = {
        repo: 'PowerSixxx/PowerSixxx.github.io',
        repoId: 'R_kgDOQredyw',
        category: 'Announcements',
        categoryId: 'DIC_kwDOQredy84DFjI7',
    };

    const container = document.getElementById('giscus-container');
    if (!container) return;

    const html = document.documentElement;
    const giscusTheme = () => (html.getAttribute('data-theme') === 'dark' ? 'noborder_dark' : 'noborder_light');
    const giscusLang = () => ((localStorage.getItem('lang') || 'en') === 'zh' ? 'zh-CN' : 'en');

    // Show a friendly note instead of a broken widget when giscus can't run:
    // not configured yet, or the page was opened as a local file (giscus needs http(s)).
    function showNote(en, zh) {
        container.innerHTML = '<div class="guestbook-note"><i class="fas fa-comment-dots"></i>' +
            '<span data-en="' + en + '" data-zh="' + zh + '">' + en + '</span></div>';
        if (typeof applyLanguage === 'function') applyLanguage(localStorage.getItem('lang') || 'en');
    }
    if (!GISCUS.categoryId || GISCUS.categoryId.startsWith('REPLACE')) {
        showNote('The guestbook is being set up — check back soon!', '留言板正在搭建中，敬请期待！');
        return;
    }
    if (location.protocol === 'file:') {
        showNote('The guestbook only works over http(s) — open this page via a local server or on baowenliu.com.',
            '留言板需要通过 http(s) 访问——请用本地服务或在 baowenliu.com 上查看。');
        return;
    }

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    Object.entries({
        repo: GISCUS.repo,
        'repo-id': GISCUS.repoId,
        category: GISCUS.category,
        'category-id': GISCUS.categoryId,
        mapping: 'specific',
        term: 'Guestbook',            // one shared thread for the whole site
        strict: '0',
        'reactions-enabled': '1',     // 👍 ❤️ 🚀 … on the thread = the "like" button
        'emit-metadata': '0',
        'input-position': 'top',
        theme: giscusTheme(),
        lang: giscusLang(),
        loading: 'lazy',
    }).forEach(([k, v]) => script.setAttribute('data-' + k, v));
    container.appendChild(script);

    // Keep giscus in sync with the site's theme / language toggles
    function pushConfig() {
        const frame = document.querySelector('iframe.giscus-frame');
        if (!frame) return;
        frame.contentWindow.postMessage({ giscus: { setConfig: { theme: giscusTheme(), lang: giscusLang() } } }, 'https://giscus.app');
    }
    new MutationObserver(pushConfig).observe(html, { attributes: true, attributeFilter: ['data-theme', 'lang'] });
})();
