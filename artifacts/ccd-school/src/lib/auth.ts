"use client";
// Auth stub — localStorage-only in this build (Supabase removed)
// Sign-in with Supabase can be wired back in when SUPABASE_URL env is present
export const useAuth = () => ({
  session: null,
  user: null,
  loading: false,
});

export const signOut = () => {
  // no-op in localStorage-only mode
};
