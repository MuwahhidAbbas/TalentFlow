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
          <div style="display:flex; align-items:center; gap: var(--space-3); margin-bottom: var(--space-6);">
            <div style="width:12px; height:12px; border-radius:50%; background:${isConnected ? 'var(--success)' : 'var(--error)'}; box-shadow: 0 0 12px ${isConnected ? 'var(--success)' : 'var(--error)'};"></div>
            <div style="display:flex; flex-direction:column;">
              <span style="font-weight:600; color: ${isConnected ? 'var(--success)' : 'var(--error)'};">
                ${isConnected ? 'Supabase Securely Connected' : 'Supabase Not Configured'}
              </span>
              <span style="font-size:var(--text-xs); color: var(--text-tertiary);">
                ${isConnected ? 'Your instance is online and ready.' : 'Please check your .env configuration.'}
              </span>
            </div>
          </div>

          ${!isConnected ? `
            <div style="padding: var(--space-5); background: var(--error-dim); border: 1px solid rgba(248,113,113,0.2); border-radius: var(--radius-lg); margin-bottom: var(--space-6);">
              <p style="font-size:var(--text-sm); color: var(--text-primary); margin-bottom: var(--space-3);">
                <strong>Missing Configuration:</strong> We couldn't find your Supabase credentials.
              </p>
              <div style="font-size:var(--text-xs); color: var(--text-secondary); line-height:1.6;">
                <p style="margin-bottom: var(--space-2);"><strong>Local:</strong> Ensure your <code>.env</code> file is in the root directory.</p>
                <p><strong>Netlify:</strong> Go to <b>Site Settings → Environment variables</b> and add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> manually.</p>
              </div>
            </div>
          ` : ''}

          <div style="display:flex; gap: var(--space-3);">
            <button class="btn btn-secondary" id="btn-test-connection" style="flex:1;">${icons.database} Run Connection Test</button>
            <button class="btn btn-ghost" onclick="window.location.reload()" style="border: 1px solid var(--border-subtle);">Refresh App</button>
          </div>
        </div>

        <!-- Data Export -->
        <div class="card" style="max-width: 600px;">
          <h3 style="margin-bottom: var(--space-4);">Data & Backups</h3>
          <p style="font-size:var(--text-sm); color:var(--text-secondary); margin-bottom:var(--space-5);">Securely export your entire talent directory database as a portable JSON file.</p>
          <button class="btn btn-secondary" id="btn-export" style="width:100%; justify-content:center;">${icons.download} Export All Profiles (.json)</button>
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
