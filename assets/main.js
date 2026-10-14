/* PapaBin — локальная копия.
   Заменяет поведение оригинального Vue-бандла (прелоадер, анимации появления,
   счётчики, FAQ, мобильное меню) и добавляет переключатель светлой темы. */
(function () {
  var root = document.documentElement;
  var STORAGE_KEY = 'papabin-theme';

  /* ---------- Тема ---------- */
  function storedTheme() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function applyTheme(theme, animate) {
    if (animate) {
      root.classList.add('theme-anim');
      setTimeout(function () { root.classList.remove('theme-anim'); }, 400);
    }
    root.classList.toggle('light', theme === 'light');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#f6f7f3' : '#85BB65');
    document.querySelectorAll('.theme-toggle').forEach(function (b) {
      b.setAttribute('aria-pressed', theme === 'light');
      b.setAttribute('aria-label', theme === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему');
    });
  }
  function currentTheme() { return root.classList.contains('light') ? 'light' : 'dark'; }

  var ICONS =
    '<svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>' +
    '<svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>';

  function makeToggle() {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'theme-toggle';
    b.innerHTML = ICONS;
    b.addEventListener('click', function () {
      var next = currentTheme() === 'light' ? 'dark' : 'light';
      applyTheme(next, true);
      try { localStorage.setItem(STORAGE_KEY, next); } catch (e) {}
    });
    return b;
  }

  function mountToggles() {
    var nav = document.getElementById('navbar');
    if (!nav) return;
    // десктоп: перед кнопкой «Get access»
    var desktop = nav.querySelector('.md\\:flex');
    if (desktop) {
      var cta = desktop.querySelector('a.bg-money');
      desktop.insertBefore(makeToggle(), cta || null);
    }
    // мобайл: рядом с бургером
    var burger = nav.querySelector('button.md\\:hidden');
    if (burger) {
      var wrap = document.createElement('div');
      wrap.className = 'md:hidden flex items-center gap-3';
      burger.parentNode.insertBefore(wrap, burger);
      wrap.appendChild(makeToggle());
      wrap.appendChild(burger);
    }
    applyTheme(currentTheme(), false);
  }

  // если пользователь не выбирал тему — следуем системной
  try {
    var mq = window.matchMedia('(prefers-color-scheme: light)');
    mq.addEventListener('change', function (e) {
      if (!storedTheme()) applyTheme(e.matches ? 'light' : 'dark', true);
    });
  } catch (e) {}

  /* ---------- Поведение страницы ---------- */
  function hidePreloader() {
    var p = document.getElementById('preloader');
    if (!p) return;
    setTimeout(function () { p.classList.add('hidden'); }, 1200);
  }

  function initReveal() {
    var els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('active'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('active'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  function initCounters() {
    var els = document.querySelectorAll('.counter[data-target]');
    var run = function (el) {
      var target = parseInt(el.getAttribute('data-target'), 10) || 0;
      var start = performance.now(), dur = 1800;
      (function tick(now) {
        var t = Math.min(1, (now - start) / dur);
        var v = Math.round(target * (1 - Math.pow(1 - t, 3)));
        el.textContent = v.toLocaleString('en-US') + (t === 1 ? '+' : '');
        if (t < 1) requestAnimationFrame(tick);
      })(start);
    };
    if (!('IntersectionObserver' in window)) { els.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { run(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    els.forEach(function (el) { io.observe(el); });
  }

  function initFaq() {
    document.querySelectorAll('.faq-item').forEach(function (item) {
      var head = item.firstElementChild;
      (head || item).addEventListener('click', function () { item.classList.toggle('open'); });
    });
  }

  function initMobileMenu() {
    var nav = document.getElementById('navbar');
    if (!nav) return;
    var burger = nav.querySelector('button.md\\:hidden');
    var menu = nav.querySelector('div.md\\:hidden.border-t');
    if (!burger || !menu) return;
    burger.setAttribute('aria-label', 'Меню');
    burger.addEventListener('click', function () {
      menu.style.display = menu.style.display === 'none' ? '' : 'none';
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { menu.style.display = 'none'; });
    });
  }

  function init() {
    mountToggles();
    hidePreloader();
    initReveal();
    initCounters();
    initFaq();
    initMobileMenu();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
