// == Bowling Ball Mod ==
(function(){
  if (window.__r52_bowlingBall) return;
  window.__r52_bowlingBall = true;

  console.log("[Mod] Bowling Ball loaded");

  let carGroup = null;
  let originalMesh = null;
  let ballMesh = null;
  let ballWrap = null;
  let reqId = null;
  let lastTime = performance.now();

  // 1. Create a canvas texture for the bowling ball
  function createBowlingTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Base vibrant blue color
    ctx.fillStyle = '#2563eb'; 
    ctx.fillRect(0, 0, 512, 512);

    // Add some "swirls" for a marble effect
    ctx.strokeStyle = '#60a5fa'; 
    ctx.lineWidth = 20;
    ctx.beginPath();
    ctx.arc(256, 256, 200, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.strokeStyle = '#93c5fd'; 
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(200, 200, 150, 0, Math.PI * 2);
    ctx.stroke();

    // Glossy highlight (makes it look like a shiny bowling ball)
    const grad = ctx.createRadialGradient(200, 200, 10, 256, 256, 256);
    grad.addColorStop(0, 'rgba(255,255,255,0.6)'); // Strong white highlight
    grad.addColorStop(0.5, 'rgba(255,255,255,0.0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.6)'); // Darker edges for 3D depth
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Draw the 3 finger holes
    ctx.fillStyle = '#000000';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 10;

    // Hole 1
    ctx.beginPath();
    ctx.arc(256, 200, 25, 0, Math.PI * 2);
    ctx.fill();
    // Hole 2
    ctx.beginPath();
    ctx.arc(220, 260, 25, 0, Math.PI * 2);
    ctx.fill();
    // Hole 3
    ctx.beginPath();
    ctx.arc(292, 260, 25, 0, Math.PI * 2);
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }

  // 2. Wait for the car and scene to load
  const initInterval = setInterval(() => {
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

    // Find the original mesh
    for (let j = 0; j < carGroup.children.length; j++) {
      const ch = carGroup.children[j];
      if (ch.type === "Group" && ch.scale && Math.abs(ch.scale.x - 0.01) < 0.001) {
        originalMesh = ch;
        break;
      }
    }
    if (!originalMesh) originalMesh = carGroup.children[0];

    clearInterval(initInterval);
    buildBall();
  }, 200);

  function buildBall() {
    if (!carGroup || !originalMesh) return;

    // Hide the actual car
    originalMesh.visible = false;

    // Create a wrapper group (matches the original car scale of 0.01)
    ballWrap = new THREE.Group();
    ballWrap.scale.setScalar(0.01);
    
    // Create the bowling ball geometry (radius ~ 150 units)
    const geo = new THREE.SphereGeometry(150, 32, 32);
    const mat = new THREE.MeshStandardMaterial({
      map: createBowlingTexture(),
      roughness: 0.1, // Very shiny
      metalness: 0.8
    });
    
    ballMesh = new THREE.Mesh(geo, mat);
    ballMesh.position.y = 150; // Sit on the ground
    ballMesh.rotation.x = Math.PI / 4; // Tilt the holes

    ballWrap.add(ballMesh);
    carGroup.add(ballWrap);

    lastTime = performance.now();
    reqId = requestAnimationFrame(animate);
  }

  function animate(time) {
    reqId = requestAnimationFrame(animate);

    if (!ballMesh || !carGroup) return;
    
    // Make sure the original car stays hidden
    if (originalMesh && originalMesh.visible) originalMesh.visible = false;

    const dt = (time - lastTime) / 1000;
    lastTime = time;

    // Get forward speed (vf) from the game's car object
    const speed = car.vf || 0;

    // Roll the ball visually based on speed
    if (ballMesh) {
      ballMesh.rotation.x += (speed * dt) * 0.015;
      // Also rotate around Y slightly when steering
      ballMesh.rotation.y = (car.h || 0) * 0.1; 
    }
  }

  // --- NATIVE CLEANUP REGISTRY ---
  window.__r52ModCleanup = window.__r52ModCleanup || {};
  window.__r52ModCleanup['bowling_ball'] = function() {
    clearInterval(initInterval);
    if (reqId) cancelAnimationFrame(reqId);
    
    if (ballWrap && ballWrap.parent) ballWrap.parent.remove(ballWrap);
    if (originalMesh) originalMesh.visible = true;
    
    delete window.__r52_bowlingBall;
    console.log("[Mod] Bowling Ball cleaned up natively.");
  };
})();