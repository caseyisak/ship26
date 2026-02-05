(() => {
  if (window.__debugInstrumented) return 'Already instrumented';
  window.__debugInstrumented = true;
  window.__debugTimings = [];
  window.__debugDomUpdates = [];

  window.addEventListener('message', (e) => {
    const data = e.data;
    if (typeof data !== 'object' || !data) return;
    const method = data.method;
    if (method === 'ENTRY_UPDATED' || method === 'ENTRY_SAVED') {
      const entry = {
        method: method,
        time: Date.now(),
        hasSections: !!(data.data && data.data.fields && data.data.fields.sections) || !!(data.fields && data.fields.sections) || !!(data.entity && data.entity.fields && data.entity.fields.sections),
        entityId: (data.entity && data.entity.sys && data.entity.sys.id) || (data.data && data.data.sys && data.data.sys.id) || 'unknown',
        rawKeys: Object.keys(data),
      };
      window.__debugTimings.push(entry);
      console.log('[DEBUG-TIMING] postMessage: ' + method + ' at ' + new Date().toISOString() + ' ' + JSON.stringify(entry));
    }
  }, true);

  var container = document.querySelector('.container');
  if (container) {
    var observer = new MutationObserver(function(mutations) {
      var now = Date.now();
      window.__debugDomUpdates.push({ time: now, count: mutations.length });
      console.log('[DEBUG-TIMING] DOM update: ' + mutations.length + ' mutations at ' + new Date().toISOString());
    });
    observer.observe(container, { childList: true, subtree: true, characterData: true });
    return 'Instrumented: postMessage + DOM observer on .container';
  }
  return 'Instrumented: postMessage only (no .container found)';
})()
