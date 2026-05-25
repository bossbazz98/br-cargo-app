import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { C, thaiFont, thaiFontHeading, STATUS_TONE } from '../../lib/brColors'
import { thaiFontSubheading } from '../../lib/brColors';
import BRIcon from './BRIcon';
import BRAppHeader from './BRAppHeader';
import { Pill, fmtDayMonth, BRImg} from './BRShared';

const StatusBadge = ({ value, customColor }) => {
  if (!value) return <span style={{ color: C.ink3 }}>-</span>;
  if (customColor) {
    return (
      <span style={{
        display: 'inline-flex', padding: '3px 9px', borderRadius: 99, fontSize: 11, fontWeight: 700,
        background: customColor + '22', color: customColor, border: `1px solid ${customColor}44`
      }}>{value}</span>);

  }
  const tone = STATUS_TONE[value] || 'neutral';
  return <Pill tone={tone}>{value}</Pill>;
};

const MonthPicker = ({ months, activeIdx, onPick, accent }) => {
  const scrollerRef = useRef(null);
  useEffect(() => {
    const el = scrollerRef.current?.querySelector(`[data-m-idx="${activeIdx}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [activeIdx]);

  return (
    <div ref={scrollerRef} style={{
      display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none',
      padding: '4px 20px 4px', WebkitOverflowScrolling: 'touch'
    }}>
      {months.map((m, i) => {
        const active = i === activeIdx;
        return (
          <button key={m.id} data-m-idx={i} onClick={() => onPick(i)} style={{
            flexShrink: 0, padding: '9px 16px', borderRadius: 99,
            background: active ? accent : C.card,
            color: active ? '#fff' : C.ink2,
            border: `1px solid ${active ? accent : C.line}`,
            fontFamily: thaiFont, fontSize: 13.5, fontWeight: active ? 800 : 600,
            cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.18s',
            boxShadow: active ? `0 4px 14px -4px ${accent}88` : 'none'
          }}>{m.month_label}</button>);

      })}
    </div>);

};

// ─── Status Stepper ────────────────────────────────────────
const SEA_STEPS = [
{ key: 'รอตัดรอบส่ง', label: 'รอตัดรอบส่ง', icon: 'box' },
{ key: 'อยู่ระหว่างขนส่ง', label: 'อยู่ระหว่างขนส่ง', icon: 'ship' },
{ key: 'เข้าโกดังไทยแล้ว', label: 'เข้าโกดังไทยแล้ว', icon: 'home' }];

const AIR_STEPS = [
{ key: 'รอตัดรอบส่ง', label: 'รอตัดรอบส่ง', icon: 'box' },
{ key: 'อยู่ระหว่างขนส่ง', label: 'อยู่ระหว่างขนส่ง', icon: 'plane' },
{ key: 'เข้าโกดังไทยแล้ว', label: 'เข้าโกดังไทยแล้ว', icon: 'home' }];


const StatusStepper = ({ status, mode }) => {
  const steps = mode === 'air' ? AIR_STEPS : SEA_STEPS;
  const accent = mode === 'air' ? C.primary : C.success;
  const activeIdx = steps.findIndex((s) => s.key === status);
  const isKnown = activeIdx >= 0;

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 0, flex: 1 }}>
      {steps.map((step, i) => {
        const active = isKnown && i === activeIdx;
        const done = isKnown && i < activeIdx;
        const circleColor = active ? accent : done ? accent + '22' : 'oklch(0.94 0.004 260)';
        const borderColor = active ? accent : done ? accent + '66' : 'oklch(0.82 0.006 260)';
        const iconColor = active ? '#fff' : done ? accent : 'oklch(0.68 0.006 260)';
        const labelColor = active ? accent : isKnown ? C.ink3 : 'oklch(0.68 0.006 260)';

        return (
          <div key={step.key} style={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: 3 }} className="my-1">
              <div style={{
                width: 28, height: 28, borderRadius: 99,
                background: circleColor,
                border: `1.5px solid ${borderColor}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s', flexShrink: 0
              }}>
                <BRIcon name={step.icon} size={13} color={iconColor} stroke={1.8} />
              </div>
              <div style={{ fontSize: 8, fontWeight: active ? 700 : 500, color: labelColor, textAlign: 'center', lineHeight: 1.2, fontFamily: thaiFont }}>{step.label}</div>
            </div>
            {i < steps.length - 1 &&
            <div style={{
              width: 10, marginTop: 13, flexShrink: 0,
              borderTop: `1.5px dashed ${done ? accent + '55' : 'oklch(0.84 0.006 260)'}`
            }} />
            }
          </div>);

      })}
    </div>);

};

const LotCard = ({ lot, index, mode, isOpen, onToggle }) => {
  const accent = mode === 'air' ? C.primary : C.success;
  const accentBg = mode === 'air' ? C.primarySoft : C.successSoft;
  const customColor = lot.status_color || null;
  const tone = STATUS_TONE[lot.status] || 'neutral';
  const toneBgMap = { primary: C.primarySoft, success: C.successSoft, warn: C.warnSoft, danger: C.dangerSoft, neutral: 'oklch(0.95 0 0)' };
  const toneFgMap = { primary: C.primaryDark, success: 'oklch(0.42 0.14 155)', warn: 'oklch(0.45 0.14 75)', danger: C.danger, neutral: C.ink3 };
  const toneBg = customColor ? customColor + '22' : toneBgMap[tone];
  const toneFg = customColor || toneFgMap[tone];

  return (
    <div style={{
      background: C.card, border: `1px solid ${isOpen ? accent : C.line}`,
      borderRadius: 16, overflow: 'hidden', transition: 'border-color 0.18s',
      boxShadow: isOpen ? `0 6px 24px -10px ${accent}66` : 'none'
    }}>
      <button onClick={onToggle} style={{
        width: '100%', padding: '14px 14px', background: 'transparent', border: 0, cursor: 'pointer',
        display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left', fontFamily: thaiFont
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ fontFamily: `'Inter', sans-serif`, fontSize: 10.5, fontWeight: 700, color: accent, padding: '3px 8px', borderRadius: 99, background: accentBg }}>LOT</div>
          <div style={{ fontFamily: `'Inter', sans-serif`, fontSize: isOpen ? 20 : 18, fontWeight: 900, color: C.ink, letterSpacing: -0.5, transition: 'font-size 0.18s' }}>{lot.lot || `L${index + 1}`}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 9.5, color: C.ink3, fontWeight: 600, letterSpacing: 0.6 }}>ETD</span>
              <span style={{ fontSize: 13, color: C.ink, fontWeight: 700 }}>{fmtDayMonth(lot.etd)}</span>
            </div>
            {lot.status &&
            <span style={{ padding: '2px 7px', borderRadius: 99, background: toneBg, color: toneFg, fontSize: 9, fontWeight: 700, whiteSpace: 'nowrap', display: 'inline-block', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis' }}>{lot.status}</span>
            }
          </div>
          {isOpen && <StatusStepper status={lot.status} mode={mode} />}
        </div>
      </button>
      {isOpen &&
      <div style={{ background: C.primarySofter, borderTop: `1px solid ${C.line}` }}>
          <div style={{ padding: '12px 14px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 14px' }}>
          {[
          { k: 'lot', label: 'LOT', sub: 'ล็อต' },
          { k: 'cut_off', label: 'Cut Off', sub: 'ตัดรอบ' },
          { k: 'etd', label: 'ETD', sub: 'วันออก' },
          { k: 'eta', label: 'ETA', sub: 'ถึงปลายทาง' }].
          map((f) =>
          <div key={f.k}>
              <div style={{ fontSize: 10, color: C.ink3, fontWeight: 600, letterSpacing: 0.5 }}>{f.label} · {f.sub}</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink }}>{lot[f.k] || '-'}</div>
            </div>
          )}
          <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 10, color: C.ink3, fontWeight: 600, letterSpacing: 0.5, flexShrink: 0 }}>STATUS · สถานะ</div>
            <StatusBadge value={lot.status} customColor={lot.status_color} />
          </div>
        </div>
        </div>
      }
    </div>);

};

const ScheduleScreen = ({ onNavigate }) => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('air');
  const [monthIdx, setMonthIdx] = useState(0);
  const [openLot, setOpenLot] = useState(null);

  // Android back button — go home without refresh
  useEffect(() => {
    window.history.pushState({ brBack: true }, '');
    const handler = () => { onNavigate && onNavigate('home'); };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  useEffect(() => {
    base44.entities.ShippingSchedule.list('created_at', 40).
    then((data) => setSchedules([...data].sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999)))).
    catch(() => {}).
    finally(() => setLoading(false));
  }, []);

  useEffect(() => {setOpenLot(null);}, [mode, monthIdx]);
  useEffect(() => {setMonthIdx(0);}, [mode]);

  const lotsKey = mode === 'air' ? 'air_lots' : 'sea_lots';
  const updatedKey = mode === 'air' ? 'air_updated_date' : 'sea_updated_date';
  const monthsForMode = schedules.filter((s) => (s[lotsKey] || []).length > 0);
  const clampedIdx = Math.min(monthIdx, Math.max(0, monthsForMode.length - 1));
  const current = monthsForMode[clampedIdx];
  const lots = current ? current[lotsKey] || [] : [];
  const accent = mode === 'air' ? C.primary : C.success;

  const tabs = [
  { id: 'air', label: 'แอร์', sub: 'AIR', icon: 'plane', accent: C.primary, bg: C.primarySoft },
  { id: 'sea', label: 'เรือ', sub: 'SEA', icon: 'ship', accent: C.success, bg: C.successSoft }];


  return (
    <div style={{ fontFamily: thaiFont, background: C.bg, minHeight: '100%' }}>
      <BRAppHeader title="ตารางรอบส่ง" subtitle="ข้อมูลรอบส่งทั้งหมด" back onBack={() => onNavigate && onNavigate('home')} />

      <div style={{ padding: '14px 20px 6px', display: 'flex', gap: 10 }}>
        {tabs.map((t) => {
          const active = mode === t.id;
          return (
            <button key={t.id} onClick={() => setMode(t.id)} style={{
              flex: 1, padding: '14px 14px', borderRadius: 16,
              background: active ? t.accent : C.card, border: `1.5px solid ${active ? t.accent : C.line}`,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontFamily: thaiFont,
              boxShadow: active ? `0 8px 22px -10px ${t.accent}88` : 'none', transition: 'all 0.2s'
            }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: active ? 'rgba(255,255,255,0.22)' : t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BRIcon name={t.icon} size={22} color={active ? '#fff' : t.accent} stroke={2.2} />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, fontFamily: thaiFontHeading, color: active ? '#fff' : C.ink }}>{t.label}</div>
                <div style={{ fontFamily: `'Inter', sans-serif`, fontSize: 10.5, fontWeight: 700, letterSpacing: 1, color: active ? 'rgba(255,255,255,0.85)' : C.ink3, marginTop: 2 }}>{t.sub} FREIGHT</div>
              </div>
            </button>);

        })}
      </div>

      {loading ?
      <div style={{ padding: '60px 0', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 28, height: 28, border: `3px solid ${C.line}`, borderTopColor: accent, borderRadius: '50%', animation: 'brSpin 0.8s linear infinite' }} />
          <style>{`@keyframes brSpin{to{transform:rotate(360deg)}}`}</style>
        </div> :
      monthsForMode.length === 0 ?
      <div style={{ textAlign: 'center', padding: '60px 20px', color: C.ink3 }}>ยังไม่มีข้อมูลรอบส่ง</div> :

      <>
          <div style={{ padding: '10px 0 4px' }}>
            <MonthPicker months={monthsForMode} activeIdx={clampedIdx} onPick={setMonthIdx} accent={accent} />
          </div>
          <div style={{ padding: '8px 20px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: 20, fontWeight: 800, fontFamily: thaiFontHeading, color: C.ink }}>{current?.month_label}</div>
              <span style={{ padding: '3px 9px', borderRadius: 99, background: mode === 'air' ? C.primarySoft : C.successSoft, color: accent, fontSize: 11, fontWeight: 700 }}>{lots.length} ล็อต</span>
            </div>
            {current?.[updatedKey] && <div style={{ fontSize: 11, color: C.ink3 }}>อัปเดต {current[updatedKey]}</div>}
          </div>
          <div style={{ padding: '6px 20px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Array.from({ length: Math.ceil(lots.length / 2) }, (_, rowIdx) => {
            const left = lots[rowIdx * 2];
            const right = lots[rowIdx * 2 + 1];
            const leftIdx = rowIdx * 2;
            const rightIdx = rowIdx * 2 + 1;
            const leftOpen = openLot === leftIdx;
            const rightOpen = right && openLot === rightIdx;
            // If either card in this row is open, show it full-width; keep the other as normal
            if (leftOpen) {
              return (
                <div key={rowIdx} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <LotCard lot={left} index={leftIdx} mode={mode} isOpen={true} onToggle={() => setOpenLot(null)} />
                    {right && <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}><div /><LotCard lot={right} index={rightIdx} mode={mode} isOpen={false} onToggle={() => setOpenLot(rightIdx)} /></div>}
                  </div>);

            }
            if (rightOpen) {
              return (
                <div key={rowIdx} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <LotCard lot={left} index={leftIdx} mode={mode} isOpen={false} onToggle={() => setOpenLot(leftIdx)} />
                      <div />
                    </div>
                    <LotCard lot={right} index={rightIdx} mode={mode} isOpen={true} onToggle={() => setOpenLot(null)} />
                  </div>);

            }
            return (
              <div key={rowIdx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <LotCard lot={left} index={leftIdx} mode={mode} isOpen={false} onToggle={() => setOpenLot(leftIdx)} />
                  {right && <LotCard lot={right} index={rightIdx} mode={mode} isOpen={false} onToggle={() => setOpenLot(rightIdx)} />}
                </div>);

          })}
          </div>
          <div style={{ padding: '0 20px 24px', textAlign: 'center', fontSize: 11, color: C.ink3, fontStyle: 'italic' }}>แตะล็อตเพื่อดูรายละเอียด</div>
        </>
      }
    </div>);

};

export default ScheduleScreen;