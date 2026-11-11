// == No Dust Mod ==
(function(){
  if (window.__r52_nodust) return;
  window.__r52_nodust = true;

  console.log("[Mod] No Dust loaded");

  window.__r52nd = { on: false, originals: {}, hidden: [] };

  window.__r52ndInstall = function(){
    var st = window.__r52nd;
    if (st.on) return "already on";
    var hooked = 0;

    // 1. Hook emit() — wheel-contact dust while drifting/slipping
    try {
      if (typeof emit === "function" && !st.originals.emit) {
        st.originals.emit = emit;
        window.emit = function(){};
        hooked++;
      }
    } catch(e){}

    // 2. Hook trailDust() — slow rolling dust
    try {
      if (typeof trailDust === "function" && !st.originals.trailDust) {
        st.originals.trailDust = trailDust;
        window.trailDust = function(){};
        hooked++;
      }
    } catch(e){}

    // 3. Fallback: Hide THREE.Points / LineSegments if we couldn't hook the functions
    if (hooked === 0) {
      try {
        var scene = null;
        try { if (typeof cam !== "undefined" && cam) { var p = cam; while (p.parent) p = p.parent; if (p.type === "Scene") scene = p; } } catch(e){}
        if (!scene && window.__r52sceneCached) scene = window.__r52sceneCached;
        
        if (scene) {
          st.hidden = [];
          scene.traverse(function(o){
            if (o.type === "Points" || o.type === "LineSegments" || o.type === "Line") {
              if (o.visible !== false) { st.hidden.push(o); o.visible = false; }
            }
          });
          hooked = st.hidden.length;
        }
      } catch(e){}
    }

    st.on = true;
    return "on (" + hooked + " targets)";
  };

  window.__r52ndRestore = function(){
    var st = window.__r52nd;
    if (!st.on) return "already off";
    var restored = 0;
    
    try {
      if (st.originals.emit) { window.emit = st.originals.emit; st.originals.emit = null; restored++; }
    } catch(e){}
    
    try {
      if (st.originals.trailDust) { window.trailDust = st.originals.trailDust; st.originals.trailDust = null; restored++; }
    } catch(e){}
    
    if (st.hidden.length) {
      for (var i = 0; i < st.hidden.length; i++) {
        try { st.hidden[i].visible = true; restored++; } catch(e){}
      }
      st.hidden = [];
    }
    
    st.on = false;
    return "off (" + restored + " restored)";
  };

  // --- UI ---
  var chip = document.createElement('div');
  chip.id = 'r52ndChip';
  chip.style.cssText = 'position:fixed;right:6px;bottom:190px;z-index:9999;padding:8px 12px;background:#1f7d4a;color:#fff;font:700 10px monospace;border-radius:8px;cursor:pointer;text-align:center;min-width:130px;border:1px solid #4ade80;-webkit-tap-highlight-color:transparent';
  chip.textContent = '🚫 NO DUST: ON';
  document.body.appendChild(chip);

  // Auto-run on install
  window.__r52ndInstall();

  chip.onclick = function(){
    if (window.__r52nd.on) {
      window.__r52ndRestore();
      chip.textContent = '🚫 NO DUST: OFF';
      chip.style.background = '#3a3a5a';
      chip.style.borderColor = '#99f';
    } else {
      window.__r52ndInstall();
      chip.textContent = '🚫 NO DUST: ON';
      chip.style.background = '#1f7d4a';
      chip.style.borderColor = '#4ade80';
    }
  };

  // --- NATIVE CLEANUP REGISTRY ---
  window.__r52ModCleanup = window.__r52ModCleanup || {};
  window.__r52ModCleanup['no_dust'] = function() {
    window.__r52ndRestore();
    if (chip && chip.parentNode) chip.parentNode.removeChild(chip);
    delete window.__r52_nodust; // Fixes reinstall bug!
    console.log("[Mod] No Dust cleaned up natively.");
  };

})();