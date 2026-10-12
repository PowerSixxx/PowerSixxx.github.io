'use strict';

(function () {
    const html = document.documentElement;

    // ---- Language (shared with the rest of the site via localStorage) ----
    let currentLang = localStorage.getItem('lang') || 'en';
    function applyLanguage(lang) {
        html.lang = lang === 'zh' ? 'zh-CN' : 'en';
        document.querySelectorAll('[data-en]').forEach(el => {
            const v = lang === 'zh' ? (el.getAttribute('data-zh') || el.getAttribute('data-en')) : el.getAttribute('data-en');
            if (v) el.innerHTML = v;
        });
        document.querySelectorAll('[data-href-en]').forEach(el => {
            el.setAttribute('href', lang === 'zh' ? el.getAttribute('data-href-zh') : el.getAttribute('data-href-en'));
        });
        document.title = lang === 'zh' ? '简历 – 刘宝文' : 'Resume – Baowen Liu';
    }
    applyLanguage(currentLang);
    document.getElementById('lang-toggle').addEventListener('click', () => {
        currentLang = currentLang === 'en' ? 'zh' : 'en';
        localStorage.setItem('lang', currentLang);
        applyLanguage(currentLang);
    });

    // ---- Theme ----
    const themeBtn = document.getElementById('theme-toggle');
    const icon = themeBtn.querySelector('i');
    const syncIcon = () => { icon.className = html.getAttribute('data-theme') === 'dark' ? 'fas fa-sun' : 'fas fa-moon'; };
    syncIcon();
    themeBtn.addEventListener('click', () => {
        const dark = html.getAttribute('data-theme') === 'dark';
        if (dark) html.removeAttribute('data-theme'); else html.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', dark ? 'light' : 'dark');
        syncIcon();
    });
})();
