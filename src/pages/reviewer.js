/* ============================================
   Reviewer — Gallery / Card-Based UI
   ============================================ */

import { renderSidebar, initSidebarEvents } from '../components/navbar.js';
import { icons } from '../components/icons.js';
import { getProjects, getProjectCandidates } from '../db.js';
import { navigateTo } from '../router.js';
import { renderFilePreview } from '../components/filePreview.js';
import { openModal, closeModal } from '../components/modal.js';

export async function renderReviewer(app) {
  const projects = await getProjects();

  app.innerHTML = `
    ${renderSidebar()}
    <main class="main-content">
      <div class="page-container page-enter">
        <div class="page-header">
          <h1 class="page-title">Reviewer</h1>
          <p class="page-subtitle">Gallery view for reviewing talent — select a project</p>
        </div>

        <div class="toolbar">
          <div class="toolbar-group">
            <select class="form-select" id="project-select" style="min-width: 250px;">
              <option value="">— Select a project —</option>
              ${projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
            </select>
            <select class="form-select" id="status-filter" style="min-width: 150px;">
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="review">In Review</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="selected">Selected</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div class="toolbar-group">
            <div class="search-bar">
              ${icons.search}
              <input type="text" class="form-input" id="reviewer-search" placeholder="Filter candidates..." />
            </div>
          </div>
        </div>

        <div id="reviewer-gallery">
          <div class="empty-state">
            ${icons.gallery}
            <h3>Select a project</h3>
            <p>Choose a project above to review its candidates in gallery view.</p>
          </div>
        </div>
      </div>
    </main>
  `;

  initSidebarEvents();

  const projectSelect = document.getElementById('project-select');
  const statusFilter = document.getElementById('status-filter');
  const searchInput = document.getElementById('reviewer-search');

  const loadGallery = async () => {
    const projectId = projectSelect.value;
    if (!projectId) return;
    const statusVal = statusFilter.value;
    const searchVal = searchInput.value.toLowerCase();
    await renderGallery(projectId, statusVal, searchVal);
  };

  projectSelect.addEventListener('change', loadGallery);
  statusFilter.addEventListener('change', loadGallery);
  let searchTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(loadGallery, 300);
  });
}

async function renderGallery(projectId, statusFilter, searchQuery) {
  const container = document.getElementById('reviewer-gallery');
  let candidates = await getProjectCandidates(projectId);

  // Filters
  if (statusFilter) {
    candidates = candidates.filter(c => c.status === statusFilter);
  }
  if (searchQuery) {
    candidates = candidates.filter(c => {
      const p = c.profiles || {};
      return (p.name || '').toLowerCase().includes(searchQuery) ||
             (p.email || '').toLowerCase().includes(searchQuery) ||
             (p.role || '').toLowerCase().includes(searchQuery);
    });
  }

  if (candidates.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        ${icons.users}
        <h3>No candidates match</h3>
        <p>Try adjusting your filters.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div style="margin-bottom: var(--space-4); font-size: var(--text-sm); color: var(--text-tertiary);">
      ${candidates.length} candidate${candidates.length !== 1 ? 's' : ''}
    </div>
    <div class="gallery-grid stagger-children">
      ${candidates.map(c => {
        const p = c.profiles || {};
        const mediaHtml = p.image_url
          ? `<img src="${p.image_url}" alt="${p.name}" />`
          : `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:var(--text-tertiary);font-size:3rem;font-family:var(--font-heading);">${getInitials(p.name)}</div>`;

        return `
          <div class="gallery-card hover-lift">
            <div class="gallery-card-media">
              ${mediaHtml}
            </div>
            <div class="gallery-card-body">
              <div class="gallery-card-name">${p.name || c.email}</div>
              <div class="gallery-card-role">${p.role || '—'}</div>
              <div style="display:flex; align-items:center; justify-content:space-between;">
                <div style="color:var(--accent-gold); font-size:var(--text-sm);">
                  ${'★'.repeat(c.rating || 0)}${'☆'.repeat(5 - (c.rating || 0))}
                </div>
                ${getStatusBadge(c.status)}
              </div>
            </div>
            <div class="gallery-card-footer">
              <div style="display:flex; gap:var(--space-2);">
                ${p.resume_url ? `<button class="btn btn-ghost btn-sm btn-preview-file" data-url="${p.resume_url}" data-type="Resume" title="Preview resume">${icons.file}</button>` : ''}
                ${p.video_url ? `<button class="btn btn-ghost btn-sm btn-preview-file" data-url="${p.video_url}" data-type="Video" title="Preview video">${icons.video}</button>` : ''}
              </div>
              <button class="btn btn-sm btn-secondary btn-view-profile" data-email="${c.email}">
                ${icons.eye} Profile
              </button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  // Preview file buttons
  container.querySelectorAll('.btn-preview-file').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openModal({
        title: btn.dataset.type + ' Preview',
        content: renderFilePreview(btn.dataset.url, { maxHeight: '500px' }),
        size: 'lg',
      });
    });
  });

  // View profile buttons
  container.querySelectorAll('.btn-view-profile').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      navigateTo(`#/profile/${encodeURIComponent(btn.dataset.email)}`);
    });
  });
}

function getInitials(name) {
  return (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function getStatusBadge(status) {
  const map = { pending: 'badge-gray', review: 'badge-orange', shortlisted: 'badge-blue', selected: 'badge-green', rejected: 'badge-red' };
  return `<span class="badge ${map[status] || 'badge-gray'}">${status || 'pending'}</span>`;
}
