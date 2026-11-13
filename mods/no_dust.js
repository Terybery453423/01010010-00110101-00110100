// == No Dust Mod ==
(function(){
  if (window.__r52_nodust) return;
  window.__r52_nodust = true;

  const origEmit = window.emit || (typeof emit !== 'undefined' ? emit : null);
  const origTrailDust = window.trailDust || (typeof trailDust !== 'undefined' ? trailDust : null);

  // Stub out the particle functions
  window.emit = function(){}; try { emit = function(){}; } catch(e){}
  window.trailDust = function(){}; try { trailDust = function(){}; } catch(e){}

  window.__r52ModCleanup = window.__r52ModCleanup || {};
  window.__r52ModCleanup['no_dust'] = function() {
    if (origEmit) { window.emit = origEmit; try { emit = origEmit; } catch(e){} }
    if (origTrailDust) { window.trailDust = origTrailDust; try { trailDust = origTrailDust; } catch(e){} }
    delete window.__r52_nodust;
    console.log("[Mod] No Dust cleaned up natively.");
  };
})();