import React, { useState, useEffect } from 'react';
import { supabase } from '@/api/supabaseClient';
import { C, thaiFont } from '../../lib/brColors';
import BRIcon from './BRIcon';
import { BrandLogo, iconBtnStyle } from './BRShared';
import { loadAvatarConfig, AvatarDisplay } from './ProfileScreen';

const BRAppHeader = ({ title, subtitle, back, onBack, right, variant = 'default', onProfile }) => {
  const [user, setUser] = useState(() => {
    // โหลดจาก localStorage ก่อนทันที ไม่ต้องรอ async
    try {
      const saved = localStorage.getItem('br_session_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  useEffect(() => {
    if (variant !== 'brand') return;
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (u) {
        // ดึง profile เพิ่มเติม
        supabase.from('users').select('*').eq('id', u.id).single()
          .then(({ data: profile }) => {
            const merged = profile ? { ...u, ...profile } : u;
            setUser(merged);
            try { localStorage.setItem('br_session_user', JSON.stringify(merged)); } catch {}
          }).catch(() => setUser(u));
      }
    }).catch(() => {});
  }, [variant]);

  // Android back button support
  useEffect(() => {
    if (!back || !onBack) return;
    window.history.pushState({ brBack: true }, '');
    const handler = () => onBack();
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  if (variant === 'brand') {
    const initial = user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px 14px',
        background: C.card, borderBottom: `1px solid ${C.line}`,
      }}>
        <BrandLogo />
        {/* แสดงปุ่มเสมอ ไม่ซ่อนแม้ user ยังโหลดไม่เสร็จ */}
        <button onClick={() => onProfile && onProfile(user)} style={{ background: 'transparent', border: 0, cursor: 'pointer', padding: 0 }}>
          <AvatarDisplay
            config={loadAvatarConfig()}
            size={36}
            userInitial={initial}
          />
        </button>
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