/* ============================================
   TalentFlow — Main Entry Point
   ============================================ */

import './styles/index.css';
import './styles/animations.css';

import { registerRoute, initRouter } from './router.js';
import { renderLanding } from './pages/landing.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderDirectory } from './pages/directory.js';
import { renderProfile } from './pages/profile.js';
import { renderProjects } from './pages/projects.js';
import { renderProjectDetail } from './pages/projectDetail.js';
import { renderIntake } from './pages/intake.js';
import { renderReviewer } from './pages/reviewer.js';
import { renderTeamViews } from './pages/teamViews.js';
import { renderSharedView } from './pages/sharedView.js';
import { renderImport } from './pages/import.js';
import { renderSettings } from './pages/settings.js';

/* ---- Register Routes ---- */
registerRoute('#/',           renderLanding);
registerRoute('#/dashboard',  renderDashboard);
registerRoute('#/directory',  renderDirectory);
registerRoute('#/profile/:email', renderProfile);
registerRoute('#/projects',   renderProjects);
registerRoute('#/project/:id', renderProjectDetail);
registerRoute('#/intake',     renderIntake);
registerRoute('#/reviewer',   renderReviewer);
registerRoute('#/team-views', renderTeamViews);
registerRoute('#/view/:token', renderSharedView);
registerRoute('#/import',     renderImport);
registerRoute('#/settings',   renderSettings);

/* ---- Boot ---- */
async function boot() {
  // Hide loading screen after a minimum display time
  const minShowTime = 1800;
  const startTime = Date.now();

  // Start router
  await new Promise(resolve => setTimeout(resolve, 100)); // Let CSS paint
  initRouter();

  // Hide loading screen
  const elapsed = Date.now() - startTime;
  const remaining = Math.max(0, minShowTime - elapsed);

  setTimeout(() => {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
      loadingScreen.style.opacity = '0';
      setTimeout(() => loadingScreen.remove(), 600);
    }
    // Explicitly restore scroll - use visible to ensure it overrides any other rule
    document.body.style.overflow = 'visible';
    document.documentElement.style.overflow = 'visible';
  }, remaining);
}

boot();
