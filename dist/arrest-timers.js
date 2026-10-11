export const PULSE_INTERVAL=120;
export const PULSE_WARNING=15;
export const EPI_WARNING=30;
export function remainingSeconds(deadline,interval,now=Date.now()){
  return Number.isFinite(deadline)&&deadline>0?Math.max(0,Math.min(interval,Math.ceil((deadline-now)/1000))):interval;
}
export function timerPhase(deadline,interval,warning,now=Date.now()){
  if(!Number.isFinite(deadline)||deadline<=0)return 'idle';
  const seconds=remainingSeconds(deadline,interval,now);
  return seconds===0?'due':seconds<=warning?'warning':'running';
}
const digits=s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
export function pulseStatus(state){const phase=timerPhase(state.pulseDueAt,PULSE_INTERVAL,PULSE_WARNING);return phase==='idle'?'Ready for a 2-minute CPR cycle':phase==='due'?'RHYTHM / PULSE CHECK DUE':phase==='warning'?'PRE-CHARGE DEFIB NOW':'CPR cycle in progress';}
export function pulsePanel(state,icon,source){const phase=timerPhase(state.pulseDueAt,PULSE_INTERVAL,PULSE_WARNING);return `<section class="pulse-panel ${phase}" aria-labelledby="pulse-title"><div class="pulse-heading"><h2 id="pulse-title">${icon('clock')} Pulse check timer</h2>${source('CPR CYCLES · SB204',51)}</div><div class="pulse-body"><div><div class="pulse-digits" role="timer" aria-label="Time until rhythm and pulse check">${digits(remainingSeconds(state.pulseDueAt,PULSE_INTERVAL))}</div><p class="pulse-status" role="status" aria-live="polite">${pulseStatus(state)}</p></div><div class="pulse-controls"><button class="button pulse-start" data-action="pulse-cycle">${phase==='idle'?'Start CPR · 2 min':'Check done · restart 2 min'}</button><button class="button" data-action="clear-pulse" ${phase==='idle'?'disabled':''}>Clear timer</button></div></div><div class="pulse-precharge"><strong>PRE-CHARGE DEFIB BEFORE THE CHECK</strong><span>Keep compressions going while charging. Confirm a shockable rhythm and clear everyone before a shock; disarm if no shock is indicated.</span></div><p class="pulse-note">Ding at 15 seconds remaining. Start the next cycle when CPR resumes; the timer holds at 00:00 until restarted.</p></section>`;}
export function refreshPulseTimer(state){const panel=document.querySelector('.pulse-panel');if(!panel)return;panel.querySelector('.pulse-digits').textContent=digits(remainingSeconds(state.pulseDueAt,PULSE_INTERVAL));const label=panel.querySelector('.pulse-status'),status=pulseStatus(state);if(label.textContent!==status)label.textContent=status;for(const phase of ['warning','due'])panel.classList.toggle(phase,timerPhase(state.pulseDueAt,PULSE_INTERVAL,PULSE_WARNING)===phase);}
// Context is created/resumed from a user gesture so browser autoplay rules are respected.
export function createTimerAudio(onChange=()=>{}){
  let context=null,queueUntil=0;
  const ready=()=>context?.state==='running';
  async function unlock(){try{const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Audio)return false;context??=new Audio();if(context.state==='suspended')await context.resume();onChange();return ready();}catch{return false;}}
  function play(kind){if(!ready())return false;try{
    const base=Math.max(context.currentTime+.02,queueUntil),pulse=kind==='pulse';
    const starts=pulse?[0,.5,.95]:[0,.6,1.2],duration=pulse?.65:.5;
    starts.forEach(offset=>{
      const at=base+offset,osc=context.createOscillator(),gain=context.createGain();
      osc.type='sine';osc.frequency.setValueAtTime(pulse?1046.5:130.81,at);
      gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(pulse?.22:.3,at+.025);
      if(!pulse)gain.gain.exponentialRampToValueAtTime(.12,at+.18);
      gain.gain.exponentialRampToValueAtTime(.0001,at+duration);osc.connect(gain);gain.connect(context.destination);osc.start(at);osc.stop(at+duration+.02);
      if(pulse){const overtone=context.createOscillator(),bell=context.createGain();overtone.type='sine';overtone.frequency.setValueAtTime(2093,at);bell.gain.setValueAtTime(.07,at);bell.gain.exponentialRampToValueAtTime(.0001,at+.3);overtone.connect(bell);bell.connect(context.destination);overtone.start(at);overtone.stop(at+.32);}
    });queueUntil=base+starts.at(-1)+duration+.25;return true;
  }catch{onChange();return false;}}
  function stop(){if(context){const old=context;context=null;queueUntil=0;old.close().catch(()=>{});}onChange();}
  return {unlock,play,ready,stop};
}
export function processTimerAlerts(state,audio,save,now=Date.now()){
  for(const [kind,deadline,interval,warning] of [['pulse',state.pulseDueAt,PULSE_INTERVAL,PULSE_WARNING],['epi',state.epiDueAt,Number(state.epiInterval)*60||300,EPI_WARNING]]){
    const phase=timerPhase(deadline,interval,warning,now);if(!['warning','due'].includes(phase))continue;
    const key=`${kind}-${phase}`,alerts=state.timerAlerts||{};if(alerts[key]===deadline)continue;
    if(state.timerSound!==false&&!audio.play(kind))continue;
    state.timerAlerts??={};state.timerAlerts[key]=deadline;
    // A late tick goes directly to the due cue, without replaying an obsolete warning.
    if(phase==='due')state.timerAlerts[`${kind}-warning`]=deadline;
    save();
  }
}
export function clearTimerAlerts(state,kind){state.timerAlerts??={};delete state.timerAlerts[`${kind}-warning`];delete state.timerAlerts[`${kind}-due`];}
