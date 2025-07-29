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
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    if (error) {
      return new Response(`
        <html>
          <body>
            <script>
              window.opener.postMessage({error: '${error}'}, '*');
              window.close();
            </script>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    if (!code || !state) {
      throw new Error('Missing authorization code or state');
    }

    // Parse state to get platform and user ID
    const [platform, userId] = state.split('_');

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Exchange code for access token
    let tokenData;
    switch (platform) {
      case 'google':
        tokenData = await exchangeGoogleCode(code);
        break;
      case 'facebook':
        tokenData = await exchangeFacebookCode(code);
        break;
      default:
        throw new Error('Unsupported platform');
    }

    if (!tokenData) {
      throw new Error('Failed to exchange code for token');
    }

    // Store tokens in database
    const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString();
    
    await supabaseClient
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

    // Return success page that closes the popup
    return new Response(`
      <html>
        <head>
          <title>Connection Successful</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              padding: 50px;
              background: #f8f9fa;
              margin: 0;
            }
            .success {
              color: #28a745;
              font-size: 24px;
              margin-bottom: 16px;
            }
            .message {
              color: #666;
              font-size: 16px;
            }
          </style>
        </head>
        <body>
          <div class="success">✅ התחברות הושלמה בהצלחה!</div>
          <div class="message">החלון ייסגר אוטומטית...</div>
          <script>
            console.log('=== OAuth Callback Success ===');
            console.log('Platform:', '${platform}');
            console.log('Sending postMessage to parent window...');
            
            // Multiple attempts to send the message
            function sendMessage() {
              const message = {success: true, platform: '${platform}'};
              console.log('Sending message:', message);
              
              // Try window.opener first
              if (window.opener && !window.opener.closed) {
                try {
                  window.opener.postMessage(message, '*');
                  console.log('Message sent to opener');
                } catch (e) {
                  console.log('Error sending to opener:', e);
                }
              } else {
                console.log('No opener window available');
              }
              
              // Also try parent in case it's in an iframe
              try {
                if (window.parent && window.parent !== window) {
                  window.parent.postMessage(message, '*');
                  console.log('Message sent to parent');
                }
              } catch (e) {
                console.log('Error sending to parent:', e);
              }
              
              // Try to update the opener directly if possible
              try {
                if (window.opener && window.opener.location && window.opener.location.reload) {
                  window.opener.location.reload();
                  console.log('Reloaded opener window');
                }
              } catch (e) {
                console.log('Could not reload opener:', e);
              }
            }
            
            // Send immediately and multiple times
            sendMessage();
            setTimeout(sendMessage, 100);
            setTimeout(sendMessage, 500);
            setTimeout(sendMessage, 1000);
            
            // Force close window
            setTimeout(() => {
              console.log('Force closing window...');
              try {
                window.close();
              } catch (e) {
                console.log('Could not close window:', e);
                // Try to hide the window content
                document.body.innerHTML = '<div style="text-align:center;padding:50px;color:#28a745;font-size:18px;">✅ ההתחברות הושלמה!<br><small>אנא סגור חלון זה ידנית אם הוא לא נסגר אוטומטית</small></div>';
              }
            }, 2000);
          </script>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });

  } catch (error) {
    console.error('OAuth callback error:', error);
    
    return new Response(`
      <html>
        <body>
          <h2>שגיאה בהתחברות</h2>
          <p>${error.message}</p>
          <script>
            window.opener.postMessage({error: '${error.message}'}, '*');
            setTimeout(() => window.close(), 3000);
          </script>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
});

async function exchangeGoogleCode(code: string) {
  const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
  const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
  const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/oauth-callback`;

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId!,
      client_secret: clientSecret!,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange Google authorization code');
  }

  return await response.json();
}

async function exchangeFacebookCode(code: string) {
  const appId = Deno.env.get('FACEBOOK_APP_ID');
  const appSecret = Deno.env.get('FACEBOOK_APP_SECRET');
  const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/oauth-callback`;

  const response = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    body: new URLSearchParams({
      client_id: appId!,
      client_secret: appSecret!,
      code: code,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange Facebook authorization code');
  }

  return await response.json();
}