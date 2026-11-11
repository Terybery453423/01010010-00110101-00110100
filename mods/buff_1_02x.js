(function(){
  if (window.__r52buff_1_02x) return;
  window.__r52buff_1_02x = true;

  const ID  = 'buff_1_02x';
  const MUL = 1.02;
  const saved = { variants: {}, usa: null };
  const isNum = v => typeof v === 'number' && isFinite(v);

  function applyBuff() {
    if (Object.keys(saved.variants).length > 0) return;
    if (typeof KD === 'undefined' || !KD) return;
    let touched = 0;
    for (const k in KD) {
      const s = KD[k];
      if (!s || !isNum(s.top)) continue;
      saved.variants[k] = { top: s.top, acc: s.acc, lat: s.lat, off: s.off, tc: s.tc };
      s.top *= MUL;
      if (isNum(s.acc)) s.acc *= MUL;
      if (isNum(s.lat)) s.lat *= MUL;
      if (isNum(s.off)) s.off *= MUL;
      if (isNum(s.tc))  s.tc  *= MUL;
      touched++;
    }
    try {
      if (typeof KD_USA !== 'undefined' && KD_USA && isNum(KD_USA.top)) {
        saved.usa = { top: KD_USA.top, acc: KD_USA.acc, lat: KD_USA.lat, off: KD_USA.off, tc: KD_USA.tc };
        KD_USA.top *= MUL;
        if (isNum(KD_USA.acc)) KD_USA.acc *= MUL;
        if (isNum(KD_USA.lat)) KD_USA.lat *= MUL;
        if (isNum(KD_USA.off)) KD_USA.off *= MUL;
        if (isNum(KD_USA.tc))  KD_USA.tc  *= MUL;
        touched++;
      }
    } catch(e) {}
    if (touched > 0) console.log('[' + ID + '] applied → ' + touched + ' variants');
  }

  function revertBuff() {
    try {
      if (typeof KD !== 'undefined' && KD) {
        for (const k in saved.variants) {
          const s = KD[k]; if (!s) continue;
          const o = saved.variants[k];
          s.top = o.top;
          if (isNum(o.acc)) s.acc = o.acc;
          if (isNum(o.lat)) s.lat = o.lat;
          if (isNum(o.off)) s.off = o.off;
          if (isNum(o.tc))  s.tc  = o.tc;
        }
      }
      if (saved.usa && typeof KD_USA !== 'undefined' && KD_USA) {
        const o = saved.usa;
        KD_USA.top = o.top;
        if (isNum(o.acc)) KD_USA.acc = o.acc;
        if (isNum(o.lat)) KD_USA.lat = o.lat;
        if (isNum(o.off)) KD_USA.off = o.off;
        if (isNum(o.tc))  KD_USA.tc  = o.tc;
      }
    } catch(e) {}
    saved.variants = {};
    saved.usa = null;
  }

  const timer = setInterval(() => {
    try {
      if (typeof state !== 'string') return;
      if (state === 'race' || state === 'count') applyBuff();
    } catch(e) {}
  }, 150);

  window.__r52ModCleanup = window.__r52ModCleanup || {};
  window.__r52ModCleanup[ID] = function() {
    clearInterval(timer);
    revertBuff();
    delete window.__r52buff_1_02x;
  };
})();