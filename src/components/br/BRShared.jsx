import React from 'react';
import { C, thaiFont, STATUS_TONE } from '../../lib/brColors';
import BRIcon from './BRIcon';

export const Pill = ({ tone = 'primary', children, size = 'sm' }) => {
  const tones = {
    primary: { bg: C.primarySoft, fg: C.primaryDark },
    success: { bg: C.successSoft, fg: 'oklch(0.42 0.14 155)' },
    warn: { bg: C.warnSoft, fg: 'oklch(0.45 0.14 75)' },
    danger: { bg: C.dangerSoft, fg: 'oklch(0.45 0.18 25)' },
    neutral: { bg: 'oklch(0.95 0.005 260)', fg: C.ink2 },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: size === 'sm' ? '3px 9px' : '5px 11px',
      borderRadius: 99, fontSize: size === 'sm' ? 11 : 12,
      fontWeight: 600, background: t.bg, color: t.fg,
      fontFamily: thaiFont, letterSpacing: 0.1,
    }}>{children}</span>
  );
};

export const StatusDot = ({ tone = 'primary' }) => {
  const bg = { primary: C.primary, success: C.success, warn: C.warn, danger: C.danger }[tone] || C.primary;
  return <span style={{ width: 6, height: 6, borderRadius: 99, background: bg, display: 'inline-block' }} />;
};

export const StatusBadge = ({ value, customColor }) => {
  if (!value) return <span style={{ color: C.ink3 }}>-</span>;
  if (customColor) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center',
        padding: '3px 9px', borderRadius: 99, fontSize: 11, fontWeight: 700,
        background: customColor + '22', color: customColor,
        border: `1px solid ${customColor}44`,
      }}>{value}</span>
    );
  }
  const tone = STATUS_TONE[value] || 'neutral';
  return <Pill tone={tone}>{value}</Pill>;
};

export const BrandLogo = ({ size = 20 }) => (
  <div style={{
    fontFamily: `'Inter', sans-serif`, fontWeight: 900,
    fontSize: size, letterSpacing: -0.6, color: '#000',
  }}>
    BR CARGO
  </div>
);

export const iconBtnStyle = {
  width: 38, height: 38, borderRadius: 12,
  background: C.primarySofter, border: `1px solid ${C.line}`,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', position: 'relative', padding: 0,
};

export const MONTHS_TH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

export const fmtDayMonth = (val) => {
  if (!val || val === '-') return '-';
  const iso = String(val).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${parseInt(iso[3])} ${MONTHS_TH[parseInt(iso[2]) - 1]}`;
  const slash = String(val).match(/^(\d{1,2})[\/\-](\d{1,2})/);
  if (slash) return `${parseInt(slash[1])} ${MONTHS_TH[parseInt(slash[2]) - 1]}`;
  return val;
};

export const timeAgo = (iso) => {
  if (!iso) return '';
  const d = new Date(iso).getTime();
  const mins = Math.max(1, Math.round((Date.now() - d) / 60000));
  if (mins < 60) return `${mins} นาทีที่แล้ว`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} ชม.ที่แล้ว`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days} วันที่แล้ว`;
  return `${Math.round(days / 7)} สัปดาห์ที่แล้ว`;
};
// ── BRImg — รูปภาพที่แสดง skeleton สีฟ้าตอนโหลด ──────────
export const BRImg = ({ src, alt = '', style = {}, className }) => {
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);

  return (
    <div style={{ position: 'relative', overflow: 'hidden', ...style }}>
      {/* Skeleton สีฟ้า + shimmer ขณะโหลด */}
      {!loaded && !error && (
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(135deg, ${C.primarySoft}, oklch(0.93 0.03 230))`,
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
            backgroundSize: '200% 100%',
            animation: 'brImgShimmer 1.5s infinite',
          }}/>
        </div>
      )}
      {/* Error state */}
      {error && (
        <div style={{
          position: 'absolute', inset: 0,
          background: C.primarySoft,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="m3 16 5-5 4 4 3-3 6 6"/><circle cx="8.5" cy="8.5" r="1.5"/></svg>
        </div>
      )}
      <style>{`@keyframes brImgShimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
      {src && (
        <img
          src={src}
          alt={alt}
          className={className}
          onLoad={() => setLoaded(true)}
          onError={() => { setError(true); setLoaded(true); }}
          style={{
            width: '100%', height: '100%',
            objectFit: 'cover',
            display: 'block',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
        />
      )}
    </div>
  );
};
