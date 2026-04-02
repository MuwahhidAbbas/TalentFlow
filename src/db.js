import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

/* ---------- helpers ---------- */
function checkConnection() {
  if (!supabase) {
    console.warn('Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
    return false;
  }
  return true;
}

/* ============================================
   PROFILES
   ============================================ */

export async function getProfiles(search = '') {
  if (!checkConnection()) return [];
  let query = supabase.from('profiles').select('*').order('created_at', { ascending: false });
  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,role.ilike.%${search}%,location.ilike.%${search}%`);
  }
  const { data, error } = await query;
  if (error) { console.error('getProfiles:', error); return []; }
  return data || [];
}

export async function getProfile(email) {
  if (!checkConnection()) return null;
  const { data, error } = await supabase.from('profiles').select('*').eq('email', email).single();
  if (error) { console.error('getProfile:', error); return null; }
  return data;
}

export async function upsertProfile(profile) {
  if (!checkConnection()) return null;
  profile.updated_at = new Date().toISOString();
  if (!profile.created_at) profile.created_at = new Date().toISOString();
  const { data, error } = await supabase.from('profiles').upsert(profile, { onConflict: 'email' }).select().single();
  if (error) { console.error('upsertProfile:', error); return null; }
  return data;
}

export async function deleteProfile(email) {
  if (!checkConnection()) return false;
  const { error } = await supabase.from('profiles').delete().eq('email', email);
  if (error) { console.error('deleteProfile:', error); return false; }
  return true;
}

export async function getProfileCount() {
  if (!checkConnection()) return 0;
  const { count, error } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
  if (error) return 0;
  return count || 0;
}

/* ============================================
   PROJECTS
   ============================================ */

export async function getProjects() {
  if (!checkConnection()) return [];
  const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
  if (error) { console.error('getProjects:', error); return []; }
  return data || [];
}

export async function getProject(id) {
  if (!checkConnection()) return null;
  const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();
  if (error) { console.error('getProject:', error); return null; }
  return data;
}

export async function createProject(project) {
  if (!checkConnection()) return null;
  const { data, error } = await supabase.from('projects').insert(project).select().single();
  if (error) { console.error('createProject:', error); return null; }
  return data;
}

export async function updateProject(id, updates) {
  if (!checkConnection()) return null;
  const { data, error } = await supabase.from('projects').update(updates).eq('id', id).select().single();
  if (error) { console.error('updateProject:', error); return null; }
  return data;
}

export async function deleteProject(id) {
  if (!checkConnection()) return false;
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) { console.error('deleteProject:', error); return false; }
  return true;
}

export async function getProjectCount() {
  if (!checkConnection()) return 0;
  const { count, error } = await supabase.from('projects').select('*', { count: 'exact', head: true });
  if (error) return 0;
  return count || 0;
}

/* ============================================
   PROJECT CANDIDATES
   ============================================ */

export async function getProjectCandidates(projectId) {
  if (!checkConnection()) return [];
  const { data, error } = await supabase
    .from('project_candidates')
    .select('*, profiles(*)')
    .eq('project_id', projectId)
    .order('added_at', { ascending: false });
  if (error) { console.error('getProjectCandidates:', error); return []; }
  return data || [];
}

export async function getCandidateProjects(email) {
  if (!checkConnection()) return [];
  const { data, error } = await supabase
    .from('project_candidates')
    .select('*, projects(*)')
    .eq('email', email)
    .order('added_at', { ascending: false });
  if (error) { console.error('getCandidateProjects:', error); return []; }
  return data || [];
}

export async function addCandidateToProject(projectId, email) {
  if (!checkConnection()) return null;
  const { data, error } = await supabase
    .from('project_candidates')
    .upsert({ project_id: projectId, email }, { onConflict: 'project_id,email' })
    .select()
    .single();
  if (error) { console.error('addCandidateToProject:', error); return null; }
  return data;
}

export async function updateCandidateInProject(id, updates) {
  if (!checkConnection()) return null;
  const { data, error } = await supabase
    .from('project_candidates')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) { console.error('updateCandidateInProject:', error); return null; }
  return data;
}

export async function removeCandidateFromProject(id) {
  if (!checkConnection()) return false;
  const { error } = await supabase.from('project_candidates').delete().eq('id', id);
  if (error) { console.error('removeCandidateFromProject:', error); return false; }
  return true;
}

/* ============================================
   COMMENTS (Historical)
   ============================================ */

export async function getComments(projectId, email) {
  if (!checkConnection()) return [];
  const { data, error } = await supabase
    .from('candidate_comments')
    .select('*')
    .eq('project_id', projectId)
    .eq('email', email)
    .order('created_at', { ascending: false });
  if (error) { console.error('getComments:', error); return []; }
  return data || [];
}

export async function addComment(projectId, email, comment, author = 'Admin') {
  if (!checkConnection()) return null;
  const { data, error } = await supabase
    .from('candidate_comments')
    .insert({ project_id: projectId, email, comment, author })
    .select()
    .single();
  if (error) { console.error('addComment:', error); return null; }
  return data;
}

/* ============================================
   TEAM VIEWS
   ============================================ */

export async function getTeamViews(projectId) {
  if (!checkConnection()) return [];
  let query = supabase.from('team_views').select('*, projects(name)').order('created_at', { ascending: false });
  if (projectId) query = query.eq('project_id', projectId);
  const { data, error } = await query;
  if (error) { console.error('getTeamViews:', error); return []; }
  return data || [];
}

export async function getTeamViewByToken(token) {
  if (!checkConnection()) return null;
  const { data, error } = await supabase
    .from('team_views')
    .select('*, projects(name)')
    .eq('share_token', token)
    .single();
  if (error) { console.error('getTeamViewByToken:', error); return null; }
  return data;
}

export async function createTeamView(view) {
  if (!checkConnection()) return null;
  const { data, error } = await supabase.from('team_views').insert(view).select().single();
  if (error) { console.error('createTeamView:', error); return null; }
  return data;
}

export async function deleteTeamView(id) {
  if (!checkConnection()) return false;
  const { error } = await supabase.from('team_views').delete().eq('id', id);
  if (error) { console.error('deleteTeamView:', error); return false; }
  return true;
}

/* ============================================
   FILE STORAGE
   ============================================ */

export async function uploadFile(bucket, path, file) {
  if (!checkConnection()) return null;
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
  });
  if (error) { console.error('uploadFile:', error); return null; }
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return urlData.publicUrl;
}

export async function deleteFile(bucket, path) {
  if (!checkConnection()) return false;
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) { console.error('deleteFile:', error); return false; }
  return true;
}

/* ============================================
   BATCH IMPORT
   ============================================ */

export async function batchImportProfiles(profiles) {
  if (!checkConnection()) return { success: 0, failed: 0 };
  let success = 0, failed = 0;
  // Process in chunks of 50
  for (let i = 0; i < profiles.length; i += 50) {
    const chunk = profiles.slice(i, i + 50).map(p => ({
      ...p,
      created_at: p.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
    const { error } = await supabase.from('profiles').upsert(chunk, { onConflict: 'email' });
    if (error) {
      console.error('batchImport chunk error:', error);
      failed += chunk.length;
    } else {
      success += chunk.length;
    }
  }
  return { success, failed };
}
