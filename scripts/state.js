/* ---------- State ---------- */
const state = {
  profile: { nickname:"", id:"", registeredAt:0, lastLoginDay:0, loginDays:[] },
  stats: { games:0, best:0, bestRun:0, totalScore:0, totalTimeMs:0, lines:0, bestCombo:0, placedTotal:0, xp:0 },
  settings: { lang:"uk", sound:true, vibration:true, theme:"dark" },
  achievements: new Set(), // ids
  hidden: { firstPlace:false, tripleClear:false, quadClear:false, speedrun:false, pacifist:false, survivor:false, cleaner:false },
  dailyTasks: { date:"", tasks:[] },
  leaderboards: [], // simulated global pool
  // live, not persisted
  run: null,
};

/* ---------- XP / Level ---------- */
function levelInfo(totalXp){
  // levels grow: need(level) = 80 + level*40
  let lvl = 1, remaining = totalXp;
  while(true){
    const need = 80 + (lvl-1)*40;
    if(remaining < need) return { lvl, into: remaining, need };
    remaining -= need;
    lvl++;
    if(lvl > 999) return { lvl, into: 0, need: 80 + (lvl-1)*40 };
  }
}
function addXP(n){
  const before = levelInfo(state.stats.xp).lvl;
  state.stats.xp = (state.stats.xp||0) + n;
  const after = levelInfo(state.stats.xp).lvl;
  if(after > before){
    toast(t("toast.lvlup",{n:after}), "success");
    beep(900,200,"triangle"); vibrate(30);
  }
}

