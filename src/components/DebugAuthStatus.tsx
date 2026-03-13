import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function DebugAuthStatus() {
  const [status, setStatus] = useState<string>("Checking...");
  const [hasTokens, setHasTokens] = useState<boolean>(false);
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Check URL for tokens
      const currentUrl = window.location.href;
      setUrl(currentUrl);
      
      const hasAuthTokens = currentUrl.includes("access_token") || currentUrl.includes("refresh_token");
      setHasTokens(hasAuthTokens);
      
      // Check localStorage
      const storageKey = 'sb-auth-token';
      const storedSession = localStorage.getItem(storageKey);
      
      let debugInfo = [];
      debugInfo.push(`Session: ${session ? `✅ ${session.user?.email}` : "❌ null"}`);
      debugInfo.push(`URL has tokens: ${hasAuthTokens ? "✅ Yes" : "❌ No"}`);
      debugInfo.push(`Stored in localStorage: ${storedSession ? "✅ Yes" : "❌ No"}`);
      debugInfo.push(`Current URL: ${currentUrl.substring(0, 100)}`);
      
      setStatus(debugInfo.join("\n"));
    };

    checkAuth();
    
    const interval = setInterval(checkAuth, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-4 left-4 bg-black text-green-400 p-4 rounded-lg font-mono text-xs z-50 max-w-md whitespace-pre-line">
      <div className="font-bold mb-2">Auth Debug Status</div>
      <div>{status}</div>
      <div className="mt-2 text-[10px] text-green-300">Refresh to update</div>
    </div>
  );
}