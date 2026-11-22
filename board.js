// Step 2: each pad now plays its own soft tap sound.
(function () {
  var colors = ['#ff6b8b', '#ffa94d', '#ffe066', '#69db7c', '#4dabf7', '#b197fc'];
  // one note per pad (a little pentatonic scale, so it always sounds nice)
  var freqs = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25];
  var board = document.getElementById('board');
  var ctx = null;

  // The audio context is made on the first tap, because browsers want a gesture first
  function getCtx() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // A soft tap: a short sine blip that drops in pitch and fades out quickly
  function tap(i) {
    var c = getCtx();
    if (!c) return;
    var t = c.currentTime;
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freqs[i], t);
    osc.frequency.exponentialRampToValueAtTime(freqs[i] * 0.7, t + 0.18);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.3, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t);
    osc.stop(t + 0.22);
  }

  function hit(pad, i) {
    tap(i);
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
      hit(pad, i);
    });
    // keyboard: Enter or Space
    pad.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!e.repeat) hit(pad, i); }
    });
    board.appendChild(pad);
  });
})();
