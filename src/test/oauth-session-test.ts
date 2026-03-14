// Test to verify if Supabase is creating sessions correctly
import { supabase } from '../lib/supabase';

export async function testOAuthSession() {
  console.log('=== OAUTH SESSION TEST ===');
  console.log('Current URL:', window.location.href);
  console.log('Hash:', window.location.hash);
  console.log('Search:', window.location.search);
  
  // Check for OAuth params in URL
  const hasAccessToken = window.location.hash.includes('access_token');
  const hasCode = window.location.href.includes('code=');
  const hasError = window.location.href.includes('error=');
  
  console.log('Has access_token:', hasAccessToken);
  console.log('Has code:', hasCode);
  console.log('Has error:', hasError);
  
  if (hasError) {
    const error = new URLSearchParams(window.location.search).get('error');
    const errorDescription = new URLSearchParams(window.location.search).get('error_description');
    console.error('OAuth Error:', error, errorDescription);
    return { success: false, error, errorDescription };
  }
  
  // Try to get session immediately
  console.log('\n--- Attempting to get session ---');
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Session error:', error);
    return { success: false, error: error.message };
  }
  
  if (session?.user) {
    console.log('✅ Session found!');
    console.log('User ID:', session.user.id);
    console.log('User Email:', session.user.email);
    console.log('Provider:', session.user.app_metadata?.provider);
    return { success: true, session };
  } else {
    console.log('❌ No session found');
    console.log('This means Supabase has NOT created a session yet.');
    console.log('Possible causes:');
    console.log('1. OAuth params missing from URL');
    console.log('2. Supabase redirect URL misconfigured');
    console.log('3. Google OAuth credentials incorrect');
    return { success: false, error: 'No session created' };
  }
}

// Run the test
testOAuthSession();
