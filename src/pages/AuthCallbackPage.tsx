import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
const navigate = useNavigate();
const [error, setError] = useState<string | null>(null);

useEffect(() => {
let isMounted = true;

const processOAuth = async () => {
console.log('=== AUTH CALLBACK PROCESSING STARTED ===');
console.log('Current URL:', window.location.href);
console.log('Hash params:', window.location.hash);
console.log('Search params:', window.location.search);

try {
// Extract hash parameters
const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
const accessToken = hashParams.get('access_token');
const refreshToken = hashParams.get('refresh_token');
const expiresIn = hashParams.get('expires_in');
const tokenType = hashParams.get('token_type');

console.log('\n--- OAuth Response Analysis ---');
console.log('Has access_token:', !!accessToken);
console.log('Has refresh_token:', !!refreshToken);
console.log('Has expires_in:', !!expiresIn);
console.log('Token type:', tokenType || 'N/A');

// Check for errors
const errorParam = new URLSearchParams(window.location.search).get('error');
const errorDesc = new URLSearchParams(window.location.search).get('error_description');

if (errorParam) {
console.error('OAuth Error:', errorParam, errorDesc);
setError(`OAuth Error: ${errorDesc || errorParam}`);
navigate('/login', { replace: true });
return;
}

// If we have OAuth tokens, they should be automatically processed by Supabase
// But let's verify
if (accessToken || window.location.href.includes('code=')) {
console.log('\n✓ OAuth tokens detected in URL');
console.log('Waiting for Supabase to create session...');

// Poll for session creation
for (let attempt = 1; attempt <= 20; attempt++) {
await new Promise(resolve => setTimeout(resolve, 500));
if (!isMounted) return;

const { data: { session }, error: sessionError } = await supabase.auth.getSession();

if (sessionError) {
console.error('Session error:', sessionError);
}

if (session?.user) {
console.log(`\n✅ SUCCESS at attempt ${attempt}!`);
console.log('Session user:', session.user.email);
console.log('User ID:', session.user.id);
console.log('Provider:', session.user.app_metadata?.provider || 'unknown');

// Clear URL and redirect
window.history.replaceState({}, document.title, '/account');
if (isMounted) {
navigate('/account', { replace: true });
}
return;
}

console.log(`Attempt ${attempt}/20: Session not ready yet...`);
}

// Failed to get session
console.error('\n❌ FAILED: No session created after 10 seconds');
console.error('\n=== LIKELY CAUSES ===');
console.error('1. Supabase redirect URL not configured correctly');
console.error('   Go to: https://supabase.com/dashboard/project/hmteesodbdvdursgdfox');
console.error('   Authentication → URL Configuration');
console.error('   Add EXACTLY: http://localhost:5173/auth/callback');
console.error('');
console.error('2. Google OAuth credentials incorrect in Supabase');
console.error('3. Browser blocking third-party cookies');
console.error('4. Network issue preventing session exchange');

setError('Session creation failed - check Supabase configuration');
navigate('/login', { replace: true });

} else {
console.log('\nNo OAuth tokens found - this might not be an OAuth callback');
console.log('Redirecting to login...');
navigate('/login', { replace: true });
}
} catch (err) {
console.error('\n❌ Unexpected error:', err);
setError('Authentication failed');
navigate('/login', { replace: true });
}
};

processOAuth();

return () => {
isMounted = false;
console.log('Callback component cleanup');
};
}, [navigate]);

return (
<div className="min-h-screen flex items-center justify-center bg-background">
<div className="text-center">
<div className="w-8 h-8 rounded-full border-2 border-[#FFD166] border-t-transparent animate-spin mx-auto mb-4" />
<p className="font-body text-muted-foreground">
{error ? `Error: ${error}` : 'Completing sign in...'}
</p>
<p className="text-xs text-muted-foreground mt-2">
Open browser console (F12) for detailed logs
</p>
{error && (
<p className="text-xs text-red-500 mt-2">
Redirecting to login...
</p>
)}
</div>
</div>
);
}