import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { DbProfile, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  profile: DbProfile | null;
  session: Session | null;
  role: UserRole;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  isConfigured: boolean;
  signUp: (name: string, email: string, password: string) => Promise<{ error: AuthError | Error | null; needsConfirmation?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | Error | null }>;
  sendLoginOtp: (email: string) => Promise<{ error: AuthError | Error | null }>;
  verifyLoginOtp: (email: string, token: string) => Promise<{ error: AuthError | Error | null }>;
  resendLoginOtp: (email: string) => Promise<{ error: AuthError | Error | null }>;
  verifySignupOtp: (email: string, token: string, name?: string) => Promise<{ error: AuthError | Error | null }>;
  resendSignupOtp: (email: string) => Promise<{ error: AuthError | Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | Error | null }>;
  refreshProfile: () => Promise<void>;
  updateProfileData: (updates: Partial<DbProfile>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<DbProfile | null>(null);
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);

  // Fetch citizen profile from public.profiles table, auto-provisioning if missing
  const fetchProfile = useCallback(async (userId: string) => {
    if (!isSupabaseConfigured) {
      setProfile(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Profile fetch notice:', error.message);
      }

      if (data) {
        setProfile(data as DbProfile);
      } else {
        // Auto-provision profile row in public.profiles if missing
        const { data: authUserData } = await supabase.auth.getUser();
        const currentUser = authUserData?.user;
        if (currentUser && currentUser.id === userId) {
          const citizenName = currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || 'Citizen';
          const newProfile: DbProfile = {
            id: currentUser.id,
            name: citizenName,
            email: currentUser.email ?? '',
            phone: currentUser.user_metadata?.phone || null,
            state: 'National Portal',
            district: 'All Districts',
            category: 'General',
            occupation: 'Citizen',
            annual_income_bracket: 'Not Specified',
            digilocker_linked: false,
            aadhaar_verified: false,
            role: 'citizen',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          const { data: inserted, error: insertErr } = await supabase
            .from('profiles')
            .upsert(newProfile)
            .select()
            .maybeSingle();

          if (!insertErr && inserted) {
            setProfile(inserted as DbProfile);
          } else {
            setProfile(newProfile);
          }
        } else {
          setProfile(null);
        }
      }
    } catch (err) {
      console.warn('Profile fetch exception:', err);
      setProfile(null);
    }
  }, []);

  // Record login event in public.login_history and public.activity_logs
  const recordLoginEvent = async (userId: string, userEmail: string) => {
    if (!isSupabaseConfigured) return;
    try {
      const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : null;
      await supabase.from('login_history').insert({
        user_id: userId,
        user_email: userEmail,
        user_agent: userAgent
      });

      await supabase.from('activity_logs').insert({
        user_id: userId,
        action_type: 'auth',
        title: 'Citizen Login',
        description: 'Successful authenticated portal access.',
        status_tag: 'Verified'
      });
    } catch (err) {
      console.warn('Login history record error:', err);
    }
  };

  // Initialize auth state
  useEffect(() => {
    if (!isSupabaseConfigured) {
      return;
    }

    let isMounted = true;

    // Check active session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!isMounted) return;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        fetchProfile(currentSession.user.id);
      }
      setIsLoading(false);
    }).catch(() => {
      if (isMounted) setIsLoading(false);
    });

    // Listen to auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!isMounted) return;
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          await fetchProfile(newSession.user.id);
          if (event === 'SIGNED_IN') {
            await recordLoginEvent(newSession.user.id, newSession.user.email ?? '');
          }
        } else {
          setProfile(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Sign up with name, email and password (OTP confirmation, no email redirect)
  const signUp = async (name: string, email: string, password: string): Promise<{ error: AuthError | Error | null; needsConfirmation?: boolean }> => {
    if (!isSupabaseConfigured) {
      return { 
        error: new Error('Supabase environment credentials not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local') 
      };
    }

    const normalizedEmail = email.trim().toLowerCase();

    try {
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            name: name.trim()
          }
        }
      });

      if (error) {
        return { error };
      }

      // Detect if account already exists (Supabase returns empty identities array without error)
      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        return {
          error: new Error('An account with this email already exists. Please sign in with your email OTP or password.')
        };
      }

      const needsConfirmation = Boolean(data.user && !data.session);

      // If user is returned immediately with active session, ensure profile exists
      if (data.user) {
        await fetchProfile(data.user.id);
      }

      return { error: null, needsConfirmation };
    } catch (err: any) {
      return { error: err };
    }
  };

  // Send a 6-digit login OTP to a registered citizen email
  const sendLoginOtp = async (email: string): Promise<{ error: AuthError | Error | null }> => {
    if (!isSupabaseConfigured) {
      return { 
        error: new Error('Supabase environment credentials not configured.') 
      };
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      return { error: new Error('Please enter a valid email address.') };
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          shouldCreateUser: false
        }
      });

      if (error) {
        if (error.message.toLowerCase().includes('signups not allowed') || 
            error.message.toLowerCase().includes('user not found')) {
          return {
            error: new Error('No registered account found with this email. Please click "Create Citizen Account" below to register.')
          };
        }
        return { error };
      }

      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  // Verify the 6-digit login OTP
  const verifyLoginOtp = async (email: string, token: string): Promise<{ error: AuthError | Error | null }> => {
    if (!isSupabaseConfigured) {
      return { 
        error: new Error('Supabase environment credentials not configured.') 
      };
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanToken = token.trim().replace(/\D/g, '');

    if (cleanToken.length !== 6) {
      return { error: new Error('Please enter a valid 6-digit verification code.') };
    }

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: normalizedEmail,
        token: cleanToken,
        type: 'email'
      });

      if (error) {
        if (error.message.toLowerCase().includes('expired') || error.message.toLowerCase().includes('invalid')) {
          return {
            error: new Error('The login verification code is invalid or has expired. Please verify the code or click "Resend Code".')
          };
        }
        return { error };
      }

      if (data.user) {
        await fetchProfile(data.user.id);
        await recordLoginEvent(data.user.id, data.user.email ?? normalizedEmail);
      }

      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  // Resend login OTP
  const resendLoginOtp = async (email: string): Promise<{ error: AuthError | Error | null }> => {
    return sendLoginOtp(email);
  };

  // Verify registration confirmation OTP (type: 'signup') and initialize citizen profile
  const verifySignupOtp = async (email: string, token: string, name?: string): Promise<{ error: AuthError | Error | null }> => {
    if (!isSupabaseConfigured) {
      return { 
        error: new Error('Supabase environment credentials not configured.') 
      };
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanToken = token.trim().replace(/\D/g, '');

    if (cleanToken.length !== 6) {
      return { error: new Error('Please enter a valid 6-digit confirmation code.') };
    }

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: normalizedEmail,
        token: cleanToken,
        type: 'signup'
      });

      if (error) {
        if (error.message.toLowerCase().includes('expired') || error.message.toLowerCase().includes('invalid')) {
          return {
            error: new Error('The confirmation code is invalid or has expired. Please check your code or click "Resend Code".')
          };
        }
        return { error };
      }

      if (data.user) {
        // Auto-provision or update citizen profile in public.profiles
        const citizenName = name?.trim() || data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Citizen';
        const newProfile: DbProfile = {
          id: data.user.id,
          name: citizenName,
          email: data.user.email ?? normalizedEmail,
          phone: data.user.user_metadata?.phone || null,
          state: 'National Portal',
          district: 'All Districts',
          category: 'General',
          occupation: 'Citizen',
          annual_income_bracket: 'Not Specified',
          digilocker_linked: false,
          aadhaar_verified: false,
          role: 'citizen',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data: inserted, error: insertErr } = await supabase
          .from('profiles')
          .upsert(newProfile)
          .select()
          .maybeSingle();

        if (!insertErr && inserted) {
          setProfile(inserted as DbProfile);
        } else {
          await fetchProfile(data.user.id);
        }

        await recordLoginEvent(data.user.id, data.user.email ?? normalizedEmail);
      }

      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  // Resend registration confirmation OTP
  const resendSignupOtp = async (email: string): Promise<{ error: AuthError | Error | null }> => {
    if (!isSupabaseConfigured) {
      return { 
        error: new Error('Supabase environment credentials not configured.') 
      };
    }

    const normalizedEmail = email.trim().toLowerCase();

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: normalizedEmail
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { 
        error: new Error('Supabase environment credentials not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local') 
      };
    }

    const normalizedEmail = email.trim().toLowerCase();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password
      });

      if (error) {
        return { error };
      }

      if (data.user) {
        await fetchProfile(data.user.id);
        await recordLoginEvent(data.user.id, data.user.email ?? normalizedEmail);
      }

      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  // Sign out
  const signOut = async () => {
    if (!isSupabaseConfigured) {
      setUser(null);
      setSession(null);
      setProfile(null);
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      return { error: error ? new Error(error.message) : null };
    } catch (err: any) {
      setUser(null);
      setSession(null);
      setProfile(null);
      return { error: err };
    }
  };

  // Password Reset Request
  const resetPassword = async (email: string) => {
    if (!isSupabaseConfigured) {
      return { 
        error: new Error('Supabase environment credentials not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local') 
      };
    }

    const normalizedEmail = email.trim().toLowerCase();

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined
      });
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  // Refresh current user profile
  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  // Update profile demographic data
  const updateProfileData = async (updates: Partial<DbProfile>) => {
    if (!user || !isSupabaseConfigured) {
      return { error: new Error('Not authenticated') };
    }

    try {
      // Ensure role is never altered by ordinary citizen
      const safeUpdates = { ...updates };
      delete (safeUpdates as any).role;
      delete (safeUpdates as any).id;
      delete (safeUpdates as any).email;

      const { error } = await supabase
        .from('profiles')
        .update(safeUpdates)
        .eq('id', user.id);

      if (error) {
        return { error: new Error(error.message) };
      }

      await fetchProfile(user.id);

      await supabase.from('activity_logs').insert({
        user_id: user.id,
        action_type: 'auth',
        title: 'Profile Updated',
        description: 'Demographic and socio-economic parameters updated.',
        status_tag: 'Verified'
      });

      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const role: UserRole = profile?.role ?? 'citizen';
  const isAdmin = role === 'admin';
  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        role,
        isAuthenticated,
        isAdmin,
        isLoading,
        isConfigured: isSupabaseConfigured,
        signUp,
        signIn,
        sendLoginOtp,
        verifyLoginOtp,
        resendLoginOtp,
        verifySignupOtp,
        resendSignupOtp,
        signOut,
        resetPassword,
        refreshProfile,
        updateProfileData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// oxlint-disable-next-line react/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
