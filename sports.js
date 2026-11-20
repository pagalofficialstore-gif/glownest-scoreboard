/* ============================================================
   Sport-specific control panel sections
   ============================================================ */

/* ---------------- CRICKET ---------------- */
function cricketControlsHtml(){
  const c = MATCH.cricket;
  const battingTeam = c.battingTeam==='A' ? MATCH.teamA : MATCH.teamB;
  const bowlingTeamLetter = c.battingTeam==='A' ? 'B' : 'A';
  const score = c.battingTeam==='A' ? c.scoreA : c.scoreB;
  const otherScore = c.battingTeam==='A' ? c.scoreB : c.scoreA;
  return `
  <div class="card">
    <h3>🏏 Cricket — Innings ${c.innings}</h3>
    <div class="row" style="margin-bottom:12px;">
      <div class="pill-switch" style="max-width:260px;">
        <button data-bat="A" class="${c.battingTeam==='A'?'active':''}">${escapeHtml(MATCH.teamA.short)} batting</button>
        <button data-bat="B" class="${c.battingTeam==='B'?'active':''}">${escapeHtml(MATCH.teamB.short)} batting</button>
      </div>
    </div>
    <div class="score-display">
      <div><div class="num">${score.runs}/${score.wickets}</div></div>
      <div class="sep">·</div>
      <div><div class="num" style="font-size:28px;">${score.overs}.${score.balls}</div><div class="note" style="text-align:center;">overs</div></div>
    </div>
    ${c.innings===2 && c.target!=null ? `<p class="note" style="text-align:center;">Target: <b>${c.target}</b> &nbsp;·&nbsp; Need <b>${Math.max(0,c.target-score.runs)}</b> more runs to win</p>` : ''}
    <div class="grid2">
      <div class="field"><label>Striker</label><div class="row"><input type="text" id="strikerName" value="${escapeHtml(c.striker.name)}" style="flex:1;"><span class="note">${c.striker.runs} (${c.striker.balls})</span></div></div>
      <div class="field"><label>Non-striker</label><div class="row"><input type="text" id="nonStrikerName" value="${escapeHtml(c.nonStriker.name)}" style="flex:1;"><span class="note">${c.nonStriker.runs} (${c.nonStriker.balls})</span></div></div>
    </div>
    <div class="field"><label>Bowler</label><div class="row"><input type="text" id="bowlerName" value="${escapeHtml(c.bowler.name)}" style="flex:1;"><span class="note">${c.bowler.overs}.${c.bowler.balls} ov, ${c.bowler.runs} runs, ${c.bowler.wickets} wkt</span></div></div>

    <h3 style="margin-top:18px;">Ball outcome</h3>
    <div class="btn-grid">
      <button class="btn big" data-run="0">0</button>
      <button class="btn big" data-run="1">1</button>
      <button class="btn big" data-run="2">2</button>
      <button class="btn big" data-run="3">3</button>
      <button class="btn big" data-run="4" style="background:var(--pos);">4</button>
      <button class="btn big" data-run="6" style="background:#1f6feb;">6</button>
    </div>
    <div class="row" style="margin-top:10px;">
      <button class="btn secondary" data-extra="wide">Wide (+1)</button>
      <button class="btn secondary" data-extra="noball">No Ball (+1)</button>
      <button class="btn secondary" data-extra="bye">Bye</button>
      <button class="btn secondary" data-extra="legbye">Leg Bye</button>
      <button class="btn danger" id="wicketBtn">Wicket</button>
    </div>
    <div class="row" style="margin-top:14px;">
      <button class="btn secondary small" id="swapStrikeBtn">⇄ Swap Strike</button>
      <button class="btn secondary small" id="undoBallBtn">Undo last ball</button>
      <button class="btn secondary small" id="newOverBtn">New Over / Change Bowler</button>
      <button class="btn danger small" id="endInningsBtn">End Innings</button>
    </div>
    <h3 style="margin-top:18px;">Manual correction</h3>
    <div class="grid2">
      <div class="field"><label>${escapeHtml(MATCH.teamA.short)} runs/wkts/overs.balls/extras</label>
        <div class="row">
          <input type="number" id="manARuns" value="${c.scoreA.runs}" style="width:70px;">
          <input type="number" id="manAWkts" value="${c.scoreA.wickets}" style="width:55px;">
          <input type="number" id="manAOvers" value="${c.scoreA.overs}" style="width:55px;">
          <input type="number" id="manABalls" value="${c.scoreA.balls}" style="width:55px;">
          <input type="number" id="manAExtras" value="${c.scoreA.extras}" style="width:55px;">
        </div>
      </div>
      <div class="field"><label>${escapeHtml(MATCH.teamB.short)} runs/wkts/overs.balls/extras</label>
        <div class="row">
          <input type="number" id="manBRuns" value="${c.scoreB.runs}" style="width:70px;">
          <input type="number" id="manBWkts" value="${c.scoreB.wickets}" style="width:55px;">
          <input type="number" id="manBOvers" value="${c.scoreB.overs}" style="width:55px;">
          <input type="number" id="manBBalls" value="${c.scoreB.balls}" style="width:55px;">
          <input type="number" id="manBExtras" value="${c.scoreB.extras}" style="width:55px;">
        </div>
      </div>
    </div>
    <button class="btn secondary small" id="applyManualBtn">Apply manual values</button>
  </div>`;
}
let ballHistory = [];
function cricketAddBall(runs, extraType, isWicket){
  const c = MATCH.cricket;
  const scoreKey = c.battingTeam==='A' ? 'scoreA' : 'scoreB';
  const sc = c[scoreKey];
  const snapshot = JSON.parse(JSON.stringify(c));
  ballHistory.push(snapshot);
  if(ballHistory.length>60) ballHistory.shift();

  let runsAdded = runs||0;
  if(extraType==='wide' || extraType==='noball'){
    sc.extras += 1; sc.runs += 1 + (runs||0);
    c.bowler.runs += 1 + (runs||0);
    if(runs) c.striker.runs += runs;
  } else if(extraType==='bye' || extraType==='legbye'){
    sc.extras += (runs||1); sc.runs += (runs||1);
    // byes/leg byes are not charged against the bowler
  } else {
    sc.runs += runsAdded;
    c.striker.runs += runsAdded;
    c.bowler.runs += runsAdded;
  }
  if(isWicket){
    sc.wickets = clamp(sc.wickets+1,0,10);
    c.bowler.wickets += 1;
  }
  if(!extraType || extraType==='bye' || extraType==='legbye' || isWicket){
    c.striker.balls += 1;
    c.bowler.balls += 1;
    if(c.bowler.balls>=6){ c.bowler.balls=0; c.bowler.overs+=1; }
    sc.balls += 1;
    if(sc.balls>=6){ sc.balls=0; sc.overs+=1; }
  }
  if(!extraType && !isWicket){
    if(runsAdded%2===1){ swapStrike(); }
  }
  if(isWicket){
    c.striker = {name:'New Batsman', runs:0, balls:0};
  }
  schedulePush(); renderMain();
}
function swapStrike(){
  const c = MATCH.cricket;
  const t = c.striker; c.striker = c.nonStriker; c.nonStriker = t;
}
function bindCricketControls(){
  const c = MATCH.cricket;
  document.querySelectorAll('[data-bat]').forEach(b=>b.onclick=()=>{
    c.battingTeam = b.dataset.bat; renderMain(); schedulePush();
  });
  document.getElementById('strikerName').oninput = e=>{ c.striker.name = e.target.value; schedulePush(); };
  document.getElementById('nonStrikerName').oninput = e=>{ c.nonStriker.name = e.target.value; schedulePush(); };
  document.getElementById('bowlerName').oninput = e=>{ c.bowler.name = e.target.value; schedulePush(); };
  document.querySelectorAll('[data-run]').forEach(b=>b.onclick=()=>cricketAddBall(parseInt(b.dataset.run,10), null, false));
  document.querySelectorAll('[data-extra]').forEach(b=>b.onclick=()=>cricketAddBall(0, b.dataset.extra, false));
  document.getElementById('wicketBtn').onclick = ()=>cricketAddBall(0, null, true);
  document.getElementById('swapStrikeBtn').onclick = ()=>{ swapStrike(); renderMain(); schedulePush(); };
  document.getElementById('undoBallBtn').onclick = ()=>{
    if(!ballHistory.length){ toast('Nothing to undo'); return; }
    MATCH.cricket = ballHistory.pop(); renderMain(); schedulePush();
  };
  document.getElementById('newOverBtn').onclick = ()=>{
    c.bowler = {name:'New Bowler', overs:0, balls:0, runs:0, wickets:0};
    renderMain(); schedulePush();
  };
  document.getElementById('endInningsBtn').onclick = ()=>{
    if(!confirm('End current innings and start innings 2?')) return;
    const battingScore = c.battingTeam==='A' ? c.scoreA.runs : c.scoreB.runs;
    c.innings = 2;
    c.target = battingScore + 1;
    c.battingTeam = c.battingTeam==='A' ? 'B' : 'A';
    c.striker = {name:'Batsman 1',runs:0,balls:0};
    c.nonStriker = {name:'Batsman 2',runs:0,balls:0};
    c.bowler = {name:'Bowler',overs:0,balls:0,runs:0,wickets:0};
    renderMain(); schedulePush(); toast('Innings 2 started — target '+c.target);
  };
  document.getElementById('applyManualBtn').onclick = ()=>{
    const g = id=>parseInt(document.getElementById(id).value,10)||0;
    c.scoreA = {runs:g('manARuns'), wickets:g('manAWkts'), overs:g('manAOvers'), balls:g('manABalls'), extras:g('manAExtras')};
    c.scoreB = {runs:g('manBRuns'), wickets:g('manBWkts'), overs:g('manBOvers'), balls:g('manBBalls'), extras:g('manBExtras')};
    renderMain(); schedulePush(); toast('Manual values applied');
  };
}

/* ---------------- FOOTBALL ---------------- */
function footballControlsHtml(){
  const f = MATCH.football;
  return `
  <div class="card">
    <h3>⚽ Football</h3>
    <div class="score-display">
      <div style="text-align:center;"><div class="note">${escapeHtml(MATCH.teamA.short)}</div><div class="num">${f.scoreA}</div></div>
      <div class="sep">:</div>
      <div style="text-align:center;"><div class="note">${escapeHtml(MATCH.teamB.short)}</div><div class="num">${f.scoreB}</div></div>
    </div>
    <div class="row" style="justify-content:center;">
      <button class="btn" data-goal="A">+1 ${escapeHtml(MATCH.teamA.short)}</button>
      <button class="btn secondary" data-ungoal="A">-1 ${escapeHtml(MATCH.teamA.short)}</button>
      <button class="btn" data-goal="B">+1 ${escapeHtml(MATCH.teamB.short)}</button>
      <button class="btn secondary" data-ungoal="B">-1 ${escapeHtml(MATCH.teamB.short)}</button>
    </div>
    <h3 style="margin-top:20px;">Match Clock</h3>
    <div class="timer-display" id="fbClockDisplay">00:00</div>
    <div class="row" style="justify-content:center;margin-top:8px;">
      <button class="btn" id="fbStartPauseBtn">${f.clockRunning?'Pause':'Start'}</button>
      <button class="btn secondary" id="fbResetBtn">Reset</button>
      <div class="pill-switch" style="max-width:200px;">
        <button data-half="1" class="${f.half===1?'active':''}">1st Half</button>
        <button data-half="2" class="${f.half===2?'active':''}">2nd Half</button>
      </div>
    </div>
    <div class="row" style="justify-content:center;margin-top:10px;">
      <div class="stepper"><button data-add="-1">−</button><span class="val">+${f.addedTime}'</span><button data-add="1">+</button></div>
      <span class="note">added time (shown on overlay)</span>
    </div>
    <h3 style="margin-top:20px;">Cards</h3>
    <div class="grid2">
      <div class="field"><label>${escapeHtml(MATCH.teamA.short)}</label>
        <div class="row">
          <div class="stepper"><button data-card-team="A" data-card-type="yellow" data-card-delta="-1">−</button><span class="val">🟨${f.cardsA.yellow}</span><button data-card-team="A" data-card-type="yellow" data-card-delta="1">+</button></div>
          <div class="stepper"><button data-card-team="A" data-card-type="red" data-card-delta="-1">−</button><span class="val">🟥${f.cardsA.red}</span><button data-card-team="A" data-card-type="red" data-card-delta="1">+</button></div>
        </div>
      </div>
      <div class="field"><label>${escapeHtml(MATCH.teamB.short)}</label>
        <div class="row">
          <div class="stepper"><button data-card-team="B" data-card-type="yellow" data-card-delta="-1">−</button><span class="val">🟨${f.cardsB.yellow}</span><button data-card-team="B" data-card-type="yellow" data-card-delta="1">+</button></div>
          <div class="stepper"><button data-card-team="B" data-card-type="red" data-card-delta="-1">−</button><span class="val">🟥${f.cardsB.red}</span><button data-card-team="B" data-card-type="red" data-card-delta="1">+</button></div>
        </div>
      </div>
    </div>
  </div>`;
}
function footballElapsedMs(f){
  let ms = f.clockBaseMs||0;
  if(f.clockRunning && f.clockStartEpoch) ms += (Date.now()-f.clockStartEpoch);
  return ms;
}
let fbTickTimer=null;
function bindFootballControls(){
  const f = MATCH.football;
  document.querySelectorAll('[data-goal]').forEach(b=>b.onclick=()=>{ f['score'+b.dataset.goal]++; renderMain(); schedulePush(); });
  document.querySelectorAll('[data-ungoal]').forEach(b=>b.onclick=()=>{ const k='score'+b.dataset.ungoal; f[k]=clamp(f[k]-1,0,999); renderMain(); schedulePush(); });
  document.getElementById('fbStartPauseBtn').onclick = ()=>{
    if(f.clockRunning){ f.clockBaseMs = footballElapsedMs(f); f.clockRunning=false; f.clockStartEpoch=null; }
    else { f.clockRunning=true; f.clockStartEpoch=Date.now(); }
    renderMain(); schedulePush();
  };
  document.getElementById('fbResetBtn').onclick = ()=>{ f.clockRunning=false; f.clockStartEpoch=null; f.clockBaseMs=0; renderMain(); schedulePush(); };
  document.querySelectorAll('[data-half]').forEach(b=>b.onclick=()=>{
    f.half = parseInt(b.dataset.half,10);
    f.clockRunning=false; f.clockStartEpoch=null; f.clockBaseMs=0; f.addedTime=0;
    renderMain(); schedulePush();
  });
  document.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>{ f.addedTime = clamp(f.addedTime+parseInt(b.dataset.add,10),0,30); renderMain(); schedulePush(); });
  document.querySelectorAll('[data-card-team]').forEach(b=>b.onclick=()=>{
    const team=b.dataset.cardTeam, type=b.dataset.cardType, delta=parseInt(b.dataset.cardDelta,10);
    const cards = team==='A'?f.cardsA:f.cardsB;
    cards[type] = clamp(cards[type]+delta,0,20);
    renderMain(); schedulePush();
  });
  updateFbClockDisplay();
}
function updateFbClockDisplay(){
  clearInterval(fbTickTimer);
  const el = document.getElementById('fbClockDisplay');
  if(!el) return;
  function tick(){ el.textContent = fmtClock(footballElapsedMs(MATCH.football)); }
  tick();
  fbTickTimer = setInterval(tick, 500);
}

/* ---------------- VOLLEYBALL ---------------- */
function volleyballControlsHtml(){
  const v = MATCH.volleyball;
  const target = v.currentSet>=5 ? 15 : 25;
  return `
  <div class="card">
    <h3>🏐 Volleyball — Set ${v.currentSet}</h3>
    <div class="score-display">
      <div style="text-align:center;"><div class="note">${escapeHtml(MATCH.teamA.short)} ${v.server==='A'?'🏐':''}</div><div class="num">${v.pointsA}</div><div class="note">Sets won: ${v.setsA}</div></div>
      <div class="sep">:</div>
      <div style="text-align:center;"><div class="note">${escapeHtml(MATCH.teamB.short)} ${v.server==='B'?'🏐':''}</div><div class="num">${v.pointsB}</div><div class="note">Sets won: ${v.setsB}</div></div>
    </div>
    <p class="note" style="text-align:center;">Playing to ${target} (win by 2). ${v.history.length?('Sets so far: '+v.history.map(h=>h.a+'-'+h.b).join(', ')):''}</p>
    <div class="row" style="justify-content:center;">
      <button class="btn big" data-pt="A" style="background:${MATCH.teamA.color};">+1 ${escapeHtml(MATCH.teamA.short)}</button>
      <button class="btn big" data-pt="B" style="background:${MATCH.teamB.color};">+1 ${escapeHtml(MATCH.teamB.short)}</button>
    </div>
    <div class="row" style="justify-content:center;margin-top:10px;">
      <button class="btn secondary small" data-unpt="A">−1 ${escapeHtml(MATCH.teamA.short)}</button>
      <button class="btn secondary small" data-unpt="B">−1 ${escapeHtml(MATCH.teamB.short)}</button>
      <button class="btn secondary small" id="toggleServerBtn">⇄ Toggle Server</button>
      <button class="btn danger small" id="endSetBtn">End Set Now</button>
    </div>
  </div>`;
}
function volleyballCheckSetEnd(){
  const v = MATCH.volleyball;
  const target = v.currentSet>=5 ? 15 : 25;
  const a=v.pointsA,b=v.pointsB;
  if((a>=target||b>=target) && Math.abs(a-b)>=2){
    volleyballEndSet();
  }
}
function volleyballEndSet(){
  const v = MATCH.volleyball;
  v.history.push({a:v.pointsA,b:v.pointsB});
  if(v.pointsA>v.pointsB) v.setsA++; else if(v.pointsB>v.pointsA) v.setsB++;
  v.pointsA=0; v.pointsB=0; v.currentSet++;
  v.server = v.server==='A'?'B':'A';
  renderMain(); schedulePush(); toast('Set recorded');
}
function bindVolleyballControls(){
  const v = MATCH.volleyball;
  document.querySelectorAll('[data-pt]').forEach(b=>b.onclick=()=>{
    v['points'+b.dataset.pt]++; v.server=b.dataset.pt;
    renderMain(); schedulePush(); volleyballCheckSetEnd();
  });
  document.querySelectorAll('[data-unpt]').forEach(b=>b.onclick=()=>{
    const k='points'+b.dataset.unpt; v[k]=clamp(v[k]-1,0,99); renderMain(); schedulePush();
  });
  document.getElementById('toggleServerBtn').onclick = ()=>{ v.server = v.server==='A'?'B':'A'; renderMain(); schedulePush(); };
  document.getElementById('endSetBtn').onclick = ()=>{ if(confirm('End this set now and record the score?')) volleyballEndSet(); };
}

/* ---------------- KABADDI ---------------- */
function kabaddiControlsHtml(){
  const k = MATCH.kabaddi;
  return `
  <div class="card">
    <h3>🤼 Kabaddi — Half ${k.half}</h3>
    <div class="score-display">
      <div style="text-align:center;"><div class="note">${escapeHtml(MATCH.teamA.short)}</div><div class="num">${k.scoreA}</div></div>
      <div class="sep">:</div>
      <div style="text-align:center;"><div class="note">${escapeHtml(MATCH.teamB.short)}</div><div class="num">${k.scoreB}</div></div>
    </div>
    <div class="grid2">
      <div class="field"><label>${escapeHtml(MATCH.teamA.short)} points</label>
        <div class="row">
          <button class="btn small" data-kpt-team="A" data-kpt-delta="1">+1 (touch)</button>
          <button class="btn small" data-kpt-team="A" data-kpt-delta="2">+2 (bonus)</button>
          <button class="btn secondary small" data-kpt-team="A" data-kpt-delta="-1">−1</button>
        </div>
      </div>
      <div class="field"><label>${escapeHtml(MATCH.teamB.short)} points</label>
        <div class="row">
          <button class="btn small" data-kpt-team="B" data-kpt-delta="1">+1 (touch)</button>
          <button class="btn small" data-kpt-team="B" data-kpt-delta="2">+2 (bonus)</button>
          <button class="btn secondary small" data-kpt-team="B" data-kpt-delta="-1">−1</button>
        </div>
      </div>
    </div>
    <div class="grid2">
      <div class="field"><label>${escapeHtml(MATCH.teamA.short)} players on court (All-outs: ${k.allOutA})</label>
        <div class="stepper"><button data-pl-team="A" data-pl-delta="-1">−</button><span class="val">${k.playersLeftA}</span><button data-pl-team="A" data-pl-delta="1">+</button></div>
        <button class="btn danger small" data-allout="A" style="white-space:nowrap;margin-top:8px;align-self:flex-start;">Call All-Out</button>
      </div>
      <div class="field"><label>${escapeHtml(MATCH.teamB.short)} players on court (All-outs: ${k.allOutB})</label>
        <div class="stepper"><button data-pl-team="B" data-pl-delta="-1">−</button><span class="val">${k.playersLeftB}</span><button data-pl-team="B" data-pl-delta="1">+</button></div>
        <button class="btn danger small" data-allout="B" style="white-space:nowrap;margin-top:8px;align-self:flex-start;">Call All-Out</button>
      </div>
    </div>
    <h3 style="margin-top:18px;">Match Clock</h3>
    <div class="timer-display" id="kbClockDisplay">00:00</div>
    <div class="row" style="justify-content:center;margin-top:8px;">
      <button class="btn" id="kbStartPauseBtn">${k.clockRunning?'Pause':'Start'}</button>
      <button class="btn secondary" id="kbResetBtn">Reset</button>
      <div class="pill-switch" style="max-width:200px;">
        <button data-khalf="1" class="${k.half===1?'active':''}">1st Half</button>
        <button data-khalf="2" class="${k.half===2?'active':''}">2nd Half</button>
      </div>
    </div>
  </div>`;
}
function kabaddiElapsedMs(k){
  let ms = k.clockBaseMs||0;
  if(k.clockRunning && k.clockStartEpoch) ms += (Date.now()-k.clockStartEpoch);
  return ms;
}
let kbTickTimer=null;
function bindKabaddiControls(){
  const k = MATCH.kabaddi;
  document.querySelectorAll('[data-kpt-team]').forEach(b=>b.onclick=()=>{
    const t = b.dataset.kptTeam; const d = parseInt(b.dataset.kptDelta,10);
    const key = 'score'+t; k[key] = clamp(k[key]+d,0,999);
    renderMain(); schedulePush();
  });
  document.querySelectorAll('[data-pl-team]').forEach(b=>b.onclick=()=>{
    const t = b.dataset.plTeam; const d = parseInt(b.dataset.plDelta,10);
    const key='playersLeft'+t; k[key]=clamp(k[key]+d,0,7);
    renderMain(); schedulePush();
  });
  document.querySelectorAll('[data-allout]').forEach(b=>b.onclick=()=>{
    const t = b.dataset.allout; const other = t==='A'?'B':'A';
    k['score'+other] += 2;
    k['allOut'+t] += 1;
    k['playersLeft'+t] = 7;
    renderMain(); schedulePush(); toast((t==='A'?MATCH.teamA.short:MATCH.teamB.short)+' all-out! +2 to opponent');
  });
  document.getElementById('kbStartPauseBtn').onclick = ()=>{
    if(k.clockRunning){ k.clockBaseMs = kabaddiElapsedMs(k); k.clockRunning=false; k.clockStartEpoch=null; }
    else { k.clockRunning=true; k.clockStartEpoch=Date.now(); }
    renderMain(); schedulePush();
  };
  document.getElementById('kbResetBtn').onclick = ()=>{ k.clockRunning=false; k.clockStartEpoch=null; k.clockBaseMs=0; renderMain(); schedulePush(); };
  document.querySelectorAll('[data-khalf]').forEach(b=>b.onclick=()=>{
    k.half=parseInt(b.dataset.khalf,10); k.clockRunning=false; k.clockStartEpoch=null; k.clockBaseMs=0;
    k.playersLeftA=7; k.playersLeftB=7;
    renderMain(); schedulePush();
  });
  updateKbClockDisplay();
}
function updateKbClockDisplay(){
  clearInterval(kbTickTimer);
  const el = document.getElementById('kbClockDisplay');
  if(!el) return;
  function tick(){ el.textContent = fmtClock(kabaddiElapsedMs(MATCH.kabaddi)); }
  tick();
  kbTickTimer = setInterval(tick, 500);
}
