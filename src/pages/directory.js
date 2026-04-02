/* ============================================
   Master Directory Page
   ============================================ */

import { renderSidebar, initSidebarEvents } from '../components/navbar.js';
import { icons } from '../components/icons.js';
import { getProfiles, deleteProfile } from '../db.js';
import { navigateTo } from '../router.js';
import { showToast } from '../components/toast.js';
import { confirmModal } from '../components/modal.js';

let searchTimeout;

export async function renderDirectory(app) {
  app.innerHTML = `
    ${renderSidebar()}
    <main class="main-content">
      <div class="page-container page-enter">
        <div class="page-header">
          <h1 class="page-title">Directory</h1>
          <p class="page-subtitle">Master directory of all talent profiles</p>
        </div>

        <div class="toolbar">
          <div class="toolbar-group">
            <div class="search-bar">
              ${icons.search}
              <input type="text" class="form-input" id="dir-search" placeholder="Search by name, email, role, location..." />
            </div>
          </div>
          <div class="toolbar-group">
            <button class="btn btn-primary" id="btn-add-profile">
              ${icons.plus} Add Profile
            </button>
          </div>
        </div>

        <div id="profile-count" style="margin-bottom: var(--space-4); font-size: var(--text-sm); color: var(--text-tertiary);"></div>

        <div class="table-container" id="directory-table-container">
          <div style="padding: 4rem; text-align: center;">
            <div class="skeleton skeleton-card" style="height: 300px;"></div>
          </div>
        </div>
      </div>
    </main>
  `;

  initSidebarEvents();

  document.getElementById('btn-add-profile').addEventListener('click', () => navigateTo('#/intake'));

  const searchInput = document.getElementById('dir-search');
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => loadDirectory(searchInput.value), 300);
  });

  await loadDirectory('');
}

async function loadDirectory(search) {
  const container = document.getElementById('directory-table-container');
  const countEl = document.getElementById('profile-count');

  try {
    const profiles = await getProfiles(search);
    countEl.textContent = `${profiles.length} profile${profiles.length !== 1 ? 's' : ''} found`;

    if (profiles.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          ${icons.users}
          <h3>No profiles found</h3>
          <p>${search ? 'Try a different search term.' : 'Add your first profile to get started.'}</p>
          ${!search ? `<button class="btn btn-primary" onclick="window.location.hash='#/intake'">${icons.plus} Add Profile</button>` : ''}
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Location</th>
            <th>Files</th>
            <th>Updated</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${profiles.map(p => `
            <tr class="dir-row" data-email="${p.email}">
              <td>
                <div style="display:flex; align-items:center; gap: var(--space-3);">
                  <div class="avatar" ${p.image_url ? 'style="padding:0;"' : ''}>
                    ${p.image_url ? `<img src="${p.image_url}" alt="${p.name}" />` : getInitials(p.name)}
                  </div>
                  <span style="font-weight:500;">${p.name}</span>
                </div>
              </td>
              <td style="color: var(--text-secondary);">${p.email}</td>
              <td>${p.role ? `<span class="badge badge-gold">${p.role}</span>` : '<span style="color:var(--text-tertiary);">—</span>'}</td>
              <td style="color: var(--text-secondary);">${p.location || '—'}</td>
              <td>
                <div style="display:flex; gap:4px;">
                  ${p.resume_url ? `<span class="chip" title="Resume">PDF</span>` : ''}
                  ${p.image_url ? `<span class="chip" title="Image">IMG</span>` : ''}
                  ${p.video_url ? `<span class="chip" title="Video">VID</span>` : ''}
                </div>
              </td>
              <td style="color: var(--text-tertiary); font-size: var(--text-xs);">${formatDate(p.updated_at)}</td>
              <td>
                <div style="display:flex; gap:4px;">
                  <button class="btn btn-ghost btn-sm btn-view" data-email="${p.email}" title="View profile">${icons.eye}</button>
                  <button class="btn btn-ghost btn-sm btn-del" data-email="${p.email}" data-name="${p.name}" title="Delete">${icons.trash}</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    // Click handlers
    container.querySelectorAll('.btn-view').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateTo(`#/profile/${encodeURIComponent(btn.dataset.email)}`);
      });
    });

    container.querySelectorAll('.dir-row').forEach(row => {
      row.style.cursor = 'pointer';
      row.addEventListener('click', () => {
        navigateTo(`#/profile/${encodeURIComponent(row.dataset.email)}`);
      });
    });

    container.querySelectorAll('.btn-del').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const confirmed = await confirmModal('Delete Profile', `Are you sure you want to delete "${btn.dataset.name}"? This action cannot be undone.`);
        if (confirmed) {
          await deleteProfile(btn.dataset.email);
          showToast('Profile deleted', 'success');
          loadDirectory(document.getElementById('dir-search')?.value || '');
        }
      });
    });
  } catch (err) {
    console.error('loadDirectory:', err);
    container.innerHTML = '<p style="padding:2rem; color:var(--error);">Error loading profiles.</p>';
  }
}

function getInitials(name) {
  return (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
