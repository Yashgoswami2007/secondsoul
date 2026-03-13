import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  sendOtp: (phone: string) => Promise<{ error: string | null }>;
  verifyOtp: (phone: string, token: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    console.log('AuthProvider initializing...');
    
    let isMounted = true;
    
    // Listen for auth state changes (handles OAuth callbacks and all auth events)
    console.log('Setting up auth state listener...');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await checkAdminRole(session.user.id);
        } else {
          setIsAdmin(false);
        }

        // Clean up URL after OAuth sign in
        if (event === 'SIGNED_IN' && window.location.href.includes('access_token')) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        // Only set loading to false for events that complete the auth flow
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          setLoading(false);
        } else if (event === 'INITIAL_SESSION' && !session) {
          // No session found on initial load
          setLoading(false);
        }
      }
    );

    // Check for initial session (runs only on mount)
    const checkInitialSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        console.log('Initial session found:', initialSession?.user?.email);
        
        // Only update if no auth event has fired yet
        if (initialSession?.user && !session) {
          setSession(initialSession);
          setUser(initialSession.user);
          await checkAdminRole(initialSession.user.id);
        } else if (!initialSession) {
          setLoading(false);
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('Error checking initial session:', error);
        setLoading(false);
      }
    };

    checkInitialSession();

    return () => {
      console.log('AuthProvider unsubscribing...');
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const checkAdminRole = async (userId: string) => {
    try {
      console.log('Checking admin role for user:', userId);
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error checking admin role:", error);
        setIsAdmin(false);
        return;
      }

      const isAdminUser = data?.role === "admin";
      console.log('Admin role check result:', isAdminUser, 'Role:', data?.role);
      setIsAdmin(isAdminUser);
    } catch (err) {
      console.error("Error checking admin role:", err);
      setIsAdmin(false);
    }
  };

  // ── Google OAuth ────────────────────────────
  const signInWithGoogle = async () => {
    console.log('Initiating Google sign in...');
    const redirectUrl = `${window.location.origin}/account`;
    console.log('Redirect URL:', redirectUrl);
    
    // Make sure the redirect URL is properly encoded
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    });
    
    if (error) {
      console.error('Google sign-in error:', error);
      toast.error("Google sign-in failed. Please try again.");
    } else {
      console.log('Google sign-in initiated successfully');
      // The browser redirect is handled by Supabase automatically
    }
  };

  // ── Phone OTP: Step 1 — Send ────────────────
  const sendOtp = async (phone: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  };

  // ── Phone OTP: Step 2 — Verify ──────────────
  const verifyOtp = async (phone: string, token: string): Promise<{ error: string | null }> => {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: "sms",
    });
    if (error) {
      return { error: error.message };
    }
    if (data.user) {
      toast.success("Signed in successfully!");
      await checkAdminRole(data.user.id);
    }
    return { error: null };
  };

  // ── Sign Out ─────────────────────────────────
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        toast.error("Error signing out.");
      } else {
        setIsAdmin(false);
        toast.info("Signed out successfully.");
      }
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error("Error signing out.");
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, signInWithGoogle, sendOtp, verifyOtp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};