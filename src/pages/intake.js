/* ============================================
   Smart Intake Form
   Email-first: checks for existing profile
   ============================================ */

import { renderSidebar, initSidebarEvents } from '../components/navbar.js';
import { icons } from '../components/icons.js';
import { getProfile, upsertProfile, uploadFile } from '../db.js';
import { navigateTo } from '../router.js';
import { showToast } from '../components/toast.js';

export async function renderIntake(app) {
  app.innerHTML = `
    ${renderSidebar()}
    <main class="main-content">
      <div class="page-container page-enter">
        <div class="page-header">
          <h1 class="page-title">Add Profile</h1>
          <p class="page-subtitle">Smart intake form — automatically detects existing profiles by email</p>
        </div>

        <div class="card" style="max-width: 700px;">
          <!-- Step 1: Email check -->
          <div id="step-email">
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input type="email" class="form-input" id="check-email" placeholder="talent@example.com" required />
              <div class="form-help">We'll check if this person already exists in the directory.</div>
            </div>
            <button class="btn btn-primary" id="btn-check-email">${icons.search} Check & Continue</button>
          </div>

          <!-- Step 2: Profile form (hidden initially) -->
          <div id="step-form" style="display: none;">
            <div id="existing-banner" style="display:none; padding: var(--space-4); background: var(--info-dim); border: 1px solid rgba(96,165,250,0.2); border-radius: var(--radius-md); margin-bottom: var(--space-5);">
              <div style="display:flex; align-items:center; gap: var(--space-2); color: var(--info); font-weight:500; font-size: var(--text-sm); margin-bottom: 4px;">
                ${icons.alertCircle} Existing Profile Found
              </div>
              <p style="font-size: var(--text-sm); color: var(--text-secondary);">This email already exists. The form is pre-filled with current data — make any changes and save to update.</p>
            </div>

            <form id="intake-form">
              <input type="hidden" id="form-email" />

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Full Name *</label>
                  <input type="text" class="form-input" name="name" required placeholder="John Doe" />
                </div>
                <div class="form-group">
                  <label class="form-label">Role / Title</label>
                  <input type="text" class="form-input" name="role" placeholder="Actor, Model, etc." />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Phone</label>
                  <input type="tel" class="form-input" name="phone" placeholder="+1 (555) 000-0000" />
                </div>
                <div class="form-group">
                  <label class="form-label">Location</label>
                  <input type="text" class="form-input" name="location" placeholder="Los Angeles, CA" />
                </div>
              </div>

              <hr class="divider-gradient" />

              <h4 style="margin-bottom: var(--space-4); color: var(--text-secondary);">Attachments</h4>

              <div class="form-group">
                <label class="form-label">Profile Image</label>
                <div class="file-drop-zone" id="drop-image">
                  ${icons.image}
                  <p>Drag & drop an image or <span class="accent">browse</span></p>
                  <input type="file" accept="image/*" name="image" style="display:none;" />
                </div>
                <div id="preview-image" style="margin-top: 8px;"></div>
              </div>

              <div class="form-group">
                <label class="form-label">Resume (PDF)</label>
                <div class="file-drop-zone" id="drop-resume">
                  ${icons.file}
                  <p>Drag & drop a PDF or <span class="accent">browse</span></p>
                  <input type="file" accept=".pdf" name="resume" style="display:none;" />
                </div>
                <div id="preview-resume" style="margin-top: 8px;"></div>
              </div>

              <div class="form-group">
                <label class="form-label">Video</label>
                <div class="file-drop-zone" id="drop-video">
                  ${icons.video}
                  <p>Drag & drop a video or <span class="accent">browse</span></p>
                  <input type="file" accept="video/*" name="video" style="display:none;" />
                </div>
                <div id="preview-video" style="margin-top: 8px;"></div>
              </div>

              <hr class="divider-gradient" />

              <div class="form-group">
                <label class="form-label">Internal Notes <span class="badge badge-red" style="margin-left:4px;">Private</span></label>
                <textarea class="form-textarea" name="internal_notes" placeholder="Internal notes only visible to admins..." rows="3"></textarea>
              </div>

              <div style="display:flex; gap: var(--space-3);">
                <button type="submit" class="btn btn-primary btn-lg">${icons.check} Save Profile</button>
                <button type="button" class="btn btn-secondary btn-lg" id="btn-reset">${icons.x} Reset</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  `;

  initSidebarEvents();

  // Step 1: Email check
  document.getElementById('btn-check-email').addEventListener('click', async () => {
    const emailInput = document.getElementById('check-email');
    const email = emailInput.value.trim().toLowerCase();

    if (!email || !email.includes('@')) {
      showToast('Enter a valid email address', 'error');
      return;
    }

    const existing = await getProfile(email);
    document.getElementById('form-email').value = email;
    document.getElementById('step-email').style.display = 'none';
    document.getElementById('step-form').style.display = 'block';

    const form = document.getElementById('intake-form');

    if (existing) {
      document.getElementById('existing-banner').style.display = 'block';
      form.name.value = existing.name || '';
      form.role.value = existing.role || '';
      form.phone.value = existing.phone || '';
      form.location.value = existing.location || '';
      form.internal_notes.value = existing.internal_notes || '';
    } else {
      document.getElementById('existing-banner').style.display = 'none';
    }
  });

  // Allow pressing Enter on email
  document.getElementById('check-email').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); document.getElementById('btn-check-email').click(); }
  });

  // File drop zones
  setupDropZone('drop-image', 'preview-image', 'image');
  setupDropZone('drop-resume', 'preview-resume', 'pdf');
  setupDropZone('drop-video', 'preview-video', 'video');

  // Reset
  document.getElementById('btn-reset').addEventListener('click', () => {
    document.getElementById('step-email').style.display = 'block';
    document.getElementById('step-form').style.display = 'none';
    document.getElementById('check-email').value = '';
    document.getElementById('intake-form').reset();
  });

  // Submit
  document.getElementById('intake-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const email = document.getElementById('form-email').value;

    if (!form.name.value.trim()) {
      showToast('Name is required', 'error');
      return;
    }

    const existing = await getProfile(email);

    const profile = {
      email,
      name: form.name.value.trim(),
      role: form.role.value.trim(),
      phone: form.phone.value.trim(),
      location: form.location.value.trim(),
      internal_notes: form.internal_notes.value.trim(),
      resume_url: existing?.resume_url || '',
      image_url: existing?.image_url || '',
      video_url: existing?.video_url || '',
      created_at: existing?.created_at || undefined,
    };

    // Upload files
    const imageFile = form.image.files[0];
    const resumeFile = form.resume.files[0];
    const videoFile = form.video.files[0];

    if (imageFile) {
      showToast('Uploading image...', 'info');
      const url = await uploadFile('attachments', `profiles/${email}/image_${Date.now()}`, imageFile);
      if (url) profile.image_url = url;
    }
    if (resumeFile) {
      showToast('Uploading resume...', 'info');
      const url = await uploadFile('attachments', `profiles/${email}/resume_${Date.now()}.pdf`, resumeFile);
      if (url) profile.resume_url = url;
    }
    if (videoFile) {
      showToast('Uploading video...', 'info');
      const url = await uploadFile('attachments', `profiles/${email}/video_${Date.now()}`, videoFile);
      if (url) profile.video_url = url;
    }

    const result = await upsertProfile(profile);
    if (result) {
      showToast(existing ? 'Profile updated!' : 'Profile created!', 'success');
      navigateTo(`#/profile/${encodeURIComponent(email)}`);
    } else {
      showToast('Error saving profile', 'error');
    }
  });
}

function setupDropZone(dropId, previewId, type) {
  const zone = document.getElementById(dropId);
  if (!zone) return;
  const input = zone.querySelector('input[type="file"]');
  const preview = document.getElementById(previewId);

  zone.addEventListener('click', () => input.click());

  zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('dragover');
    if (e.dataTransfer.files.length) {
      input.files = e.dataTransfer.files;
      showPreview(input.files[0], preview, type);
    }
  });

  input.addEventListener('change', () => {
    if (input.files[0]) showPreview(input.files[0], preview, type);
  });
}

function showPreview(file, container, type) {
  container.innerHTML = '';
  if (type === 'image') {
    const url = URL.createObjectURL(file);
    container.innerHTML = `<img src="${url}" style="max-height:120px; border-radius: var(--radius-md);" alt="Preview" />`;
  } else {
    container.innerHTML = `<div class="chip">${file.name} (${(file.size / 1024).toFixed(1)} KB)</div>`;
  }
}
