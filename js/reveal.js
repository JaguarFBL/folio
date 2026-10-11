// DESIGNS — HOVER IMAGE REVEAL (portage vanille, paramètres type framer-motion)
(function () {
  var list = document.getElementById('designs-list');
  if (!list) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  var section = document.getElementById('designs');
  var floatEl = document.getElementById('designs-float');
  if (!section || !floatEl) return;

  var items = Array.prototype.slice.call(list.querySelectorAll('.designs-item'));
  var stackEls = Array.prototype.slice.call(floatEl.querySelectorAll('.designs-float-item'));
  var rollEls = items.map(function (item) {
    return item.querySelector('.designs-roll');
  });

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // MÉTRIQUES — variables CSS relues au resize
  var offsetX = 0;

  function readMetrics() {
    var cs = window.getComputedStyle(section);
    offsetX = parseFloat(cs.getPropertyValue('--reveal-offset-x')) || 0;
  }

  readMetrics();
  window.addEventListener('resize', readMetrics);

  // MOTEUR DE RESSORT — raideur / amortissement / masse
  var springs = [];

  function createSpring(k, c, m, initial) {
    var s = { x: initial, v: 0, target: initial, k: k, c: c, m: m };
    s.setValue = function (val) {
      s.x = val;
      s.v = 0;
    };
    s.setTarget = function (val) {
      s.target = val;
      if (reduceMotion) { s.x = val; s.v = 0; }
    };
    springs.push(s);
    return s;
  }

  var followX = createSpring(60, 28, 0.5, 0);
  var followY = createSpring(60, 28, 0.5, 0);
  var opacity = createSpring(400, 40, 1, 0);
  var stackSprings = stackEls.map(function () { return createSpring(400, 40, 1, 100); });
  var rollSprings = rollEls.map(function () { return createSpring(400, 40, 1, 0); });

  // RENDU — écriture DOM depuis les valeurs des ressorts
  function render() {
    floatEl.style.transform = 'translate(' + followX.x + 'px, ' + followY.x + 'px) translate(-50%, -50%)';
    floatEl.style.opacity = Math.max(0, Math.min(1, opacity.x));
    for (var i = 0; i < stackEls.length; i++) {
      stackEls[i].style.transform = 'translateY(' + stackSprings[i].x + '%)';
    }
    for (var j = 0; j < rollEls.length; j++) {
      rollEls[j].style.transform = 'translateY(' + rollSprings[j].x + '%)';
    }
  }

  // ÉTAT DE SURVOL
  var visible = false;
  var hasMouse = false;
  var lastX = 0;
  var lastY = 0;

  function hover(index) {
    if (!visible) {
      if (hasMouse) { followX.setValue(lastX); followY.setValue(lastY); }
      visible = true;
    }
    opacity.setTarget(1);
    list.classList.add('has-hover');
    for (var i = 0; i < items.length; i++) {
      items[i].classList.toggle('is-hover', i === index);
      stackSprings[i].setTarget(i < index ? -100 : i > index ? 100 : 0);
      rollSprings[i].setTarget(i === index ? -100 : 0);
    }
    if (reduceMotion) render();
  }

  function reset() {
    visible = false;
    opacity.setTarget(0);
    list.classList.remove('has-hover');
    for (var i = 0; i < items.length; i++) {
      items[i].classList.remove('is-hover');
      stackSprings[i].setTarget(100);
      rollSprings[i].setTarget(0);
    }
    if (reduceMotion) render();
  }

  // ÉVÉNEMENTS
  items.forEach(function (item, i) {
    item.addEventListener('mouseenter', function () { hover(i); });
  });

  section.addEventListener('mousemove', function (e) {
    hasMouse = true;
    var rect = section.getBoundingClientRect();
    lastX = e.clientX - rect.left + offsetX;
    lastY = e.clientY - rect.top;
    followX.setTarget(lastX);
    followY.setTarget(lastY);
    if (reduceMotion) render();
  });

  list.addEventListener('mouseleave', reset);
  section.addEventListener('mouseleave', reset);

  // BOUCLE D'INTÉGRATION — unique, dt réel clampé (retour d'onglet)
  if (!reduceMotion) {
    var last = performance.now();

    function tick(now) {
      var dt = Math.max(0, Math.min((now - last) / 1000, 1 / 30));
      last = now;
      for (var i = 0; i < springs.length; i++) {
        var s = springs[i];
        var a = (-s.k * (s.x - s.target) - s.c * s.v) / s.m;
        s.v += a * dt;
        s.x += s.v * dt;
      }
      render();
      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }
})();
