// HAMBURGER MENU
(function () {
  var hamburger = document.getElementById('hamburger');
  var navLinks = document.getElementById('nav-links');
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', function () {
    var open = navLinks.classList.toggle('open');
    document.body.classList.toggle('menu-open', open);
  });

  navLinks.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      navLinks.classList.remove('open');
      document.body.classList.remove('menu-open');
    });
  });
})();

// CURSEUR PERSONNALISÉ — désactivé tactile
(function () {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  var cursor = document.getElementById('cursor');
  var dot = document.getElementById('cursor-dot');
  if (!cursor || !dot) return;

  var mouseX = 0, mouseY = 0;
  var cursorX = 0, cursorY = 0;
  var dotX = 0, dotY = 0;

  window.__cursorX = 0;
  window.__cursorY = 0;

  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  var SPEED = 0.12;

  function lerp() {
    cursorX += (mouseX - cursorX) * SPEED;
    cursorY += (mouseY - cursorY) * SPEED;
    dotX += (mouseX - dotX) * SPEED * 2;
    dotY += (mouseY - dotY) * SPEED * 2;

    window.__cursorX = cursorX;
    window.__cursorY = cursorY;

    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
    dot.style.left = dotX + 'px';
    dot.style.top = dotY + 'px';

    requestAnimationFrame(lerp);
  }

  lerp();

  document.addEventListener('mouseover', function (e) {
    var t = e.target.closest('a, button, .sticker, .cassette');
    if (t) cursor.classList.add('is-hover');
  });
  document.addEventListener('mouseout', function (e) {
    var t = e.target.closest('a, button, .sticker, .cassette');
    if (t) cursor.classList.remove('is-hover');
  });
})();

// CASSETTE DRAG
(function () {
  var el = document.querySelector('.cassette');
  if (!el) return;

  var dragging = false, startX = 0, startY = 0, ox = 0, oy = 0;

  function down(cx, cy) {
    dragging = true;
    el.style.animation = 'none';
    startX = cx; startY = cy;
    ox = el.offsetLeft; oy = el.offsetTop;
  }

  function move(cx, cy) {
    if (!dragging) return;
    el.style.left = (ox + cx - startX) + 'px';
    el.style.top = (oy + cy - startY) + 'px';
  }

  function up() {
    if (!dragging) return;
    dragging = false;
    el.style.animation = 'floatCassette 4s ease-in-out infinite';
  }

  el.addEventListener('mousedown', function (e) { down(e.clientX, e.clientY); });
  document.addEventListener('mousemove', function (e) { move(e.clientX, e.clientY); });
  document.addEventListener('mouseup', up);

  el.addEventListener('touchstart', function (e) {
    var t = e.touches[0];
    down(t.clientX, t.clientY);
  }, { passive: true });
  document.addEventListener('touchmove', function (e) {
    var t = e.touches[0];
    move(t.clientX, t.clientY);
  }, { passive: true });
  document.addEventListener('touchend', up);
})();

// PARALLAX STICKERS ABOUT
(function () {
  var els = document.querySelectorAll('.sticker-about');
  if (!els.length) return;
  var data = [];
  els.forEach(function (el) {
    var cs = window.getComputedStyle(el);
    var m = cs.transform.match(/matrix\(([-\d.]+),\s*([-\d.]+)/);
    var rot = 0;
    if (m) rot = Math.atan2(parseFloat(m[2]), parseFloat(m[1])) * (180 / Math.PI);
    data.push({ el: el, rot: rot });
  });
  window.addEventListener('scroll', function () {
    var scrolled = window.scrollY || window.pageYOffset || 0;
    data.forEach(function (d) {
      d.el.style.transform = 'translateY(' + (scrolled * 0.5) + 'px) rotate(' + d.rot + 'deg)';
    });
  });
})();


