// == Crimson Theme ==
(function(){
  if (window.__r52_crimson) return;
  window.__r52_crimson = true;
  
  console.log("[Mod] Crimson Theme loaded");

  const style = document.createElement('style');
  style.id = 'r52-theme-crimson';
  style.textContent = `
    :root {
      --red: #cc0000 !important;
      --redL: #ff1a1a !important;
      --redD: #800000 !important;
      --card: rgba(15, 0, 0, 0.95) !important;
      --card2: #1a0000 !important;
      --card3: #2b0000 !important;
      --line: rgba(204, 0, 0, 0.3) !important;
      --line2: rgba(204, 0, 0, 0.6) !important;
      --ink: #ffcccc !important;
      --mute: #aa6666 !important;
    }

    body, html, #title, #hub, #garage, #opts, .ov {
      background: linear-gradient(135deg, #0a0000, #1a0000) !important;
    }

    .btn, .mi.sel, .carCard.sel, #bGo, .btn.pri {
      background: linear-gradient(90deg, #800000, #cc0000) !important;
      color: #ffffff !important;
      box-shadow: 0 0 15px rgba(204, 0, 0, 0.4) !important;
      border: none !important;
    }

    h1, h2, h3, .bName, .gName, .logoSvg {
      color: #ff1a1a !important;
      text-shadow: 0 0 10px #cc0000 !important;
    }

    #crt {
      background: repeating-linear-gradient(0deg, rgba(204, 0, 0, 0.1) 0px, transparent 2px, transparent 4px) !important;
    }
  `;
  document.head.appendChild(style);

  window.__r52ModCleanup = window.__r52ModCleanup || {};
  window.__r52ModCleanup['crimson_theme'] = function() {
    const el = document.getElementById('r52-theme-crimson');
    if (el) el.remove();
    delete window.__r52_crimson;
    console.log("[Mod] Crimson Theme removed");
  };
})();