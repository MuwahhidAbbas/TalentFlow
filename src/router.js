/* ============================================
   Hash-Based SPA Router
   ============================================ */

const routes = {};
let currentCleanup = null;

export function registerRoute(hash, handler) {
  routes[hash] = handler;
}

export function navigateTo(hash) {
  window.location.hash = hash;
}

export function getCurrentRoute() {
  return window.location.hash || '#/';
}

function parseRoute(hash) {
  const parts = hash.replace('#/', '').split('/');
  for (const pattern of Object.keys(routes)) {
    const patternParts = pattern.replace('#/', '').split('/');
    if (patternParts.length !== parts.length) continue;
    const params = {};
    let match = true;
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        params[patternParts[i].slice(1)] = decodeURIComponent(parts[i]);
      } else if (patternParts[i] !== parts[i]) {
        match = false;
        break;
      }
    }
    if (match) return { handler: routes[pattern], params };
  }
  return null;
}

async function handleRoute() {
  const hash = window.location.hash || '#/';
  const app = document.getElementById('app');

  // Run cleanup from previous page
  if (currentCleanup && typeof currentCleanup === 'function') {
    currentCleanup();
    currentCleanup = null;
  }

  const result = parseRoute(hash);
  if (result) {
    // Fade transition
    app.style.opacity = '0';
    await new Promise(r => setTimeout(r, 150));
    currentCleanup = await result.handler(app, result.params);
    requestAnimationFrame(() => { app.style.opacity = '1'; });
  } else {
    // Fallback to landing
    const landing = routes['#/'];
    if (landing) {
      app.style.opacity = '0';
      await new Promise(r => setTimeout(r, 150));
      currentCleanup = await landing(app, {});
      requestAnimationFrame(() => { app.style.opacity = '1'; });
    }
  }
}

export function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}
