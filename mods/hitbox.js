// == Hitbox Viewer Mod (True Physics Box) ==
(function(){
  if (window.__r52_hitbox) return;
  window.__r52_hitbox = true;

  console.log("[Mod] True Hitbox Viewer loaded");

  let hitboxGroup = null;
  let checkInterval = null;

  checkInterval = setInterval(() => {
    if (typeof car === 'undefined' || !car) return;
    if (typeof THREE === 'undefined') return;

    let sc = null;
    try { if (typeof cam !== "undefined" && cam) { let p = cam; while (p.parent) p = p.parent; if (p.type === "Scene") sc = p; } } catch(e){}
    if (!sc) return;

    let carGroup = null;
    for (let i = sc.children.length - 1; i >= 0; i--) {
      const c = sc.children[i];
      if (c.type === "Group" && c.userData && c.userData.base) {
        carGroup = c;
        break;
      }
    }
    if (!carGroup) return;

    // FIND THE ORIGINAL HIDDEN MESH (The true physics box)
    let originalMesh = null;
    for (let j = 0; j < carGroup.children.length; j++) {
      const ch = carGroup.children[j];
      // Look for the group scaled to 0.01
      if (ch.type === "Group" && ch.scale && Math.abs(ch.scale.x - 0.01) < 0.001) {
        originalMesh = ch;
        break;
      }
    }
    
    // If the original mesh doesn't exist (some custom loaders delete it), we can't draw the physics box
    if (!originalMesh) {
      if (!document.getElementById('r52_hb_err')) {
         console.warn("Original physics mesh not found. Cannot draw true hitbox.");
         const err = document.createElement('div');
         err.id = 'r52_hb_err';
         err.style.cssText = 'position:fixed;top:10px;left:10px;background:red;color:white;padding:5px;font-size:10px;z-index:9999;';
         err.textContent = "Hitbox error: Original mesh missing";
         document.body.appendChild(err);
      }
      return;
    }

    clearInterval(checkInterval);
    buildHitbox(carGroup, originalMesh);
  }, 500);

  function buildHitbox(carGroup, originalMesh) {
    if (hitboxGroup && hitboxGroup.parent) hitboxGroup.parent.remove(hitboxGroup);

    originalMesh.updateMatrixWorld(true);
    
    // Calculate the box of the hidden original mesh
    const worldBox = new THREE.Box3().setFromObject(originalMesh);
    
    // Convert to the carGroup's local space to avoid offset bugs
    const localBox = new THREE.Box3();
    const min = worldBox.min, max = worldBox.max;
    const corners = [
        new THREE.Vector3(min.x, min.y, min.z),
        new THREE.Vector3(max.x, min.y, min.z),
        new THREE.Vector3(min.x, max.y, min.z),
        new THREE.Vector3(max.x, max.y, min.z),
        new THREE.Vector3(min.x, min.y, max.z),
        new THREE.Vector3(max.x, min.y, max.z),
        new THREE.Vector3(min.x, max.y, max.z),
        new THREE.Vector3(max.x, max.y, max.z)
    ];
    
    corners.forEach(c => {
        carGroup.worldToLocal(c);
        localBox.expandByPoint(c);
    });
    
    const size = localBox.getSize(new THREE.Vector3());
    const center = localBox.getCenter(new THREE.Vector3());

    const geo = new THREE.BoxGeometry(size.x, size.y, size.z);
    const edges = new THREE.EdgesGeometry(geo);
    const lineMat = new THREE.LineBasicMaterial({ 
      color: 0x00ff00, 
      depthTest: false, 
      transparent: true,
      opacity: 0.8
    });
    
    const line = new THREE.LineSegments(edges, lineMat);

    hitboxGroup = new THREE.Group();
    hitboxGroup.position.copy(center);
    hitboxGroup.add(line);

    // Attach directly to the carGroup so it follows the car perfectly
    carGroup.add(hitboxGroup);

    console.log("[Mod] True hitbox drawn. Size:", size);
  }

  window.__r52ModCleanup = window.__r52ModCleanup || {};
  window.__r52ModCleanup['hitbox'] = function() {
    clearInterval(checkInterval);
    if (hitboxGroup && hitboxGroup.parent) {
      hitboxGroup.parent.remove(hitboxGroup);
    }
    const err = document.getElementById('r52_hb_err');
    if (err) err.remove();
    delete window.__r52_hitbox;
    console.log("[Mod] Hitbox Viewer cleaned up natively.");
  };
})();