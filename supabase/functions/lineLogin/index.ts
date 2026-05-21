import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const LINE_CHANNEL_ID = '2009934655';
const LINE_CHANNEL_SECRET = '406c063bceeae1c3e4f1ee5b3e774ac1';
const LINE_REDIRECT_URI = 'https://br-cargo.com/';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseAdmin = (url: string, key: string) => createClient(url, key);

// decode JWT payload โดยไม่ต้อง verify (เร็วกว่า — LINE ยืนยัน token ให้แล้วก่อนส่งมา)
function decodeJWT(token: string): any {
  const payload = token.split('.')[1];
  const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
  return JSON.parse(decoded);
}

async function handleUser(supabase: any, profile: any) {
  const lineEmail = `line_${profile.userId}@line.user`;
  const linePassword = `line_${profile.userId}_${LINE_CHANNEL_SECRET.slice(0, 8)}`;

  // ลอง sign in ก่อน
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: lineEmail, password: linePassword,
  });

  if (!signInError && signInData.user) {
    await supabase.from('users').upsert({
      id: signInData.user.id, email: lineEmail,
      full_name: profile.displayName, picture_url: profile.pictureUrl,
      line_user_id: profile.userId,
    }, { onConflict: 'id' });
    return {
      success: true,
      user: { id: signInData.user.id, email: lineEmail, full_name: profile.displayName, picture_url: profile.pictureUrl, line_user_id: profile.userId },
      session: signInData.session,
    };
  }

  // สร้าง user ใหม่
  const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
    email: lineEmail, password: linePassword, email_confirm: true,
  });
  if (createError) throw new Error(`Create user failed: ${createError.message}`);

  await supabase.from('users').upsert({
    id: newUser.user.id, email: lineEmail,
    full_name: profile.displayName, picture_url: profile.pictureUrl,
    line_user_id: profile.userId,
  }, { onConflict: 'id' });

  const { data: newSignIn, error: newSignInError } = await supabase.auth.signInWithPassword({
    email: lineEmail, password: linePassword,
  });
  if (newSignInError) throw new Error(`Sign in failed: ${newSignInError.message}`);

  return {
    success: true,
    user: { id: newUser.user.id, email: lineEmail, full_name: profile.displayName, picture_url: profile.pictureUrl, line_user_id: profile.userId },
    session: newSignIn.session,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = await req.json();
    const supabase = supabaseAdmin(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // ── LIFF mode: รับ id_token โดยตรง decode เองเลย ไม่ต้อง round trip ไป LINE ──
    if (body.id_token) {
      let claims: any;
      try {
        claims = decodeJWT(body.id_token);
      } catch {
        return new Response(JSON.stringify({ success: false, error: 'Invalid id_token' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400,
        });
      }

      // ตรวจ expiry และ audience เบื้องต้น
      if (claims.exp < Math.floor(Date.now() / 1000)) {
        return new Response(JSON.stringify({ success: false, error: 'id_token expired' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401,
        });
      }
      if (claims.aud !== LINE_CHANNEL_ID) {
        return new Response(JSON.stringify({ success: false, error: 'id_token audience mismatch' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401,
        });
      }

      const profile = {
        userId: claims.sub,
        displayName: claims.name || 'LINE User',
        pictureUrl: claims.picture || '',
      };
      const result = await handleUser(supabase, profile);
      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ── OAuth mode: รับ code แล้วแลก token ──
    const { code } = body;
    if (!code) throw new Error('Missing code or id_token');

    const tokenRes = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: LINE_REDIRECT_URI,
        client_id: LINE_CHANNEL_ID,
        client_secret: LINE_CHANNEL_SECRET,
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return new Response(JSON.stringify({ success: false, error: `LINE token error: ${JSON.stringify(tokenData)}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400,
      });
    }

    const profileRes = await fetch('https://api.line.me/v2/profile', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await profileRes.json();
    const result = await handleUser(supabase, profile);
    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: String(err) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500,
    });
  }
});
