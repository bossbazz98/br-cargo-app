import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { C, thaiFont, thaiFontHeading, thaiFontSubheading } from '../../lib/brColors';
import BRIcon from './BRIcon';
import BRAppHeader from './BRAppHeader';
import { fmtDayMonth } from './BRShared';

// ─── Announcement Toast ────────────────────────────────────
const STORAGE_KEY = 'dismissed_announcements_v2';
const TOAST_DURATION = 8000;

const ToastItem = ({ item, onDismiss }) => {
  const [visible, setVisible] = useState(true);
  const [dragX, setDragX] = useState(0);
  const startX = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), TOAST_DURATION);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!visible) {const t = setTimeout(() => onDismiss(item.id), 300);return () => clearTimeout(t);}
  }, [visible]);

  const toneColor = { primary: C.primary, success: C.success, warn: C.warn, danger: C.danger };
  const toneBg = { primary: C.primarySoft, success: C.successSoft, warn: C.warnSoft, danger: C.dangerSoft };
  const tc = toneColor[item.tone] || C.primary;
  const tbg = toneBg[item.tone] || C.primarySoft;

  const onTouchStart = (e) => {startX.current = e.touches[0].clientX;};
  const onTouchMove = (e) => {
    if (startX.current === null) return;
    const dx = e.touches[0].clientX - startX.current;
    setDragX(dx);
  };
  const onTouchEnd = () => {
    if (Math.abs(dragX) > 60) {
      setVisible(false);
    } else {
      setDragX(0);
    }
    startX.current = null;
  };

  return (
    <div
      onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
      style={{
        background: '#fff',
        border: `1.5px solid ${tc}`,
        borderLeft: `4px solid ${tc}`,
        padding: '12px 14px',
        borderRadius: 14,
        display: 'flex', alignItems: 'flex-start', gap: 10,
        boxShadow: '0 8px 30px -8px rgba(0,0,0,0.18)',
        pointerEvents: 'auto',
        transform: `translateX(${dragX}px)`,
        opacity: visible ? 1 : 0,
        transition: visible && dragX === 0 ? 'opacity 0.3s ease' : dragX !== 0 ? 'none' : 'opacity 0.3s ease, transform 0.3s ease',
        cursor: 'grab',
        userSelect: 'none'
      }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: tbg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
        {item.icon_kind === 'emoji' && item.emoji ?
        <span>{item.emoji}</span> :
        <BRIcon name={item.icon_name || 'megaphone'} size={17} color={tc} stroke={2} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink }}>{item.title}</div>
        <div style={{ fontSize: 12, color: C.ink2, marginTop: 2, lineHeight: 1.45 }}>{item.message}</div>
      </div>
      <button onClick={() => setVisible(false)} style={{
        width: 22, height: 22, borderRadius: 99, flexShrink: 0,
        background: 'oklch(0.93 0.01 260)', border: 0, cursor: 'pointer',
        color: C.ink3, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>✕</button>
    </div>);

};

// AnnouncementBanner is mounted once at app level (in BRCargoApp) — not re-mounted on navigation
// Only shows announcements created AFTER the current session started (real-time only)
const AnnouncementBanner = () => {
  const [queue, setQueue] = useState([]);
  const [dismissed, setDismissed] = useState(() => {
    try {return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');} catch {return [];}
  });

  // Record the time this session started — only show announcements created after this
  const sessionStartTime = useRef(Date.now());

  const getDismissed = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; } };

  const playSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(660, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.4);
    } catch {}
  };

  useEffect(() => {
    const unsubscribe = base44.entities.Announcement.subscribe((event) => {
      // Supabase realtime ใช้ eventType = 'INSERT' ไม่ใช่ 'create'
      const isNew = event.eventType === 'INSERT' || event.type === 'INSERT' || event.type === 'create';
      const data = event.new || event.data;
      if (isNew && data?.is_active) {
        // เช็ค created_at แทน created_date
        const createdAt = data?.created_at ? new Date(data.created_at).getTime() : Date.now();
        if (createdAt < sessionStartTime.current - 5000) return; // ให้ tolerance 5 วิ

        const currentDismissed = getDismissed();
        if (!currentDismissed.includes(data.id)) {
          setQueue((q) => [...q, data]);
          playSound();
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const dismiss = (id) => {
    const next = [...dismissed, id];
    setDismissed(next);
    setQueue((q) => q.filter((a) => a.id !== id));
    try {localStorage.setItem(STORAGE_KEY, JSON.stringify(next));} catch {}
  };

  if (queue.length === 0) return null;

  return (
    <div style={{
      position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8,
      width: 'calc(100vw - 32px)', maxWidth: 400, pointerEvents: 'none'
    }}>
      {queue.map((item) => <ToastItem key={item.id} item={item} onDismiss={dismiss} />)}
      <style>{`@keyframes toastIn{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>);

};

// ─── Promo Slider ──────────────────────────────────────────
const PromoSlider = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const scrollRef = useRef();

  useEffect(() => {
    base44.entities.PromoImage.list('order', 10)
      .then((r) => {
        setImages([...r].sort((a, b) => (b.order || 0) - (a.order || 0)));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (images.length <= 1) return;
    const tick = setInterval(() => {
      setCurrent((prev) => {
        const next = (prev + 1) % images.length;
        const el = scrollRef.current;
        if (el) {
          const cardWidth = el.clientWidth - 40;
          const gap = 22;
          el.scrollTo({ left: next * (cardWidth + gap), behavior: 'smooth' });
        }
        return next;
      });
    }, 3500);
    return () => clearInterval(tick);
  }, [images.length]);

  // Loading skeleton
  if (loading) return (
    <div style={{ padding: '14px 20px 6px' }}>
      <div style={{
        borderRadius: 24, aspectRatio: '1/1', overflow: 'hidden',
        background: `linear-gradient(135deg, ${C.primarySoft}, oklch(0.93 0.03 230))`,
        position: 'relative',
      }}>
        {/* Shimmer animation */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
        }}/>
        <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
      </div>
    </div>
  );

  // Empty state — ซ่อนถ้าไม่มีรูป (ไม่แสดงข้อความ)
  if (images.length === 0) return null;

  return (
    <div style={{ padding: '14px 0 6px' }}>
      <div ref={scrollRef} style={{
        display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory',
        scrollbarWidth: 'none', gap: 22,
        paddingLeft: 'calc(50% - (min(100vw, 430px) / 2 - 20px) / 2)',
        paddingRight: 'calc(50% - (min(100vw, 430px) / 2 - 20px) / 2)',
      }}>
        {images.map((img, i) =>
        <div key={img.id} style={{
          flexShrink: 0, width: 'calc(min(100vw, 430px) - 40px)', aspectRatio: '1 / 1',
          scrollSnapAlign: 'center', background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
          position: 'relative', overflow: 'hidden', borderRadius: 24
        }}>
            {img.image_url && <img src={img.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}/>}
          </div>
        )}
      </div>
      {images.length > 1 &&
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 10 }}>
          {images.map((_, i) =>
        <div key={i} style={{
          width: i === current ? 18 : 7, height: 7, borderRadius: 99,
          background: i === current ? C.primary : C.line2, transition: 'all 0.25s'
        }} />
        )}
        </div>
      }
    </div>
  );

};

// ─── Quick Actions ─────────────────────────────────────────
const BRPAY_DEFAULT = {
  link_url: '',
  button_text: 'BR PAY',
  button_sub: 'กด web & สแกนจ่าย',
  emoji: '🌐',
  image_url: '',
  bg_from_hex: '#e8eaf6',
  bg_to_hex: '#dde3f8',
  bg_from: '#e8eaf6',
  bg_to: '#dde3f8',
  text_color: '#1a237e',
  font_size: 18,
  shadow_opacity: 20,
  border_color: 'transparent',
  border_width: 0,
  padding_v: 14,
  padding_h: 20,
};

const QuickActions = ({ onNavigate }) => {
  const [brpay, setBrpay] = useState(BRPAY_DEFAULT);

  const loadBrPay = () => base44.entities.BrPayConfig.list().then((list) => {
    setBrpay(list[0] ? { ...BRPAY_DEFAULT, ...list[0] } : BRPAY_DEFAULT);
  }).catch(() => {});

  useEffect(() => {
    loadBrPay();
    const unsub = base44.entities.BrPayConfig.subscribe(() => loadBrPay());
    return unsub;
  }, []);

  const actions = [
  { id: 'schedule', labelTh: 'ตารางรอบส่ง', labelEn: 'SCHEDULE', icon: 'calendar', tone: 'primary' },
  { id: 'address', labelTh: 'ที่อยู่', labelEn: 'ADDRESS', icon: 'pin', tone: 'success' },
  { id: 'nocode', labelTh: 'ตามหาเจ้าของ', labelEn: 'NO CODE', icon: 'help', tone: 'warn' },
  { id: 'detail', labelTh: 'รายละเอียด', labelEn: 'DETAILS', icon: 'info', tone: 'primary' }];

  const toneColor = { primary: C.primary, success: C.success, warn: C.warn };
  const toneBg = { primary: C.primarySoft, success: C.successSoft, warn: C.warnSoft };
  const navTarget = (id) => id === 'detail' ? 'details' : id;

  return (
    <div style={{ padding: '14px 20px 6px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {actions.map((a) =>
        <button key={a.id} onClick={() => onNavigate && onNavigate(navTarget(a.id))} style={{
          background: C.card, border: `1px solid ${C.line}`, borderRadius: 18,
          padding: '16px 14px 14px', textAlign: 'left', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 14,
          fontFamily: thaiFont
        }}>
            <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: toneBg[a.tone] || C.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
              <BRIcon name={a.icon} size={22} color={toneColor[a.tone] || C.primary} stroke={1.8} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, fontFamily: thaiFontHeading }}>{a.labelTh}</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: C.ink3, letterSpacing: 1, marginTop: 2 }}>{a.labelEn}</div>
            </div>
          </button>
        )}
      </div>
      {/* BR PAY Button */}
      {(() => {
        const payBgFrom = brpay.bg_from_hex || brpay.bg_from || BRPAY_DEFAULT.bg_from_hex;
        const payBgTo = brpay.bg_to_hex || brpay.bg_to || BRPAY_DEFAULT.bg_to_hex;
        const payFg = brpay.text_color || BRPAY_DEFAULT.text_color;
        const payPadV = brpay.padding_v || 14;
        const payPadH = brpay.padding_h || 20;
        const shadowOp = (brpay.shadow_opacity ?? BRPAY_DEFAULT.shadow_opacity) / 100;
        const borderW = brpay.border_width || 0;
        const borderC = brpay.border_color || 'transparent';
        return (
          <button onClick={() => brpay.link_url && window.open(brpay.link_url, '_blank')} style={{
            marginTop: 12, width: '100%',
            background: `linear-gradient(135deg, ${payBgFrom}, ${payBgTo})`,
            border: borderW > 0 ? `${borderW}px solid ${borderC}` : 'none',
            borderRadius: 18, cursor: brpay.link_url ? 'pointer' : 'default',
            padding: `${payPadV}px ${payPadH}px`,
            display: 'flex', alignItems: 'center', gap: 16,
            boxShadow: `0 6px 22px -8px rgba(40,60,180,${shadowOp})`,
            fontFamily: thaiFont
          }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, flexShrink: 0, background: 'rgba(255,255,255,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid rgba(255,255,255,0.5)' }}>
              {brpay.image_url ?
              <img src={brpay.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 14 }}/> :
              <span style={{ fontSize: 24 }}>{brpay.emoji || BRPAY_DEFAULT.emoji}</span>}
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontFamily: `'Inter', sans-serif`, fontSize: brpay.font_size || 18, fontWeight: 900, color: payFg, letterSpacing: -0.4 }}>{brpay.button_text || 'BR PAY'}</div>
              <div style={{ fontSize: 11, color: payFg, opacity: 0.75, marginTop: 2 }}>{brpay.button_sub || 'กด web & สแกนจ่าย'}</div>
            </div>
            <BRIcon name="chevR" size={20} color={payFg} stroke={2.5} />
          </button>
        );
      })()}
    </div>);

};

// ─── Schedule Carousel ─────────────────────────────────────
const ScheduleCarousel = ({ onNavigate }) => {
  const [schedules, setSchedules] = useState([]);
  useEffect(() => {
    base44.entities.ShippingSchedule.list('-created_at', 6).then(setSchedules).catch(() => {});
  }, []);

  const items = [];
  schedules.forEach((s) => {
    if (s.air_lots?.length > 0) items.push({ id: `${s.id}-air`, kind: 'air', month: s.month_label, lots: s.air_lots, updated: s.air_updated_date });
    if (s.sea_lots?.length > 0) items.push({ id: `${s.id}-sea`, kind: 'sea', month: s.month_label, lots: s.sea_lots, updated: s.sea_updated_date });
  });

  if (items.length === 0) return (
    <div style={{ padding: '14px 20px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 18, fontWeight: 800, fontFamily: thaiFontHeading, color: C.ink }}>รอบส่ง</div>
        <button onClick={() => onNavigate && onNavigate('schedule')} style={{ background: 'none', border: 0, cursor: 'pointer', fontSize: 12, fontWeight: 700, color: C.primary, fontFamily: thaiFontSubheading }}>ดูทั้งหมด →</button>
      </div>
      <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 16, padding: '24px 20px', textAlign: 'center' }}>
        <BRIcon name="calendar" size={32} color={C.ink3} stroke={1.4} />
        <div style={{ fontFamily: thaiFont, fontSize: 13, color: C.ink3, marginTop: 8 }}>ยังไม่มีข้อมูลรอบส่ง</div>
      </div>
    </div>
  );

  return (
    <>
      <div style={{ padding: '14px 20px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BRIcon name="calendar" size={18} color={C.primary} stroke={2} />
          <div style={{ fontSize: 16, fontWeight: 700, fontFamily: thaiFontHeading, color: C.ink }}>อัปเดตตารางรอบส่ง</div>
        </div>
        <button onClick={() => onNavigate && onNavigate('schedule')} style={{
          background: 'transparent', border: 0, cursor: 'pointer',
          fontSize: 13, fontWeight: 600, color: C.primary, fontFamily: thaiFontSubheading,
          display: 'flex', alignItems: 'center', gap: 2
        }}>
          ดูทั้งหมด <BRIcon name="chevR" size={14} color={C.primary} />
        </button>
      </div>
      <div style={{ display: 'flex', gap: 12, padding: '4px 20px 16px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {items.map((u) =>
        <div key={u.id} onClick={() => onNavigate && onNavigate('schedule')} style={{
          minWidth: 240, background: C.card, borderRadius: 18,
          border: `1px solid ${C.line}`, padding: '14px 16px', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', gap: 12
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <BRIcon name={u.kind === 'air' ? 'plane' : 'ship'} size={16} color={u.kind === 'air' ? C.primary : C.success} stroke={2} />
                <span style={{ fontFamily: `'Inter', sans-serif`, fontSize: 11.5, fontWeight: 700, letterSpacing: 1, color: u.kind === 'air' ? C.primary : C.success }}>
                  {u.kind === 'air' ? 'AIR FREIGHT' : 'SEA FREIGHT'}
                </span>
              </div>
              <span style={{ fontSize: 10, color: C.ink3 }}>{u.updated}</span>
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, fontFamily: thaiFontHeading, color: C.ink }}>{u.month}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', fontSize: 11.5, color: C.ink3, fontWeight: 600, padding: '4px 0' }}>
              <div>LOT</div><div>CUT OFF</div><div>ETD</div>
            </div>
            {/* scroll container + fade mask */}
            <div style={{ position: 'relative' }}>
              <div style={{ maxHeight: 200, overflowY: 'auto', scrollbarWidth: 'none' }}>
                {u.lots.slice(0, 15).map((lot, i) =>
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '8px 0', borderTop: `1px solid ${C.line}`, fontSize: 14 }}>
                    <div style={{ fontFamily: `'Inter', sans-serif`, fontWeight: 700, color: C.ink }}>{lot.lot || `L${i + 1}`}</div>
                    <div style={{ color: C.ink2 }}>{fmtDayMonth(lot.cut_off)}</div>
                    <div style={{ color: C.ink2 }}>{fmtDayMonth(lot.etd)}</div>
                  </div>
                )}
              </div>
              {u.lots.length > 4 && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 32, background: `linear-gradient(to bottom, transparent, ${C.card})`, pointerEvents: 'none' }}/>
              )}
            </div>
          </div>
        )}
      </div>
    </>);

};

// ─── News Feed ─────────────────────────────────────────────
const NewsFeed = ({ onNavigate }) => {
  const [news, setNews] = useState([]);
  useEffect(() => {
    base44.entities.NewsArticle.list('-created_at', 6).then(setNews).catch(() => {});
  }, []);

  if (news.length === 0) return (
    <div style={{ padding: '14px 20px 0' }}>
      <div style={{ fontSize: 18, fontWeight: 800, fontFamily: thaiFontHeading, color: C.ink, marginBottom: 12 }}>ข่าวสาร</div>
      <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 16, padding: '24px 20px', textAlign: 'center' }}>
        <BRIcon name="bell" size={32} color={C.ink3} stroke={1.4} />
        <div style={{ fontFamily: thaiFont, fontSize: 13, color: C.ink3, marginTop: 8 }}>ยังไม่มีข่าวสาร</div>
      </div>
    </div>
  );
  const categoryMap = {
    sea_freight: { label: 'SEA FREIGHT', color: C.primary, bg: C.primarySoft },
    air_freight: { label: 'AIR FREIGHT', color: C.primary, bg: C.primarySoft },
    announcement: { label: 'ข่าวประกาศ', color: C.success, bg: C.successSoft },
    promotion: { label: 'โปรโมชั่น', color: C.danger, bg: C.dangerSoft }
  };

  return (
    <div style={{ padding: '8px 20px 4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <BRIcon name="doc" size={18} color={C.primary} stroke={2} />
        <div style={{ fontSize: 16, fontWeight: 700, fontFamily: thaiFontHeading, color: C.ink }}>ข่าวขนส่งล่าสุด</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {news.map((a) => {
          const cat = categoryMap[a.category] || { label: a.category, color: C.ink3, bg: C.line };
          return (
            <div key={a.id} onClick={() => onNavigate && onNavigate(`article:${a.id}`)} style={{
              background: C.card, border: `1px solid ${C.line}`, borderRadius: 16,
              overflow: 'hidden', cursor: 'pointer'
            }}>
              <div style={{ height: 88, background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                {a.image_url && <img src={a.image_url} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}/>}
                {a.is_hot && <div style={{ position: 'absolute', top: 8, left: 8, background: C.danger, color: '#fff', fontSize: 9, fontWeight: 800, padding: '3px 7px', borderRadius: 99, zIndex: 2 }}>HOT</div>}
              </div>
              <div style={{ padding: '10px 12px 12px' }}>
                <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: 99, background: cat.bg, color: cat.color, fontSize: 9.5, fontWeight: 700 }}>{cat.label}</span>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, marginTop: 5, lineHeight: 1.3, fontFamily: thaiFontHeading }}>{a.title}</div>
                {a.excerpt && <div style={{ fontSize: 11.5, color: C.ink3, marginTop: 3, lineHeight: 1.4 }}>{a.excerpt}</div>}
              </div>
            </div>);

        })}
      </div>
    </div>);

};

// ─── Gallery ───────────────────────────────────────────────
const GallerySection = () => {
  const [images, setImages] = useState([]);
  useEffect(() => {
    base44.entities.GalleryImage.list('order', 200).then((images) => {
      setImages([...images].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
    }).catch(() => {});
  }, []);

  if (images.length === 0) return (
    <div style={{ padding: '14px 20px 0' }}>
      <div style={{ fontSize: 18, fontWeight: 800, fontFamily: thaiFontHeading, color: C.ink, marginBottom: 12 }}>Gallery</div>
      <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 16, padding: '24px 20px', textAlign: 'center' }}>
        <BRIcon name="image" size={32} color={C.ink3} stroke={1.4} />
        <div style={{ fontFamily: thaiFont, fontSize: 13, color: C.ink3, marginTop: 8 }}>ยังไม่มีรูปภาพ</div>
      </div>
    </div>
  );
  return (
    <div style={{ padding: '14px 20px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <BRIcon name="image" size={20} color={C.primary} stroke={2} />
        <div style={{ fontSize: 18, fontWeight: 800, fontFamily: thaiFontHeading, color: C.ink }}>Gallery</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {images.map((img) =>
        <div key={img.id} style={{ aspectRatio: '1 / 1', borderRadius: 14, overflow: 'hidden', border: `1px solid ${C.line}` }}>
            {img.image_url ?
          <img src={img.image_url} alt={img.caption || ""} style={{ width: "100%", height: "100%", objectFit: "cover" }}/> :
          <div style={{ width: '100%', height: '100%', background: C.primarySoft }} />}
          </div>
        )}
      </div>
    </div>);

};

// ─── Home Screen ───────────────────────────────────────────
const HomeScreen = ({ onNavigate, onProfile }) => {
  return (
    <div style={{ fontFamily: thaiFont }}>
      <BRAppHeader variant="brand" onProfile={onProfile}/>
      <PromoSlider />
      <QuickActions onNavigate={onNavigate} />
      <ScheduleCarousel onNavigate={onNavigate} />
      <NewsFeed onNavigate={onNavigate} />
      <GallerySection />
      <div style={{ height: 0 }} />
    </div>);

};

export { AnnouncementBanner };

export default HomeScreen;