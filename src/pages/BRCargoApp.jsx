import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { C, thaiFont } from '../lib/brColors';
import LoginScreen from '../components/br/LoginScreen';
import HomeScreen, { AnnouncementBanner } from '../components/br/HomeScreen';
import ScheduleScreen from '../components/br/ScheduleScreen';
import NotificationsScreen from '../components/br/NotificationsScreen';
import AdminScreen from '../components/br/AdminScreen';
import BRTabBar from '../components/br/BRTabBar';
import { DetailsPage, AddressPage, NoCodePage, NewsArticlePage } from '../components/br/DetailPages';
import ProfileScreen from '../components/br/ProfileScreen';



const BRCargoApp = () => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [active, setActive] = useState('home');
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // Restore from localStorage immediately to avoid flicker, then verify in background
    let localUser = null;
    try {
      const saved = localStorage.getItem('br_session_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.email) localUser = parsed;
      }
    } catch {}

    if (localUser) {
      setUser(localUser);
      setLoading(false);
      // Verify session is still valid in background (silent)
      base44.auth.me().then(u => {
        if (u) {
          try { localStorage.setItem('br_session_user', JSON.stringify(u)); } catch {}
          setUser(u);
        }
        // If u is null, don't force logout — keep local session
      }).catch(() => {});
    } else {
      base44.auth.me()
        .then(u => {
          if (u) {
            try { localStorage.setItem('br_session_user', JSON.stringify(u)); } catch {}
          }
          setUser(u);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, []);

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    base44.entities.AdminEmail.list()
      .then(adminEmails => {
        const adminList = adminEmails.map(e => e.email.toLowerCase());
        setIsAdmin(adminList.includes((user.email || '').toLowerCase()) || user.role === 'admin');
      }).catch(() => {
        setIsAdmin(user.role === 'admin');
      });
  }, [user]);

  const [profileUser, setProfileUser] = useState(null);

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

  const handleProfileOpen = (u) => setProfileUser(u);

  const handleLogout = () => {
    setProfileUser(null);
    try { localStorage.removeItem('br_session_user'); } catch {}
    base44.auth.logout();
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
        {/* AnnouncementBanner lives outside content so it's never unmounted on navigation */}
        <AnnouncementBanner />
        {/* Main scrollable content — pad bottom so tab bar doesn't cover content */}
        <div style={{
          flex: 1, overflowY: 'auto', overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
        }}>
          {getContent()}
        </div>
        {/* Tab bar is always shown (fixed position handles placement) */}
        <BRTabBar active={active} onNavigate={navigate} isAdmin={isAdmin}/>
      </div>
    </div>
  );
};

export default BRCargoApp;