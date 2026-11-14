// == Red Bull RB16 Mod (Standalone) ==
(function(){
  if (window.__r52_rbCar) return;
  window.__r52_rbCar = true;

  console.log("[Mod] Red Bull RB16 loading...");

  // ⚠️ CHANGE THIS to the actual URL of your .glb file on GitHub
  const CAR_URL = 'https://cdn.jsdelivr.net/gh/Terybery453423/Tuner52@main/custom_cars/rb16.glb';

  // YOUR EXACT TUNED OFFSETS
  window.__r52rbRotX = 0.0000; 
  window.__r52rbRotY = 0.0000;
  window.__r52rbRotZ = 0.0000;
  window.__r52rbBaked = {
    k: 16.65,
    x: 40352.13,
    y: -2456.30,
    z: 21229.67
  };

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

  function downloadModel() {
    if (window.__r52DownloadFile) {
      window.__r52DownloadFile(CAR_URL, 'rb16', function(dataUrl) {
        if (!window.THREE || !THREE.GLTFLoader) { 
          console.warn("[Mod] THREE.GLTFLoader missing."); 
          return; 
        }
        var loader = new THREE.GLTFLoader();
        loader.load(dataUrl, function(gltf){
          window.__r52rbStash = gltf.scene;
          console.log("[Mod] Red Bull model parsed.");
        }, undefined, function(err){
          console.error("[Mod] Failed to parse GLB:", err);
        });
      }, function(err) {
        console.error("[Mod] Failed to download model:", err);
      });
    }
  }

  var intervalId = setInterval(function(){
    var sc = getScene(); if (!sc) return;
    var cg = findCarGroup(sc); if (!cg) return;
    
    var scaled = null;
    for (var j = 0; j < cg.children.length; j++) {
      var ch = cg.children[j];
      if (ch.type === "Group" && ch.scale && Math.abs(ch.scale.x - 0.01) < 0.001) { scaled = ch; break; }
    }
    if (!scaled) scaled = cg.children[0];
    if (!scaled) return;

    if (!window.__r52rbStash) return;

    var existing = null;
    for (var i = 0; i < cg.children.length; i++) {
      if (cg.children[i].name === "__r52rbWrap") { existing = cg.children[i]; break; }
    }

    if (existing) {
      existing.position.copy(scaled.position);
      existing.rotation.copy(scaled.rotation);
      existing.rotation.x += window.__r52rbRotX;
      existing.rotation.y += window.__r52rbRotY;
      existing.rotation.z += window.__r52rbRotZ;
      scaled.visible = false;
      return;
    }

    try {
      var wrap = new THREE.Group();
      wrap.name = "__r52rbWrap";
      wrap.position.copy(scaled.position);
      wrap.rotation.copy(scaled.rotation);
      wrap.rotation.x += window.__r52rbRotX;
      wrap.rotation.y += window.__r52rbRotY;
      wrap.rotation.z += window.__r52rbRotZ;
      wrap.scale.setScalar(0.01);

      var model = window.__r52rbStash;
      if (model.parent) model.parent.remove(model);
      
      model.scale.set(window.__r52rbBaked.k, window.__r52rbBaked.k, window.__r52rbBaked.k);
      model.position.set(window.__r52rbBaked.x, window.__r52rbBaked.y, window.__r52rbBaked.z);

      wrap.add(model);
      cg.add(wrap);
      
      scaled.visible = false;
      window.__r52rbGroup = wrap;
      window.__r52rbModel = model;
      
      console.log("[Mod] Red Bull swapped in!");
    } catch(e) { 
      console.error("[Mod] Swap error:", e); 
    }
  }, 300);

  setTimeout(downloadModel, 1000);

  window.__r52ModCleanup = window.__r52ModCleanup || {};
  window.__r52ModCleanup['redbull_car'] = function() {
    clearInterval(intervalId);
    if (window.__r52rbGroup && window.__r52rbGroup.parent) {
      window.__r52rbGroup.parent.remove(window.__r52rbGroup);
    }
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
    delete window.__r52_rbCar;
    delete window.__r52rbGroup;
    delete window.__r52rbModel;
    delete window.__r52rbStash;
    console.log("[Mod] Red Bull car cleaned up.");
  };
})();