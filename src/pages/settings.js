/* ============================================
   Settings Page — Supabase Config
   ============================================ */

import { renderSidebar, initSidebarEvents } from '../components/navbar.js';
import { icons } from '../components/icons.js';
import { supabase, getProfiles } from '../db.js';
import { showToast } from '../components/toast.js';

export async function renderSettings(app) {
  const isConnected = !!supabase;

  app.innerHTML = `
    ${renderSidebar()}
    <main class="main-content">
      <div class="page-container page-enter">
        <div class="page-header">
          <h1 class="page-title">Settings</h1>
          <p class="page-subtitle">Configure your TalentFlow instance</p>
        </div>

        <div class="card" style="max-width: 600px; margin-bottom: var(--space-6);">
          <h3 style="margin-bottom: var(--space-4);">Database Connection</h3>
          <div style="display:flex; align-items:center; gap: var(--space-3); margin-bottom: var(--space-5);">
            <div style="width:10px; height:10px; border-radius:50%; background:${isConnected ? 'var(--success)' : 'var(--error)'}; box-shadow: 0 0 8px ${isConnected ? 'var(--success)' : 'var(--error)'};"></div>
            <span style="font-size:var(--text-sm); color: ${isConnected ? 'var(--success)' : 'var(--error)'};">
              ${isConnected ? 'Connected to Supabase' : 'Not connected'}
            </span>
          </div>

          ${!isConnected ? `
            <div style="padding: var(--space-4); background: var(--error-dim); border: 1px solid rgba(248,113,113,0.2); border-radius: var(--radius-md); margin-bottom: var(--space-5);">
              <p style="font-size:var(--text-sm); color: var(--text-primary);">
                <strong>Setup Required:</strong> Create a <code>.env</code> file in the project root with:
              </p>
              <pre style="background: var(--bg-surface); padding: var(--space-3); border-radius: var(--radius-sm); margin-top: var(--space-3); font-size: var(--text-xs); color: var(--accent-gold);">VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here</pre>
            </div>
          ` : ''}

          <button class="btn btn-secondary" id="btn-test-connection">${icons.database} Test Connection</button>
        </div>

        <!-- Data Export -->
        <div class="card" style="max-width: 600px; margin-bottom: var(--space-6);">
          <h3 style="margin-bottom: var(--space-4);">Data Export</h3>
          <p style="font-size:var(--text-sm); color:var(--text-secondary); margin-bottom:var(--space-4);">Export all profiles as a JSON file for backup or migration.</p>
          <button class="btn btn-secondary" id="btn-export">${icons.download} Export All Profiles</button>
        </div>

        <!-- Setup Guide -->
        <div class="card" style="max-width: 600px;">
          <h3 style="margin-bottom: var(--space-4);">Quick Setup Guide</h3>
          <ol style="font-size:var(--text-sm); color:var(--text-secondary); padding-left:var(--space-5); display:flex; flex-direction:column; gap:var(--space-3);">
            <li>Create a free Supabase project at <a href="https://supabase.com" target="_blank">supabase.com</a></li>
            <li>Go to <strong>SQL Editor</strong> and run the schema from <code>supabase/schema.sql</code></li>
            <li>Go to <strong>Storage</strong> → Create a public bucket named <code>attachments</code></li>
            <li>Go to <strong>Settings → API</strong> → Copy your <strong>URL</strong> and <strong>anon/public key</strong></li>
            <li>Create a <code>.env</code> file with <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code></li>
            <li>Run <code>npm run dev</code> to start the app</li>
          </ol>
        </div>
      </div>
    </main>
  `;

  initSidebarEvents();

  // Test connection
  document.getElementById('btn-test-connection').addEventListener('click', async () => {
    if (!supabase) {
      showToast('Supabase not configured. Check .env file.', 'error');
      return;
    }
    try {
      const profiles = await getProfiles();
      showToast(`Connection OK! ${profiles.length} profiles found.`, 'success');
    } catch (err) {
      showToast('Connection failed: ' + err.message, 'error');
    }
  });

  // Export
  document.getElementById('btn-export').addEventListener('click', async () => {
    try {
      const profiles = await getProfiles();
      if (profiles.length === 0) {
        showToast('No profiles to export', 'warning');
        return;
      }
      const blob = new Blob([JSON.stringify(profiles, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `talentflow-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`Exported ${profiles.length} profiles`, 'success');
    } catch (err) {
      showToast('Export error: ' + err.message, 'error');
    }
  });
}
