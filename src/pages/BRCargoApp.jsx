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

const BRCargoApp = () => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [active, setActive] = useState('home');
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileUser, setProfileUser] = useState(null);

  // ── ข้อ 1: ใช้ Supabase session จริง ไม่ logout เมื่อ refresh ──
  useEffect(() => {
    // ดึง session ปัจจุบันก่อนเลย
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        try { localStorage.setItem('br_session_user', JSON.stringify(session.user)); } catch {}
      } else {
        // ไม่มี session — ให้ไปหน้า login
        setUser(null);
      }
      setLoading(false);
    });

    // ฟัง auth state เปลี่ยน
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
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

  const navigate = (target) => {
    if (typeof target === 'string' && target.startsWith('article:')) { setDetail(target); return; }
    if (['details', 'address', 'nocode'].includes(target)) { setDetail(target); return; }
    setDetail(null);
    setProfileUser(null);
    setActive(target);
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
            setProfileUser(profile ? { ...u, ...profile } : u);
          }).catch(() => setProfileUser(u));
      }
    });
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
        <div style={{
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
