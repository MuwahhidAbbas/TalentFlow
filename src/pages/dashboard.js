/* ============================================
   Dashboard Page
   ============================================ */

import { renderSidebar, initSidebarEvents } from '../components/navbar.js';
import { icons } from '../components/icons.js';
import { getProfileCount, getProjectCount, getProfiles, getProjects } from '../db.js';
import { navigateTo } from '../router.js';

export async function renderDashboard(app) {
  app.innerHTML = `
    ${renderSidebar()}
    <main class="main-content">
      <div class="page-container page-enter">
        <div class="page-header">
          <h1 class="page-title">Dashboard</h1>
          <p class="page-subtitle">Welcome back. Here's your talent coordination overview.</p>
        </div>

        <div class="stats-grid stagger-children" id="stats-grid">
          <div class="stat-card">
            <div class="stat-icon gold">${icons.users}</div>
            <div class="stat-value" id="stat-profiles">—</div>
            <div class="stat-label">Total Profiles</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon blue">${icons.folder}</div>
            <div class="stat-value" id="stat-projects">—</div>
            <div class="stat-label">Active Projects</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon green">${icons.checkCircle}</div>
            <div class="stat-value" id="stat-recent">—</div>
            <div class="stat-label">Added This Week</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon orange">${icons.clock}</div>
            <div class="stat-value" id="stat-updated">—</div>
            <div class="stat-label">Updated Today</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-6);" class="dashboard-grid">
          <!-- Quick Actions -->
          <div class="card">
            <h3 style="margin-bottom: var(--space-5); font-size: var(--text-lg);">Quick Actions</h3>
            <div style="display: flex; flex-direction: column; gap: var(--space-3);">
              <button class="btn btn-secondary" style="justify-content: flex-start;" data-action="intake">
                ${icons.userPlus} Add New Profile
              </button>
              <button class="btn btn-secondary" style="justify-content: flex-start;" data-action="project">
                ${icons.plus} Create Project
              </button>
              <button class="btn btn-secondary" style="justify-content: flex-start;" data-action="import">
                ${icons.upload} Import CSV / JSON
              </button>
              <button class="btn btn-secondary" style="justify-content: flex-start;" data-action="directory">
                ${icons.search} Search Directory
              </button>
            </div>
          </div>

          <!-- Recent Profiles -->
          <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-5);">
              <h3 style="font-size: var(--text-lg);">Recent Profiles</h3>
              <button class="btn btn-ghost btn-sm" id="view-all-profiles">View All</button>
            </div>
            <div id="recent-profiles">
              <div class="skeleton skeleton-card" style="height: 180px;"></div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <style>
      @media (max-width: 768px) {
        .dashboard-grid { grid-template-columns: 1fr !important; }
      }
    </style>
  `;

  initSidebarEvents();

  // Quick action buttons
  document.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const actions = {
        intake: '#/intake',
        project: '#/projects',
        import: '#/import',
        directory: '#/directory',
      };
      navigateTo(actions[btn.dataset.action]);
    });
  });

  document.getElementById('view-all-profiles')?.addEventListener('click', () => navigateTo('#/directory'));

  // Load stats
  loadDashboardData();
}

async function loadDashboardData() {
  try {
    const [profileCount, projectCount, profiles] = await Promise.all([
      getProfileCount(),
      getProjectCount(),
      getProfiles(),
    ]);

    document.getElementById('stat-profiles').textContent = profileCount;
    document.getElementById('stat-projects').textContent = projectCount;

    // This week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recent = profiles.filter(p => new Date(p.created_at) > weekAgo).length;
    document.getElementById('stat-recent').textContent = recent;

    // Today
    const today = new Date().toDateString();
    const updated = profiles.filter(p => new Date(p.updated_at).toDateString() === today).length;
    document.getElementById('stat-updated').textContent = updated;

    // Recent profiles list
    const recentProfiles = profiles.slice(0, 5);
    const container = document.getElementById('recent-profiles');

    if (recentProfiles.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="padding: 2rem;">
          <p style="color: var(--text-tertiary); font-size: var(--text-sm);">No profiles yet. Add your first profile to get started.</p>
        </div>
      `;
    } else {
      container.innerHTML = recentProfiles.map(p => `
        <div class="recent-profile-item" data-email="${p.email}" style="
          display: flex; align-items: center; gap: var(--space-3);
          padding: var(--space-3); border-radius: var(--radius-md);
          cursor: pointer; transition: background 150ms ease;
        " onmouseover="this.style.background='rgba(255,255,255,0.03)'" onmouseout="this.style.background='transparent'">
          <div class="avatar" ${p.image_url ? `style="padding:0;"` : ''}>
            ${p.image_url ? `<img src="${p.image_url}" alt="${p.name}" />` : getInitials(p.name)}
          </div>
          <div style="flex:1; min-width:0;">
            <div style="font-weight:500; font-size: var(--text-sm); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${p.name}</div>
            <div style="font-size: var(--text-xs); color: var(--text-tertiary);">${p.role || p.email}</div>
          </div>
          <span class="badge badge-gray">${timeAgo(p.created_at)}</span>
        </div>
      `).join('');

      container.querySelectorAll('[data-email]').forEach(el => {
        el.addEventListener('click', () => {
          navigateTo(`#/profile/${encodeURIComponent(el.dataset.email)}`);
        });
      });
    }
  } catch (err) {
    console.error('Dashboard load error:', err);
  }
}

function getInitials(name) {
  return (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}
