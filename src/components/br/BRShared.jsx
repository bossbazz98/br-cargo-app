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