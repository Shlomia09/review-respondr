import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== OAuth Callback Started ===');
    
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    console.log('URL Parameters:', { code: !!code, state, error });

    if (error) {
      console.error('❌ OAuth Error from provider:', error);
      return new Response(`
        <html>
          <head>
            <title>OAuth Error</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f8f9fa; }
              .error { color: #dc3545; font-size: 24px; margin-bottom: 16px; }
            </style>
          </head>
          <body>
            <div class="error">❌ שגיאה בהתחברות</div>
            <p>שגיאה: ${error}</p>
            <script>
              console.log('OAuth Error from URL:', '${error}');
              if (window.opener) {
                window.opener.postMessage({error: '${error}'}, '*');
              }
              setTimeout(() => window.close(), 3000);
            </script>
          </body>
        </html>
      `, {
        headers: { 
          'Content-Type': 'text/html',
          'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
          'X-Frame-Options': 'SAMEORIGIN'
        }
      });
    }

    if (!code || !state) {
      console.error('❌ Missing code or state:', { code: !!code, state });
      throw new Error('Missing authorization code or state');
    }

    // Parse state to get platform and user ID
    const [platform, userId] = state.split('_');
    console.log('🔍 Parsed state:', { platform, userId });

    if (!platform || !userId) {
      throw new Error('Invalid state parameter');
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Exchange code for access token
    console.log('🔄 Exchanging code for token...');
    let tokenData;
    switch (platform) {
      case 'google':
        tokenData = await exchangeGoogleCode(code);
        break;
      case 'facebook':
        tokenData = await exchangeFacebookCode(code);
        break;
      default:
        throw new Error('Unsupported platform: ' + platform);
    }

    if (!tokenData) {
      throw new Error('Failed to exchange code for token');
    }

    console.log('✅ Token exchange successful');

    // Store tokens in database
    const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString();
    
    console.log('💾 Storing tokens in database...');
    const { error: dbError } = await supabaseClient
      .from('platform_tokens')
      .upsert({
        user_id: userId,
        platform: platform,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: expiresAt,
      }, {
        onConflict: 'user_id,platform'
      });

    if (dbError) {
      console.error('❌ Database error:', dbError);
      throw new Error('Failed to store tokens: ' + dbError.message);
    }

    console.log('✅ Tokens stored successfully');

    // Return success page that closes the popup
    return new Response(`
      <html>
        <head>
          <title>Connection Successful</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white;
              text-align: center;
              direction: rtl;
            }
            .container {
              background: rgba(255, 255, 255, 0.15);
              backdrop-filter: blur(10px);
              padding: 3rem;
              border-radius: 20px;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
              max-width: 400px;
              width: 90%;
            }
            .success { 
              color: #10f5a8; 
              font-size: 4rem; 
              margin-bottom: 1rem;
              animation: bounce 1s ease-in-out;
            }
            .title { 
              font-size: 1.75rem; 
              margin-bottom: 0.75rem; 
              font-weight: 600;
            }
            .description { 
              opacity: 0.9; 
              margin-bottom: 2rem; 
              font-size: 1.1rem;
              line-height: 1.5;
            }
            .loading { 
              opacity: 0.7;
              font-size: 0.95rem;
              animation: pulse 2s ease-in-out infinite;
            }
            .progress-bar {
              width: 100%;
              height: 4px;
              background: rgba(255, 255, 255, 0.2);
              border-radius: 2px;
              overflow: hidden;
              margin-top: 1rem;
            }
            .progress-fill {
              height: 100%;
              background: #10f5a8;
              width: 0%;
              animation: progress 3s ease-out forwards;
            }
            @keyframes bounce {
              0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
              40% { transform: translateY(-10px); }
              60% { transform: translateY(-5px); }
            }
            @keyframes pulse {
              0%, 100% { opacity: 0.7; }
              50% { opacity: 1; }
            }
            @keyframes progress {
              0% { width: 0%; }
              100% { width: 100%; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success">✓</div>
            <div class="title">החיבור הושלם בהצלחה!</div>
            <div class="description">
              הפלטפורמה חוברה למערכת.<br>
              כעת תוכל לבחור את העסק שלך.
            </div>
            <div class="loading">מעבד את המידע...</div>
            <div class="progress-bar">
              <div class="progress-fill"></div>
            </div>
          </div>
          <script>
            console.log('=== OAuth Success Page ===');
            console.log('Platform:', '${platform}');
            console.log('User ID:', '${userId}');
            
            // Enhanced message sending with better error handling
            function sendSuccessMessage() {
              const message = {
                success: true,
                platform: '${platform}',
                userId: '${userId}',
                timestamp: Date.now()
              };
              
              console.log('📢 Sending success message:', message);
              
              try {
                // Try multiple methods to communicate success
                if (window.opener && !window.opener.closed) {
                  window.opener.postMessage(message, '*');
                  console.log('✅ Message sent to opener window');
                  
                  // Also try to focus the parent window
                  window.opener.focus();
                }
                
                if (window.parent && window.parent !== window) {
                  window.parent.postMessage(message, '*');
                  console.log('✅ Message sent to parent window');
                }
                
              } catch (e) {
                console.error('❌ Error sending messages:', e);
              }
            }
            
            // Send message multiple times to ensure delivery
            sendSuccessMessage();
            setTimeout(sendSuccessMessage, 200);
            setTimeout(sendSuccessMessage, 500);
            setTimeout(sendSuccessMessage, 1000);
            setTimeout(sendSuccessMessage, 2000);
            
            // Close window after showing progress
            setTimeout(() => {
              console.log('🔒 Closing OAuth popup window');
              try {
                if (window.opener) {
                  window.opener.focus();
                }
                window.close();
              } catch (e) {
                console.log('Could not close window, user will need to close manually:', e);
                document.querySelector('.loading').textContent = 'ניתן לסגור את החלון';
              }
            }, 3500);
          </script>
        </body>
      </html>
    `, {
      headers: { 
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
        'X-Frame-Options': 'SAMEORIGIN',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    console.error('❌ OAuth callback error:', error);
    
    // Return error page
    return new Response(`
      <html>
        <head>
          <title>Connection Failed</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
              color: white;
              text-align: center;
            }
            .container {
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(10px);
              padding: 2rem;
              border-radius: 15px;
              box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
            }
            .error { color: #ff4444; font-size: 3rem; margin-bottom: 1rem; }
            .title { font-size: 1.5rem; margin-bottom: 0.5rem; }
            .description { opacity: 0.8; margin-bottom: 2rem; }
            .error-details { font-size: 0.9rem; opacity: 0.7; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="error">✗</div>
            <div class="title">שגיאה בחיבור</div>
            <div class="description">אירעה שגיאה בתהליך החיבור</div>
            <div class="error-details">${error.message}</div>
          </div>
          <script>
            console.error('OAuth Error:', '${error.message}');
            if (window.opener) {
              window.opener.postMessage({
                error: '${error.message}'
              }, '*');
            }
            setTimeout(() => window.close(), 5000);
          </script>
        </body>
      </html>
    `, {
      status: 500,
      headers: { 
        'Content-Type': 'text/html',
        'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
        'X-Frame-Options': 'SAMEORIGIN'
      }
    });
  }
});

async function exchangeGoogleCode(code: string) {
  console.log('🔄 Exchanging Google code...');
  
  const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
  const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
  const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/oauth-callback`;

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials not configured');
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Google token exchange failed:', errorText);
    throw new Error('Failed to exchange Google authorization code: ' + errorText);
  }

  const tokenData = await response.json();
  console.log('✅ Google token exchange successful');
  return tokenData;
}

async function exchangeFacebookCode(code: string) {
  console.log('🔄 Exchanging Facebook code...');
  
  const appId = Deno.env.get('FACEBOOK_APP_ID');
  const appSecret = Deno.env.get('FACEBOOK_APP_SECRET');
  const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/oauth-callback`;

  if (!appId || !appSecret) {
    throw new Error('Facebook OAuth credentials not configured');
  }

  const url = `https://graph.facebook.com/v18.0/oauth/access_token?` + 
    `client_id=${appId}&` +
    `client_secret=${appSecret}&` +
    `code=${code}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Facebook token exchange failed:', errorText);
    throw new Error('Failed to exchange Facebook authorization code: ' + errorText);
  }

  const tokenData = await response.json();
  console.log('✅ Facebook token exchange successful');
  return tokenData;
}