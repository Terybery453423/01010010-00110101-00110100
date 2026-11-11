// == Synthwave Theme ==
(function(){
  if (window.__r52_synthwave) return;
  window.__r52_synthwave = true;
  
  console.log("[Mod] Synthwave Theme loaded");

  const style = document.createElement('style');
  style.id = 'r52-theme-synthwave';
  style.textContent = `
    /* 1. Hijack the Game's Color Variables */
    :root {
      --red: #ff00ff !important;          /* Neon Pink */
      --redL: #ff55ff !important;
      --redD: #990099 !important;
      --card: rgba(20, 0, 35, 0.95) !important; /* Deep Purple */
      --card2: #1a0033 !important;
      --card3: #2a0052 !important;
      --line: rgba(0, 255, 255, 0.3) !important; /* Cyan borders */
      --line2: #00ffff !important;
      --ink: #00ffff !important;          /* Cyan Text */
      --mute: #aa88ff !important;         /* Light Purple Text */
    }

    /* 2. Backgrounds */
    body, html, #title, #hub, #garage, #opts, .ov {
      background: linear-gradient(135deg, #0a0015, #1a0033) !important;
    }

    /* 3. Buttons and Selections */
    .btn, .mi.sel, .carCard.sel, #bGo, .btn.pri {
      background: linear-gradient(90deg, #ff00ff, #00ffff) !important;
      color: #000 !important;
      box-shadow: 0 0 15px #ff00ff !important;
      border: none !important;
      text-shadow: none !important;
    }

    /* 4. Text Glow */
    h1, h2, h3, .bName, .gName, .logoSvg {
      color: #00ffff !important;
      text-shadow: 0 0 10px #00ffff !important;
    }

    /* 5. Scanlines */
    #crt {
      background: repeating-linear-gradient(0deg, rgba(255,0,255,0.15) 0px, transparent 2px, transparent 4px) !important;
    }
  `;
  document.head.appendChild(style);

  // Cleanup
  window.__r52ModCleanup = window.__r52ModCleanup || {};
  window.__r52ModCleanup['synthwave_theme'] = function() {
    const el = document.getElementById('r52-theme-synthwave');
    if (el) el.remove();
    delete window.__r52_synthwave;
    console.log("[Mod] Synthwave Theme removed");
  };
})();