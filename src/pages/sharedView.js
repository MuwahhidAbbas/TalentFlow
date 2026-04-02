/* ============================================
   Shared Team View Page
   Accessed via share token, hides internal notes
   ============================================ */

import { icons } from '../components/icons.js';
import { getTeamViewByToken, getProjectCandidates } from '../db.js';
import { renderFilePreview } from '../components/filePreview.js';
import { openModal } from '../components/modal.js';

export async function renderSharedView(app, { token }) {
  const view = await getTeamViewByToken(token);

  if (!view) {
    app.innerHTML = `
      <div style="min-height:100vh; display:flex; align-items:center; justify-content:center;">
        <div class="card" style="max-width:400px; text-align:center;">
          <h2 style="margin-bottom: var(--space-3);">View Not Found</h2>
          <p style="color:var(--text-secondary); font-size:var(--text-sm);">This shared view doesn't exist or has been removed.</p>
        </div>
      </div>
    `;
    return;
  }

  const candidates = await getProjectCandidates(view.project_id);
  const fields = view.visible_fields || [];

  app.innerHTML = `
    <div style="max-width: var(--max-content); margin: 0 auto; padding: var(--space-8);" class="page-enter">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: var(--space-8);">
        <div>
          <div style="display:flex; align-items:center; gap:var(--space-3); margin-bottom:var(--space-2);">
            <div class="sidebar-logo" style="width:28px; height:28px; font-size:var(--text-xs);">TF</div>
            <span style="font-family:var(--font-heading); font-weight:700; color:var(--text-primary);">TalentFlow</span>
          </div>
          <h1 style="font-size: var(--text-3xl);">${view.name}</h1>
          <p style="color: var(--text-secondary); font-size: var(--text-sm);">Project: ${view.projects?.name || '—'} · ${candidates.length} candidates</p>
        </div>
        <span class="badge badge-gold">${icons.eye} Shared View</span>
      </div>

      <div class="gallery-grid" id="shared-gallery">
        ${candidates.map(c => {
          const p = c.profiles || {};
          return `
            <div class="gallery-card hover-lift">
              ${fields.includes('image_url') && p.image_url ? `
                <div class="gallery-card-media">
                  <img src="${p.image_url}" alt="${p.name}" />
                </div>
              ` : ''}
              <div class="gallery-card-body">
                ${fields.includes('name') ? `<div class="gallery-card-name">${p.name || '—'}</div>` : ''}
                ${fields.includes('role') ? `<div class="gallery-card-role">${p.role || '—'}</div>` : ''}
                ${fields.includes('email') ? `<div style="font-size:var(--text-xs); color:var(--text-tertiary); margin-bottom:4px;">${icons.mail} ${p.email || '—'}</div>` : ''}
                ${fields.includes('phone') ? `<div style="font-size:var(--text-xs); color:var(--text-tertiary); margin-bottom:4px;">${icons.phone} ${p.phone || '—'}</div>` : ''}
                ${fields.includes('location') ? `<div style="font-size:var(--text-xs); color:var(--text-tertiary); margin-bottom:4px;">${icons.mapPin} ${p.location || '—'}</div>` : ''}
                <div style="display:flex; align-items:center; gap:var(--space-3); margin-top:var(--space-3);">
                  ${fields.includes('rating') ? `<div style="color:var(--accent-gold); font-size:var(--text-sm);">${'★'.repeat(c.rating || 0)}${'☆'.repeat(5 - (c.rating || 0))}</div>` : ''}
                  ${fields.includes('status') ? getStatusBadge(c.status) : ''}
                </div>
              </div>
              ${(fields.includes('resume_url') && p.resume_url) || (fields.includes('video_url') && p.video_url) ? `
                <div class="gallery-card-footer">
                  <div style="display:flex; gap:var(--space-2);">
                    ${fields.includes('resume_url') && p.resume_url ? `<button class="btn btn-ghost btn-sm btn-preview" data-url="${p.resume_url}" data-type="Resume">${icons.file} Resume</button>` : ''}
                    ${fields.includes('video_url') && p.video_url ? `<button class="btn btn-ghost btn-sm btn-preview" data-url="${p.video_url}" data-type="Video">${icons.video} Video</button>` : ''}
                  </div>
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>

      <div style="text-align:center; margin-top:var(--space-12); color:var(--text-tertiary); font-size:var(--text-xs);">
        Powered by TalentFlow
      </div>
    </div>
  `;

  // Preview buttons
  document.querySelectorAll('.btn-preview').forEach(btn => {
    btn.addEventListener('click', () => {
      openModal({
        title: btn.dataset.type + ' Preview',
        content: renderFilePreview(btn.dataset.url, { maxHeight: '500px' }),
        size: 'lg',
      });
    });
  });
}

function getStatusBadge(status) {
  const map = { pending: 'badge-gray', review: 'badge-orange', shortlisted: 'badge-blue', selected: 'badge-green', rejected: 'badge-red' };
  return `<span class="badge ${map[status] || 'badge-gray'}">${status || 'pending'}</span>`;
}
