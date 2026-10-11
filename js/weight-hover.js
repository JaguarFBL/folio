// WEIGHT HOVER (portage vanille du composant Originkit VariableFontHoverByLetter)
(function () {
  var label = document.getElementById('weight-hover-label');
  if (!label) return;

  // PARAMÈTRES — FROM/TO documentent les graisses, l'état réel vit dans le CSS
  var FROM = 400;
  var TO = 700;
  var STAGGER_MS = 30;

  var text = (label.textContent || '').trim();
  if (!text) return;

  // ORDRE ALÉATOIRE — mélange Fisher-Yates des indices de lettres
  var indices = [];
  var i;
  for (i = 0; i < text.length; i++) indices.push(i);
  for (i = indices.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var swap = indices[i];
    indices[i] = indices[j];
    indices[j] = swap;
  }

  // CONSTRUCTION — span sr pour l'accessibilité + une span par lettre
  var fragment = document.createDocumentFragment();

  var sr = document.createElement('span');
  sr.className = 'weight-hover-sr';
  sr.textContent = text;
  fragment.appendChild(sr);

  for (var n = 0; n < text.length; n++) {
    var letter = document.createElement('span');
    letter.className = 'weight-hover-letter';
    letter.setAttribute('aria-hidden', 'true');
    letter.textContent = text.charAt(n);
    letter.style.setProperty('--d', (indices[n] * STAGGER_MS) + 'ms');
    fragment.appendChild(letter);
  }

  label.textContent = '';
  label.appendChild(fragment);
})();
