export const initiateGoogleSignIn = () => {
    // Generate and store state parameter for CSRF protection
    const state = Math.random().toString(36).substring(7);
    sessionStorage.setItem('oauth_state', state);

    // Get base URL from environment
    const baseUrl = process.env.REACT_APP_URL;
    console.log('Using base URL:', baseUrl);

    // Use consistent callback path for all environments
    const callbackPath = '/server/auth/google-callback.php';

    console.log('redirect_uri:', `${baseUrl}${callbackPath}`);
    console.log('client_id:', process.env.REACT_APP_GOOGLE_CLIENT_ID);
    
    // Construct Google OAuth URL
    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleAuthUrl.searchParams.append('client_id', process.env.REACT_APP_GOOGLE_CLIENT_ID);
    googleAuthUrl.searchParams.append('redirect_uri', `${baseUrl}${callbackPath}`);
    googleAuthUrl.searchParams.append('response_type', 'code');
    googleAuthUrl.searchParams.append('scope', 'email profile');
    googleAuthUrl.searchParams.append('state', state);

    // Redirect to Google
    window.location.href = googleAuthUrl.toString();
};