/* ============================================
   CSV/JSON Import Page
   ============================================ */

import { renderSidebar, initSidebarEvents } from '../components/navbar.js';
import { icons } from '../components/icons.js';
import { batchImportProfiles } from '../db.js';
import { showToast } from '../components/toast.js';

export async function renderImport(app) {
  app.innerHTML = `
    ${renderSidebar()}
    <main class="main-content">
      <div class="page-container page-enter">
        <div class="page-header">
          <h1 class="page-title">Import Data</h1>
          <p class="page-subtitle">Batch import profiles from CSV or JSON files. Existing profiles are updated if email matches.</p>
        </div>

        <div class="card" style="max-width: 700px; margin-bottom: var(--space-6);">
          <h3 style="margin-bottom: var(--space-4);">Upload File</h3>

          <div class="file-drop-zone" id="import-drop-zone">
            ${icons.upload}
            <p>Drag & drop a <span class="accent">.csv</span> or <span class="accent">.json</span> file</p>
            <p style="font-size: var(--text-xs); color: var(--text-tertiary); margin-top: 8px;">or click to browse</p>
            <input type="file" id="import-file" accept=".csv,.json" style="display:none;" />
          </div>
        </div>

        <!-- Preview -->
        <div id="import-preview" style="display:none;">
          <div class="card" style="margin-bottom: var(--space-6);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: var(--space-5);">
              <h3>Preview (<span id="import-count">0</span> records)</h3>
              <div style="display:flex; gap:var(--space-3);">
                <button class="btn btn-secondary" id="btn-cancel-import">${icons.x} Cancel</button>
                <button class="btn btn-primary" id="btn-run-import">${icons.check} Import All</button>
              </div>
            </div>

            <div class="table-container" id="preview-table" style="max-height: 400px; overflow-y: auto;"></div>
          </div>
        </div>

        <!-- Progress -->
        <div id="import-progress" style="display:none;" class="card">
          <h3 style="margin-bottom: var(--space-4);">Importing...</h3>
          <div class="progress-bar" style="margin-bottom: var(--space-3);">
            <div class="progress-bar-fill" id="progress-fill" style="width: 0%;"></div>
          </div>
          <p id="progress-text" style="font-size: var(--text-sm); color: var(--text-secondary);">Processing...</p>
        </div>

        <!-- Results -->
        <div id="import-results" style="display:none;" class="card">
          <h3 style="margin-bottom: var(--space-3);">${icons.checkCircle} Import Complete</h3>
          <p id="results-text" style="font-size: var(--text-sm); color: var(--text-secondary);"></p>
          <button class="btn btn-primary" style="margin-top: var(--space-4);" onclick="window.location.hash='#/directory'">View Directory</button>
        </div>

        <!-- Format Guide -->
        <div class="card" style="max-width: 700px;">
          <h4 style="margin-bottom: var(--space-4);">Expected Format</h4>
          <div style="margin-bottom: var(--space-4);">
            <h5 style="font-size:var(--text-sm); color:var(--accent-gold); margin-bottom:var(--space-2);">CSV Format</h5>
            <pre style="background: var(--bg-surface); padding: var(--space-4); border-radius: var(--radius-md); font-size: var(--text-xs); overflow-x: auto; color: var(--text-secondary);">email,name,phone,role,location,resume_url,image_url,video_url
john@example.com,John Doe,+1-555-0100,Actor,Los Angeles,,,,
jane@example.com,Jane Smith,+1-555-0200,Model,New York,,,,</pre>
          </div>
          <div>
            <h5 style="font-size:var(--text-sm); color:var(--accent-gold); margin-bottom:var(--space-2);">JSON Format</h5>
            <pre style="background: var(--bg-surface); padding: var(--space-4); border-radius: var(--radius-md); font-size: var(--text-xs); overflow-x: auto; color: var(--text-secondary);">[
  { "email": "john@example.com", "name": "John Doe", "role": "Actor", "location": "LA" },
  { "email": "jane@example.com", "name": "Jane Smith", "role": "Model", "location": "NY" }
]</pre>
          </div>
          <p style="font-size:var(--text-xs); color:var(--text-tertiary); margin-top:var(--space-4);">
            Required fields: <strong>email</strong> and <strong>name</strong>. All other fields are optional.
          </p>
        </div>
      </div>
    </main>
  `;

  initSidebarEvents();

  let importData = [];

  // Drop zone
  const dropZone = document.getElementById('import-drop-zone');
  const fileInput = document.getElementById('import-file');

  dropZone.addEventListener('click', () => fileInput.click());
  dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener('change', () => { if (fileInput.files[0]) handleFile(fileInput.files[0]); });

  function handleFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        if (ext === 'json') {
          importData = JSON.parse(e.target.result);
        } else if (ext === 'csv') {
          importData = parseCSV(e.target.result);
        } else {
          showToast('Unsupported file type. Use .csv or .json', 'error');
          return;
        }

        if (!Array.isArray(importData) || importData.length === 0) {
          showToast('No valid records found in file', 'error');
          return;
        }

        // Validate
        importData = importData.filter(r => r.email && r.name);
        if (importData.length === 0) {
          showToast('No records with required fields (email, name)', 'error');
          return;
        }

        showPreview(importData);
      } catch (err) {
        showToast('Error parsing file: ' + err.message, 'error');
      }
    };

    reader.readAsText(file);
  }

  function showPreview(data) {
    document.getElementById('import-preview').style.display = 'block';
    document.getElementById('import-count').textContent = data.length;

    const cols = Object.keys(data[0]);
    const previewData = data.slice(0, 20);

    document.getElementById('preview-table').innerHTML = `
      <table class="data-table">
        <thead>
          <tr>${cols.map(c => `<th>${c}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${previewData.map(row => `
            <tr>${cols.map(c => `<td style="max-width:150px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${row[c] || ''}</td>`).join('')}</tr>
          `).join('')}
          ${data.length > 20 ? `<tr><td colspan="${cols.length}" style="text-align:center; color:var(--text-tertiary);">... and ${data.length - 20} more</td></tr>` : ''}
        </tbody>
      </table>
    `;
  }

  // Cancel
  document.getElementById('btn-cancel-import').addEventListener('click', () => {
    importData = [];
    document.getElementById('import-preview').style.display = 'none';
  });

  // Run import
  document.getElementById('btn-run-import').addEventListener('click', async () => {
    document.getElementById('import-preview').style.display = 'none';
    document.getElementById('import-progress').style.display = 'block';

    const fill = document.getElementById('progress-fill');
    const text = document.getElementById('progress-text');

    text.textContent = `Importing ${importData.length} records...`;
    fill.style.width = '30%';

    const result = await batchImportProfiles(importData);

    fill.style.width = '100%';
    text.textContent = 'Done!';

    setTimeout(() => {
      document.getElementById('import-progress').style.display = 'none';
      document.getElementById('import-results').style.display = 'block';
      document.getElementById('results-text').textContent =
        `Successfully imported ${result.success} profiles. ${result.failed > 0 ? `${result.failed} failed.` : ''}`;
    }, 500);
  });
}

function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

  return lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = (values[i] || '').trim();
    });
    return obj;
  });
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}
