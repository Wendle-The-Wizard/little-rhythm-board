// Step 1: draw a row of pads and make them light up when tapped.
(function () {
  var colors = ['#ff6b8b', '#ffa94d', '#ffe066', '#69db7c', '#4dabf7', '#b197fc'];
  var board = document.getElementById('board');

  // Light a pad up for a moment (sound comes in step 2!)
  function hit(pad) {
    pad.classList.add('hit');
    setTimeout(function () { pad.classList.remove('hit'); }, 140);
  }

  colors.forEach(function (color, i) {
    var pad = document.createElement('button');
    pad.className = 'pad';
    pad.style.setProperty('--c', color);
    pad.setAttribute('aria-label', 'Pad ' + (i + 1));
    // pointerdown feels quicker than click on phones
    pad.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      hit(pad);
    });
    // keyboard: Enter/Space produce click with no pointer
    pad.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); hit(pad); }
    });
    board.appendChild(pad);
  });
})();
