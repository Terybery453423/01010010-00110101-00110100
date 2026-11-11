// == Soft Barriers Mod ==
(function(){
  if (window.__r52_softbar) return;
  window.__r52_softbar = true;

  console.log("[Mod] Soft Barriers loaded");

  window.__r52sb = { on: false, orig: null };

  window.__r52sbInstall = function(){
    var st = window.__r52sb;
    if (st.on) return "already on";
    if (typeof phys !== "function") return "no phys";
    
    st.orig = phys;
    var wrapper = function(h){
      if (typeof car === "undefined" || !car) return st.orig(h);
      var bx = car.vx, bz = car.vz;
      var before = Math.sqrt(bx*bx + bz*bz);
      
      var r = st.orig(h);
      
      var ax = car.vx, az = car.vz;
      var after = Math.sqrt(ax*ax + az*az);
      
      // If we lost more than 20% of our speed in one frame (hit a wall), give half of it back
      if (before > 4 && after < before * 0.8) {
        var target = before - (before - after) * 0.5;
        var scale = target / (after || 1e-6);
        car.vx = ax * scale;
        car.vz = az * scale;
        car.vf = car.vx * Math.sin(car.h) + car.vz * Math.cos(car.h);
      }
      return r;
    };
    
    try { phys = wrapper; } catch(e) { try { window.phys = wrapper; } catch(e2){} }
    st.on = true;
    return "on";
  };

  window.__r52sbRestore = function(){
    var st = window.__r52sb;
    if (!st.on) return "already off";
    if (st.orig) { try { phys = st.orig; } catch(e) { try { window.phys = st.orig; } catch(e2){} } }
    st.on = false;
    return "off";
  };

  // --- UI ---
  var chip = document.createElement('div');
  chip.id = 'r52sbChip';
  chip.style.cssText = 'position:fixed;right:6px;bottom:220px;z-index:9999;padding:8px 12px;background:#1f7d4a;color:#fff;font:700 10px monospace;border-radius:8px;cursor:pointer;text-align:center;min-width:130px;border:1px solid #4ade80;-webkit-tap-highlight-color:transparent';
  chip.textContent = '🧱 SOFT BARRIERS: ON';
  document.body.appendChild(chip);

  // Auto-install on load
  window.__r52sbInstall();

  chip.onclick = function(){
    if (window.__r52sb.on) {
      window.__r52sbRestore();
      chip.textContent = '🧱 SOFT BARRIERS: OFF';
      chip.style.background = '#3a3a5a'; chip.style.borderColor = '#99f';
    } else {
      window.__r52sbInstall();
      chip.textContent = '🧱 SOFT BARRIERS: ON';
      chip.style.background = '#1f7d4a'; chip.style.borderColor = '#4ade80';
    }
  };

  // --- NATIVE CLEANUP REGISTRY ---
  window.__r52ModCleanup = window.__r52ModCleanup || {};
  window.__r52ModCleanup['soft_barriers'] = function() {
    window.__r52sbRestore();
    if (chip && chip.parentNode) chip.parentNode.removeChild(chip);
    delete window.__r52_softbar; // Fixes reinstall bug!
    console.log("[Mod] Soft Barriers cleaned up natively.");
  };

})();