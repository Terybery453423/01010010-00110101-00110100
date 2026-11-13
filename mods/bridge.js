// == Golden Gate Bridge Mod (Auto-Load) ==
(function(){
  if (window.__r52_bridgeMod) return;
  window.__r52_bridgeMod = true;

  console.log("[Mod] Bridge loaded");

  const BRIDGE_URL = 'https://cdn.jsdelivr.net/gh/Terybery453423/Tuner52@main/custom_cars/Golden_Gate_Bridge.glb';

  window.__r52bridgeStash = null;
  window.__r52bridgeBaked = null;
  window.__r52bridgeSwapMsg = "idle";
  window.__r52bridgeRotY = -Math.PI * 0.75;
  window.__r52bridgeRotX = 5 * Math.PI / 180;
  window.__r52bridgeScaleMul = 100.0;
  window.__r52bridgeYOffset = -12;

  function getScene(){
    if (window.__r52sceneCached && window.__r52sceneCached.type === "Scene") return window.__r52sceneCached;
    try { if (typeof cam !== "undefined" && cam) { var p = cam; while (p.parent) p = p.parent; if (p.type === "Scene") { window.__r52sceneCached = p; return p; } } } catch(e){}
    try { if (typeof sky !== "undefined" && sky) { var p2 = sky; while (p2.parent) p2 = p2.parent; if (p2.type === "Scene") { window.__r52sceneCached = p2; return p2; } } } catch(e){}
    try { if (typeof GH !== "undefined" && GH && GH.g) { var p3 = GH.g; while (p3.parent) p3 = p3.parent; if (p3.type === "Scene") { window.__r52sceneCached = p3; return p3; } } } catch(e){}
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

  var intervalId = setInterval(function(){
    var sc = getScene(); if (!sc) return;
    var cg = findCarGroup(sc); if (!cg) return;
    
    // If the model hasn't downloaded yet, skip
    if (!window.__r52bridgeStash) return;

    var scaled = null;
    for (var j = 0; j < cg.children.length; j++) {
      var ch = cg.children[j];
      if (ch.type === "Group" && ch.scale && Math.abs(ch.scale.x - 0.01) < 0.001) { scaled = ch; break; }
    }
    if (!scaled) scaled = cg.children[0];
    if (!scaled) return;

    if (!window.__r52bridgeBaked) {
      try {
        var origBox = new THREE.Box3().setFromObject(scaled);
        var origSize = origBox.getSize(new THREE.Vector3());
        var origLongest = Math.max(origSize.x, origSize.y, origSize.z);
        var model = window.__r52bridgeStash;
        var box = new THREE.Box3().setFromObject(model);
        var size = box.getSize(new THREE.Vector3());
        var longest = Math.max(size.x, size.y, size.z) || 1;
        var baseK = (origLongest / 0.01) / longest;
        var k = baseK * window.__r52bridgeScaleMul;
        model.scale.set(k, k, k);
        var box2 = new THREE.Box3().setFromObject(model);
        var center = box2.getCenter(new THREE.Vector3());
        window.__r52bridgeBaked = { k: k, x: -center.x, y: -box2.min.y, z: -center.z };
        model.position.set(window.__r52bridgeBaked.x, window.__r52bridgeBaked.y, window.__r52bridgeBaked.z);
        window.__r52bridgeSwapMsg = "baked";
      } catch(e) { window.__r52bridgeSwapMsg = "bake err: " + e.message; return; }
    }
    var b = window.__r52bridgeBaked;

    var existing = null;
    for (var i = 0; i < cg.children.length; i++) {
      if (cg.children[i].name === "__r52bridgeWrap") { existing = cg.children[i]; break; }
    }
    if (existing) {
      existing.position.x = scaled.position.x; existing.position.y = scaled.position.y + window.__r52bridgeYOffset; existing.position.z = scaled.position.z;
      existing.rotation.set(window.__r52bridgeRotX, window.__r52bridgeRotY, 0);
      existing.userData.baseScale = 0.01; scaled.visible = false; window.__r52bridgeSwapMsg = "live"; return;
    }

    try {
      var wrap = new THREE.Group(); wrap.name = "__r52bridgeWrap";
      wrap.position.x = scaled.position.x; wrap.position.y = scaled.position.y + window.__r52bridgeYOffset; wrap.position.z = scaled.position.z;
      wrap.rotation.set(window.__r52bridgeRotX, window.__r52bridgeRotY, 0);
      wrap.scale.setScalar(0.01); wrap.userData.baseScale = 0.01;
      var model2 = window.__r52bridgeStash;
      if (model2.parent) model2.parent.remove(model2);
      model2.scale.set(b.k, b.k, b.k); model2.position.set(b.x, b.y, b.z);
      wrap.add(model2); cg.add(wrap); scaled.visible = false;
      window.__r52bridgeGroup = wrap; window.__r52bridgeSwapMsg = "live";
      console.log("[Mod] Bridge is now active!");
    } catch(e) { window.__r52bridgeSwapMsg = "err: " + e.message; }
  }, 300);

  // --- AUTO-DOWNLOAD LOGIC ---
  function autoLoadBridge() {
    if (window.__r52bridgeStash) return;
    console.log("[Mod] Requesting Bridge model...");
    
    if (window.__r52DownloadFile) {
      window.__r52DownloadFile(BRIDGE_URL, 'bridge', function(dataUrl) {
        if (!window.THREE || !THREE.GLTFLoader) { 
          console.warn("[Mod] THREE.GLTFLoader not found. Make sure the GLB Loader mod is installed."); 
          return; 
        }
        var loader = new THREE.GLTFLoader();
        loader.load(dataUrl, function(gltf){
          window.__r52bridgeStash = gltf.scene;
          window.__r52bridgeSwapMsg = "queued";
          console.log("[Mod] Bridge parsed and queued for swap.");
        }, undefined, function(err){
          console.error("[Mod] Failed to parse Bridge GLB:", err);
        });
      }, function(err) {
        console.error("[Mod] Failed to download Bridge:", err);
      });
    } else {
      console.error("[Mod] Hub API not found. Cannot download model.");
    }
  }

  // Wait 1.5 seconds for the game & GLTF Loader to initialize, then fire
  setTimeout(autoLoadBridge, 1500);

  window.__r52unswapBridge = function(){
    if (window.__r52bridgeGroup && window.__r52bridgeGroup.parent) window.__r52bridgeGroup.parent.remove(window.__r52bridgeGroup);
    window.__r52bridgeGroup = null; window.__r52bridgeStash = null; window.__r52bridgeBaked = null;
    window.__r52bridgeSwapMsg = "idle";
  };

  // --- NATIVE CLEANUP REGISTRY ---
  window.__r52ModCleanup = window.__r52ModCleanup || {};
  window.__r52ModCleanup['bridge'] = function() {
    clearInterval(intervalId);
    if (window.__r52unswapBridge) window.__r52unswapBridge();
    delete window.__r52_bridgeMod;
    console.log("[Mod] Bridge cleaned up natively.");
  };

})();