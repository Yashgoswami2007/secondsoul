// Manual OAuth test - run this in browser console after OAuth redirect
import { supabase } from '../lib/supabase';

export async function manualOAuthTest() {
  console.log('=== MANUAL OAUTH TEST ===');
  
  // Get URL params
  const hash = window.location.hash;
  const search = window.location.search;
  
  console.log('Hash:', hash);
  console.log('Search:', search);
  
  // Extract access_token from hash if present
  const hashParams = new URLSearchParams(hash.replace('#', ''));
  const accessToken = hashParams.get('access_token');
  const refreshToken = hashParams.get('refresh_token');
  const expiresIn = hashParams.get('expires_in');
  const tokenType = hashParams.get('token_type');
  
  console.log('Access Token:', accessToken ? 'PRESENT' : 'MISSING');
  console.log('Refresh Token:', refreshToken ? 'PRESENT' : 'MISSING');
  
  if (accessToken) {
    console.log('✅ OAuth tokens found in URL!');
    console.log('Token type:', tokenType);
    console.log('Expires in:', expiresIn);
    
    // Try to get session - Supabase should have already processed this
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      console.log('✅ Session exists!');
      console.log('User:', session.user.email);
    } else {
      console.log('❌ No session despite having tokens!');
      console.log('This means Supabase did not auto-process the OAuth callback.');
      console.log('Possible reasons:');
      console.log('1. Redirect URL mismatch in Supabase dashboard');
      console.log('2. detectSessionInUrl is not working');
      console.log('3. Browser blocking cookies');
    }
  } else {
    console.log('❌ No OAuth tokens in URL');
    console.log('Check if you were redirected from Google correctly');
  }
}

manualOAuthTest();
