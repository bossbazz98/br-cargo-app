import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { C, thaiFont } from '../../lib/brColors';
import BRIcon from './BRIcon';
import { BrandLogo, iconBtnStyle } from './BRShared';
import { loadAvatarConfig, AvatarDisplay } from './ProfileScreen';

const BRAppHeader = ({ title, subtitle, back, onBack, right, variant = 'default', onProfile }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (variant !== 'brand') return;
    base44.auth.me().then(u => {
      if (u) { setUser(u); return; }
      try {
        const saved = localStorage.getItem('br_session_user');
        if (saved) setUser(JSON.parse(saved));
      } catch {}
    }).catch(() => {
      try {
        const saved = localStorage.getItem('br_session_user');
        if (saved) setUser(JSON.parse(saved));
      } catch {}
    });
  }, [variant]);



  // Android back button support
  useEffect(() => {
    if (!back || !onBack) return;
    window.history.pushState({ brBack: true }, '');
    const handler = (e) => {
      onBack();
    };
    window.addEventListener('popstate', handler);
    return () => {
      window.removeEventListener('popstate', handler);
    };
  }, []);

  if (variant === 'brand') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px 14px',
        background: C.card, borderBottom: `1px solid ${C.line}`,
      }}>
        <BrandLogo />
        {user && (
          <button onClick={() => onProfile && onProfile(user)} style={{ background: 'transparent', border: 0, cursor: 'pointer', padding: 0 }}>
            <AvatarDisplay
              config={loadAvatarConfig()}
              size={36}
              userInitial={user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
            />
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '16px 18px 14px',
      background: C.card, borderBottom: `1px solid ${C.line}`,
    }}>
      {back && (
        <button onClick={onBack} style={{ ...iconBtnStyle, background: 'transparent' }}>
          <BRIcon name="chevL" size={22} color={C.ink} />
        </button>
      )}
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: thaiFont, fontSize: 19, fontWeight: 700, color: C.ink, letterSpacing: -0.2 }}>{title}</div>
        {subtitle && <div style={{ fontFamily: thaiFont, fontSize: 12, color: C.ink3, marginTop: 2 }}>{subtitle}</div>}
      </div>
      {right}
    </div>
  );
};

export default BRAppHeader;