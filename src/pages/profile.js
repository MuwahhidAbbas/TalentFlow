/* ============================================
   Profile View/Edit Page
   ============================================ */

import { renderSidebar, initSidebarEvents } from '../components/navbar.js';
import { icons } from '../components/icons.js';
import { getProfile, upsertProfile, uploadFile, getCandidateProjects } from '../db.js';
import { navigateTo } from '../router.js';
import { showToast } from '../components/toast.js';
import { renderFilePreview } from '../components/filePreview.js';

export async function renderProfile(app, { email }) {
  const profile = await getProfile(email);
  if (!profile) {
    app.innerHTML = `
      ${renderSidebar()}
      <main class="main-content">
        <div class="page-container">
          <div class="empty-state">
            <h3>Profile not found</h3>
            <p>No profile exists for ${email}</p>
            <button class="btn btn-primary" onclick="window.location.hash='#/directory'">Back to Directory</button>
          </div>
        </div>
      </main>
    `;
    initSidebarEvents();
    return;
  }

  const projectAssignments = await getCandidateProjects(email);

  app.innerHTML = `
    ${renderSidebar()}
    <main class="main-content">
      <div class="page-container page-enter">
        <!-- Back nav -->
        <button class="btn btn-ghost" id="btn-back" style="margin-bottom: var(--space-4);">
          ${icons.arrowLeft} Back to Directory
        </button>

        <div class="profile-layout">
          <!-- Left: info -->
          <div class="profile-main">
            <div class="card" style="margin-bottom: var(--space-5);">
              <div style="display:flex; align-items:center; gap: var(--space-5); margin-bottom: var(--space-6);">
                <div class="avatar avatar-lg" ${profile.image_url ? 'style="padding:0;"' : ''}>
                  ${profile.image_url ? `<img src="${profile.image_url}" alt="${profile.name}" />` : getInitials(profile.name)}
                </div>
                <div>
                  <h2 style="margin-bottom:4px;">${profile.name}</h2>
                  <div style="display:flex; gap: var(--space-4); flex-wrap:wrap; color: var(--text-secondary); font-size: var(--text-sm);">
                    ${profile.role ? `<span>${icons.users} ${profile.role}</span>` : ''}
                    ${profile.location ? `<span>${icons.mapPin} ${profile.location}</span>` : ''}
                  </div>
                </div>
              </div>

              <!-- Contact Info -->
              <div style="display:grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); margin-bottom: var(--space-5);">
                <div>
                  <div style="font-size:var(--text-xs); color:var(--text-tertiary); margin-bottom:4px;">Email</div>
                  <div style="font-size:var(--text-sm);">${profile.email}</div>
                </div>
                <div>
                  <div style="font-size:var(--text-xs); color:var(--text-tertiary); margin-bottom:4px;">Phone</div>
                  <div style="font-size:var(--text-sm);">${profile.phone || '—'}</div>
                </div>
              </div>

              <hr class="divider-gradient" />

              <!-- Edit Form (collapsible) -->
              <details id="edit-details">
                <summary style="cursor:pointer; color:var(--accent-gold); font-weight:500; font-size:var(--text-sm); margin-bottom:var(--space-4);">
                  ${icons.edit} Edit Profile
                </summary>
                <form id="edit-profile-form" style="margin-top: var(--space-4);">
                  <div class="form-row">
                    <div class="form-group">
                      <label class="form-label">Name</label>
                      <input type="text" class="form-input" name="name" value="${profile.name}" required />
                    </div>
                    <div class="form-group">
                      <label class="form-label">Role</label>
                      <input type="text" class="form-input" name="role" value="${profile.role || ''}" />
                    </div>
                  </div>
                  <div class="form-row">
                    <div class="form-group">
                      <label class="form-label">Phone</label>
                      <input type="text" class="form-input" name="phone" value="${profile.phone || ''}" />
                    </div>
                    <div class="form-group">
                      <label class="form-label">Location</label>
                      <input type="text" class="form-input" name="location" value="${profile.location || ''}" />
                    </div>
                  </div>

                  <!-- File Uploads -->
                  <div class="form-group">
                    <label class="form-label">Profile Image</label>
                    <input type="file" class="form-input" name="image" accept="image/*" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Resume PDF</label>
                    <input type="file" class="form-input" name="resume" accept=".pdf" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Video</label>
                    <input type="file" class="form-input" name="video" accept="video/*" />
                  </div>

                  <button type="submit" class="btn btn-primary">${icons.check} Save Changes</button>
                </form>
              </details>
            </div>

            <!-- Internal Notes -->
            <div class="card">
              <h3 style="margin-bottom: var(--space-4); font-size: var(--text-lg);">
                ${icons.messageSquare} Internal Notes
                <span class="badge badge-red" style="margin-left: 8px;">Private</span>
              </h3>
              <textarea class="form-textarea" id="internal-notes" rows="5" placeholder="Add private internal notes about this person...">${profile.internal_notes || ''}</textarea>
              <button class="btn btn-secondary btn-sm" id="save-notes" style="margin-top: var(--space-3);">
                ${icons.check} Save Notes
              </button>
            </div>
          </div>

          <!-- Right: files & projects -->
          <div class="profile-sidebar">
            <!-- Resume -->
            <div class="card" style="margin-bottom: var(--space-5);">
              <h4 style="margin-bottom: var(--space-4);">${icons.file} Resume</h4>
              ${renderFilePreview(profile.resume_url, { maxHeight: '300px' })}
            </div>

            <!-- Image -->
            ${profile.image_url ? `
              <div class="card" style="margin-bottom: var(--space-5);">
                <h4 style="margin-bottom: var(--space-4);">${icons.image} Photo</h4>
                ${renderFilePreview(profile.image_url, { maxHeight: '300px' })}
              </div>
            ` : ''}

            <!-- Video -->
            ${profile.video_url ? `
              <div class="card" style="margin-bottom: var(--space-5);">
                <h4 style="margin-bottom: var(--space-4);">${icons.video} Video</h4>
                ${renderFilePreview(profile.video_url, { maxHeight: '300px' })}
              </div>
            ` : ''}

            <!-- Project Assignments -->
            <div class="card">
              <h4 style="margin-bottom: var(--space-4);">${icons.folder} Project Assignments</h4>
              ${projectAssignments.length === 0 ? `
                <p style="color: var(--text-tertiary); font-size: var(--text-sm);">Not assigned to any projects yet.</p>
              ` : `
                <div style="display:flex; flex-direction:column; gap: var(--space-3);">
                  ${projectAssignments.map(pa => `
                    <div style="display:flex; justify-content:space-between; align-items:center; padding: var(--space-3); background:var(--bg-surface); border-radius: var(--radius-md);">
                      <div>
                        <div style="font-weight:500; font-size:var(--text-sm);">${pa.projects?.name || 'Unknown'}</div>
                        <div style="font-size:var(--text-xs); color:var(--text-tertiary);">${getStatusBadge(pa.status)}</div>
                      </div>
                      <div style="display:flex; align-items:center; gap:2px; color:var(--accent-gold);">
                        ${'★'.repeat(pa.rating || 0)}${'☆'.repeat(5 - (pa.rating || 0))}
                      </div>
                    </div>
                  `).join('')}
                </div>
              `}
            </div>
          </div>
        </div>
      </div>
    </main>

    <style>
      .profile-layout {
        display: grid;
        grid-template-columns: 1.2fr 1fr;
        gap: var(--space-6);
        align-items: start;
      }
      @media (max-width: 900px) {
        .profile-layout { grid-template-columns: 1fr; }
      }
      details summary { list-style: none; }
      details summary::-webkit-details-marker { display: none; }
      details summary .icon { vertical-align: middle; }
    </style>
  `;

  initSidebarEvents();

  // Back button
  document.getElementById('btn-back').addEventListener('click', () => navigateTo('#/directory'));

  // Edit form
  document.getElementById('edit-profile-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const updates = {
      email: profile.email,
      name: form.name.value.trim(),
      role: form.role.value.trim(),
      phone: form.phone.value.trim(),
      location: form.location.value.trim(),
      resume_url: profile.resume_url,
      image_url: profile.image_url,
      video_url: profile.video_url,
      internal_notes: profile.internal_notes,
      created_at: profile.created_at,
    };

    // Upload files if selected
    const imageFile = form.image.files[0];
    const resumeFile = form.resume.files[0];
    const videoFile = form.video.files[0];

    if (imageFile) {
      const url = await uploadFile('attachments', `profiles/${profile.email}/image_${Date.now()}`, imageFile);
      if (url) updates.image_url = url;
    }
    if (resumeFile) {
      const url = await uploadFile('attachments', `profiles/${profile.email}/resume_${Date.now()}.pdf`, resumeFile);
      if (url) updates.resume_url = url;
    }
    if (videoFile) {
      const url = await uploadFile('attachments', `profiles/${profile.email}/video_${Date.now()}`, videoFile);
      if (url) updates.video_url = url;
    }

    await upsertProfile(updates);
    showToast('Profile updated successfully', 'success');
    // Reload page
    navigateTo(`#/profile/${encodeURIComponent(profile.email)}`);
  });

  // Save notes
  document.getElementById('save-notes')?.addEventListener('click', async () => {
    const notes = document.getElementById('internal-notes').value;
    await upsertProfile({ ...profile, internal_notes: notes });
    showToast('Notes saved', 'success');
  });
}

function getInitials(name) {
  return (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function getStatusBadge(status) {
  const colors = { pending: 'badge-gray', shortlisted: 'badge-blue', selected: 'badge-green', rejected: 'badge-red', review: 'badge-orange' };
  return `<span class="badge ${colors[status] || 'badge-gray'}">${status || 'pending'}</span>`;
}
