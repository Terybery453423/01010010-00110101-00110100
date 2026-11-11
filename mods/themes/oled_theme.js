// == OLED Theme ==
(function(){
  if (window.__r52_oled) return;
  window.__r52_oled = true;
  
  console.log("[Mod] OLED Theme loaded");

  const style = document.createElement('style');
  style.id = 'r52-theme-oled';
  style.textContent = `
    :root {
      --red: #ffffff !important;
      --redL: #cccccc !important;
      --redD: #888888 !important;
      --card: rgba(0, 0, 0, 0.95) !important;
      --card2: #0a0a0a !important;
      --card3: #141414 !important;
      --line: rgba(255, 255, 255, 0.15) !important;
      --line2: rgba(255, 255, 255, 0.3) !important;
      --ink: #ffffff !important;
      --mute: #888888 !important;
    }

    body, html, #title, #hub, #garage, #opts, .ov {
      background: #000000 !important;
    }

    .btn, .mi.sel, .carCard.sel, #bGo, .btn.pri {
      background: #ffffff !important;
      color: #000000 !important;
      box-shadow: none !important;
      border: none !important;
    }

    .btn2, .orow {
      background: #0a0a0a !important;
      border-color: #222 !important;
    }

    h1, h2, h3, .bName, .gName, .logoSvg {
      color: #ffffff !important;
      text-shadow: none !important;
    }

    /* Remove scanlines for a pure OLED look */
    #crt {
      display: none !important;
    }
  `;
  document.head.appendChild(style);

  window.__r52ModCleanup = window.__r52ModCleanup || {};
  window.__r52ModCleanup['oled_theme'] = function() {
    const el = document.getElementById('r52-theme-oled');
    if (el) el.remove();
    delete window.__r52_oled;
    console.log("[Mod] OLED Theme removed");
  };
})();