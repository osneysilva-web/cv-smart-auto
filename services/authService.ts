import { supabase } from './supabaseClient';

export const ADMIN_EMAIL = 'osneysilvamkt@gmail.com';

export const signIn = async (email: string, password: string) => {
  if (!supabase) throw new Error("Supabase client not initialized");
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const signUp = async (email: string, password: string, fullName?: string) => {
  if (!supabase) throw new Error("Supabase client not initialized");
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || email.split('@')[0], // Fallback to email prefix if no name
      }
    }
  });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};