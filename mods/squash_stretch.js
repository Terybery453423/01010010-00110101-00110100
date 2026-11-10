// == Car Squash & Stretch ==
(function(){
  if (window.__r52_squashStretch) return;
  window.__r52_squashStretch = true;

  console.log("[Mod] Squash & Stretch loaded");

  window.__r52squashOn = true;
  window.__r52sqFreq = 1.6; // cycles per second
  window.__r52sqAmp = 0.42; // how extreme the stretch is

  var sqT = 0;
  function squashTick(now){
    requestAnimationFrame(squashTick);
    
    // We look for the customGroup made by the Model Loader
    var w = window.__r52customGroup;
    if (!w) return;
    
    var base = w.userData.baseScale || 0.01;
    if (!window.__r52squashOn) { w.scale.setScalar(base); return; }
    
    var dt = 1 / 60;
    if (squashTick._last) dt = Math.min(0.05, (now - squashTick._last) / 1000);
    squashTick._last = now;
    sqT += dt * window.__r52sqFreq * Math.PI * 2;
    
    var s = Math.sin(sqT);
    var sy = 1 + window.__r52sqAmp * s;
    
    // Volume-preserving compensation on X/Z
    var sxz = 1 / Math.sqrt(sy);
    w.scale.set(base * sxz, base * sy, base * sxz);
  }
  
  requestAnimationFrame(squashTick);

  // --- UI Toggle ---
  var sqChip = document.createElement('div');
  sqChip.id = 'r52sq_chip';
  sqChip.style.cssText = 'position:fixed;right:6px;bottom:230px;z-index:9999;padding:8px 12px;background:#c26a1f;color:#fff;font:700 10px monospace;border-radius:8px;cursor:pointer;text-align:center;min-width:130px;border:1px solid #e8a;-webkit-tap-highlight-color:transparent';
  sqChip.textContent = 'SQUASH: ON';
  document.body.appendChild(sqChip);

  sqChip.onclick = function(){
    var on = sqChip.textContent === 'SQUASH: OFF';
    window.__r52squashOn = on;
    sqChip.textContent = on ? 'SQUASH: ON' : 'SQUASH: OFF';
    sqChip.style.background = on ? '#c26a1f' : '#555';
  };

})();