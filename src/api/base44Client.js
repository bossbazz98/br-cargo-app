/**
 * base44Client.js — compatibility shim
 * แทนที่ @base44/sdk ด้วย Supabase (database/auth) + Firebase (Google Auth + Storage)
 */
import { supabase } from './supabaseClient';
import { auth, googleProvider, storage } from './firebaseClient';
import { signInWithPopup } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// ─── Auth ─────────────────────────────────────────────────
const authModule = {
  async login({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async me() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    return profile ? { ...user, ...profile } : user;
  },

  async logout() {
    await supabase.auth.signOut();
    localStorage.removeItem('br_session_user');
    window.location.href = '/';
  },

  redirectToLogin() {
    window.location.href = '/';
  },

  async updateMe(updates) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    if (updates.password) {
      const { error } = await supabase.auth.updateUser({ password: updates.password });
      if (error) throw error;
    }
    const profileUpdates = { ...updates };
    delete profileUpdates.password;
    if (Object.keys(profileUpdates).length > 0) {
      const { error } = await supabase.from('users').upsert({ id: user.id, ...profileUpdates });
      if (error) throw error;
    }
  },

  async loginWithProvider(provider) {
    if (provider === 'google') {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      const { data, error } = await supabase.auth.signInWithPassword({
        email: firebaseUser.email,
        password: `google_${firebaseUser.uid}`,
      });
      if (error) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: firebaseUser.email,
          password: `google_${firebaseUser.uid}`,
        });
        if (signUpError) throw signUpError;
        await supabase.from('users').upsert({
          id: signUpData.user.id,
          email: firebaseUser.email,
          full_name: firebaseUser.displayName,
          picture_url: firebaseUser.photoURL,
        });
        return signUpData;
      }
      return data;
    }
  },
};

// ─── Entity Factory ───────────────────────────────────────
const createEntity = (tableName) => ({
  async list(orderField = 'created_at', limit = 50) {
    const ascending = !orderField.startsWith('-');
    const field = orderField.replace(/^-/, '');
    let query = supabase.from(tableName).select('*').limit(limit);
    try {
      query = query.order(field, { ascending });
    } catch (e) {}
    const { data, error } = await query;
    if (error) {
      // fallback: retry without order if field doesn't exist
      const { data: fallback, error: e2 } = await supabase.from(tableName).select('*').limit(limit);
      if (e2) throw e2;
      return fallback || [];
    }
    return data || [];
  },

  async filter(filters = {}, orderField = 'created_at', limit = 50) {
    const ascending = !orderField.startsWith('-');
    const field = orderField.replace(/^-/, '');
    let query = supabase.from(tableName).select('*');
    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value);
    }
    query = query.limit(limit);
    const { data, error } = await query.order(field, { ascending });
    if (error) {
      // fallback without order
      let q2 = supabase.from(tableName).select('*');
      for (const [key, value] of Object.entries(filters)) { q2 = q2.eq(key, value); }
      const { data: fallback, error: e2 } = await q2.limit(limit);
      if (e2) throw e2;
      return fallback || [];
    }
    return data || [];
  },

  async create(payload) {
    const { data, error } = await supabase
      .from(tableName)
      .insert([{ ...payload, created_at: new Date().toISOString() }])
      .select().single();
    if (error) throw error;
    return data;
  },

  async update(id, payload) {
    const { data, error } = await supabase
      .from(tableName).update(payload).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase.from(tableName).delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  subscribe(callback) {
    const channel = supabase
      .channel(`realtime_${tableName}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, callback)
      .subscribe();
    return () => supabase.removeChannel(channel);
  },
});

// ─── Integrations ─────────────────────────────────────────
const integrations = {
  Core: {
    async UploadFile({ file }) {
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { data, error } = await supabase.storage
        .from('uploads')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(fileName);
      return { file_url: urlData.publicUrl };
    },

    async SendEmail({ to, subject, body }) {
      const { error } = await supabase.functions.invoke('send-email', {
        body: { to, subject, body },
      });
      if (error) throw error;
      return true;
    },
  },
};

// ─── Functions (LINE Login) ───────────────────────────────
const functions = {
  async invoke(funcName, payload) {
    const { data, error } = await supabase.functions.invoke(funcName, { body: payload });
    if (error) throw error;
    return { data };
  },
};

// ─── Export ───────────────────────────────────────────────
export const base44 = {
  auth: authModule,
  entities: {
    User: createEntity('users'),
    Announcement: createEntity('announcements'),
    Notification: createEntity('notifications'),
    ShippingSchedule: createEntity('shipping_schedules'),
    PromoImage: createEntity('promo_images'),
    GalleryImage: createEntity('gallery_images'),
    NewsArticle: createEntity('news_articles'),
    BrPayConfig: createEntity('br_pay_configs'),
    DetailContent: createEntity('detail_contents'),
    AddressBlock: createEntity('address_blocks'),
    NoCodePage: createEntity('nocode_pages'),
    NoCodeBlock: createEntity('nocode_blocks'),
    AdminEmail: createEntity('admin_emails'),
  },
  integrations,
  functions,
};
