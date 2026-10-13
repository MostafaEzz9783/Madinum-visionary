/* Madinum — site interactions (no dependencies) */
(function () {
  'use strict';
  var doc = document.documentElement;
  doc.classList.remove('no-js');
  var isEn = doc.lang === 'en';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Header shadow on scroll */
  var header = document.querySelector('.site-header');
  function onScroll() { if (header) header.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile navigation */
  var toggle = document.querySelector('.nav-toggle');
  var mnav = document.getElementById('mobile-nav');
  if (toggle && mnav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      mnav.classList.toggle('open', !open);
      document.body.style.overflow = open ? '' : 'hidden';
    });
    mnav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        toggle.setAttribute('aria-expanded', 'false');
        mnav.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mnav.classList.contains('open')) { toggle.click(); toggle.focus(); }
    });
  }

  /* Reveal on scroll */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el, i) { el.style.transitionDelay = ((i % 4) * 60) + 'ms'; io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* Hero slideshow */
  var slides = document.querySelectorAll('.hero-slides img');
  if (slides.length > 1 && !reduce) {
    var cur = 0;
    setInterval(function () {
      slides[cur].classList.remove('active');
      cur = (cur + 1) % slides.length;
      slides[cur].classList.add('active');
    }, 5000);
  }

  /* Tabs (WAI-ARIA tablist) */
  document.querySelectorAll('[data-tabs]').forEach(function (root) {
    var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) {
          panel.hidden = !on;
          if (on) { panel.classList.remove('enter'); void panel.offsetWidth; panel.classList.add('enter'); }
        }
      });
      if (focus) tab.focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t); });
      t.addEventListener('keydown', function (e) {
        var k = e.key, n = null;
        if (k === 'ArrowDown' || k === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
        if (k === 'ArrowUp' || k === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
        if (k === 'Home') n = tabs[0];
        if (k === 'End') n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); select(n, true); }
      });
    });
  });

  /* Owner bar -> calculator with prefilled values */
  var ownerbar = document.querySelector('[data-ownerbar]');
  if (ownerbar) {
    ownerbar.addEventListener('submit', function (e) {
      e.preventDefault();
      var p = new URLSearchParams(new FormData(ownerbar));
      window.location.href = ownerbar.getAttribute('action') + '?' + p.toString();
    });
  }

  /* Contact form -> opens email (static demo) */
  var contact = document.querySelector('[data-contact-form]');
  if (contact) {
    contact.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate(contact)) return;
      var f = new FormData(contact);
      var subject = (isEn ? 'Website enquiry — ' : 'استفسار من الموقع — ') + f.get('name');
      var body = [
        (isEn ? 'Name: ' : 'الاسم: ') + f.get('name'),
        (isEn ? 'Email: ' : 'البريد: ') + f.get('email'),
        (isEn ? 'Mobile: ' : 'الجوال: ') + f.get('phone'),
        (isEn ? 'Service: ' : 'الخدمة: ') + (f.get('service') || '-'),
        '',
        f.get('message')
      ].join('\n');
      window.location.href = 'mailto:info@madinum.sa?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      var ok = contact.querySelector('.notice.ok');
      if (ok) ok.hidden = false;
    });
  }

  /* Generic validation */
  function validate(form) {
    var valid = true, first = null;
    form.querySelectorAll('[required]').forEach(function (el) {
      var bad;
      if (el.type === 'radio') {
        bad = !form.querySelector('input[name="' + el.name + '"]:checked');
      } else if (el.type === 'checkbox') {
        bad = !el.checked;
      } else {
        bad = !el.value.trim() || (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()));
      }
      if (el.name === 'phone' && !bad) bad = !/^(\+?966|0)?5\d{8}$/.test(el.value.replace(/[\s-]/g, ''));
      var holder = el.closest('.field, .choice-group, .consent');
      var msg = holder && holder.querySelector('.error-msg');
      if (el.type !== 'radio' || el === form.querySelector('input[name="' + el.name + '"]')) {
        if (el.type !== 'radio' && el.type !== 'checkbox') el.setAttribute('aria-invalid', String(bad));
        if (msg) msg.hidden = !bad;
      }
      if (bad) { valid = false; if (!first) first = el; }
    });
    if (first) { first.focus(); first.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' }); }
    return valid;
  }

  /* Calculator */
  var calc = document.querySelector('[data-calc-form]');
  if (calc) {
    var citySel = calc.querySelector('[name="city"]');
    var distSel = calc.querySelector('[name="district"]');
    var unitSel = calc.querySelector('[name="unit_type"]');
    var districts = {};
    function fillDistricts() {
      var list = districts[citySel.value] || [];
      distSel.innerHTML = '';
      var o = document.createElement('option');
      o.value = '';
      o.textContent = citySel.value ? (isEn ? 'Choose district' : 'اختر الحي') : (isEn ? 'Choose a city first' : 'اختر المدينة أولًا');
      distSel.appendChild(o);
      list.forEach(function (d) { var x = document.createElement('option'); x.value = d; x.textContent = d; distSel.appendChild(x); });
      distSel.disabled = !list.length;
    }
    fetch('/assets/data/districts.json').then(function (r) { return r.json(); }).then(function (j) {
      districts = j; fillDistricts();
      var q = new URLSearchParams(location.search);
      if (q.get('city')) { citySel.value = q.get('city'); fillDistricts(); }
      if (q.get('unit_type')) unitSel.value = q.get('unit_type');
      var rent = q.get('rental');
      if (rent) { var r = calc.querySelector('input[name="rental"][value="' + rent + '"]'); if (r) r.checked = true; }
    }).catch(function () { distSel.disabled = false; });
    citySel.addEventListener('change', fillDistricts);

    var ta = calc.querySelector('textarea[name="description"]');
    var counter = calc.querySelector('[data-counter]');
    if (ta && counter) ta.addEventListener('input', function () { counter.textContent = ta.value.length + ' / 1500'; });

    calc.addEventListener('submit', function (e) {
      e.preventDefault();
      if (calc.querySelector('[name="website"]').value) return; // honeypot
      if (!validate(calc)) return;
      var f = new FormData(calc);
      var label = function (name) { var el = calc.querySelector('[name="' + name + '"]'); return el && el.selectedIndex > -1 ? el.options[el.selectedIndex].text : ''; };
      var res = document.getElementById('calc-result');
      res.querySelector('[data-r="city"]').textContent = label('city');
      res.querySelector('[data-r="district"]').textContent = f.get('district');
      res.querySelector('[data-r="unit"]').textContent = label('unit_type');
      res.querySelector('[data-r="baths"]').textContent = f.get('bathrooms');
      var lines = [
        isEn ? 'Hello Madinum, I would like an income estimate for my unit:' : 'مرحبًا مادينيوم، أرغب في تقييم دخل وحدتي:',
        (isEn ? 'Name: ' : 'الاسم: ') + f.get('full_name'),
        (isEn ? 'Mobile: ' : 'الجوال: ') + f.get('phone'),
        (isEn ? 'City: ' : 'المدينة: ') + label('city'),
        (isEn ? 'District: ' : 'الحي: ') + f.get('district'),
        (isEn ? 'Unit type: ' : 'نوع الوحدة: ') + label('unit_type'),
        (isEn ? 'Bathrooms: ' : 'دورات المياه: ') + f.get('bathrooms')
      ];
      if (f.get('description')) lines.push((isEn ? 'Details: ' : 'التفاصيل: ') + f.get('description'));
      res.querySelector('[data-wa]').href = 'https://wa.me/966556586767?text=' + encodeURIComponent(lines.join('\n'));
      res.hidden = false;
      res.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
      res.focus({ preventScroll: true });
    });
  }

  /* Year */
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
