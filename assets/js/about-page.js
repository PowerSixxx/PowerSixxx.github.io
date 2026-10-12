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

function switchTab(tabName) {
    const glider = document.getElementById('glider');
    const btns = document.querySelectorAll('.toggle-btn');

    btns.forEach(btn => btn.classList.remove('active'));

    if(tabName === 'games') {
        glider.style.transform = 'translateX(0)';
        btns[0].classList.add('active');
    } else {
        glider.style.transform = 'translateX(100%)'; 
        btns[1].classList.add('active');
    }

    const gamesPanel = document.getElementById('games-panel');
    const musicPanel = document.getElementById('music-panel');

    if(tabName === 'games') {
        musicPanel.style.display = 'none';
        gamesPanel.style.display = 'grid';
        resetAnimations(gamesPanel);
    } else {
        gamesPanel.style.display = 'none';
        musicPanel.style.display = 'grid';
        resetAnimations(musicPanel);
    }
}

function resetAnimations(panel) {
    const cards = panel.querySelectorAll('.animate-on-scroll');
    cards.forEach(card => {
        card.classList.remove('show');
        setTimeout(() => card.classList.add('show'), 50);
    });
}

// 3. Dark Mode
const btn = document.getElementById('theme-btn');
const icon = btn.querySelector('i');
const html = document.documentElement;

// Saved preference wins; otherwise follow the OS setting (prefers-color-scheme)
const storedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
if (storedTheme ? storedTheme === 'dark' : prefersDark) {
    html.setAttribute('data-theme', 'dark');
    icon.className = 'fas fa-sun';
} else {
    html.removeAttribute('data-theme');
    icon.className = 'fas fa-moon';
}

btn.addEventListener('click', () => {
    if (html.getAttribute('data-theme') === 'dark') {
        html.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        icon.className = 'fas fa-moon';
    } else {
        html.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        icon.className = 'fas fa-sun';
    }
});

// 6. Language Toggle Logic (shared with index.html)
const langToggle = document.getElementById('lang-toggle');
let currentLang = localStorage.getItem('lang') || 'en';

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

document.querySelectorAll('.img-skeleton').forEach(box => {
    const img = box.querySelector('img');
    if (!img) { box.classList.add('is-loaded'); return; }
    const done = () => box.classList.add('is-loaded');
    if (img.complete && img.naturalWidth) done();
    else { img.addEventListener('load', done, { once: true }); img.addEventListener('error', done, { once: true }); }
});
