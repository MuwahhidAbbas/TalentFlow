/* ============================================
   Team Views — Create & Manage Controlled Views
   ============================================ */

import { renderSidebar, initSidebarEvents } from '../components/navbar.js';
import { icons } from '../components/icons.js';
import { getTeamViews, createTeamView, deleteTeamView, getProjects } from '../db.js';
import { navigateTo } from '../router.js';
import { showToast } from '../components/toast.js';
import { openModal, closeModal, confirmModal } from '../components/modal.js';

export async function renderTeamViews(app) {
  const projects = await getProjects();
  const views = await getTeamViews();

  // Check for ?project= param in hash
  const hashParams = window.location.hash.split('?')[1];
  const urlParams = new URLSearchParams(hashParams || '');
  const preselectedProject = urlParams.get('project') || '';

  app.innerHTML = `
    ${renderSidebar()}
    <main class="main-content">
      <div class="page-container page-enter">
        <div class="page-header">
          <h1 class="page-title">Team Views</h1>
          <p class="page-subtitle">Create controlled, shareable views for collaborators. Internal notes are never exposed.</p>
        </div>

        <div class="toolbar">
          <div></div>
          <button class="btn btn-primary" id="btn-new-view">${icons.plus} Create View</button>
        </div>

        <div id="views-list">
          ${views.length === 0 ? `
            <div class="empty-state">
              ${icons.eye}
              <h3>No team views yet</h3>
              <p>Create a controlled view to share with collaborators.</p>
            </div>
          ` : `
            <div class="gallery-grid stagger-children">
              ${views.map(v => `
                <div class="card hover-lift">
                  <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:var(--space-3);">
                    <div>
                      <h3 style="font-size: var(--text-lg);">${v.name}</h3>
                      <p style="font-size:var(--text-sm); color:var(--text-tertiary);">${v.projects?.name || 'Unknown project'}</p>
                    </div>
                    <span class="badge badge-blue">Shared</span>
                  </div>
                  <div style="margin-bottom: var(--space-4);">
                    <div style="font-size:var(--text-xs); color:var(--text-tertiary); margin-bottom:4px;">Visible Fields</div>
                    <div style="display:flex; flex-wrap:wrap; gap:4px;">
                      ${(v.visible_fields || []).map(f => `<span class="chip">${fieldLabel(f)}</span>`).join('')}
                    </div>
                  </div>
                  <div style="display:flex; align-items:center; gap:var(--space-2); padding:var(--space-3); background:var(--bg-surface); border-radius:var(--radius-md); margin-bottom: var(--space-4);">
                    <input type="text" class="form-input" value="${window.location.origin}/#/view/${v.share_token}" readonly style="font-size:var(--text-xs);" />
                    <button class="btn btn-sm btn-secondary btn-copy" data-token="${v.share_token}" title="Copy link">${icons.copy}</button>
                  </div>
                  <div style="display:flex; justify-content:space-between;">
                    <button class="btn btn-sm btn-secondary btn-open-view" data-token="${v.share_token}">${icons.eye} Preview</button>
                    <button class="btn btn-sm btn-ghost btn-del-view" data-id="${v.id}" data-name="${v.name}">${icons.trash}</button>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    </main>
  `;

  initSidebarEvents();

  // Copy link
  document.querySelectorAll('.btn-copy').forEach(btn => {
    btn.addEventListener('click', () => {
      const url = `${window.location.origin}/#/view/${btn.dataset.token}`;
      navigator.clipboard.writeText(url).then(() => showToast('Link copied!', 'success'));
    });
  });

  // Preview
  document.querySelectorAll('.btn-open-view').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(`#/view/${btn.dataset.token}`));
  });

  // Delete
  document.querySelectorAll('.btn-del-view').forEach(btn => {
    btn.addEventListener('click', async () => {
      const ok = await confirmModal('Delete View', `Delete "${btn.dataset.name}"?`);
      if (ok) {
        await deleteTeamView(btn.dataset.id);
        showToast('View deleted', 'success');
        navigateTo('#/team-views');
      }
    });
  });

  // New view modal
  document.getElementById('btn-new-view').addEventListener('click', () => {
    const allFields = [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'role', label: 'Role' },
      { key: 'location', label: 'Location' },
      { key: 'image_url', label: 'Photo' },
      { key: 'resume_url', label: 'Resume' },
      { key: 'video_url', label: 'Video' },
      { key: 'rating', label: 'Rating' },
      { key: 'status', label: 'Status' },
    ];
    // Note: internal_notes is NEVER an option

    const content = `
      <form id="new-view-form">
        <div class="form-group">
          <label class="form-label">View Name</label>
          <input type="text" class="form-input" name="name" required placeholder="e.g. Client Review — Project X" />
        </div>
        <div class="form-group">
          <label class="form-label">Project</label>
          <select class="form-select" name="project_id" required>
            <option value="">Select project</option>
            ${projects.map(p => `<option value="${p.id}" ${p.id === preselectedProject ? 'selected' : ''}>${p.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Visible Fields</label>
          <p style="font-size:var(--text-xs); color:var(--text-tertiary); margin-bottom:var(--space-3);">Select which fields collaborators can see. Internal notes are never shared.</p>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap: var(--space-2);">
            ${allFields.map(f => `
              <label style="display:flex; align-items:center; gap:8px; padding:var(--space-2); cursor:pointer; font-size:var(--text-sm);">
                <input type="checkbox" name="fields" value="${f.key}" ${['name', 'role', 'image_url'].includes(f.key) ? 'checked' : ''} />
                ${f.label}
              </label>
            `).join('')}
          </div>
        </div>
      </form>
    `;
    const footer = `
      <button class="btn btn-secondary" id="cancel-view">Cancel</button>
      <button class="btn btn-primary" id="save-view">${icons.check} Create View</button>
    `;

    const overlay = openModal({ title: 'Create Team View', content, footer });

    overlay.querySelector('#cancel-view').addEventListener('click', closeModal);
    overlay.querySelector('#save-view').addEventListener('click', async () => {
      const form = document.getElementById('new-view-form');
      const name = form.name.value.trim();
      const projectId = form.project_id.value;
      if (!name || !projectId) { showToast('Name and project are required', 'error'); return; }

      const checked = form.querySelectorAll('input[name="fields"]:checked');
      const fields = Array.from(checked).map(cb => cb.value);
      if (fields.length === 0) { showToast('Select at least one field', 'warning'); return; }

      await createTeamView({ name, project_id: projectId, visible_fields: fields });
      closeModal();
      showToast('Team view created', 'success');
      navigateTo('#/team-views');
    });
  });
}

function fieldLabel(key) {
  const map = { name: 'Name', email: 'Email', phone: 'Phone', role: 'Role', location: 'Location', image_url: 'Photo', resume_url: 'Resume', video_url: 'Video', rating: 'Rating', status: 'Status' };
  return map[key] || key;
}
