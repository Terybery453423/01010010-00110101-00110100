// == Trippy Paint Generator ==
(function(){
  if (window.__r52_trippyMod) return;
  window.__r52_trippyMod = true;

  console.log("[Mod] Trippy loaded");

  const SUPA = "https://ycdhlwgfhrdtpigmlowi.supabase.co";
  let capturedAuth = null;
  let currentRle = null;
  let currentCanvas = null;
  
  let curMode = 0;
  let curHue = Math.random();
  let curFreq = 0.06;
  let curColours = 16;
  let busy = false;

  // --- AUTH HOOK ---
  const originalFetch = window.fetch;
  window.fetch = function(input, init) {
    try {
      var u = typeof input === "string" ? input : (input && input.url) || "";
      if (/supabase\.co/i.test(u) && !capturedAuth) {
        var hh = (init && init.headers) || (input && input.headers);
        if (hh) {
          var get = function(n){ 
            if (typeof hh.get === "function") return hh.get(n); 
            if (Array.isArray(hh)){ for(var i=0;i<hh.length;i++) if(hh[i][0].toLowerCase()===n.toLowerCase()) return hh[i][1]; return null; } 
            for (var k in hh) if (k.toLowerCase()===n.toLowerCase()) return hh[k]; return null; 
          };
          var a = get("apikey"), t = get("authorization");
          if (a && t) capturedAuth = { apikey: a, authorization: t };
        }
      }
    } catch(e){}
    return originalFetch.apply(this, arguments);
  };

  function getUserId() {
    try { 
      for (var i=0;i<localStorage.length;i++){ 
        var k=localStorage.key(i); 
        if (/^sb-.*-auth-token$/.test(k)){ 
          var raw=localStorage.getItem(k); if(!raw) continue; 
          var p=JSON.parse(raw); var tok=p&&p.access_token; if(!tok) continue; 
          var parts=tok.split("."); if(parts.length<2) continue; 
          var pad=parts[1].replace(/-/g,"+").replace(/_/g,"/"); while(pad.length%4) pad+="="; 
          var pay=JSON.parse(atob(pad)); if(pay&&pay.sub) return pay.sub; 
        } 
      } 
    } catch(e){} 
    return null; 
  }

  // --- MATH HELPERS ---
  var B36 = "0123456789abcdefghijklmnopqrstuvwxyz";
  function b36(n){ if(n===0) return "0"; var s=""; while(n>0){ s=B36[n%36]+s; n=Math.floor(n/36); } return s; }
  function randToken(){ var s=""; for(var i=0;i<8;i++) s+=B36[Math.floor(Math.random()*36)]; return s; }
  function rgbToHex(c){ var t=function(x){ return x<16?"0"+x.toString(16):x.toString(16); }; return "#"+t(c[0])+t(c[1])+t(c[2]); }
  
  function hsv(h, s, v){
    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);
    var r, g, b;
    switch (i % 6) {
      case 0: r=v; g=t; b=p; break;
      case 1: r=q; g=v; b=p; break;
      case 2: r=p; g=v; b=t; break;
      case 3: r=p; g=q; b=v; break;
      case 4: r=t; g=p; b=v; break;
      case 5: r=v; g=p; b=q; break;
    }
    return [Math.round(r*255), Math.round(g*255), Math.round(b*255)];
  }

  // --- GENERATOR ---
  function generatePattern(w, h, mode, hueBase, freq, nColours) {
    w = w || 212; h = h || 186;
    nColours = Math.max(2, Math.min(36, nColours || 16));
    freq = freq || 0.06;
    
    var cv = document.createElement("canvas"); cv.width = w; cv.height = h;
    var ctx = cv.getContext("2d");
    var img = ctx.createImageData(w, h);
    var d = img.data;
    var cx = w / 2, cy = h / 2;
    var t = Math.random() * 100;
    var pent = [];
    for (var pk = 0; pk < 5; pk++) {
      var pkang = (pk * Math.PI * 2) / 5;
      pent.push({ cos: Math.cos(pkang), sin: Math.sin(pkang) });
    }
    var stripeWidth = Math.max(4, Math.round(1 / Math.max(freq, 0.01)));
    var sin45 = Math.SQRT1_2;
    var sat = 1.0;

    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var i = (y * w + x) * 4;
        var v;
        var hueOverride = null;

        if (mode === 0) {
          var p = Math.sin(x * freq) + Math.sin(y * freq * 1.3) + Math.sin((x + y) * freq * 0.7) + Math.sin((x - y) * freq * 0.9);
          var r0 = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
          p += Math.sin(r0 * freq * 1.5);
          v = p / 5;
        } else if (mode === 1) {
          var dx = x - cx, dy = y - cy;
          var rr = Math.sqrt(dx * dx + dy * dy);
          var ang = Math.atan2(dy, dx);
          v = Math.sin(rr * freq * 2.5 + ang * 4);
        } else if (mode === 2) {
          var g1 = Math.sin(x * freq * 2) * Math.cos(y * freq * 2);
          var g2 = Math.sin((x * 0.7 + y * 0.7) * freq * 3);
          v = g1 * 0.6 + g2 * 0.4;
        } else if (mode === 3) {
          var dx = x - cx, dy = y - cy;
          var rr = Math.sqrt(dx * dx + dy * dy);
          var ang = Math.atan2(dy, dx);
          var seg = Math.PI / 4;
          ang = ((ang % seg) + seg) % seg;
          ang = Math.abs(ang - seg / 2);
          v = Math.sin(rr * freq * 1.5 + ang * 6);
        } else if (mode === 4) {
          v = Math.sin((x * 0.3 + Math.sin(y * freq * 2) * 20) * freq);
        } else if (mode === 5) {
          var sum = 0;
          for (var wk = 0; wk < 5; wk++) {
            var proj = x * pent[wk].cos + y * pent[wk].sin;
            sum += Math.cos(proj * freq * 1.2 + wk * 0.7);
          }
          var dxp = x - cx, dyp = y - cy;
          var rp = Math.sqrt(dxp * dxp + dyp * dyp);
          v = (sum / 5) + 0.35 * Math.sin(rp * freq * 0.8);
        } else if (mode === 6) {
          var stripeH = Math.floor(y / stripeWidth);
          hueOverride = (hueBase + (stripeH / 24) % 1) % 1;
          v = 1;
        } else if (mode === 7) {
          var stripeV = Math.floor(x / stripeWidth);
          hueOverride = (hueBase + (stripeV / 24) % 1) % 1;
          v = 1;
        } else if (mode === 8) {
          var diag = (x + y) * sin45;
          var stripeD = Math.floor(diag / stripeWidth);
          hueOverride = (hueBase + (stripeD / 24) % 1) % 1;
          v = 1;
        } else {
          v = Math.sin((x * 0.3 + Math.sin(y * freq * 2) * 20) * freq);
        }

        var hue;
        if (hueOverride !== null) {
          hue = hueOverride;
        } else {
          hue = (hueBase + v * 0.4 + t * 0.001) % 1;
          if (hue < 0) hue += 1;
        }

        var val = 1.0;
        if (hueOverride === null) {
          sat = 0.75;
          val = 0.55 + 0.45 * (v * 0.5 + 0.5);
        } else {
          sat = 1.0;
        }

        var c = hsv(hue, sat, val);
        c[0] = Math.min(c[0], 232);
        c[1] = Math.min(c[1], 232);
        c[2] = Math.min(c[2], 232);
        d[i] = c[0]; d[i+1] = c[1]; d[i+2] = c[2]; d[i+3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);

    var data = img.data;
    var N = nColours;
    var pal = [];

    if (mode >= 6) {
      for (var c2 = 0; c2 < N; c2++) {
        var hueS = (hueBase + c2 / N) % 1;
        var cc = hsv(hueS, 1.0, 1.0);
        cc[0] = Math.min(cc[0], 232);
        cc[1] = Math.min(cc[1], 232);
        cc[2] = Math.min(cc[2], 232);
        pal.push(cc);
      }
    } else {
      for (var c3 = 0; c3 < N; c3++) {
        var hue3 = (hueBase + c3 / N) % 1;
        pal.push(hsv(hue3, sat, 0.85));
      }
      pal = pal.map(function(p){ return [Math.min(p[0], 232), Math.min(p[1], 232), Math.min(p[2], 232)]; });
    }

    var idx = new Uint8Array(w * h);
    for (var p2 = 0; p2 < w * h; p2++) {
      var r = data[p2*4], g = data[p2*4+1], b = data[p2*4+2];
      var best = 0, bestD = Infinity;
      for (var q = 0; q < N; q++) {
        var dr = r - pal[q][0], dg = g - pal[q][1], db = b - pal[q][2];
        var dd = dr*dr + dg*dg + db*db;
        if (dd < bestD) { bestD = dd; best = q; }
      }
      idx[p2] = best;
    }

    var prev = ctx.createImageData(w, h);
    var pv = prev.data;
    for (var p3 = 0; p3 < w*h; p3++) {
      var col = pal[idx[p3]];
      pv[p3*4] = col[0]; pv[p3*4+1] = col[1]; pv[p3*4+2] = col[2]; pv[p3*4+3] = 255;
    }
    ctx.putImageData(prev, 0, 0);

    var parts = [], last = -1, run = 0;
    for (var tt = 0; tt < w*h; tt++) {
      if (idx[tt] === last) { run++; }
      else { if (run > 0) parts.push(b36(run) + ":" + b36(last)); last = idx[tt]; run = 1; }
    }
    if (run > 0) parts.push(b36(run) + ":" + b36(last));
    var hexPal = pal.map(rgbToHex);
    
    currentRle = { v:2, s:0.04, w:w, h:h, p:hexPal, r:parts.join(",") };
    currentCanvas = cv;
  }

  // --- UPLOAD ---
  async function uploadPattern() {
    if (!capturedAuth) { infoEl.textContent = "Error: Auth missing. Drive a bit to load auth."; return; }
    if (!currentRle) { infoEl.textContent = "Error: Nothing built."; return; }
    var uid = getUserId(); 
    if (!uid) { infoEl.textContent = "Error: UID missing. Log in."; return; }
    var ck = "fester";

    infoEl.textContent = "Uploading...";
    
    try {
      localStorage.setItem("rd_paint2_" + ck, JSON.stringify(currentRle));
      localStorage.setItem("rd_garage_at", String(Date.now()));
      localStorage.setItem("rd_garage_uid", uid);
    } catch(e) {}

    currentCanvas.toBlob(async function(blob) {
      try {
        let r = await fetch(SUPA + "/storage/v1/object/cars/" + uid + "/" + ck, {
          method: "POST",
          headers: { apikey: capturedAuth.apikey, authorization: capturedAuth.authorization, "Content-Type": "image/png", "x-upsert": "true" },
          body: blob
        });
        if (!r.ok && r.status !== 200) throw new Error("png " + r.status);
        
        var token = randToken();
        r = await fetch(SUPA + "/rest/v1/profiles?id=eq." + uid, {
          method: "PATCH",
          headers: { apikey: capturedAuth.apikey, authorization: capturedAuth.authorization, "Content-Type": "application/json", "Prefer": "return=minimal" },
          body: JSON.stringify({ car_art: (function(){ var o={}; o[ck]=token; return o; })() })
        });
        if (!r.ok && r.status !== 204) throw new Error("car_art " + r.status);
        
        r = await fetch(SUPA + "/rest/v1/profiles?id=eq." + uid + "&select=garage", {
          headers: { apikey: capturedAuth.apikey, authorization: capturedAuth.authorization }
        });
        var rows = await r.json();
        
        var g = (rows && rows[0] && rows[0].garage) || {};
        if (!g.car) g.car = ck;
        if (!g.wheels) g.wheels = {};
        if (!g.wheels[ck]) g.wheels[ck] = { s:"steel", c:"#202020" };
        if (!g.paint) g.paint = {};
        g.paint[ck] = currentRle;
        try { delete g.at; } catch(e){}
        
        r = await fetch(SUPA + "/rest/v1/profiles?id=eq." + uid, {
          method: "PATCH",
          headers: { apikey: capturedAuth.apikey, authorization: capturedAuth.authorization, "Content-Type": "application/json", "Prefer": "return=minimal" },
          body: JSON.stringify({ garage: g })
        });
        
        if (r.ok || r.status === 204) {
          infoEl.textContent = "SUCCESS! Reload to see.";
          infoEl.style.color = "#4ade80";
        } else {
          throw new Error("server " + r.status);
        }
      } catch(e) {
        infoEl.textContent = "Error: " + e.message;
        infoEl.style.color = "#ef4444";
      }
    }, "image/png");
  }

  // --- UI ---
  var chip = document.createElement('div');
  chip.id = 'r52tpChip';
  chip.style.cssText = 'position:fixed;right:6px;bottom:340px;z-index:9999;padding:8px 12px;background:#7a2a7a;color:#fff;font:700 10px monospace;border-radius:8px;cursor:pointer;text-align:center;min-width:130px;border:1px solid #f8f;-webkit-tap-highlight-color:transparent';
  chip.textContent = '🌀 TRIPPY';
  document.body.appendChild(chip);

  // --- TOP PREVIEW BOX ---
  var previewBox = document.createElement('div');
  previewBox.id = 'r52tpPreview';
  previewBox.style.cssText = 'position:fixed;top:8%;left:50%;transform:translateX(-50%);z-index:999999;background:rgba(14,16,20,0.95);border:2px solid #f8f;border-radius:12px;padding:10px;display:none;flex-direction:column;align-items:center;gap:8px;box-shadow:0 10px 30px rgba(0,0,0,0.9);pointer-events:auto;';
  document.body.appendChild(previewBox);

  var title = document.createElement('div');
  title.textContent = '🌀 TRIPPY PATTERN';
  title.style.cssText = 'color:#f8f;font:800 14px monospace;letter-spacing:0.1em;';
  previewBox.appendChild(title);

  var previewCanvas = document.createElement('canvas');
  previewCanvas.width = 212; previewCanvas.height = 186;
  previewCanvas.style.cssText = 'width:212px;height:186px;image-rendering:pixelated;border:1px solid #333;border-radius:6px;background:#000;';
  previewBox.appendChild(previewCanvas);

  var infoEl = document.createElement('div');
  infoEl.style.cssText = 'color:#aaa;font:600 10px monospace;text-align:center;min-height:14px;';
  infoEl.textContent = 'Generating...';
  previewBox.appendChild(infoEl);

  // --- BOTTOM CONTROLS BOX ---
  var controlsBox = document.createElement('div');
  controlsBox.id = 'r52tpControls';
  controlsBox.style.cssText = 'position:fixed;bottom:15%;left:50%;transform:translateX(-50%);z-index:999999;background:rgba(14,16,20,0.95);border:2px solid #f8f;border-radius:12px;padding:10px;display:none;flex-direction:column;gap:8px;width:min(90vw, 300px);box-shadow:0 10px 30px rgba(0,0,0,0.9);pointer-events:auto;';
  document.body.appendChild(controlsBox);

  var btnRow = document.createElement('div');
  btnRow.style.cssText = 'display:flex;gap:6px;width:100%;';
  controlsBox.appendChild(btnRow);

  var applyBtn = document.createElement('div');
  applyBtn.textContent = '✓ APPLY';
  applyBtn.style.cssText = 'flex:1;padding:12px;background:#1f7d4a;color:#fff;font:800 12px monospace;border-radius:6px;cursor:pointer;border:2px solid #4ade80;text-align:center;';
  btnRow.appendChild(applyBtn);

  var rollBtn = document.createElement('div');
  rollBtn.textContent = '🎲 NEW';
  rollBtn.style.cssText = 'flex:1;padding:12px;background:#4a2a7a;color:#fff;font:800 12px monospace;border-radius:6px;cursor:pointer;border:2px solid #c8f;text-align:center;';
  btnRow.appendChild(rollBtn);

  var modeBtn = document.createElement('div');
  modeBtn.textContent = 'MODE 0';
  modeBtn.style.cssText = 'flex:1;padding:12px;background:#2a4a7a;color:#fff;font:800 12px monospace;border-radius:6px;cursor:pointer;border:2px solid #8cf;text-align:center;';
  btnRow.appendChild(modeBtn);

  var closeBtn = document.createElement('div');
  closeBtn.textContent = '✕ CLOSE';
  closeBtn.style.cssText = 'width:100%;padding:10px;background:#5a2a2a;color:#fff;font:800 12px monospace;border-radius:6px;cursor:pointer;border:2px solid #ef4444;text-align:center;';
  controlsBox.appendChild(closeBtn);

  // --- UI LOGIC ---
  function regen() {
    if (busy) return;
    busy = true;
    infoEl.textContent = 'Generating mode ' + curMode + '...';
    infoEl.style.color = '#aaa';
    
    setTimeout(function() {
      generatePattern(212, 186, curMode, curHue, curFreq, curColours);
      var ctx = previewCanvas.getContext('2d');
      ctx.clearRect(0, 0, 212, 186);
      if (currentCanvas) ctx.drawImage(currentCanvas, 0, 0);
      infoEl.textContent = 'Ready (mode ' + curMode + ')';
      busy = false;
    }, 50);
  }

  rollBtn.onclick = function() {
    curHue = Math.random();
    curFreq = 0.03 + Math.random() * 0.1;
    curColours = 8 + Math.floor(Math.random() * 20);
    regen();
  };

  modeBtn.onclick = function() {
    curMode = (curMode + 1) % 9;
    modeBtn.textContent = 'MODE ' + curMode;
    regen();
  };

  applyBtn.onclick = function() {
    if (busy) return;
    uploadPattern();
  };

  chip.onclick = function() {
    if (busy) return;
    var isHidden = previewBox.style.display === 'none';
    previewBox.style.display = isHidden ? 'flex' : 'none';
    controlsBox.style.display = isHidden ? 'flex' : 'none';
    if (isHidden && !currentCanvas) regen();
  };

  closeBtn.onclick = function() {
    previewBox.style.display = 'none';
    controlsBox.style.display = 'none';
  };

  // --- NATIVE CLEANUP REGISTRY ---
  window.__r52ModCleanup = window.__r52ModCleanup || {};
  window.__r52ModCleanup['trippy'] = function() {
    window.fetch = originalFetch; // Restore fetch hook
    if (chip && chip.parentNode) chip.parentNode.removeChild(chip);
    if (previewBox && previewBox.parentNode) previewBox.parentNode.removeChild(previewBox);
    if (controlsBox && controlsBox.parentNode) controlsBox.parentNode.removeChild(controlsBox);
    delete window.__r52_trippyMod;
    console.log("[Mod] Trippy cleaned up natively.");
  };

})();