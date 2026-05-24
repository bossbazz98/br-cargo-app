import React, { useState, useEffect } from 'react';
import { supabase } from '@/api/supabaseClient';
import { C, thaiFont } from '../lib/brColors';
import LoginScreen from '../components/br/LoginScreen';
import HomeScreen, { AnnouncementBanner } from '../components/br/HomeScreen';
import ScheduleScreen from '../components/br/ScheduleScreen';
import NotificationsScreen from '../components/br/NotificationsScreen';
import AdminScreen from '../components/br/AdminScreen';
import BRTabBar from '../components/br/BRTabBar';
import { DetailsPage, AddressPage, NoCodePage, NewsArticlePage } from '../components/br/DetailPages';
import ProfileScreen from '../components/br/ProfileScreen';
import BRAppHeader from '../components/br/BRAppHeader';
import { initTracker, track } from '../lib/tracker';


// ── Reset Password Screen ─────────────────────────────────
const ResetPasswordScreen = ({ onDone }) => {
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const thFont = `'Sarabun', 'Noto Sans Thai', sans-serif`;
  const blue = 'oklch(0.58 0.18 245)';
  const blueDeep = 'oklch(0.46 0.20 250)';
  const ink = 'oklch(0.22 0.015 260)';
  const ink3 = 'oklch(0.62 0.01 260)';
  const danger = 'oklch(0.62 0.19 25)';
  const dangerSoft = 'oklch(0.96 0.03 25)';

  const handleSave = async () => {
    setErr('');
    if (pw.length < 6) return setErr('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
    if (pw !== confirm) return setErr('รหัสผ่านยืนยันไม่ตรงกัน');
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pw });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => onDone(), 2000);
    } catch (e) {
      setErr(e?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    }
    setSaving(false);
  };

  return (
    <div style={{ fontFamily: thFont, minHeight: '100dvh', background: 'linear-gradient(180deg,#ddeeff,#a8cff0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 390, margin: '24px 20px', background: '#fff', borderRadius: 28, boxShadow: '0 20px 60px -15px rgba(30,80,160,0.18)', padding: '32px 24px 28px' }}>
        {success ? (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 72, height: 72, borderRadius: 22, background: `linear-gradient(140deg,${blue},${blueDeep})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m4 12 5 5L20 6"/></svg>
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: ink }}>ตั้งรหัสผ่านใหม่สำเร็จ!</div>
            <div style={{ fontSize: 13.5, color: ink3 }}>กำลังพาไปหน้าล็อกอิน...</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 60, height: 60, borderRadius: 18, background: 'oklch(0.93 0.04 245)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: ink }}>ตั้งรหัสผ่านใหม่</div>
              <div style={{ fontSize: 13, color: ink3, marginTop: 6 }}>กรอกรหัสผ่านใหม่ที่ต้องการ</div>
            </div>
            {err && (
              <div style={{ padding: '10px 13px', borderRadius: 11, background: dangerSoft, color: danger, fontSize: 12.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="9.5"/><path d="M12 7v6M12 16.5v.1"/></svg>
                {err}
              </div>
            )}
            <div style={{ position: 'relative', background: 'oklch(0.985 0.005 260)', border: '1.5px solid oklch(0.86 0.012 260)', borderRadius: 16, display: 'flex', alignItems: 'center' }}>
              <input type={showPw ? 'text' : 'password'} value={pw} onChange={e => setPw(e.target.value)}
                placeholder="รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)"
                style={{ flex: 1, padding: '12px 14px', border: 0, outline: 'none', background: 'transparent', fontSize: 14.5, color: ink, fontFamily: thFont }}/>
              <button type="button" onClick={() => setShowPw(v => !v)} style={{ background: 'none', border: 0, cursor: 'pointer', padding: '0 13px', color: ink3, display: 'flex' }}>
                {showPw
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M17.94 17.94A10 10 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9 9 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"/></svg>}
              </button>
            </div>
            <div style={{ background: 'oklch(0.985 0.005 260)', border: '1.5px solid oklch(0.86 0.012 260)', borderRadius: 16 }}>
              <input type={showPw ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)}
                placeholder="ยืนยันรหัสผ่านใหม่"
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                style={{ width: '100%', padding: '12px 14px', border: 0, outline: 'none', background: 'transparent', fontSize: 14.5, color: ink, fontFamily: thFont, boxSizing: 'border-box' }}/>
            </div>
            <button onClick={handleSave} disabled={saving} style={{ width: '100%', padding: '14px', background: `linear-gradient(180deg,${blue},${blueDeep})`, border: 0, borderRadius: 16, cursor: saving ? 'not-allowed' : 'pointer', color: '#fff', fontFamily: thFont, fontSize: 15, fontWeight: 700 }}>
              {saving ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const BRCargoApp = () => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [active, setActive] = useState('home');
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileUser, setProfileUser] = useState(null);
  const [resetMode, setResetMode] = useState(false);

  // ── ข้อ 1: ใช้ Supabase session จริง ไม่ logout เมื่อ refresh ──
  useEffect(() => {
    // ถ้า URL hash มี type=recovery ให้รอ onAuthStateChange จัดการแทน ไม่ setUser ก่อน
    const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
    const isRecovery = hashParams.get('type') === 'recovery';

    if (isRecovery) {
      // ล้าง hash ออกจาก URL แต่รอให้ Supabase SDK อ่านก่อน
      setTimeout(() => {
        window.history.replaceState({}, '', window.location.pathname);
      }, 500);
      // ไม่ setLoading(false) ที่นี่ — ให้ onAuthStateChange จัดการ
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
          initTracker(session.user);
          track('app', 'session_start', 'เข้าสู่ระบบ');
          try { localStorage.setItem('br_session_user', JSON.stringify(session.user)); } catch {}
        } else {
          setUser(null);
        }
        setLoading(false);
      });
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === 'PASSWORD_RECOVERY') {
        setResetMode(true);
        setLoading(false);
        return;
      }
      if (session?.user) {
        setUser(session.user);
        initTracker(session.user);
        try { localStorage.setItem('br_session_user', JSON.stringify(session.user)); } catch {}
      } else if (_event === 'SIGNED_OUT') {
        setUser(null);
        try { localStorage.removeItem('br_session_user'); } catch {}
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── เช็ค admin ──
  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    supabase.from('admin_emails').select('email')
      .then(({ data }) => {
        const adminList = (data || []).map(e => e.email.toLowerCase());
        setIsAdmin(adminList.includes((user.email || '').toLowerCase()));
      }).catch(() => setIsAdmin(false));
  }, [user]);

  const pageNames = {
    home: 'หน้าแรก', schedule: 'ตารางรอบส่ง', notifications: 'แจ้งเตือน',
    admin: 'หน้าจัดการ', details: 'รายละเอียด', address: 'ที่อยู่', nocode: 'ตามหาเจ้าของ',
  };

  const navigate = (target) => {
    // บันทึก scroll position ของหน้าปัจจุบัน
    saveScrollPos(detail || active);

    if (typeof target === 'string' && target.startsWith('article:')) {
      track('ข่าวสาร', 'view', `ดูบทความ ${target.slice(8)}`);
      setDetail(target); return;
    }
    if (['details', 'address', 'nocode'].includes(target)) {
      track(pageNames[target] || target, 'view');
      setDetail(target); return;
    }
    setDetail(null);
    setProfileUser(null);
    track(pageNames[target] || target, 'navigate');
    setActive(target);
    restoreScrollPos(target);
  };

  const back = () => {
    setDetail(null);
    setProfileUser(null);
  };

  // ── ข้อ 2: handleProfileOpen ส่ง user จริงไป ProfileScreen ──
  const handleProfileOpen = () => {
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (u) {
        supabase.from('users').select('*').eq('id', u.id).single()
          .then(({ data: profile }) => {
            setProfileUser(profile ? { ...u, ...profile, email: u.email || profile.email } : u);
          }).catch(() => setProfileUser(u));
      }
    });
  };

  const scrollRefs = React.useRef({});
  const scrollPositions = React.useRef({});
  const contentRef = React.useRef(null);

  // บันทึก scroll position ก่อนเปลี่ยนหน้า
  const saveScrollPos = (key) => {
    if (contentRef.current) {
      scrollPositions.current[key] = contentRef.current.scrollTop;
    }
  };

  // restore scroll position
  const restoreScrollPos = (key) => {
    setTimeout(() => {
      if (contentRef.current && scrollPositions.current[key] !== undefined) {
        contentRef.current.scrollTop = scrollPositions.current[key];
      }
    }, 0);
  };

  const handleLogout = async () => {
    setProfileUser(null);
    try { localStorage.removeItem('br_session_user'); } catch {}
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg }}>
        <div style={{ width: 32, height: 32, border: `3px solid oklch(0.9 0.03 245)`, borderTopColor: C.primary, borderRadius: '50%', animation: 'brSpin 0.8s linear infinite' }}/>
        <style>{`@keyframes brSpin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const getContent = () => {
    if (profileUser) return <ProfileScreen user={profileUser} onBack={back} onLogout={handleLogout}/>;
    if (typeof detail === 'string' && detail.startsWith('article:')) return <NewsArticlePage articleId={detail.slice(8)} onBack={back}/>;
    if (detail === 'details') return <DetailsPage onBack={back}/>;
    if (detail === 'address') return <AddressPage onBack={back}/>;
    if (detail === 'nocode') return <NoCodePage onBack={back}/>;
    const screens = {
      home: <HomeScreen onNavigate={navigate} onProfile={handleProfileOpen}/>,
      schedule: <ScheduleScreen onNavigate={navigate}/>,
      notifications: <NotificationsScreen onNavigate={navigate}/>,
      admin: isAdmin ? <AdminScreen onNavigate={navigate} isAdmin={isAdmin}/> : <HomeScreen onNavigate={navigate} onProfile={handleProfileOpen}/>,
    };
    return screens[active] || <HomeScreen onNavigate={navigate} onProfile={handleProfileOpen}/>;
  };

  // ── หน้าตั้งรหัสผ่านใหม่ (จากลิงก์อีเมล) ──────────────────
  if (resetMode) {
    return <ResetPasswordScreen onDone={() => { setResetMode(false); setUser(null); }} />;
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', overflowY: 'auto', background: C.bg, fontFamily: thaiFont }}>
        <LoginScreen onLogin={(u) => { setUser(u); setActive('home'); }}/>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'oklch(0.88 0.02 245)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
      <div style={{
        width: '100%', maxWidth: 430, minHeight: '100dvh',
        height: '100dvh', display: 'flex', flexDirection: 'column',
        background: C.bg, fontFamily: thaiFont, overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 0 60px rgba(0,0,0,0.18)',
      }}>
        <AnnouncementBanner />
        <div ref={contentRef} style={{
          flex: 1, overflowY: 'auto', overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
        }}>
          {getContent()}
        </div>
        <BRTabBar active={active} onNavigate={navigate} isAdmin={isAdmin}/>
      </div>
    </div>
  );
};

export default BRCargoApp;
