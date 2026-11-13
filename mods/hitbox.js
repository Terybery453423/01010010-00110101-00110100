// == Hitbox Viewer Mod ==
(function(){
  if (window.__r52_hitbox) return;
  window.__r52_hitbox = true;

  console.log("[Mod] Hitbox Viewer loaded");

  let carGroup = null;
  let originalMesh = null;
  let hitboxGroup = null;
  let checkInterval = null;

  // 1. Wait for the game to load
  checkInterval = setInterval(() => {
    if (typeof car === 'undefined' || !car) return;
    if (typeof THREE === 'undefined') return;

    // Find the scene
    let sc = null;
    try { if (typeof cam !== "undefined" && cam) { let p = cam; while (p.parent) p = p.parent; if (p.type === "Scene") sc = p; } } catch(e){}
    if (!sc) try { if (typeof sky !== "undefined" && sky) { let p = sky; while (p.parent) p = p.parent; if (p.type === "Scene") sc = p; } } catch(e){}
    if (!sc) return;

    // Find the car group
    for (let i = sc.children.length - 1; i >= 0; i--) {
      const c = sc.children[i];
      if (c.type === "Group" && c.userData && c.userData.base) {
        carGroup = c;
        break;
      }
    }
    if (!carGroup) return;

    // Find the original mesh (scaled to 0.01)
    for (let j = 0; j < carGroup.children.length; j++) {
      const ch = carGroup.children[j];
      if (ch.type === "Group" && ch.scale && Math.abs(ch.scale.x - 0.01) < 0.001) {
        originalMesh = ch;
        break;
      }
    }
    if (!originalMesh) originalMesh = carGroup.children[0];

    if (originalMesh) {
      clearInterval(checkInterval);
      buildHitbox();
    }
  }, 200);

  function buildHitbox() {
    if (!originalMesh) return;
    
    if (hitboxGroup && hitboxGroup.parent) {
      hitboxGroup.parent.remove(hitboxGroup);
    }

    // Force update world matrices to ensure accurate calculation
    originalMesh.updateMatrixWorld(true);

    // 1. Calculate world bounding box
    const worldBox = new THREE.Box3().setFromObject(originalMesh);
    
    // 2. Convert the 8 corners of the world box into the local space of the originalMesh
    // This perfectly accounts for any scaling (0.01) or offset the game applies.
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
        originalMesh.worldToLocal(c);
        localBox.expandByPoint(c);
    });
    
    const size = localBox.getSize(new THREE.Vector3());
    const center = localBox.getCenter(new THREE.Vector3());

    // 3. Create geometry (it will inherit the 0.01 scale from originalMesh)
    const geo = new THREE.BoxGeometry(size.x, size.y, size.z);
    const edges = new THREE.EdgesGeometry(geo);
    const lineMat = new THREE.LineBasicMaterial({ 
      color: 0x00ff00, // Neon green
      depthTest: false,
      transparent: true,
      opacity: 0.8
    });
    
    const line = new THREE.LineSegments(edges, lineMat);

    hitboxGroup = new THREE.Group();
    hitboxGroup.position.copy(center);
    hitboxGroup.add(line);

    // 4. Attach directly to originalMesh so it inherits all offsets/rotations
    originalMesh.add(hitboxGroup);

    console.log("[Mod] Hitbox drawn. Size:", size);
  }

  // --- NATIVE CLEANUP REGISTRY ---
  window.__r52ModCleanup = window.__r52ModCleanup || {};
  window.__r52ModCleanup['hitbox'] = function() {
    clearInterval(checkInterval);
    if (hitboxGroup && hitboxGroup.parent) {
      hitboxGroup.parent.remove(hitboxGroup);
    }
    delete window.__r52_hitbox;
    console.log("[Mod] Hitbox Viewer cleaned up natively.");
  };
})();