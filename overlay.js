/* ============================================================
   Overlay rendering (transparent broadcast scorebug for OBS)
   ============================================================ */
function renderOverlay(){
  const el = document.getElementById('overlay');
  const sport = MATCH.sport;
  const A = MATCH.teamA, B = MATCH.teamB;
  let html = '';
  if(MATCH.title){
    html += `<div class="title-chip">${escapeHtml(MATCH.title)}</div>`;
  }
  if(sport==='cricket') html += overlayCricket(A,B,MATCH.cricket);
  else if(sport==='football') html += overlayFootball(A,B,MATCH.football);
  else if(sport==='volleyball') html += overlayVolleyball(MATCH,MATCH.volleyball);
  else if(sport==='kabaddi') html += overlayKabaddi(A,B,MATCH.kabaddi);
  el.innerHTML = html;
}

function overlayCricket(A,B,c){
  const batting = c.battingTeam==='A' ? A : B;
  const score = c.battingTeam==='A' ? c.scoreA : c.scoreB;
  const other = c.battingTeam==='A' ? B : A;
  const otherScore = c.battingTeam==='A' ? c.scoreB : c.scoreA;
  let sub = `${escapeHtml(c.striker.name)} ${c.striker.runs}(${c.striker.balls}) · ${escapeHtml(c.nonStriker.name)} ${c.nonStriker.runs}(${c.nonStriker.balls}) · Bowler: ${escapeHtml(c.bowler.name)} ${c.bowler.wickets}-${c.bowler.runs}`;
  let reqLine = '';
  if(c.innings===2 && c.target!=null){
    const need = Math.max(0, c.target - score.runs);
    reqLine = ` · Need ${need} to win`;
  }
  return `
  <div class="bug">
    <div class="team" style="background:${batting.color}cc;"><span class="swatch" style="background:#fff;"></span><span class="tname">${escapeHtml(batting.short)}</span></div>
    <div class="score" style="background:rgba(17,14,26,.92);">${score.runs}-${score.wickets}</div>
    <div class="mid"><span class="big">${score.overs}.${score.balls}</span><span>OVERS</span></div>
  </div>
  <div class="subline">Inn ${c.innings} · ${escapeHtml(other.short)} ${c.innings===2?otherScore.runs+'/'+otherScore.wickets:''}${reqLine} · ${sub}</div>`;
}

function overlayFootball(A,B,f){
  const ms = footballElapsedMs(f);
  const clock = fmtClock(ms);
  const half = f.half===1?'1ST':'2ND';
  return `
  <div class="bug">
    <div class="team" style="background:${A.color}cc;"><span class="swatch" style="background:#fff;"></span><span class="tname">${escapeHtml(A.short)}</span></div>
    <div class="score" style="background:rgba(17,14,26,.92);">${f.scoreA}</div>
    <div class="mid"><span class="big">${clock}</span><span>${half}${f.addedTime?(' +'+f.addedTime):''}</span></div>
    <div class="score" style="background:rgba(17,14,26,.92);">${f.scoreB}</div>
    <div class="team" style="background:${B.color}cc;"><span class="tname">${escapeHtml(B.short)}</span><span class="swatch" style="background:#fff;"></span></div>
  </div>
  <div class="subline">🟨${f.cardsA.yellow} 🟥${f.cardsA.red} &nbsp; ${escapeHtml(A.name)} vs ${escapeHtml(B.name)} &nbsp; 🟨${f.cardsB.yellow} 🟥${f.cardsB.red}</div>`;
}

function overlayVolleyball(M,v){
  const A = M.teamA, B = M.teamB;
  const flagA = A.logo
    ? `<img src="${A.logo}" alt="">`
    : `<div class="vb-badge" style="background:${A.color};">${escapeHtml(A.short)}</div>`;
  const flagB = B.logo
    ? `<img src="${B.logo}" alt="">`
    : `<div class="vb-badge" style="background:${B.color};">${escapeHtml(B.short)}</div>`;
  const mid = M.tournamentLogo
    ? `<img src="${M.tournamentLogo}" alt="">`
    : (M.tournamentName ? `<span class="vb-tname">${escapeHtml(M.tournamentName)}</span>` : `<span class="vb-tname">🏐</span>`);
  const winnerName = v.matchWinner==='A' ? A.name : (v.matchWinner==='B' ? B.name : '');
  const serveA = v.server==='A' ? '<span class="vb-serve">●</span> ' : '';
  const serveB = v.server==='B' ? ' <span class="vb-serve">●</span>' : '';
  return `
  <div class="vb-bug">
    <div class="vb-seg vb-flag">${flagA}</div>
    <div class="vb-seg vb-abbr" style="background:linear-gradient(135deg,${A.color},#2a1250);">${serveA}${escapeHtml(A.short)}</div>
    <div class="vb-seg vb-sets"><span>SETS</span><b>${v.setsA}</b></div>
    <div class="vb-seg vb-points">${v.pointsA}</div>
    <div class="vb-seg vb-mid">${mid}</div>
    <div class="vb-seg vb-points">${v.pointsB}</div>
    <div class="vb-seg vb-sets"><span>SETS</span><b>${v.setsB}</b></div>
    <div class="vb-seg vb-abbr" style="background:linear-gradient(135deg,#2a1250,${B.color});">${escapeHtml(B.short)}${serveB}</div>
    <div class="vb-seg vb-flag">${flagB}</div>
  </div>
  <div class="vb-subline">${winnerName ? `🏆 ${escapeHtml(winnerName)} WINS THE MATCH` : `SET ${v.currentSet}${v.history.length?(' · '+v.history.map(h=>h.a+'-'+h.b).join('  ·  ')):''}`}</div>`;
}

function overlayKabaddi(A,B,k){
  const ms = kabaddiElapsedMs(k);
  const clock = fmtClock(ms);
  return `
  <div class="bug">
    <div class="team" style="background:${A.color}cc;"><span class="swatch" style="background:#fff;"></span><span class="tname">${escapeHtml(A.short)}</span></div>
    <div class="score" style="background:rgba(17,14,26,.92);">${k.scoreA}</div>
    <div class="mid"><span class="big">${clock}</span><span>HALF ${k.half}</span></div>
    <div class="score" style="background:rgba(17,14,26,.92);">${k.scoreB}</div>
    <div class="team" style="background:${B.color}cc;"><span class="tname">${escapeHtml(B.short)}</span><span class="swatch" style="background:#fff;"></span></div>
  </div>
  <div class="subline">On court — ${escapeHtml(A.short)}: ${k.playersLeftA}/7 &nbsp; ${escapeHtml(B.short)}: ${k.playersLeftB}/7 &nbsp; All-outs ${k.allOutA}-${k.allOutB}</div>`;
}

let overlayTickTimer = null;
function startOverlayLoop(){
  renderOverlay();
  clearInterval(overlayTickTimer);
  overlayTickTimer = setInterval(renderOverlay, 250); // smooth local clock ticking
  pollOverlay();
  setInterval(pollOverlay, 1000);
}
async function pollOverlay(){
  const cloud = await pullMatch();
  if(cloud){
    MATCH = mergeDefaults(cloud);
    currentSport = MATCH.sport;
  }
}
