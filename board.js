// Step 4: the beat speed can be adjusted with a slider.
(function () {
  var colors = ['#ff6b8b', '#ffa94d', '#ffe066', '#69db7c', '#4dabf7', '#b197fc'];
  var freqs = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25];
  var STEPS = 8;
  var board = document.getElementById('board');
  var gridEl = document.getElementById('grid');
  var dotsEl = document.getElementById('dots');
  var playBtn = document.getElementById('play');
  var speedEl = document.getElementById('speed');
  var bpmOut = document.getElementById('bpmout');
  var ctx = null;
  var bpm = 110;

  // slider changes the tempo right away, even while looping
  speedEl.addEventListener('input', function () {
    bpm = Number(speedEl.value);
    bpmOut.textContent = bpm + ' BPM';
  });

  function getCtx() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tap(i, when) {
    var c = getCtx();
    if (!c) return;
    var t = when || c.currentTime;
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

  var pads = [];
  function flash(i) {
    var pad = pads[i];
    pad.classList.add('hit');
    setTimeout(function () { pad.classList.remove('hit'); }, 140);
  }
  function hit(i) { tap(i); flash(i); }

  colors.forEach(function (color, i) {
    var pad = document.createElement('button');
    pad.className = 'pad';
    pad.type = 'button';
    pad.style.setProperty('--c', color);
    pad.setAttribute('aria-label', 'Pad ' + (i + 1));
    pad.textContent = i + 1; // numbers link pads to grid rows
    pad.addEventListener('pointerdown', function (e) { e.preventDefault(); hit(i); });
    pad.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!e.repeat) hit(i); }
    });
    board.appendChild(pad);
    pads.push(pad);
  });

  // Grid is laid out with columns as pads, steps as rows going down? No: steps
  // run across, so each step column holds 6 small cells. Compact so it fits.
  var pattern = [], cells = [];
  for (var r = 0; r < colors.length; r++) { pattern.push([]); cells.push([]); }
  for (var r2 = 0; r2 < colors.length; r2++) {
    for (var s = 0; s < STEPS; s++) {
      pattern[r2].push(false);
      (function (r, s) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'cell';
        b.style.setProperty('--c', colors[r]);
        b.setAttribute('aria-label', 'Pad ' + (r + 1) + ' step ' + (s + 1));
        b.setAttribute('aria-pressed', 'false');
        b.addEventListener('click', function () {
          pattern[r][s] = !pattern[r][s];
          b.classList.toggle('on', pattern[r][s]);
          b.setAttribute('aria-pressed', String(pattern[r][s]));
        });
        gridEl.appendChild(b);
        cells[r].push(b);
      })(r2, s);
    }
  }
  // playhead dots under the grid, one per step
  var dots = [];
  for (var d = 0; d < STEPS; d++) {
    var dot = document.createElement('span');
    dotsEl.appendChild(dot);
    dots.push(dot);
  }
  [[0,0],[0,4],[3,2],[3,6],[5,7],[4,5]].forEach(function (p) {
    pattern[p[0]][p[1]] = true;
    cells[p[0]][p[1]].classList.add('on');
    cells[p[0]][p[1]].setAttribute('aria-pressed', 'true');
  });

  var playing = false, step = 0, nextTime = 0, timer = null;
  var shown = -1;

  function showStep(s) {
    for (var r = 0; r < colors.length; r++) {
      if (shown >= 0) cells[r][shown].classList.remove('now');
      if (s >= 0) cells[r][s].classList.add('now');
    }
    if (shown >= 0) dots[shown].classList.remove('now');
    if (s >= 0) dots[s].classList.add('now');
    shown = s;
  }

  function schedule() {
    var c = ctx;
    while (nextTime < c.currentTime + 0.15) {
      var s = step, when = nextTime;
      var delay = Math.max(0, (when - c.currentTime) * 1000);
      for (var r = 0; r < colors.length; r++) {
        if (pattern[r][s]) {
          tap(r, when);
          (function (r) {
            setTimeout(function () { if (playing) flash(r); }, delay);
          })(r);
        }
      }
      setTimeout(function () { if (playing) showStep(s); }, delay);
      nextTime += 60 / bpm / 2; // eighth notes, uses the current speed
      step = (step + 1) % STEPS;
    }
  }

  function start() {
    var c = getCtx();
    if (!c) return;
    playing = true;
    step = 0;
    nextTime = c.currentTime + 0.05;
    timer = setInterval(schedule, 40);
    playBtn.textContent = 'Stop';
  }
  function stop() {
    playing = false;
    clearInterval(timer);
    showStep(-1);
    playBtn.textContent = 'Play beat';
  }
  playBtn.addEventListener('click', function () { if (playing) stop(); else start(); });
})();
