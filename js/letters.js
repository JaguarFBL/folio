(function () {
  var container = document.getElementById('stickers-container');
  if (!container) return;

  var terms = ['HTML','CSS','JS','UI','UX','API','DOM','Sass','Git','Node','React','Vue','Linux','SQL','REST','Figma','Python','Ruby','Go','Rust','PHP','Java','C#','Swift','Kotlin','Docker','AWS','GitHub','VSCode','Webpack','Vite','ES6','TS','Svelte','Next','Nuxt','Mongo','Redis','Nginx','Yarn','npm','Bash','Zsh','WebGL','Canvas','SVG','JSON','XML','YAML','Markdown','SEO','CMS','JWT','OAuth','SSG','SSR','PWA','SPA','CLI','IDE','CDN','DNS','HTTP','HTTPS','FTP','TCP','IP','GPU','CPU','RAM','SSD','BIOS','Kernel','Shell','Stack','Grid','Flex','Anim','Key','Map','Set','Weak','Proxy','Cache','Stream','Build','Deploy','Lint','Test','Debug','Merge','Push','Pull','Fork','Clone','Issue','PR','CI','CD'];

  var items = [];
  var dragged = null;
  var GRAVITY = 0.15;
  var FRICTION = 0.94;
  var CURSOR_RADIUS = 140;
  var REPULSION = 1.0;
  var GAP = 3;
  var lastCX = 0, lastCY = 0;
  var cursorVX = 0, cursorVY = 0;
  var dragOffsetX = 0, dragOffsetY = 0;

  function shuffle(a) {
    var b = a.slice();
    for (var i = b.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = b[i]; b[i] = b[j]; b[j] = tmp;
    }
    return b;
  }

  function getHero() {
    return document.querySelector('.hero');
  }

  function heroH() {
    var h = getHero();
    return h ? h.offsetHeight : window.innerHeight;
  }

  function heroW() {
    var h = getHero();
    return h ? h.offsetWidth : window.innerWidth;
  }

  function overlaps(a, b) {
    return a.x < b.x + b.w + GAP && a.x + a.w + GAP > b.x &&
           a.y < b.y + b.h + GAP && a.y + a.h + GAP > b.y;
  }

  var isMobile = window.innerWidth < 768;
  var forced = ['Dua Lipa', 'Pac-Man', 'Spotify', 'opencode'];
  var randomCount = isMobile ? 6 + Math.floor(Math.random() * 4) : 20 + Math.floor(Math.random() * 10);
  var selected = forced.concat(shuffle(terms).slice(0, randomCount));

  selected.forEach(function (word, i) {
    var el = document.createElement('span');
    el.className = 'sticker';
    el.textContent = word;
    var size = isMobile ? 1.2 : 1.6;
    var rot = (Math.random() * 30 - 15).toFixed(1);
    el.setAttribute('data-rotate', rot);
    el.style.left = (Math.random() * 88 + 2) + '%';
    el.style.fontSize = size + 'rem';
    container.appendChild(el);

    items.push({
      el: el,
      x: el.offsetLeft,
      y: -120 - Math.random() * 800 - i * 6,
      vx: (Math.random() - 0.5) * 0.5,
      vy: 0.3 + Math.random() * 0.7,
      w: el.offsetWidth,
      h: el.offsetHeight,
      rot: rot,
      delay: Math.random() * 3
    });
  });

  var startTime = performance.now();

  function startDrag(clientX, clientY, el) {
    for (var i = 0; i < items.length; i++) {
      if (items[i].el === el) {
        dragged = items[i];
        dragOffsetX = clientX - dragged.x;
        dragOffsetY = clientY - dragged.y;
        dragged.el.style.zIndex = 100;
        lastCX = clientX;
        lastCY = clientY;
        cursorVX = 0;
        cursorVY = 0;
        break;
      }
    }
  }

  function moveDrag(clientX, clientY) {
    if (!dragged) return;
    cursorVX = clientX - lastCX;
    cursorVY = clientY - lastCY;
    lastCX = clientX;
    lastCY = clientY;
  }

  function endDrag() {
    if (!dragged) return;
    dragged.vx = cursorVX * 0.7;
    dragged.vy = cursorVY * 0.7;
    dragged.el.style.zIndex = '';
    dragged = null;
  }

  // mouse drag (document-level to catch stickers + cassette)
  document.addEventListener('mousedown', function (e) {
    var el = e.target.closest('.sticker, .cassette');
    if (el) startDrag(e.clientX, e.clientY, el);
  });
  document.addEventListener('mousemove', function (e) { moveDrag(e.clientX, e.clientY); });
  document.addEventListener('mouseup', endDrag);

  // touch drag
  document.addEventListener('touchstart', function (e) {
    var touch = e.touches[0];
    var el = document.elementFromPoint(touch.clientX, touch.clientY);
    if (el && el.closest) el = el.closest('.sticker, .cassette');
    if (el) { startDrag(touch.clientX, touch.clientY, el); }
  }, { passive: true });
  document.addEventListener('touchmove', function (e) {
    var touch = e.touches[0];
    moveDrag(touch.clientX, touch.clientY);
  }, { passive: true });
  document.addEventListener('touchend', endDrag);

  function resolveCollisions() {
    for (var iter = 0; iter < 4; iter++) {
      var anyOverlap = false;
      for (var i = 0; i < items.length; i++) {
        for (var j = i + 1; j < items.length; j++) {
          var a = items[i];
          var b = items[j];
          if (a === dragged || b === dragged) continue;
          if (a.noCollide || b.noCollide) continue;
          if (!overlaps(a, b)) continue;
          anyOverlap = true;

          var ax = a.x + a.w / 2;
          var ay = a.y + a.h / 2;
          var bx = b.x + b.w / 2;
          var by = b.y + b.h / 2;
          var dx = bx - ax;
          var dy = by - ay;
          var d = Math.sqrt(dx * dx + dy * dy) || 1;

          var overlapX = Math.min(a.x + a.w + GAP, b.x + b.w + GAP) - Math.max(a.x, b.x);
          var overlapY = Math.min(a.y + a.h + GAP, b.y + b.h + GAP) - Math.max(a.y, b.y);

          var pushX = 0, pushY = 0;

          if (overlapX < overlapY) {
            pushX = overlapX * 0.5 * (dx > 0 ? 1 : -1);
          } else {
            pushY = overlapY * 0.5 * (dy > 0 ? 1 : -1);
            if ((a.vy > 0 || b.vy > 0) && dy > 0) pushY = 0;
          }

          a.x -= pushX; a.y -= pushY;
          b.x += pushX; b.y += pushY;
          a.vx -= pushX * 0.08; a.vy -= pushY * 0.08;
          b.vx += pushX * 0.08; b.vy += pushY * 0.08;
        }
      }
      if (!anyOverlap) break;
    }
  }

  function constrain() {
    var hh = heroH();
    var hw = heroW();
    items.forEach(function (l) {
      if (l === dragged) return;
      if (l.x < 0) { l.x = 0; l.vx *= -0.3; }
      if (l.x + l.w > hw) { l.x = hw - l.w; l.vx *= -0.3; }
      if (l.y < 0) { l.y = 0; l.vy *= -0.3; }
      if (l.y + l.h > hh) { l.y = hh - l.h; l.vy *= -0.3; l.vy = Math.min(l.vy, 0); l.vx *= 0.9; }
    });
  }

  function update() {
    var now = performance.now();
    var scrollY = window.scrollY || window.pageYOffset || 0;
    var hh = heroH();
    var hw = heroW();
    var cx = window.__cursorX || -9999;
    var cy = window.__cursorY || -9999;

    items.forEach(function (l) {
      if (l === dragged) {
        l.x = cx - dragOffsetX;
        l.y = cy - dragOffsetY;
        if (l.x < 0) l.x = 0;
        if (l.x + l.w > hw) l.x = hw - l.w;
        if (l.y < 0) l.y = 0;
        if (l.y + l.h > hh) l.y = hh - l.h;
        l.el.style.top = l.y + 'px';
        l.el.style.left = l.x + 'px';
        l.el.style.transform = 'rotate(' + l.rot + 'deg)';
        return;
      }

      if ((now - startTime) / 1000 < l.delay) {
        l.el.style.top = l.y + 'px';
        l.el.style.transform = 'rotate(' + l.rot + 'deg)';
        return;
      }

      var dx = l.x + l.w / 2 - cx;
      var dy = l.y + l.h / 2 - cy;
      var dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < CURSOR_RADIUS && dist > 1) {
        var force = (CURSOR_RADIUS - dist) / CURSOR_RADIUS * REPULSION;
        l.vx += dx / dist * force * 1.5;
        l.vy += dy / dist * force * 0.8;
      }

      l.vy += GRAVITY;
      l.vx *= FRICTION;
      l.vy *= FRICTION;
      l.x += l.vx;
      l.y += l.vy;
    });

    resolveCollisions();
    constrain();

    items.forEach(function (l) {
      if (l === dragged) return;
      l.el.style.top = l.y + 'px';
      l.el.style.left = l.x + 'px';
      l.el.style.transform = 'rotate(' + l.rot + 'deg)';
    });

    requestAnimationFrame(update);
  }

  // reposition stickers on resize/orientation change
  var lastW = heroW(), lastH = heroH();
  window.addEventListener('resize', function () {
    var hw = heroW(), hh = heroH();
    if (hw === lastW && hh === lastH) return;
    var sx = hw / lastW, sy = hh / lastH;
    items.forEach(function (l) {
      l.x *= sx; l.y *= sy;
    });
    lastW = hw; lastH = hh;
  });

  requestAnimationFrame(update);
})();
