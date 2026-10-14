// Separate from the encounter event timer and arrest countdowns.
const timer = state => state.stopwatch ??= {elapsed:0,started:null};
const elapsed = sw => Math.max(0, sw.elapsed + (sw.started === null ? 0 : Date.now() - sw.started));
function timeText(ms) {
  const tenths = Math.floor(ms / 100);
  const seconds = Math.floor(tenths / 10);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  return `${hours ? `${hours}:` : ''}${String(minutes % 60).padStart(2,'0')}:${String(seconds % 60).padStart(2,'0')}.${tenths % 10}`;
}
function status(sw) {
  return sw.started !== null ? 'Running' : sw.elapsed > 0 ? 'Stopped' : 'Ready';
}
export function stopwatchPage(state, icon) {
  const sw = timer(state), running = sw.started !== null;
  return `<main class="stopwatch-screen ${running?'is-running':''}" aria-label="Stopwatch">
    <div class="stopwatch-toolbar"><button class="stopwatch-back" data-page="home">← Back</button><h1>Stopwatch</h1><button class="stopwatch-reset" data-stopwatch="reset" ${running||sw.elapsed===0?'disabled':''}>${icon('reset')} Reset</button></div>
    <button class="stopwatch-pad" data-stopwatch="toggle" aria-label="${running?'Stop stopwatch':sw.elapsed>0?'Resume stopwatch':'Start stopwatch'}">
      <span class="stopwatch-state">${status(sw)}</span>
      <span class="stopwatch-time ${elapsed(sw)>=3600000?'has-hours':''}" role="timer" aria-live="off">${timeText(elapsed(sw))}</span>
      <span class="stopwatch-action">${running?'Tap to stop':sw.elapsed>0?'Tap to resume':'Tap to start'}</span>
      <span class="stopwatch-hint">Anywhere in this area</span>
    </button>
    <span class="stopwatch-announcement" role="status" aria-live="polite"></span>
  </main>`;
}
export function bindStopwatch(getState, save) {
  document.addEventListener('click', e => {
    const button = e.target.closest('[data-stopwatch]');
    if (!button || button.disabled) return;
    const sw = timer(getState());
    if (button.dataset.stopwatch === 'reset') {
      if (sw.started !== null) return;
      sw.elapsed = 0;
    } else if (sw.started !== null) {
      sw.elapsed = elapsed(sw);
      sw.started = null;
    } else {
      sw.started = Date.now();
    }
    save();
    const screen = document.querySelector('.stopwatch-screen');
    const running = sw.started !== null;
    screen.classList.toggle('is-running', running);
    screen.querySelector('.stopwatch-state').textContent = status(sw);
    screen.querySelector('.stopwatch-action').textContent = running?'Tap to stop':sw.elapsed>0?'Tap to resume':'Tap to start';
    screen.querySelector('.stopwatch-pad').setAttribute('aria-label',running?'Stop stopwatch':sw.elapsed>0?'Resume stopwatch':'Start stopwatch');
    screen.querySelector('.stopwatch-reset').disabled = running || sw.elapsed === 0;
    screen.querySelector('.stopwatch-announcement').textContent = running?'Stopwatch running':sw.elapsed>0?`Stopped at ${timeText(sw.elapsed)}`:'Stopwatch reset';
    refresh();
  });
  function refresh() {
    const digits = document.querySelector('.stopwatch-time');
    if (!digits) return;
    const ms = elapsed(timer(getState()));
    digits.textContent = timeText(ms);
    digits.classList.toggle('has-hours',ms>=3600000);
  }
  // Calculate from timestamps, so background throttling never drops elapsed time.
  setInterval(refresh,50);
}
