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
    filter: '<path d="M4 6.1h16l-6.2 7.3v5.4l-3.6 1.8v-7.2z"/>', up: '<path d="m6 15 6-6 6 6"/>',
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
  // k: assignment | quiz | discussion | event   ·   w: share of the final grade (%), as the extension works it out from the course's grade groups
  var KINDS = { assignment: ['Assignment', '作业', 'Assignments'], quiz: ['Quiz', '测验', 'Quizzes'], discussion: ['Discussion', '讨论', 'Discussions'], event: ['Event', '日程', 'Events'] };
  var KZH = { assignment: '作业', quiz: '测验', discussion: '讨论', event: '日程' };
  var DL = [
    { t: 'Wireshark lab: TCP', c: 'CSE 3461', k: 'assignment', p: 10, h: -30.2, w: 3 },
    { t: 'Lab 2: Shell implementation', c: 'CSE 2431', k: 'assignment', p: 50, h: 4.99, w: 10, ai: 1 },
    { t: 'Office hours', c: 'CSE 3461', k: 'event', h: 28.5 },
    { t: 'Quiz 3 — Transport layer', c: 'CSE 3461', k: 'quiz', p: 10, h: 52.1, w: 2.5 },
    { t: 'Week 6 discussion', c: 'CSE 3521', k: 'discussion', p: 5, h: 76.4, w: 1.5 },
    { t: 'Study group (Dreese 280)', c: 'CSE 3521', k: 'event', h: 98.2 },
    { t: 'HW2: Search algorithms', c: 'CSE 3521', k: 'assignment', p: 100, h: 143.4, w: 20 },
    { t: 'Project proposal', c: 'CSE 3521', k: 'assignment', p: 20, h: 215.6, w: 5 },
    { t: 'Problem Set 5', c: 'STAT 3470', k: 'assignment', p: 40, h: 290, w: 12 }
  ];
  var done = {}, days = 14, showDone = false, view = 'list', hide = {}, showKinds = false, cardAnim = false, listAnim = false, lastKind = '';
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
  function kindCard() {
    return '<div class="p-kcard' + (cardAnim ? '' : ' still') + '"><div class="p-khead">' + ic('filter') + '<b>' + L('Types', '类型') + '</b></div><div class="p-kchips">' +
      Object.keys(KINDS).map(function (k) { var on = !hide[k];
        return '<button class="p-kchip' + (on ? ' on' : '') + (k === lastKind ? ' pop' : '') + '" role="checkbox" aria-checked="' + on + '" data-act="kind" data-k="' + k + '"><span class="kc">' + ic('check', 3) + '</span>' + L(KINDS[k][2], KZH[k]) + '</button>'; }).join('') +
      '</div><p class="p-khint">' + L('Events are calendar items such as office hours and class meetings, plus page to-dos and notes. Hidden types also leave the badge, reminders and calendar export.',
        '日程指 office hour、上课时间这类日历安排，以及页面待办和笔记。隐藏的类型也不会出现在图标数字、到期提醒和日历导出里。') + '</p></div>';
  }
  function paneDL() {
    var nHidden = Object.keys(hide).filter(function (k) { return hide[k]; }).length;
    var now = Date.now() - start, rows = DL.map(function (x, i) {
      var ms = x.h * 3600e3 - now;
      if (x.h > days * 24 || (done[i] && !showDone) || hide[x.k]) return '';
      var cls = ms < 0 ? 'red' : ms < 24 * 3600e3 ? 'red' : ms < 3 * 864e5 ? 'amb' : '';
      return '<div class="p-it' + (ms < 0 && !done[i] ? ' hot' : '') + (done[i] ? ' done' : '') + '" data-i="' + i + '">' +
        '<span class="p-ck" data-act="ck" data-i="' + i + '">' + ic('check', 3.5) + '</span>' +
        '<div><div class="tt">' + x.t + '</div><div class="mt"><span class="p-dot" style="background:' + col(x.c) + '"></span>' + x.c + ' · ' + L(KINDS[x.k][0], KINDS[x.k][1]) + (x.p ? ' · ' + x.p + L(' pts', ' 分') : '') + '</div>' +
        (x.w ? '<span class="p-wt' + (x.w >= 10 ? ' hi' : x.w >= 5 ? ' mid' : '') + '">' + L(x.w + '% of final grade', '占总成绩 ' + x.w + '%') + '</span>' : '') + '</div>' +
        '<div class="p-rt"><span class="p-cd ' + cls + '">' + left(ms) + '</span><span class="p-dt">' + when(start + x.h * 3600e3) + '</span>' +
        (x.k === 'event' ? '' : '<span class="p-acts"><button class="p-aig" data-act="ai">' + ic('spark') + L('AI guide', 'AI 拆解') + '</button><span class="p-mail">' + ic('mail') + '</span></span>') + '</div></div>';
    }).join('');
    var cal = '';
    if (view === 'cal') {
      var t0 = new Date(start); t0.setHours(0, 0, 0, 0); var first = new Date(t0.getTime() - t0.getDay() * 864e5);
      cal = '<div class="p-calg">' + (zh() ? '日一二三四五六' : 'SMTWTFS').split('').map(function (d) { return '<b>' + d + '</b>'; }).join('') +
        Array.from({ length: 28 }, function (_, k) {
          var day = new Date(first.getTime() + k * 864e5), hit = DL.filter(function (x) { if (hide[x.k]) return false; var due = new Date(start + x.h * 3600e3); return due.toDateString() === day.toDateString(); })[0];
          return '<span class="p-cd2' + (day.toDateString() === t0.toDateString() ? ' today' : '') + '">' + day.getDate() + (hit ? '<i style="background:' + col(hit.c) + '"></i>' : '') + '</span>';
        }).join('') + '</div>';
    }
    return '<div class="p-seg"><button data-act="view" data-v="list" class="' + (view === 'list' ? 'on' : '') + '">' + L('List', '列表') + '</button><button data-act="view" data-v="cal" class="' + (view === 'cal' ? 'on' : '') + '">' + L('Calendar', '日历') + '</button></div>' +
      '<div class="p-filters"><div class="p-seg">' + [7, 14, 30].map(function (d) { return '<button data-act="days" data-d="' + d + '" class="' + (d === days ? 'on' : '') + '">' + d + L('d', ' 天') + '</button>'; }).join('') + '</div>' +
      '<span class="p-tog" data-act="showdone"><button class="p-sw' + (showDone ? ' on' : '') + '" aria-label="show done"></button>' + L('Show done', '显示已完成') + '</span>' +
      '<span class="p-ib"><span class="p-kb' + (nHidden ? ' on' : '') + (showKinds ? ' open' : '') + '" data-act="kinds" title="' + L('Types', '类型') + '">' + ic('filter') + (nHidden ? '<i></i>' : '') + '</span>' +
      '<span>' + ic('cal') + '</span><span class="on">' + ic('bell') + '</span><span>' + ic('refresh') + '</span></span></div>' +
      (showKinds ? kindCard() : '') +
      (view === 'cal' ? cal : (rows ? '<div class="p-list' + (listAnim ? ' p-fade' : '') + '">' + rows + '</div>'
        : '<div class="p-empty">' + L('Nothing to show — every type is hidden.', '所有类型都隐藏了，没有可显示的。') + ' <a data-act="kindsall">' + L('Show all', '全部显示') + '</a></div>'));
  }

  // ---- Final calc: grade, class standing, what you need on the final ----
  var C = [
    { code: 'CSE 2431', name: ['Intro to Operating Systems', '操作系统导论'], now: 91.5, graded: 55, w: .35, top: 23, rank: 11, n: 48, avg: 71, you: 80, lo: 19, hi: 27 },
    { code: 'CSE 3461', name: ['Computer Networking', '计算机网络'], now: 92.1, graded: 55, w: .35, top: 12, rank: 6, n: 52, avg: 78, you: 89, lo: 9, hi: 16 },
    { code: 'CSE 3521', name: ['Survey of AI I', '人工智能概论 I'], now: 84.0, graded: 50, w: .3, top: 35, rank: 17, n: 49, avg: 77, you: 81, lo: 30, hi: 41 },
    { code: 'STAT 3470', name: ['Intro to Probability', '概率论导论'], now: 88.6, graded: 60, w: .3, top: 28, rank: 14, n: 51, avg: 79, you: 86, lo: 23, hi: 33 }
  ];
  // grade so far over the term (one point per graded week), for the trend on each course card
  var TR = { 'CSE 2431': [96, 94.5, 93, 92.4, 91.8, 91.5], 'CSE 3461': [88, 90.5, 89.8, 91.2, 91.6, 92.1], 'CSE 3521': [91, 88.5, 86.2, 85.1, 83.8, 84.0], 'STAT 3470': [84, 86.5, 87.2, 88.9, 88.1, 88.6] };
  var calcHome = true;
  function letter(v) { var S = [[93, 'A'], [90, 'A-'], [87, 'B+'], [83, 'B'], [80, 'B-'], [77, 'C+'], [73, 'C'], [70, 'C-'], [60, 'D'], [0, 'E']]; for (var k = 0; k < S.length; k++) if (v >= S[k][0]) return S[k][1]; }
  function lcls(l) { return /^A/.test(l) ? 'g' : /^B/.test(l) ? 'b' : 'o'; }
  function gpaDial(v) {
    var R = 74, cx = 90, cy = 88, a0 = Math.PI, k = v / 4, a1 = Math.PI * (1 - k), P = function (a) { return (cx + R * Math.cos(a)).toFixed(1) + ' ' + (cy - R * Math.sin(a)).toFixed(1); };
    return '<svg class="p-dial" viewBox="0 0 180 100"><path d="M' + P(a0) + ' A' + R + ' ' + R + ' 0 0 1 ' + P(0) + '" fill="none" stroke="var(--p-line)" stroke-width="13" stroke-linecap="round"/>' +
      '<path class="arc" d="M' + P(a0) + ' A' + R + ' ' + R + ' 0 0 1 ' + P(a1) + '" fill="none" stroke="var(--p-acc)" stroke-width="13" stroke-linecap="round" pathLength="100" style="--len:' + (k * 100).toFixed(1) + '"/></svg>';
  }
  function spark(c) {
    var v = TR[c.code], W = 150, H = 46, lo = Math.min.apply(0, v.concat([90])) - 2, hi = Math.max.apply(0, v) + 2, X = function (i) { return 12 + i / (v.length - 1) * (W - 18); }, Y = function (x) { return 4 + (hi - x) / (hi - lo) * (H - 8); };
    var pts = v.map(function (x, i) { return X(i).toFixed(1) + ',' + Y(x).toFixed(1); }), cc = col(c.code), gl = Y(93) > H ? Y(90) : Y(93), gt = Y(93) > H ? 'A-' : 'A';
    return '<svg viewBox="0 0 ' + W + ' ' + (H + 2) + '" class="p-spark"><polygon points="' + X(0) + ',' + H + ' ' + pts.join(' ') + ' ' + X(v.length - 1) + ',' + H + '" fill="' + cc + '" opacity=".14"/>' +
      '<line x1="12" x2="' + (W - 6) + '" y1="' + gl.toFixed(1) + '" y2="' + gl.toFixed(1) + '" stroke="var(--p-muted)" stroke-dasharray="2 3" opacity=".6"/><text x="0" y="' + (gl + 3).toFixed(1) + '" fill="var(--p-muted)">' + gt + '</text>' +
      '<polyline points="' + pts.join(' ') + '" fill="none" stroke="' + cc + '" stroke-width="1.8" stroke-linejoin="round"/>' +
      '<circle cx="' + X(v.length - 1).toFixed(1) + '" cy="' + Y(v[v.length - 1]).toFixed(1) + '" r="3" fill="var(--p-bg)" stroke="' + cc + '" stroke-width="1.6"/></svg>';
  }
  function paneHome() {
    return '<div class="p-gpa"><div class="p-dialw">' + gpaDial(3.62) + '<div class="p-gv"><span class="l">B+</span><b>3.62</b><small>/ 4.0</small></div></div>' +
      '<div class="p-gt">' + L('Cumulative GPA', '累计 GPA') + ' <span class="p-est">' + L('estimate', '估算') + '</span></div>' +
      '<div class="p-gm">' + L('8 courses · 30 credits · through Spring 2026', '8 门课 · 30 学分 · 截至 Spring 2026') + '</div>' +
      '<div class="p-gp">' + ic('spark') + L('This term (projected): 3.85 · cumulative after: 3.70', '本学期预计 3.85 · 读完后累计 3.70') + '<span class="up">▲ 0.08</span></div>' +
      '<span class="p-gb">' + L('Courses & credits', '课程与学分') + ic('right') + '</span></div>' +
      '<div class="p-lbl">' + L('Pick a course', '选择课程') + '</div><div class="p-cgs">' + C.map(function (c, k) {
        var lt = letter(c.now);
        return '<button class="p-cg" data-act="pick" data-k="' + k + '"><div class="h"><span class="p-dot" style="width:9px;height:9px;background:' + col(c.code) + '"></span><b>' + c.code + '</b></div>' +
          '<small>' + L(c.name[0], c.name[1]) + '</small><div class="v"><b>' + c.now.toFixed(1) + '%</b><span class="lt ' + lcls(lt) + '">' + lt + '</span></div>' + spark(c) +
          '<div class="d"><span>' + L('Aug 27', '8月27日') + '</span><span>' + L('Today', '今天') + '</span></div></button>';
      }).join('') + '</div>';
  }
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
    if (calcHome) return paneHome();
    var c = C[ci], need = (T[ti][1] - c.now * (1 - c.w)) / c.w, out = need > 100;
    var diff = (c.you - c.avg).toFixed(1);
    return '<div class="p-back"><a class="txt" data-act="home" aria-label="' + L('All courses', '全部课程') + '">' + ic('back', 2.6) + L('All courses', '全部课程') + '</a></div><div class="p-cs" data-act="course"><span class="p-dot" style="width:9px;height:9px;background:' + col(c.code) + '"></span><div><b>' + c.code + '</b><small>' + L(c.name[0], c.name[1]) + '</small></div>' +
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
    return '<div class="p-back"><a data-act="back" aria-label="' + L('Back', '返回') + '" title="' + L('Back', '返回') + '">' + ic('back', 2.6) + '</a><span class="p-badge">' + ic('spark') + L('Canvas+ AI guide', 'Canvas+ AI 拆解') + '</span></div>' +
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
    clearTimeout(aiTimer); aiShown = 0; redrawPane(2);   // only the AI pane: a full redraw would cut the tab pill's spring short
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
  // Switching tabs: the pill lifts for a moment and springs onto the new tab (like the extension since 1.3).
  function show(i, fromDrag) {
    var prev = cur; cur = i;
    var b = $$('.p-tab', dm), p = $$('.p-pane', dm), ind = $('.p-ind', dm);
    b.forEach(function (x, k) { x.classList.toggle('on', k === i); }); p.forEach(function (x, k) { x.classList.toggle('on', k === i); });
    if (ind && !reduce && (prev !== i || fromDrag)) {
      ind.style.transition = ''; ind.classList.add('lift', 'landing'); ind.offsetWidth;
      placeInd();
      setTimeout(function () { ind.classList.remove('lift'); }, fromDrag ? 16 : 150);   // a tap: lifted for a moment, then lands with a bounce
      clearTimeout(ind._lt); ind._lt = setTimeout(function () { ind.classList.remove('landing'); }, 600);
    } else placeInd();
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
    else if (a === 'view') { view = t.dataset.v; redrawPane(0); }
    else if (a === 'showdone') { showDone = !showDone; redrawPane(0); }
    else if (a === 'kinds') { showKinds = !showKinds; cardAnim = showKinds; redrawPane(0); cardAnim = false; }
    else if (a === 'kind') { hide[t.dataset.k] = !hide[t.dataset.k]; lastKind = t.dataset.k; listAnim = true; redrawPane(0); listAnim = false; lastKind = ''; }
    else if (a === 'kindsall') { hide = {}; listAnim = true; redrawPane(0); listAnim = false; }
    else if (a === 'ai') show(2);
    else if (a === 'back') show(0);
    else if (a === 'course') { ci = (ci + 1) % C.length; redrawPane(1); }
    else if (a === 'pick') { ci = +t.dataset.k; calcHome = false; redrawPane(1); var b = $$('.p-pane', dm)[1]; if (b) { b.scrollTop = 0; b.classList.remove('p-push'); b.offsetWidth; b.classList.add('p-push'); } }
    else if (a === 'home') { calcHome = true; redrawPane(1); var b2 = $$('.p-pane', dm)[1]; if (b2) { b2.classList.remove('p-push'); b2.offsetWidth; b2.classList.add('p-push'); } }
    else if (a === 'tgt') { ti = (ti + 1) % T.length; redrawPane(1); }
    else if (a === 'dark') { dark = !dark; auto = false; dm.classList.toggle('dark', dark); redrawPane(3); redrawPane(1); }
    else if (a === 'auto') { auto = !auto; if (auto) dark = matchMedia('(prefers-color-scheme: dark)').matches; dm.classList.toggle('dark', dark); redrawPane(3); }
    else if (a === 'pal') { pal = +t.dataset.k; redrawPane(3); redrawPane(0); redrawPane(1); }
  });
  dm.addEventListener('pointerdown', function () { touched = true; });

  // ---- press and drag the tab bar or a switcher: a clear glass lens follows the pointer ----
  // Characters under the lens are red, the rest grey; let go and it springs onto the nearest option.
  var drag = null, landUntil = 0;
  function chars(el) {
    if (el._ch) return el._ch;
    var out = [];
    (function walk(n) {
      [].slice.call(n.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          if (!c.nodeValue.trim()) return;
          var w = document.createElement('span'); w.className = 'lw';
          Array.from(c.nodeValue).forEach(function (ch) {
            if (/\s/.test(ch)) { w.appendChild(document.createTextNode(ch)); return; }
            var sp = document.createElement('span'); sp.className = 'lc'; sp.textContent = ch; w.appendChild(sp); out.push(sp);
          });
          c.parentNode.replaceChild(w, c);
        } else if (c.nodeType === 1 && c.tagName.toLowerCase() !== 'svg' && !c.classList.contains('rd')) walk(c);
      });
    })(el);
    el._ch = out; el._ic = [].slice.call(el.querySelectorAll('svg'));
    return out;
  }
  function paint(lens, items) {
    var r = lens.getBoundingClientRect();
    var inside = function (n) { var b = n.getBoundingClientRect(), m = b.left + b.width / 2; return m >= r.left && m <= r.right; };
    items.forEach(function (el) {
      chars(el).forEach(function (c) { c.classList.toggle('in', inside(c)); });
      el._ic.forEach(function (s) { s.classList.toggle('in', inside(s)); });
    });
  }
  // A switcher option springs from where the pill was to the new one (the pane is redrawn, so a lens is drawn on top).
  function landSeg(act, val, from) {
    if (reduce) return;
    var btn = dm.querySelector('[data-act="' + act + '"][data-' + (act === 'days' ? 'd' : 'v') + '="' + val + '"]'); if (!btn) return;
    var bar = btn.parentNode, lens = document.createElement('span');
    lens.className = 'p-lens landing';
    lens.style.cssText = 'top:' + btn.offsetTop + 'px;height:' + btn.offsetHeight + 'px;width:' + btn.offsetWidth + 'px;transform:translateX(' + btn.offsetLeft + 'px)';
    bar.appendChild(lens); bar.classList.add('landing');
    landUntil = Date.now() + 560;
    var end = function () { lens.remove(); bar.classList.remove('landing'); };
    try {
      lens.animate([{ transform: 'translateX(' + from.x + 'px)', width: from.w + 'px', scale: '1.1 1.28' }, { transform: 'translateX(' + btn.offsetLeft + 'px)', width: btn.offsetWidth + 'px', scale: '1' }],
        { duration: 520, easing: 'cubic-bezier(.34,1.45,.64,1)' }).onfinish = end;
    } catch (e) { end(); }
  }
  dm.addEventListener('pointerdown', function (e) {
    if (e.button !== 0 || drag) return;
    var bar = e.target.closest('.p-tabs, .p-seg'); if (!bar) return;
    var isTabs = bar.classList.contains('p-tabs');
    var items = $$(isTabs ? '.p-tab' : 'button', bar);
    if (!isTabs && !items.every(function (b) { return b.dataset.act; })) return;
    var on = items.filter(function (b) { return b.classList.contains('on'); })[0]; if (!on) return;
    var bx = bar.getBoundingClientRect().left + bar.clientLeft, px = e.clientX - bx, ox = on.offsetLeft, w = on.offsetWidth;
    var d = drag = { active: false, x: ox, grab: px >= ox && px <= ox + w ? px - ox : w / 2, best: null, pressed: e.target.closest('button') };
    var move = function (ev) {
      if (drag !== d) return;
      if (!d.active) {
        if (Math.abs(ev.clientX - e.clientX) < 5) return;
        d.active = true;
        try { bar.setPointerCapture(e.pointerId); } catch (er) {}
        bar.classList.add('dragging');
        if (isTabs) { d.lens = $('.p-ind', dm); d.lens.classList.remove('landing'); }
        else {
          d.lens = document.createElement('span'); d.lens.className = 'p-lens';
          d.lens.style.cssText = 'top:' + on.offsetTop + 'px;height:' + on.offsetHeight + 'px;width:' + w + 'px;transform:translateX(' + ox + 'px)';
          bar.appendChild(d.lens);
        }
        d.lens.style.transition = 'scale .32s cubic-bezier(.34,1.56,.64,1), background .2s';
        d.lens.offsetWidth; d.lens.classList.add('lift');
      }
      ev.preventDefault();
      var a = items[0], z = items[items.length - 1], min = a.offsetLeft, max = z.offsetLeft + z.offsetWidth - w;
      var x = ev.clientX - bx - d.grab;
      if (x < min) x = min - Math.sqrt(min - x) * 2; else if (x > max) x = max + Math.sqrt(x - max) * 2;
      d.x = x; d.lens.style.transform = 'translateX(' + x + 'px)'; d.lens.style.width = w + 'px';
      var c = x + w / 2, bd = 1e9;
      items.forEach(function (b) {
        var dist = Math.abs(b.offsetLeft + b.offsetWidth / 2 - c), k = Math.max(0, 1 - dist / (b.offsetWidth * .9));
        b.style.scale = String(1 + (isTabs ? .1 : .08) * k);
        if (dist < bd) { bd = dist; d.best = b; }
      });
      paint(d.lens, items);
    };
    var up = function () {
      bar.removeEventListener('pointermove', move); bar.removeEventListener('pointerup', up); bar.removeEventListener('pointercancel', up); bar.removeEventListener('lostpointercapture', up);
      if (drag !== d) return;
      drag = null;
      if (!d.active) {                       // a plain click on another option: it springs over after the click
        var p = d.pressed;
        if (!isTabs && p && p !== on && items.indexOf(p) >= 0) setTimeout(function () { landSeg(p.dataset.act, p.dataset.d || p.dataset.v, { x: ox, w: w }); }, 0);
        return;
      }
      bar.classList.remove('dragging');
      items.forEach(function (b) { b.style.scale = ''; (b._ch || []).forEach(function (c) { c.classList.remove('in'); }); (b._ic || []).forEach(function (s) { s.classList.remove('in'); }); });
      var eat = function (ev) { ev.stopPropagation(); ev.preventDefault(); };
      bar.addEventListener('click', eat, true);
      var target = d.best || on;
      setTimeout(function () {
        bar.removeEventListener('click', eat, true);
        if (isTabs) { touched = true; show(items.indexOf(target), true); }
        else {
          d.lens.remove();
          var act = target.dataset.act, val = target.dataset.d || target.dataset.v;
          if (target !== on) target.click(); else redrawPane(0);
          landSeg(act, val, { x: d.x, w: w });
        }
      }, 0);
    };
    bar.addEventListener('pointermove', move); bar.addEventListener('pointerup', up); bar.addEventListener('pointercancel', up); bar.addEventListener('lostpointercapture', up);
  });
  if ('ResizeObserver' in window) new ResizeObserver(function () { placeInd(true); }).observe(dm);
  setInterval(function () { if (cur === 0 && !drag && Date.now() > landUntil) redrawPane(0); }, 1000);
  if (!reduce) setInterval(function () { if (!touched && document.visibilityState === 'visible') { var n = (cur + 1) % 4; if (n === 1 && !calcHome) { calcHome = true; redrawPane(1); } show(n); } }, 5600);

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

  function renderDemo() { draw(); if (cur === 2) runAI(); }

  setLang(lang === 'zh' ? 'zh' : 'en');
  // For the page that embeds the demo: follow its language and light / dark mode.
  window.cpDemo = { setLang: function (l) { setLang(l === 'zh' ? 'zh' : 'en'); }, setDark: function (d) { dark = !!d; auto = false; draw(); } };
  if (EMBED) {
    var th = new URLSearchParams(location.search).get('theme'); if (th === 'dark') window.cpDemo.setDark(true);
    addEventListener('message', function (e) { var d = e.data || {}; if (d.cpDemo) { if (d.lang) window.cpDemo.setLang(d.lang); if (d.theme) window.cpDemo.setDark(d.theme === 'dark'); } });
  }
})();
