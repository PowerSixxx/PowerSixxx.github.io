/* ==========================================================================
   Command palette (⌘K / Ctrl+K)
   - Spotlight-style quick search: jump to sections/pages, run actions
     (theme, language, resume, copy contact info), open links.
   - Self-contained: injects its own CSS + DOM; works on every page.
   - Follows the site's theme and language (localStorage `theme` / `lang`).
   ========================================================================== */
(function () {
    'use strict';
    if (window.__baowenPalette) return;
    window.__baowenPalette = true;

    /* ---------------------------------------------------------------------
       Helpers: site state
       --------------------------------------------------------------------- */
    const html = document.documentElement;
    const isDark = () => html.getAttribute('data-theme') === 'dark';
    const lang = () => (localStorage.getItem('lang') || 'en');
    const t = (en, zh) => (lang() === 'zh' ? zh : en);
    const onHome = /(^|\/)(index\.html)?$/.test(location.pathname);
    const isMac = /Mac|iPhone|iPad/.test(navigator.platform);

    function setTheme(mode) {
        if ((mode === 'dark') === isDark()) return;
        const btn = document.getElementById('theme-toggle') || document.getElementById('theme-btn');
        if (btn) { btn.click(); return; }
        // Pages without a toggle button (study / projects)
        if (mode === 'dark') html.setAttribute('data-theme', 'dark'); else html.removeAttribute('data-theme');
        localStorage.setItem('theme', mode);
    }
    function setLang(next) {
        if (lang() === next) return;
        const btn = document.getElementById('lang-toggle');
        if (btn) { btn.click(); return; }
        localStorage.setItem('lang', next);
        html.lang = next === 'zh' ? 'zh-CN' : 'en';
        document.querySelectorAll('[data-en]').forEach((el) => {
            const v = next === 'zh' ? (el.getAttribute('data-zh') || el.getAttribute('data-en')) : el.getAttribute('data-en');
            if (v) el.innerHTML = v;
        });
    }
    function goSection(id) {
        if (onHome) {
            const el = document.getElementById(id);
            if (el) { el.scrollIntoView({ behavior: 'smooth' }); return; }
        }
        location.href = 'index.html#' + id;
    }
    function copy(text, label) {
        const done = () => toast(t('Copied ' + label, '已复制' + label));
        if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, done));
        else fallbackCopy(text, done);
    }
    function fallbackCopy(text, done) {
        const ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); done(); } catch (e) { /* ignore */ }
        ta.remove();
    }
    let toastEl, toastTimer;
    function toast(msg) {
        if (!toastEl) {
            toastEl = document.createElement('div');
            toastEl.className = 'cp-toast';
            document.body.appendChild(toastEl);
        }
        toastEl.textContent = msg;
        toastEl.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1600);
    }

    /* ---------------------------------------------------------------------
       Commands
       --------------------------------------------------------------------- */
    const EMAIL = 'liu.11884@osu.edu';
    const PHONE_US = '+1 380-249-9220';
    const PHONE_CN = '+86 135-8181-5272';
    const WECHAT = '_6Jan-Baower';

    // group: 'nav' | 'action' | 'link'; keys: extra search terms (both languages)
    const COMMANDS = [
        // ---- Navigate
        { group: 'nav', icon: 'fa-house', en: 'Home', zh: '首页', keys: 'top hero start 主页 顶部',
            run: () => (onHome ? window.scrollTo({ top: 0, behavior: 'smooth' }) : (location.href = 'index.html')) },
        { group: 'nav', icon: 'fa-user', en: 'About Me', zh: '关于我', keys: 'bio hobbies photography music games 爱好 摄影',
            run: () => { if (!/about\.html$/.test(location.pathname)) location.href = 'about.html'; } },
        { group: 'nav', icon: 'fa-bolt', en: 'Now — what I\'m up to', zh: '近况', keys: 'now status current looking for internship 2027 现在 状态 实习',
            run: () => goSection('now') },
        { group: 'nav', icon: 'fa-graduation-cap', en: 'Education', zh: '教育背景', keys: 'osu ohio state university gpa 学校 大学',
            run: () => goSection('about') },
        { group: 'nav', icon: 'fa-briefcase', en: 'Experience', zh: '工作经历', keys: 'work internship timeline 实习 经历',
            run: () => goSection('experience') },
        { group: 'nav', icon: 'fa-diagram-project', en: 'Projects', zh: '项目', keys: 'portfolio github 作品',
            run: () => goSection('projects') },
        { group: 'nav', icon: 'fa-id-card', en: 'Resume (web version)', zh: '简历（网页版）', keys: 'resume cv online html print 简历 网页',
            run: () => { location.href = 'resume.html'; } },
        { group: 'nav', icon: 'fa-book-open', en: 'Study Notes', zh: '学习笔记', keys: 'notes course cse 2231 笔记 课程',
            run: () => { location.href = 'study.html'; } },
        { group: 'nav', icon: 'fa-code', en: 'LeetCode & Study Notes', zh: 'LeetCode 与学习笔记', keys: 'leetcode algorithm blog 刷题 算法',
            run: () => goSection('leetcode') },
        { group: 'nav', icon: 'fa-layer-group', en: 'Skills & Interests', zh: '技能与兴趣', keys: 'tech stack java spring python 技术栈',
            run: () => goSection('skills') },
        { group: 'nav', icon: 'fa-comment-dots', en: 'Guestbook', zh: '留言板', keys: 'comments message hi 留言 评论',
            run: () => goSection('guestbook') },
        { group: 'nav', icon: 'fa-envelope', en: 'Contact', zh: '联系我', keys: 'footer email phone 联系方式',
            run: () => goSection('contact') },

        // ---- Actions
        { group: 'action', icon: 'fa-circle-half-stroke', dynamic: true,
            en: () => (isDark() ? 'Switch to light mode' : 'Switch to dark mode'),
            zh: () => (isDark() ? '切换到亮色模式' : '切换到暗色模式'),
            keys: 'theme dark light mode toggle 主题 暗色 亮色 夜间 日间',
            run: () => setTheme(isDark() ? 'light' : 'dark') },
        { group: 'action', icon: 'fa-language', dynamic: true,
            en: () => (lang() === 'zh' ? 'Switch to English' : '切换到中文'),
            zh: () => (lang() === 'zh' ? 'Switch to English' : '切换到中文'),
            keys: 'language english chinese 语言 中文 英文 翻译',
            run: () => setLang(lang() === 'zh' ? 'en' : 'zh') },
        { group: 'action', icon: 'fa-file-pdf', en: 'Open resume (English)', zh: '打开英文简历', keys: 'resume cv pdf download 简历 下载',
            run: () => window.open('Baowen_Resume.pdf', '_blank', 'noopener') },
        { group: 'action', icon: 'fa-file-pdf', en: 'Open resume (中文)', zh: '打开中文简历', keys: 'resume cv pdf download chinese 简历 下载 中文',
            run: () => window.open('Baowen_Resume_CN.pdf', '_blank', 'noopener') },
        { group: 'action', icon: 'fa-copy', en: 'Copy email address', zh: '复制邮箱', keys: 'email mail contact ' + EMAIL + ' 邮件 邮箱', hint: EMAIL,
            run: () => copy(EMAIL, t('email', '邮箱')) },
        { group: 'action', icon: 'fa-copy', en: 'Copy phone (US)', zh: '复制美国电话', keys: 'phone number call 电话 手机', hint: PHONE_US,
            run: () => copy(PHONE_US, t('phone number', '电话')) },
        { group: 'action', icon: 'fa-copy', en: 'Copy phone (CN)', zh: '复制中国电话', keys: 'phone number call china 电话 手机', hint: PHONE_CN,
            run: () => copy(PHONE_CN, t('phone number', '电话')) },
        { group: 'action', icon: 'fa-weixin', brand: true, en: 'Copy WeChat ID', zh: '复制微信号', keys: 'wechat weixin 微信', hint: WECHAT,
            run: () => copy(WECHAT, t('WeChat ID', '微信号')) },
        { group: 'action', icon: 'fa-paper-plane', en: 'Email me', zh: '发邮件给我', keys: 'mailto send message 邮件 联系',
            run: () => { location.href = 'mailto:' + EMAIL; } },
        { group: 'action', icon: 'fa-terminal', en: 'Open terminal', zh: '打开终端', keys: 'cli console shell easter egg 命令行 彩蛋',
            run: () => { const b = document.querySelector('.term-launcher'); if (b) setTimeout(() => b.click(), 60); } },

        // ---- Links
        { group: 'link', icon: 'fa-github', brand: true, en: 'GitHub', zh: 'GitHub', keys: 'code repo powersixxx 代码', hint: 'github.com/PowerSixxx',
            run: () => window.open('https://github.com/PowerSixxx', '_blank', 'noopener') },
        { group: 'link', icon: 'fa-linkedin', brand: true, en: 'LinkedIn', zh: 'LinkedIn', keys: 'profile network 领英', hint: 'linkedin.com/in/baowen-liu',
            run: () => window.open('https://www.linkedin.com/in/baowen-liu-959104340/', '_blank', 'noopener') },
        { group: 'link', icon: 'fa-instagram', brand: true, en: 'Instagram', zh: 'Instagram', keys: 'photos social ins', hint: '@powersix2006',
            run: () => window.open('https://www.instagram.com/powersix2006/', '_blank', 'noopener') },
        { group: 'link', icon: 'fa-code', en: 'LeetCode blog', zh: 'LeetCode 博客', keys: 'leetcode notes algorithm 刷题', hint: 'powersixxx.github.io/leetcode-blog',
            run: () => window.open('https://powersixxx.github.io/leetcode-blog/', '_blank', 'noopener') },
    ];
    const GROUP_LABEL = { nav: ['Navigate', '跳转'], action: ['Actions', '操作'], link: ['Links', '链接'] };
    const label = (c) => (typeof c[lang()] === 'function' ? c[lang()]() : c[lang()]);
    const altLabel = (c) => { const k = lang() === 'zh' ? 'en' : 'zh'; return typeof c[k] === 'function' ? c[k]() : c[k]; };

    /* ---------------------------------------------------------------------
       Styles
       --------------------------------------------------------------------- */
    const css = `
    .cp-overlay{position:fixed;inset:0;z-index:1400;display:none;align-items:flex-start;justify-content:center;padding:12vh 1rem 1rem;
      background:rgba(17,17,17,.28);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);}
    .cp-overlay.open{display:flex;animation:cp-fade .15s ease-out;}
    .cp-panel{width:min(620px,100%);max-height:min(560px,76vh);display:flex;flex-direction:column;overflow:hidden;
      border-radius:16px;border:1px solid rgba(255,255,255,.7);
      background:rgba(255,255,255,.78);backdrop-filter:blur(24px) saturate(160%);-webkit-backdrop-filter:blur(24px) saturate(160%);
      box-shadow:0 30px 80px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.9);
      color:#1c1917;font-family:'Inter',-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
      animation:cp-pop .18s cubic-bezier(.2,.9,.3,1.15);}
    html[data-theme="dark"] .cp-overlay{background:rgba(0,0,0,.5);}
    html[data-theme="dark"] .cp-panel{border-color:rgba(255,255,255,.12);background:rgba(16,16,20,.82);color:#e5e7eb;
      box-shadow:0 30px 80px rgba(0,0,0,.7),inset 0 1px 0 rgba(255,255,255,.08);}
    .cp-search{display:flex;align-items:center;gap:.7rem;padding:.9rem 1.1rem;border-bottom:1px solid rgba(0,0,0,.08);}
    html[data-theme="dark"] .cp-search{border-bottom-color:rgba(255,255,255,.08);}
    .cp-search i{color:#78716c;font-size:1rem;} html[data-theme="dark"] .cp-search i{color:#94a3b8;}
    .cp-input{flex:1;min-width:0;border:none;outline:none;background:transparent;font:inherit;font-size:1.05rem;color:inherit;padding:0;}
    .cp-input::placeholder{color:#a8a29e;} html[data-theme="dark"] .cp-input::placeholder{color:#6b7280;}
    .cp-kbd{font:600 .68rem/1 ui-monospace,SFMono-Regular,Menlo,monospace;padding:.28rem .45rem;border-radius:6px;
      border:1px solid rgba(0,0,0,.12);background:rgba(0,0,0,.04);color:#57534e;}
    html[data-theme="dark"] .cp-kbd{border-color:rgba(255,255,255,.14);background:rgba(255,255,255,.06);color:#a1a1aa;}
    .cp-list{flex:1;overflow-y:auto;padding:.4rem .5rem .5rem;scrollbar-width:thin;}
    .cp-group{padding:.7rem .7rem .3rem;font-size:.68rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#a8a29e;}
    html[data-theme="dark"] .cp-group{color:#6b7280;}
    .cp-item{display:flex;align-items:center;gap:.75rem;padding:.6rem .7rem;border-radius:10px;cursor:pointer;user-select:none;}
    .cp-item.active{background:rgba(20,195,182,.14);}
    html[data-theme="dark"] .cp-item.active{background:rgba(62,233,219,.14);}
    .cp-icon{width:30px;height:30px;display:grid;place-items:center;border-radius:8px;font-size:.85rem;flex-shrink:0;
      background:rgba(0,0,0,.05);color:#44403c;}
    html[data-theme="dark"] .cp-icon{background:rgba(255,255,255,.07);color:#d4d4d8;}
    .cp-item.active .cp-icon{background:#14c3b6;color:#fff;} html[data-theme="dark"] .cp-item.active .cp-icon{background:#3ee9db;color:#0b1220;}
    .cp-text{flex:1;min-width:0;display:flex;flex-direction:column;gap:.1rem;}
    .cp-label{font-size:.93rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .cp-label mark{background:none;color:#0f9f93;padding:0;} html[data-theme="dark"] .cp-label mark{color:#3ee9db;}
    .cp-hint{font-size:.75rem;color:#78716c;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;} html[data-theme="dark"] .cp-hint{color:#9ca3af;}
    .cp-enter{font-size:.7rem;color:#a8a29e;opacity:0;} .cp-item.active .cp-enter{opacity:1;}
    .cp-empty{padding:2rem 1rem;text-align:center;color:#a8a29e;font-size:.9rem;}
    .cp-foot{display:flex;gap:1rem;flex-wrap:wrap;padding:.6rem 1.1rem;border-top:1px solid rgba(0,0,0,.08);font-size:.72rem;color:#78716c;}
    html[data-theme="dark"] .cp-foot{border-top-color:rgba(255,255,255,.08);color:#9ca3af;}
    .cp-foot span{display:inline-flex;align-items:center;gap:.35rem;}
    .cp-toast{position:fixed;left:50%;bottom:5rem;transform:translate(-50%,6px);z-index:1500;padding:.5rem 1rem;border-radius:999px;
      background:#1c1917;color:#fff;font:500 .85rem 'Inter',sans-serif;opacity:0;pointer-events:none;transition:opacity .25s,transform .25s;
      box-shadow:0 8px 24px rgba(0,0,0,.2);}
    html[data-theme="dark"] .cp-toast{background:#f1f5f9;color:#0c0c0e;}
    .cp-toast.show{opacity:1;transform:translate(-50%,0);}
    /* Launcher (sits next to the terminal button) */
    .cp-launcher{position:fixed;left:6.5rem;bottom:1.5rem;z-index:1200;display:inline-flex;align-items:center;gap:.4rem;height:40px;padding:0 .8rem;
      border-radius:999px;border:1px solid rgba(255,255,255,.55);background:rgba(255,255,255,.35);color:#1c1917;cursor:pointer;
      font:600 .78rem/1 'Inter',sans-serif;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);
      box-shadow:0 6px 20px rgba(0,0,0,.08),inset 0 1px 0 rgba(255,255,255,.7);transition:transform .2s,background .2s;}
    .cp-launcher:hover{transform:translateY(-2px);background:rgba(255,255,255,.6);}
    .cp-launcher i{font-size:.8rem;opacity:.7;}
    html[data-theme="dark"] .cp-launcher{border-color:rgba(255,255,255,.12);background:rgba(255,255,255,.05);color:#e5e7eb;box-shadow:0 8px 24px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.08);}
    html[data-theme="dark"] .cp-launcher:hover{background:rgba(255,255,255,.1);}
    @keyframes cp-fade{from{opacity:0;}to{opacity:1;}}
    @keyframes cp-pop{from{opacity:0;transform:translateY(-10px) scale(.98);}to{opacity:1;transform:none;}}
    @media (max-width:768px){
      .cp-overlay{padding:5vh .75rem .75rem;}
      .cp-launcher{left:5.1rem;bottom:1.1rem;height:36px;padding:0 .7rem;}
      .cp-launcher .cp-launcher-text{display:none;}
      .cp-foot{display:none;}
    }
    @media (prefers-reduced-motion:reduce){.cp-overlay.open,.cp-panel{animation:none;}}
    `;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    /* ---------------------------------------------------------------------
       DOM
       --------------------------------------------------------------------- */
    const overlay = document.createElement('div');
    overlay.className = 'cp-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Command palette');
    overlay.innerHTML = `
      <div class="cp-panel">
        <div class="cp-search">
          <i class="fas fa-magnifying-glass" aria-hidden="true"></i>
          <input class="cp-input" type="text" spellcheck="false" autocomplete="off" aria-label="Search commands">
          <span class="cp-kbd">esc</span>
        </div>
        <div class="cp-list" role="listbox"></div>
        <div class="cp-foot"></div>
      </div>`;
    document.body.appendChild(overlay);

    const launcher = document.createElement('button');
    launcher.type = 'button';
    launcher.className = 'cp-launcher';
    launcher.setAttribute('aria-label', 'Open command palette');
    document.body.appendChild(launcher);

    const input = overlay.querySelector('.cp-input');
    const list = overlay.querySelector('.cp-list');
    const foot = overlay.querySelector('.cp-foot');

    function refreshChrome() {
        input.placeholder = t('Search pages, actions, links…', '搜索页面、操作、链接…');
        foot.innerHTML = `<span><span class="cp-kbd">↑</span><span class="cp-kbd">↓</span> ${t('navigate', '选择')}</span>` +
            `<span><span class="cp-kbd">↵</span> ${t('run', '执行')}</span>` +
            `<span><span class="cp-kbd">esc</span> ${t('close', '关闭')}</span>`;
        launcher.innerHTML = `<i class="fas fa-magnifying-glass" aria-hidden="true"></i><span class="cp-launcher-text">${isMac ? '⌘' : 'Ctrl'} K</span>`;
        launcher.title = t('Command palette', '命令面板') + ` (${isMac ? '⌘' : 'Ctrl'}+K)`;
    }
    refreshChrome();
    new MutationObserver(refreshChrome).observe(html, { attributes: true, attributeFilter: ['lang'] });

    /* ---------------------------------------------------------------------
       Search & render
       --------------------------------------------------------------------- */
    let results = [];
    let active = 0;

    function score(cmd, q) {
        if (!q) return 1;
        const hay = [label(cmd), altLabel(cmd), cmd.keys || '', cmd.hint || ''].join(' ').toLowerCase();
        const l = label(cmd).toLowerCase();
        if (l.startsWith(q)) return 100;
        if (l.includes(q)) return 80;
        // every query token must appear somewhere
        const tokens = q.split(/\s+/).filter(Boolean);
        if (tokens.every((tk) => hay.includes(tk))) return 50;
        // loose subsequence match on the label (e.g. "ctc" → "Contact")
        let i = 0; for (const ch of l) if (ch === q[i]) i++;
        return i === q.length && q.length >= 2 ? 20 : 0;
    }
    function highlight(text, q) {
        if (!q) return esc(text);
        const i = text.toLowerCase().indexOf(q);
        if (i < 0) return esc(text);
        return esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + q.length)) + '</mark>' + esc(text.slice(i + q.length));
    }
    const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    function render() {
        const q = input.value.trim().toLowerCase();
        results = COMMANDS.map((c) => ({ c, s: score(c, q) })).filter((r) => r.s > 0)
            .sort((a, b) => b.s - a.s || COMMANDS.indexOf(a.c) - COMMANDS.indexOf(b.c)).map((r) => r.c);
        active = 0;
        if (!results.length) {
            list.innerHTML = `<div class="cp-empty">${t('No results for', '没有找到')} “${esc(input.value.trim())}”</div>`;
            return;
        }
        let out = '', lastGroup = null;
        results.forEach((c, i) => {
            if (!q && c.group !== lastGroup) {
                out += `<div class="cp-group">${GROUP_LABEL[c.group][lang() === 'zh' ? 1 : 0]}</div>`;
                lastGroup = c.group;
            }
            out += `<div class="cp-item${i === 0 ? ' active' : ''}" role="option" data-i="${i}">
                <span class="cp-icon"><i class="${c.brand ? 'fab' : 'fas'} ${c.icon}" aria-hidden="true"></i></span>
                <span class="cp-text"><span class="cp-label">${highlight(label(c), q)}</span>${c.hint ? `<span class="cp-hint">${esc(c.hint)}</span>` : ''}</span>
                <span class="cp-enter">↵</span>
            </div>`;
        });
        list.innerHTML = out;
        list.scrollTop = 0;
    }
    function setActive(i) {
        const items = list.querySelectorAll('.cp-item');
        if (!items.length) return;
        active = (i + items.length) % items.length;
        items.forEach((el, k) => el.classList.toggle('active', k === active));
        items[active].scrollIntoView({ block: 'nearest' });
    }
    function runActive() {
        const c = results[active];
        if (!c) return;
        close();
        c.run();
    }

    list.addEventListener('mousemove', (e) => {
        const item = e.target.closest('.cp-item');
        if (item && Number(item.dataset.i) !== active) setActive(Number(item.dataset.i));
    });
    list.addEventListener('click', (e) => {
        const item = e.target.closest('.cp-item');
        if (item) { setActive(Number(item.dataset.i)); runActive(); }
    });
    input.addEventListener('input', render);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); setActive(active + 1); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
        else if (e.key === 'Enter') { e.preventDefault(); runActive(); }
        else if (e.key === 'Tab') { e.preventDefault(); setActive(active + (e.shiftKey ? -1 : 1)); }
    });

    /* ---------------------------------------------------------------------
       Open / close
       --------------------------------------------------------------------- */
    function open() {
        overlay.classList.add('open');
        input.value = '';
        render();
        setTimeout(() => input.focus(), 20);
    }
    function close() {
        overlay.classList.remove('open');
    }
    const isOpen = () => overlay.classList.contains('open');

    launcher.addEventListener('click', open);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            isOpen() ? close() : open();
            return;
        }
        if (e.key === 'Escape' && isOpen()) { e.preventDefault(); close(); }
    }, true);

    window.__baowenPaletteOpen = open;
})();
