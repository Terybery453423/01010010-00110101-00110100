(function(GM_xmlhttpRequest) {
  'use strict';
  
  if (window.__r52hub_stealth) return; 
  window.__r52hub_stealth = 1;

  const REPO_URL = 'https://raw.githubusercontent.com/Terybery453423/01010010-00110101-00110100/main/mods/';
  const STORE_URL = REPO_URL + 'store.json';
  const SECRET_URL = REPO_URL + '45yllar.json';
  const SIG_URL = REPO_URL + 'signature.json';
  
  let ENABLE_SECRET = localStorage.getItem('r52_secret_enabled') === 'true';
  let IS_UNLOCKED = localStorage.getItem('r52_mods_unlocked') === 'true';

  function fetchText(url) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: 'GET', 
        url: url + (url.includes('?') ? '&' : '?') + 't=' + Date.now(),
        onload: (r) => (r.status >= 200 && r.status < 300 ? resolve(r.responseText) : reject(new Error('HTTP ' + r.status))),
        onerror: () => reject(new Error('Network error'))
      });
    });
  }

  function injectPage(code) {
    const s = document.createElement('script');
    s.textContent = code;
    (document.head || document.documentElement).appendChild(s);
    s.remove();
  }

  let installed = JSON.parse(localStorage.getItem('r52_installed_mods') || '[]');
  let activeMods = JSON.parse(localStorage.getItem('r52_active_mods') || '{}');
  let cache = [];
  let currentTab = 'mods';

  async function loadMod(mod) {
    if (activeMods[mod.id] === false) return;
    try {
      const code = await fetchText(mod.url);
      injectPage(code);
    } catch(e) { console.error("Failed to load mod", e); }
  }

  async function autoLoad() {
    if (installed.length === 0) return;
    try {
      const store = JSON.parse(await fetchText(STORE_URL));
      cache = cache.concat(store);
      store.forEach(m => { if (installed.includes(m.id) && activeMods[m.id] !== false) loadMod(m); });
      if (ENABLE_SECRET) {
        const secret = JSON.parse(await fetchText(SECRET_URL));
        cache = cache.concat(secret);
        secret.forEach(m => { if (installed.includes(m.id) && activeMods[m.id] !== false) loadMod(m); });
      }
    } catch(e) {}
  }

  let tapCount = 0, tapTimer = null;
  setInterval(() => {
    const optsH = document.getElementById('optsH');
    const optCats = document.getElementById('optCats');
    const optRows = document.getElementById('optRows');
    if (!optsH || !optCats || !optRows) { currentTab = 'mods'; return; }
    document.getElementById('opts').style.zIndex = '2147483647';

    if (!optsH.dataset.hooked) {
      optsH.dataset.hooked = '1';
      optsH.addEventListener('click', () => {
        tapCount++; clearTimeout(tapTimer);
        tapTimer = setTimeout(() => tapCount = 0, 1500);
        if (tapCount >= 5) { tapCount = 0; IS_UNLOCKED = true; localStorage.setItem('r52_mods_unlocked', 'true'); ensureTabs(); }
      });
    }
    if (!optCats.dataset.hookedClicks) {
      optCats.dataset.hookedClicks = '1';
      optCats.addEventListener('click', (e) => {
        if (e.target.id !== 'r52_native_tab' && e.target.id !== 'r52_fixes_tab') currentTab = null;
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
    
    let modsWrap = document.getElementById('r52_mods_container') || document.createElement('div');
    modsWrap.id = 'r52_mods_container'; modsWrap.style.cssText = 'display:none; flex-direction:column; gap:10px; width:100%;'; optRows.parentNode.appendChild(modsWrap);
    
    let fixesWrap = document.getElementById('r52_fixes_container') || document.createElement('div');
    fixesWrap.id = 'r52_fixes_container'; fixesWrap.style.cssText = 'display:none; flex-direction:column; gap:10px; width:100%;'; optRows.parentNode.appendChild(fixesWrap);

    if (currentTab === 'mods') {
      optRows.style.display = 'none'; fixesWrap.style.display = 'none'; modsWrap.style.display = 'flex';
      renderMods(modsWrap);
      modsBtn.classList.add('sel'); fixesBtn.classList.remove('sel');
    } else if (currentTab === 'fixes') {
      optRows.style.display = 'none'; modsWrap.style.display = 'none'; fixesWrap.style.display = 'flex';
      renderFixes(fixesWrap);
      fixesBtn.classList.add('sel'); modsBtn.classList.remove('sel');
    } else {
      optRows.style.display = 'flex'; modsWrap.style.display = 'none'; fixesWrap.style.display = 'none';
      modsBtn.classList.remove('sel'); fixesBtn.classList.remove('sel');
    }
  }

  function renderFixes(container) {
    container.innerHTML = '';
    const addBtn = (title, desc, btnText, color, action) => {
      const row = document.createElement('div'); row.className = 'orow'; row.style.cssText += 'padding:10px; cursor:pointer;';
      row.innerHTML = `<div style="display:flex; flex-direction:column; align-items:flex-start; gap:2px;"><span style="font-size:13px; color:var(--ink);">${title}</span><span style="font-size:10px; color:var(--mute);">${desc}</span></div>`;
      const btn = document.createElement('b'); btn.textContent = btnText; btn.style.cssText = `background:${color}; color:#fff; cursor:pointer; padding:6px 10px; border-radius:6px; font-size:11px; min-width:60px; text-align:center;`;
      btn.onclick = action; row.appendChild(btn); container.appendChild(row);
    };

    addBtn('Apply Signature Paint', 'Applies the Neon signature livery.', 'APPLY', 'var(--card3)', async () => {
      try {
        const btn = event.target; btn.textContent = 'WAIT...';
        const sig = JSON.parse(await fetchText(SIG_URL));
        const rle = sig.garage ? sig.garage.paint.fester : sig; // Handles both formats
        
        btn.textContent = 'APPLY';
        injectPage(`
          (async function(){
            const rle = ${JSON.stringify(rle)};
            const SUPA = "https://ycdhlwgfhrdtpigmlowi.supabase.co";
            let auth = null;
            const _f = window.fetch;
            window.fetch = function(i, init) {
              try {
                var u = typeof i === "string" ? i : (i && i.url) || "";
                if (/supabase\\.co/i.test(u) && !auth) {
                  var hh = (init && init.headers) || (i && i.headers);
                  if (hh) {
                    var get = (n) => typeof hh.get === "function" ? hh.get(n) : hh[n];
                    if (get("apikey") && get("authorization")) { auth = { apikey: get("apikey"), authorization: get("authorization") }; go(); }
                  }
                }
              } catch(e){}
              return _f.apply(this, arguments);
            };
            async function go() {
              if(!auth) return alert("Drive a bit to load auth.");
              let uid = null;
              try { for (let i=0;i<localStorage.length;i++){ let k=localStorage.key(i); if(k.includes("-auth-token")){ let p=JSON.parse(localStorage.getItem(k)); let t=p.access_token.split(".")[1]; uid=JSON.parse(atob(t.replace(/-/g,"+").replace(/_/g,"/"))).sub; } } } catch(e){}
              if(!uid) return alert("No UID found.");
              
              let r = await fetch(SUPA + "/rest/v1/profiles?id=eq." + uid + "&select=garage", { headers: { apikey: auth.apikey, authorization: auth.authorization } });
              let rows = await r.json();
              let g = (rows && rows[0] && rows[0].garage) || {};
              if (!g.paint) g.paint = {};
              g.paint.fester = rle;
              if (!g.car_art) g.car_art = {};
              g.car_art.fester = Math.random().toString(36).substring(2, 10);
              
              r = await fetch(SUPA + "/rest/v1/profiles?id=eq." + uid, {
                method: "PATCH", headers: { apikey: auth.apikey, authorization: auth.authorization, "Content-Type": "application/json" },
                body: JSON.stringify({ garage: g })
              });
              if(r.ok || r.status === 204) alert("✅ Signature applied! Reload page.");
            }
            setTimeout(() => { if(!auth) alert("Drive a bit first."); }, 200);
          })();
        `);
      } catch(e) { alert("Failed to fetch signature: " + e.message); }
    });

    addBtn('Reset Car Model', 'Restores default 3D car.', 'RESET', 'var(--card3)', () => {
      injectPage(`if(window.__r52ModCleanup){if(window.__r52ModCleanup['glb_gltf_loader'])window.__r52ModCleanup['glb_gltf_loader']();if(window.__r52ModCleanup['bridge'])window.__r52ModCleanup['bridge']();}alert('Models reset.');`);
    });

    addBtn('FACTORY RESET', 'Wipes everything.', 'WIPE', '#ef4444', () => {
      if(confirm("Wipe all mods and saves?") && confirm("Are you sure?")) { localStorage.clear(); location.reload(); }
    });
  }

  async function renderMods(container) {
    if (container.dataset.loaded) return;
    container.innerHTML = 'Loading...';
    try { cache = JSON.parse(await fetchText(STORE_URL)); } catch(e) { container.innerHTML = 'Error loading store.'; return; }
    if (ENABLE_SECRET) { try { cache = cache.concat(JSON.parse(await fetchText(SECRET_URL))); } catch(e) {} }
    container.innerHTML = ''; container.dataset.loaded = '1';

    const nav = document.createElement('div'); nav.style.cssText = 'display:flex; gap:4px; margin-bottom:5px;';
    const sTab = document.createElement('button'); sTab.className = 'mi sel'; sTab.textContent = ENABLE_SECRET ? '🛒 SECRET' : '🛒 STORE'; sTab.style.cssText = 'flex:1; min-height:36px; font-size:12px;';
    const aTab = document.createElement('button'); aTab.className = 'mi'; aTab.textContent = '⚡ ACTIVE'; aTab.style.cssText = 'flex:1; min-height:36px; font-size:12px;';
    nav.appendChild(sTab); nav.appendChild(aTab); container.appendChild(nav);

    const list = document.createElement('div'); list.style.cssText = 'display:flex; flex-direction:column; gap:8px; overflow-y:auto; max-height:40vh;'; container.appendChild(list);

    let taps = 0, tTimer;
    sTab.onclick = () => {
      sTab.classList.add('sel'); aTab.classList.remove('sel'); drawStore(list);
      taps++; clearTimeout(tTimer); tTimer = setTimeout(() => taps = 0, 1500);
      if (taps >= 5) { taps = 0; ENABLE_SECRET = !ENABLE_SECRET; localStorage.setItem('r52_secret_enabled', ENABLE_SECRET); container.dataset.loaded = ''; renderMods(container); }
    };
    aTab.onclick = () => { sTab.classList.remove('sel'); aTab.classList.add('sel'); drawActive(list); };

    function drawStore(parent) {
      parent.innerHTML = '';
      cache.forEach(m => {
        const row = document.createElement('div'); row.className = 'orow'; row.style.cssText = 'padding:10px;';
        row.innerHTML = `<div style="display:flex; flex-direction:column; gap:2px;"><span style="font-size:13px; color:${m.isSecret?'#ef4444':'var(--ink)'};">${m.name}</span><span style="font-size:10px; color:var(--mute);">${m.desc}</span></div>`;
        const btn = document.createElement('b'); btn.textContent = installed.includes(m.id) ? 'UNINSTALL' : 'INSTALL'; btn.style.cssText = `background:${installed.includes(m.id)?'var(--red)':'var(--card3)'}; color:#fff; padding:6px 10px; border-radius:6px;`;
        btn.onclick = async () => {
          if (installed.includes(m.id)) {
            if (btn.dataset.c) { installed = installed.filter(x => x !== m.id); delete activeMods[m.id]; localStorage.setItem('r52_installed_mods', JSON.stringify(installed)); localStorage.setItem('r52_active_mods', JSON.stringify(activeMods)); injectPage(`if(window.__r52ModCleanup) window.__r52ModCleanup['${m.id}']();`); drawStore(parent); }
            else { btn.dataset.c = '1'; btn.textContent = 'TAP AGAIN'; btn.style.background = '#ef4444'; setTimeout(() => { btn.dataset.c = ''; btn.textContent = 'UNINSTALL'; btn.style.background = 'var(--red)'; }, 3000); }
          } else {
            installed.push(m.id); activeMods[m.id] = true; localStorage.setItem('r52_installed_mods', JSON.stringify(installed)); localStorage.setItem('r52_active_mods', JSON.stringify(activeMods)); await loadMod(m); drawStore(parent);
          }
        };
        row.appendChild(btn); parent.appendChild(row);
      });
    }

    function drawActive(parent) {
      parent.innerHTML = '';
      installed.forEach(id => {
        const m = cache.find(x => x.id === id); if (!m) return;
        const row = document.createElement('div'); row.className = 'orow'; row.style.cssText = 'padding:10px;';
        row.innerHTML = `<span style="font-size:13px;">${m.name}</span>`;
        const wrap = document.createElement('div'); wrap.style.cssText = 'display:flex; gap:6px;';
        const t = document.createElement('b'); t.textContent = activeMods[id] !== false ? 'ON' : 'OFF'; t.style.cssText = `background:${activeMods[id]!==false?'#1f7d4a':'#5a2a2a'}; color:#fff; padding:6px 12px; border-radius:6px; cursor:pointer;`;
        t.onclick = () => { activeMods[id] = activeMods[id] === false; localStorage.setItem('r52_active_mods', JSON.stringify(activeMods)); if(activeMods[id]) loadMod(m); else injectPage(`if(window.__r52ModCleanup) window.__r52ModCleanup['${id}']();`); drawActive(parent); };
        wrap.appendChild(t); row.appendChild(wrap); parent.appendChild(row);
      });
    }
    drawStore(list);
  }

  autoLoad();
})(typeof GM_xmlhttpRequest !== 'undefined' ? GM_xmlhttpRequest : null);