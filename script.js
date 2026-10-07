(function () {
  var dock = document.getElementById('dock');
  var covered = 0; // booking/contact sections in view -> dock is redundant
  var onScroll = function () {
    if (dock) dock.classList.toggle('show', window.scrollY > 420 && !covered);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if ('IntersectionObserver' in window) {
    var dockIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { covered += e.isIntersecting ? 1 : -1; });
      covered = Math.max(0, covered);
      onScroll();
    }, { threshold: 0.2 });
    ['boka', 'kontakt'].forEach(function (id) {
      var el = document.getElementById(id); if (el) dockIo.observe(el);
    });
  }

  /* Reveal on scroll */
  var items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* Open / closed status (Europe/Stockholm). Mon–Sat 08–20, Sun 08–16. */
  try {
    var parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Stockholm', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false
    }).formatToParts(new Date());
    var get = function (t) { return parts.filter(function (p) { return p.type === t; })[0].value; };
    var dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    var day = dayMap[get('weekday')];
    var mins = (parseInt(get('hour'), 10) % 24) * 60 + parseInt(get('minute'), 10);
    var closeH = day === 0 ? 16 : 20;
    var open = mins >= 8 * 60 && mins < closeH * 60;

    var row = document.querySelector('#hours li[data-d="' + day + '"]');
    if (row) row.classList.add('today');

    var st = document.getElementById('status');
    var tx = document.getElementById('statusText');
    if (st && tx) {
      if (open) { st.classList.add('open'); tx.textContent = 'Öppet nu · stänger ' + closeH + ':00'; }
      else if (mins < 8 * 60) { tx.textContent = 'Stängt · öppnar idag 08:00'; }
      else { tx.textContent = 'Stängt · öppnar imorgon 08:00'; }
    }
  } catch (err) { /* status is a nicety; ignore */ }

  /* Demo booking form – no backend */
  var form = document.getElementById('bookForm');
  var note = document.getElementById('formNote');
  if (form && note) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.namn.value.trim(), tel = form.telefon.value.trim();
      note.classList.remove('ok');
      if (!name || !tel) { note.textContent = 'Fyll i namn och telefonnummer.'; return; }
      note.classList.add('ok');
      note.textContent = 'Tack ' + name + '! Detta är en demo – förfrågan har inte skickats. Ring 076-004 78 29 för att boka.';
    });
  }
})();
