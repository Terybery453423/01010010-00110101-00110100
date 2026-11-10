// == Custom Model Loader ==
(function(){
  if (window.__r52_modelLoader) return;
  window.__r52_modelLoader = true;

  console.log("[Mod] Custom Model Loader loaded");

  window.__r52stash = null;
  window.__r52stashName = null;
  window.__r52swapMsg = "idle";
  window.__r52rotY = -Math.PI / 2;
  window.__r52baked = null;

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

  setInterval(function(){
    var sc = getScene();
    if (!sc) return;
    var cg = findCarGroup(sc);
    if (!cg) return;

    var scaled = null;
    for (var j = 0; j < cg.children.length; j++) {
      var ch = cg.children[j];
      if (ch.type === "Group" && ch.scale && Math.abs(ch.scale.x - 0.01) < 0.001) { scaled = ch; break; }
    }
    if (!scaled) scaled = cg.children[0];
    if (!scaled) return;

    if (!window.__r52stash) return;

    if (!window.__r52baked) {
      try {
        var origBox = new THREE.Box3().setFromObject(scaled);
        var origSize = origBox.getSize(new THREE.Vector3());
        var origLongest = Math.max(origSize.x, origSize.y, origSize.z);
        var model = window.__r52stash;
        var box = new THREE.Box3().setFromObject(model);
        var size = box.getSize(new THREE.Vector3());
        var longest = Math.max(size.x, size.y, size.z) || 1;
        var k = (origLongest / 0.01) / longest;
        model.scale.set(k, k, k);
        var box2 = new THREE.Box3().setFromObject(model);
        var center = box2.getCenter(new THREE.Vector3());
        window.__r52baked = { k: k, x: -center.x, y: -box2.min.y, z: -center.z };
        model.position.set(window.__r52baked.x, window.__r52baked.y, window.__r52baked.z);
      } catch(e) { window.__r52swapMsg = "bake err: " + e.message; return; }
    }

    var b = window.__r52baked;

    var existing = null;
    for (var i = 0; i < cg.children.length; i++) {
      if (cg.children[i].name === "__r52customWrap") { existing = cg.children[i]; break; }
    }

    if (existing) {
      existing.position.copy(scaled.position);
      existing.rotation.copy(scaled.rotation);
      existing.rotation.y += window.__r52rotY;
      existing.userData.baseScale = 0.01;
      scaled.visible = false;
      window.__r52swapMsg = "live";
      return;
    }

    try {
      var wrap = new THREE.Group();
      wrap.name = "__r52customWrap";
      wrap.position.copy(scaled.position);
      wrap.rotation.copy(scaled.rotation);
      wrap.rotation.y += window.__r52rotY;
      wrap.scale.setScalar(0.01);
      wrap.userData.baseScale = 0.01;

      var model2 = window.__r52stash;
      if (model2.parent) model2.parent.remove(model2);
      model2.scale.set(b.k, b.k, b.k);
      model2.position.set(b.x, b.y, b.z);

      wrap.add(model2);
      cg.add(wrap);
      scaled.visible = false;
      window.__r52customGroup = wrap;
      window.__r52custom = model2;
      window.__r52swapMsg = "live";
    } catch(e) {
      window.__r52swapMsg = "err: " + e.message;
    }
  }, 300);

  window.__r52unswap = function(){
    if (window.__r52customGroup && window.__r52customGroup.parent) window.__r52customGroup.parent.remove(window.__r52customGroup);
    window.__r52customGroup = null; window.__r52custom = null; window.__r52stash = null; window.__r52baked = null;
    window.__r52swapMsg = "idle";
    try { var sc = window.__r52sceneCached || getScene(); if (sc) { for (var k = 0; k < sc.children.length; k++) { var c = sc.children[k]; if (c.type === "Group" && c.userData && c.userData.base) { for (var j = 0; j < c.children.length; j++) { if (c.children[j].scale && Math.abs(c.children[j].scale.x - 0.01) < 0.001) { c.children[j].visible = true; break; } } } } } } catch(e){}
  };

  // --- UI ---
  var chip = document.createElement('div');
  chip.id = 'r52cf_chip';
  chip.style.cssText = 'position:fixed;right:6px;bottom:260px;z-index:9999;padding:9px 14px;background:#a0472f;color:#fff;font:700 11px monospace;border-radius:8px;cursor:pointer;text-align:center;min-width:130px;border:1px solid #d88;-webkit-tap-highlight-color:transparent';
  chip.textContent = '📁 PICK MODEL';
  document.body.appendChild(chip);

  var inp = document.createElement('input');
  inp.type = 'file';
  inp.accept = '*/*';
  inp.style.cssText = 'position:fixed;right:6px;bottom:260px;width:140px;height:38px;opacity:0.001;z-index:9998';
  document.body.appendChild(inp);

  chip.onclick = function(){
    window.__r52swapMsg = "picking…";
    inp.click();
  };

  inp.addEventListener('change', function(e){
    var f = e.target.files && e.target.files[0];
    if (!f) return;
    window.__r52swapMsg = "reading file…";
    window.__r52baked = null; window.__r52stash = null;
    var ext = (f.name.split('.').pop() || '').toLowerCase();
    var mime = ext === 'gltf' ? 'model/gltf+json' : 'model/gltf-binary';
    var wrapped = new Blob([f], { type: mime });
    var r = new FileReader();
    r.onload = function(ev){
      var dataUrl = ev.target.result;
      window.__r52swapMsg = "loading model…";
      var url = dataUrl;
      var name = f.name;
      if (!window.THREE || !THREE.GLTFLoader) { window.__r52swapMsg = "GLTFLoader missing"; return; }
      var loader = new THREE.GLTFLoader();
      loader.load(url, function(gltf){
        window.__r52stash = gltf.scene;
        window.__r52stashName = name;
        window.__r52swapMsg = "queued";
      }, undefined, function(err){
        var m = (err && (err.message || err.type)) || String(err);
        window.__r52swapMsg = "parse err: " + m;
      });
    };
    r.onerror = function(){ window.__r52swapMsg = "file read failed"; };
    r.readAsDataURL(wrapped);
  });

  var uiKilled = false;
  setInterval(function(){
    if (uiKilled) return;
    if (window.__r52swapMsg === 'live') {
      uiKilled = true;
      chip.textContent = '✓ loaded';
      chip.style.background = '#2a7f4f';
      chip.style.borderColor = '#8f8';
      setTimeout(function(){
        if (chip.parentNode) chip.parentNode.removeChild(chip);
        if (inp.parentNode) inp.parentNode.removeChild(inp);
      }, 2500);
    }
  }, 600);
})();