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



const BRCargoApp = () => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const getInitialState = () => {
    const path = window.location.pathname;
    if (path === '/schedule') return { screen: 'schedule', detail: null };
    if (path === '/notifications') return { screen: 'notifications', detail: null };
    if (path === '/admin') return { screen: 'admin', detail: null };
    if (path === '/profile') return { screen: 'home', detail: 'profile' };
    if (path === '/details') return { screen: 'home', detail: 'details' };
    if (path === '/address') return { screen: 'home', detail: 'address' };
    if (path === '/nocode') return { screen: 'home', detail: 'nocode' };
    if (path.startsWith('/article/')) return { screen: 'home', detail: `article:${path.slice(9)}` };
    return { screen: 'home', detail: null };
  };
  const _init = getInitialState();
  const [active, setActive] = useState(_init.screen);
  const [detail, setDetail] = useState(_init.detail);
  const [loading, setLoading] = useState(true);
  const [profileUser, setProfileUser] = useState(null);

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
      setDetail(target);
      window.history.pushState({}, '', `/article/${target.slice(8)}`);
      return;
    }
    if (['details', 'address', 'nocode'].includes(target)) {
      track(pageNames[target] || target, 'view');
      setDetail(target);
      window.history.pushState({}, '', `/${target}`);
      return;
    }
    setDetail(null);
    setProfileUser(null);
    track(pageNames[target] || target, 'navigate');
    setActive(target);
    restoreScrollPos(target);
    // sync URL
    const urlMap = { home: '/', schedule: '/schedule', notifications: '/notifications', admin: '/admin' };
    window.history.pushState({}, '', urlMap[target] || '/');
  };

  const back = () => {
    setDetail(null);
    const urlMap = { home: '/', schedule: '/schedule', notifications: '/notifications', admin: '/admin' };
    window.history.pushState({}, '', urlMap[active] || '/');
    setProfileUser(null);
  };

  // ── ข้อ 2: handleProfileOpen ส่ง user จริงไป ProfileScreen ──
  const handleProfileOpen = () => {
    window.history.pushState({}, '', '/profile');
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
    window.history.replaceState({}, '', '/');
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
        <LoginScreen onLogin={(u) => {
          if (!u) return;
          setUser(u);
          // sync session ลง localStorage ทันที
          try { localStorage.setItem('br_session_user', JSON.stringify(u)); } catch {}
          // restore หน้าที่ตั้งใจจะดูก่อน login
          const init = getInitialState();
          setActive(init.screen);
          if (init.detail) {
            setDetail(init.detail);
          } else {
            window.history.replaceState({}, '', init.screen === 'home' ? '/' : `/${init.screen}`);
          }
        }}/>
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
