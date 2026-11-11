(function(){
  if (window.__r52_more_tries) return;
  window.__r52_more_tries = true;

  const ID = 'more_tries';

  function wipe() {
    try {
      const K = 'sb-ycdhlwgfhrdtpigmlowi-auth-token';
      const old = localStorage.getItem(K);
      if (old) localStorage.setItem('__r52_prev_' + Date.now(), old);
      localStorage.removeItem(K);
      localStorage.removeItem('rd_anon');
      localStorage.removeItem('rd_platform');
      console.log('[' + ID + '] cleared — reload twice for fresh guest attempts');
    } catch(e) {
      console.warn('[' + ID + '] failed:', e.message);
    }
  }

  wipe();

  window.__r52ModCleanup = window.__r52ModCleanup || {};
  window.__r52ModCleanup[ID] = function() {
    try {
      localStorage.removeItem('rd_anon');
      localStorage.removeItem('rd_platform');
    } catch(e) {}
    delete window.__r52_more_tries;
  };
})();