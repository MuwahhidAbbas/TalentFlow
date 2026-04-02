/* ============================================
   Sidebar Navigation
   ============================================ */

import { icons, icon } from './icons.js';
import { navigateTo, getCurrentRoute } from '../router.js';

export function renderSidebar() {
  const currentHash = getCurrentRoute();

  const navItems = [
    { label: 'Dashboard', hash: '#/dashboard', icon: 'dashboard' },
    { label: 'Directory', hash: '#/directory', icon: 'users' },
    { label: 'Projects', hash: '#/projects', icon: 'folder' },
    { label: 'Reviewer', hash: '#/reviewer', icon: 'gallery' },
    { label: 'Team Views', hash: '#/team-views', icon: 'eye' },
  ];

  const actionItems = [
    { label: 'Add Profile', hash: '#/intake', icon: 'userPlus' },
    { label: 'Import Data', hash: '#/import', icon: 'upload' },
  ];

  return `
    <button class="mobile-toggle" id="sidebar-toggle">${icons.menu}</button>
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-header">
        <div class="sidebar-logo">TF</div>
        <span class="sidebar-brand">TalentFlow</span>
      </div>
      <nav class="sidebar-nav">
        <div class="nav-section-label">Navigate</div>
        ${navItems.map(item => `
          <button class="nav-link ${currentHash === item.hash ? 'active' : ''}" data-nav="${item.hash}">
            ${icon(item.icon)}
            ${item.label}
          </button>
        `).join('')}

        <div class="nav-section-label" style="margin-top: var(--space-4);">Actions</div>
        ${actionItems.map(item => `
          <button class="nav-link ${currentHash === item.hash ? 'active' : ''}" data-nav="${item.hash}">
            ${icon(item.icon)}
            ${item.label}
          </button>
        `).join('')}
      </nav>
      <div style="padding: var(--space-4) var(--space-3); border-top: 1px solid var(--border-subtle);">
        <button class="nav-link" data-nav="#/settings">
          ${icon('settings')}
          Settings
        </button>
      </div>
    </aside>
  `;
}

export function initSidebarEvents() {
  // Nav links
  document.querySelectorAll('[data-nav]').forEach(link => {
    link.addEventListener('click', () => {
      const hash = link.dataset.nav;
      navigateTo(hash);
      // Close mobile sidebar
      const sidebar = document.getElementById('sidebar');
      if (sidebar) sidebar.classList.remove('open');
    });
  });

  // Mobile toggle
  const toggle = document.getElementById('sidebar-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const sidebar = document.getElementById('sidebar');
      if (sidebar) sidebar.classList.toggle('open');
    });
  }
}
