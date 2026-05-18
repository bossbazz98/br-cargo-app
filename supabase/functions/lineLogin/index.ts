import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const LINE_CHANNEL_ID = '2009934655';
const LINE_CHANNEL_SECRET = '406c063bceeae1c3e4f1ee5b3e774ac1';
const LINE_REDIRECT_URI = 'https://br-cargo-app.vercel.app/';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { code } = await req.json();

    // 1. แลก code เอา access_token จาก LINE
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
      return new Response(JSON.stringify({ 
        success: false, 
        error: `LINE token error: ${JSON.stringify(tokenData)}` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 400,
      });
    }

    // 2. ดึง profile จาก LINE
    const profileRes = await fetch('https://api.line.me/v2/profile', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await profileRes.json();

    const lineEmail = `line_${profile.userId}@line.user`;
    const linePassword = `line_${profile.userId}_${LINE_CHANNEL_SECRET.slice(0, 8)}`;

    // 3. Supabase admin client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // 4. ลอง sign in ก่อน ถ้าไม่ได้ค่อย create user
    let userId: string;
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: lineEmail,
      password: linePassword,
    });

    if (!signInError && signInData.user) {
      // user มีอยู่แล้ว
      userId = signInData.user.id;

      // อัปเดต profile
      await supabase.from('users').upsert({
        id: userId,
        email: lineEmail,
        full_name: profile.displayName,
        picture_url: profile.pictureUrl,
        line_user_id: profile.userId,
      });

      return new Response(JSON.stringify({
        success: true,
        user: {
          id: userId,
          email: lineEmail,
          full_name: profile.displayName,
          picture_url: profile.pictureUrl,
          line_user_id: profile.userId,
        },
        session: signInData.session,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 5. user ยังไม่มี — สร้างใหม่
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: lineEmail,
      password: linePassword,
      email_confirm: true,
    });

    if (createError) throw new Error(`Create user failed: ${createError.message}`);
    userId = newUser.user.id;

    // 6. บันทึก profile
    await supabase.from('users').upsert({
      id: userId,
      email: lineEmail,
      full_name: profile.displayName,
      picture_url: profile.pictureUrl,
      line_user_id: profile.userId,
    });

    // 7. Sign in หลัง create
    const { data: newSignIn, error: newSignInError } = await supabase.auth.signInWithPassword({
      email: lineEmail,
      password: linePassword,
    });
    if (newSignInError) throw new Error(`Sign in after create failed: ${newSignInError.message}`);

    return new Response(JSON.stringify({
      success: true,
      user: {
        id: userId,
        email: lineEmail,
        full_name: profile.displayName,
        picture_url: profile.pictureUrl,
        line_user_id: profile.userId,
      },
      session: newSignIn.session,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: String(err) 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status: 500,
    });
  }
});
