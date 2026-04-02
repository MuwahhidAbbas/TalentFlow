/* ============================================
   Projects List Page
   ============================================ */

import { renderSidebar, initSidebarEvents } from '../components/navbar.js';
import { icons } from '../components/icons.js';
import { getProjects, createProject, deleteProject, getProjectCandidates } from '../db.js';
import { navigateTo } from '../router.js';
import { showToast } from '../components/toast.js';
import { openModal, closeModal, confirmModal } from '../components/modal.js';

export async function renderProjects(app) {
  app.innerHTML = `
    ${renderSidebar()}
    <main class="main-content">
      <div class="page-container page-enter">
        <div class="page-header">
          <h1 class="page-title">Projects</h1>
          <p class="page-subtitle">Manage your talent coordination projects</p>
        </div>

        <div class="toolbar">
          <div></div>
          <button class="btn btn-primary" id="btn-new-project">
            ${icons.plus} New Project
          </button>
        </div>

        <div id="projects-list">
          <div class="skeleton skeleton-card" style="height: 300px;"></div>
        </div>
      </div>
    </main>
  `;

  initSidebarEvents();

  document.getElementById('btn-new-project').addEventListener('click', showNewProjectModal);

  await loadProjects();
}

function showNewProjectModal() {
  const content = `
    <form id="new-project-form">
      <div class="form-group">
        <label class="form-label">Project Name</label>
        <input type="text" class="form-input" name="name" placeholder="e.g. Commercial Shoot Q2" required />
      </div>
      <div class="form-group">
        <label class="form-label">Description</label>
        <textarea class="form-textarea" name="description" placeholder="Brief description of the project..." rows="3"></textarea>
      </div>
    </form>
  `;
  const footer = `
    <button class="btn btn-secondary" id="cancel-project">Cancel</button>
    <button class="btn btn-primary" id="save-project">${icons.check} Create Project</button>
  `;

  const overlay = openModal({ title: 'New Project', content, footer });

  overlay.querySelector('#cancel-project').addEventListener('click', closeModal);
  overlay.querySelector('#save-project').addEventListener('click', async () => {
    const form = document.getElementById('new-project-form');
    const name = form.name.value.trim();
    if (!name) { showToast('Project name is required', 'error'); return; }

    await createProject({ name, description: form.description.value.trim() });
    closeModal();
    showToast('Project created', 'success');
    await loadProjects();
  });
}

async function loadProjects() {
  const container = document.getElementById('projects-list');
  const projects = await getProjects();

  if (projects.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        ${icons.folder}
        <h3>No projects yet</h3>
        <p>Create your first project to start tracking candidates.</p>
        <button class="btn btn-primary" id="empty-new-project">${icons.plus} New Project</button>
      </div>
    `;
    document.getElementById('empty-new-project')?.addEventListener('click', showNewProjectModal);
    return;
  }

  // Fetch candidate counts
  const projectsWithCounts = await Promise.all(
    projects.map(async (p) => {
      const candidates = await getProjectCandidates(p.id);
      return { ...p, candidateCount: candidates.length };
    })
  );

  container.innerHTML = `
    <div class="gallery-grid stagger-children">
      ${projectsWithCounts.map(p => `
        <div class="gallery-card hover-lift" data-id="${p.id}">
          <div class="gallery-card-body">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: var(--space-3);">
              <div>
                <div class="gallery-card-name">${p.name}</div>
                <div class="gallery-card-role">${p.description || 'No description'}</div>
              </div>
              <span class="badge ${p.status === 'active' ? 'badge-green' : 'badge-gray'}">${p.status || 'active'}</span>
            </div>
            <div style="display:flex; gap: var(--space-4); font-size: var(--text-sm); color: var(--text-secondary);">
              <span>${icons.users} ${p.candidateCount} candidates</span>
              <span>${icons.clock} ${formatDate(p.created_at)}</span>
            </div>
          </div>
          <div class="gallery-card-footer">
            <button class="btn btn-sm btn-secondary btn-open-project" data-id="${p.id}">
              ${icons.arrowRight} Open
            </button>
            <button class="btn btn-sm btn-ghost btn-delete-project" data-id="${p.id}" data-name="${p.name}">
              ${icons.trash}
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  container.querySelectorAll('.btn-open-project').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      navigateTo(`#/project/${btn.dataset.id}`);
    });
  });

  container.querySelectorAll('.gallery-card[data-id]').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      navigateTo(`#/project/${card.dataset.id}`);
    });
  });

  container.querySelectorAll('.btn-delete-project').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const ok = await confirmModal('Delete Project', `Delete "${btn.dataset.name}"? All candidate assignments under this project will also be removed.`);
      if (ok) {
        await deleteProject(btn.dataset.id);
        showToast('Project deleted', 'success');
        await loadProjects();
      }
    });
  });
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
