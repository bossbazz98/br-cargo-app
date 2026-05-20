import React, { useState, useEffect } from 'react';
import { supabase } from '@/api/supabaseClient';

const C = {
  bg: '#f0f4f8',
  card: '#ffffff',
  primary: 'oklch(0.58 0.18 245)',
  primaryDark: 'oklch(0.46 0.20 250)',
  primarySoft: 'oklch(0.94 0.04 245)',
  ink: 'oklch(0.22 0.015 260)',
  ink2: 'oklch(0.45 0.012 260)',
  ink3: 'oklch(0.62 0.01 260)',
  line: 'oklch(0.90 0.008 260)',
  success: 'oklch(0.62 0.14 155)',
  successSoft: 'oklch(0.95 0.04 155)',
  danger: 'oklch(0.62 0.19 25)',
  dangerSoft: 'oklch(0.96 0.03 25)',
  warn: 'oklch(0.72 0.15 65)',
  warnSoft: 'oklch(0.97 0.04 65)',
  sidebar: 'oklch(0.18 0.02 260)',
  sidebarText: 'oklch(0.75 0.01 260)',
};

const font = `'IBM Plex Sans Thai', 'Inter', -apple-system, system-ui, sans-serif`;

// ─── Stat Card ────────────────────────────────────────────
const StatCard = ({ label, value, sub, color, icon }) => (
  <div style={{ background: C.card, borderRadius: 16, padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: `1px solid ${C.line}`, display: 'flex', alignItems: 'flex-start', gap: 16 }}>
    <div style={{ width: 48, height: 48, borderRadius: 14, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{icon}</div>
    <div>
      <div style={{ fontSize: 13, color: C.ink3, fontWeight: 500, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: C.ink, letterSpacing: -0.5, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: C.ink3, marginTop: 4 }}>{sub}</div>}
    </div>
  </div>
);

// ─── Table ─────────────────────────────────────────────────
const Table = ({ columns, rows, emptyText = 'ไม่มีข้อมูล' }) => (
  <div style={{ overflowX: 'auto' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
      <thead>
        <tr style={{ background: C.bg }}>
          {columns.map((col, i) => (
            <th key={i} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: C.ink2, borderBottom: `1px solid ${C.line}`, whiteSpace: 'nowrap' }}>{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr><td colSpan={columns.length} style={{ padding: '24px', textAlign: 'center', color: C.ink3 }}>{emptyText}</td></tr>
        ) : rows.map((row, i) => (
          <tr key={i} style={{ borderBottom: `1px solid ${C.line}`, background: i % 2 === 0 ? '#fff' : C.bg }}>
            {row.map((cell, j) => (
              <td key={j} style={{ padding: '10px 14px', color: C.ink, verticalAlign: 'middle' }}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ─── Badge ─────────────────────────────────────────────────
const Badge = ({ text, color, bg }) => (
  <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, color, background: bg }}>{text}</span>
);

// ─── Section Header ───────────────────────────────────────
const SectionHeader = ({ title, sub, action }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
    <div>
      <div style={{ fontSize: 18, fontWeight: 800, color: C.ink, letterSpacing: -0.3 }}>{title}</div>
      {sub && <div style={{ fontSize: 13, color: C.ink3, marginTop: 2 }}>{sub}</div>}
    </div>
    {action}
  </div>
);

// ─── Login Page ───────────────────────────────────────────
const DashboardLogin = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setErr(''); setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pw });
      if (error) throw error;
      // เช็คว่าเป็น Admin
      const { data: admins } = await supabase.from('admin_emails').select('email');
      const isAdmin = (admins || []).some(a => a.email.toLowerCase() === email.trim().toLowerCase());
      if (!isAdmin) { setErr('คุณไม่มีสิทธิ์เข้าถึง Dashboard'); await supabase.auth.signOut(); setLoading(false); return; }
      onLogin(data.user);
    } catch (e) {
      setErr(e?.message?.includes('Invalid') ? 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' : 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, ${C.primaryDark}, oklch(0.36 0.16 270))`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font, padding: 20 }}>
      <div style={{ background: C.card, borderRadius: 24, padding: '40px 36px', width: '100%', maxWidth: 380, boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 60, height: 60, borderRadius: 18, background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontFamily: `'Inter',sans-serif`, fontWeight: 900, fontSize: 22, color: '#fff', letterSpacing: -1 }}>BR</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.ink }}>BR CARGO Dashboard</div>
          <div style={{ fontSize: 13, color: C.ink3, marginTop: 4 }}>เข้าสู่ระบบสำหรับ Admin เท่านั้น</div>
        </div>
        {err && <div style={{ padding: '10px 14px', borderRadius: 10, background: C.dangerSoft, color: C.danger, fontSize: 13, marginBottom: 16, textAlign: 'center' }}>{err}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="อีเมล" onKeyDown={e => e.key === 'Enter' && login()}
            style={{ padding: '12px 14px', borderRadius: 12, border: `1.5px solid ${C.line}`, fontSize: 14, fontFamily: font, outline: 'none', background: C.bg }} />
          <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="รหัสผ่าน" onKeyDown={e => e.key === 'Enter' && login()}
            style={{ padding: '12px 14px', borderRadius: 12, border: `1.5px solid ${C.line}`, fontSize: 14, fontFamily: font, outline: 'none', background: C.bg }} />
          <button onClick={login} disabled={loading} style={{ padding: '13px', borderRadius: 12, background: `linear-gradient(180deg, ${C.primary}, ${C.primaryDark})`, border: 0, color: '#fff', fontSize: 15, fontWeight: 700, fontFamily: font, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────
const DashboardMain = ({ user, onLogout }) => {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState({ users: 0, admins: 0, notifications: 0, announcements: 0, news: 0, schedules: 0, gallery: 0, promo: 0, online: 0 });
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [news, setNews] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [adminMsg, setAdminMsg] = useState('');
  const [onlineCount, setOnlineCount] = useState(1);

  useEffect(() => {
    loadAll();
    // Track online users via Supabase Presence
    const channel = supabase.channel('online_users', {
      config: { presence: { key: user.id } }
    });
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setOnlineCount(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: user.id, email: user.email, online_at: new Date().toISOString() });
        }
      });
    return () => supabase.removeChannel(channel);
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [
        { data: usersData },
        { data: adminsData },
        { data: notiData },
        { data: annoData },
        { data: newsData },
        { data: schedData },
        { data: gallData },
        { data: promoData },
      ] = await Promise.all([
        supabase.from('users').select('*').order('created_at', { ascending: false }),
        supabase.from('admin_emails').select('*').order('created_at', { ascending: false }),
        supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('announcements').select('*').order('created_at', { ascending: false }),
        supabase.from('news_articles').select('*').order('created_at', { ascending: false }),
        supabase.from('shipping_schedules').select('*').order('created_at', { ascending: false }),
        supabase.from('gallery_images').select('*'),
        supabase.from('promo_images').select('*'),
      ]);
      setUsers(usersData || []);
      setAdmins(adminsData || []);
      setNotifications(notiData || []);
      setNews(newsData || []);
      setStats({
        users: (usersData || []).length,
        admins: (adminsData || []).length,
        notifications: (notiData || []).length,
        announcements: (annoData || []).length,
        news: (newsData || []).length,
        schedules: (schedData || []).length,
        gallery: (gallData || []).length,
        promo: (promoData || []).length,
      });
      // Mock logs จาก notifications ล่าสุด
      setLogs((notiData || []).slice(0, 20).map(n => ({
        time: n.created_at,
        type: n.type || 'info',
        message: `[${n.type || 'notification'}] ${n.title || ''} — ${n.message || ''}`,
      })));
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const addAdmin = async () => {
    const email = newAdminEmail.trim();
    if (!email) return;
    if (!/^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(email)) { setAdminMsg('รูปแบบอีเมลไม่ถูกต้อง'); return; }
    try {
      const { error } = await supabase.from('admin_emails').insert([{ email }]);
      if (error) throw error;
      setNewAdminEmail(''); setAdminMsg('เพิ่ม Admin สำเร็จ ✓'); loadAll();
      setTimeout(() => setAdminMsg(''), 3000);
    } catch (e) { setAdminMsg('เกิดข้อผิดพลาด: ' + (e?.message || '')); }
  };

  const removeAdmin = async (id, email) => {
    if (email === user.email) { setAdminMsg('ไม่สามารถลบตัวเองได้'); return; }
    if (!window.confirm(`ลบ Admin: ${email}?`)) return;
    await supabase.from('admin_emails').delete().eq('id', id);
    loadAll();
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleString('th-TH', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-';

  const navItems = [
    { id: 'overview', label: 'ภาพรวม', icon: '📊' },
    { id: 'users', label: 'ผู้ใช้งาน', icon: '👥' },
    { id: 'admins', label: 'จัดการ Admin', icon: '🛡️' },
    { id: 'notifications', label: 'แจ้งเตือน', icon: '🔔' },
    { id: 'content', label: 'เนื้อหา', icon: '📄' },
    { id: 'logs', label: 'Logs', icon: '📋' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: font, background: C.bg }}>
      {/* Sidebar */}
      <div style={{ width: 240, background: C.sidebar, display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
        <div style={{ padding: '24px 20px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: `'Inter',sans-serif`, fontWeight: 900, fontSize: 14, color: '#fff' }}>BR</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>BR CARGO</div>
              <div style={{ fontSize: 11, color: C.sidebarText }}>Dashboard</div>
            </div>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {navItems.map(item => (
              <button key={item.id} onClick={() => setTab(item.id)} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: 0, cursor: 'pointer', textAlign: 'left', fontSize: 13.5, fontFamily: font, fontWeight: tab === item.id ? 700 : 500,
                background: tab === item.id ? C.primary : 'transparent',
                color: tab === item.id ? '#fff' : C.sidebarText,
              }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div style={{ marginTop: 'auto', padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: 12, color: C.sidebarText, marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
          <button onClick={onLogout} style={{ width: '100%', padding: '8px', borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: 0, color: C.sidebarText, fontSize: 13, fontFamily: font, cursor: 'pointer', fontWeight: 600 }}>ออกจากระบบ</button>
          <a href="/" style={{ display: 'block', marginTop: 6, padding: '8px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', color: C.sidebarText, fontSize: 13, textAlign: 'center', textDecoration: 'none', fontWeight: 600 }}>← กลับแอป</a>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 36px' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
            <div style={{ width: 32, height: 32, border: `3px solid ${C.line}`, borderTopColor: C.primary, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : (
          <>
            {/* Overview */}
            {tab === 'overview' && (
              <div>
                <SectionHeader title="ภาพรวมระบบ" sub={`อัปเดตล่าสุด: ${new Date().toLocaleString('th-TH')}`} action={<button onClick={loadAll} style={{ padding: '8px 16px', borderRadius: 10, background: C.primarySoft, border: 0, color: C.primary, fontFamily: font, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>🔄 รีเฟรช</button>}/>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
                  <StatCard label="ออนไลน์ขณะนี้" value={onlineCount} sub="ผู้ใช้ที่กำลังใช้งาน" color="#22c55e" icon="🟢"/>
                  <StatCard label="ผู้ใช้งานทั้งหมด" value={stats.users} sub="บัญชีที่ลงทะเบียน" color={C.primary} icon="👥"/>
                  <StatCard label="Admin" value={stats.admins} sub="ผู้ดูแลระบบ" color={C.success} icon="🛡️"/>
                  <StatCard label="แจ้งเตือนทั้งหมด" value={stats.notifications} sub="ในระบบ" color={C.warn} icon="🔔"/>
                  <StatCard label="ข่าวสาร" value={stats.news} sub="บทความ" color="oklch(0.55 0.16 300)" icon="📰"/>
                  <StatCard label="รอบส่ง" value={stats.schedules} sub="ตารางเดินทาง" color={C.success} icon="🚢"/>
                  <StatCard label="โปรโมชั่น" value={stats.promo} sub="ภาพแบนเนอร์" color={C.danger} icon="🖼️"/>
                  <StatCard label="Gallery" value={stats.gallery} sub="รูปภาพ" color="oklch(0.55 0.16 200)" icon="📸"/>
                  <StatCard label="ประกาศ" value={stats.announcements} sub="แจ้งเตือนระบบ" color={C.warn} icon="📢"/>
                </div>

                {/* Recent users */}
                <div style={{ background: C.card, borderRadius: 16, padding: 24, border: `1px solid ${C.line}`, marginBottom: 24 }}>
                  <SectionHeader title="ผู้ใช้งานล่าสุด" sub="5 คนล่าสุดที่ลงทะเบียน"/>
                  <Table
                    columns={['ชื่อ', 'อีเมล', 'วันที่สมัคร']}
                    rows={users.slice(0, 5).map(u => [
                      u.full_name || u.first_name || '-',
                      u.email || '-',
                      fmtDate(u.created_at),
                    ])}
                  />
                </div>

                {/* Recent notifications */}
                <div style={{ background: C.card, borderRadius: 16, padding: 24, border: `1px solid ${C.line}` }}>
                  <SectionHeader title="แจ้งเตือนล่าสุด" sub="10 รายการล่าสุด"/>
                  <Table
                    columns={['หัวข้อ', 'ข้อความ', 'สถานะ', 'วันที่']}
                    rows={notifications.slice(0, 10).map(n => [
                      n.title || '-',
                      n.message || '-',
                      n.is_read ? <Badge text="อ่านแล้ว" color={C.success} bg={C.successSoft}/> : <Badge text="ยังไม่อ่าน" color={C.warn} bg={C.warnSoft}/>,
                      fmtDate(n.created_at),
                    ])}
                  />
                </div>
              </div>
            )}

            {/* Users */}
            {tab === 'users' && (
              <div>
                <SectionHeader title="ผู้ใช้งานทั้งหมด" sub={`${users.length} บัญชี`}/>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                  {users.length === 0 ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: C.ink3 }}>ยังไม่มีผู้ใช้งาน</div>
                  ) : users.map((u, i) => (
                    <div key={i} style={{ background: C.card, borderRadius: 16, padding: '20px', border: `1px solid ${C.line}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {/* Avatar */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 99, background: C.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: C.primary, flexShrink: 0, overflow: 'hidden' }}>
                          {u.picture_url ? <img src={u.picture_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/> : (u.full_name?.[0] || u.email?.[0] || '?').toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {u.full_name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'ไม่ระบุชื่อ'}
                          </div>
                          <div style={{ fontSize: 12, color: C.ink3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email || '-'}</div>
                        </div>
                      </div>
                      {/* Info */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: C.ink2 }}>
                        {u.phone && <div>📞 {u.phone}</div>}
                        {u.line_user_id && <Badge text="LINE" color="#06C755" bg="#e8fdf0"/>}
                        <div style={{ color: C.ink3 }}>สมัคร {fmtDate(u.created_at)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Admins */}
            {tab === 'admins' && (
              <div>
                <SectionHeader title="จัดการ Admin" sub={`${admins.length} คน`}/>
                <div style={{ background: C.card, borderRadius: 16, padding: 24, border: `1px solid ${C.line}`, marginBottom: 24 }}>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                    <input type="email" value={newAdminEmail} onChange={e => setNewAdminEmail(e.target.value)} placeholder="อีเมล Admin ใหม่" onKeyDown={e => e.key === 'Enter' && addAdmin()}
                      style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${C.line}`, fontSize: 13.5, fontFamily: font, outline: 'none' }}/>
                    <button onClick={addAdmin} style={{ padding: '10px 20px', borderRadius: 10, background: C.primary, border: 0, color: '#fff', fontSize: 13.5, fontWeight: 700, fontFamily: font, cursor: 'pointer' }}>เพิ่ม Admin</button>
                  </div>
                  {adminMsg && <div style={{ padding: '10px 14px', borderRadius: 10, background: adminMsg.includes('สำเร็จ') ? C.successSoft : C.dangerSoft, color: adminMsg.includes('สำเร็จ') ? C.success : C.danger, fontSize: 13, marginBottom: 16 }}>{adminMsg}</div>}
                  <Table
                    columns={['อีเมล', 'วันที่เพิ่ม', 'การจัดการ']}
                    rows={admins.map(a => [
                      <span style={{ fontWeight: a.email === user.email ? 700 : 400 }}>{a.email} {a.email === user.email ? '(คุณ)' : ''}</span>,
                      fmtDate(a.created_at),
                      <button onClick={() => removeAdmin(a.id, a.email)} disabled={a.email === user.email} style={{ padding: '5px 12px', borderRadius: 8, background: a.email === user.email ? C.line : C.dangerSoft, border: 0, color: a.email === user.email ? C.ink3 : C.danger, fontSize: 12, fontWeight: 700, fontFamily: font, cursor: a.email === user.email ? 'not-allowed' : 'pointer' }}>ลบ</button>,
                    ])}
                    emptyText="ไม่มี Admin"
                  />
                </div>
              </div>
            )}

            {/* Notifications */}
            {tab === 'notifications' && (
              <div>
                <SectionHeader title="แจ้งเตือนทั้งหมด" sub={`${notifications.length} รายการ`}/>
                <div style={{ background: C.card, borderRadius: 16, padding: 24, border: `1px solid ${C.line}` }}>
                  <Table
                    columns={['หัวข้อ', 'ข้อความ', 'ประเภท', 'สถานะ', 'วันที่']}
                    rows={notifications.map(n => [
                      n.title || '-',
                      n.message || '-',
                      n.type || '-',
                      n.is_read ? <Badge text="อ่านแล้ว" color={C.success} bg={C.successSoft}/> : <Badge text="ยังไม่อ่าน" color={C.warn} bg={C.warnSoft}/>,
                      fmtDate(n.created_at),
                    ])}
                    emptyText="ไม่มีแจ้งเตือน"
                  />
                </div>
              </div>
            )}

            {/* Content */}
            {tab === 'content' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <SectionHeader title="เนื้อหาในระบบ" sub="ข่าวสาร และข้อมูลต่างๆ"/>
                <div style={{ background: C.card, borderRadius: 16, padding: 24, border: `1px solid ${C.line}` }}>
                  <SectionHeader title="ข่าวสาร" sub={`${news.length} บทความ`}/>
                  <Table
                    columns={['หัวข้อ', 'หมวดหมู่', 'วันที่']}
                    rows={news.map(n => [
                      n.title || '-',
                      n.category || '-',
                      fmtDate(n.created_at),
                    ])}
                    emptyText="ไม่มีข่าวสาร"
                  />
                </div>
              </div>
            )}

            {/* Logs */}
            {tab === 'logs' && (
              <div>
                <SectionHeader title="System Logs" sub="บันทึกกิจกรรมล่าสุด" action={<button onClick={loadAll} style={{ padding: '8px 16px', borderRadius: 10, background: C.primarySoft, border: 0, color: C.primary, fontFamily: font, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>🔄 รีเฟรช</button>}/>
                <div style={{ background: C.sidebar, borderRadius: 16, padding: 20, fontFamily: 'monospace', fontSize: 12.5 }}>
                  {logs.length === 0 ? (
                    <div style={{ color: C.sidebarText, textAlign: 'center', padding: 20 }}>ไม่มี log</div>
                  ) : logs.map((log, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', color: log.type === 'error' ? '#ff6b6b' : log.type === 'warn' ? '#ffd43b' : '#a0cfff' }}>
                      <span style={{ color: 'rgba(255,255,255,0.35)', flexShrink: 0 }}>{fmtDate(log.time)}</span>
                      <span>{log.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ─── Dashboard App ─────────────────────────────────────────
const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: admins } = await supabase.from('admin_emails').select('email');
        const isAdmin = (admins || []).some(a => a.email.toLowerCase() === session.user.email.toLowerCase());
        if (isAdmin) setUser(session.user);
      }
      setLoading(false);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg }}>
      <div style={{ width: 32, height: 32, border: `3px solid ${C.line}`, borderTopColor: C.primary, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!user) return <DashboardLogin onLogin={setUser}/>;
  return <DashboardMain user={user} onLogout={handleLogout}/>;
};

export default Dashboard;
