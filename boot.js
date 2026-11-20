/* ============================================================
   Boot: decide overlay vs control panel, load/save match state
   ============================================================ */
(async function boot(){
  if(isOverlay){
    document.body.classList.add('overlay-mode');
    const urlSport = qs('sport');
    if(urlSport && SPORTS.includes(urlSport)) currentSport = urlSport;
    MATCH.sport = currentSport;
    const cloud = await pullMatch();
    if(cloud){ MATCH = mergeDefaults(cloud); currentSport = MATCH.sport; }
    startOverlayLoop();
    return;
  }

  document.getElementById('controlPanel').classList.add('show');
  setConn('', 'Connecting…');
  const cloud = await pullMatch();
  if(cloud){
    MATCH = mergeDefaults(cloud);
    currentSport = MATCH.sport;
    setConn('on','Loaded from cloud');
  } else {
    setConn('off','New scoreboard — not yet synced');
  }
  renderSportTabs();
  renderMain();
  // keep control panel fresh if the same match is also being edited from
  // another device (e.g. phone + laptop open at once) — light polling,
  // paused while the operator is actively typing/clicking (debounced push pending).
  setInterval(async ()=>{
    if(pushTimer) return; // a local edit is about to be pushed — don't clobber it
    const cloud2 = await pullMatch();
    if(cloud2 && cloud2.updatedAt && cloud2.updatedAt > (MATCH.updatedAt||0)){
      MATCH = mergeDefaults(cloud2);
      currentSport = MATCH.sport;
      renderSportTabs();
      renderMain();
    }
  }, 4000);

  // make sure a last in-flight edit still reaches the cloud if the tab closes
  function flushOnExit(){
    if(!pushTimer) return;
    clearTimeout(pushTimer); pushTimer=null;
    try{
      MATCH.updatedAt = Date.now();
      fetch(cloudUrl(), {method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(MATCH), keepalive:true});
    }catch(e){}
  }
  document.addEventListener('visibilitychange', ()=>{ if(document.visibilityState==='hidden') flushOnExit(); });
  window.addEventListener('pagehide', flushOnExit);
})();
