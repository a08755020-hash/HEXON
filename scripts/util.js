/* ---------- Util ---------- */
const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);
function genId(){
  return "HX-" + Math.random().toString(36).slice(2,7).toUpperCase()
       + "-" + Math.random().toString(36).slice(2,7).toUpperCase();
}
function todayKey(){
  const d = new Date();
  return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
}
function fmtTime(ms){
  const s = Math.floor(ms/1000);
  const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60;
  if(h>0) return h+"h "+m+"m";
  if(m>0) return m+"m "+sec+"s";
  return sec+"s";
}
function clamp(n,a,b){return Math.max(a,Math.min(b,n))}

/* deterministic RNG */
function mulberry32(seed){
  return function(){
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function hashStr(s){
  let h = 2166136261 >>> 0;
  for(let i=0;i<s.length;i++){
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/* haptic + sound */
let audioCtx = null;
function ensureAudio(){
  if(!audioCtx){
    try{ audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }catch{}
  }
}
function beep(freq, dur, type){
  if(!state.settings.sound) return;
  ensureAudio();
  if(!audioCtx) return;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = type || "sine";
  o.frequency.value = freq;
  g.gain.value = 0;
  o.connect(g); g.connect(audioCtx.destination);
  const now = audioCtx.currentTime;
  g.gain.linearRampToValueAtTime(0.06, now+0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, now + (dur/1000));
  o.start(now); o.stop(now + dur/1000 + 0.02);
}
function vibrate(p){ if(state.settings.vibration && navigator.vibrate) navigator.vibrate(p); }

/* ---------- Toast ---------- */
function toast(msg, kind){
  const stack = $("#toast-stack");
  const el = document.createElement("div");
  el.className = "toast " + (kind || "info");
  el.innerHTML = '<svg class="ic-svg"><use href="#i-'+(kind==="success"?"check":"bolt")+'"/></svg><span></span>';
  el.querySelector("span").textContent = msg;
  stack.appendChild(el);
  setTimeout(()=>{ el.style.transition="opacity .25s, transform .25s"; el.style.opacity="0"; el.style.transform="translateY(8px)"; }, 1800);
  setTimeout(()=> el.remove(), 2200);
}

