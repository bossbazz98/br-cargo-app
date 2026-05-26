import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { C, thaiFont } from '../../lib/brColors';
import BRIcon from './BRIcon';
import BRAppHeader from './BRAppHeader';
import { timeAgo } from './BRShared';

const typeMeta = {
  shipment: { icon: 'box', tone: 'success' },
  alert: { icon: 'warn', tone: 'warn' },
  promo: { icon: 'ticket', tone: 'danger' },
  article: { icon: 'megaphone', tone: 'primary' },
  announcement: { icon: 'megaphone', tone: 'primary' },
};

const NotificationItem = ({ n, onUpdate, onDelete }) => {
  const meta = typeMeta[n.type] || typeMeta.article;
  const toneBg = { primary: C.primarySoft, success: C.successSoft, warn: C.warnSoft, danger: C.dangerSoft }[meta.tone];
  const toneFg = { primary: C.primary, success: C.success, warn: C.warn, danger: C.danger }[meta.tone];

  const markRead = () => {
    if (!n.is_read) base44.entities.Notification.update(n.id, { is_read: true }).then(onUpdate);
  };
  const del = (e) => {
    e.stopPropagation();
    base44.entities.Notification.delete(n.id).then(() => onDelete(n.id));
  };

  return (
    <div onClick={markRead} style={{
      background: C.card, borderRadius: 16,
      border: `1px solid ${!n.is_read ? 'oklch(0.9 0.04 245)' : C.line}`,
      padding: '14px 14px', display: 'flex', gap: 12, cursor: 'pointer', position: 'relative',
    }}>
      {!n.is_read && <div style={{ position: 'absolute', top: 14, right: 14, width: 8, height: 8, borderRadius: 99, background: C.primary }}/>}
      <div style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        background: n.tone ? ({ primary: C.primarySoft, success: C.successSoft, warn: C.warnSoft, danger: C.dangerSoft }[n.tone] || toneBg) : toneBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
      }}>
        {n.icon_kind === 'emoji' && n.emoji
          ? <span>{n.emoji}</span>
          : <BRIcon name={n.icon_name || meta.icon} size={20} color={n.tone ? ({ primary: C.primary, success: C.success, warn: C.warn, danger: C.danger }[n.tone] || toneFg) : toneFg} stroke={1.8}/>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, paddingRight: !n.is_read ? 16 : 0 }}>{n.title}</div>
        <div style={{ fontSize: 12.5, color: C.ink2, marginTop: 3, lineHeight: 1.45 }}>{n.message}</div>
        <div style={{ fontSize: 11, color: C.ink3, marginTop: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <BRIcon name="clock" size={11} color={C.ink3}/>
            {timeAgo(n.created_at)}
          </span>
          <button onClick={del} style={{
            marginLeft: 'auto', background: 'transparent', border: 0, cursor: 'pointer',
            color: C.ink3, fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4,
            padding: 0, fontFamily: thaiFontHeading,
          }}>
            <BRIcon name="trash" size={12} color={C.ink3} stroke={1.8}/>
            ลบ
          </button>
        </div>
      </div>
    </div>
  );
};

const NotificationsScreen = ({ onNavigate }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = () => {
    setLoading(true);
    base44.entities.Notification.list('-created_at', 50)
      .then(setNotifications).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  // Android back button
  useEffect(() => {
    window.history.pushState({ brBack: true }, '');
    const handler = () => onNavigate && onNavigate('home');
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    for (const n of unread) await base44.entities.Notification.update(n.id, { is_read: true });
    load();
  };
  const clearAll = async () => {
    for (const n of notifications) await base44.entities.Notification.delete(n.id);
    setNotifications([]);
  };

  const filtered = filter === 'all' ? notifications : notifications.filter(n => !n.is_read);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const filters = [
    { key: 'all', label: 'ทั้งหมด', count: notifications.length },
    { key: 'unread', label: 'ยังไม่อ่าน', count: unreadCount },
  ];

  return (
    <div style={{ fontFamily: thaiFont, background: C.bg, minHeight: '100%' }}>
      <BRAppHeader title="การแจ้งเตือน" subtitle={`${unreadCount} รายการใหม่`} back onBack={() => onNavigate && onNavigate('home')}
        right={
          <button onClick={markAllRead} style={{ background: 'transparent', border: 0, color: C.primary, fontWeight: 700, fontSize: 13, fontFamily: thaiFontHeading, cursor: 'pointer', padding: '6px 10px' }}>
            อ่านทั้งหมด
          </button>
        }
      />

      <div style={{ padding: '14px 20px 6px' }}>
        <div style={{ display: 'inline-flex', gap: 4, padding: 4, background: C.primarySofter, borderRadius: 12, border: `1px solid ${C.line}` }}>
          {filters.map(f => {
            const active = filter === f.key;
            return (
              <button key={f.key} onClick={() => setFilter(f.key)} style={{
                padding: '7px 14px', borderRadius: 9,
                background: active ? C.card : 'transparent', border: 0, cursor: 'pointer',
                fontSize: 12.5, fontWeight: 700, fontFamily: thaiFontHeading,
                color: active ? C.ink : C.ink3,
                boxShadow: active ? `0 2px 6px -2px rgba(0,0,0,0.08)` : 'none',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                {f.label}
                <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 99, background: active ? C.primary : 'oklch(0.9 0.008 260)', color: active ? '#fff' : C.ink3 }}>{f.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '60px 0', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 28, height: 28, border: `3px solid ${C.line}`, borderTopColor: C.primary, borderRadius: '50%', animation: 'brSpin 0.8s linear infinite' }}/>
          <style>{`@keyframes brSpin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: C.ink3, fontWeight: 500 }}>ไม่มีการแจ้งเตือน</div>
      ) : (
        <div style={{ padding: '8px 20px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(n => (
            <NotificationItem key={n.id} n={n} onUpdate={load} onDelete={(id) => setNotifications(prev => prev.filter(x => x.id !== id))}/>
          ))}
        </div>
      )}

      {notifications.length > 0 && (
        <div style={{ padding: '10px 0 12px', display: 'flex', justifyContent: 'center' }}>
          <button onClick={clearAll} style={{
            background: 'transparent', border: 0, cursor: 'pointer',
            fontSize: 12.5, fontWeight: 700, color: C.ink3, fontFamily: thaiFontHeading,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <BRIcon name="trash" size={14} color={C.ink3} stroke={1.8}/>
            ล้างการแจ้งเตือนทั้งหมด
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationsScreen;