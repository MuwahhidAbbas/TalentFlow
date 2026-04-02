/* ============================================
   File Preview Component
   Preview PDFs, images, and videos in-browser
   ============================================ */

import { icons } from './icons.js';

export function getFileType(url) {
  if (!url) return null;
  const lower = url.toLowerCase();
  if (lower.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?|$)/)) return 'image';
  if (lower.match(/\.(mp4|webm|ogg|mov)(\?|$)/)) return 'video';
  if (lower.match(/\.(pdf)(\?|$)/)) return 'pdf';
  return 'file';
}

export function renderFilePreview(url, { maxHeight = '400px', showControls = true } = {}) {
  if (!url) return '<div class="empty-state" style="padding: 2rem;"><p>No file attached</p></div>';

  const type = getFileType(url);

  switch (type) {
    case 'image':
      return `
        <div class="file-preview" style="max-height:${maxHeight}; overflow:hidden; border-radius: var(--radius-md); position:relative;">
          <img src="${url}" alt="Preview" style="width:100%; height:100%; object-fit:contain; max-height:${maxHeight};" loading="lazy" />
          ${showControls ? `<a href="${url}" target="_blank" class="btn btn-sm btn-secondary" style="position:absolute; bottom:8px; right:8px; opacity:0.8;">${icons.download} Open</a>` : ''}
        </div>
      `;

    case 'video':
      return `
        <div class="file-preview" style="border-radius: var(--radius-md); overflow:hidden;">
          <video controls preload="metadata" style="width:100%; max-height:${maxHeight}; border-radius: var(--radius-md);">
            <source src="${url}" />
            Your browser does not support video playback.
          </video>
        </div>
      `;

    case 'pdf':
      return `
        <div class="file-preview" style="border-radius: var(--radius-md); overflow:hidden; border: 1px solid var(--border-subtle);">
          <iframe src="${url}" style="width:100%; height:${maxHeight}; border:none;" title="PDF Preview"></iframe>
          ${showControls ? `<div style="padding: 8px; display:flex; justify-content:flex-end;"><a href="${url}" target="_blank" class="btn btn-sm btn-secondary">${icons.download} Open in new tab</a></div>` : ''}
        </div>
      `;

    default:
      return `
        <div class="file-preview" style="padding: 1.5rem; text-align:center; background: var(--bg-surface); border-radius: var(--radius-md);">
          <span style="color: var(--text-tertiary);">${icons.file}</span>
          <p style="margin-top: 8px; font-size: var(--text-sm); color: var(--text-secondary);">File attached</p>
          <a href="${url}" target="_blank" class="btn btn-sm btn-secondary" style="margin-top: 8px;">${icons.download} Download</a>
        </div>
      `;
  }
}

export function renderFileThumbnail(url, size = '48px') {
  if (!url) {
    return `<div style="width:${size}; height:${size}; background:var(--bg-surface); border-radius:var(--radius-sm); display:flex; align-items:center; justify-content:center; color:var(--text-tertiary);">${icons.file}</div>`;
  }
  const type = getFileType(url);
  if (type === 'image') {
    return `<img src="${url}" alt="" style="width:${size}; height:${size}; object-fit:cover; border-radius:var(--radius-sm);" loading="lazy" />`;
  }
  if (type === 'video') {
    return `<div style="width:${size}; height:${size}; background:var(--bg-surface); border-radius:var(--radius-sm); display:flex; align-items:center; justify-content:center; color:var(--accent-gold);">${icons.video}</div>`;
  }
  if (type === 'pdf') {
    return `<div style="width:${size}; height:${size}; background:var(--bg-surface); border-radius:var(--radius-sm); display:flex; align-items:center; justify-content:center; color:var(--error);">${icons.file}</div>`;
  }
  return `<div style="width:${size}; height:${size}; background:var(--bg-surface); border-radius:var(--radius-sm); display:flex; align-items:center; justify-content:center; color:var(--text-tertiary);">${icons.file}</div>`;
}
