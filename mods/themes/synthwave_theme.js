// == Synthwave Theme ==
(function(){
  if (window.__r52_synthwave) return;
  window.__r52_synthwave = true;
  
  console.log("[Mod] Synthwave Theme loaded");

  // Inject the CSS
  const style = document.createElement('style');
  style.id = 'r52-theme-synthwave';
  style.textContent = `
    /* Darken the background */
    body { background-color: #0a0015 !important; }
    
    /* Make the UI cards dark purple with pink borders */
    .box, .ov, .orow { 
      background-color: rgba(20, 0, 35, 0.95) !important; 
      border-color: #ff00ff !important;
      box-shadow: 0 0 15px rgba(255, 0, 255, 0.2) !important;
    }
    
    /* Change the text to neon cyan */
    h2, .bName, .gName, .gPos, .orow span { 
      color: #00ffff !important;
      text-shadow: 0 0 5px #00ffff !important;
    }
    
    /* Buttons */
    .btn, .mi.sel, .carCard.sel { 
      background-color: #ff00ff !important; 
      border-color: #00ffff !important;
      box-shadow: 0 0 10px #ff00ff !important;
    }
    
    /* The CRT scanline overlay */
    #crt {
      background: repeating-linear-gradient(0deg, rgba(255,0,255,0.1) 0px, transparent 2px, transparent 4px) !important;
    }
  `;
  document.head.appendChild(style);

  // Native cleanup registry (removes the CSS when disabled in the Hub)
  window.__r52ModCleanup = window.__r52ModCleanup || {};
  window.__r52ModCleanup['synthwave_theme'] = function() {
    const el = document.getElementById('r52-theme-synthwave');
    if (el) el.remove();
    delete window.__r52_synthwave;
    console.log("[Mod] Synthwave Theme removed");
  };
})();