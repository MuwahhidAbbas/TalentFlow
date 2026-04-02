/* ============================================
   Project Detail Page
   Candidate assignments, ratings, comments
   ============================================ */

import { renderSidebar, initSidebarEvents } from '../components/navbar.js';
import { icons } from '../components/icons.js';
import { getProject, getProjectCandidates, getProfiles, addCandidateToProject, updateCandidateInProject, removeCandidateFromProject, getComments, addComment } from '../db.js';
import { navigateTo } from '../router.js';
import { showToast } from '../components/toast.js';
import { openModal, closeModal, confirmModal } from '../components/modal.js';

let currentProjectId = null;

export async function renderProjectDetail(app, { id }) {
  currentProjectId = id;
  const project = await getProject(id);

  if (!project) {
    app.innerHTML = `
      ${renderSidebar()}
      <main class="main-content">
        <div class="page-container">
          <div class="empty-state">
            <h3>Project not found</h3>
            <button class="btn btn-primary" onclick="window.location.hash='#/projects'">Back to Projects</button>
          </div>
        </div>
      </main>
    `;
    initSidebarEvents();
    return;
  }

  app.innerHTML = `
    ${renderSidebar()}
    <main class="main-content">
      <div class="page-container page-enter">
        <button class="btn btn-ghost" id="btn-back" style="margin-bottom: var(--space-4);">
          ${icons.arrowLeft} Back to Projects
        </button>

        <div class="page-header" style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:var(--space-4);">
          <div>
            <h1 class="page-title">${project.name}</h1>
            <p class="page-subtitle">${project.description || 'No description'}</p>
          </div>
          <div style="display:flex; gap:var(--space-3);">
            <button class="btn btn-primary" id="btn-add-candidate">${icons.plus} Add Candidate</button>
            <button class="btn btn-secondary" id="btn-create-view">${icons.eye} Create Team View</button>
          </div>
        </div>

        <div class="tabs">
          <button class="tab active" data-tab="candidates">Candidates</button>
          <button class="tab" data-tab="kanban">By Status</button>
        </div>

        <div id="tab-content">
          <div class="skeleton skeleton-card" style="height: 300px;"></div>
        </div>
      </div>
    </main>
  `;

  initSidebarEvents();
  document.getElementById('btn-back').addEventListener('click', () => navigateTo('#/projects'));
  document.getElementById('btn-add-candidate').addEventListener('click', () => showAddCandidateModal(id));
  document.getElementById('btn-create-view').addEventListener('click', () => {
    navigateTo(`#/team-views?project=${id}`);
  });

  // Tabs
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderTab(tab.dataset.tab, id);
    });
  });

  await renderTab('candidates', id);
}

async function renderTab(tabName, projectId) {
  const container = document.getElementById('tab-content');
  const candidates = await getProjectCandidates(projectId);

  if (tabName === 'candidates') {
    if (candidates.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          ${icons.users}
          <h3>No candidates yet</h3>
          <p>Add candidates from your directory to this project.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Status</th>
              <th>Rating</th>
              <th>Added</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${candidates.map(c => {
              const p = c.profiles || {};
              return `
                <tr>
                  <td>
                    <div style="display:flex; align-items:center; gap:var(--space-3);">
                      <div class="avatar" ${p.image_url ? 'style="padding:0;"' : ''}>
                        ${p.image_url ? `<img src="${p.image_url}" alt="" />` : getInitials(p.name)}
                      </div>
                      <div>
                        <div style="font-weight:500;">${p.name || c.email}</div>
                        <div style="font-size:var(--text-xs); color:var(--text-tertiary);">${c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <select class="form-select status-select" data-id="${c.id}" style="min-width:130px;">
                      ${['pending', 'review', 'shortlisted', 'selected', 'rejected'].map(s =>
                        `<option value="${s}" ${c.status === s ? 'selected' : ''}>${s.charAt(0).toUpperCase() + s.slice(1)}</option>`
                      ).join('')}
                    </select>
                  </td>
                  <td>
                    <div class="star-rating" data-id="${c.id}" data-rating="${c.rating || 0}">
                      ${[1,2,3,4,5].map(n => `<span class="star ${n <= (c.rating || 0) ? 'filled' : ''}" data-val="${n}">${n <= (c.rating || 0) ? icons.starFilled : icons.star}</span>`).join('')}
                    </div>
                  </td>
                  <td style="color:var(--text-tertiary); font-size:var(--text-xs);">${formatDate(c.added_at)}</td>
                  <td>
                    <div style="display:flex; gap:4px;">
                      <button class="btn btn-ghost btn-sm btn-comments" data-id="${c.id}" data-email="${c.email}" title="Comments">${icons.messageSquare}</button>
                      <button class="btn btn-ghost btn-sm" data-email="${c.email}" onclick="window.location.hash='#/profile/${encodeURIComponent(c.email)}'" title="View profile">${icons.eye}</button>
                      <button class="btn btn-ghost btn-sm btn-remove" data-id="${c.id}" title="Remove">${icons.x}</button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    // Status change
    container.querySelectorAll('.status-select').forEach(sel => {
      sel.addEventListener('change', async () => {
        await updateCandidateInProject(sel.dataset.id, { status: sel.value });
        showToast('Status updated', 'success');
      });
    });

    // Star rating
    container.querySelectorAll('.star-rating').forEach(ratingEl => {
      ratingEl.querySelectorAll('.star').forEach(star => {
        star.addEventListener('click', async () => {
          const val = parseInt(star.dataset.val);
          await updateCandidateInProject(ratingEl.dataset.id, { rating: val });
          showToast('Rating updated', 'success');
          await renderTab('candidates', currentProjectId);
        });
      });
    });

    // Comments modal
    container.querySelectorAll('.btn-comments').forEach(btn => {
      btn.addEventListener('click', () => showCommentsModal(currentProjectId, btn.dataset.email));
    });

    // Remove candidate
    container.querySelectorAll('.btn-remove').forEach(btn => {
      btn.addEventListener('click', async () => {
        const ok = await confirmModal('Remove Candidate', 'Remove this candidate from the project?');
        if (ok) {
          await removeCandidateFromProject(btn.dataset.id);
          showToast('Candidate removed', 'success');
          await renderTab('candidates', currentProjectId);
        }
      });
    });

  } else if (tabName === 'kanban') {
    // Group by status
    const statuses = ['pending', 'review', 'shortlisted', 'selected', 'rejected'];
    const groups = {};
    statuses.forEach(s => { groups[s] = candidates.filter(c => (c.status || 'pending') === s); });

    container.innerHTML = `
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-4);">
        ${statuses.map(status => `
          <div class="card" style="padding: var(--space-4);">
            <h4 style="font-size: var(--text-sm); text-transform: uppercase; letter-spacing: 1px; color: var(--text-tertiary); margin-bottom: var(--space-4);">
              ${status} <span class="badge badge-gray" style="margin-left:4px;">${groups[status].length}</span>
            </h4>
            ${groups[status].length === 0 ? '<p style="font-size:var(--text-xs); color:var(--text-tertiary);">No candidates</p>' :
              groups[status].map(c => {
                const p = c.profiles || {};
                return `
                  <div style="padding:var(--space-3); background:var(--bg-surface); border-radius:var(--radius-md); margin-bottom:var(--space-2); cursor:pointer;" onclick="window.location.hash='#/profile/${encodeURIComponent(c.email)}'">
                    <div style="font-weight:500; font-size:var(--text-sm);">${p.name || c.email}</div>
                    <div style="font-size:var(--text-xs); color:var(--accent-gold);">${'★'.repeat(c.rating || 0)}${'☆'.repeat(5 - (c.rating || 0))}</div>
                  </div>
                `;
              }).join('')
            }
          </div>
        `).join('')}
      </div>
    `;
  }
}

async function showAddCandidateModal(projectId) {
  const profiles = await getProfiles();
  const existing = await getProjectCandidates(projectId);
  const existingEmails = new Set(existing.map(c => c.email));
  const available = profiles.filter(p => !existingEmails.has(p.email));

  const content = `
    <div class="form-group">
      <label class="form-label">Search profiles to add</label>
      <input type="text" class="form-input" id="candidate-search" placeholder="Search by name or email..." />
    </div>
    <div id="candidate-list" style="max-height: 300px; overflow-y: auto;">
      ${available.length === 0 ? '<p style="color:var(--text-tertiary); font-size:var(--text-sm);">All profiles are already assigned to this project.</p>' :
        available.map(p => `
          <label style="display:flex; align-items:center; gap:var(--space-3); padding:var(--space-3); border-radius:var(--radius-md); cursor:pointer; transition:background 150ms ease;" onmouseover="this.style.background='rgba(255,255,255,0.03)'" onmouseout="this.style.background='transparent'">
            <input type="checkbox" value="${p.email}" class="candidate-checkbox" />
            <div class="avatar" style="width:32px; height:32px; font-size:var(--text-xs);" ${p.image_url ? 'style="padding:0;width:32px;height:32px;"' : ''}>
              ${p.image_url ? `<img src="${p.image_url}" alt="" />` : getInitials(p.name)}
            </div>
            <div>
              <div style="font-weight:500; font-size:var(--text-sm);">${p.name}</div>
              <div style="font-size:var(--text-xs); color:var(--text-tertiary);">${p.email}</div>
            </div>
          </label>
        `).join('')
      }
    </div>
  `;

  const footer = `
    <button class="btn btn-secondary" id="cancel-add">Cancel</button>
    <button class="btn btn-primary" id="save-add">${icons.plus} Add Selected</button>
  `;

  const overlay = openModal({ title: 'Add Candidates', content, footer, size: 'lg' });

  // Search filter
  overlay.querySelector('#candidate-search')?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    overlay.querySelectorAll('label').forEach(label => {
      const text = label.textContent.toLowerCase();
      label.style.display = text.includes(query) ? 'flex' : 'none';
    });
  });

  overlay.querySelector('#cancel-add').addEventListener('click', closeModal);
  overlay.querySelector('#save-add').addEventListener('click', async () => {
    const checked = overlay.querySelectorAll('.candidate-checkbox:checked');
    if (checked.length === 0) { showToast('Select at least one candidate', 'warning'); return; }

    for (const cb of checked) {
      await addCandidateToProject(projectId, cb.value);
    }
    closeModal();
    showToast(`${checked.length} candidate(s) added`, 'success');
    await renderTab('candidates', projectId);
  });
}

async function showCommentsModal(projectId, email) {
  const comments = await getComments(projectId, email);

  const content = `
    <div class="comment-thread" id="comment-thread">
      ${comments.length === 0 ? '<p style="color:var(--text-tertiary); font-size:var(--text-sm);">No comments yet.</p>' :
        comments.map(c => `
          <div class="comment-item">
            <div class="avatar" style="width:28px; height:28px; font-size:var(--text-xs);">${getInitials(c.author)}</div>
            <div class="comment-body">
              <div class="comment-author">${c.author}</div>
              <div class="comment-text">${c.comment}</div>
              <div class="comment-time">${formatDateTime(c.created_at)}</div>
            </div>
          </div>
        `).join('')
      }
    </div>
    <hr class="divider-gradient" />
    <div class="form-group" style="margin-bottom:0;">
      <textarea class="form-textarea" id="new-comment" rows="3" placeholder="Write a comment..."></textarea>
    </div>
  `;

  const footer = `
    <button class="btn btn-secondary" id="close-comments">Close</button>
    <button class="btn btn-primary" id="post-comment">${icons.messageSquare} Post Comment</button>
  `;

  const overlay = openModal({ title: 'Comments', content, footer });

  overlay.querySelector('#close-comments').addEventListener('click', closeModal);
  overlay.querySelector('#post-comment').addEventListener('click', async () => {
    const text = document.getElementById('new-comment').value.trim();
    if (!text) { showToast('Enter a comment', 'warning'); return; }
    await addComment(projectId, email, text);
    closeModal();
    showToast('Comment posted', 'success');
  });
}

function getInitials(name) {
  return (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDateTime(d) {
  if (!d) return '';
  return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}
