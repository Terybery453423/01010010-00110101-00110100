(function(GM_xmlhttpRequest, unsafeWindow) {
  'use strict';
  
  if (window.__r52hub_stealth) return; 
  window.__r52hub_stealth = 1;

  const REPO_URL = 'https://raw.githubusercontent.com/Terybery453423/01010010-00110101-00110100/main/mods/';
  const STORE_URL = REPO_URL + 'store.json';
  const SECRET_STORE_URL = REPO_URL + '45yllar.json';
  const SIGNATURE_URL = REPO_URL + 'signature.json';
  
  const ALLOWED_PREFIXES = [REPO_URL];

  let ENABLE_SECRET_STORE = localStorage.getItem('r52_secret_enabled') === 'true';
  let IS_UNLOCKED = localStorage.getItem('r52_mods_unlocked') === 'true';

  function fetchText(url) {
    return new Promise((resolve, reject) => {
      if (!ALLOWED_PREFIXES.some((p) => url.startsWith(p))) return reject(new Error('URL not allowed'));
      if (!GM_xmlhttpRequest) return reject(new Error('GM_xmlhttpRequest missing'));
      const bust = url + (url.includes('?') ? '&' : '?') + 'cb=' + Math.floor(Date.now() / 60000);
      try {
        const ret = GM_xmlhttpRequest({
          method: 'GET', url: bust, responseType: 'text', timeout: 15000,
          onload: (r) => (r.status >= 200 && r.status < 300 ? resolve(r.responseText) : reject(new Error('HTTP ' + r.status))),
          onerror: () => reject(new Error('GM network error')),
          ontimeout: () => reject(new Error('timeout')),
        });
      } catch (e) { reject(e); }
    });
  }

  function injectPage(code, label) {
    return new Promise((resolve, reject) => {
      let blocked = false;
      const onViolation = () => { blocked = true; };
      document.addEventListener('securitypolicyviolation', onViolation, true);
      const s = document.createElement('script');
      s.textContent = code + '\n//# sourceURL=' + label;
      (document.head || document.documentElement).appendChild(s);
      s.remove();
      setTimeout(() => {
        document.removeEventListener('securitypolicyviolation', onViolation, true);
        if (blocked) reject(new Error('page CSP blocked'));
        else resolve();
      }, 60);
    });
  }

  unsafeWindow.__r52DownloadFile = function(url, id, onSuccess, onError) {
    if (!GM_xmlhttpRequest) { if (onError) onError('GM_xmlhttpRequest missing'); return; }
    let ui = document.getElementById('r52-dl-ui');
    if (!ui) {
      ui = document.createElement('div');
      ui.id = 'r52-dl-ui';
      ui.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:2147483647;background:rgba(14,16,20,0.95);color:#fff;padding:15px;border-radius:10px;font:600 14px monospace;text-align:center;border:2px solid #4ade80;box-shadow:0 10px 30px rgba(0,0,0,0.8);min-width:200px;';
      document.body.appendChild(ui);
    }
    ui.innerHTML = `Downloading ${id}...<br><span id="r52-dl-prog" style="color:#4ade80;font-size:24px;">0%</span>`;

    GM_xmlhttpRequest({
      method: 'GET', url: url, responseType: 'blob',
      onprogress: function(r) {
        if (r.lengthComputable) {
          const p = Math.round((r.loaded / r.total) * 100);
          const pEl = document.getElementById('r52-dl-prog');
          if (pEl) pEl.innerText = p + '%';
        }
      },
      onload: function(r) {
        if (r.status >= 200 && r.status < 300) {
          const pEl = document.getElementById('r52-dl-prog');
          if (pEl) pEl.innerText = 'Parsing...';
          const reader = new FileReader();
          reader.onloadend = function() {
            if (onSuccess) onSuccess(reader.result);
            if (ui) ui.remove();
          };
          reader.readAsDataURL(r.response);
        } else {
          if (onError) onError('HTTP ' + r.status);
          if (ui) ui.remove();
        }
      },
      onerror: function() { if (onError) onError('Network Error'); if (ui) ui.remove(); }
    });
  };

  let installed = JSON.parse(localStorage.getItem('r52_installed_mods') || '[]');
  let activeMods = JSON.parse(localStorage.getItem('r52_active_mods') || '{}');
  let globalModsCache = []; 
  let currentTab = 'mods'; 

  async function loadMod(mod) {
    if (activeMods[mod.id] === false) return;
    try {
      const code = await fetchText(mod.url);
      await injectPage(code, 'r52-mod-' + mod.id + '.js');
    } catch(e) { console.error(`[R52 Hub] Failed to load ${mod.name}`, e); }
  }

  async function autoLoad() {
    if (installed.length === 0) return;
    try {
      const storeText = await fetchText(STORE_URL);
      const store = JSON.parse(storeText);
      globalModsCache = globalModsCache.concat(store);
      store.forEach(mod => { if (installed.includes(mod.id) && activeMods[mod.id] !== false) loadMod(mod); });
      
      if (ENABLE_SECRET_STORE) {
        const secretText = await fetchText(SECRET_STORE_URL);
        const secret = JSON.parse(secretText);
        globalModsCache = globalModsCache.concat(secret);
        secret.forEach(mod => { if (installed.includes(mod.id) && activeMods[mod.id] !== false) loadMod(mod); });
      }
    } catch(e) { console.error("[R52 Hub] Auto-load failed", e); }
  }

  let tapCount = 0;
  let tapTimer = null;

  setInterval(() => {
    const optsH = document.getElementById('optsH');
    const optCats = document.getElementById('optCats');
    const optRows = document.getElementById('optRows');
    const optsMenu = document.getElementById('opts');
    
    if (!optsH || !optCats || !optRows || !optsMenu) { currentTab = 'mods'; return; }

    optsMenu.style.zIndex = '2147483647';

    if (!optsH.dataset.r52Hooked) {
      optsH.dataset.r52Hooked = 'true';
      optsH.addEventListener('click', () => {
        tapCount++;
        clearTimeout(tapTimer);
        tapTimer = setTimeout(() => { tapCount = 0; }, 1500);
        if (tapCount >= 5) { tapCount = 0; IS_UNLOCKED = true; localStorage.setItem('r52_mods_unlocked', 'true'); ensureTabs(); }
      });
    }
    if (!optCats.dataset.r52HookedClicks) {
      optCats.dataset.r52HookedClicks = 'true';
      optCats.addEventListener('click', (e) => {
        if (e.target.id !== 'r52_native_tab' && e.target.id !== 'r52_fixes_tab' && !e.target.closest('#r52_native_tab') && !e.target.closest('#r52_fixes_tab')) {
          currentTab = null;
        }
      });
    }
    if (IS_UNLOCKED) ensureTabs();
  }, 250);

  function ensureTabs() {
    const optCats = document.getElementById('optCats');
    const optRows = document.getElementById('optRows');
    if (!optCats || !optRows) return;

    let modsBtn = document.getElementById('r52_native_tab');
    if (!modsBtn) {
      modsBtn = document.createElement('button'); modsBtn.id = 'r52_native_tab'; modsBtn.className = 'mi'; modsBtn.innerHTML = '🔧 MODS'; modsBtn.style.color = '#ef4444';
      optCats.appendChild(modsBtn);
      modsBtn.onclick = (e) => { e.preventDefault(); currentTab = 'mods'; ensureTabs(); };
    }

    let fixesBtn = document.getElementById('r52_fixes_tab');
    if (!fixesBtn) {
      fixesBtn = document.createElement('button'); fixesBtn.id = 'r52_fixes_tab'; fixesBtn.className = 'mi'; fixesBtn.innerHTML = '🛠️ FIXES'; fixesBtn.style.color = '#4ade80';
      optCats.appendChild(fixesBtn);
      fixesBtn.onclick = (e) => { e.preventDefault(); currentTab = 'fixes'; ensureTabs(); };
    }

    let modsContainer = document.getElementById('r52_mods_container');
    if (!modsContainer) {
      modsContainer = document.createElement('div'); modsContainer.id = 'r52_mods_container'; modsContainer.style.cssText = 'display:none; flex-direction:column; gap:10px; width:100%;';
      optRows.parentNode.appendChild(modsContainer);
    }

    let fixesContainer = document.getElementById('r52_fixes_container');
    if (!fixesContainer) {
      fixesContainer = document.createElement('div'); fixesContainer.id = 'r52_fixes_container'; fixesContainer.style.cssText = 'display:none; flex-direction:column; gap:10px; width:100%;';
      optRows.parentNode.appendChild(fixesContainer);
    }

    if (currentTab === 'mods') {
      optRows.style.display = 'none'; fixesContainer.style.display = 'none'; modsContainer.style.display = 'flex';
      renderModsUI(modsContainer);
      modsBtn.classList.add('sel'); fixesBtn.classList.remove('sel');
    } else if (currentTab === 'fixes') {
      optRows.style.display = 'none'; modsContainer.style.display = 'none'; fixesContainer.style.display = 'flex';
      renderFixesUI(fixesContainer);
      fixesBtn.classList.add('sel'); modsBtn.classList.remove('sel');
    } else {
      optRows.style.display = 'flex'; modsContainer.style.display = 'none'; fixesContainer.style.display = 'none';
      modsBtn.classList.remove('sel'); fixesBtn.classList.remove('sel');
    }
  }

  function renderFixesUI(container) {
    container.innerHTML = '';
    
    const addFixBtn = (title, desc, btnText, btnColor, action) => {
      const row = document.createElement('div'); row.className = 'orow'; row.style.cssText += 'padding:10px; cursor:pointer;';
      row.innerHTML = `<div style="display:flex; flex-direction:column; align-items:flex-start; gap:2px;"><span style="font-size:13px; color:var(--ink);">${title}</span><span style="font-size:10px; color:var(--mute); text-transform:none; line-height:1.2;">${desc}</span></div>`;
      const btn = document.createElement('b'); btn.textContent = btnText; btn.style.cssText = `background:${btnColor}; color:#fff; cursor:pointer; padding:6px 10px; border-radius:6px; font-size:11px; min-width:60px; text-align:center;`;
      btn.onclick = action;
      row.appendChild(btn);
      container.appendChild(row);
    };

    addFixBtn('Apply Signature Paint', 'Applies the Neon signature livery to your car.', 'APPLY', 'var(--card3)', async () => {
      try {
        const btn = event.target;
        const ogText = btn.textContent;
        btn.textContent = 'WAIT...'; btn.style.background = '#5a2a2a';
        
        const sigText = await fetchText(SIGNATURE_URL);
        let rleData;
        
        try {
          const parsed = JSON.parse(sigText);
          // Handle if user pasted the whole PATCH payload
          if (parsed.garage && parsed.garage.paint && parsed.garage.paint.fester) {
            rleData = parsed.garage.paint.fester;
          } else {
            // Handle if user pasted just the RLE object
            rleData = parsed;
          }
        } catch(e) {
          throw new Error("Invalid JSON in signature.json");
        }
        
        btn.textContent = 'APPLY'; btn.style.background = 'var(--card3)';
        
        injectPage(`
          (function(){
            const SIGNATURE_RLE = ${JSON.stringify(rleData)};
            const SUPA = "https://ycdhlwgfhrdtpigmlowi.supabase.co";
            let auth = null;

            const _f = window.fetch;
            window.fetch = function(input, init) {
              try {
                var u = typeof input === "string" ? input : (input && input.url) || "";
                if (/supabase\\.co/i.test(u) && !auth) {
                  var hh = (init && init.headers) || (input && input.headers);
                  if (hh) {
                    var get = function(n){ 
                      if (typeof hh.get === "function") return hh.get(n); 
                      if (Array.isArray(hh)){ for(var i=0;i<hh.length;i++) if(hh[i][0].toLowerCase()===n.toLowerCase()) return hh[i][1]; return null; } 
                      for (var k in hh) if (k.toLowerCase()===n.toLowerCase()) return hh[k]; return null; 
                    };
                    var a = get("apikey"), t = get("authorization");
                    if (a && t) { auth = { apikey: a, authorization: t }; applyArt(); }
                  }
                }
              } catch(e){}
              return _f.apply(this, arguments);
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

            async function applyArt() {
              if (!auth) return;
              var uid = getUserId();
              if (!uid) { alert("Not logged in!"); return; }
              
              alert("Applying signature paint...");
              var ck = "fester";
              var token = Math.random().toString(36).substring(2, 10);

              try {
                localStorage.setItem("rd_paint2_" + ck, JSON.stringify(SIGNATURE_RLE));
                localStorage.setItem("rd_garage_at", String(Date.now()));
                localStorage.setItem("rd_garage_uid", uid);

                let r = await fetch(SUPA + "/rest/v1/profiles?id=eq." + uid + "&select=garage", {
                  headers: { apikey: auth.apikey, authorization: auth.authorization }
                });
                let rows = await r.json();
                let g = (rows && rows[0] && rows[0].garage) || {};
                
                if (!g.paint) g.paint = {};
                g.paint[ck] = SIGNATURE_RLE;
                if (!g.car_art) g.car_art = {};
                g.car_art[ck] = token;

                r = await fetch(SUPA + "/rest/v1/profiles?id=eq." + uid, {
                  method: "PATCH",
                  headers: { apikey: auth.apikey, authorization: auth.authorization, "Content-Type": "application/json", "Prefer": "return=minimal" },
                  body: JSON.stringify({ garage: g })
                });

                if (r.ok || r.status === 204) {
                  alert("✅ Signature paint applied successfully! Reload the page to see it.");
                } else {
                  alert("Failed: " + r.status);
                }
              } catch(e) {
                alert("Error: " + e.message);
              }
            }
            
            setTimeout(function() {
              if (!auth) alert("Please drive a little or open the garage to load auth, then try again.");
            }, 200);
          })();
        `, 'fix-art.js');
      } catch (e) {
        alert("Failed to fetch signature from GitHub: " + e.message);
      }
    });

    addFixBtn('Reset Car Model', 'Removes any custom 3D models and restores the default car.', 'RESET', 'var(--card3)', () => {
      injectPage(`
        if (window.__r52ModCleanup) {
          if (window.__r52ModCleanup['glb_gltf_loader']) window.__r52ModCleanup['glb_gltf_loader']();
          if (window.__r52ModCleanup['bridge']) window.__r52ModCleanup['bridge']();
        }
        if (window.__r52unswap) window.__r52unswap();
        if (window.__r52unswapBridge) window.__r52unswapBridge();
        window.__r52stash = null; window.__r52bridgeStash = null;
        window.__r52swapMsg = "idle"; window.__r52bridgeSwapMsg = "idle";
        alert("Car models reset.");
      `, 'fix-reset.js');
    });

    addFixBtn('Fix Camera FOV', 'Resets the camera field of view if it got stuck.', 'FIX', 'var(--card3)', () => {
      injectPage(`
        try {
          var c = window.cam || window.camera;
          if (c) { c.fov = 60; c.updateProjectionMatrix(); alert("Camera FOV reset to 60."); } 
          else {
            var s = window.scene; var found = null;
            if (s) s.traverse(function(o){ if (o.isCamera) found = o; });
            if (found) { found.fov = 60; found.updateProjectionMatrix(); alert("Camera FOV reset via scene."); } 
            else { alert("Camera not found."); }
          }
        } catch(e) { alert("Error: " + e.message); }
      `, 'fix-cam.js');
    });

    addFixBtn('Clear Game Data', 'Wipes game saves, ghosts, and paint data (keeps login).', 'CLEAR', 'var(--red)', () => {
      if (!confirm("Are you sure? This will wipe your local progress, paints, and ghosts!")) return;
      var cleared = 0;
      var patterns = [/^rd_202/, /^rd_ghost$/, /^rd_skids$/, /^rd_paint2_/, /^rd_art2_/, /^rd_wheels$/, /^rd_recent_cols$/, /^rd_rqdrop$/, /^rallydaily_/];
      for (var i = localStorage.length - 1; i >= 0; i--) {
        var k = localStorage.key(i);
        if (!k) continue;
        for (var p = 0; p < patterns.length; p++) {
          if (patterns[p].test(k)) { localStorage.removeItem(k); cleared++; break; }
        }
      }
      alert('Cleared ' + cleared + ' game keys.');
    });

    addFixBtn('FACTORY RESET', 'WIPES EVERYTHING. Logs you out, uninstalls mods, deletes saves.', 'WIPE', '#ef4444', () => {
      if (!confirm("⚠️ WARNING: This will log you out, uninstall all mods, and delete all game saves. Are you sure?")) return;
      if (!confirm("Are you absolutely sure? This CANNOT be undone.")) return;
      localStorage.clear(); sessionStorage.clear(); location.reload();
    });
  }

  async function renderModsUI(container) {
    if (container.dataset.loaded === 'true') return;
    container.innerHTML = '<div style="color:#aaa; text-align:center;">Loading...</div>';
    let allMods = [];
    try { allMods = JSON.parse(await fetchText(STORE_URL)); } catch(e) { container.innerHTML = '<div style="color:red;text-align:center;">Fetch Error: ' + e.message + '</div>'; return; }
    if (ENABLE_SECRET_STORE) { try { const s = JSON.parse(await fetchText(SECRET_STORE_URL)); s.forEach(m=>m.isSecret=true); allMods = allMods.concat(s); } catch(e) {} }
    
    globalModsCache = allMods;
    container.innerHTML = '';
    container.dataset.loaded = 'true';

    const nav = document.createElement('div'); nav.style.cssText = 'display:flex; gap:4px; margin-bottom:5px;';
    const storeTab = document.createElement('button'); storeTab.className = 'mi sel'; storeTab.textContent = ENABLE_SECRET_STORE ? '🛒 SECRET' : '🛒 STORE'; storeTab.style.cssText = 'flex:1; min-height:36px; font-size:12px;'; storeTab.style.color = ENABLE_SECRET_STORE ? '#ef4444' : '';
    const activeTab = document.createElement('button'); activeTab.className = 'mi'; activeTab.textContent = '⚡ ACTIVE'; activeTab.style.cssText = 'flex:1; min-height:36px; font-size:12px;';
    nav.appendChild(storeTab); nav.appendChild(activeTab); container.appendChild(nav);

    const listWrap = document.createElement('div'); listWrap.style.cssText = 'display:flex; flex-direction:column; gap:8px; overflow-y:auto; max-height:40vh; padding-right:5px;'; container.appendChild(listWrap);

    function switchTab(isStore) {
      if (isStore) { storeTab.classList.add('sel'); activeTab.classList.remove('sel'); renderStoreList(listWrap); }
      else { activeTab.classList.add('sel'); storeTab.classList.remove('sel'); renderActiveList(listWrap); }
    }
    
    let storeTaps = 0;
    let storeTapTimer = null;

    storeTab.onclick = () => {
      switchTab(true); 
      storeTaps++;
      clearTimeout(storeTapTimer);
      storeTapTimer = setTimeout(() => { storeTaps = 0; }, 1500);

      if (storeTaps >= 5) {
        storeTaps = 0;
        ENABLE_SECRET_STORE = !ENABLE_SECRET_STORE;
        localStorage.setItem('r52_secret_enabled', ENABLE_SECRET_STORE);
        
        storeTab.textContent = ENABLE_SECRET_STORE ? '🛒 SECRET' : '🛒 STORE';
        storeTab.style.color = ENABLE_SECRET_STORE ? '#ef4444' : '';
        
        container.dataset.loaded = 'false';
        renderModsUI(container);
      }
    };
    
    activeTab.onclick = () => { 
      storeTaps = 0;
      switchTab(false); 
    }; 
    
    renderStoreList(listWrap);

    function renderStoreList(parent) {
      parent.innerHTML = '';
      allMods.forEach(mod => {
        const isInstalled = installed.includes(mod.id);
        const row = document.createElement('div'); row.className = 'orow'; row.style.cssText += `cursor:pointer; border-color:${mod.isSecret ? 'rgba(239,68,68,0.5)' : 'var(--line)'}; padding:10px;`;
        row.innerHTML = `<div style="display:flex; flex-direction:column; align-items:flex-start; gap:2px;"><span style="font-size:13px; color:${mod.isSecret ? '#ef4444' : 'var(--ink)'};">${mod.name}</span><span style="font-size:10px; color:var(--mute); text-transform:none; white-space:normal; line-height:1.2;">${mod.desc}</span></div>`;
        
        const btn = document.createElement('b'); btn.textContent = isInstalled ? 'UNINSTALL' : 'INSTALL'; btn.style.cssText = `background:${isInstalled ? 'var(--red)' : 'var(--card3)'}; color:#fff; cursor:pointer; padding:6px 10px; border-radius:6px; font-size:11px; min-width:60px; text-align:center;`;
        
        btn.onclick = async (e) => {
          e.stopPropagation();
          if (installed.includes(mod.id)) {
            if (btn.dataset.confirming === 'true') {
              clearTimeout(btn._t); installed = installed.filter(id => id !== mod.id); delete activeMods[mod.id];
              btn.textContent = 'INSTALL'; btn.style.background = 'var(--card3)'; btn.dataset.confirming = 'false';
              localStorage.setItem('r52_installed_mods', JSON.stringify(installed)); localStorage.setItem('r52_active_mods', JSON.stringify(activeMods));
              injectPage(`if (window.__r52ModCleanup && window.__r52ModCleanup["${mod.id}"]) window.__r52ModCleanup["${mod.id}"]();`, 'cleanup.js');
            } else {
              btn.dataset.confirming = 'true'; btn.textContent = 'TAP AGAIN'; btn.style.background = '#ef4444';
              btn._t = setTimeout(() => { btn.dataset.confirming = 'false'; btn.textContent = 'UNINSTALL'; btn.style.background = 'var(--red)'; }, 3000);
            }
          } else {
            btn.textContent = 'LOADING...'; btn.style.background = '#5a2a2a';
            installed.push(mod.id); activeMods[mod.id] = true; 
            await loadMod(mod); 
            btn.textContent = 'UNINSTALL'; btn.style.background = 'var(--red)';
            localStorage.setItem('r52_installed_mods', JSON.stringify(installed)); localStorage.setItem('r52_active_mods', JSON.stringify(activeMods));
          }
        };
        row.appendChild(btn); parent.appendChild(row);
      });
    }

    function renderActiveList(parent) {
      parent.innerHTML = '';
      installed.forEach(id => {
        const mod = globalModsCache.find(m => m.id === id); if (!mod) return;
        const isOn = activeMods[id] !== false;
        const row = document.createElement('div'); row.className = 'orow'; row.style.cssText += `border-color:${isOn ? '#4ade80' : 'var(--line)'}; padding:10px;`;
        row.innerHTML = `<span style="font-size:13px; color:var(--ink); margin-right:10px;">${mod.name}</span>`;
        const actionWrap = document.createElement('div'); actionWrap.style.cssText = 'display:flex; gap:6px; align-items:center;';
        
        const toggle = document.createElement('b'); toggle.textContent = isOn ? 'ON' : 'OFF'; toggle.style.cssText = `background:${isOn ? '#1f7d4a' : '#5a2a2a'}; color:#fff; cursor:pointer; padding:6px 12px; border-radius:6px; min-width:45px; text-align:center; font-size:11px;`;
        toggle.onclick = () => {
          activeMods[id] = !isOn; localStorage.setItem('r52_active_mods', JSON.stringify(activeMods)); renderActiveList(parent); 
          if (activeMods[id]) loadMod(mod); 
          else injectPage(`if (window.__r52ModCleanup && window.__r52ModCleanup["${id}"]) window.__r52ModCleanup["${id}"]();`, 'cleanup.js');
        };

        const unBtn = document.createElement('b'); unBtn.textContent = 'UNINSTALL'; unBtn.style.cssText = 'background:var(--card3); color:#ef4444; border:1px solid #ef4444; cursor:pointer; padding:6px 8px; border-radius:6px; font-size:11px; min-width:70px; text-align:center;';
        unBtn.onclick = () => {
          if (unBtn.dataset.confirming === 'true') {
            clearTimeout(unBtn._t); installed = installed.filter(i => i !== id); delete activeMods[id];
            localStorage.setItem('r52_installed_mods', JSON.stringify(installed)); localStorage.setItem('r52_active_mods', JSON.stringify(activeMods));
            injectPage(`if (window.__r52ModCleanup && window.__r52ModCleanup["${id}"]) window.__r52ModCleanup["${id}"]();`, 'cleanup.js'); renderActiveList(parent);
          } else {
            unBtn.dataset.confirming = 'true'; unBtn.textContent = 'SURE?'; unBtn.style.background = '#ef4444'; unBtn.style.color = '#fff';
            unBtn._t = setTimeout(() => { unBtn.dataset.confirming = 'false'; unBtn.textContent = 'UNINSTALL'; unBtn.style.background = 'var(--card3)'; unBtn.style.color = '#ef4444'; }, 3000);
          }
        };
        actionWrap.appendChild(toggle); actionWrap.appendChild(unBtn); row.appendChild(actionWrap); parent.appendChild(row);
      });
    }
  }
  autoLoad();

})(typeof GM_xmlhttpRequest !== 'undefined' ? GM_xmlhttpRequest : null, window);