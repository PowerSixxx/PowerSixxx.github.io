// Canvas+ website: language switch, scroll effects and the live panel demo.
(function () {
  var root = document.documentElement, $ = function (s, el) { return (el || document).querySelector(s); }, $$ = function (s, el) { return [].slice.call((el || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  // the folder site.js is in (the site root), for pictures the demo loads on /zh/ too
  var SITE = (function () { try { return new URL('.', document.currentScript.src).href; } catch (e) { return '/'; } })();

  // ---- language ----
  var key = 'cp-lang', saved = null;
  try { saved = localStorage.getItem(key); } catch (e) {}
  var q = new URLSearchParams(location.search).get('lang');
  var EMBED = !!window.CP_EMBED;   // inside an <iframe> on another page (demo.html): only the panel
  var PAGE = root.getAttribute('data-page-lang');   // 'zh' on /zh/ — that page always opens in Chinese
  var lang = q || PAGE || saved || (/^zh/i.test(navigator.language || '') ? 'zh' : 'en');
  var TITLE = { en: 'Canvas+ (Canvas Plus) · A better Canvas for students', zh: 'Canvas+ (Canvas Plus) · Canvas 插件：截止日期、期末成绩计算器、GPA 和 AI 学习助手' };
  // the switch button also moves the address between / and /zh/, so a refresh or a shared link keeps the language
  var fixed = false;
  function moveUrl(l) {
    if (EMBED || !/^https?:$/.test(location.protocol) || !$('#lang')) return;
    try {
      var en = location.pathname.replace(/(zh\/)*(index\.html)?$/, '');   // the site root, worked out from where we are now
      var u = new URL(location.href); u.pathname = l === 'zh' ? en + 'zh/' : en; u.searchParams.delete('lang');
      // Relative links and images (shot-x.png, ../privacy.html, film.mp4…) would be read against the NEW address
      // once it changes, and point at files that don't exist. Pin them to full URLs first — once is enough.
      if (!fixed) {
        fixed = true;
        $$('[src],[href],[poster],[data-src],[data-poster]').forEach(function (el) {
          ['src', 'href', 'poster', 'data-src', 'data-poster'].forEach(function (a) {
            var v = el.getAttribute(a);
            if (v && !/^([a-z][a-z0-9+.-]*:|#|\/\/)/i.test(v) && el.tagName !== 'LINK') el.setAttribute(a, new URL(v, location.href).href);
          });
        });
      }
      history.replaceState(null, '', u.pathname + u.search + u.hash); document.title = TITLE[l];
    } catch (e) {}
  }
  var zh = function () { return root.getAttribute('data-lang') === 'zh'; };
  function setLang(l) { root.setAttribute('data-lang', l); root.lang = l === 'zh' ? 'zh-CN' : 'en'; if (!EMBED) try { localStorage.setItem(key, l); } catch (e) {} renderDemo(); }
  if ($('#lang')) $('#lang').addEventListener('click', function () { var l = zh() ? 'en' : 'zh'; setLang(l); moveUrl(l); });

  // ---- nav border + reveal on scroll + tile glow ----
  var nav = $('#nav');
  if (nav) addEventListener('scroll', function () { nav.classList.toggle('scrolled', scrollY > 8); }, { passive: true });
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
    $$('.rv').forEach(function (el) { io.observe(el); });
  } else $$('.rv').forEach(function (el) { el.classList.add('in'); });
  // Feature cards: the glow follows the cursor, and the card under it tilts toward it a little (at most 4°), then eases back.
  // The cursor is tracked on the grid (which never moves) against each card's untilted box, so a tilted edge
  // sliding out from under the cursor can't make the card flicker.
  var canTilt = !reduce && window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches, MAX = 4;
  $$('.bento').forEach(function (grid) {
    var tiles = $$('.tile', grid), cur = null, raf = 0;
    function rest(el) {
      el.style.transition = 'transform .7s cubic-bezier(.2,.8,.2,1), box-shadow .4s, border-color .3s';
      el.style.transform = ''; el.classList.remove('tilt');
      setTimeout(function () { if (el !== cur) el.style.transition = ''; }, 750);
    }
    grid.addEventListener('pointermove', function (e) {
      var g = grid.getBoundingClientRect(), px = e.clientX - g.left, py = e.clientY - g.top, hit = null;
      tiles.forEach(function (t) { if (px >= t.offsetLeft && px <= t.offsetLeft + t.offsetWidth && py >= t.offsetTop && py <= t.offsetTop + t.offsetHeight) hit = t; });
      if (cur && cur !== hit) rest(cur);
      cur = hit;
      if (!hit) return;
      var x = px - hit.offsetLeft, y = py - hit.offsetTop;
      hit.style.setProperty('--mx', x + 'px'); hit.style.setProperty('--my', y + 'px');
      if (!canTilt || e.pointerType !== 'mouse') return;
      var ry = (x / hit.offsetWidth - .5) * 2 * MAX, rx = -(y / hit.offsetHeight - .5) * 2 * MAX;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () {
        if (cur !== hit) return;
        hit.classList.add('tilt');
        hit.style.transition = 'transform .15s ease-out, box-shadow .4s, border-color .3s';
        hit.style.transform = 'perspective(1000px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateY(-3px)';
      });
    });
    grid.addEventListener('pointerleave', function () { cancelAnimationFrame(raf); if (cur) rest(cur); cur = null; });
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
    { t: 'Problem Set 5', c: 'STAT 3470', k: 'assignment', p: 40, h: 290, w: 12 },
    { t: 'Midterm exam', c: 'CSE 2431', k: 'event', h: 380, w: 25 },
    { t: 'Project 2: Shell scheduler', c: 'CSE 2431', k: 'assignment', p: 50, h: 430, w: 8 },
    { t: 'Quiz 4 — Network layer', c: 'CSE 3461', k: 'quiz', p: 10, h: 545, w: 2.5 }
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
  // ---- Weekly load: the next 4 weeks as heat cells above the list (as in the extension since 1.4) ----
  // Each week: every item counts 1, plus a third of its share of the final grade, plus 4 for an exam. Monday–Sunday weeks.
  var heatSel = null, heatFold = false;
  var EXAM_RE = /\b(exams?|midterms?|tests?)\b|考试|期中|期末考/i;
  function heatWeeks() {
    var d = new Date(start), back = (d.getDay() + 6) % 7;
    return [0, 1, 2, 3].map(function (i) { return { i: i, s: new Date(d.getFullYear(), d.getMonth(), d.getDate() - back + 7 * i).getTime(), e: new Date(d.getFullYear(), d.getMonth(), d.getDate() - back + 7 * (i + 1)).getTime(), items: [], score: 0, exams: 0 }; });
  }
  function heatStrip() {
    var weeks = heatWeeks(), now = Date.now() - start;
    DL.forEach(function (x, i) {
      var due = start + x.h * 3600e3, exam = EXAM_RE.test(x.t);
      if (done[i] || hide[x.k] || x.h * 3600e3 < now || (x.k === 'event' && !exam)) return;
      var w = weeks.filter(function (w) { return due >= w.s && due < w.e; })[0]; if (!w) return;
      var sc = 1 + (x.w || 0) / 3 + (exam ? 4 : 0);
      w.items.push({ x: x, due: due, exam: exam, sc: sc }); w.score += sc; if (exam) w.exams++;
    });
    var lv = function (sc) { return sc <= 0 ? 0 : sc < 3 ? 1 : sc < 7 ? 2 : sc < 12 ? 3 : 4; };
    var LV = [['Free', '空闲'], ['Light', '轻松'], ['Moderate', '适中'], ['Busy', '较忙'], ['Crunch', '爆炸']];
    var name = function (w) { return w.i === 0 ? L('This week', '本周') : w.i === 1 ? L('Next week', '下周')
      : zh() ? (new Date(w.s).getMonth() + 1) + '月' + new Date(w.s).getDate() + '日起' : 'From ' + new Date(w.s).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); };
    weeks.forEach(function (w) { w.lv = lv(w.score); w.items.sort(function (a, b) { return b.sc - a.sc || a.due - b.due; }); });
    var head = '<div class="p-hh"><button class="p-htog" data-act="heatfold" aria-expanded="' + !heatFold + '"><b>' + L('Workload · next 4 weeks', '未来 4 周负荷') + '</b>' + ic('down') + '</button>' +
      (heatFold ? '<span class="p-hmini">' + weeks.map(function (w) { return '<i class="hl' + w.lv + '"></i>'; }).join('') + '</span>'
        : '<span class="p-hleg">' + L('Light', '轻') + [1, 2, 3, 4].map(function (l) { return '<i class="hl' + l + '"></i>'; }).join('') + L('Heavy', '重') + '</span>') + '</div>';
    if (heatFold) return '<div class="p-heat folded">' + head + '</div>';
    var exl = function (n) { return n === 1 ? L('1 exam', '1 场考试') : L(n + ' exams', n + ' 场考试'); };
    var cells = weeks.map(function (w) {
      return '<button class="p-hc hl' + w.lv + (heatSel === w.i ? ' on' : '') + '" data-act="heat" data-w="' + w.i + '"><span class="wk">' + name(w) + '</span><b>' + w.items.length + '</b>' +
        '<span class="lv">' + (w.exams ? exl(w.exams) : L(LV[w.lv][0], LV[w.lv][1])) + '</span><i></i></button>';
    }).join('');
    var det = '', sw = heatSel != null ? weeks[heatSel] : null;
    if (sw) det = '<div class="p-hd"><p>' + name(sw) + ' · ' + L(sw.items.length + ' to do', sw.items.length + ' 项待办') + '</p>' + (sw.items.length ? sw.items.map(function (it) {
        var d = new Date(it.due), day = zh() ? '周' + '日一二三四五六'[d.getDay()] + ' ' + (d.getMonth() + 1) + '/' + d.getDate() : d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
        return '<div class="p-hi"><span class="p-dot" style="background:' + col(it.x.c) + '"></span><span class="m"><b>' + it.x.t + '</b><small>' + it.x.c + ' · ' + day + '</small></span>' +
          (it.exam ? '<span class="p-wt hi">' + L('Exam · ' + it.x.w + '%', '考试 · ' + it.x.w + '%') + '</span>' : it.x.w ? '<span class="p-wt' + (it.x.w >= 10 ? ' hi' : it.x.w >= 5 ? ' mid' : '') + '">' + L(it.x.w + '%', '占 ' + it.x.w + '%') + '</span>' : '') + '</div>';
      }).join('') : '<p class="e">' + L('Nothing due this week.', '这周没有要交的东西。') + '</p>') + '</div>';
    return '<div class="p-heat">' + head + '<div class="p-hrow">' + cells + '</div>' + det + '</div>';
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
      (view === 'cal' ? cal : heatStrip() + (rows ? '<div class="p-list' + (listAnim ? ' p-fade' : '') + '">' + rows + '</div>'
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
  // Style themes: the five shown first in the extension, then three of the rest (art + page pattern made by the extension).
  var FONTS = { rounded: 'ui-rounded, "SF Pro Rounded", "Hiragino Maru Gothic ProN", "Arial Rounded MT Bold", "PingFang SC", system-ui, sans-serif',
    serif: '"Iowan Old Style", Palatino, "Palatino Linotype", Georgia, "Songti SC", "Noto Serif SC", serif', hand: 'Noteworthy, "Segoe Print", "Bradley Hand", "Kaiti SC", STKaiti, KaiTi, cursive',
    mono: '"SF Mono", ui-monospace, Menlo, Consolas, "PingFang SC", monospace', futura: 'Futura, "Century Gothic", "Avenir Next", "PingFang SC", sans-serif',
    avenir: '"Avenir Next", Avenir, "Segoe UI", "PingFang SC", sans-serif' };
  var SKINS = [
    { id: 'city', n: ['City Lights', '繁华都市'], prim: '#4a5bd4', page: '#f1f2f8', f: 'futura' }, { id: 'ocean', n: ['Open Sea', '大海'], prim: '#0a7bbf', page: '#edf6fa', f: 'avenir' },
    { id: 'forest', n: ['Forest', '森林'], prim: '#2f7a4a', page: '#f2f6ef', f: 'serif' }, { id: 'paws', n: ['Cat Paws', '猫爪'], prim: '#a26b44', page: '#f8f3ec', f: 'rounded' },
    { id: 'burger', n: ['Burger & Fries', '薯条汉堡'], prim: '#d9481f', page: '#fff7ea', f: 'rounded' },
    { id: 'rain', n: ['Rainy Day', '雨天'], prim: '#3b82c4', page: '#eff3f7', f: 'avenir' }, { id: 'cafe', n: ['Café', '咖啡馆'], prim: '#8a5a3c', page: '#f8f1e9', f: 'serif' },
    { id: 'sea', n: ['Sea Salt', '海盐'], prim: '#0b7f9a', page: '#eef7fb', f: 'rounded' }
  ];
  var skin = '', font = '', moreSkins = false;
  var skinOf = function (id) { return SKINS.filter(function (x) { return x.id === id; })[0] || null; };
  // A theme gives the panel its page colour, pattern and accent (as in the extension); a font choice changes the text.
  function applySkin() {
    var k = skinOf(skin), st = dm.style;
    dm.classList.toggle('skin', !!k);
    if (k) { st.setProperty('--p-acc', k.prim); st.setProperty('--p-page', k.page); st.setProperty('--p-pat', 'url("' + SITE + 'img/themes/pat-' + k.id + '.svg")'); }
    else ['--p-acc', '--p-page', '--p-pat'].forEach(function (v) { st.removeProperty(v); });
    var f = font ? FONTS[font] : k ? FONTS[k.f] : '';
    st.fontFamily = f || '';
  }
  function paneLook() {
    var row = function (icn, a, b, right, act) { return '<div class="p-set"' + (act ? ' data-act="' + act + '"' : '') + '><span class="p-ico">' + ic(icn) + '</span><div class="tx"><b>' + a + '</b><small>' + b + '</small></div>' + right + '</div>'; };
    var chev = function (t) { return '<span class="chev">' + (t || '') + ic('right') + '</span>'; };
    var mode = auto ? 'auto' : dark ? 'dark' : 'light';
    var tc = function (m, en, z) { return '<button class="p-tc' + (mode === m ? ' on' : '') + '" data-act="mode" data-m="' + m + '"><i class="' + m + '"><u></u><u></u></i>' + L(en, z) + '</button>'; };
    var sk = function (k) { var on = skin === (k ? k.id : '');
      return '<button class="p-sk' + (on ? ' on' : '') + '" data-act="skin" data-k="' + (k ? k.id : '') + '"><i' + (k ? ' style="background-image:url(&quot;' + SITE + 'img/themes/art-' + k.id + '.webp&quot;)"' : '') + '>' +
        (on ? '<b>' + ic('check', 3) + L('On', '使用中') + '</b>' : '') + '</i><span' + (k ? ' style="font-family:' + FONTS[k.f].replace(/"/g, '&quot;') + '"' : '') + '>' + (k ? L(k.n[0], k.n[1]) : L('Classic', '经典')) + '</span></button>'; };
    var fn = function (k, en, z) { var stack = k ? FONTS[k] : (skinOf(skin) ? FONTS[skinOf(skin).f] : '');
      return '<button class="p-fn' + (font === k ? ' on' : '') + '" data-act="font" data-k="' + k + '"><span' + (stack ? ' style="font-family:' + stack.replace(/"/g, '&quot;') + '"' : '') + '>Aa</span><small>' + L(en, z) + '</small></button>'; };
    return '<div class="p-sec">' + L('Look', '外观设置') + '</div><div class="p-tcs">' + tc('light', 'Light', '浅色模式') + tc('dark', 'Dark', '暗色模式') + tc('auto', 'System', '跟随系统') + '</div>' +
      '<div class="p-sec">' + L('Themes', '风格主题') + '</div><p class="p-hint">' + L('Course-card art, page background, colours and a font, all in one tap.', '一键换上课程卡片配图、页面背景、配色和字体。') + '</p>' +
      '<div class="p-skins">' + sk(null) + SKINS.slice(0, moreSkins ? 8 : 5).map(sk).join('') + '</div>' +
      (moreSkins ? '<p class="p-hint p-hint2">' + L('…and 15 more in the extension.', '……插件里还有 15 套。') + '</p>' : '') +
      '<button class="p-more" data-act="more">' + (moreSkins ? L('Show fewer', '收起') : L('Show all themes (+18)', '展开更多主题（+18）')) + ic(moreSkins ? 'up' : 'down') + '</button>' +
      '<div class="p-sec">' + L('Font', '字体') + '</div><div class="p-fonts">' + fn('', 'Theme', '跟随主题') + fn('rounded', 'Rounded', '圆体') + fn('serif', 'Serif', '衬线') + fn('hand', 'Handwritten', '手写') + fn('mono', 'Mono', '等宽') + '</div>' +
      '<div class="p-sec">' + L('Course colours', '课程配色') + '</div><div class="p-group"><div class="p-pals">' + PALS.map(function (p, k) {
        return '<button class="p-pal' + (k === pal ? ' on' : '') + '" data-act="pal" data-k="' + k + '">' + p.c.map(function (c) { return '<i style="background:' + c + '"></i>'; }).join('') + ' ' + L(p.n[0], p.n[1]) + '</button>'; }).join('') + '</div></div>' +
      '<div class="p-sec">' + L('Menus', '菜单') + '</div><div class="p-group">' +
      row('img', L('Background picture', '页面背景'), L('Your own photo behind Canvas', '用自己的照片当 Canvas 背景'), chev()) +
      row('menu', L('Course menu', '课程菜单'), L('Hide Discussions, People, Chat…', '隐藏 Discussions、People、Chat 等'), chev(L('3 hidden', '已隐藏 3 项'))) +
      row('side', L('Canvas’s left menu', '最左侧导航栏'), L('Hide Help, History, Groups…', '隐藏 Help、History、Groups 等'), chev(L('2 hidden', '已隐藏 2 项'))) + '</div>';
  }

  // ---- shell: header, tabs, panes ----
  var TABS = [['Deadlines', '作业倒计时'], ['Final calc', '期末计算器'], ['AI Course', 'AI 课程'], ['Appearance', '界面美化']];
  function draw() {
    dm.classList.toggle('dark', dark); applySkin();
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
    else if (a === 'heat') { var w = +t.dataset.w; heatSel = heatSel === w ? null : w; redrawPane(0); }
    else if (a === 'heatfold') { heatFold = !heatFold; heatSel = null; redrawPane(0); }
    else if (a === 'ai') show(2);
    else if (a === 'back') show(0);
    else if (a === 'course') { ci = (ci + 1) % C.length; redrawPane(1); }
    else if (a === 'pick') { ci = +t.dataset.k; calcHome = false; redrawPane(1); var b = $$('.p-pane', dm)[1]; if (b) { b.scrollTop = 0; b.classList.remove('p-push'); b.offsetWidth; b.classList.add('p-push'); } }
    else if (a === 'home') { calcHome = true; redrawPane(1); var b2 = $$('.p-pane', dm)[1]; if (b2) { b2.classList.remove('p-push'); b2.offsetWidth; b2.classList.add('p-push'); } }
    else if (a === 'tgt') { ti = (ti + 1) % T.length; redrawPane(1); }
    else if (a === 'dark') { dark = !dark; auto = false; dm.classList.toggle('dark', dark); redrawPane(3); redrawPane(1); }
    else if (a === 'auto') { auto = !auto; if (auto) dark = matchMedia('(prefers-color-scheme: dark)').matches; dm.classList.toggle('dark', dark); redrawPane(3); }
    else if (a === 'pal') { pal = +t.dataset.k; redrawPane(3); redrawPane(0); redrawPane(1); }
    // themes are light looks: a theme turns dark mode off, dark mode goes back to Classic (as in the extension)
    else if (a === 'mode') { var m = t.dataset.m; auto = m === 'auto'; dark = m === 'dark' || (auto && matchMedia('(prefers-color-scheme: dark)').matches); if (dark) skin = ''; dm.classList.toggle('dark', dark); applySkin(); redrawPane(3); redrawPane(1); }
    else if (a === 'skin') { skin = t.dataset.k; if (skin) { dark = false; auto = false; dm.classList.remove('dark'); } applySkin(); redrawPane(3); redrawPane(1); }
    else if (a === 'more') { moreSkins = !moreSkins; redrawPane(3); }
    else if (a === 'font') { font = t.dataset.k; applySkin(); redrawPane(3); }
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
      function () { calcHome = true; show(1); redrawPane(1); point('.p-cg', L('Your <b>GPA</b> and every course — <b>tap one</b> to see where you stand', '<b>GPA</b> 和每门课一目了然，<b>点一门课</b>看排名')); },
      function () { calcHome = false; redrawPane(1); point('.p-tgt', L('Change the <b>target grade</b> — see what you need on the final', '<b>换个目标成绩</b>，看看期末要考多少')); },
      function () { show(0); showKinds = true; cardAnim = true; redrawPane(0); cardAnim = false; point('.p-kchip', L('<b>Filter</b> by type — hide events, quizzes, anything', '按<b>类型筛选</b>：隐藏日程、测验等')); },
      function () { show(2); point('.p-badge', L('A step-by-step <b>AI guide</b> for the assignment', 'AI 把作业<b>一步步拆解</b>')); },
      function () { show(3); point('.p-skins', L('Pick a <b>theme</b>: the whole look changes', '选一个<b>风格主题</b>，整个风格跟着变')); },
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
      // no shrinking: cards keep the same width so their edges line up; the ones underneath only dim
      if (!reduce) { c.style.transform = ''; c.style.filter = depth ? 'brightness(' + (1 - Math.min(depth, 2) * .2).toFixed(3) + ')' : ''; }
      if (r.top <= stickTop(c) + h * .5) act = i;
    });
    if (act !== sActive) { sActive = act; sb.forEach(function (b, k) { b.classList.toggle('on', k === act); }); }
  }
  var sTick = false;
  addEventListener('scroll', function () { if (!sTick) { sTick = true; requestAnimationFrame(function () { sTick = false; onStack(); }); } }, { passive: true });
  addEventListener('resize', onStack);
  // Clicking a name scrolls to where that card sits on top.
  sb.forEach(function (b, k) { b.addEventListener('click', function () {
    var c = cards[k], step = c.offsetHeight + (parseFloat(getComputedStyle(stack).rowGap) || 0);
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
  window.cpDemo = { setLang: function (l) { setLang(l === 'zh' ? 'zh' : 'en'); }, setDark: function (d) { dark = !!d; auto = false; if (dark) skin = ''; draw(); } };
  if (EMBED) {
    var th = new URLSearchParams(location.search).get('theme'); if (th === 'dark') window.cpDemo.setDark(true);
    addEventListener('message', function (e) { var d = e.data || {}; if (d.cpDemo) { if (d.lang) window.cpDemo.setLang(d.lang); if (d.theme) window.cpDemo.setDark(d.theme === 'dark'); } });
  }
})();

// ---- theme: follows the system until the visitor picks light or dark (the choice is kept) ----
(function () {
  var root = document.documentElement, btn = document.getElementById('theme');
  var mq = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
  function sys() { return mq && mq.matches ? 'dark' : 'light'; }
  function get() { try { var t = localStorage.getItem('cp-theme'); return t === 'light' || t === 'dark' ? t : 'auto'; } catch (e) { return 'auto'; } }
  var LABEL = { auto: ['Theme: system', '主题：跟随系统'], light: ['Theme: light', '主题：浅色'], dark: ['Theme: dark', '主题：深色'] };
  function apply(mode) {
    if (mode === 'auto') { root.removeAttribute('data-theme'); root.style.colorScheme = ''; }
    else { root.setAttribute('data-theme', mode); root.style.colorScheme = mode; }
    var shown = mode === 'auto' ? sys() : mode;
    [].forEach.call(document.querySelectorAll('meta[name="theme-color"]'), function (m) { m.setAttribute('content', shown === 'dark' ? '#000000' : '#ffffff'); });
    if (btn) {
      btn.setAttribute('data-mode', mode);
      var l = LABEL[mode][root.getAttribute('data-lang') === 'zh' ? 1 : 0];
      btn.title = l; btn.setAttribute('aria-label', l);
    }
  }
  apply(get());
  if (mq && mq.addEventListener) mq.addEventListener('change', function () { if (get() === 'auto') apply('auto'); });
  if (btn) btn.addEventListener('click', function () {
    // system → the opposite of what you see now → the same as the system → back to system,
    // so the first click always changes the page
    var cur = get(), s = sys(), next = cur === 'auto' ? (s === 'dark' ? 'light' : 'dark') : (cur !== s ? s : 'auto');
    try { if (next === 'auto') localStorage.removeItem('cp-theme'); else localStorage.setItem('cp-theme', next); } catch (e) {}
    apply(next);
  });
  // keep the tooltip in the page language
  new MutationObserver(function () { apply(get()); }).observe(root, { attributes: true, attributeFilter: ['data-lang'] });
})();



// ---- hero stickers: drag them around; each one does a little something when tapped ----
(function () {
  var layer = document.querySelector('.stk-layer');
  if (!layer) return;
  var root = document.documentElement, reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches, top = 10;
  var zh = function () { return root.getAttribute('data-lang') === 'zh'; };
  var B = function () { return window.cpBuddy; };
  [].forEach.call(layer.querySelectorAll('.stk'), function (el) {
    var sx = 0, sy = 0, ox = 0, oy = 0, moved = false, id = null;
    el.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      id = e.pointerId; moved = false; sx = e.clientX; sy = e.clientY;
      ox = parseFloat(el.style.getPropertyValue('--dx')) || 0; oy = parseFloat(el.style.getPropertyValue('--dy')) || 0;
      el.setPointerCapture(id);
    });
    el.addEventListener('pointermove', function (e) {
      if (e.pointerId !== id) return;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      if (!moved && Math.abs(dx) + Math.abs(dy) < 5) return;
      if (!moved) { moved = true; el.classList.add('drag'); el.style.zIndex = ++top; }
      el.style.setProperty('--dx', ox + dx + 'px'); el.style.setProperty('--dy', oy + dy + 'px');
    });
    function end(e) { if (e.pointerId !== id) return; id = null; el.classList.remove('drag'); if (!moved) tap(el, e); }
    el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
  });

  function tap(el, e) {
    if (el.classList.contains('stk-sky')) {
      // only light ↔ dark here (no "follow the system" step): press the site's theme button until the page shows the other one
      var t = document.getElementById('theme'), want = shownDark() ? 'light' : 'dark';
      for (var k = 0; t && k < 3 && root.getAttribute('data-theme') !== want; k++) t.click();
      return;
    }
    if (el.classList.contains('stk-search')) { el.classList.add('press'); setTimeout(function () { el.classList.remove('press'); }, 150); if (window.cpCmdk) window.cpCmdk.open(); else nextQuery(); return; }
    if (el.classList.contains('stk-ntf')) { nextNote(); return; }
    if (el.classList.contains('stk-todo')) {
      var hit2 = document.elementFromPoint(e.clientX, e.clientY), row = hit2 && hit2.closest && hit2.closest('.td-i');
      if (!row) return;
      row.classList.toggle('done');
      var rows = el.querySelectorAll('.td-i'), n = el.querySelectorAll('.td-i.done').length;
      el.querySelector('.td-n').textContent = n + '/' + rows.length;
      el.classList.toggle('alldone', n === rows.length);
      el.classList.remove('synced'); void el.offsetWidth; el.classList.add('synced');
      if (B()) { if (n === rows.length) B().celebrate(); else if (row.classList.contains('done')) B().say(zh() ? '又搞定一个！' : 'one down!', 1300); }
      return;
    }
    if (el.classList.contains('stk-calc')) {
      var hit = document.elementFromPoint(e.clientX, e.clientY), b = hit && hit.closest && hit.closest('.stk-tg button');
      var btns = el.querySelectorAll('.stk-tg button'), cur = [].indexOf.call(btns, el.querySelector('.stk-tg .on'));
      var next = b || btns[(cur + 1) % btns.length], ni = [].indexOf.call(btns, next);
      [].forEach.call(btns, function (x) { x.classList.toggle('on', x === next); });
      el.querySelector('.stk-tg').style.setProperty('--i', ni);
      var v = parseFloat(next.dataset.v);
      count(document.getElementById('stkNeed'), v);
      document.getElementById('stkRing').style.strokeDashoffset = (163.4 * (1 - v / 100)).toFixed(1);
    }
  }
  function count(node, to) {
    var from = parseFloat(node.textContent) || to, t0 = performance.now(), d = reduce ? 1 : 450;
    (function f(now) { var k = Math.min(1, (now - t0) / d), v = from + (to - from) * (1 - Math.pow(1 - k, 3));
      node.firstChild.nodeValue = v.toFixed(1); if (k < 1) requestAnimationFrame(f); })(t0);
  }

  // notifications: tap for the next one
  var NOTES = [ [['Grade posted', '出分了'], 'Project 2', 'CSE 2231 · 47 / 50', ['94%', '94%'], 'ok', ['new grade! let’s see', '出分啦！看看～']],
                [['Due date moved', '截止时间变了'], 'HW 6', ['MATH 2568 · now Friday', 'MATH 2568 · 改到周五'], ['+2d', '+2 天'], 'warn', ['more time, nice', '多了两天，舒服']],
                [['Announcement', '新公告'], 'Sprint 3', ['CSE 3902 · demo moved', 'CSE 3902 · 演示时间调整'], ['New', '新'], 'info', ['let’s read it', '去看看写了啥']],
                [['Grade posted', '出分了'], 'Quiz 3', 'CSE 3461 · 9 / 10', ['90%', '90%'], 'ok', ['nice one!', '考得不错！']] ];
  var ni = 0, nt = document.getElementById('stkNt'), ntfEl = layer.querySelector('.stk-ntf');
  function L(x) { return Array.isArray(x) ? x[zh() ? 1 : 0] : x; }
  function nextNote() {
    if (!nt) return; ni = (ni + 1) % NOTES.length; var n = NOTES[ni];
    nt.classList.remove('in'); nt.classList.add('out');
    setTimeout(function () {
      document.getElementById('ntT').textContent = L(n[0]) + ' · ' + n[1];
      document.getElementById('ntS').textContent = L(n[2]);
      var g = document.getElementById('ntG'); g.textContent = L(n[3]); g.className = 'nt-chip ' + n[4];
      nt.classList.remove('out'); void nt.offsetWidth; nt.classList.add('in');
      if (B()) { B().joy(); B().say(L(n[5]), 1500); }
    }, reduce ? 0 : 280);
  }

  // day / night window follows the site's theme
  var sky = layer.querySelector('.stk-sky'), mq = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
  function sysdark() { if (sky) sky.classList.toggle('sysdark', !!(mq && mq.matches) && !root.getAttribute('data-theme')); }
  function shownDark() { var d = root.getAttribute('data-theme'); return d ? d === 'dark' : !!(mq && mq.matches); }
  sysdark(); if (mq && mq.addEventListener) mq.addEventListener('change', sysdark);
  new MutationObserver(sysdark).observe(root, { attributes: true, attributeFilter: ['data-theme'] });

  // mini search bar: types a query, shows the hit, then the next one
  var Q = [ ['midterm 2', '期中考试', '#0f7b5f', 'Midterm 2', 'Midterm 2', 'Thu 7 PM', '周四 19:00'],
            ['homework #30', 'homework #30', '#bb0000', 'Homework #30', 'Homework #30', 'due 11:59 PM', '23:59 截止'],
            ['office hours', 'office hours', '#6d4fc2', 'Office hours', 'Office hours', 'Fri 2 PM', '周五 14:00'],
            ['final grade', '期末成绩', '#d97706', 'Need 86.4% on the final', '期末至少要考 86.4%', 'CSE 2231', 'CSE 2231'] ];
  var qEl = document.getElementById('stkQ'), rEl = document.getElementById('stkR'), qi = -1, qT = 0, auto = 0;
  function nextQuery() {
    if (!qEl) return;
    clearTimeout(qT); clearTimeout(auto); qi = (qi + 1) % Q.length; rEl.classList.remove('on');
    var q = Q[qi], text = zh() ? q[1] : q[0], i = 0;
    (function type() { qEl.textContent = text.slice(0, i); if (i++ < text.length) { qT = setTimeout(type, reduce ? 0 : 55 + Math.random() * 50); return; }
      rEl.innerHTML = '<em style="background:' + q[2] + '"></em><b></b><small></small>';
      rEl.querySelector('b').textContent = zh() ? q[4] : q[3]; rEl.querySelector('small').textContent = zh() ? q[6] : q[5];
      rEl.classList.add('on'); auto = setTimeout(nextQuery, 3600); })();
  }
  nextQuery();
})();

// ---- the page buddy: the Canvas+ mascot in the corner, with something to say about each part of the page ----
(function () {
  var M = document.getElementById('buddy');
  if (!M || !getComputedStyle(M).display || getComputedStyle(M).display === 'none') return;
  var root = document.documentElement, reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var zh = function () { return root.getAttribute('data-lang') === 'zh'; };
  var T = function (en, z) { return zh() ? z : en; };
  var bubble = M.querySelector('.stk-hi'), fx = M.querySelector('.m-fx'), hitEl = M.querySelector('.bd-hit'), pupils = M.querySelectorAll('.m-pu, .m-gl');
  var sayT = 0, busyUntil = 0, asleep = false, idleT = 0, zzzT = 0, taps = [], li = 0, petN = 0, petDir = 0, petT = 0, lastX = 0;
  function mood(c, ms) { M.classList.remove(c); void M.offsetWidth; M.classList.add(c); setTimeout(function () { M.classList.remove(c); }, ms); }
  function say(text, ms, force) {
    var now = Date.now(); if (!force && now < busyUntil) return;
    busyUntil = now + (ms || 2200); bubble.textContent = text; M.classList.add('talk');
    clearTimeout(sayT); sayT = setTimeout(function () { M.classList.remove('talk'); }, ms || 2200);
  }
  window.cpBuddy = { say: function (t, ms) { wake(); say(t, ms, true); }, joy: function () { wake(); mood('joy', 1000); }, celebrate: celebrate };
  function spawn(cls, p) { if (reduce) return; var b = document.createElement('b'); if (cls) b.className = cls; if (p.t) b.textContent = p.t;
    Object.keys(p).forEach(function (k) { if (k !== 't') b.style.setProperty('--' + k, p[k]); }); fx.appendChild(b); setTimeout(function () { b.remove(); }, 2100); }
  function hearts(n) { for (var i = 0; i < n; i++) setTimeout(function () { spawn('', { t: '♥', x: 20 + Math.random() * 50 + 'px', y: '14px', dx: (Math.random() * 40 - 20) + 'px', rot: (Math.random() * 40 - 20) + 'deg', c: '#ff4d6d', fs: (13 + Math.random() * 8) + 'px' }); }, i * 120); }
  function celebrate() {
    wake(); mood('joy', 1400); say(T('all done! nice!', '全部搞定，太棒了！'), 2400, true);
    var C = ['#e01e2b', '#ffc93c', '#3ddc84', '#5aa9ff', '#a66bff', '#ff8a5c'];
    for (var i = 0; i < 24; i++) { var a = -Math.PI / 2 + (Math.random() - .5) * 2.6, r = 50 + Math.random() * 80;
      spawn('conf', { x: '44px', y: '30px', dx: Math.cos(a) * r + 'px', dy: Math.sin(a) * r + 'px', rot: (Math.random() * 720 - 360) + 'deg', c: C[i % C.length] }); }
  }

  // hello, depending on the time of day
  setTimeout(function () {
    M.classList.add('on');
    var h = new Date().getHours();
    setTimeout(function () { mood('joy', 900); say(h >= 23 || h < 5 ? T('studying this late? don’t forget to sleep', '这么晚还在学习？记得早点睡')
      : h < 12 ? T('good morning! I’m the Canvas+ buddy', '早上好！我是 Canvas+ 小苹果') : T('hi! I’m the Canvas+ buddy', '嗨！我是 Canvas+ 小苹果'), 2800, true); }, 500);
  }, root.classList.contains('intro-on') ? 2600 : 600);

  // something to say about each section, once
  var LINES = {
    features: ['all of this is free, by the way', '这些功能都是免费的哦'],
    ai: ['I only read your own course materials', '我只看你自己的课程资料'],
    mac: ['I live in your menu bar on Mac too!', '我在 Mac 菜单栏里也有哦！'],
    compare: ['no uploading, no copy-pasting', '不用上传，也不用复制粘贴'],
    reviews: ['they said nice things about me…', '大家都在夸我…有点害羞'],
    pricing: ['the free plan goes a long way', '免费版就够用很久啦'],
    privacy: ['your grades stay in your browser', '你的成绩不会离开浏览器'],
    faq: ['questions? the answers are right here', '有问题？答案都在这儿']
  };
  if ('IntersectionObserver' in window) {
    var seen = {};
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) {
      var id = e.target.id; if (!e.isIntersecting || seen[id] || asleep) return; seen[id] = 1;
      mood(id === 'reviews' ? 'pet' : 'joy', 900); say(T(LINES[id][0], LINES[id][1]), 2600);
    }); }, { threshold: .35 });
    Object.keys(LINES).forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
    var foot = document.querySelector('footer');
    if (foot) new IntersectionObserver(function (es) { if (es[0].isIntersecting) { mood('joy', 900); say(T('the end! give Canvas+ a try?', '到底啦！要不要装一个试试？'), 2800); } }, { threshold: .3 }).observe(foot);
  }

  // leans with the scroll, holds on when you scroll really fast
  var lastY = scrollY, lastT = performance.now(), leanT = 0, fastN = 0;
  addEventListener('scroll', function () {
    var now = performance.now(), v = (scrollY - lastY) / Math.max(16, now - lastT); lastY = scrollY; lastT = now;
    M.style.setProperty('--lean', Math.max(-12, Math.min(12, -v * 6)).toFixed(1) + 'deg');
    clearTimeout(leanT); leanT = setTimeout(function () { M.style.setProperty('--lean', '0deg'); }, 160);
    if (Math.abs(v) > 6) { if (++fastN > 6) { fastN = 0; mood('wow', 900); say(T('whoa, slow down!', '慢点慢点～'), 1500); } } else fastN = 0;
    poke();
  }, { passive: true });

  // gets excited when you're about to add Canvas+
  var hypeT = 0;
  document.addEventListener('pointerover', function (e) {
    var a = e.target.closest && e.target.closest('a[href*="chromewebstore.google.com"]');
    if (!a || Date.now() < hypeT) return; hypeT = Date.now() + 15000; wake(); mood('joy', 900); hearts(3); say(T('yes! that one!', '对！就点这个！'), 1800);
  });
  // notices highlighting and copying
  var selT = 0, selSaid = 0;
  document.addEventListener('selectionchange', function () {
    clearTimeout(selT); selT = setTimeout(function () { var s = String(getSelection() || '').trim();
      if (s.length > 12 && Date.now() > selSaid) { selSaid = Date.now() + 30000; mood('wow', 800); say(T('taking notes? ✦', '在划重点吗？✦'), 1800); } }, 500);
  });
  document.addEventListener('copy', function () { mood('joy', 800); say(T('copied!', '复制好啦！'), 1300, true); });
  // reacts to the theme switch
  new MutationObserver(function () { var d = root.getAttribute('data-theme') === 'dark'; mood(d ? 'wow' : 'joy', 900); say(d ? T('who turned off the lights?', '好黑…') : T('good morning!', '天亮啦！'), 1600, true); })
    .observe(root, { attributes: true, attributeFilter: ['data-theme'] });

  // tap: a little hop and a line; tap near the eyes: ouch; 4 quick taps: cap toss
  var TAPS = { en: ['hi!', 'you got this!', 'drink some water', 'only 86 on the final!', 'boop!', 'don’t stay up too late', 'one deadline at a time'],
               zh: ['嗨！', '冲呀！', '喝口水歇一下', 'final 只要考 86！', '戳我干嘛～', '别熬太晚哦', '一个一个来，不慌'] };
  hitEl.addEventListener('click', function (e) {
    if (dragged) { dragged = false; return; }
    wake();
    var now = performance.now(); taps = taps.filter(function (t) { return now - t < 1400; }); taps.push(now);
    if (taps.length >= 4) { taps = []; mood('toss', 1200); mood('joy', 1200); say(T('graduation!', '毕业快乐！'), 1800, true); return; }
    var r = hitEl.getBoundingClientRect(), y = (e.clientY - r.top) / r.height;
    if (y > .44 && y < .62) { mood('wow', 900); say(T('ouch, my eye!', '哎哟，戳到眼睛了！'), 1500, true); return; }
    mood('joy', 900); var L = TAPS[zh() ? 'zh' : 'en']; say(L[li++ % L.length], 1800, true);
  });
  // petting: rub back and forth
  hitEl.addEventListener('pointermove', function (e) {
    if (M.classList.contains('drag')) return;
    var d = Math.sign(e.clientX - lastX); lastX = e.clientX;
    if (d && d !== petDir) { petDir = d; petN++; clearTimeout(petT); petT = setTimeout(function () { petN = 0; }, 700); }
    if (petN >= 6) { petN = 0; wake(); mood('pet', 1300); hearts(4); say(T('hehe, that tickles', '好舒服～'), 1500, true); }
  });
  hitEl.addEventListener('pointerenter', function () { if (asleep) { wake(); mood('wow', 700); say(T('I wasn’t sleeping!', '我没睡！'), 1300, true); } });

  // drag it anywhere: it lands on the nearest side of the window (remembered for next time), but never leaves the screen
  var dragged = false, POS = 'cp-buddy-pos';
  function place(x, y, anim) {
    var w = M.offsetWidth, h = M.offsetHeight, W = innerWidth, H = innerHeight;
    x = Math.max(12, Math.min(W - w - 12, x)); y = Math.max(76, Math.min(H - h - 10, y));
    if (!anim) M.style.transition = 'none';
    M.style.setProperty('--bx', x + 'px'); M.style.setProperty('--by', y + 'px'); M.classList.add('placed');
    M.classList.toggle('side-l', x + w / 2 < W / 2); M.classList.toggle('high', y < 230);
    if (!anim) { void M.offsetWidth; M.style.transition = ''; }
  }
  function snap(anim) {
    var r = M.getBoundingClientRect(), left = r.left + r.width / 2 < innerWidth / 2;
    var x = left ? 22 : innerWidth - r.width - 22;
    place(x, r.top, anim);
    try { localStorage.setItem(POS, JSON.stringify({ l: left, y: Math.round(r.top / innerHeight * 1000) / 1000 })); } catch (e) {}
  }
  try { var sp = JSON.parse(localStorage.getItem(POS) || 'null');
    if (sp) place(sp.l ? 22 : innerWidth - M.offsetWidth - 22, sp.y * innerHeight, false); } catch (e) {}
  addEventListener('resize', function () { if (M.classList.contains('placed')) snap(false); });
  (function () {
    var id = null, sx = 0, sy = 0, ox = 0, oy = 0, lx = 0, lt = 0, shake = 0, moving = false;
    hitEl.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      var r = M.getBoundingClientRect(); id = e.pointerId; sx = e.clientX; sy = e.clientY; ox = r.left; oy = r.top; lx = e.clientX; lt = performance.now(); shake = 0; moving = false;
      hitEl.setPointerCapture(id);
    });
    hitEl.addEventListener('pointermove', function (e) {
      if (e.pointerId !== id) return;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      if (!moving && Math.abs(dx) + Math.abs(dy) < 6) return;
      if (!moving) { moving = true; dragged = true; wake(); M.classList.add('drag', 'wow'); say(T('whoa—', '哇——'), 900, true); }
      place(ox + dx, oy + dy, false); M.classList.add('drag');
      var now = performance.now(), v = (e.clientX - lx) / Math.max(16, now - lt); lx = e.clientX; lt = now;
      shake += Math.abs(v) > 1.6 ? 1 : -0.05; shake = Math.max(0, shake);
      var q = Math.min(.18, Math.abs(v) * .07);
      M.style.setProperty('--sqx', (1 + q).toFixed(3)); M.style.setProperty('--sqy', (1 - q).toFixed(3)); M.style.setProperty('--tilt', Math.max(-14, Math.min(14, v * 9)).toFixed(1) + 'deg');
    });
    function up(e) {
      if (e.pointerId !== id) return; id = null;
      if (!moving) return;
      M.classList.remove('drag', 'wow'); M.style.setProperty('--sqx', 1); M.style.setProperty('--sqy', 1); M.style.setProperty('--tilt', '0deg');
      snap(true);
      if (shake > 14) { mood('dizzy', 2000); say(T('so dizzy…', '晕了晕了…'), 1900, true); }
      else { setTimeout(function () { mood('joy', 800); say(T(['nice spot!', 'I like it here', 'comfy!'][Math.floor(Math.random() * 3)], ['这里不错！', '就待这儿吧', '舒服～'][Math.floor(Math.random() * 3)]), 1500, true); }, 450); }
      setTimeout(function () { dragged = false; }, 50);
    }
    hitEl.addEventListener('pointerup', up); hitEl.addEventListener('pointercancel', up);
  })();

  // eyes follow the cursor; dozes off when nothing happens for a while
  function wake() { if (asleep) { asleep = false; M.classList.remove('sleep'); clearInterval(zzzT); } poke(); }
  function poke() { clearTimeout(idleT); idleT = setTimeout(sleep, 15000); }
  function sleep() { asleep = true; M.classList.add('sleep'); M.classList.remove('talk');
    zzzT = setInterval(function () { spawn('', { t: 'z', x: (58 + Math.random() * 10) + 'px', y: '14px', dx: '14px', rot: '-10deg', c: 'var(--muted)', fs: (12 + Math.random() * 7) + 'px', d: '2s' }); }, 900); }
  if (!reduce) {
    var raf = 0;
    addEventListener('pointermove', function (e) {
      if (asleep && Math.hypot(e.movementX || 0, e.movementY || 0) > 40) { wake(); mood('wow', 600); } else if (!asleep) poke();
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () {
        var r = hitEl.getBoundingClientRect(); if (!r.width) return;
        var cx = r.left + r.width / 2, cy = r.top + r.height * .55, dx = e.clientX - cx, dy = e.clientY - cy, d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 260);
        [].forEach.call(pupils, function (p) { p.setAttribute('transform', 'translate(' + (dx / d * 2.6 * k).toFixed(2) + ' ' + (dy / d * 3 * k).toFixed(2) + ')'); });
      });
    }, { passive: true });
    (function blink() { setTimeout(function () { if (!asleep) { M.classList.add('blink'); setTimeout(function () { M.classList.remove('blink'); }, 130); } blink(); }, 2600 + Math.random() * 3200); })();
    poke();
  }
})();

// ---- command palette: ⌘K / Ctrl+K anywhere on the page (or tap the search sticker) ----
(function () {
  var box = document.getElementById('cmdk');
  if (!box) return;
  var root = document.documentElement, input = document.getElementById('cmdkQ'), list = document.getElementById('cmdkL');
  var zh = function () { return root.getAttribute('data-lang') === 'zh'; };
  var P = function (d) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>'; };
  var I = {
    grid: P('<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>'),
    spark: P('<path d="M11 3.5l1.9 5.1 5.1 1.9-5.1 1.9L11 17.5l-1.9-5.1L4 10.5l5.1-1.9z"/><path d="M19 3v4M17 5h4"/>'),
    mac: P('<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>'),
    scale: P('<path d="M12 3v18M5 7h14M5 7l-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z"/>'),
    star: P('<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>'),
    tag: P('<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="7.5" r="1.5"/>'),
    lock: P('<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
    help: P('<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17h.01"/>'),
    play: P('<path d="M7 4l13 8-13 8z"/>'),
    cursor: P('<path d="m4 4 7 17 2.5-7.5L21 11z"/>'),
    dl: P('<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>'),
    apple: P('<path d="M16 13.5c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.8-.8-3-.8-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.2.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7 2-1.1 2.8-2.2c.9-1.3 1.2-2.5 1.3-2.6-.1 0-2.5-.9-2.5-3.8zM14 6.6c.6-.8 1.1-1.9.9-2.9-.9 0-2 .6-2.7 1.4-.6.7-1.1 1.8-1 2.8 1 .1 2.1-.5 2.8-1.3z"/>'),
    moon: P('<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>'),
    globe: P('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>'),
    calc: P('<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h2M12 11h2M16 11v6M8 15h2M12 15h2"/>'),
    cap: P('<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c2 2 10 2 12 0v-5"/>'),
    bell: P('<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>'),
    zip: P('<path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4"/>'),
    clock: P('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    news: P('<path d="M4 4h13v16H6a2 2 0 0 1-2-2z"/><path d="M17 8h3v10a2 2 0 0 1-2 2M8 8h5M8 12h5M8 16h3"/>'),
    mail: P('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'),
    code: P('<path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 4l-4 16"/>'),
    chat: P('<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>')
  };
  var STORE = 'https://chromewebstore.google.com/detail/enihdeipikgagnnkpnanlhfechaflmif';
  var MAC = 'https://github.com/getcanvasplus/canvas-plus-desktop/releases/latest';
  var page = function (slug) { return (zh() ? '/zh/' : '/') + slug + '/'; };
  var go = function (id) { return function () { var el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: 'smooth' }); }; };
  var open = function (url, blank) { return function () { if (blank) window.open(url, '_blank', 'noopener'); else location.href = typeof url === 'function' ? url() : url; }; };
  // [group, icon, english label, 中文, english sub, 中文 sub, extra search words, action]
  var ITEMS = [
    ['act', 'dl', 'Add Canvas+ to Chrome', '添加 Canvas+ 到 Chrome', 'Free on the Chrome Web Store', 'Chrome 应用商店免费安装', 'install download extension 安装 插件 下载', open(STORE, true)],
    ['act', 'apple', 'Download for Mac', '下载 Mac 版', 'Menu bar app + desktop widgets', '菜单栏 + 桌面小组件', 'macos app widget 苹果 小组件', open(MAC, true)],
    ['act', 'cursor', 'Try the live demo', '试试在线演示', 'Click around a real Canvas+ panel', '点一点真实的 Canvas+ 面板', 'demo preview 演示 试用', go('demo')],
    ['act', 'moon', 'Switch light / dark', '切换浅色 / 深色', 'Change the look of this site', '切换网站外观', 'theme dark mode light 主题 深色 暗色 夜间', function () { var t = document.getElementById('theme'), d = root.getAttribute('data-theme'), m = window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches, want = (d ? d === 'dark' : m) ? 'light' : 'dark'; for (var k = 0; t && k < 3 && root.getAttribute('data-theme') !== want; k++) t.click(); }],
    ['act', 'globe', 'Switch to 中文', 'Switch to English', 'Change the language', '切换语言', 'language chinese english 语言 中文 英文', function () { var l = document.getElementById('lang'); if (l) l.click(); }],
    ['sec', 'grid', 'Features', '功能', 'Everything in one panel', '一个面板，全部搞定', 'deadlines grades 功能 作业', go('features')],
    ['sec', 'grid', 'Themes', '风格主题', '23 original looks for Canvas', '23 套原创 Canvas 主题', 'themes skins look style wallpaper 主题 皮肤 风格 壁纸 背景', go('themes')],
    ['sec', 'spark', 'Canvas+ AI', 'Canvas+ AI', 'Guides, syllabus, Q&A, review packs', '作业拆解、大纲、问答、复习包', 'ai assistant gpt 人工智能 问答', go('ai')],
    ['sec', 'mac', 'Canvas+ for Mac', 'Mac 版', 'Widgets and the menu bar', '桌面小组件和菜单栏', 'mac widget 小组件', go('mac')],
    ['sec', 'scale', 'Compare', '对比', 'Canvas+ vs. AI study sites and chatbots', 'Canvas+ 和 AI 学习网站、聊天机器人对比', 'vs comparison 比较', go('compare')],
    ['sec', 'star', 'Reviews', '用户评价', 'What students say', '听听学生们怎么说', 'reviews rating 评价 评分', go('reviews')],
    ['sec', 'tag', 'Pricing', '价格', 'Free, Plus and Pro', '免费版、Plus 和 Pro', 'price plans pro plus 价格 会员 付费', go('pricing')],
    ['sec', 'lock', 'Privacy', '隐私', 'Your grades never leave your browser', '成绩不离开你的浏览器', 'privacy security data 隐私 安全', go('privacy')],
    ['sec', 'help', 'FAQ', '常见问题', 'Answers to common questions', '常见问题解答', 'faq help questions 帮助 问题', go('faq')],
    ['sec', 'play', 'Watch the film', '观看宣传片', 'Canvas+ in a minute', '一分钟了解 Canvas+', 'video film 视频 宣传片', go('film')],
    ['pg', 'calc', 'Final grade calculator', '期末成绩计算器', 'What do I need on the final?', '期末要考多少分？', 'final grade calculator 期末 计算器', open(function () { return page('canvas-final-grade-calculator'); })],
    ['pg', 'cap', 'GPA calculator', 'GPA 计算器', 'Term and cumulative GPA', '学期和累计 GPA', 'gpa wam 绩点', open(function () { return page('canvas-gpa-calculator'); })],
    ['pg', 'moon', 'Canvas dark mode', 'Canvas 深色模式', 'A real dark mode for Canvas', '给 Canvas 真正的深色模式', 'dark mode theme 暗色 夜间', open(function () { return page('canvas-dark-mode'); })],
    ['pg', 'zip', 'Download course files', '一键下载课程文件', 'Every file in one .zip', '整门课打包成 .zip', 'zip download files 下载 文件 打包', open(function () { return page('download-all-canvas-files'); })],
    ['pg', 'bell', 'Assignment reminders', '作业截止提醒', 'Never miss a deadline', '再也不错过截止时间', 'reminders deadlines notifications 提醒 截止 通知', open(function () { return page('canvas-assignment-reminders'); })],
    ['pg', 'clock', 'For Ohio State (Carmen)', '俄亥俄州立大学 Carmen', 'Works on Carmen right away', '装好就能在 Carmen 上用', 'osu ohio state carmen buckeye 俄亥俄', open(function () { return page('carmen-canvas-extension'); })],
    ['pg', 'news', 'Changelog', '更新日志', 'What’s new in each version', '每个版本更新了什么', 'changelog updates version release 更新 版本', open(function () { return page('changelog'); })],
    ['pg', 'lock', 'Privacy policy', '隐私说明', 'What Canvas+ keeps, and what it doesn’t', 'Canvas+ 保存什么、不保存什么', 'privacy policy 隐私 政策', open(function () { return zh() ? '/privacy-zh.html' : '/privacy.html'; })],
    ['pg', 'mail', 'Contact support', '联系我们', 'support@getcanvasplus.com', 'support@getcanvasplus.com', 'email contact support bug feedback 邮件 联系 反馈', open('mailto:support@getcanvasplus.com')],
    ['pg', 'chat', 'Community on Reddit', 'Reddit 用户社区', 'r/GetCanvasPlus', 'r/GetCanvasPlus', 'reddit community 社区', open('https://www.reddit.com/r/GetCanvasPlus/', true)],
    ['pg', 'code', 'Open source on GitHub', 'GitHub 开源代码', 'The grade math and export code', '成绩计算和导出代码', 'github open source code 开源', open('https://github.com/getcanvasplus', true)]
  ];
  var GROUPS = { act: ['Actions', '快捷操作'], sec: ['On this page', '本页'], pg: ['Pages & links', '页面和链接'] };
  var shown = [], sel = 0, last = null;

  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  // where the query matches the text: one run if it appears as-is, else the letters in order (fuzzy)
  function match(text, q, exact) {
    var t = text.toLowerCase(), i = t.indexOf(q);
    if (i >= 0) return { score: i === 0 ? 3 : (/\s/.test(t[i - 1] || '') ? 2.5 : 2), marks: [[i, i + q.length]] };
    if (exact) return null;
    var m = [], j = 0;
    for (var k = 0; k < t.length && j < q.length; k++) if (t[k] === q[j]) { if (m.length && m[m.length - 1][1] === k) m[m.length - 1][1] = k + 1; else m.push([k, k + 1]); j++; }
    // fuzzy only for short gaps: every matched run starts a word, or there are at most two runs
    var ok = j === q.length && q.length > 1 && m.length <= 2 && m.every(function (r) { return r[0] === 0 || /[\s\-/(&+·]/.test(t[r[0] - 1]); });
    return ok ? { score: 1 - m.length * .1, marks: m } : null;
  }
  function hl(text, marks) {
    if (!marks) return esc(text); var out = '', p = 0;
    marks.forEach(function (r) { out += esc(text.slice(p, r[0])) + '<mark>' + esc(text.slice(r[0], r[1])) + '</mark>'; p = r[1]; });
    return out + esc(text.slice(p));
  }
  function render() {
    var q = input.value.trim().toLowerCase(), z = zh();
    var rows = [];
    ITEMS.forEach(function (it, n) {
      var label = z ? it[3] : it[2], sub = z ? it[5] : it[4];
      if (!q) { rows.push({ it: it, n: n, label: hl(label), sub: esc(sub), score: 0 }); return; }
      var a = match(label, q), b = a ? null : match(it[2] + ' ' + it[3], q, true), c = a || b ? null : match(sub + ' ' + it[6], q, true);
      var best = a || b || c; if (!best) return;
      rows.push({ it: it, n: n, label: hl(label, a && a.marks), sub: c && match(sub, q, true) ? hl(sub, match(sub, q, true).marks) : esc(sub), score: (a ? 10 : b ? 6 : 2) + best.score });
    });
    if (q) rows.sort(function (x, y) { return y.score - x.score || x.n - y.n; });
    shown = rows; sel = 0;
    if (!rows.length) { list.innerHTML = '<div class="cmdk-empty"><b>' + (z ? '没有找到“' : 'No results for “') + esc(input.value.trim()) + '”</b>' + (z ? '换个关键词试试，比如“GPA”或“深色”' : 'Try “GPA”, “dark” or “Mac”') + '</div>'; return; }
    var html = '', g = null, ENTER = z ? '打开' : 'Open';
    rows.forEach(function (r, i) {
      var grp = q ? (i === 0 ? 'top' : 'rest') : r.it[0];
      if (grp !== g) { g = grp; var name = q ? (grp === 'top' ? (z ? '最佳匹配' : 'Best match') : (z ? '其他结果' : 'More results')) : GROUPS[grp][z ? 1 : 0]; html += '<div class="cmdk-grp">' + name + '</div>'; }
      html += '<div class="cmdk-it' + (i === 0 ? ' sel' : '') + '" role="option" id="cmdk-' + i + '" data-i="' + i + '"><span class="ic2">' + I[r.it[1]] + '</span><span class="tx"><b>' + r.label + '</b><small>' + r.sub + '</small></span><span class="go">' + ENTER + ' <kbd>↵</kbd></span></div>';
    });
    list.innerHTML = html; list.scrollTop = 0; aria();
  }
  function aria() { input.setAttribute('aria-activedescendant', shown.length ? 'cmdk-' + sel : ''); }
  function select(i, scroll) {
    if (!shown.length) return; sel = (i + shown.length) % shown.length;
    [].forEach.call(list.querySelectorAll('.cmdk-it'), function (el) { el.classList.toggle('sel', +el.dataset.i === sel); });
    var el = document.getElementById('cmdk-' + sel); if (el && scroll) el.scrollIntoView({ block: 'nearest' }); aria();
  }
  function run(i) { var r = shown[i]; if (!r) return; close(); setTimeout(r.it[7], 60); if (window.cpBuddy) window.cpBuddy.joy(); }
  function labels() {
    var z = zh(); input.placeholder = z ? '搜索功能、页面或操作…' : 'Search features, pages and actions…';
    box.querySelector('.ft-mv').textContent = z ? '选择' : 'move'; box.querySelector('.ft-go').textContent = z ? '打开' : 'open'; box.querySelector('.ft-x').textContent = z ? '关闭' : 'close';
  }
  function openBox(seed) {
    if (box.classList.contains('open')) return;
    last = document.activeElement; labels(); input.value = seed || ''; render();
    box.classList.add('open'); root.classList.add('cmdk-lock');
    requestAnimationFrame(function () { box.classList.add('show'); input.focus(); input.select(); });
  }
  function close() {
    if (!box.classList.contains('open')) return;
    box.classList.remove('show'); root.classList.remove('cmdk-lock');
    setTimeout(function () { box.classList.remove('open'); }, 220);
    if (last && last.focus) try { last.focus({ preventScroll: true }); } catch (e) {}
  }
  window.cpCmdk = { open: openBox, close: close };

  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); box.classList.contains('open') ? close() : openBox(); return; }
    if (!box.classList.contains('open')) {
      if (e.key === '/' && !/input|textarea|select/i.test((document.activeElement || {}).tagName || '') && !document.activeElement.isContentEditable) { e.preventDefault(); openBox(); }
      return;
    }
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey) || (e.ctrlKey && e.key === 'n')) { e.preventDefault(); select(sel + 1, true); }
    else if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey) || (e.ctrlKey && e.key === 'p')) { e.preventDefault(); select(sel - 1, true); }
    else if (e.key === 'Home' && e.ctrlKey) { e.preventDefault(); select(0, true); }
    else if (e.key === 'Enter') { e.preventDefault(); run(sel); }
  });
  input.addEventListener('input', render);
  list.addEventListener('mousemove', function (e) { var it = e.target.closest('.cmdk-it'); if (it && +it.dataset.i !== sel) select(+it.dataset.i, false); });
  list.addEventListener('click', function (e) { var it = e.target.closest('.cmdk-it'); if (it) run(+it.dataset.i); });
  box.querySelector('[data-close]').addEventListener('click', close);
})();
