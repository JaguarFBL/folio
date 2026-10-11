// PIXEL TRAIL (portage vanille du composant Originkit — paramètres démo)
(function () {
  var host = document.getElementById('pixel-trail');
  var grid = document.getElementById('pixel-trail-grid');
  if (!host || !grid) return;

  // PARAMÈTRES DÉMO
  var COLUMNS = 20;
  var MAX_CELLS = 4200;
  var GAP = 0;
  var HOLD = 0.3;
  var FADE = 0.45;
  var REACH = 0;
  var WALK_FRACTION = 0.5;
  var MAX_WALK_STEPS = 96;
  var FADE_EASING = 'linear';

  // ÉTAT LIVE
  var cols = 0;
  var rows = 0;
  var pitch = 0;
  var cells = [];
  var timers = [];
  var last = null;

  // MESURE — cellule carrée + pas de grille pour c colonnes
  function measure(c) {
    var cell = Math.max(1, (host.clientWidth - GAP * (c - 1)) / c);
    var p = cell + GAP;
    var r = Math.max(1, Math.ceil((host.clientHeight + GAP) / p));
    return { pitch: p, rows: r };
  }

  function build() {
    var w = host.clientWidth;
    var h = host.clientHeight;
    if (w <= 0 || h <= 0) return;

    var c = COLUMNS;
    var m = measure(c);
    var guard = 0;
    while (c * m.rows > MAX_CELLS && c > 2 && guard++ < 16) {
      c = Math.max(2, Math.floor(c * 0.85));
      m = measure(c);
    }

    cols = c;
    rows = m.rows;
    pitch = m.pitch;

    for (var t = 0; t < timers.length; t++) {
      if (timers[t]) clearTimeout(timers[t]);
    }

    grid.innerHTML = '';
    grid.style.gridTemplateColumns = 'repeat(' + cols + ', 1fr)';
    grid.style.gap = GAP + 'px';

    var count = cols * rows;
    cells = [];
    timers = [];
    for (var i = 0; i < count; i++) {
      var el = document.createElement('div');
      el.className = 'pixel-trail-cell';
      grid.appendChild(el);
      cells.push(el);
      timers.push(0);
    }
    last = null;
  }

  function strike(col, row, alpha) {
    if (col < 0 || col >= cols || row < 0 || row >= rows) return;
    var i = row * cols + col;
    var el = cells[i];
    if (!el) return;
    if (timers[i]) {
      clearTimeout(timers[i]);
      timers[i] = 0;
    }
    var current = parseFloat(el.style.opacity) || 0;
    var next = current > alpha ? current : alpha;
    el.style.transition = 'none';
    el.style.opacity = String(next);
    timers[i] = setTimeout(function () {
      timers[i] = 0;
      el.style.transition = 'opacity ' + FADE + 's ' + FADE_EASING;
      el.style.opacity = '0';
    }, HOLD * 1000);
  }

  // ALLUMAGE — cellule visée + voisines selon REACH
  function stamp(x, y) {
    var col = Math.floor(x / pitch);
    var row = Math.floor(y / pitch);
    for (var dc = -REACH; dc <= REACH; dc++) {
      for (var dr = -REACH; dr <= REACH; dr++) {
        var d = Math.sqrt(dc * dc + dr * dr);
        if (d > REACH + 0.5) continue;
        strike(col + dc, row + dr, 1 - d / (REACH + 1));
      }
    }
  }

  // INTERPOLATION — pas de trous entre deux positions du pointeur
  function trace(x, y) {
    if (last) {
      var dx = x - last.x;
      var dy = y - last.y;
      var steps = Math.min(MAX_WALK_STEPS, Math.ceil(Math.sqrt(dx * dx + dy * dy) / (pitch * WALK_FRACTION)));
      for (var i = 1; i < steps; i++) {
        stamp(last.x + dx * i / steps, last.y + dy * i / steps);
      }
    }
    stamp(x, y);
    last = { x: x, y: y };
  }

  // ÉVÉNEMENTS — coalesced pour la fluidité trackpad/tactile
  function onPoint(e) {
    if (pitch <= 0) return;
    var rect = host.getBoundingClientRect();
    var scale = host.offsetWidth > 0 ? rect.width / host.offsetWidth : 1;
    if (!(scale > 0)) return;
    var points = (e.getCoalescedEvents && e.getCoalescedEvents().length) ? e.getCoalescedEvents() : [e];
    for (var i = 0; i < points.length; i++) {
      var p = points[i];
      trace((p.clientX - rect.left) / scale, (p.clientY - rect.top) / scale);
    }
  }

  host.addEventListener('pointermove', onPoint);
  host.addEventListener('pointerdown', onPoint);
  host.addEventListener('pointerleave', function () { last = null; });

  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(function () { build(); }).observe(host);
  } else {
    window.addEventListener('resize', build);
  }
  build();
})();
