import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
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

  useEffect(() => {
    // Get the initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ── Google OAuth ────────────────────────────
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/account`,
      },
    });
    if (error) {
      toast.error("Google sign-in failed. Please try again.");
      console.error(error);
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
    }
    return { error: null };
  };

  // ── Sign Out ─────────────────────────────────
  const signOut = async () => {
    await supabase.auth.signOut();
    toast.info("Signed out successfully.");
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signInWithGoogle, sendOtp, verifyOtp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
