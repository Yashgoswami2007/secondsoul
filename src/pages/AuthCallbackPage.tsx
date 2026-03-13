import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase will automatically handle the OAuth callback
    // We just need to wait for the auth state to update
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Auth successful, redirect to account
        navigate("/account", { replace: true });
      } else {
        // Auth failed, redirect to login
        navigate("/login", { replace: true });
      }
    };

    // Give Supabase a moment to process the callback
    const timer = setTimeout(checkAuth, 500);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#FFD166] border-t-transparent animate-spin mx-auto mb-4" />
        <p className="font-body text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}