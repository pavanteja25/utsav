import { createClient } from '@supabase/supabase-js';

// Retrieve credentials from environment variables or browser localStorage override
export function getSupabaseCredentials() {
  if (typeof window !== 'undefined') {
    const localUrl = localStorage.getItem('utsav_supabase_url');
    const localKey = localStorage.getItem('utsav_supabase_key');
    if (localUrl && localKey) {
      return { url: localUrl.trim(), anonKey: localKey.trim() };
    }
  }

  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (envUrl && envKey && !envUrl.includes('your-project') && envUrl.startsWith('http')) {
    return { url: envUrl.trim(), anonKey: envKey.trim() };
  }

  return { url: null, anonKey: null };
}

let supabaseInstance = null;
let currentUrl = null;

export function getSupabase() {
  const { url, anonKey } = getSupabaseCredentials();
  if (!url || !anonKey) return null;

  if (!supabaseInstance || currentUrl !== url) {
    supabaseInstance = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    currentUrl = url;
  }

  return supabaseInstance;
}

export const isSupabaseConfigured = () => {
  const { url, anonKey } = getSupabaseCredentials();
  return Boolean(url && anonKey);
};

// Storage helper: Upload file to 'utsav-media' bucket
export async function uploadImageToSupabase(file, folder = 'general') {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase is not configured. Please add your Supabase URL & Anon Key.');
  }

  const fileExt = file.name ? file.name.split('.').pop() : 'jpg';
  const cleanFileName = (file.name ? file.name.replace(/\.[^/.]+$/, '') : 'image')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-');
  const filePath = `${folder}/${Date.now()}-${cleanFileName}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('utsav-media')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from('utsav-media').getPublicUrl(filePath);
  // Append timestamp cache-buster query parameter to prevent browser stale-cache flicker
  return `${data.publicUrl}?t=${Date.now()}`;
}

// Data fetchers with error resilience
export async function fetchSiteSettings() {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.from('site_settings').select('*').eq('id', 'global_settings').single();
  if (error) {
    console.warn('Could not fetch site settings from Supabase:', error.message);
    return null;
  }
  return data;
}

export async function updateSiteSettings(settings) {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');
  const payload = {
    ...settings,
    id: 'global_settings',
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase.from('site_settings').upsert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function fetchCategories() {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true });
  if (error) {
    console.warn('Could not fetch categories from Supabase:', error.message);
    return null;
  }
  return data;
}

export async function upsertCategory(category) {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');
  const payload = {
    ...category,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase.from('categories').upsert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCategory(slug) {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('categories').delete().eq('slug', slug);
  if (error) throw error;
  return true;
}

export async function fetchGalleryImages() {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('gallery_images')
    .select('*')
    .order('display_order', { ascending: true })
    .limit(2000);
  if (error) {
    console.warn('Could not fetch gallery images from Supabase:', error.message);
    return null;
  }
  return data;
}

export async function addGalleryImage(image) {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');
  const payload = {
    ...image,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase.from('gallery_images').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function deleteGalleryImage(id) {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('gallery_images').delete().eq('id', id);
  if (error) throw error;
  return true;
}

export async function fetchTestimonials() {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('display_order', { ascending: true });
  if (error) {
    console.warn('Could not fetch testimonials from Supabase:', error.message);
    return null;
  }
  return data;
}

export async function upsertTestimonial(testimonial) {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');
  const payload = {
    ...testimonial,
    updated_at: new Date().toISOString(),
  };

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(payload.id);

  let result;
  if (isUuid) {
    result = await supabase.from('testimonials').update(payload).eq('id', payload.id).select().single();
  } else {
    delete payload.id;
    result = await supabase.from('testimonials').insert(payload).select().single();
  }

  if (result.error) throw result.error;
  return result.data;
}

export async function deleteTestimonial(id) {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('testimonials').delete().eq('id', id);
  if (error) throw error;
  return true;
}
