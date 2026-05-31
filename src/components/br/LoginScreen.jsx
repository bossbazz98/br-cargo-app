import React, { useState, useEffect } from 'react';

// โหลด font รองรับทุกภาษา (ไทย, อังกฤษ, เกาหลี, จีน, ญี่ปุ่น, อาหรับ ฯลฯ)
if (typeof document !== 'undefined' && !document.getElementById('noto-sans-font')) {
  const link = document.createElement('link');
  link.id = 'noto-sans-font';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700;800&family=Noto+Sans+Thai:wght@400;500;600;700;800&family=Noto+Sans:wght@400;500;600;700;800&family=Noto+Sans+KR:wght@400;500;600;700;800&family=Noto+Sans+SC:wght@400;500;600;700&family=Noto+Sans+JP:wght@400;500;600;700&display=swap';
  document.head.appendChild(link);
}
import { supabase } from '@/api/supabaseClient';

// LINE OAuth config
const LINE_CHANNEL_ID = '2009934655';
const LINE_LIFF_ID = '2009934655-WCKu9TyU';
const LINE_REDIRECT_URI = window.location.origin + '/';
const getLineAuthURL = () => {
  const state = 'br_cargo_line_' + Math.random().toString(36).slice(2, 8);
  try { sessionStorage.setItem('line_state', state); } catch {}
  return `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${LINE_CHANNEL_ID}&redirect_uri=${encodeURIComponent(LINE_REDIRECT_URI)}&state=${state}&scope=profile%20openid&bot_prompt=normal`;
};

const thFont = `'Sarabun', 'Noto Sans KR', 'Noto Sans SC', 'Noto Sans JP', 'Noto Sans', 'Inter', -apple-system, system-ui, sans-serif`;
const thFontHeading = `'Noto Sans Thai', 'Noto Sans KR', 'Noto Sans SC', 'Noto Sans JP', 'Noto Sans', 'Inter', -apple-system, system-ui, sans-serif`;
const thFontSubheading = `'Noto Sans Thai', 'Noto Sans KR', 'Noto Sans SC', 'Noto Sans JP', 'Noto Sans', 'Inter', -apple-system, system-ui, sans-serif`;

const P = {
  blue: 'oklch(0.58 0.18 245)',
  blueDeep: 'oklch(0.46 0.20 250)',
  ink: 'oklch(0.22 0.015 260)',
  ink2: 'oklch(0.45 0.012 260)',
  ink3: 'oklch(0.62 0.01 260)',
  line2: 'oklch(0.86 0.012 260)',
  surface: '#ffffff',
  surfaceAlt: 'oklch(0.985 0.005 260)',
  danger: 'oklch(0.62 0.19 25)',
  dangerSoft: 'oklch(0.96 0.03 25)',
  success: 'oklch(0.62 0.14 155)',
  successSoft: 'oklch(0.95 0.04 155)',
};

const Logo = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
    <div style={{ width: 70, height: 70, borderRadius: 22, background: `linear-gradient(140deg, ${P.blue}, ${P.blueDeep})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 18px 38px -10px ${P.blueDeep}66`, fontFamily: `'Inter', sans-serif`, fontWeight: 900, fontSize: 26, color: '#fff', letterSpacing: -1.2 }}>BR</div>
    <div style={{ fontFamily: `'Inter', sans-serif`, fontWeight: 900, fontSize: 22, letterSpacing: -0.8, color: P.ink }}>BR CARGO</div>
  </div>
);

const PassEye = ({ show, onToggle }) => (
  <button type="button" onClick={onToggle} style={{ background: 'none', border: 0, cursor: 'pointer', padding: '0 13px 0 4px', display: 'flex', alignItems: 'center', color: P.ink3 }}>
    {show ? (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
    ) : (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10 10 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9 9 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"/></svg>
    )}
  </button>
);

const InputField = ({ label, type = 'text', value, onChange, placeholder, icon, rightSlot, onKeyDown, autoComplete, maxLength }) => {
  const [focus, setFocus] = useState(false);
  return (
    <div>
      {label && <div style={{ fontSize: 12, fontWeight: 700, color: P.ink2, marginBottom: 6 }}>{label}</div>}
      <div style={{ position: 'relative', background: P.surfaceAlt, border: `1.5px solid ${focus ? P.blue : P.line2}`, borderRadius: 16, transition: 'border-color 0.15s', boxShadow: focus ? `0 0 0 4px ${P.blue}12` : 'none', display: 'flex', alignItems: 'center' }}>
        {icon && <div style={{ paddingLeft: 13, display: 'flex', color: focus ? P.blue : P.ink3 }}>{icon}</div>}
        <input type={type} value={value} onChange={e => onChange(e.target.value)} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} onKeyDown={onKeyDown} placeholder={placeholder} autoComplete={autoComplete || 'off'} maxLength={maxLength}
          style={{ flex: 1, minWidth: 0, padding: icon ? '12px 12px 12px 10px' : '12px 14px', border: 0, outline: 'none', background: 'transparent', fontSize: 14.5, color: P.ink, fontFamily: thFont }}/>
        {rightSlot}
      </div>
    </div>
  );
};

const PrimaryBtn = ({ onClick, children, loading, disabled }) => (
  <button onClick={onClick} disabled={loading || disabled} style={{ width: '100%', padding: '14px 16px', background: `linear-gradient(180deg, ${P.blue}, ${P.blueDeep})`, border: 0, borderRadius: 16, cursor: (loading || disabled) ? 'not-allowed' : 'pointer', color: '#fff', fontFamily: thFontSubheading, fontSize: 15, fontWeight: 700, boxShadow: `0 8px 22px -6px ${P.blueDeep}80`, opacity: disabled ? 0.55 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
    {loading && <svg width="16" height="16" viewBox="0 0 24 24" style={{ animation: 'br-spin 0.9s linear infinite' }}><circle cx="12" cy="12" r="9" fill="none" stroke="#fff" strokeOpacity="0.25" strokeWidth="2.2"/><path d="M21 12a9 9 0 0 1-9 9" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/></svg>}
    {children}
  </button>
);

const ErrBox = ({ msg }) => msg ? (
  <div style={{ padding: '10px 13px', borderRadius: 11, background: P.dangerSoft, border: `1px solid ${P.danger}30`, color: P.danger, fontSize: 12.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="9.5"/><path d="M12 7v6M12 16.5v.1"/></svg>
    {msg}
  </div>
) : null;

const BackBtn = ({ onClick }) => (
  <button onClick={onClick} style={{ background: 'transparent', border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: P.ink2, fontFamily: thFont, fontSize: 13, fontWeight: 600, padding: '4px 0', marginBottom: 14 }}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 6-6 6 6 6"/></svg>
    กลับ
  </button>
);


const LoginScreen = ({ onLogin }) => {
  const [step, setStep] = useState('login');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loginErr, setLoginErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [reg, setReg] = useState({ first_name: '', last_name: '', phone: '', email: '', password: '', confirm: '' });
  const [showRegPw, setShowRegPw] = useState(false);
  const [regErr, setRegErr] = useState('');

  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotErr, setForgotErr] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPw, setForgotNewPw] = useState('');
  const [forgotShowPw, setForgotShowPw] = useState(false);


  // ตรวจจับ LINE In-App Browser
  const isLineWebView = /Line\//i.test(navigator.userAgent);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('br_remember_email');
      if (saved) { setEmail(saved); setRememberMe(true); }
    } catch {}
  }, []);

  // Handle LIFF — รันทันทีเมื่อเปิดใน LINE WebView
  useEffect(() => {
    if (!isLineWebView) return;
    setLoading(true);
    const initLiff = async () => {
      try {
        if (!window.liff) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }
        await window.liff.init({ liffId: LINE_LIFF_ID });

        if (!window.liff.isLoggedIn()) {
          // ยังไม่ได้ login — ให้ LIFF login อัตโนมัติ
          window.liff.login({ redirectUri: window.location.href });
          return;
        }

        // login แล้ว — ดึง profile และ token
        // ตัด getProfile() ออก — decode จาก idToken ใน Edge Function แทน
        const idToken = window.liff.getIDToken(); // sync, ไม่ต้อง await

        if (!idToken) {
          setLoginErr('ไม่สามารถดึงข้อมูล LINE ได้ กรุณาลองใหม่');
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.functions.invoke('lineLogin', {
          body: { id_token: idToken }
        });

        if (!error && data?.success) {
          if (data.session) {
            await supabase.auth.setSession({
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
            });
          }
          onLogin && onLogin(data.user);
          return;
        }
        setLoginErr('LINE Login ไม่สำเร็จ: ' + (data?.error || error?.message || 'กรุณาลองใหม่'));
      } catch (err) {
        setLoginErr('LIFF Error: ' + (err?.message || String(err)));
      }
      setLoading(false);
    };
    initLiff();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    if (code && state && state.startsWith('br_cargo_line')) {
      window.history.replaceState({}, '', window.location.pathname);
      setLoading(true);
      supabase.functions.invoke('lineLogin', { body: { code } })
        .then(async ({ data, error }) => {
          if (error || !data?.success) {
            setLoginErr('LINE Login ไม่สำเร็จ กรุณาลองใหม่');
            setLoading(false);
            return;
          }
          if (data.session) {
            await supabase.auth.setSession({
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
            });
          }
          onLogin && onLogin(data.user);
        })
        .catch(() => { setLoginErr('LINE Login ผิดพลาด กรุณาลองใหม่'); setLoading(false); });
    }
  }, []);

  // ── Email Login ────────────────────────────────────────
  const handleEmailLogin = async () => {
    setLoginErr('');
    const e = email.trim();
    if (!e) return setLoginErr('กรุณากรอกอีเมล');
    if (!/^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(e)) return setLoginErr('รูปแบบอีเมลไม่ถูกต้อง');
    if (!pw) return setLoginErr('กรุณากรอกรหัสผ่าน');
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: e, password: pw });
      if (error) {
        if (error.message?.includes('Invalid login') || error.message?.includes('invalid_credentials')) {
          setLoginErr('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
        } else if (error.message?.includes('Email not confirmed')) {
          setLoginErr('กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ');
        } else if (error.message?.includes('Too many requests')) {
          setLoginErr('ลองเข้าสู่ระบบบ่อยเกินไป กรุณารอสักครู่');
        } else {
          setLoginErr('เกิดข้อผิดพลาด กรุณาลองใหม่');
        }
        setLoading(false);
        return;
      }
      if (!data.user || !data.session) {
        setLoginErr('เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่');
        setLoading(false);
        return;
      }
      try {
        if (rememberMe) {
          localStorage.setItem('br_remember_email', e);
        } else {
          localStorage.removeItem('br_remember_email');
        }
      } catch {}
      onLogin && onLogin(data.user);
    } catch {
      setLoginErr('เกิดข้อผิดพลาด กรุณาตรวจสอบการเชื่อมต่อแล้วลองใหม่');
    }
    setLoading(false);
  };

  // ── LINE LIFF Login (สำหรับ LINE WebView) ────────────────
  const handleLiffLogin = async () => {
    setLoginErr('');
    setLoading(true);
    try {
      // โหลด LIFF SDK
      await new Promise((resolve, reject) => {
        if (window.liff) { resolve(); return; }
        const script = document.createElement('script');
        script.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });

      await window.liff.init({ liffId: LINE_LIFF_ID });

      if (!window.liff.isLoggedIn()) {
        window.liff.login({ redirectUri: LINE_REDIRECT_URI });
        return;
      }

      const profile = await window.liff.getProfile();
      const idToken = window.liff.getIDToken();

      // ส่ง idToken ไป Edge Function
      const { data, error } = await supabase.functions.invoke('lineLogin', {
        body: { id_token: idToken, profile }
      });

      if (error || !data?.success) {
        setLoginErr('LINE Login ไม่สำเร็จ กรุณาลองใหม่');
        setLoading(false);
        return;
      }
      if (data.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      }
      onLogin && onLogin(data.user);
    } catch (err) {
      const msg = err?.message || err?.code || JSON.stringify(err) || 'unknown';
      setLoginErr('LINE LIFF Error: ' + msg);
      setLoading(false);
    }
  };
  const handleGoogleLogin = async () => {
    setLoginErr('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/',
        },
      });
      if (error) throw error;
      // จะ redirect ไป Google แล้วกลับมาที่ br-cargo.com อัตโนมัติ
      // หาก signInWithOAuth สำเร็จแต่ไม่ redirect ทันที ให้หยุด loading
      setLoading(false);
    } catch (err) {
      setLoginErr('Google Login ไม่สำเร็จ กรุณาลองใหม่');
      setLoading(false);
    }
  };

  // ── Register ────────────────────────────────────────────
  const handleRegister = async () => {
    setRegErr('');
    const { first_name, last_name, email: e, password, confirm } = reg;
    if (!first_name.trim()) return setRegErr('กรุณากรอกชื่อ');
    if (!last_name.trim()) return setRegErr('กรุณากรอกนามสกุล');
    if (!/^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(e.trim())) return setRegErr('รูปแบบอีเมลไม่ถูกต้อง');
    if (password.length < 6) return setRegErr('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
    if (password !== confirm) return setRegErr('รหัสผ่านยืนยันไม่ตรงกัน');
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: e.trim(),
        password,
        options: { data: { full_name: `${first_name.trim()} ${last_name.trim()}` } }
      });
      if (error) {
        if (error.message?.includes('already registered') || error.message?.includes('User already registered')) {
          setRegErr('อีเมลนี้ถูกใช้งานแล้ว กรุณาเข้าสู่ระบบหรือใช้อีเมลอื่น');
        } else {
          setRegErr(error.message || 'สมัครไม่สำเร็จ');
        }
        setLoading(false);
        return;
      }
      // กรณีอีเมลซ้ำ: Supabase คืน user=null, session=null โดยไม่ return error
      if (!data.user) {
        setRegErr('อีเมลนี้ถูกใช้งานแล้ว กรุณาเข้าสู่ระบบหรือใช้อีเมลอื่น');
        setLoading(false);
        return;
      }
      // กรณี identities เป็น [] (Supabase เวอร์ชันเก่า)
      if (!data.user.identities || data.user.identities.length === 0) {
        setRegErr('อีเมลนี้ถูกใช้งานแล้ว กรุณาเข้าสู่ระบบหรือใช้อีเมลอื่น');
        setLoading(false);
        return;
      }
      if (data.user) {
        await supabase.from('users').upsert({
          id: data.user.id,
          email: e.trim(),
          first_name: first_name.trim(),
          last_name: last_name.trim(),
          full_name: `${first_name.trim()} ${last_name.trim()}`,
          phone: reg.phone,
        }, { onConflict: 'id' });
      }
      setStep('register-success');
    } catch (err) {
      setRegErr(err?.message || 'สมัครไม่สำเร็จ กรุณาลองใหม่');
    }
    setLoading(false);
  };

  // ── Forgot Password — ส่งลิงก์รีเซ็ตผ่าน Supabase ────────
  // ── ส่ง OTP ไปอีเมล ────────────────────────────────────
  const handleSendOtp = async () => {
    setForgotErr('');
    const e = forgotEmail.trim();
    if (!e) return setForgotErr('กรุณากรอกอีเมล');
    if (!/^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(e)) return setForgotErr('รูปแบบอีเมลไม่ถูกต้อง');
    setLoading(true);
    try {
      const res = await fetch('https://ohybaapjlbsxtiumdggb.supabase.co/functions/v1/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oeWJhYXBqbGJzeHRpdW1kZ2diIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MjE3MjgsImV4cCI6MjA5MzM5NzcyOH0.kbwIY5KfVMfSo_E6t5f3IBOB8JrpCAQfE-EUaZAU220' },
        body: JSON.stringify({ action: 'send', email: e }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setForgotErr(data.error || 'ส่ง OTP ไม่สำเร็จ กรุณาลองใหม่');
        setLoading(false);
        return;
      }
      setForgotOtp('');
      setForgotNewPw('');
      setStep('forgot-otp');
    } catch {
      setForgotErr('เกิดข้อผิดพลาด กรุณาตรวจสอบการเชื่อมต่อแล้วลองใหม่');
    }
    setLoading(false);
  };

  // ── verify OTP recovery + ตั้งรหัสผ่านใหม่ ──────────────
  const handleVerifyOtp = async () => {
    setForgotErr('');
    const e = forgotEmail.trim();
    const otp = forgotOtp.trim();
    if (otp.length !== 8) return setForgotErr('กรุณากรอก OTP 6 หลักให้ครบถ้วน');
    if (forgotNewPw.length < 6) return setForgotErr('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร');
    setLoading(true);
    try {
      // verify OTP ผ่าน Edge Function
      const verifyRes = await fetch('https://ohybaapjlbsxtiumdggb.supabase.co/functions/v1/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oeWJhYXBqbGJzeHRpdW1kZ2diIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MjE3MjgsImV4cCI6MjA5MzM5NzcyOH0.kbwIY5KfVMfSo_E6t5f3IBOB8JrpCAQfE-EUaZAU220' },
        body: JSON.stringify({ action: 'verify', email: e, otp }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || verifyData.error) {
        setForgotErr(verifyData.error || 'OTP ไม่ถูกต้องหรือหมดอายุ');
        setLoading(false);
        return;
      }
      // OTP ถูกต้อง — ตั้งรหัสผ่านใหม่ทันที
      const { error: updateError } = await supabase.auth.updateUser({ password: forgotNewPw });
      if (updateError) {
        setForgotErr('บันทึกรหัสผ่านไม่สำเร็จ กรุณาลองใหม่');
        setLoading(false);
        return;
      }
      // logout เพื่อให้ login ใหม่ด้วยรหัสที่ตั้ง
      await supabase.auth.signOut();
      setStep('forgot-done');
    } catch {
      setForgotErr('เกิดข้อผิดพลาด กรุณาลองใหม่');
    }
    setLoading(false);
  };

  const emailIcon = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>;
  const lockIcon = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>;
  const phoneIcon = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 11.9 19.79 19.79 0 0 1 1 3.18 2 2 0 0 1 2.96 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 5.93 5.93l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 16.92Z"/></svg>;

  let body;

  if (step === 'login') {
    body = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, marginBottom: 4 }}>
          <Logo/>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: P.ink, letterSpacing: -0.5, fontFamily: thFontHeading }}>ยินดีต้อนรับกลับมา</div>
            <div style={{ fontSize: 13.5, color: P.ink3, marginTop: 5 }}>กรุณากรอกข้อมูลเพื่อเข้าสู่ระบบ</div>
          </div>
        </div>
        <ErrBox msg={loginErr}/>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <InputField type="email" value={email} onChange={setEmail} placeholder="Email" autoComplete="email" icon={emailIcon} onKeyDown={e => e.key === 'Enter' && handleEmailLogin()}/>
          <InputField type={showPw ? 'text' : 'password'} value={pw} onChange={setPw} placeholder="Password" autoComplete="current-password" icon={lockIcon} rightSlot={<PassEye show={showPw} onToggle={() => setShowPw(v => !v)}/>} onKeyDown={e => e.key === 'Enter' && handleEmailLogin()}/>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
          <div onClick={() => setRememberMe(v => !v)} style={{ width: 18, height: 18, borderRadius: 5, flexShrink: 0, border: `2px solid ${rememberMe ? P.blue : P.line2}`, background: rememberMe ? P.blue : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
            {rememberMe && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="m4 12 5 5L20 6"/></svg>}
          </div>
          <span onClick={() => setRememberMe(v => !v)} style={{ fontSize: 13, color: P.ink2, fontWeight: 500 }}>จดจำฉัน</span>
        </label>
        <PrimaryBtn onClick={handleEmailLogin} loading={loading}>เข้าสู่ระบบ</PrimaryBtn>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, height: 1, background: P.line2 }}/>
          <span style={{ fontSize: 12, color: P.ink3, fontWeight: 500 }}>หรือเข้าสู่ระบบด้วย</span>
          <div style={{ flex: 1, height: 1, background: P.line2 }}/>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleGoogleLogin} disabled={loading} style={{ flex: 1, padding: '11px 14px', background: P.surface, border: `1.5px solid ${P.line2}`, borderRadius: 14, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: thFont, fontSize: 13.5, fontWeight: 700, color: P.ink, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Google
          </button>
          <button onClick={() => {
            if (isLineWebView) {
              // อยู่ใน LINE WebView — เปิด LIFF URL โดยตรง
              window.location.href = `https://liff.line.me/${LINE_LIFF_ID}`;
              return;
            }
            window.location.href = getLineAuthURL();
          }} style={{ flex: 1, padding: '11px 14px', background: '#06C755', border: 'none', borderRadius: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: thFont, fontSize: 13.5, fontWeight: 700, color: '#fff', boxShadow: '0 1px 4px rgba(6,199,85,0.3)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg>
            LINE
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 2 }}>
          <button onClick={() => { setForgotEmail(email); setForgotErr(''); setStep('forgot'); }} style={{ background: 'transparent', border: 0, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: P.blue, fontFamily: thFont, padding: 0 }}>ลืมรหัสผ่าน?</button>
          <div>
            <span style={{ fontSize: 13, color: P.ink3 }}>ยังไม่มีบัญชี? </span>
            <button onClick={() => setStep('register')} style={{ background: 'transparent', border: 0, cursor: 'pointer', fontSize: 13, fontWeight: 700, color: P.ink, fontFamily: thFont, padding: 0 }}>สมัครสมาชิก</button>
          </div>
        </div>
      </div>
    );

  } else if (step === 'forgot') {
    body = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <BackBtn onClick={() => setStep('login')}/>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{ width: 60, height: 60, borderRadius: 18, background: 'oklch(0.93 0.04 245)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={P.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: P.ink, fontFamily: thFontHeading }}>รีเซ็ตรหัสผ่าน</div>
            <div style={{ fontSize: 13, color: P.ink3, marginTop: 4, lineHeight: 1.5 }}>กรอกอีเมลที่ลงทะเบียนไว้<br/>เราจะส่งรหัส OTP ไปยังอีเมลของคุณ</div>
          </div>
        </div>
        <ErrBox msg={forgotErr}/>
        <InputField label="อีเมล" type="email" value={forgotEmail} onChange={v => { setForgotEmail(v); setForgotErr(''); }} placeholder="example@email.com" icon={emailIcon} onKeyDown={e => e.key === 'Enter' && handleSendOtp()}/>
        <PrimaryBtn onClick={handleSendOtp} loading={loading} disabled={!forgotEmail.trim()}>ส่ง OTP ไปยังอีเมล</PrimaryBtn>
      </div>
    );

  } else if (step === 'forgot-otp') {
    body = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <BackBtn onClick={() => { setStep('forgot'); setForgotErr(''); setForgotOtp(''); }}/>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{ width: 60, height: 60, borderRadius: 18, background: 'oklch(0.93 0.04 245)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={P.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: P.ink, fontFamily: thFontHeading }}>ยืนยัน OTP</div>
            <div style={{ fontSize: 13, color: P.ink3, marginTop: 4, lineHeight: 1.6 }}>
              กรอกรหัส OTP 6 หลักที่ส่งไปยัง<br/>
              <span style={{ fontWeight: 700, color: P.ink2 }}>{forgotEmail}</span>
            </div>
          </div>
        </div>
        <ErrBox msg={forgotErr}/>
        {/* OTP Input — 8 ช่องแยก */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: P.ink2, marginBottom: 10 }}>รหัส OTP</div>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }} onClick={() => document.getElementById('otp-hidden').focus()}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{
                width: 36, height: 44, borderRadius: 10,
                border: `2px solid ${forgotOtp[i] ? P.blue : P.line2}`,
                background: forgotOtp[i] ? 'oklch(0.97 0.02 245)' : P.surfaceAlt,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 800, color: P.ink,
                fontFamily: `'Inter', monospace`,
                transition: 'border-color 0.15s, background 0.15s',
              }}>
                {forgotOtp[i] || ''}
              </div>
            ))}
          </div>
          <input
            id="otp-hidden"
            type="text" inputMode="numeric" maxLength={8}
            value={forgotOtp}
            onChange={e => { setForgotOtp(e.target.value.replace(/\D/g, '')); setForgotErr(''); }}
            autoFocus
            style={{ position: 'absolute', opacity: 0, width: 1, height: 1, pointerEvents: 'none' }}
          />
          <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
        </div>
        {/* New Password */}
        <InputField
          label="รหัสผ่านใหม่"
          type={forgotShowPw ? 'text' : 'password'}
          value={forgotNewPw}
          onChange={v => { setForgotNewPw(v); setForgotErr(''); }}
          placeholder="อย่างน้อย 6 ตัวอักษร"
          icon={lockIcon}
          rightSlot={<PassEye show={forgotShowPw} onToggle={() => setForgotShowPw(v => !v)}/>}
          onKeyDown={e => e.key === 'Enter' && handleVerifyOtp()}
        />
        <PrimaryBtn onClick={handleVerifyOtp} loading={loading} disabled={forgotOtp.length !== 8 || forgotNewPw.length < 6}>
          ยืนยันและตั้งรหัสผ่านใหม่
        </PrimaryBtn>
        <button onClick={handleSendOtp} disabled={loading} style={{ background: 'transparent', border: 0, cursor: 'pointer', fontSize: 13, color: P.blue, fontFamily: thFont, fontWeight: 600, textAlign: 'center' }}>
          ไม่ได้รับ OTP? ส่งใหม่อีกครั้ง
        </button>
      </div>
    );

  } else if (step === 'forgot-done') {
    body = (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '24px 0' }}>
        <div style={{ width: 84, height: 84, borderRadius: 26, background: `linear-gradient(140deg, ${P.blue}, ${P.blueDeep})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m4 12 5 5L20 6"/></svg>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: P.ink, fontFamily: thFontHeading }}>ตั้งรหัสผ่านใหม่สำเร็จ!</div>
          <div style={{ fontSize: 13.5, color: P.ink3, marginTop: 6, lineHeight: 1.6 }}>กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่</div>
        </div>
        <PrimaryBtn onClick={() => { setStep('login'); setEmail(forgotEmail); setPw(''); setForgotEmail(''); setForgotOtp(''); setForgotNewPw(''); setForgotErr(''); }}>
          ไปยังหน้าเข้าสู่ระบบ
        </PrimaryBtn>
      </div>
    );

  } else if (step === 'register') {
    const setR = (k, v) => setReg(r => ({ ...r, [k]: v }));
    body = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ textAlign: 'center', marginBottom: 4 }}>
          <Logo/>
          <div style={{ fontSize: 22, fontWeight: 800, color: P.ink, letterSpacing: -0.5, marginTop: 12, fontFamily: thFontHeading }}>สมัครสมาชิก</div>
          <div style={{ fontSize: 13, color: P.ink3, marginTop: 4 }}>เริ่มต้นจัดการพัสดุกับ BR CARGO</div>
        </div>
        <ErrBox msg={regErr}/>
        <InputField label="ชื่อ" value={reg.first_name} onChange={v => setR('first_name', v)} placeholder="ชื่อ"/>
        <InputField label="นามสกุล" value={reg.last_name} onChange={v => setR('last_name', v)} placeholder="นามสกุล"/>
        <InputField label="เบอร์โทรศัพท์" type="tel" value={reg.phone} onChange={v => setR('phone', v)} placeholder="0812345678" icon={phoneIcon}/>
        <InputField label="อีเมล" type="email" value={reg.email} onChange={v => setR('email', v)} placeholder="example@email.com" icon={emailIcon}/>
        <InputField label="รหัสผ่าน" type={showRegPw ? 'text' : 'password'} value={reg.password} onChange={v => setR('password', v)} placeholder="อย่างน้อย 6 ตัวอักษร" icon={lockIcon} rightSlot={<PassEye show={showRegPw} onToggle={() => setShowRegPw(v => !v)}/>}/>
        <InputField label="ยืนยันรหัสผ่าน" type={showRegPw ? 'text' : 'password'} value={reg.confirm} onChange={v => setR('confirm', v)} placeholder="กรอกรหัสผ่านอีกครั้ง" icon={lockIcon} rightSlot={<PassEye show={showRegPw} onToggle={() => setShowRegPw(v => !v)}/>} onKeyDown={e => e.key === 'Enter' && handleRegister()}/>
        <PrimaryBtn onClick={handleRegister} loading={loading}>สมัครสมาชิก</PrimaryBtn>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: 13, color: P.ink3 }}>มีบัญชีแล้ว? </span>
          <button onClick={() => setStep('login')} style={{ background: 'transparent', border: 0, cursor: 'pointer', fontSize: 13, fontWeight: 700, color: P.blue, fontFamily: thFont, padding: 0 }}>เข้าสู่ระบบ</button>
        </div>
      </div>
    );

  } else if (step === 'register-success') {
    body = (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '24px 0' }}>
        <div style={{ width: 84, height: 84, borderRadius: 26, background: `linear-gradient(140deg, ${P.success}, oklch(0.52 0.16 155))`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m4 12 5 5L20 6"/></svg>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: P.ink, fontFamily: thFontHeading }}>สมัครสำเร็จ!</div>
          <div style={{ fontSize: 13.5, color: P.ink3, marginTop: 6, lineHeight: 1.5 }}>เข้าสู่ระบบเพื่อเริ่มใช้งาน</div>
        </div>
        <PrimaryBtn onClick={() => { setEmail(reg.email); setPw(''); setStep('login'); }}>ไปยังหน้าเข้าสู่ระบบ</PrimaryBtn>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: thFont, minHeight: '100dvh', position: 'relative', background: `linear-gradient(180deg, #ddeeff 0%, #c8e0f8 60%, #a8cff0 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`@keyframes br-spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
      <svg viewBox="0 0 414 120" preserveAspectRatio="none" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 120, zIndex: 0 }}>
        <path d="M0 60 Q60 20 120 60 Q180 100 240 60 Q300 20 360 60 Q390 80 414 60 L414 120 L0 120 Z" fill="rgba(255,255,255,0.35)"/>
        <path d="M0 80 Q80 40 160 80 Q240 120 320 80 Q370 60 414 80 L414 120 L0 120 Z" fill="rgba(255,255,255,0.5)"/>
        <path d="M0 95 Q100 70 200 95 Q300 120 414 95 L414 120 L0 120 Z" fill="rgba(255,255,255,0.7)"/>
      </svg>
      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: 390,
        height: 'calc(100dvh - 48px)',
        maxHeight: 680,
        margin: '24px 20px',
        background: '#ffffff', borderRadius: 28,
        boxShadow: `0 20px 60px -15px rgba(30,80,160,0.18), 0 4px 16px -4px rgba(0,0,0,0.08)`,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <div style={{
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: '32px 24px 28px',
          flex: 1,
        }}>
          {body}
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
