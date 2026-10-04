// Canvas+ website: language switch, scroll effects and the live panel demo.
(function () {
  var root = document.documentElement, $ = function (s, el) { return (el || document).querySelector(s); }, $$ = function (s, el) { return [].slice.call((el || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- language ----
  var key = 'cp-lang', saved = null;
  try { saved = localStorage.getItem(key); } catch (e) {}
  var q = new URLSearchParams(location.search).get('lang');
  var lang = q || saved || (/^zh/i.test(navigator.language || '') ? 'zh' : 'en');
  var zh = function () { return root.getAttribute('data-lang') === 'zh'; };
  function setLang(l) { root.setAttribute('data-lang', l); root.lang = l === 'zh' ? 'zh-CN' : 'en'; try { localStorage.setItem(key, l); } catch (e) {} renderDemo(); placeInd(); }
  $('#lang').addEventListener('click', function () { setLang(zh() ? 'en' : 'zh'); });

  // ---- nav border + reveal on scroll + tile glow ----
  var nav = $('#nav');
  addEventListener('scroll', function () { nav.classList.toggle('scrolled', scrollY > 8); }, { passive: true });
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
    $$('.rv').forEach(function (el) { io.observe(el); });
  } else $$('.rv').forEach(function (el) { el.classList.add('in'); });
  $$('.tile').forEach(function (el) {
    el.addEventListener('pointermove', function (e) { var r = el.getBoundingClientRect(); el.style.setProperty('--mx', (e.clientX - r.left) + 'px'); el.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
  });

  // ---- live panel demo ----
  var dm = $('#dm'), tabs = $$('.d-tab', dm), panes = $$('.d-pane', dm), ind = $('#dInd'), cur = 0, touched = false;
  function placeInd() { var b = tabs[cur]; if (!b) return; ind.style.width = b.offsetWidth + 'px'; ind.style.transform = 'translateX(' + (b.offsetLeft - 3) + 'px)'; }
  function show(i, byUser) {
    if (byUser) touched = true;
    cur = i;
    tabs.forEach(function (b, k) { b.classList.toggle('on', k === i); });
    panes.forEach(function (p, k) { p.classList.toggle('on', k === i); });
    placeInd();
    if (i === 2 && !aiDone) runAI();
  }
  tabs.forEach(function (b, k) { b.addEventListener('click', function () { show(k, true); }); });
  if ('ResizeObserver' in window) new ResizeObserver(placeInd).observe($('.d-tabs', dm)); else addEventListener('resize', placeInd);
  dm.addEventListener('pointerdown', function () { touched = true; });
  if (!reduce) setInterval(function () { if (!touched && document.visibilityState === 'visible') show((cur + 1) % tabs.length); }, 5200);

  // Deadlines
  var start = Date.now();
  var DL = [
    { t: 'Lab 4: Pipes & fork()', c: 'CSE 2431', col: '#e5484d', h: 5.2, w: '4%' },
    { t: 'Sprint 3 review', tz: 'Sprint 3 评审', c: 'CSE 3902', col: '#8e4ec6', h: 26.5, w: '10%' },
    { t: 'Homework 6', tz: '作业 6', c: 'MATH 2568', col: '#3e9b4f', h: 50.1, w: '3%' },
    { t: 'Checkpoint: Data to Features', c: 'CSE 3521', col: '#0090ff', h: 73.4, w: '1.5%' },
    { t: 'Essay draft', tz: '论文初稿', c: 'ENGLISH 1110', col: '#f5a524', h: 98, w: '12%' }
  ];
  var done = {};
  function fmt(ms) {
    var s = Math.max(0, ms / 1000), d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), x = Math.floor(s % 60);
    if (zh()) return d ? d + '天' + h + '小时' : h + '小时' + m + '分' + String(x).padStart(2, '0') + '秒';
    return d ? d + 'd ' + h + 'h' : h + 'h ' + m + 'm ' + String(x).padStart(2, '0') + 's';
  }
  function renderDL() {
    var list = $('#dlList'); if (!list) return;
    if (!list.children.length) DL.forEach(function (x, i) {
      var el = document.createElement('div'); el.className = 'dl'; el.dataset.i = i;
      el.innerHTML = '<span class="chk"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>' +
        '<div class="mid"><div class="t"></div><div class="c"><span class="dot" style="background:' + x.col + '"></span><span class="cc"></span></div></div><div class="cd"></div>';
      el.addEventListener('click', function () { done[i] = !done[i]; touched = true; renderDL(); });
      list.appendChild(el);
    });
    var left = 0;
    $$('.dl', list).forEach(function (el) {
      var x = DL[el.dataset.i], ms = x.h * 3600e3 - (Date.now() - start);
      el.classList.toggle('done', !!done[el.dataset.i]);
      if (!done[el.dataset.i]) left++;
      $('.t', el).textContent = zh() && x.tz ? x.tz : x.t;
      $('.cc', el).textContent = x.c + ' · ' + (zh() ? '占 ' + x.w : x.w + ' of grade');
      var cd = $('.cd', el); cd.classList.toggle('hot', x.h < 24);
      cd.innerHTML = fmt(ms) + '<small>' + (done[el.dataset.i] ? (zh() ? '已完成' : 'done') : (zh() ? '后截止' : 'left')) + '</small>';
    });
    $('#dlLeft').textContent = zh() ? left + ' 项待完成' : left + ' to do';
  }
  setInterval(renderDL, 1000);

  // Final calculator
  var C = [{ n: 'CSE 2231', now: 91.2, w: .25 }, { n: 'MATH 2568', now: 84.6, w: .3 }, { n: 'PHYS 1250', now: 78.9, w: .35 }];
  var T = [{ l: 'A', v: 93 }, { l: 'A-', v: 90 }, { l: 'B+', v: 87 }, { l: 'B', v: 83 }];
  var ci = 0, ti = 1;
  function chips(id, arr, sel, on) {
    var box = $(id); box.innerHTML = '';
    arr.forEach(function (x, k) { var b = document.createElement('button'); b.className = 'chip' + (k === sel ? ' on' : ''); b.textContent = x.n || x.l + ' (' + x.v + '%)'; b.onclick = function () { touched = true; on(k); }; box.appendChild(b); });
  }
  function renderCalc() {
    chips('#cCourses', C, ci, function (k) { ci = k; renderCalc(); });
    chips('#cTargets', T, ti, function (k) { ti = k; renderCalc(); });
    var c = C[ci], need = (T[ti].v - c.now * (1 - c.w)) / c.w, r = Math.max(0, Math.min(100, need));
    $('#cNeed').textContent = need > 100 ? '>100%' : Math.max(0, need).toFixed(1) + '%';
    $('#cRing').style.strokeDashoffset = 314.16 * (1 - r / 100);
    $('#cNow').textContent = c.now + '%';
    $('#cW').textContent = Math.round(c.w * 100) + '%';
    $('#cMsg').textContent = need > 100 ? (zh() ? '这个目标有点难了，换一个试试' : 'Out of reach — try another target') : need <= 0 ? (zh() ? '已经稳了 🎉' : 'Already locked in 🎉') : (zh() ? '加油，完全可以' : 'Totally doable');
    var W = [[zh() ? '作业' : 'Homework', 30], [zh() ? '期中' : 'Midterm', 100 - 30 - Math.round(c.w * 100)], [zh() ? '期末' : 'Final', Math.round(c.w * 100)]];
    $('#cWeights').innerHTML = W.map(function (x) { return '<div class="w"><span>' + x[0] + '</span><span>' + x[1] + '%</span><div class="bar"><i style="width:' + x[1] + '%"></i></div></div>'; }).join('');
  }

  // AI guide (typed in)
  var AI = {
    en: ['Read the starter code: <b>main.c</b> makes one pipe and two children.', 'Child 1 writes with <b>write()</b> — close its read end first.', 'Child 2 reads and prints — close its write end, or it never sees EOF.', 'The parent closes both ends and <b>waitpid()</b>s both children.', 'Hand in <b>lab4.c</b> + a README with test output. Easy to lose points: zombie processes.'],
    zh: ['先看起始代码：<b>main.c</b> 建了一个 pipe 和两个子进程。', '子进程 1 用 <b>write()</b> 写入——先关掉读端。', '子进程 2 读取并打印——要关掉写端，否则永远读不到 EOF。', '父进程关掉两端，再用 <b>waitpid()</b> 等两个子进程。', '提交 <b>lab4.c</b> 和带测试输出的 README。容易扣分：僵尸进程。']
  };
  var aiDone = false, aiTimer = null;
  function runAI() {
    aiDone = true; clearTimeout(aiTimer);
    var ol = $('#aiList'), lines = AI[zh() ? 'zh' : 'en'], k = 0;
    ol.innerHTML = lines.map(function (l) { return '<li>' + l + '</li>'; }).join('');
    var lis = $$('li', ol);
    (function next() { if (k > 0) lis[k - 1].classList.remove('cur'); if (k >= lis.length) return; lis[k].classList.add('in', 'cur'); k++; aiTimer = setTimeout(next, reduce ? 0 : 650); })();
  }
  $('#aiGo').addEventListener('click', function () { touched = true; runAI(); });

  // Appearance
  var ACC = ['#c3121d', '#2563eb', '#16a34a', '#7c3aed', '#ea580c'];
  var sw = $('#swAcc');
  ACC.forEach(function (c, k) { var b = document.createElement('button'); b.className = 'swc' + (k ? '' : ' on'); b.style.background = c; b.setAttribute('aria-label', c);
    b.onclick = function () { touched = true; dm.style.setProperty('--p-acc', c); $$('.swc', sw).forEach(function (x) { x.classList.toggle('on', x === b); }); }; sw.appendChild(b); });
  $$('.sw', dm).forEach(function (b) { b.addEventListener('click', function () { touched = true; b.classList.toggle('on'); if (b.id === 'swDark') dm.classList.toggle('dark', b.classList.contains('on')); }); });

  // Notification toasts
  var TO = [
    { en: ['New grade posted', 'CSE 2231 · Project 2 · tap to see'], zh: ['出分了', 'CSE 2231 · Project 2 · 点击查看'] },
    { en: ['Due date moved', 'MATH 2568 · HW 6 → Fri 11:59 PM'], zh: ['截止时间改了', 'MATH 2568 · 作业 6 → 周五 23:59'] },
    { en: ['New announcement', 'CSE 3902 · Sprint 3 teams posted'], zh: ['新公告', 'CSE 3902 · Sprint 3 分组已公布'] }
  ];
  var toast = $('#toast'), tk = 0;
  function cycleToast() {
    if (document.visibilityState !== 'visible') return;
    var x = TO[tk++ % TO.length][zh() ? 'zh' : 'en'];
    $('#toastTx').innerHTML = '<b>' + x[0] + '</b><span>' + x[1] + '</span>';
    toast.classList.add('show');
    setTimeout(function () { toast.classList.remove('show'); }, 3600);
  }
  if (!reduce) { setTimeout(cycleToast, 1800); setInterval(cycleToast, 7000); }

  function renderDemo() { renderDL(); renderCalc(); if (aiDone) { aiDone = false; if (cur === 2) runAI(); } }

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

  setLang(lang === 'zh' ? 'zh' : 'en');
})();
