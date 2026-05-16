// supabase/functions/lineLogin/index.ts
// Deploy ด้วย: supabase functions deploy lineLogin

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const LINE_CHANNEL_ID = '2009934655';
const LINE_CHANNEL_SECRET = '8c9c258502702c9860ddf0560d5779fd';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { code, redirect_uri } = await req.json();

    // 1. แลก code เอา access_token จาก LINE
    const tokenRes = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri,
        client_id: LINE_CHANNEL_ID,
        client_secret: LINE_CHANNEL_SECRET,
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return new Response(JSON.stringify({ success: false, error: 'ไม่ได้รับ access_token จาก LINE' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // 2. ดึงข้อมูล profile จาก LINE
    const profileRes = await fetch('https://api.line.me/v2/profile', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await profileRes.json();

    const lineEmail = `line_${profile.userId}@line.user`;
    const linePassword = `line_${profile.userId}_${LINE_CHANNEL_SECRET.slice(0, 8)}`;

    // 3. สร้าง Supabase client (service role)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // 4. หา user เดิมหรือสร้างใหม่
    let userId: string;
    const { data: existingUser } = await supabase.auth.admin.getUserByEmail(lineEmail).catch(() => ({ data: null }));

    if (existingUser?.user) {
      userId = existingUser.user.id;
    } else {
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: lineEmail,
        password: linePassword,
        email_confirm: true,
      });
      if (createError) throw createError;
      userId = newUser.user.id;
    }

    // 5. บันทึก / อัปเดต profile
    await supabase.from('users').upsert({
      id: userId,
      email: lineEmail,
      full_name: profile.displayName,
      picture_url: profile.pictureUrl,
      line_user_id: profile.userId,
    });

    // 6. สร้าง session token
    const { data: session, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: lineEmail,
    });
    if (sessionError) throw sessionError;

    return new Response(JSON.stringify({
      success: true,
      user: {
        email: lineEmail,
        full_name: profile.displayName,
        picture_url: profile.pictureUrl,
        line_user_id: profile.userId,
      },
      magic_link: session.properties?.action_link,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: String(err) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
