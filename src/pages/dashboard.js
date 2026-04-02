/* ============================================
   Dashboard Page — Premium Redesign
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
        <!-- Hero Header with gradient mesh -->
        <div class="dash-hero">
          <div class="dash-hero-glow"></div>
          <div class="dash-hero-content">
            <div class="dash-greeting">
              <span class="dash-greeting-badge">${getGreeting()} ✦</span>
            </div>
            <h1 class="dash-title">Command Center</h1>
            <p class="dash-subtitle">Your talent coordination at a glance. Track, evaluate, and manage with precision.</p>
          </div>
          <div class="dash-hero-orb"></div>
        </div>

        <!-- Stats Row -->
        <div class="dash-stats stagger-children">
          <div class="dash-stat-card dash-stat-gold">
            <div class="dash-stat-ring">
              <svg viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(201,169,110,0.1)" stroke-width="3"/>
                <circle cx="40" cy="40" r="34" fill="none" stroke="url(#goldGrad)" stroke-width="3" stroke-dasharray="214" stroke-dashoffset="214" stroke-linecap="round" class="ring-progress" data-stat="profiles"/>
              </svg>
              <span class="dash-stat-ring-val" id="stat-profiles">—</span>
            </div>
            <div class="dash-stat-info">
              <span class="dash-stat-label">Total Profiles</span>
              <span class="dash-stat-sub">in your directory</span>
            </div>
          </div>

          <div class="dash-stat-card dash-stat-blue">
            <div class="dash-stat-ring">
              <svg viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(96,165,250,0.1)" stroke-width="3"/>
                <circle cx="40" cy="40" r="34" fill="none" stroke="url(#blueGrad)" stroke-width="3" stroke-dasharray="214" stroke-dashoffset="214" stroke-linecap="round" class="ring-progress" data-stat="projects"/>
              </svg>
              <span class="dash-stat-ring-val" id="stat-projects">—</span>
            </div>
            <div class="dash-stat-info">
              <span class="dash-stat-label">Active Projects</span>
              <span class="dash-stat-sub">in progress</span>
            </div>
          </div>

          <div class="dash-stat-card dash-stat-green">
            <div class="dash-stat-ring">
              <svg viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(74,222,128,0.1)" stroke-width="3"/>
                <circle cx="40" cy="40" r="34" fill="none" stroke="url(#greenGrad)" stroke-width="3" stroke-dasharray="214" stroke-dashoffset="214" stroke-linecap="round" class="ring-progress" data-stat="recent"/>
              </svg>
              <span class="dash-stat-ring-val" id="stat-recent">—</span>
            </div>
            <div class="dash-stat-info">
              <span class="dash-stat-label">Added This Week</span>
              <span class="dash-stat-sub">new profiles</span>
            </div>
          </div>

          <div class="dash-stat-card dash-stat-orange">
            <div class="dash-stat-ring">
              <svg viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(251,191,36,0.1)" stroke-width="3"/>
                <circle cx="40" cy="40" r="34" fill="none" stroke="url(#orangeGrad)" stroke-width="3" stroke-dasharray="214" stroke-dashoffset="214" stroke-linecap="round" class="ring-progress" data-stat="updated"/>
              </svg>
              <span class="dash-stat-ring-val" id="stat-updated">—</span>
            </div>
            <div class="dash-stat-info">
              <span class="dash-stat-label">Updated Today</span>
              <span class="dash-stat-sub">profile changes</span>
            </div>
          </div>
        </div>

        <!-- SVG Gradient Defs (hidden) -->
        <svg width="0" height="0" style="position:absolute;">
          <defs>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#c9a96e"/><stop offset="100%" stop-color="#e2c992"/></linearGradient>
            <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#3b82f6"/><stop offset="100%" stop-color="#60a5fa"/></linearGradient>
            <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#22c55e"/><stop offset="100%" stop-color="#4ade80"/></linearGradient>
            <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#fbbf24"/></linearGradient>
          </defs>
        </svg>

        <!-- Main Grid -->
        <div class="dash-grid">
          <!-- Quick Actions — Bento Box style -->
          <div class="dash-actions-panel">
            <h3 class="dash-section-title">Quick Actions</h3>
            <div class="dash-action-grid">
              <button class="dash-action-btn" data-action="intake">
                <div class="dash-action-icon-wrap gold">${icons.userPlus}</div>
                <span class="dash-action-label">Add Profile</span>
                <span class="dash-action-desc">New talent entry</span>
              </button>
              <button class="dash-action-btn" data-action="project">
                <div class="dash-action-icon-wrap blue">${icons.plus}</div>
                <span class="dash-action-label">New Project</span>
                <span class="dash-action-desc">Create workspace</span>
              </button>
              <button class="dash-action-btn" data-action="import">
                <div class="dash-action-icon-wrap green">${icons.upload}</div>
                <span class="dash-action-label">Import Data</span>
                <span class="dash-action-desc">CSV / JSON batch</span>
              </button>
              <button class="dash-action-btn" data-action="directory">
                <div class="dash-action-icon-wrap orange">${icons.search}</div>
                <span class="dash-action-label">Directory</span>
                <span class="dash-action-desc">Browse all profiles</span>
              </button>
            </div>
          </div>

          <!-- Recent Profiles -->
          <div class="dash-recent-panel">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
              <h3 class="dash-section-title" style="margin-bottom:0;">Recent Profiles</h3>
              <button class="btn btn-ghost btn-sm" id="view-all-profiles" style="color:var(--accent-gold);">View All →</button>
            </div>
            <div id="recent-profiles">
              <div class="dash-skeleton-list">
                <div class="skeleton" style="height:52px; border-radius:12px;"></div>
                <div class="skeleton" style="height:52px; border-radius:12px;"></div>
                <div class="skeleton" style="height:52px; border-radius:12px;"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Active Projects Section -->
        <div class="dash-projects-section">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
            <h3 class="dash-section-title" style="margin-bottom:0;">Active Projects</h3>
            <button class="btn btn-ghost btn-sm" id="view-all-projects" style="color:var(--accent-gold);">View All →</button>
          </div>
          <div id="dash-projects-list">
            <div class="dash-skeleton-list" style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px;">
              <div class="skeleton" style="height:100px; border-radius:16px;"></div>
              <div class="skeleton" style="height:100px; border-radius:16px;"></div>
              <div class="skeleton" style="height:100px; border-radius:16px;"></div>
            </div>
          </div>
        </div>

        <div style="height: 40px;"></div>
      </div>
    </main>

    <style>
      /* ---- Dashboard Hero ---- */
      .dash-hero {
        position: relative;
        padding: 48px 40px 40px;
        border-radius: 24px;
        background: linear-gradient(135deg, rgba(201,169,110,0.06) 0%, rgba(28,28,40,0.8) 50%, rgba(96,165,250,0.04) 100%);
        border: 1px solid var(--border-subtle);
        margin-bottom: 32px;
        overflow: hidden;
      }
      .dash-hero-glow {
        position: absolute;
        top: -60px; right: -60px;
        width: 250px; height: 250px;
        background: radial-gradient(circle, rgba(201,169,110,0.12) 0%, transparent 70%);
        border-radius: 50%;
        pointer-events: none;
        animation: float 6s ease-in-out infinite;
      }
      .dash-hero-orb {
        position: absolute;
        bottom: -30px; left: 40%;
        width: 180px; height: 180px;
        background: radial-gradient(circle, rgba(96,165,250,0.06) 0%, transparent 70%);
        border-radius: 50%;
        pointer-events: none;
        animation: float 8s ease-in-out infinite reverse;
      }
      .dash-hero-content { position: relative; z-index: 1; }
      .dash-greeting-badge {
        display: inline-block;
        padding: 4px 14px;
        background: rgba(201,169,110,0.08);
        border: 1px solid rgba(201,169,110,0.15);
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 500;
        color: var(--accent-gold);
        letter-spacing: 1px;
        text-transform: uppercase;
        margin-bottom: 16px;
      }
      .dash-title {
        font-family: var(--font-heading);
        font-size: clamp(2rem, 4vw, 2.8rem);
        font-weight: 800;
        background: linear-gradient(135deg, var(--text-primary) 0%, var(--accent-gold-light) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: 8px;
        line-height: 1.1;
      }
      .dash-subtitle {
        font-size: 1rem;
        color: var(--text-secondary);
        max-width: 500px;
        line-height: 1.6;
      }

      /* ---- Stats Cards ---- */
      .dash-stats {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
        margin-bottom: 32px;
      }
      .dash-stat-card {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 20px;
        border-radius: 20px;
        background: rgba(28,28,40,0.5);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid var(--border-subtle);
        transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
        cursor: default;
      }
      .dash-stat-card:hover {
        transform: translateY(-3px);
        border-color: rgba(255,255,255,0.1);
        box-shadow: 0 12px 40px rgba(0,0,0,0.3);
      }
      .dash-stat-gold:hover { box-shadow: 0 12px 40px rgba(201,169,110,0.08); }
      .dash-stat-blue:hover { box-shadow: 0 12px 40px rgba(96,165,250,0.08); }
      .dash-stat-green:hover { box-shadow: 0 12px 40px rgba(74,222,128,0.08); }
      .dash-stat-orange:hover { box-shadow: 0 12px 40px rgba(251,191,36,0.08); }

      .dash-stat-ring {
        position: relative;
        width: 64px; height: 64px;
        flex-shrink: 0;
      }
      .dash-stat-ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }
      .dash-stat-ring-val {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: var(--font-heading);
        font-size: 1.25rem;
        font-weight: 700;
      }
      .ring-progress {
        transition: stroke-dashoffset 1.5s cubic-bezier(0.16,1,0.3,1);
      }
      .dash-stat-info { display: flex; flex-direction: column; gap: 2px; }
      .dash-stat-label { font-weight: 600; font-size: 0.875rem; color: var(--text-primary); }
      .dash-stat-sub { font-size: 0.7rem; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.5px; }

      /* ---- Section Title ---- */
      .dash-section-title {
        font-family: var(--font-heading);
        font-size: 1.15rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 20px;
      }

      /* ---- Main Grid ---- */
      .dash-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
        margin-bottom: 32px;
      }

      /* ---- Actions Panel ---- */
      .dash-actions-panel {
        padding: 28px;
        border-radius: 20px;
        background: rgba(28,28,40,0.4);
        backdrop-filter: blur(12px);
        border: 1px solid var(--border-subtle);
      }
      .dash-action-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .dash-action-btn {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
        padding: 20px;
        border-radius: 16px;
        background: rgba(255,255,255,0.02);
        border: 1px solid var(--border-subtle);
        cursor: pointer;
        transition: all 0.25s cubic-bezier(0.16,1,0.3,1);
        text-align: left;
        font-family: var(--font-body);
        color: var(--text-primary);
      }
      .dash-action-btn:hover {
        transform: translateY(-2px);
        border-color: rgba(255,255,255,0.12);
        background: rgba(255,255,255,0.04);
        box-shadow: 0 8px 24px rgba(0,0,0,0.2);
      }
      .dash-action-icon-wrap {
        width: 36px; height: 36px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .dash-action-icon-wrap svg { width: 18px; height: 18px; }
      .dash-action-icon-wrap.gold { background: rgba(201,169,110,0.12); color: var(--accent-gold); }
      .dash-action-icon-wrap.blue { background: rgba(96,165,250,0.12); color: var(--info); }
      .dash-action-icon-wrap.green { background: rgba(74,222,128,0.12); color: var(--success); }
      .dash-action-icon-wrap.orange { background: rgba(251,191,36,0.12); color: var(--warning); }
      .dash-action-label { font-weight: 600; font-size: 0.875rem; }
      .dash-action-desc { font-size: 0.7rem; color: var(--text-tertiary); }

      /* ---- Recent Panel ---- */
      .dash-recent-panel {
        padding: 28px;
        border-radius: 20px;
        background: rgba(28,28,40,0.4);
        backdrop-filter: blur(12px);
        border: 1px solid var(--border-subtle);
      }
      .dash-profile-row {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 12px 14px;
        border-radius: 14px;
        cursor: pointer;
        transition: all 0.2s ease;
        border: 1px solid transparent;
      }
      .dash-profile-row:hover {
        background: rgba(255,255,255,0.03);
        border-color: var(--border-subtle);
      }
      .dash-profile-avatar {
        width: 42px; height: 42px;
        border-radius: 12px;
        background: linear-gradient(135deg, rgba(201,169,110,0.15), rgba(201,169,110,0.05));
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: var(--font-heading);
        font-weight: 700;
        font-size: 0.8rem;
        color: var(--accent-gold);
        flex-shrink: 0;
        overflow: hidden;
      }
      .dash-profile-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: inherit; }

      /* ---- Projects Section ---- */
      .dash-projects-section {
        padding: 28px;
        border-radius: 20px;
        background: rgba(28,28,40,0.4);
        backdrop-filter: blur(12px);
        border: 1px solid var(--border-subtle);
      }
      .dash-project-chip {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 20px 22px;
        border-radius: 16px;
        background: rgba(255,255,255,0.02);
        border: 1px solid var(--border-subtle);
        cursor: pointer;
        transition: all 0.25s cubic-bezier(0.16,1,0.3,1);
      }
      .dash-project-chip:hover {
        border-color: rgba(201,169,110,0.2);
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0,0,0,0.2);
      }
      .dash-projects-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 12px;
      }

      .dash-skeleton-list { display: flex; flex-direction: column; gap: 8px; }

      /* ---- Responsive ---- */
      @media (max-width: 1100px) {
        .dash-stats { grid-template-columns: 1fr 1fr; }
      }
      @media (max-width: 768px) {
        .dash-grid { grid-template-columns: 1fr; }
        .dash-stats { grid-template-columns: 1fr; }
        .dash-action-grid { grid-template-columns: 1fr; }
        .dash-hero { padding: 28px 20px 24px; }
      }
    </style>
  `;

  initSidebarEvents();

  // Quick action buttons
  document.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const actions = { intake: '#/intake', project: '#/projects', import: '#/import', directory: '#/directory' };
      navigateTo(actions[btn.dataset.action]);
    });
  });

  document.getElementById('view-all-profiles')?.addEventListener('click', () => navigateTo('#/directory'));
  document.getElementById('view-all-projects')?.addEventListener('click', () => navigateTo('#/projects'));

  // Load data
  loadDashboardData();
}

async function loadDashboardData() {
  try {
    const [profileCount, projectCount, profiles, projects] = await Promise.all([
      getProfileCount(),
      getProjectCount(),
      getProfiles(),
      getProjects(),
    ]);

    // Animate stat values
    animateCounter('stat-profiles', profileCount);
    animateCounter('stat-projects', projectCount);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recent = profiles.filter(p => new Date(p.created_at) > weekAgo).length;
    animateCounter('stat-recent', recent);

    const today = new Date().toDateString();
    const updated = profiles.filter(p => new Date(p.updated_at).toDateString() === today).length;
    animateCounter('stat-updated', updated);

    // Animate ring progress (proportional, max 214 circumference)
    setTimeout(() => {
      animateRing('profiles', profileCount, 500);
      animateRing('projects', projectCount, 50);
      animateRing('recent', recent, 100);
      animateRing('updated', updated, 50);
    }, 300);

    // Recent profiles
    const recentProfiles = profiles.slice(0, 6);
    const container = document.getElementById('recent-profiles');

    if (recentProfiles.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:32px 16px;">
          <div style="width:48px; height:48px; margin:0 auto 12px; background:rgba(201,169,110,0.08); border-radius:14px; display:flex; align-items:center; justify-content:center; color:var(--accent-gold);">
            ${icons.userPlus}
          </div>
          <p style="color:var(--text-secondary); font-size:0.85rem; margin-bottom:12px;">No profiles yet</p>
          <button class="btn btn-primary btn-sm" onclick="window.location.hash='#/intake'">Add Your First Profile</button>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="stagger-children">
          ${recentProfiles.map(p => `
            <div class="dash-profile-row" data-email="${p.email}">
              <div class="dash-profile-avatar">
                ${p.image_url ? `<img src="${p.image_url}" alt="${p.name}" />` : getInitials(p.name)}
              </div>
              <div style="flex:1; min-width:0;">
                <div style="font-weight:600; font-size:0.875rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${p.name}</div>
                <div style="font-size:0.7rem; color:var(--text-tertiary);">${p.role || p.email}</div>
              </div>
              <span style="font-size:0.65rem; color:var(--text-tertiary); white-space:nowrap; padding:3px 8px; background:rgba(255,255,255,0.03); border-radius:6px;">${timeAgo(p.created_at)}</span>
            </div>
          `).join('')}
        </div>
      `;
      container.querySelectorAll('[data-email]').forEach(el => {
        el.addEventListener('click', () => navigateTo(`#/profile/${encodeURIComponent(el.dataset.email)}`));
      });
    }

    // Projects list
    const projectsList = document.getElementById('dash-projects-list');
    const recentProjects = projects.slice(0, 6);

    if (recentProjects.length === 0) {
      projectsList.innerHTML = `
        <div style="text-align:center; padding:24px 16px;">
          <p style="color:var(--text-tertiary); font-size:0.85rem; margin-bottom:12px;">No projects created yet</p>
          <button class="btn btn-primary btn-sm" onclick="window.location.hash='#/projects'">Create First Project</button>
        </div>
      `;
    } else {
      projectsList.innerHTML = `
        <div class="dash-projects-grid stagger-children">
          ${recentProjects.map(p => `
            <div class="dash-project-chip" data-id="${p.id}">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-weight:600; font-size:0.875rem;">${p.name}</span>
                <span style="font-size:0.6rem; padding:2px 8px; background:rgba(74,222,128,0.1); color:var(--success); border-radius:6px; text-transform:uppercase; letter-spacing:0.5px;">${p.status || 'active'}</span>
              </div>
              <span style="font-size:0.7rem; color:var(--text-tertiary); line-height:1.4;">${p.description || 'No description'}</span>
              <span style="font-size:0.6rem; color:var(--text-tertiary);">${formatDate(p.created_at)}</span>
            </div>
          `).join('')}
        </div>
      `;
      projectsList.querySelectorAll('[data-id]').forEach(el => {
        el.addEventListener('click', () => navigateTo(`#/project/${el.dataset.id}`));
      });
    }
  } catch (err) {
    console.error('Dashboard load error:', err);
  }
}

function animateCounter(elementId, target) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const duration = 1200;
  const start = performance.now();
  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function animateRing(statName, value, maxVal) {
  const circle = document.querySelector(`.ring-progress[data-stat="${statName}"]`);
  if (!circle) return;
  const circumference = 214;
  const ratio = Math.min(value / Math.max(maxVal, 1), 1);
  const offset = circumference * (1 - ratio);
  circle.style.strokeDashoffset = offset;
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

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}
