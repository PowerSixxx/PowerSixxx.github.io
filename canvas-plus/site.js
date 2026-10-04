// Canvas+ website: language switch, scroll effects and the live panel demo.
(function () {
  var root = document.documentElement, $ = function (s, el) { return (el || document).querySelector(s); }, $$ = function (s, el) { return [].slice.call((el || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- language ----
  var key = 'cp-lang', saved = null;
  try { saved = localStorage.getItem(key); } catch (e) {}
  var q = new URLSearchParams(location.search).get('lang');
  var EMBED = !!window.CP_EMBED;   // inside an <iframe> on another page (demo.html): only the panel
  var lang = q || saved || (/^zh/i.test(navigator.language || '') ? 'zh' : 'en');
  var zh = function () { return root.getAttribute('data-lang') === 'zh'; };
  function setLang(l) { root.setAttribute('data-lang', l); root.lang = l === 'zh' ? 'zh-CN' : 'en'; if (!EMBED) try { localStorage.setItem(key, l); } catch (e) {} renderDemo(); }
  if ($('#lang')) $('#lang').addEventListener('click', function () { setLang(zh() ? 'en' : 'zh'); });

  // ---- nav border + reveal on scroll + tile glow ----
  var nav = $('#nav');
  if (nav) addEventListener('scroll', function () { nav.classList.toggle('scrolled', scrollY > 8); }, { passive: true });
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
    $$('.rv').forEach(function (el) { io.observe(el); });
  } else $$('.rv').forEach(function (el) { el.classList.add('in'); });
  $$('.tile').forEach(function (el) {
    el.addEventListener('pointermove', function (e) { var r = el.getBoundingClientRect(); el.style.setProperty('--mx', (e.clientX - r.left) + 'px'); el.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
  });

  // ---- live panel demo: a copy of the real Canvas+ panel ----
  var dm = $('#dm'), cur = 0, touched = false;
  var L = function (en, z) { return zh() ? z : en; };
  var SVG = function (d, w) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (w || 2) + '" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>'; };
  var IC = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>', spark: '<path d="M11 3.5l1.9 5.1 5.1 1.9-5.1 1.9L11 17.5l-1.9-5.1L4 10.5l5.1-1.9z"/><path d="M19 3v4M17 5h4"/>',
    check: '<path d="M20 6 9 17l-5-5"/>', mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>', cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M12 14v4M10 16h4"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>', refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
    down: '<path d="m6 9 6 6 6-6"/>', back: '<path d="m15 18-6-6 6-6"/>', right: '<path d="m9 18 6-6-6-6"/>', bars: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/>', sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h10"/>', side: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/>', img: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>'
  };
  var ic = function (n, w) { return SVG(IC[n], w); };

  // Course colours (the Appearance tab's palettes repaint them everywhere).
  var PALS = [
    { n: ['Canvas colours', 'Canvas 默认'], c: ['#6d4fc2', '#0f7b5f', '#8b8d95', '#d97706'] },
    { n: ['Scarlet & Gray', 'Scarlet & Gray'], c: ['#bb0000', '#666666', '#d26a6a', '#3f3f3f'] },
    { n: ['Pastel', 'Pastel'], c: ['#f2a5b8', '#9fc3ea', '#a8dcc0', '#f6cf86'] },
    { n: ['Ocean', 'Ocean'], c: ['#0b2a5b', '#0c7bbd', '#14b2d8', '#1d4f91'] }
  ];
  var pal = 0, COURSES = ['CSE 3461', 'CSE 2431', 'CSE 3521', 'STAT 3470'];
  var col = function (code) { return PALS[pal].c[Math.max(0, COURSES.indexOf(code))]; };

  // ---- Deadlines ----
  var start = Date.now();
  var DL = [
    { t: 'Wireshark lab: TCP', c: 'CSE 3461', k: ['Assignment', '作业'], p: 10, h: -30.2 },
    { t: 'Lab 2: Shell implementation', c: 'CSE 2431', k: ['Assignment', '作业'], p: 50, h: 4.99, w: 10, ai: 1 },
    { t: 'Quiz 3 — Transport layer', c: 'CSE 3461', k: ['Quiz', '测验'], p: 10, h: 52.1 },
    { t: 'HW2: Search algorithms', c: 'CSE 3521', k: ['Assignment', '作业'], p: 100, h: 143.4 },
    { t: 'Project proposal', c: 'CSE 3521', k: ['Assignment', '作业'], p: 20, h: 215.6 },
    { t: 'Problem Set 5', c: 'STAT 3470', k: ['Assignment', '作业'], p: 40, h: 290 }
  ];
  var done = {}, days = 14, showDone = false;
  function left(ms) {
    var over = ms < 0, s = Math.abs(ms) / 1000, d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60);
    var v = d ? (zh() ? d + ' 天 ' + h + ' 小时' : d + 'd ' + h + 'h') : (zh() ? h + ' 小时 ' + m + ' 分' : h + 'h ' + m + 'm');
    return over ? L(v + ' overdue', '已逾期 ' + v) : L(v + ' left', '还剩 ' + v);
  }
  function when(t) {
    var d = new Date(t);
    return zh() ? (d.getMonth() + 1) + '月' + d.getDate() + '日 周' + '日一二三四五六'[d.getDay()] + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0')
      : d.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  }
  function paneDL() {
    var now = Date.now() - start, rows = DL.map(function (x, i) {
      var ms = x.h * 3600e3 - now;
      if (x.h > days * 24 || (done[i] && !showDone)) return '';
      var cls = ms < 0 ? 'red' : ms < 24 * 3600e3 ? 'red' : ms < 3 * 864e5 ? 'amb' : '';
      return '<div class="p-it' + (ms < 0 && !done[i] ? ' hot' : '') + (done[i] ? ' done' : '') + '" data-i="' + i + '">' +
        '<span class="p-ck" data-act="ck" data-i="' + i + '">' + ic('check', 3.5) + '</span>' +
        '<div><div class="tt">' + x.t + '</div><div class="mt"><span class="p-dot" style="background:' + col(x.c) + '"></span>' + x.c + ' · ' + L(x.k[0], x.k[1]) + ' · ' + x.p + L(' pts', ' 分') + '</div>' +
        (x.w ? '<span class="p-wt">' + L(x.w + '% of final grade', '占总成绩 ' + x.w + '%') + '</span>' : '') + '</div>' +
        '<div class="p-rt"><span class="p-cd ' + cls + '">' + left(ms) + '</span><span class="p-dt">' + when(start + x.h * 3600e3) + '</span>' +
        '<span class="p-acts"><button class="p-aig" data-act="ai">' + ic('spark') + L('AI guide', 'AI 拆解') + '</button><span class="p-mail">' + ic('mail') + '</span></span></div></div>';
    }).join('');
    return '<div class="p-seg"><button class="on">' + L('List', '列表') + '</button><button>' + L('Calendar', '日历') + '</button></div>' +
      '<div class="p-filters"><div class="p-seg">' + [7, 14, 30].map(function (d) { return '<button data-act="days" data-d="' + d + '" class="' + (d === days ? 'on' : '') + '">' + d + L('d', ' 天') + '</button>'; }).join('') + '</div>' +
      '<span class="p-tog" data-act="showdone"><button class="p-sw' + (showDone ? ' on' : '') + '" aria-label="show done"></button>' + L('Show done', '显示已完成') + '</span>' +
      '<span class="p-ib"><span>' + ic('cal') + '</span><span>' + ic('bell') + '</span><span>' + ic('refresh') + '</span></span></div>' +
      '<div class="p-list">' + rows + '</div>';
  }

  // ---- Final calc: grade, class standing, what you need on the final ----
  var C = [
    { code: 'CSE 2431', name: ['Intro to Operating Systems', '操作系统导论'], now: 91.5, graded: 55, w: .35, top: 23, rank: 11, n: 48, avg: 71, you: 80, lo: 19, hi: 27 },
    { code: 'CSE 3461', name: ['Computer Networking', '计算机网络'], now: 92.1, graded: 55, w: .35, top: 12, rank: 6, n: 52, avg: 78, you: 89, lo: 9, hi: 16 },
    { code: 'CSE 3521', name: ['Survey of AI I', '人工智能概论 I'], now: 84.0, graded: 50, w: .3, top: 35, rank: 17, n: 49, avg: 77, you: 81, lo: 30, hi: 41 }
  ];
  var T = [['A', 93], ['A-', 90], ['B+', 87], ['B', 83]], ci = 0, ti = 1;
  function curve(c) {
    var W = 300, H = 92, x0 = 40, x1 = 100, sd = 10, X = function (v) { return 8 + (v - x0) / (x1 - x0) * (W - 16); };
    var f = function (v) { return Math.exp(-Math.pow(v - c.avg, 2) / (2 * sd * sd)); }, Y = function (v) { return H - 14 - f(v) * (H - 34); };
    var pts = [], shade = [];
    for (var v = x0; v <= x1; v += 1) { pts.push(X(v).toFixed(1) + ',' + Y(v).toFixed(1)); if (v >= c.you) shade.push(X(v).toFixed(1) + ',' + Y(v).toFixed(1)); }
    var base = H - 14, acc = 'var(--p-acc)';
    return '<svg viewBox="0 0 ' + W + ' ' + (H + 10) + '">' +
      '<polygon points="' + X(c.you).toFixed(1) + ',' + base + ' ' + shade.join(' ') + ' ' + X(x1).toFixed(1) + ',' + base + '" fill="' + acc + '" opacity=".16"/>' +
      '<polyline points="' + pts.join(' ') + '" fill="none" stroke="var(--p-muted)" stroke-width="1.4"/>' +
      '<line x1="8" x2="' + (W - 8) + '" y1="' + base + '" y2="' + base + '" stroke="var(--p-line)"/>' +
      '<line x1="' + X(c.avg) + '" x2="' + X(c.avg) + '" y1="' + Y(c.avg) + '" y2="' + base + '" stroke="var(--p-muted)" stroke-dasharray="3 3"/>' +
      '<line x1="' + X(c.you) + '" x2="' + X(c.you) + '" y1="10" y2="' + base + '" stroke="' + acc + '" stroke-width="2"/>' +
      '<circle cx="' + X(c.you) + '" cy="' + Y(c.you) + '" r="3.5" fill="' + acc + '" stroke="var(--p-bg)" stroke-width="1.5"/>' +
      '<text x="' + (X(c.avg) - 4) + '" y="' + (Y(c.avg) - 5) + '" text-anchor="end" fill="var(--p-muted)">' + L('avg ', '平均 ') + c.avg + '%</text>' +
      '<text x="' + (X(c.you) + 5) + '" y="9" fill="' + acc + '">' + L('you ', '你 ') + c.you + '%</text>' +
      [40, 60, 80, 100].map(function (v) { return '<text x="' + X(v) + '" y="' + (H + 6) + '" text-anchor="middle" fill="var(--p-muted)">' + v + '%</text>'; }).join('') + '</svg>';
  }
  function paneCalc() {
    var c = C[ci], need = (T[ti][1] - c.now * (1 - c.w)) / c.w, out = need > 100;
    var diff = (c.you - c.avg).toFixed(1);
    return '<div class="p-cs" data-act="course"><span class="p-dot" style="width:9px;height:9px;background:' + col(c.code) + '"></span><div><b>' + c.code + '</b><small>' + L(c.name[0], c.name[1]) + '</small></div>' +
      '<span class="chg">' + L('Change', '切换') + ic('down') + '</span></div>' +
      '<div class="p-tiles"><div class="p-tile"><small>' + L('Current grade', '当前成绩') + '</small><b>' + c.now.toFixed(1) + '%</b><span>' + L('same as Canvas shows', '和 Canvas 显示的一致') + '</span></div>' +
      '<div class="p-tile"><small>' + L('Graded so far', '已出分占比') + '</small><b>' + c.graded + '%</b><span>' + L('of the weight', '的总权重') + '</span></div></div>' +
      '<div class="p-card"><div class="p-st-h">' + ic('bars') + L('Where you stand in the class', '班级排位') + '</div>' +
      '<div class="p-st-big">' + L('About top ' + c.top + '%', '约前 ' + c.top + '%') + '</div>' +
      '<div class="p-st-sub">' + L('About #' + c.rank + ' of ' + c.n + ' · likely top ' + c.lo + '–' + c.hi + '%', '约第 ' + c.rank + ' 名（共 ' + c.n + ' 人）· 可能范围：前 ' + c.lo + '%–' + c.hi + '%') + '</div>' +
      '<div class="p-st-blue">' + L(diff + ' points above the class average on graded work', '按已出分的成绩，比班级平均高 ' + diff + ' 个百分点') + '</div>' +
      '<div class="p-curve">' + curve(c) + '</div></div>' +
      '<div class="p-need"><div class="l"><small>' + L('Target', '目标') + ' <button class="p-tgt" data-act="tgt">' + T[ti][0] + ' ▾</button> · ' + L('on the final you need', '期末得分率至少需要') + '</small>' +
      '<b>' + (out ? L('Even 100% on the final isn’t enough', '就算考满分也够不到') : need <= 0 ? L('Already locked in', '已经稳了') : L('Out of 100 pts, that is at least ' + Math.ceil(need) + ' pts', '满分 100 分，至少 ' + Math.ceil(need) + ' 分')) + '</b></div>' +
      '<span class="big' + (out ? ' bad' : '') + '">' + Math.max(0, need).toFixed(1) + '%</span></div>';
  }

  // ---- AI guide on an assignment ----
  var G = {
    en: { tldr: 'Build a small Unix shell in C that runs commands, supports pipes (|) and redirection (<, >), and survives Ctrl-C. Hand in shell.c and a Makefile.', time: '4–6 hours',
      skills: ['fork / exec', 'pipes & file descriptors', 'signal handling'], sub: ['shell.c', 'Makefile', 'README with test runs'],
      steps: [['Parse the line', 'Split on | into commands, then on spaces into arguments.', 'Get one command working before pipes.'], ['Run one command', 'fork(); in the child execvp(); in the parent waitpid().', ''],
        ['Add redirection', 'open() the file and dup2() it onto stdin / stdout before execvp().', ''], ['Add pipes', 'pipe() between each pair and close every unused end.', 'An open write end means the reader never sees EOF.'],
        ['Handle Ctrl-C', 'Ignore SIGINT in the shell; restore it in each child.', '']] },
    zh: { tldr: '用 C 写一个小型 Unix shell：能运行命令，支持管道（|）和重定向（<、>），按 Ctrl-C 不退出。提交 shell.c 和 Makefile。', time: '4–6 小时',
      skills: ['fork / exec', '管道与文件描述符', '信号处理'], sub: ['shell.c', 'Makefile', '附测试结果的 README'],
      steps: [['解析命令行', '先按 | 拆成多个命令，再按空格拆出参数。', '先让单个命令跑通，再做管道。'], ['运行一个命令', 'fork()；子进程里 execvp()，父进程里 waitpid()。', ''],
        ['加上重定向', '在 execvp() 之前 open() 文件，再用 dup2() 接到 stdin / stdout。', ''], ['加上管道', '每两个命令之间 pipe()，用不到的那一端都要关掉。', '写端没关，读的一方永远读不到 EOF。'],
        ['处理 Ctrl-C', 'shell 本身忽略 SIGINT，每个子进程里再恢复默认。', '']] }
  };
  var aiShown = 0, aiTimer = null;
  function paneAI() {
    var g = G[zh() ? 'zh' : 'en'];
    return '<div class="p-back"><a data-act="back">' + ic('back', 2.4) + L('Back', '返回') + '</a><span class="p-badge">' + ic('spark') + L('Canvas+ AI guide', 'Canvas+ AI 拆解') + '</span></div>' +
      '<p class="p-h">Lab 2: Shell implementation</p><div class="p-st-sub">CSE 2431 · ' + L('due in 5 h · 10% of your grade', '5 小时后截止 · 占总成绩 10%') + '</div>' +
      '<div class="p-tldr">' + g.tldr + '</div>' +
      '<div class="p-st-sub">' + L('Estimated time: ', '预计用时：') + '<b style="color:var(--p-fg)">' + g.time + '</b></div>' +
      '<div class="p-lbl">' + L('What this trains', '锻炼的能力') + '</div><div class="p-chips">' + g.skills.map(function (x) { return '<span>' + x + '</span>'; }).join('') + '</div>' +
      '<div class="p-lbl">' + L('Step by step', '一步一步') + '</div><div class="p-steps">' + g.steps.map(function (x, i) {
        return '<div class="p-step' + (i < aiShown ? ' in' : '') + '"><i>' + (i + 1) + '</i><div><b>' + x[0] + '</b><span>' + x[1] + '</span>' + (x[2] ? '<em><b>' + L('Tip', '小提示') + '</b> ' + x[2] + '</em>' : '') + '</div></div>';
      }).join('') + '</div>' +
      '<div class="p-fine">' + L('Explains the steps — never writes the answer for you.', '只讲思路和步骤，不替你写答案。') + '</div>';
  }
  function runAI() {
    clearTimeout(aiTimer); aiShown = 0; draw();
    (function next() { if (aiShown >= 5) return; aiShown++; var s = $$('.p-step', dm)[aiShown - 1]; if (s) s.classList.add('in'); aiTimer = setTimeout(next, reduce ? 0 : 600); })();
  }

  // ---- Appearance ----
  var dark = false, auto = false;
  function paneLook() {
    var row = function (icn, a, b, right, act) { return '<div class="p-set"' + (act ? ' data-act="' + act + '"' : '') + '><span class="p-ico">' + ic(icn) + '</span><div class="tx"><b>' + a + '</b><small>' + b + '</small></div>' + right + '</div>'; };
    var sw = function (on) { return '<button class="p-sw' + (on ? ' on' : '') + '"></button>'; };
    var chev = function (t) { return '<span class="chev">' + (t || '') + ic('right') + '</span>'; };
    return '<div class="p-sec">' + L('Theme', '外观') + '</div><div class="p-group">' +
      row('moon', L('Dark mode', '暗色模式'), L('No white flashes between pages', '切换页面不闪白'), sw(dark), 'dark') +
      row('sun', L('Follow my computer', '跟随系统深浅色'), L('Light by day, dark at night', '系统切换时自动跟着变'), sw(auto), 'auto') +
      row('img', L('Background picture', '背景图片'), L('Your photo behind frosted cards', '自定义背景图和毛玻璃卡片'), chev()) + '</div>' +
      '<div class="p-sec">' + L('Course colours', '课程配色') + '</div><div class="p-group"><div class="p-pals">' + PALS.map(function (p, k) {
        return '<button class="p-pal' + (k === pal ? ' on' : '') + '" data-act="pal" data-k="' + k + '">' + p.c.map(function (c) { return '<i style="background:' + c + '"></i>'; }).join('') + ' ' + L(p.n[0], p.n[1]) + '</button>'; }).join('') + '</div></div>' +
      '<div class="p-sec">' + L('Menus', '菜单') + '</div><div class="p-group">' +
      row('menu', L('Course menu', '课程菜单'), L('Hide Discussions, People, Chat…', '隐藏 Discussions、People、Chat 等'), chev(L('3 hidden', '已隐藏 3 项'))) +
      row('side', L('Canvas’s left menu', '最左侧导航栏'), L('Hide Help, History, Groups…', '隐藏 Help、History、Groups 等'), chev(L('2 hidden', '已隐藏 2 项'))) + '</div>';
  }

  // ---- shell: header, tabs, panes ----
  var TABS = [['Deadlines', '作业倒计时'], ['Final calc', '期末计算器'], ['AI Course', 'AI 课程'], ['Appearance', '界面美化']];
  function draw() {
    dm.classList.toggle('dark', dark);
    var tabs = TABS.map(function (x, i) { return '<button class="p-tab' + (i === cur ? ' on' : '') + (i === 2 ? ' ai' : '') + '" data-tab="' + i + '">' + (i === 2 ? ic('spark') : '') + L(x[0], x[1]) + (i === 2 ? '<span class="rd"></span>' : '') + '</button>'; }).join('');
    var panes = [paneDL(), paneCalc(), paneAI(), paneLook()].map(function (h, i) { return '<div class="p-pane' + (i === cur ? ' on' : '') + '">' + h + '</div>'; }).join('');
    dm.innerHTML = '<div class="p-head"><div class="p-row"><span class="p-brand">Canvas<b>+</b></span><span class="p-search">' + ic('search') + '<span>' + L('Search…', '搜索课程、作业…') + '</span><span class="p-new">' + L('New', '新') + '</span><span class="p-kbd"><i>⌘</i><i>K</i></span></span><span class="p-end"><span class="p-av">A</span><span class="p-x">×</span></span></div>' +
      '<div class="p-tabs"><span class="p-ind"></span>' + tabs + '</div></div><div class="p-body">' + panes + '</div>';
    placeInd(true);
  }
  function placeInd(instant) {
    var ind = $('.p-ind', dm), b = $$('.p-tab', dm)[cur]; if (!ind || !b) return;
    if (instant) ind.style.transition = 'none';
    ind.style.width = b.offsetWidth + 'px'; ind.style.transform = 'translateX(' + b.offsetLeft + 'px)';
    if (instant) { ind.offsetWidth; ind.style.transition = ''; }
  }
  function show(i) {
    var prev = cur; cur = i;
    var b = $$('.p-tab', dm), p = $$('.p-pane', dm);
    b.forEach(function (x, k) { x.classList.toggle('on', k === i); }); p.forEach(function (x, k) { x.classList.toggle('on', k === i); });
    placeInd();
    if (i === 2 && prev !== 2) runAI();
  }
  // Only the panes that change are redrawn (keeps the sliding tab and fades smooth).
  function redrawPane(i) { var p = $$('.p-pane', dm)[i]; if (p) p.innerHTML = [paneDL, paneCalc, paneAI, paneLook][i](); }
  dm.addEventListener('click', function (e) {
    var t = e.target.closest('[data-tab],[data-act]'); if (!t) return;
    touched = true;
    if (t.dataset.tab != null) return show(+t.dataset.tab);
    var a = t.dataset.act;
    if (a === 'ck') { done[t.dataset.i] = !done[t.dataset.i]; redrawPane(0); }
    else if (a === 'days') { days = +t.dataset.d; redrawPane(0); }
    else if (a === 'showdone') { showDone = !showDone; redrawPane(0); }
    else if (a === 'ai') show(2);
    else if (a === 'back') show(0);
    else if (a === 'course') { ci = (ci + 1) % C.length; redrawPane(1); }
    else if (a === 'tgt') { ti = (ti + 1) % T.length; redrawPane(1); }
    else if (a === 'dark') { dark = !dark; auto = false; dm.classList.toggle('dark', dark); redrawPane(3); redrawPane(1); }
    else if (a === 'auto') { auto = !auto; if (auto) dark = matchMedia('(prefers-color-scheme: dark)').matches; dm.classList.toggle('dark', dark); redrawPane(3); }
    else if (a === 'pal') { pal = +t.dataset.k; redrawPane(3); redrawPane(0); redrawPane(1); }
  });
  dm.addEventListener('pointerdown', function () { touched = true; });
  if ('ResizeObserver' in window) new ResizeObserver(function () { placeInd(true); }).observe(dm);
  setInterval(function () { if (cur === 0) redrawPane(0); }, 1000);
  if (!reduce) setInterval(function () { if (!touched && document.visibilityState === 'visible') show((cur + 1) % 4); }, 5600);

  // Notification toasts
  var TO = [
    { en: ['New grade posted', 'CSE 2431 · Project 1 · tap to see'], zh: ['出分了', 'CSE 2431 · Project 1 · 点击查看'] },
    { en: ['Due date moved', 'CSE 3461 · Quiz 3 → Thu 11:59 PM'], zh: ['截止时间改了', 'CSE 3461 · Quiz 3 → 周四 23:59'] },
    { en: ['New announcement', 'CSE 3521 · HW 3 posted'], zh: ['新公告', 'CSE 3521 · HW 3 已发布'] }
  ];
  var toast = $('#toast'), tk = 0;
  function cycleToast() {
    if (document.visibilityState !== 'visible') return;
    var x = TO[tk++ % TO.length][zh() ? 'zh' : 'en'];
    $('#toastTx').innerHTML = '<b>' + x[0] + '</b><span>' + x[1] + '</span>';
    toast.classList.add('show');
    setTimeout(function () { toast.classList.remove('show'); }, 3600);
  }
  if (toast && !reduce) { setTimeout(cycleToast, 1800); setInterval(cycleToast, 7000); }

  // "Try the demo": bring the panel into view, ring it, and point at things to click, one after another.
  var stage = $('#demo') || dm.parentNode, coach = document.createElement('div'); coach.className = 'coach'; stage.appendChild(coach);
  var tourT = [];
  function point(sel, html) {
    var el = $(sel, dm); if (!el) return;
    var s = stage.getBoundingClientRect(), r = el.getBoundingClientRect();
    coach.innerHTML = html; coach.classList.add('show');
    var w = coach.offsetWidth, x = Math.max(0, Math.min(s.width - w, r.left - s.left + r.width / 2 - 24));
    coach.style.left = x + 'px'; coach.style.top = (r.top - s.top - coach.offsetHeight - 12) + 'px';
    coach.style.setProperty('--ax', Math.max(10, Math.min(w - 22, r.left - s.left + r.width / 2 - x - 6)) + 'px');
  }
  function endTour() { tourT.forEach(clearTimeout); tourT = []; coach.classList.remove('show'); }
  function tour() {
    touched = true; endTour();
    var r = dm.getBoundingClientRect();
    if (r.top < 70 || r.bottom > innerHeight) dm.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    dm.classList.remove('pulse'); dm.offsetWidth; dm.classList.add('pulse');
    var steps = [
      function () { show(0); point('.p-ck', L('<b>Tick</b> an assignment off', '<b>点圆圈</b>把作业标记为完成')); },
      function () { show(1); point('.p-tgt', L('Change the <b>target grade</b> — see what you need on the final', '<b>换个目标成绩</b>，看看期末要考多少')); },
      function () { show(2); point('.p-badge', L('A step-by-step <b>AI guide</b> for the assignment', 'AI 把作业<b>一步步拆解</b>')); },
      function () { show(3); point('.p-pal', L('Try a <b>colour palette</b> or <b>dark mode</b>', '试试<b>课程配色</b>或<b>暗色模式</b>')); },
      function () { coach.classList.remove('show'); }
    ];
    steps.forEach(function (f, i) { tourT.push(setTimeout(f, (reduce ? 0 : 500) + i * 3200)); });
  }
  if ($('#tryDemo')) $('#tryDemo').addEventListener('click', function (e) { e.preventDefault(); tour(); });
  dm.addEventListener('pointerdown', function (e) { if (e.isTrusted) endTour(); });

  function renderDemo() { draw(); if (cur === 2) runAI(); }

  // ---- AI cards: each sticks under the one before; the ones underneath shrink and dim ----
  var stack = $('#stack'), cards = $$('.scard', stack), sb = $$('.snav-b'), sActive = -1;
  function stickTop(c) { return parseFloat(getComputedStyle(c).top) || 0; }
  function onStack() {
    var n = cards.length, act = 0;
    cards.forEach(function (c, i) {
      var r = c.getBoundingClientRect(), h = r.height || 1, depth = 0;
      for (var k = i + 1; k < n; k++) {                 // how far each later card has slid over this one (0..1)
        var t = cards[k].getBoundingClientRect().top, p = (r.top + h - t) / h;
        depth += Math.max(0, Math.min(1, p));
      }
      if (!reduce) { c.style.transform = depth ? 'scale(' + (1 - Math.min(depth, 3) * .045).toFixed(4) + ')' : ''; c.style.filter = depth ? 'brightness(' + (1 - Math.min(depth, 2) * .22).toFixed(3) + ')' : ''; }
      if (r.top <= stickTop(c) + h * .5) act = i;
    });
    if (act !== sActive) { sActive = act; sb.forEach(function (b, k) { b.classList.toggle('on', k === act); }); }
  }
  var sTick = false;
  addEventListener('scroll', function () { if (!sTick) { sTick = true; requestAnimationFrame(function () { sTick = false; onStack(); }); } }, { passive: true });
  addEventListener('resize', onStack);
  // Clicking a name scrolls to where that card sits on top.
  sb.forEach(function (b, k) { b.addEventListener('click', function () {
    var c = cards[k], step = c.offsetHeight + parseFloat(getComputedStyle(c).marginBottom);
    var y = stack.getBoundingClientRect().top + scrollY + k * step - stickTop(c) + 2;
    scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
  }); });
  onStack();

  // Pricing: once Plus / Pro are on sale (the server has a price), show the real price and a button instead of "Coming soon".
  var plans = $$('[data-plan]');
  if (plans.length && window.fetch) fetch('https://ai.baowenliu.com/v1/prices').then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
    if (!j) return;
    plans.forEach(function (el) {
      var pr = j[el.dataset.plan]; if (!pr || !pr.amount) return;
      var soon = $('.soon', el); if (soon) soon.remove();
      var amt = $('.amt', el), small = amt && $('small', amt);
      if (amt && small) { amt.firstChild.nodeValue = (pr.currency === 'usd' ? '$' : pr.currency.toUpperCase() + ' ') + (pr.amount / 100).toFixed(2); }
      var btn = $('.plan-buy', el); if (btn) btn.hidden = false;
    });
  }).catch(function () {});

  setLang(lang === 'zh' ? 'zh' : 'en');
  // For the page that embeds the demo: follow its language and light / dark mode.
  window.cpDemo = { setLang: function (l) { setLang(l === 'zh' ? 'zh' : 'en'); }, setDark: function (d) { dark = !!d; auto = false; draw(); } };
  if (EMBED) {
    var th = new URLSearchParams(location.search).get('theme'); if (th === 'dark') window.cpDemo.setDark(true);
    addEventListener('message', function (e) { var d = e.data || {}; if (d.cpDemo) { if (d.lang) window.cpDemo.setLang(d.lang); if (d.theme) window.cpDemo.setDark(d.theme === 'dark'); } });
  }
})();
