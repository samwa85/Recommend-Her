// ============================================================================
// AUTH HOOKS - InsForge authentication hooks
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { getInsforgeClient } from '@/lib/insforge/client';

// ============================================================================
// TYPES
// ============================================================================

interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, unknown> | null;
  profile: {
    nickname?: string;
    avatar_url?: string;
    bio?: string;
    [key: string]: unknown;
  } | null;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: Error }>;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: Error }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// ============================================================================
// USE AUTH HOOK
// ============================================================================

export function useAuth(): AuthState & AuthActions {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const client = getInsforgeClient();
      const { data, error } = await client.auth.getCurrentUser();

      if (error || !data?.user) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          isAuthenticated: false,
        }));
        return;
      }

      setState({
        user: data.user as AuthUser,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: false,
        error: err instanceof Error ? err : new Error('Session check failed'),
      }));
    }
  };

  const signIn = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const client = getInsforgeClient();
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error : new Error(String(error)),
        }));
        return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
      }

      if (!data) {
        const err = new Error('Invalid credentials');
        setState(prev => ({ ...prev, isLoading: false, error: err }));
        return { success: false, error: err };
      }

      // Get full user data
      const { data: userData, error: userError } = await client.auth.getCurrentUser();

      if (userError || !userData?.user) {
        const err = userError instanceof Error ? userError : new Error('Failed to get user data');
        setState(prev => ({ ...prev, isLoading: false, error: err }));
        return { success: false, error: err };
      }

      setState({
        user: userData.user as AuthUser,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });

      return { success: true };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Sign in failed');
      setState(prev => ({ ...prev, isLoading: false, error }));
      return { success: false, error };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const client = getInsforgeClient();
      const { data, error } = await client.auth.signUp({
        email,
        password,
      });

      if (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error : new Error(String(error)),
        }));
        return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
      }

      if (!data) {
        const err = new Error('Sign up failed');
        setState(prev => ({ ...prev, isLoading: false, error: err }));
        return { success: false, error: err };
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
      }));

      return { success: true };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Sign up failed');
      setState(prev => ({ ...prev, isLoading: false, error }));
      return { success: false, error };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      const client = getInsforgeClient();
      await client.auth.signOut();
    } catch (err) {
      // Ignore sign out errors
    } finally {
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });
    }
  }, []);

  const refreshUser = useCallback(async () => {
    await checkSession();
  }, []);

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    refreshUser,
  };
}

// ============================================================================
// USE REQUIRE AUTH HOOK (for protected routes)
// ============================================================================

import { useNavigate, useLocation } from 'react-router-dom';

export function useRequireAuth(redirectTo: string = '/admin/login') {
  const { user, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate(redirectTo, { 
        replace: true,
        state: { from: location.pathname }
      });
    }
  }, [isLoading, isAuthenticated, navigate, redirectTo, location]);

  return { user, isLoading, isAuthenticated };
}
