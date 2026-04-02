/* ============================================
   Reusable Modal Component
   ============================================ */

import { icons } from './icons.js';

export function openModal({ title, content, size = '', footer = '', onClose }) {
  // Remove any existing modal
  closeModal();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'modal-overlay';

  const sizeClass = size ? `modal-${size}` : '';

  overlay.innerHTML = `
    <div class="modal-content ${sizeClass} animate-scale-in">
      <div class="modal-header">
        <h3 class="modal-title">${title}</h3>
        <button class="btn btn-ghost btn-icon" id="modal-close-btn">
          ${icons.x}
        </button>
      </div>
      <div class="modal-body">${content}</div>
      ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
    </div>
  `;

  document.body.appendChild(overlay);

  // Close handlers
  const closeBtn = overlay.querySelector('#modal-close-btn');
  closeBtn.addEventListener('click', () => { closeModal(); onClose?.(); });
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) { closeModal(); onClose?.(); }
  });

  // ESC key
  const escHandler = (e) => {
    if (e.key === 'Escape') { closeModal(); onClose?.(); document.removeEventListener('keydown', escHandler); }
  };
  document.addEventListener('keydown', escHandler);

  return overlay;
}

export function closeModal() {
  const existing = document.getElementById('modal-overlay');
  if (existing) existing.remove();
}

export function confirmModal(title, message) {
  return new Promise((resolve) => {
    const content = `<p style="color: var(--text-secondary); font-size: var(--text-sm); line-height: 1.6;">${message}</p>`;
    const footer = `
      <button class="btn btn-secondary" id="confirm-cancel">Cancel</button>
      <button class="btn btn-danger" id="confirm-ok">Confirm</button>
    `;

    const overlay = openModal({ title, content, footer, onClose: () => resolve(false) });

    overlay.querySelector('#confirm-cancel').addEventListener('click', () => { closeModal(); resolve(false); });
    overlay.querySelector('#confirm-ok').addEventListener('click', () => { closeModal(); resolve(true); });
  });
}
