// == Trackmania Car Mod (Standalone) ==
(function(){
  if (window.__r52_tmnfCar) return;
  window.__r52_tmnfCar = true;

  console.log("[Mod] Trackmania Car loading...");

  // ⚠️ CHANGE THIS to the actual URL of your .glb file on GitHub
  const CAR_URL = 'https://cdn.jsdelivr.net/gh/Terybery453423/Tuner52@main/custom_cars/tmnf_car.glb';

// YOUR EXACT TUNED OFFSETS (Adjusted Tilt & Height)
window.__r52rotX = -0.1416; // -0.2416 + 0.10
window.__r52rotY = 0.6084;
window.__r52rotZ = 0.1084;
window.__r52baked = {
  k: 94.70,
  x: -19.53,
  y: 43.00, // 46.00 - 3
  z: 365.90
};

  let carGroup = null;
  let originalMesh = null;
  let customWrap = null;
  let customModel = null;

  function getScene(){
    if (window.__r52sceneCached && window.__r52sceneCached.type === "Scene") return window.__r52sceneCached;
    try { if (typeof cam !== "undefined" && cam) { var p = cam; while (p.parent) p = p.parent; if (p.type === "Scene") { window.__r52sceneCached = p; return p; } } } catch(e){}
    try { if (typeof sky !== "undefined" && sky) { var p2 = sky; while (p2.parent) p2 = p2.parent; if (p2.type === "Scene") { window.__r52sceneCached = p2; return p2; } } } catch(e){}
    return null;
  }

  function findCarGroup(sc){
    if (!sc || !sc.children) return null;
    for (var k = sc.children.length - 1; k >= 0; k--) {
      var c = sc.children[k];
      if (c.type === "Group" && c.userData && c.userData.base) return c;
    }
    return null;
  }

  // 1. Auto-Download the model
  function downloadModel() {
    if (window.__r52DownloadFile) {
      window.__r52DownloadFile(CAR_URL, 'tmnf', function(dataUrl) {
        if (!window.THREE || !THREE.GLTFLoader) { 
          console.warn("[Mod] THREE.GLTFLoader missing. Install the GLB Loader mod."); 
          return; 
        }
        var loader = new THREE.GLTFLoader();
        loader.load(dataUrl, function(gltf){
          window.__r52tmnfStash = gltf.scene;
          console.log("[Mod] Trackmania model parsed.");
        }, undefined, function(err){
          console.error("[Mod] Failed to parse GLB:", err);
        });
      }, function(err) {
        console.error("[Mod] Failed to download model:", err);
      });
    } else {
      console.warn("[Mod] Hub API missing. Cannot download model.");
    }
  }

  // 2. The Alignment Loop (Runs every 300ms)
  var intervalId = setInterval(function(){
    var sc = getScene(); if (!sc) return;
    var cg = findCarGroup(sc); if (!cg) return;
    
    // Find the original game car
    var scaled = null;
    for (var j = 0; j < cg.children.length; j++) {
      var ch = cg.children[j];
      if (ch.type === "Group" && ch.scale && Math.abs(ch.scale.x - 0.01) < 0.001) { scaled = ch; break; }
    }
    if (!scaled) scaled = cg.children[0];
    if (!scaled) return;

    // Wait for the model to finish downloading
    if (!window.__r52tmnfStash) return;

    // If the wrapper already exists, just update its position/rotation to match the game car
    var existing = null;
    for (var i = 0; i < cg.children.length; i++) {
      if (cg.children[i].name === "__r52tmnfWrap") { existing = cg.children[i]; break; }
    }

    if (existing) {
      existing.position.copy(scaled.position);
      existing.rotation.copy(scaled.rotation);
      
      // Apply your exact tuned offsets
      existing.rotation.x += window.__r52rotX;
      existing.rotation.y += window.__r52rotY;
      existing.rotation.z += window.__r52rotZ;
      
      scaled.visible = false;
      return;
    }

    // If it doesn't exist, build the wrapper
    try {
      var wrap = new THREE.Group();
      wrap.name = "__r52tmnfWrap";
      wrap.position.copy(scaled.position);
      wrap.rotation.copy(scaled.rotation);
      
      wrap.rotation.x += window.__r52rotX;
      wrap.rotation.y += window.__r52rotY;
      wrap.rotation.z += window.__r52rotZ;

      wrap.scale.setScalar(0.01); // Match the game's car scale

      var model = window.__r52tmnfStash;
      if (model.parent) model.parent.remove(model);
      
      // Apply the exact baked scale and position
      model.scale.set(window.__r52baked.k, window.__r52baked.k, window.__r52baked.k);
      model.position.set(window.__r52baked.x, window.__r52baked.y, window.__r52baked.z);

      wrap.add(model);
      cg.add(wrap);
      
      scaled.visible = false;
      window.__r52tmnfGroup = wrap;
      window.__r52tmnfModel = model;
      
      console.log("[Mod] Trackmania car swapped in!");
    } catch(e) { 
      console.error("[Mod] Swap error:", e); 
    }
  }, 300);

  // Start downloading immediately
  setTimeout(downloadModel, 1000);

  // --- CLEANUP ---
  window.__r52ModCleanup = window.__r52ModCleanup || {};
  window.__r52ModCleanup['tmnf_car'] = function() {
    clearInterval(intervalId);
    if (window.__r52tmnfGroup && window.__r52tmnfGroup.parent) {
      window.__r52tmnfGroup.parent.remove(window.__r52tmnfGroup);
    }
    // Restore original car visibility
    var sc = getScene();
    if (sc) {
      var cg = findCarGroup(sc);
      if (cg) {
        for (var j = 0; j < cg.children.length; j++) {
          if (cg.children[j].scale && Math.abs(cg.children[j].scale.x - 0.01) < 0.001) {
            cg.children[j].visible = true;
          }
        }
      }
    }
    delete window.__r52_tmnfCar;
    delete window.__r52tmnfGroup;
    delete window.__r52tmnfModel;
    delete window.__r52tmnfStash;
    console.log("[Mod] Trackmania car cleaned up.");
  };
})();