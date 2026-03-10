// src/hooks/useAuth.js
'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ACTIVE_ROLE_KEY } from '@/lib/constants';

// ✅ FIX #1 — Create client ONCE outside the hook
// This means all components using useAuth share the same instance
const supabase = createClient();

export function useAuth() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [activeRole, setActiveRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ✅ FIX #2 — Track if we've already loaded to prevent double fetch
  const initialized = useRef(false);

  // ✅ Wrap in useCallback so it can be safely reused
  const loadUserProfile = useCallback(async (userId) => {
    try {
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select(
          'user_id, role, active_role, is_pianist, is_client'  // ✅ only select what we need
        )
        .eq('user_id', userId);

      if (error) {
        console.error('Error loading user profile:', error);
        return null;
      }

      return profiles && profiles.length > 0 ? profiles[0] : null;
    } catch (err) {
      console.error('Error in loadUserProfile:', err);
      return null;
    }
  }, []);

  const determineActiveRole = useCallback((profile) => {
    if (!profile) return null;

    // Check localStorage for saved preference
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(ACTIVE_ROLE_KEY);
      if (saved === 'pianist' && profile.is_pianist) return 'pianist';
      if (saved === 'client' && profile.is_client) return 'client';
    }

    // Fall back to database active_role
    if (profile.active_role === 'pianist' && profile.is_pianist) return 'pianist';
    if (profile.active_role === 'client' && profile.is_client) return 'client';

    // Fall back to whichever role they have
    if (profile.is_pianist) return 'pianist';
    if (profile.is_client) return 'client';

    return null;
  }, []);

  // ✅ Shared handler for when we have a user session
  const handleUserSession = useCallback(async (authUser) => {
    if (!authUser) {
      setUser(null);
      setUserProfile(null);
      setActiveRole(null);
      setLoading(false);
      return;
    }

    setUser(authUser);
    const profile = await loadUserProfile(authUser.id);
    setUserProfile(profile);
    setActiveRole(determineActiveRole(profile));
    setLoading(false);
  }, [loadUserProfile, determineActiveRole]);

  useEffect(() => {
    // ✅ FIX #2 — Remove manual getUser() call
    // onAuthStateChange fires INITIAL_SESSION immediately on mount
    // which covers the initial load — no need to call getUser() separately

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // ✅ Only process once on initial load to avoid double fetch
      if (event === 'INITIAL_SESSION') {
        if (initialized.current) return;
        initialized.current = true;
      }

      await handleUserSession(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [handleUserSession]);

  const switchRole = useCallback(async (newRole) => {
    if (!userProfile) return;

    // Validate they have this role
    if (newRole === 'pianist' && !userProfile.is_pianist) return;
    if (newRole === 'client' && !userProfile.is_client) return;

    // Save to localStorage for instant switching
    localStorage.setItem(ACTIVE_ROLE_KEY, newRole);
    setActiveRole(newRole);

    // Save to database in background
    await supabase
      .from('user_profiles')
      .update({ active_role: newRole })
      .eq('user_id', user.id);

    // Navigate to appropriate dashboard
    if (newRole === 'pianist') {
      router.push('/pianist/dashboard');
    } else {
      router.push('/client/dashboard');
    }
  }, [userProfile, user, router]);

  const activateRole = useCallback(async (newRole) => {
    if (!user || !userProfile) return false;

    try {
      const updates = {};
      if (newRole === 'pianist') {
        updates.is_pianist = true;
        updates.active_role = 'pianist';
      } else {
        updates.is_client = true;
        updates.active_role = 'client';
      }

      // Update user_profiles
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (profileError) {
        console.error('Error activating role:', profileError);
        return false;
      }

      // Create role-specific profile if it doesn't exist
      if (newRole === 'pianist') {
        const { data: existing } = await supabase
          .from('pianist_profiles')
          .select('id')
          .eq('user_id', user.id);

        if (!existing || existing.length === 0) {
          const { error: createError } = await supabase
            .from('pianist_profiles')
            .insert({
              user_id: user.id,
              name: '',
              postcode: '',
            });

          if (createError) {
            console.error('Error creating pianist profile:', createError);
            return false;
          }
        }
      } else {
        const { data: existing } = await supabase
          .from('client_profiles')
          .select('id')
          .eq('user_id', user.id);

        if (!existing || existing.length === 0) {
          const { error: createError } = await supabase
            .from('client_profiles')
            .insert({
              user_id: user.id,
              name: '',
              email: user.email || '',
            });

          if (createError) {
            console.error('Error creating client profile:', createError);
            return false;
          }
        }
      }

      // ✅ Update local state immediately — no need to re-fetch
      const updatedProfile = { ...userProfile, ...updates };
      setUserProfile(updatedProfile);
      setActiveRole(newRole);
      localStorage.setItem(ACTIVE_ROLE_KEY, newRole);

      return true;
    } catch (err) {
      console.error('Error in activateRole:', err);
      return false;
    }
  }, [user, userProfile]);

  const signOut = useCallback(async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACTIVE_ROLE_KEY);
    }
    await supabase.auth.signOut();
    // ✅ onAuthStateChange will handle clearing state
    // No need to manually setUser(null) etc.
    router.push('/');
    router.refresh();
  }, [router]);

  return {
    user,
    userProfile,
    activeRole,
    loading,
    signOut,
    switchRole,
    activateRole,
    isAuthenticated: !!user,
    isPianist: activeRole === 'pianist',
    isClient: activeRole === 'client',
    isAdmin: userProfile?.role === 'admin',
    hasPianistRole: userProfile?.is_pianist || false,
    hasClientRole: userProfile?.is_client || false,
    hasBothRoles: (userProfile?.is_pianist && userProfile?.is_client) || false,
  };
}