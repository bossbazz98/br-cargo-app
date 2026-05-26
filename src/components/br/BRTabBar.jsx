import React from 'react';
import { base44 } from '@/api/base44Client';
import { supabase } from '@/api/supabaseClient';
import { C, thaiFont } from '../../lib/brColors';
import BRIcon from './BRIcon';

const BRTabBar = ({ active, onNavigate, isAdmin = false }) => {
  const [unread, setUnread] = React.useState(0);

  const loadUnread = () => {
    base44.entities.Notification.filter({ is_read: false })
      .then(n => setUnread(n.length)).catch(() => {});
  };

  React.useEffect(() => {
    loadUnread();

    // Realtime subscription — อัปเดต badge ทันทีเมื่อมี notification ใหม่
    const channel = supabase
      .channel('notification_badge')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
      }, () => loadUnread())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // รีโหลดเมื่อ navigate กลับมาหน้าอื่น
  React.useEffect(() => { loadUnread(); }, [active]);

  const tabs = isAdmin
    ? [
        { id: 'home', label: 'หน้าแรก', icon: 'home' },
        { id: 'schedule', label: 'รอบส่ง', icon: 'calendar' },
        { id: 'notifications', label: 'แจ้งเตือน', icon: 'bell', badge: unread },
        { id: 'admin', label: 'จัดการ', icon: 'settings' },
      ]
    : [
        { id: 'home', label: 'หน้าแรก', icon: 'home' },
        { id: 'schedule', label: 'รอบส่ง', icon: 'calendar' },
        { id: 'notifications', label: 'แจ้งเตือน', icon: 'bell', badge: unread },
      ];

  return (
    <div style={{
      position: 'sticky', bottom: 0, left: 0, right: 0, zIndex: 9999,
      width: '100%',
      background: 'rgba(255,255,255,0.97)',
      backdropFilter: 'blur(18px) saturate(180%)',
      WebkitBackdropFilter: 'blur(18px) saturate(180%)',
      borderTop: `1px solid ${C.line}`,
      paddingTop: 8,
      paddingBottom: `calc(10px + env(safe-area-inset-bottom, 0px))`,
      paddingLeft: 10, paddingRight: 10,
      display: 'flex', justifyContent: 'space-around',
      fontFamily: thaiFontHeading, boxSizing: 'border-box', minHeight: 60,
    }}>
      {tabs.map(t => {
        const isActive = active === t.id;
        return (
          <button key={t.id} onClick={() => onNavigate(t.id)} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            padding: '4px 4px 0', background: 'transparent', border: 0, cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}>
            <div style={{
              position: 'relative', padding: '5px 14px', borderRadius: 99,
              background: isActive ? C.primarySoft : 'transparent',
              transition: 'background 0.15s', flexShrink: 0,
            }}>
              <BRIcon name={t.icon} size={20} color={isActive ? C.primary : C.ink3} stroke={isActive ? 2 : 1.6} />
              {t.badge > 0 && (
                <span style={{
                  position: 'absolute', top: -2, right: 4,
                  minWidth: 16, height: 16, borderRadius: 99,
                  background: C.danger, color: '#fff',
                  fontFamily: `'Inter', sans-serif`, fontSize: 10, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 4px', border: `1.5px solid rgba(255,255,255,0.95)`,
                  lineHeight: 1,
                }}>{t.badge > 99 ? '99+' : t.badge}</span>
              )}
            </div>
            <span style={{
              fontSize: 10.5, fontWeight: isActive ? 700 : 500,
              color: isActive ? C.primary : C.ink3,
              letterSpacing: 0.1, whiteSpace: 'nowrap',
            }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default BRTabBar;
