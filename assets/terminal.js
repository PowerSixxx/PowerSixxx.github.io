/* ==========================================================================
   Interactive terminal easter egg
   - A small ">_" launcher (bottom-left) opens a frosted-glass terminal
   - Type `help` for commands. Also opens with the backtick key.
   - Self-contained: injects its own CSS + DOM, safe to include on any page.
   ========================================================================== */
(function () {
    'use strict';
    if (window.__baowenTerminal) return;
    window.__baowenTerminal = true;

    /* ---------------------------------------------------------------------
       Data (keep in sync with index.html)
       --------------------------------------------------------------------- */
    const SITE = 'https://www.baowenliu.com';
    const DATA = {
        name: 'Baowen Liu',
        handle: 'PowerSixxx',
        email: 'liu.11884@osu.edu',
        phoneUS: '+1 380-249-9220',
        phoneCN: '+86 135-8181-5272',
        wechat: '_6Jan-Baower',
        github: 'https://github.com/PowerSixxx',
        linkedin: 'https://www.linkedin.com/in/baowen-liu-959104340/',
        instagram: 'https://www.instagram.com/powersix2006/',
        leetcode: 'https://powersixxx.github.io/leetcode-blog/',
        resumeEN: 'Baowen_Resume.pdf',
        resumeZH: 'Baowen_Resume_CN.pdf',
        skills: {
            Languages: ['Java', 'Python', 'JavaScript', 'HTML/CSS', 'SQL', 'MATLAB'],
            Frameworks: ['Spring Boot', 'Spring Cloud', 'Spring AI', 'LangChain4j', 'React', 'Kubernetes', 'CI/CD'],
            'Developer Tools': ['Docker', 'Nginx', 'Git/GitHub', 'IntelliJ IDEA', 'VS Code', 'AWS'],
            Libraries: ['PgVector', 'PyTorch', 'pandas', 'NumPy'],
        },
        experience: [
            ['May 2026 – Aug 2026', 'Undergraduate Research Assistant', 'tOSU Dept. of CSE',
                'Full-stack research platform (Node.js, MySQL, REST APIs, Python/pandas)'],
            ['Jan 2026 – Sep 2026', 'Undergraduate Teaching Assistant', 'tOSU College of Engineering',
                'Taught MATLAB/CAD/Excel + programming to 70 students'],
            ['Aug 2025 – Dec 2025', 'Software Development Engineer Intern', 'Beijing Hanwei Jialian Technology',
                'Distributed CRM: Spring Boot, Redis, Elasticsearch, RocketMQ, Jenkins/Docker CI/CD'],
            ['May 2025 – Jul 2025', 'Software Development Engineer Intern', 'SPIC Integrated Smart Energy',
                'RAG knowledge platform: LangChain, FastAPI, FAISS, pgvector, hybrid BM25 search'],
        ],
        projects: [
            ['Online Shopping Platform', 'Aug 2026 – Present',
                'Spring Cloud · AWS ECS/ECR · Docker · DynamoDB · SQS',
                'Distributed e-commerce system handling 10K QPS Prime Day traffic with async peak shaving', null],
            ['User Center System', 'May 2025 – Dec 2025',
                'React · AntD Pro · Spring Boot · MyBatis-Plus · MySQL · Docker',
                'Production-ready full-stack user system (login, registration, user management)', null],
            ['MATLAB Gomoku', '',
                'MATLAB',
                'Five-in-a-row game with a playable UI', 'https://github.com/PowerSixxx/MATLAB-Gomoku'],
        ],
    };

    /* ---------------------------------------------------------------------
       Styles
       --------------------------------------------------------------------- */
    const css = `
    .term-launcher{position:fixed;left:1.25rem;bottom:1.5rem;z-index:1200;display:inline-flex;align-items:center;gap:.35rem;
      height:40px;padding:0 .9rem;border-radius:999px;border:1px solid rgba(255,255,255,.55);
      background:rgba(255,255,255,.35);color:#1c1917;font:600 .82rem/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
      letter-spacing:.02em;cursor:pointer;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);
      box-shadow:0 6px 20px rgba(0,0,0,.08),inset 0 1px 0 rgba(255,255,255,.7);transition:transform .2s,background .2s,box-shadow .2s;}
    .term-launcher:hover{transform:translateY(-2px);background:rgba(255,255,255,.6);box-shadow:0 10px 26px rgba(0,0,0,.12),inset 0 1px 0 rgba(255,255,255,.8);}
    .term-launcher .term-caret{display:inline-block;width:7px;height:1em;background:#14c3b6;margin-left:1px;animation:term-blink 1.1s steps(2,start) infinite;}
    .term-launcher .term-hint{font-weight:500;opacity:.55;font-size:.7rem;}
    html[data-theme="dark"] .term-launcher{border-color:rgba(255,255,255,.12);background:rgba(255,255,255,.05);color:#e5e7eb;
      box-shadow:0 8px 24px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.08);}
    html[data-theme="dark"] .term-launcher:hover{background:rgba(255,255,255,.1);}
    html[data-theme="dark"] .term-launcher .term-caret{background:#3ee9db;}

    .term-overlay{position:fixed;inset:0;z-index:1300;display:none;align-items:center;justify-content:center;padding:1rem;
      background:rgba(0,0,0,.28);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);}
    .term-overlay.open{display:flex;animation:term-fade .18s ease-out;}
    .term-window{width:min(760px,100%);height:min(480px,80vh);display:flex;flex-direction:column;overflow:hidden;
      border-radius:14px;border:1px solid rgba(255,255,255,.14);
      background:linear-gradient(160deg,rgba(18,20,26,.82),rgba(8,10,14,.86));
      backdrop-filter:blur(22px) saturate(140%);-webkit-backdrop-filter:blur(22px) saturate(140%);
      box-shadow:0 30px 80px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.12);
      color:#e5e7eb;font:13.5px/1.55 ui-monospace,SFMono-Regular,Menlo,Consolas,"Liberation Mono",monospace;
      animation:term-pop .22s cubic-bezier(.2,.9,.3,1.2);}
    /* The site styles p/a globally with !important in places; pin the terminal's own typography */
    .term-window,.term-window *{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,"Liberation Mono",monospace !important;}
    .term-window p{margin:0 !important;padding:0 !important;font-size:inherit !important;line-height:1.55 !important;color:inherit;}
    .term-bar{display:flex;align-items:center;gap:.5rem;padding:.55rem .8rem;border-bottom:1px solid rgba(255,255,255,.08);
      background:rgba(255,255,255,.04);user-select:none;}
    .term-dot{width:12px;height:12px;border-radius:50%;border:none;padding:0;cursor:pointer;}
    .term-dot.red{background:#ff5f57;} .term-dot.yellow{background:#febc2e;} .term-dot.green{background:#28c840;}
    .term-title{flex:1;text-align:center;font-size:.78rem;color:rgba(229,231,235,.6);}
    .term-body{flex:1;overflow-y:auto;padding:.9rem 1rem;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.18) transparent;cursor:text;}
    .term-body::-webkit-scrollbar{width:8px;} .term-body::-webkit-scrollbar-thumb{background:rgba(255,255,255,.18);border-radius:8px;}
    .term-line{white-space:pre-wrap;word-break:break-word;margin:0;}
    .term-game{margin:.25rem 0 .5rem;padding:.4rem .6rem;border:1px solid rgba(255,255,255,.12);border-radius:8px;
      background:rgba(0,0,0,.35);color:#e5e7eb;line-height:1.15;letter-spacing:.06em;white-space:pre;overflow:hidden;display:inline-block;}
    .term-game .s{color:#3ee9db;} .term-game .h{color:#fff;} .term-game .f{color:#fbbf24;} .term-game .w{color:rgba(255,255,255,.22);}
    .term-matrix{position:absolute;inset:0;z-index:5;background:#000;}
    .term-body{position:relative;}
    .term-line a{color:#7dd3fc;text-decoration:none;border-bottom:1px dotted rgba(125,211,252,.5);}
    .term-line a:hover{color:#bae6fd;}
    .term-prompt{color:#3ee9db;font-weight:600;}
    .term-path{color:#c4b5fd;}
    .term-cmd{color:#fff;}
    .term-muted{color:rgba(229,231,235,.55);}
    .term-ok{color:#4ade80;} .term-warn{color:#fbbf24;} .term-err{color:#f87171;} .term-key{color:#f9a8d4;}
    .term-h{color:#fff;font-weight:700;}
    .term-input-row{display:flex;align-items:center;gap:.4rem;padding:.55rem 1rem .8rem;border-top:1px solid rgba(255,255,255,.06);}
    .term-input{flex:1;min-width:0;background:transparent;border:none;outline:none;color:#fff;font:inherit;caret-color:#3ee9db;padding:0;}
    .term-input::placeholder{color:rgba(229,231,235,.3);}
    @keyframes term-blink{to{visibility:hidden;}}
    @keyframes term-fade{from{opacity:0;}to{opacity:1;}}
    @keyframes term-pop{from{opacity:0;transform:translateY(16px) scale(.97);}to{opacity:1;transform:none;}}
    @media (max-width:768px){
      .term-launcher{left:.9rem;bottom:1.1rem;height:36px;padding:0 .7rem;font-size:.76rem;}
      .term-launcher .term-hint{display:none;}
      .term-window{height:min(560px,78vh);font-size:12.5px;border-radius:12px;}
    }
    @media (prefers-reduced-motion:reduce){.term-launcher .term-caret,.term-overlay.open,.term-window{animation:none;}}
    `;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    /* ---------------------------------------------------------------------
       DOM
       --------------------------------------------------------------------- */
    const launcher = document.createElement('button');
    launcher.className = 'term-launcher';
    launcher.type = 'button';
    launcher.title = 'Open terminal  (press ` )';
    launcher.setAttribute('aria-label', 'Open interactive terminal');
    launcher.innerHTML = '<span>&gt;_</span><span class="term-caret"></span><span class="term-hint">cli</span>';

    const overlay = document.createElement('div');
    overlay.className = 'term-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Interactive terminal');
    overlay.innerHTML = `
      <div class="term-window">
        <div class="term-bar">
          <button class="term-dot red" title="Close (Esc)" aria-label="Close terminal"></button>
          <span class="term-dot yellow"></span>
          <span class="term-dot green"></span>
          <span class="term-title">visitor@baowenliu.com: ~</span>
        </div>
        <div class="term-body"></div>
        <div class="term-input-row">
          <span class="term-prompt">visitor@baowenliu.com</span><span class="term-muted">:</span><span class="term-path">~</span><span class="term-muted">$</span>
          <input class="term-input" type="text" spellcheck="false" autocomplete="off" autocapitalize="off" autocorrect="off" placeholder="type 'help' and press Enter" aria-label="Terminal command input">
        </div>
      </div>`;

    document.body.appendChild(launcher);
    document.body.appendChild(overlay);

    const body = overlay.querySelector('.term-body');
    const input = overlay.querySelector('.term-input');
    const closeBtn = overlay.querySelector('.term-dot.red');

    /* ---------------------------------------------------------------------
       Output helpers
       --------------------------------------------------------------------- */
    const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const link = (href, label) => `<a href="${esc(href)}" target="_blank" rel="noopener">${esc(label || href)}</a>`;
    const pad = (s, n) => s + ' '.repeat(Math.max(0, n - s.length));

    function print(html = '', cls = '') {
        const p = document.createElement('p');
        p.className = 'term-line' + (cls ? ' ' + cls : '');
        p.innerHTML = html;
        body.appendChild(p);
        body.scrollTop = body.scrollHeight;
        return p;
    }
    function echoCommand(cmd) {
        print(`<span class="term-prompt">visitor@baowenliu.com</span><span class="term-muted">:</span><span class="term-path">~</span><span class="term-muted">$</span> <span class="term-cmd">${esc(cmd)}</span>`);
    }
    // Prints lines one after another with a small delay (skipped under reduced motion)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function printSeq(lines, delay = 140) {
        return new Promise((resolve) => {
            let i = 0;
            const step = () => {
                if (i >= lines.length) return resolve();
                const [html, cls] = Array.isArray(lines[i]) ? lines[i] : [lines[i], ''];
                print(html, cls); i++;
                reduceMotion ? step() : setTimeout(step, delay);
            };
            step();
        });
    }

    /* ---------------------------------------------------------------------
       Site integration (theme / language / navigation)
       --------------------------------------------------------------------- */
    const isDark = () => document.documentElement.getAttribute('data-theme') === 'dark';
    const currentLang = () => (localStorage.getItem('lang') || 'en');
    function setTheme(mode) {
        if ((mode === 'dark') === isDark()) return;
        const btn = document.getElementById('theme-toggle') || document.getElementById('theme-btn');
        if (btn) btn.click();
    }
    function setLang(lang) {
        if (currentLang() === lang) return;
        const btn = document.getElementById('lang-toggle');
        if (btn) btn.click();
    }
    const onHome = /(^|\/)(index\.html)?$/.test(location.pathname);
    function goto(section) {
        if (onHome) {
            const el = document.getElementById(section);
            if (el) { closeTerminal(); el.scrollIntoView({ behavior: 'smooth' }); return true; }
            return false;
        }
        location.href = 'index.html#' + section;
        return true;
    }
    const resumeHref = () => (currentLang() === 'zh' ? DATA.resumeZH : DATA.resumeEN);

    /* ---------------------------------------------------------------------
       Commands
       --------------------------------------------------------------------- */
    const SECTIONS = ['hero', 'now', 'about', 'experience', 'leetcode', 'projects', 'skills', 'guestbook', 'contact'];
    const history = [];
    let histIdx = -1;
    let vimMode = false;
    let activeGame = null;   // { onKey(e), stop() } while snake / matrix / sl is running

    const commands = {
        help: {
            desc: 'List available commands',
            run() {
                print('<span class="term-h">Available commands</span>');
                const rows = [
                    ['help', 'this list'],
                    ['about / whoami', 'who is Baowen?'],
                    ['now', 'what I am up to right now'],
                    ['skills', 'languages, frameworks, tools'],
                    ['experience', 'internships & campus roles'],
                    ['projects', 'things I have built'],
                    ['education', 'where I study'],
                    ['contact', 'how to reach me'],
                    ['resume [pdf]', 'web resume, or the PDF'],
                    ['social', 'GitHub · LinkedIn · Instagram · LeetCode'],
                    ['guestbook', 'leave a note or a 👍'],
                    ['ls / cd <section>', 'browse the site like a filesystem'],
                    ['theme [light|dark]', 'switch the site theme'],
                    ['lang [en|zh]', 'switch the site language'],
                    ['neofetch', 'system info, developer style'],
                    ['clear', 'clear the screen'],
                    ['exit', 'close the terminal (or press Esc)'],
                ];
                rows.forEach(([c, d]) => print(`  <span class="term-key">${pad(c, 20)}</span><span class="term-muted">${esc(d)}</span>`));
                print('');
                print('<span class="term-h">Fun</span>');
                [['snake', 'play snake (arrows / WASD, q to quit)'],
                 ['matrix', 'enter the matrix (any key to leave)'],
                 ['cowsay <text>', 'a cow says whatever you want'],
                 ['sl', 'the classic typo'],
                 ['fortune', 'a random fortune']]
                    .forEach(([c, d]) => print(`  <span class="term-key">${pad(c, 20)}</span><span class="term-muted">${esc(d)}</span>`));
                print('');
                print('<span class="term-muted">Hint: there are a few hidden commands. Try <span class="term-key">sudo hire-me</span>.</span>');
            },
        },
        now: {
            desc: 'What I am up to',
            run() {
                print('<span class="term-h">Now</span> <span class="term-muted">(updated Sep 2026)</span>');
                print('  <span class="term-key">looking for</span>  Summer 2027 SDE internship — backend / distributed systems / AI infra');
                print('  <span class="term-key">building</span>     Online Shopping Platform — Spring Cloud on AWS ECS, 10K QPS');
                print('  <span class="term-key">learning</span>     Kubernetes, system design, Spring AI / LangChain4j');
                print('  <span class="term-key">where</span>        Columbus, OH — The Ohio State University');
            },
        },
        about: {
            desc: 'About Baowen',
            run() {
                print('<span class="term-h">Baowen Liu</span> <span class="term-muted">— Software engineer in training</span>');
                print('  B.S. Computer Science & Engineering @ The Ohio State University (exp. May 2028)');
                print('  Mathematics minor · GPA 3.965 / 4.0 · Dean\'s List ×3');
                print('  Builds distributed backends (Spring / AWS), full-stack apps, and RAG / AI platforms.');
                print('  Currently looking for <span class="term-ok">SDE internship & new-grad</span> opportunities.');
                print(`  More: ${link(SITE + '/about.html', 'baowenliu.com/about')}`);
            },
        },
        whoami: { desc: 'Alias of about', hidden: true, run() { print('visitor'); print('<span class="term-muted">…but you probably meant me. Running <span class="term-key">about</span>:</span>'); commands.about.run(); } },
        skills: {
            desc: 'Skills',
            run() {
                Object.entries(DATA.skills).forEach(([group, list]) => {
                    print(`<span class="term-h">${esc(group)}</span>`);
                    print('  ' + list.map((s) => `<span class="term-key">${esc(s)}</span>`).join('<span class="term-muted"> · </span>'));
                });
                print('<span class="term-muted">Activities: OSU Audio Engineering Club · OSU Buckeye AutoDrive</span>');
            },
        },
        experience: {
            desc: 'Experience',
            run() {
                DATA.experience.forEach(([when, role, org, what]) => {
                    print(`<span class="term-ok">●</span> <span class="term-h">${esc(role)}</span> <span class="term-muted">@ ${esc(org)}</span>`);
                    print(`  <span class="term-muted">${esc(when)}</span>`);
                    print(`  ${esc(what)}`);
                });
                print(`<span class="term-muted">Full timeline: type <span class="term-key">cd experience</span></span>`);
            },
        },
        exp: { hidden: true, run() { commands.experience.run(); } },
        projects: {
            desc: 'Projects',
            run() {
                DATA.projects.forEach(([name, when, stack, what, url]) => {
                    print(`<span class="term-ok">▸</span> <span class="term-h">${esc(name)}</span>${when ? ` <span class="term-muted">(${esc(when)})</span>` : ''}`);
                    print(`  <span class="term-key">${esc(stack)}</span>`);
                    print(`  ${esc(what)}`);
                    if (url) print(`  ${link(url)}`);
                });
                print(`<span class="term-muted">More on GitHub: ${link(DATA.github, 'github.com/' + DATA.handle)}</span>`);
            },
        },
        education: {
            desc: 'Education',
            run() {
                print('<span class="term-h">The Ohio State University</span> <span class="term-muted">— Columbus, OH</span>');
                print('  B.S. Computer Science and Engineering · Mathematics minor');
                print('  Expected May 2028 · GPA 3.965 / 4.0 · Dean\'s List (3 semesters)');
                print('  Coursework: Calculus, Computer Science, Fundamentals of Engineering, Linear Algebra, Physics, Statistics');
            },
        },
        edu: { hidden: true, run() { commands.education.run(); } },
        contact: {
            desc: 'Contact',
            run() {
                print('<span class="term-h">Reach me</span>');
                print(`  ${pad('email', 10)} ${link('mailto:' + DATA.email, DATA.email)}`);
                print(`  ${pad('phone', 10)} ${esc(DATA.phoneUS)}  <span class="term-muted">(US)</span>`);
                print(`  ${pad('', 10)} ${esc(DATA.phoneCN)}  <span class="term-muted">(CN)</span>`);
                print(`  ${pad('wechat', 10)} ${esc(DATA.wechat)}`);
                print(`  ${pad('linkedin', 10)} ${link(DATA.linkedin, 'linkedin.com/in/baowen-liu')}`);
                print(`  ${pad('github', 10)} ${link(DATA.github, 'github.com/' + DATA.handle)}`);
            },
        },
        social: {
            desc: 'Social links',
            run() {
                print(`  ${pad('GitHub', 11)} ${link(DATA.github)}`);
                print(`  ${pad('LinkedIn', 11)} ${link(DATA.linkedin)}`);
                print(`  ${pad('Instagram', 11)} ${link(DATA.instagram)}`);
                print(`  ${pad('LeetCode', 11)} ${link(DATA.leetcode)}`);
            },
        },
        guestbook: {
            desc: 'Open the guestbook',
            run() { print('<span class="term-muted">→ opening the guestbook. Say hi!</span>'); goto('guestbook'); },
        },
        resume: {
            desc: 'Open resume',
            run(args) {
                if ((args[0] || '').toLowerCase() === 'pdf') {
                    const href = resumeHref();
                    print(`Opening <span class="term-key">${esc(href)}</span> in a new tab…`);
                    window.open(href, '_blank', 'noopener');
                    return;
                }
                print('<span class="term-muted">→ opening the web resume. (<span class="term-key">resume pdf</span> for the PDF)</span>');
                setTimeout(() => { location.href = 'resume.html'; }, 250);
            },
        },
        cv: { hidden: true, run() { commands.resume.run(); } },
        ls: {
            desc: 'List sections',
            run(args) {
                if (args[0] === '-la' || args[0] === '-l' || args[0] === '-a') {
                    print('<span class="term-muted">total 8</span>');
                    SECTIONS.forEach((s) => print(`<span class="term-muted">drwxr-xr-x  baowen  visitors  4096  Sep 14  2026</span>  <span class="term-key">${s}/</span>`));
                    print(`<span class="term-muted">-rw-r--r--  baowen  visitors   108K Sep  7  2026</span>  ${esc(DATA.resumeEN)}`);
                    print(`<span class="term-muted">-rw-r--r--  baowen  visitors   133K Sep  7  2026</span>  ${esc(DATA.resumeZH)}`);
                    print(`<span class="term-muted">-rw-------  baowen  baowen      ??? ???  ?  ????</span>  <span class="term-err">.secrets</span>`);
                    return;
                }
                print(SECTIONS.map((s) => `<span class="term-key">${s}/</span>`).join('  ') + `  ${esc(DATA.resumeEN)}  about.html`);
            },
        },
        cd: {
            desc: 'Go to a section',
            run(args) {
                const target = (args[0] || '').replace(/\/$/, '').replace(/^~\/?/, '');
                if (!target || target === '~') { print('<span class="term-muted">Already home.</span>'); return; }
                if (target === '..') { print('<span class="term-muted">There is no escaping this portfolio.</span>'); return; }
                if (target === 'about.html' || target === 'about-me') { location.href = 'about.html'; return; }
                if (!SECTIONS.includes(target)) { print(`<span class="term-err">cd: no such section: ${esc(target)}</span>  <span class="term-muted">(try: ${SECTIONS.join(', ')})</span>`); return; }
                print(`<span class="term-muted">→ scrolling to #${esc(target)}</span>`);
                goto(target);
            },
        },
        cat: {
            hidden: true,
            run(args) {
                const f = (args[0] || '').toLowerCase();
                if (!f) { print('<span class="term-err">cat: missing file operand</span>'); return; }
                if (f.includes('resume')) return commands.resume.run();
                if (f === '.secrets') { print('<span class="term-err">cat: .secrets: Permission denied</span>'); print('<span class="term-muted">Nice try. Maybe with sudo?</span>'); return; }
                if (f.startsWith('about')) return commands.about.run();
                const s = f.replace(/\/$/, '');
                if (SECTIONS.includes(s)) { print(`<span class="term-err">cat: ${esc(s)}: Is a directory</span>`); return; }
                print(`<span class="term-err">cat: ${esc(f)}: No such file or directory</span>`);
            },
        },
        pwd: { hidden: true, run() { print('/home/visitor/baowenliu.com'); } },
        echo: { hidden: true, run(args) { print(esc(args.join(' '))); } },
        date: { hidden: true, run() { print(esc(new Date().toString())); } },
        theme: {
            desc: 'Switch theme',
            run(args) {
                const want = args[0] || (isDark() ? 'light' : 'dark');
                if (!['light', 'dark'].includes(want)) { print('<span class="term-err">usage: theme [light|dark]</span>'); return; }
                setTheme(want);
                print(`<span class="term-ok">✔</span> theme → <span class="term-key">${want}</span>`);
            },
        },
        lang: {
            desc: 'Switch language',
            run(args) {
                const want = args[0] || (currentLang() === 'zh' ? 'en' : 'zh');
                if (!['en', 'zh'].includes(want)) { print('<span class="term-err">usage: lang [en|zh]</span>'); return; }
                setLang(want);
                print(`<span class="term-ok">✔</span> language → <span class="term-key">${want === 'zh' ? '中文' : 'English'}</span>`);
            },
        },
        neofetch: {
            desc: 'System info',
            run() {
                const art = [
                    '   ____  _      ',
                    '  | __ )| |     ',
                    '  |  _ \\| |     ',
                    '  | |_) | |___  ',
                    '  |____/|_____| ',
                    '                ',
                ];
                const info = [
                    `<span class="term-prompt">visitor</span>@<span class="term-prompt">baowenliu.com</span>`,
                    '<span class="term-muted">-----------------------</span>',
                    `<span class="term-key">OS:</span>       BaowenOS 2026.09 (Columbus, OH)`,
                    `<span class="term-key">Host:</span>     The Ohio State University · CSE`,
                    `<span class="term-key">Kernel:</span>   Java 21 · Spring Boot · Python 3`,
                    `<span class="term-key">Uptime:</span>   ${uptime()}`,
                    `<span class="term-key">Shell:</span>    portfolio-sh 1.0`,
                    `<span class="term-key">Theme:</span>    ${isDark() ? 'pure-black' : 'warm-cream'} [${currentLang()}]`,
                    `<span class="term-key">GPA:</span>      3.965 / 4.0`,
                    `<span class="term-key">Coffee:</span>   ☕☕☕ (low, refill needed)`,
                    `<span class="term-key">Status:</span>   <span class="term-ok">open to SDE opportunities</span>`,
                ];
                const n = Math.max(art.length, info.length);
                for (let i = 0; i < n; i++) print(`<span class="term-prompt">${esc(art[i] || pad('', 16))}</span>  ${info[i] || ''}`);
            },
        },
        sudo: {
            hidden: true,
            async run(args) {
                const what = args.join(' ').toLowerCase();
                if (what === 'hire-me' || what === 'hire me' || what === 'hire') {
                    print('[sudo] password for visitor: <span class="term-muted">********</span>');
                    await printSeq([
                        ['<span class="term-ok">✔</span> Authenticated as <span class="term-key">recruiter</span>', ''],
                        ['<span class="term-muted">Initializing hiring protocol…</span>', ''],
                        ['  <span class="term-ok">[OK]</span> Checking GPA ........................ 3.965 / 4.0', ''],
                        ['  <span class="term-ok">[OK]</span> Checking backend skills ............. Java / Spring / AWS', ''],
                        ['  <span class="term-ok">[OK]</span> Checking distributed systems ........ 10K QPS survived', ''],
                        ['  <span class="term-ok">[OK]</span> Checking AI/RAG experience .......... pgvector + LangChain', ''],
                        ['  <span class="term-ok">[OK]</span> Checking coffee tolerance ........... unlimited', ''],
                        ['  <span class="term-warn">[!!]</span> Checking availability ............... <span class="term-warn">HIGH — act fast</span>', ''],
                        ['', ''],
                        [`<span class="term-ok">Hiring protocol complete.</span> Next step: ${link('mailto:' + DATA.email + '?subject=Let%27s%20talk%20%E2%80%94%20SDE%20opportunity', 'send an email')} or grab the ${link(resumeHref(), 'resume')}.`, ''],
                        ['<span class="term-muted">Thanks for scrolling this far — that already says a lot. 🙂</span>', ''],
                    ], 260);
                    return;
                }
                if (what.startsWith('rm -rf')) { print('<span class="term-err">Nice try.</span> This portfolio is immutable (and backed up on GitHub).'); return; }
                if (!what) { print('usage: sudo <command>'); return; }
                print('<span class="term-err">visitor is not in the sudoers file. This incident will be reported.</span>');
                print('<span class="term-muted">(…to absolutely no one. Try <span class="term-key">sudo hire-me</span> instead.)</span>');
            },
        },
        rm: { hidden: true, run(args) { print(args.join(' ').includes('-rf') ? '<span class="term-err">rm: refusing to delete a perfectly good portfolio</span>' : '<span class="term-err">rm: Permission denied</span>'); } },
        /* ---------------- Fun: snake ---------------- */
        snake: {
            desc: 'Play snake',
            run() {
                const W = 30, H = 14;
                const el = document.createElement('pre');
                el.className = 'term-game';
                body.appendChild(el);
                let snake = [[8, 7], [7, 7], [6, 7]], dir = [1, 0], nextDir = dir, food = null, score = 0, alive = true, timer = null;
                const key = ([x, y]) => x + ',' + y;
                const placeFood = () => {
                    const taken = new Set(snake.map(key));
                    do { food = [Math.floor(Math.random() * W), Math.floor(Math.random() * H)]; } while (taken.has(key(food)));
                };
                const draw = () => {
                    const set = new Set(snake.map(key)); const head = key(snake[0]);
                    let out = `<span class="w">┌${'─'.repeat(W)}┐</span>\n`;
                    for (let y = 0; y < H; y++) {
                        out += '<span class="w">│</span>';
                        for (let x = 0; x < W; x++) {
                            const k = x + ',' + y;
                            out += k === head ? '<span class="h">█</span>' : set.has(k) ? '<span class="s">█</span>' : (food && k === key(food)) ? '<span class="f">●</span>' : ' ';
                        }
                        out += '<span class="w">│</span>\n';
                    }
                    out += `<span class="w">└${'─'.repeat(W)}┘</span>\n`;
                    out += `<span class="h">SNAKE</span>  score: <span class="f">${score}</span>   <span class="w">arrows / WASD · q quit</span>`;
                    el.innerHTML = out;
                    body.scrollTop = body.scrollHeight;
                };
                const tick = () => {
                    dir = nextDir;
                    const nh = [snake[0][0] + dir[0], snake[0][1] + dir[1]];
                    const hitWall = nh[0] < 0 || nh[0] >= W || nh[1] < 0 || nh[1] >= H;
                    const hitSelf = snake.some(([x, y]) => x === nh[0] && y === nh[1]);
                    if (hitWall || hitSelf) return end(false);
                    snake.unshift(nh);
                    if (nh[0] === food[0] && nh[1] === food[1]) { score++; placeFood(); clearInterval(timer); timer = setInterval(tick, Math.max(60, 130 - score * 4)); }
                    else snake.pop();
                    draw();
                };
                const end = (quit) => {
                    if (!alive) return; alive = false; clearInterval(timer); activeGame = null;
                    print(quit ? `<span class="term-muted">snake: quit. Final score: <span class="term-key">${score}</span></span>`
                        : `<span class="term-err">Game over!</span> Score: <span class="term-key">${score}</span>${score >= 10 ? '  <span class="term-ok">— impressive. Now go hire me.</span>' : '  <span class="term-muted">— type <span class="term-key">snake</span> to try again.</span>'}`);
                    input.focus();
                };
                activeGame = {
                    onKey(e) {
                        const k = e.key.toLowerCase();
                        const map = { arrowup: [0, -1], w: [0, -1], arrowdown: [0, 1], s: [0, 1], arrowleft: [-1, 0], a: [-1, 0], arrowright: [1, 0], d: [1, 0] };
                        if (k === 'q' || k === 'escape') return end(true);
                        const nd = map[k];
                        if (nd && !(nd[0] === -dir[0] && nd[1] === -dir[1])) nextDir = nd;
                    },
                    stop() { end(true); },
                };
                placeFood(); draw();
                timer = setInterval(tick, 130);
            },
        },
        /* ---------------- Fun: matrix ---------------- */
        matrix: {
            desc: 'Digital rain',
            run() {
                const canvas = document.createElement('canvas');
                canvas.className = 'term-matrix';
                body.appendChild(canvas);
                const ctx = canvas.getContext('2d');
                const glyphs = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEFXYZ<>{}/\\;=+*';
                let cols = 0, drops = [], raf = null, fs = 14;
                const size = () => {
                    canvas.width = body.clientWidth; canvas.height = body.clientHeight;
                    cols = Math.floor(canvas.width / fs); drops = Array.from({ length: cols }, () => Math.random() * -40);
                };
                size();
                const frame = () => {
                    {
                        ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
                        ctx.font = fs + 'px ui-monospace, Menlo, monospace';
                        for (let i = 0; i < cols; i++) {
                            const ch = glyphs[Math.floor(Math.random() * glyphs.length)];
                            const x = i * fs, y = drops[i] * fs;
                            ctx.fillStyle = '#c8ffd4'; ctx.fillText(ch, x, y);
                            ctx.fillStyle = 'rgba(62,233,219,0.85)'; ctx.fillText(ch, x, y - fs);
                            if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
                            drops[i]++;
                        }
                        ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.font = '12px ui-monospace, Menlo, monospace';
                        ctx.fillText('press any key to wake up', 10, canvas.height - 10);
                    }
                };
                ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height);
                raf = setInterval(frame, 45);
                const stop = () => {
                    if (!raf) return; clearInterval(raf); raf = null; canvas.remove(); activeGame = null;
                    print('<span class="term-ok">Wake up, Neo…</span> <span class="term-muted">the Matrix has you. (It was just a portfolio.)</span>');
                    input.focus();
                };
                activeGame = { onKey: stop, stop };
            },
        },
        /* ---------------- Fun: cowsay ---------------- */
        cowsay: {
            desc: 'Cow says',
            run(args) {
                let text = args.join(' ').trim();
                if (!text) text = 'Moo. Try: cowsay hire me';
                if (/^hire[ -]?me$/i.test(text)) text = 'Hire Baowen. He ships. 🚀';
                const width = 36;
                const words = text.split(/\s+/), lines = [];
                let cur = '';
                words.forEach((w) => { if ((cur + ' ' + w).trim().length > width) { lines.push(cur.trim()); cur = w; } else cur += ' ' + w; });
                if (cur.trim()) lines.push(cur.trim());
                const w = Math.max(...lines.map((l) => l.length));
                const out = [' ' + '_'.repeat(w + 2)];
                lines.forEach((l, i) => {
                    const [a, b] = lines.length === 1 ? ['<', '>'] : i === 0 ? ['/', '\\'] : i === lines.length - 1 ? ['\\', '/'] : ['|', '|'];
                    out.push(`${a} ${pad(l, w)} ${b}`);
                });
                out.push(' ' + '-'.repeat(w + 2));
                out.push('        \\   ^__^', '         \\  (oo)\\_______', '            (__)\\       )\\/\\', '                ||----w |', '                ||     ||');
                out.forEach((l) => print(`<span class="term-key">${esc(l)}</span>`));
            },
        },
        /* ---------------- Fun: sl ---------------- */
        sl: {
            desc: 'Choo choo',
            async run() {
                const train = [
                    '      ====        ________                ___________ ',
                    '  _D _|  |_______/        \\__I_I_____===__|_________| ',
                    '   |(_)---  |   H\\________/ |   |        =|___ ___|   ',
                    '   /     |  |   H  |  |     |   |         ||_| |_||   ',
                    '  |      |  |   H  |__--------------------| [___] |   ',
                    '  | ________|___H__/__|_____/[][]~\\_______|       |   ',
                    '  |/ |   |-----------I_____I [][] []  D   |=======|__ ',
                    '__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__ ',
                    ' |/-=|___|=    ||    ||    ||    |_____/~\\___/        ',
                    '  \\_/      \\O=====O=====O=====O_/      \\_/            ',
                ];
                const el = document.createElement('pre');
                el.className = 'term-game';
                el.style.width = '100%';
                body.appendChild(el);
                const cols = Math.max(40, Math.floor(body.clientWidth / 8.4));
                activeGame = { onKey() { /* you cannot stop the train */ }, stop() { done = true; } };
                let done = false;
                for (let off = cols; off > -60 && !done; off -= 2) {
                    el.innerHTML = train.map((l) => {
                        const line = ' '.repeat(Math.max(0, off)) + (off < 0 ? l.slice(-off) : l);
                        return '<span class="s">' + esc(line.slice(0, cols)) + '</span>';
                    }).join('\n');
                    body.scrollTop = body.scrollHeight;
                    await new Promise((r) => setTimeout(r, reduceMotion ? 0 : 40));
                }
                el.remove(); activeGame = null;
                print('<span class="term-muted">You meant <span class="term-key">ls</span>, didn\'t you? 🚂</span>');
                input.focus();
            },
        },
        /* ---------------- Fun: fortune ---------------- */
        fortune: {
            desc: 'Random fortune',
            run() {
                const f = [
                    'It works on my machine. — every engineer, ever',
                    'There are only two hard things in CS: cache invalidation, naming things, and off-by-one errors.',
                    'A good commit message is worth a thousand Slack messages.',
                    '99 little bugs in the code, take one down, patch it around… 127 little bugs in the code.',
                    'Weeks of coding can save you hours of planning.',
                    'The best time to write tests was before the bug. The second best time is now.',
                    'Your future teammate will read this code. Be kind to them. (It might be you.)',
                    'Talk is cheap. Show me the code. — Linus Torvalds',
                    'Redis cache hit rate 80% and a GPA of 3.965 — both took work. Ask me about either.',
                    'Fortune favors the prepared repo.',
                ];
                print(`<span class="term-warn">🥠</span> ${esc(f[Math.floor(Math.random() * f.length)])}`);
            },
        },
        vim: { hidden: true, run() { vimMode = true; print('<span class="term-muted">Entering vim… you are now trapped. Type <span class="term-key">:q!</span> to escape.</span>'); } },
        vi: { hidden: true, run() { commands.vim.run(); } },
        nano: { hidden: true, run() { print('<span class="term-muted">nano? Bold choice. (No editors here, only vibes.)</span>'); } },
        coffee: { hidden: true, run() { print('☕ Brewing… <span class="term-ok">done.</span> Productivity +20%.'); } },
        hello: { hidden: true, run() { print('Hello! 👋 Type <span class="term-key">help</span> to see what I can do.'); } },
        hi: { hidden: true, run() { commands.hello.run(); } },
        github: { hidden: true, run() { window.open(DATA.github, '_blank', 'noopener'); print(`Opening ${link(DATA.github)}`); } },
        linkedin: { hidden: true, run() { window.open(DATA.linkedin, '_blank', 'noopener'); print(`Opening ${link(DATA.linkedin)}`); } },
        leetcode: { hidden: true, run() { window.open(DATA.leetcode, '_blank', 'noopener'); print(`Opening ${link(DATA.leetcode)}`); } },
        history: { hidden: true, run() { history.forEach((h, i) => print(`  <span class="term-muted">${String(i + 1).padStart(3)}</span>  ${esc(h)}`)); } },
        clear: { desc: 'Clear screen', run() { body.innerHTML = ''; } },
        cls: { hidden: true, run() { commands.clear.run(); } },
        exit: { desc: 'Close terminal', run() { closeTerminal(); } },
        quit: { hidden: true, run() { closeTerminal(); } },
        close: { hidden: true, run() { closeTerminal(); } },
    };

    const bootTime = Date.now();
    function uptime() {
        const s = Math.floor((Date.now() - bootTime) / 1000);
        return s < 60 ? `${s}s on this page` : `${Math.floor(s / 60)}m ${s % 60}s on this page`;
    }

    async function execute(raw) {
        const line = raw.trim();
        if (!line) return;
        if (activeGame) return;                        // a game owns the keyboard right now
        history.push(line); histIdx = history.length;
        echoCommand(line);

        if (vimMode) {
            if (line === ':q!' || line === ':q' || line === ':wq') { vimMode = false; print('<span class="term-ok">Escaped vim. Legendary.</span>'); }
            else print('<span class="term-muted">(vim is ignoring you. Type <span class="term-key">:q!</span>)</span>');
            return;
        }

        const [name, ...args] = line.split(/\s+/);
        const cmd = commands[name.toLowerCase()];
        if (!cmd) {
            print(`<span class="term-err">command not found: ${esc(name)}</span>  <span class="term-muted">— type <span class="term-key">help</span></span>`);
            return;
        }
        await cmd.run(args);
    }

    /* ---------------------------------------------------------------------
       Open / close
       --------------------------------------------------------------------- */
    let booted = false;
    function openTerminal() {
        overlay.classList.add('open');
        if (!booted) {
            booted = true;
            print(`<span class="term-h">Welcome to baowenliu.com</span> <span class="term-muted">— portfolio-sh 1.0</span>`);
            print(`<span class="term-muted">Last login: ${esc(new Date().toDateString())} from your browser</span>`);
            print('');
            print(`Type <span class="term-key">help</span> to get started, <span class="term-key">exit</span> or <span class="term-key">Esc</span> to close.`);
            print('');
        }
        setTimeout(() => input.focus(), 30);
    }
    function closeTerminal() {
        if (activeGame) activeGame.stop();
        overlay.classList.remove('open');
        launcher.focus();
    }

    launcher.addEventListener('click', openTerminal);
    closeBtn.addEventListener('click', closeTerminal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeTerminal(); });
    body.addEventListener('click', () => input.focus());

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const v = input.value; input.value = '';
            execute(v);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (history.length) { histIdx = Math.max(0, histIdx - 1); input.value = history[histIdx]; }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (history.length) { histIdx = Math.min(history.length, histIdx + 1); input.value = history[histIdx] || ''; }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            const v = input.value;
            const parts = v.split(/\s+/);
            const pool = parts.length > 1 && parts[0] === 'cd' ? SECTIONS : Object.keys(commands).filter((k) => !commands[k].hidden);
            const cur = parts[parts.length - 1].toLowerCase();
            const hits = pool.filter((k) => k.startsWith(cur));
            if (hits.length === 1) { parts[parts.length - 1] = hits[0]; input.value = parts.join(' ') + ' '; }
            else if (hits.length > 1) print(`<span class="term-muted">${hits.join('  ')}</span>`);
        } else if (e.key === 'l' && e.ctrlKey) {
            e.preventDefault(); commands.clear.run();
        } else if (e.key === 'c' && e.ctrlKey && !input.value) {
            e.preventDefault(); print('^C');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (activeGame && overlay.classList.contains('open')) {
            if (e.metaKey || e.ctrlKey) return;           // leave ⌘K etc. alone
            e.preventDefault(); e.stopPropagation();
            activeGame.onKey(e);
        }
    }, true);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('open')) { closeTerminal(); return; }
        // Backtick opens the terminal, unless the user is typing somewhere
        if (e.key === '`' && !overlay.classList.contains('open')) {
            const t = e.target;
            if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
            e.preventDefault();
            openTerminal();
        }
    });
})();
