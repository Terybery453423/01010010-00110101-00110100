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

    // Find the original mesh (the one scaled to 0.01)
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
    // If we already have a hitbox, remove it first (in case the car model changed)
    if (hitboxGroup && hitboxGroup.parent) {
      hitboxGroup.parent.remove(hitboxGroup);
    }

    // Calculate the exact bounding box of the car mesh
    const box3 = new THREE.Box3().setFromObject(originalMesh);
    const size = box3.getSize(new THREE.Vector3());
    const center = box3.getCenter(new THREE.Vector3());

    // Create the wireframe geometry
    const geo = new THREE.BoxGeometry(size.x, size.y, size.z);
    const edges = new THREE.EdgesGeometry(geo);
    const lineMat = new THREE.LineBasicMaterial({ 
      color: 0x00ff00, // Neon green
      depthTest: false, // Render on top of the car
      transparent: true,
      opacity: 0.8
    });
    
    const line = new THREE.LineSegments(edges, lineMat);

    // Create a wrapper group so we can position the box at the car's center
    hitboxGroup = new THREE.Group();
    hitboxGroup.position.copy(center);
    hitboxGroup.add(line);

    // Add the hitbox to the exact same parent as the car mesh
    // (so it inherits the 0.01 scale and rotates perfectly with the car)
    originalMesh.parent.add(hitboxGroup);

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