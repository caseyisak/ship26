(() => {
  if (window.__debugDetailedInstrumented) return 'Already instrumented (detailed)';
  window.__debugDetailedInstrumented = true;

  // Intercept fetch to track RSC requests (router.refresh() triggers these)
  var origFetch = window.fetch;
  window.__debugFetchTimings = [];
  window.fetch = function() {
    var url = arguments[0];
    if (typeof url === 'string' && (url.includes('_rsc') || url.includes('kaz-test'))) {
      var start = Date.now();
      console.log('[DEBUG-TIMING] fetch START: ' + url + ' at ' + new Date().toISOString());
      return origFetch.apply(this, arguments).then(function(response) {
        var elapsed = Date.now() - start;
        console.log('[DEBUG-TIMING] fetch END: ' + url + ' took ' + elapsed + 'ms, status=' + response.status);
        window.__debugFetchTimings.push({url: url, start: start, elapsed: elapsed, status: response.status});
        return response;
      });
    }
    return origFetch.apply(this, arguments);
  };

  // Track Next.js router events if available
  if (window.__NEXT_DATA__) {
    console.log('[DEBUG-TIMING] Next.js detected, __NEXT_DATA__ present');
  }

  // Also intercept XMLHttpRequest for completeness
  var origXHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url) {
    if (typeof url === 'string' && (url.includes('graphql') || url.includes('contentful'))) {
      console.log('[DEBUG-TIMING] XHR: ' + method + ' ' + url + ' at ' + new Date().toISOString());
    }
    return origXHROpen.apply(this, arguments);
  };

  return 'Detailed instrumentation active: fetch intercept + XHR intercept';
})()
