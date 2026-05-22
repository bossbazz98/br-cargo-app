import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { C, thaiFont, thaiFontHeading, monoFont } from '../../lib/brColors';
import BRIcon from './BRIcon';
import { iconBtnStyle } from './BRShared';

// ─── Admin Atoms ───────────────────────────────────────────
const SectionHead = ({ title, sub, action }) => (
  <div style={{ padding: '18px 20px 4px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 18, fontWeight: 700, fontFamily: thaiFontHeading, color: C.ink }}>{title}</div>
      {sub && <div style={{ fontSize: 12, color: C.ink3, marginTop: 3, lineHeight: 1.4 }}>{sub}</div>}
    </div>
    {action}
  </div>
);

const PrimaryBtn = ({ icon, children, onClick, size = 'md', disabled, full, tone = 'primary', noIcon }) => {
  const grad = tone === 'danger' ? `linear-gradient(180deg, ${C.danger}, oklch(0.5 0.19 25))` : `linear-gradient(180deg, ${C.primary}, ${C.primaryDark})`;
  const showIcon = icon && !noIcon;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: size === 'sm' ? '7px 12px' : '10px 14px',
      background: disabled ? 'oklch(0.85 0.04 245)' : grad,
      border: 0, borderRadius: size === 'sm' ? 10 : 12, cursor: disabled ? 'not-allowed' : 'pointer', color: '#fff',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      fontFamily: thaiFont, fontSize: size === 'sm' ? 12 : 13, fontWeight: 700,
      boxShadow: disabled ? 'none' : `0 6px 14px -4px ${tone === 'danger' ? C.danger : C.primary}70`,
      flexShrink: 0, whiteSpace: 'nowrap', width: full ? '100%' : 'auto',
    }}>
      {showIcon && <BRIcon name={icon} size={size === 'sm' ? 13 : 15} color="#fff" stroke={2.3}/>}
      {children}
    </button>
  );
};

const GhostBtn = ({ icon, children, onClick, size = 'md' }) => (
  <button onClick={onClick} style={{
    padding: size === 'sm' ? '7px 12px' : '10px 14px',
    background: C.card, border: `1px solid ${C.line}`, borderRadius: size === 'sm' ? 10 : 12, cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    fontFamily: thaiFont, fontSize: size === 'sm' ? 12 : 13, fontWeight: 600, color: C.ink2,
  }}>
    {icon && <BRIcon name={icon} size={size === 'sm' ? 13 : 15} color={C.ink2} stroke={2}/>}
    {children}
  </button>
);

const IconBtnSq = ({ icon, tone = 'neutral', onClick }) => {
  const styles = { danger: { bg: C.dangerSoft, fg: C.danger }, primary: { bg: C.primarySoft, fg: C.primary }, neutral: { bg: 'transparent', fg: C.ink3 } }[tone];
  return (
    <button onClick={onClick} style={{ width: 32, height: 32, borderRadius: 9, background: styles.bg, border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <BRIcon name={icon} size={15} color={styles.fg} stroke={1.8}/>
    </button>
  );
};

const Toggle = ({ on, onChange }) => (
  <button onClick={() => onChange(!on)} style={{ width: 42, height: 24, borderRadius: 99, background: on ? C.success : 'oklch(0.88 0.008 260)', border: 0, cursor: 'pointer', padding: 0, position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
    <div style={{ position: 'absolute', top: 2, left: on ? 20 : 2, width: 20, height: 20, borderRadius: 99, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s' }}/>
  </button>
);

const inputStyle = { width: '100%', padding: '10px 12px', fontSize: 13.5, color: C.ink, fontFamily: thaiFont, background: C.card, border: `1.5px solid ${C.line}`, borderRadius: 10, outline: 'none', boxSizing: 'border-box' };

const Input = ({ label, value, onChange, placeholder, type = 'text' }) => (
  <div>
    {label && <div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink, marginBottom: 6 }}>{label}</div>}
    <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={inputStyle} onFocus={e => e.target.style.borderColor = C.primary} onBlur={e => e.target.style.borderColor = C.line}/>
  </div>
);

const Textarea = ({ label, value, onChange, placeholder, rows = 4 }) => (
  <div>
    {label && <div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink, marginBottom: 6 }}>{label}</div>}
    <textarea value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
      onFocus={e => e.target.style.borderColor = C.primary} onBlur={e => e.target.style.borderColor = C.line}/>
  </div>
);

const TAB_BAR_H = 65;

const Modal = ({ open, onClose, title, children }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(8,12,20,0.55)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(2px)',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: C.card, borderRadius: 18,
        width: 'calc(min(100vw, 430px) - 32px)',
        maxHeight: `calc(100dvh - ${TAB_BAR_H + 32}px - env(safe-area-inset-bottom, 0px))`,
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px -10px rgba(0,0,0,0.35)',
        overflow: 'hidden',
        marginBottom: `calc(${TAB_BAR_H}px + env(safe-area-inset-bottom, 0px))`,
      }}>
        {/* Header */}
        <div style={{ padding: '16px 18px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${C.line}`, flexShrink: 0, background: C.card }}>
          <div style={{ fontSize: 16, fontWeight: 700, fontFamily: thaiFontHeading, color: C.ink }}>{title}</div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 99, background: 'transparent', border: 0, cursor: 'pointer', fontSize: 16, color: C.ink3 }}>✕</button>
        </div>
        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '18px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {children}
        </div>
      </div>
    </div>
  );
};

const DeleteModal = ({ open, message, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div onClick={onCancel} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(8,12,20,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 16px', backdropFilter: 'blur(4px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.card, borderRadius: 20, width: '100%', maxWidth: 300, padding: '28px 24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, boxShadow: '0 20px 60px -10px rgba(0,0,0,0.4)' }}>
        <div style={{ width: 56, height: 56, borderRadius: 18, background: C.dangerSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BRIcon name="trash" size={26} color={C.danger} stroke={2}/>
        </div>
        <div style={{ fontSize: 22, fontWeight: 900, fontFamily: thaiFontHeading, color: C.ink, letterSpacing: 2 }}>DELETE</div>
        <div style={{ fontSize: 13.5, color: C.ink2, textAlign: 'center', lineHeight: 1.55 }}>{message || 'ต้องการลบรายการนี้?'}</div>
        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
          <button onClick={onCancel} style={{ flex: 1, padding: 13, borderRadius: 13, background: C.card, border: `1.5px solid ${C.line2}`, fontFamily: thaiFont, fontSize: 15, fontWeight: 800, color: C.ink2, cursor: 'pointer' }}>NO</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: 13, borderRadius: 13, background: `linear-gradient(180deg, ${C.danger}, oklch(0.5 0.19 25))`, border: 0, fontFamily: thaiFont, fontSize: 15, fontWeight: 800, color: '#fff', cursor: 'pointer', boxShadow: `0 6px 14px -4px ${C.danger}70` }}>YES</button>
        </div>
      </div>
    </div>
  );
};

const UploadBox = ({ label, value, onChange, height = 130 }) => {
  const fileRef = React.useRef();
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState('');
  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      onChange(result.file_url);
    } catch (e) {
      console.error('Upload failed:', e);
      setError('อัปโหลดไม่สำเร็จ: ' + (e?.message || 'กรุณาลองใหม่'));
    }
    setUploading(false);
  };
  return (
    <div>
      {label && <div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink, marginBottom: 6 }}>{label}</div>}
      <div onClick={() => !uploading && fileRef.current?.click()} style={{ height, borderRadius: 12, cursor: uploading ? 'default' : 'pointer', border: `2px dashed ${error ? C.danger : C.line2}`, background: C.primarySofter, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, color: C.ink3, fontSize: 12, position: 'relative', overflow: 'hidden' }}>
        {uploading ? (
          <>
            <div style={{ width: 24, height: 24, border: `3px solid ${C.line}`, borderTopColor: C.primary, borderRadius: '50%', animation: 'brSpin 0.8s linear infinite' }}/>
            <span>กำลังอัปโหลด...</span>
          </>
        ) : value ? (
          <>
            <img src={value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
            <button onClick={(e) => { e.stopPropagation(); onChange(''); }} style={{ position: 'absolute', top: 8, right: 8, width: 26, height: 26, borderRadius: 99, background: 'rgba(255,255,255,0.95)', border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BRIcon name="trash" size={12} color={C.danger}/>
            </button>
          </>
        ) : (
          <>
            <BRIcon name="upload" size={20} color={C.ink3} stroke={2}/>
            <span>อัปโหลดรูปภาพ</span>
            {error && <span style={{ color: C.danger, fontSize: 11, textAlign: 'center', padding: '0 8px' }}>{error}</span>}
          </>
        )}
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files?.[0])}/>
      </div>
    </div>
  );
};

// ─── Schedule Manager ──────────────────────────────────────
const STATUS_OPTIONS = [
  { label: 'รอตัดรอบส่ง', color: '#6b7280' },
  { label: 'อยู่ระหว่างขนส่ง', color: '#3b82f6' },
  { label: 'เข้าโกดังไทยแล้ว', color: '#10b981' },
  { label: 'อยู่ระหว่างผ่านศุลกากร', color: '#f59e0b' },
  { label: 'ผ่านศุลกากรแล้ว', color: '#22c55e' },
];
const emptyLot = () => ({ lot: '', cut_off: '', etd: '', eta: '', status: '' });

const cellInput = { width: '100%', padding: '6px 6px', fontSize: 11, fontFamily: thaiFont, background: 'transparent', border: 0, outline: 'none', color: C.ink, minWidth: 60, boxSizing: 'border-box' };

// Custom status picker with add-custom option
const StatusPicker = ({ value, statusColor, customOptions, onChange }) => {
  const [open, setOpen] = useState(false);
  const [customText, setCustomText] = useState('');
  const [customColor, setCustomColor] = useState('#6b7280');
  const ref = useRef();

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const allOptions = [
    ...STATUS_OPTIONS,
    ...(customOptions || []).filter(c => !STATUS_OPTIONS.find(s => s.label === c.label)),
  ];
  const selected = allOptions.find(s => s.label === value) || (value ? { label: value, color: statusColor || '#6b7280' } : null);

  const addCustom = () => {
    if (!customText.trim()) return;
    onChange(customText.trim(), customColor);
    setCustomText('');
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: 'relative', minWidth: 130 }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', padding: '6px 9px', borderRadius: 9, border: `1.5px solid ${selected ? selected.color : C.line}`,
        background: selected ? selected.color + '18' : C.card, cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 6, fontFamily: thaiFont,
      }}>
        {selected
          ? <><span style={{ width: 9, height: 9, borderRadius: 99, background: selected.color, flexShrink: 0 }}/><span style={{ fontSize: 11, fontWeight: 700, color: selected.color, flex: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selected.label}</span></>
          : <span style={{ fontSize: 11, color: C.ink3, flex: 1, textAlign: 'left' }}>-- เลือก --</span>
        }
        <BRIcon name="chevR" size={10} color={selected?.color || C.ink3} stroke={2}/>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '110%', left: 0, zIndex: 300, minWidth: 210,
          background: '#fff', border: `1px solid ${C.line}`, borderRadius: 14,
          boxShadow: '0 10px 32px -8px rgba(0,0,0,0.20)', padding: 8,
          display: 'flex', flexDirection: 'column', gap: 2,
        }}>
          <button onClick={() => { onChange('', ''); setOpen(false); }} style={{
            padding: '6px 10px', borderRadius: 8, border: 0, background: 'transparent',
            textAlign: 'left', cursor: 'pointer', fontFamily: thaiFont, fontSize: 11, color: C.ink3,
          }}>— ล้างสถานะ —</button>
          {allOptions.map(s => (
            <button key={s.label} onClick={() => { onChange(s.label, s.color); setOpen(false); }} style={{
              padding: '8px 10px', borderRadius: 8, border: 0, cursor: 'pointer',
              background: value === s.label ? s.color + '18' : 'transparent',
              display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left', fontFamily: thaiFont,
            }}>
              <span style={{ width: 10, height: 10, borderRadius: 99, background: s.color, flexShrink: 0 }}/>
              <span style={{ fontSize: 12, fontWeight: value === s.label ? 700 : 500, color: value === s.label ? s.color : C.ink, flex: 1 }}>{s.label}</span>
              {value === s.label && <BRIcon name="check" size={12} color={s.color} stroke={2.5}/>}
            </button>
          ))}
          {/* Add custom status */}
          <div style={{ marginTop: 4, borderTop: `1px solid ${C.line}`, paddingTop: 6 }}>
            <div style={{ fontSize: 10, color: C.ink3, fontWeight: 600, marginBottom: 4, paddingLeft: 4 }}>เพิ่มสถานะใหม่</div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input
                value={customText} onChange={e => setCustomText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustom()}
                placeholder="ข้อความสถานะ..."
                style={{ flex: 1, padding: '6px 8px', fontSize: 11, fontFamily: thaiFont, border: `1.5px solid ${C.line}`, borderRadius: 8, outline: 'none', color: C.ink, background: C.bg }}
              />
              <input type="color" value={customColor} onChange={e => setCustomColor(e.target.value)}
                style={{ width: 28, height: 28, padding: 1, border: `2px solid ${customColor}`, borderRadius: 7, cursor: 'pointer', background: 'transparent', flexShrink: 0 }}/>
              <button onClick={addCustom} style={{
                width: 28, height: 28, borderRadius: 8, background: C.primarySoft, border: 0, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <BRIcon name="plus" size={14} color={C.primary} stroke={2.5}/>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Lot edit modal
const LotEditModal = ({ open, lot, onClose, onSave, onDelete }) => {
  const [row, setRow] = useState({ ...lot });
  useEffect(() => { setRow({ ...lot }); }, [lot]);
  const set = (k, v) => setRow(r => ({ ...r, [k]: v }));

  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title={`แก้ไข LOT: ${lot.lot || '-'}`}>
      <Input label="LOT" value={row.lot} onChange={v => set('lot', v)} placeholder="LOT"/>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Input label="ตัดรอบ (Cut Off)" type="date" value={row.cut_off} onChange={v => set('cut_off', v)}/>
        <Input label="ETD" type="date" value={row.etd} onChange={v => set('etd', v)}/>
      </div>
      <Input label="ETA" value={row.eta} onChange={v => set('eta', v)} placeholder="-"/>
      <div>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink, marginBottom: 6 }}>STATUS</div>
        <StatusPicker value={row.status || ''} statusColor={row.status_color} onChange={(label, clr) => { set('status', label); set('status_color', clr); }}/>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <PrimaryBtn full noIcon={true} onClick={() => onSave(row)}>บันทึก</PrimaryBtn>
        <button onClick={onDelete} style={{ width: 44, height: 44, borderRadius: 12, background: C.dangerSoft, border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <BRIcon name="trash" size={16} color={C.danger} stroke={2}/>
        </button>
      </div>
    </Modal>
  );
};

const LotsEditor = ({ label, iconName, color, lots, saving, onSave }) => {
  const [rows, setRows] = useState(lots.map(l => ({ ...l })));
  const [editIdx, setEditIdx] = useState(null);
  useEffect(() => { setRows(lots.map(l => ({ ...l }))); }, [lots]);

  const addRow = () => {
    const newRows = [...rows, emptyLot()];
    setRows(newRows);
    setEditIdx(newRows.length - 1);
  };
  const saveEdit = (updated) => {
    const newRows = rows.map((r, i) => i === editIdx ? updated : r);
    setRows(newRows);
    setEditIdx(null);
    onSave(newRows);
  };
  const deleteEdit = () => {
    const newRows = rows.filter((_, i) => i !== editIdx);
    setRows(newRows);
    setEditIdx(null);
    onSave(newRows);
  };

  const accentBg = color === C.primary ? C.primarySoft : C.successSoft;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BRIcon name={iconName} size={15} color={color} stroke={2}/>
          <span style={{ fontFamily: `'Inter', sans-serif`, fontSize: 12, fontWeight: 800, letterSpacing: 1, color }}>{label}</span>
        </div>
        <GhostBtn icon="plus" size="sm" onClick={addRow}>เพิ่มรอบ</GhostBtn>
      </div>

      {editIdx !== null && rows[editIdx] && (
        <LotEditModal
          open={true}
          lot={rows[editIdx]}
          onClose={() => setEditIdx(null)}
          onSave={saveEdit}
          onDelete={deleteEdit}
        />
      )}

      {rows.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '18px 0', fontSize: 11.5, color: C.ink3, border: `1px dashed ${C.line2}`, borderRadius: 10 }}>ยังไม่มีข้อมูล — กด "เพิ่มรอบ"</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {rows.map((row, i) => {
            const sc = row.status_color;
            return (
              <button key={i} onClick={() => setEditIdx(i)} style={{
                background: C.card, border: `1.5px solid ${C.line}`, borderRadius: 12, padding: '10px 10px 10px',
                cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 6, fontFamily: thaiFont,
                overflow: 'hidden', minWidth: 0, width: '100%',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ padding: '2px 7px', borderRadius: 99, background: accentBg, color, fontSize: 9, fontWeight: 800, letterSpacing: 0.5 }}>LOT</span>
                  <BRIcon name="edit" size={11} color={C.ink3} stroke={2}/>
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, fontFamily: thaiFontHeading, color: C.ink, letterSpacing: -0.5 }}>{row.lot || '—'}</div>
                {row.status && (
                  <span style={{ fontSize: 9.5, fontWeight: 700, color: sc || C.ink3, background: sc ? sc + '18' : C.bg, padding: '2px 7px', borderRadius: 99, border: `1px solid ${sc ? sc + '44' : C.line}`, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                    {row.status}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const ScheduleManager = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newMonth, setNewMonth] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetFile, setSheetFile] = useState(null);
  const [sheetLoading, setSheetLoading] = useState(false);
  const [sheetMsg, setSheetMsg] = useState('');
  const [sheetTargetId, setSheetTargetId] = useState('');
  const [sheetMode, setSheetMode] = useState('air'); // 'air' | 'sea'
  const sheetFileRef = React.useRef();

  const load = () => {
    setLoading(true);
    base44.entities.ShippingSchedule.list('created_at', 50)
      .then(data => setSchedules([...data].sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999))))
      .catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleCreate = async () => {
    if (!newMonth.trim()) return;
    await base44.entities.ShippingSchedule.create({ month_label: newMonth.trim(), year: new Date().getFullYear(), month: new Date().getMonth() + 1, air_lots: [], sea_lots: [] });
    setNewMonth(''); setAddOpen(false); load();
  };
  const saveLots = async (schedule, field, lots) => {
    const key = schedule.id + field;
    setSaving(s => ({ ...s, [key]: true }));
    const today = new Date().toLocaleDateString('th-TH');
    const patch = { [field]: lots };
    if (field === 'air_lots') patch.air_updated_date = today;
    if (field === 'sea_lots') patch.sea_updated_date = today;
    try {
      await base44.entities.ShippingSchedule.update(schedule.id, patch);
      load();
    } catch(e) { alert('บันทึกไม่สำเร็จ: ' + (e?.message || 'กรุณาลองใหม่')); }
    setSaving(s => ({ ...s, [key]: false }));
  };

  const importFromSheet = async () => {
    if (!sheetFile || !sheetTargetId) return;
    setSheetLoading(true);
    setSheetMsg('');
    try {
      const text = await sheetFile.text();
      const rows = text.trim().split('\n').map(r => r.split(',').map(c => c.replace(/^"|"$/g, '').trim()));
      if (rows.length < 2) throw new Error('ไม่พบข้อมูลในชีต');
      const header = rows[0].map(h => h.toLowerCase());
      const lotIdx = header.findIndex(h => h.includes('lot'));
      const cutIdx = header.findIndex(h => h.includes('cut') || h.includes('ตัดรอบ'));
      const etdIdx = header.findIndex(h => h.includes('etd'));
      const etaIdx = header.findIndex(h => h.includes('eta'));
      const statusIdx = header.findIndex(h => h.includes('status') || h.includes('สถานะ'));
      const lots = rows.slice(1).filter(r => r.some(c => c)).map(r => ({
        lot: lotIdx >= 0 ? r[lotIdx] : '',
        cut_off: cutIdx >= 0 ? r[cutIdx] : '',
        etd: etdIdx >= 0 ? r[etdIdx] : '',
        eta: etaIdx >= 0 ? r[etaIdx] : '',
        status: statusIdx >= 0 ? r[statusIdx] : '',
      }));
      const today = new Date().toLocaleDateString('th-TH');
      const field = sheetMode === 'air' ? 'air_lots' : 'sea_lots';
      const dateField = sheetMode === 'air' ? 'air_updated_date' : 'sea_updated_date';
      await base44.entities.ShippingSchedule.update(sheetTargetId, {
        [field]: lots,
        [dateField]: today,
      });
      setSheetMsg(`✅ นำเข้าสำเร็จ ${lots.length} รายการ (${sheetMode === 'air' ? 'AIR FREIGHT' : 'SEA FREIGHT'})`);
      setSheetFile(null);
      load();
    } catch (e) {
      setSheetMsg(`❌ ${e.message}`);
    }
    setSheetLoading(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <DeleteModal open={deleteTarget !== null} message="ต้องการลบตารางรอบส่งเดือนนี้?" onConfirm={async () => { await base44.entities.ShippingSchedule.delete(deleteTarget); setDeleteTarget(null); load(); }} onCancel={() => setDeleteTarget(null)}/>
      <SectionHead title="จัดการตารางรอบส่ง" sub="Air และ Sea Freight" action={
        <div style={{ display: 'flex', gap: 6 }}>
          <GhostBtn icon="doc" size="sm" onClick={() => setSheetOpen(true)}>นำเข้า CSV</GhostBtn>
          <PrimaryBtn icon="plus" size="sm" onClick={() => setAddOpen(true)}>เพิ่มเดือนใหม่</PrimaryBtn>
        </div>
      }/>
      <div style={{ padding: '6px 20px 12px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: C.ink3 }}>กำลังโหลด...</div>
        ) : schedules.map(s => (
          <div key={s.id} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 16, padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, fontFamily: thaiFontHeading, color: C.ink }}>{s.month_label}</h4>
              <IconBtnSq icon="trash" tone="danger" onClick={() => setDeleteTarget(s.id)}/>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <LotsEditor label="AIR FREIGHT" iconName="plane" color={C.primary} lots={s.air_lots || []} saving={saving[s.id + 'air_lots']} onSave={(lots) => saveLots(s, 'air_lots', lots)}/>
              <LotsEditor label="SEA FREIGHT" iconName="ship" color={C.success} lots={s.sea_lots || []} saving={saving[s.id + 'sea_lots']} onSave={(lots) => saveLots(s, 'sea_lots', lots)}/>
            </div>
          </div>
        ))}
      </div>
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="เพิ่มตารางรอบส่ง">
        <Input label="ชื่อเดือน (เช่น ตุลาคม 2566)" value={newMonth} onChange={setNewMonth} placeholder="ตุลาคม 2566"/>
        <PrimaryBtn full disabled={!newMonth.trim()} onClick={handleCreate}>สร้าง</PrimaryBtn>
      </Modal>
      <Modal open={sheetOpen} onClose={() => { setSheetOpen(false); setSheetMsg(''); setSheetFile(null); }} title="นำเข้าไฟล์ CSV">
        <div style={{ fontSize: 12, color: C.ink3, lineHeight: 1.6 }}>
          อัปโหลดไฟล์ CSV<br/>
          คอลัมน์ที่รองรับ: <b>lot, cut_off/ตัดรอบ, etd, eta, status</b>
        </div>
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink, marginBottom: 6 }}>เลือกเดือนที่จะนำเข้าข้อมูล</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {schedules.map(s => (
              <button key={s.id} onClick={() => setSheetTargetId(s.id)} style={{
                padding: '6px 12px', borderRadius: 9, border: `1.5px solid ${sheetTargetId === s.id ? C.primary : C.line}`,
                background: sheetTargetId === s.id ? C.primarySoft : C.card,
                color: sheetTargetId === s.id ? C.primary : C.ink2,
                fontFamily: thaiFont, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}>{s.month_label}</button>
            ))}
          </div>
          {schedules.length === 0 && <div style={{ fontSize: 12, color: C.ink3, marginTop: 4 }}>กรุณาเพิ่มเดือนก่อนนำเข้าข้อมูล</div>}
        </div>
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink, marginBottom: 6 }}>ประเภทการขนส่ง</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[{ id: 'air', label: 'AIR FREIGHT', icon: 'plane', color: C.primary, bg: C.primarySoft }, { id: 'sea', label: 'SEA FREIGHT', icon: 'ship', color: C.success, bg: C.successSoft }].map(t => (
              <button key={t.id} onClick={() => setSheetMode(t.id)} style={{
                flex: 1, padding: '10px 8px', borderRadius: 10, border: `1.5px solid ${sheetMode === t.id ? t.color : C.line}`,
                background: sheetMode === t.id ? t.bg : C.card, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6, fontFamily: thaiFont,
              }}>
                <BRIcon name={t.icon} size={14} color={sheetMode === t.id ? t.color : C.ink3} stroke={2}/>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: sheetMode === t.id ? t.color : C.ink2 }}>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink, marginBottom: 6 }}>ไฟล์ CSV</div>
          <input ref={sheetFileRef} type="file" accept=".csv,text/csv" style={{ display: 'none' }} onChange={e => setSheetFile(e.target.files?.[0] || null)}/>
          <div onClick={() => sheetFileRef.current?.click()} style={{
            padding: '14px 16px', borderRadius: 12, border: `2px dashed ${sheetFile ? C.primary : C.line2}`,
            background: sheetFile ? C.primarySofter : C.card, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 10, color: sheetFile ? C.primary : C.ink3,
          }}>
            <BRIcon name="doc" size={18} color={sheetFile ? C.primary : C.ink3} stroke={2}/>
            <span style={{ fontFamily: thaiFont, fontSize: 13, fontWeight: 600 }}>
              {sheetFile ? sheetFile.name : 'แตะเพื่อเลือกไฟล์ CSV'}
            </span>
            {sheetFile && <button onClick={e => { e.stopPropagation(); setSheetFile(null); }} style={{ marginLeft: 'auto', background: 'none', border: 0, cursor: 'pointer', color: C.ink3, fontSize: 16 }}>✕</button>}
          </div>
        </div>
        {sheetMsg && <div style={{ fontSize: 13, color: sheetMsg.startsWith('✅') ? C.success : C.danger, fontWeight: 600 }}>{sheetMsg}</div>}
        <PrimaryBtn full icon="doc" disabled={sheetLoading || !sheetFile || !sheetTargetId || !sheetMode} onClick={importFromSheet}>
          {sheetLoading ? 'กำลังนำเข้า...' : 'นำเข้าข้อมูล'}
        </PrimaryBtn>
      </Modal>
    </div>
  );
};

// ─── แจ้งเตือน Tab ──────────────────────────────────────
const ICON_LIST = ['megaphone','bell','warn','info','box','plane','ship','truck','shield','check','sparkle','globe','mail','calendar','doc'];

const AnnounceTab = () => {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const BLANK = { title: '', message: '', icon_kind: 'icon', emoji: '📢', icon_name: 'megaphone', tone: 'primary' };
  const [form, setForm] = useState(BLANK);

  const load = () => base44.entities.Announcement.filter({}, '-created_at', 50).then(setItems).catch(() => {});
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.title.trim() && !form.message.trim()) return;
    try {
      await base44.entities.Announcement.create({ ...form, is_active: true });
      try { await base44.entities.Notification.create({ title: form.title, message: form.message, type: 'announcement', is_read: false, icon_kind: form.icon_kind, emoji: form.emoji, icon_name: form.icon_name, tone: form.tone }); } catch {}
      setForm(BLANK); setOpen(false); load();
    } catch(e) { alert('บันทึกไม่สำเร็จ: ' + (e?.message || 'กรุณาลองใหม่')); }
  };
  const toggle = async (a) => {
    try { await base44.entities.Announcement.update(a.id, { is_active: !a.is_active }); load(); }
    catch(e) { alert('อัปเดตไม่สำเร็จ: ' + (e?.message || '')); }
  };

  const TONES = [
    { id: 'primary', label: 'น้ำเงิน', color: C.primary, bg: C.primarySoft },
    { id: 'success', label: 'เขียว', color: C.success, bg: C.successSoft },
    { id: 'warn', label: 'ส้ม', color: C.warn, bg: C.warnSoft },
    { id: 'danger', label: 'แดง', color: C.danger, bg: C.dangerSoft },
  ];
  const activeTone = TONES.find(t => t.id === form.tone) || TONES[0];

  return (
    <div style={{ position: 'relative' }}>
      <DeleteModal open={deleteTarget !== null} message="ต้องการลบแจ้งเตือนนี้?" onConfirm={async () => { await base44.entities.Announcement.delete(deleteTarget); setDeleteTarget(null); load(); }} onCancel={() => setDeleteTarget(null)}/>
      <SectionHead title="จัดการแจ้งเตือน" sub="เปิด/ปิดแจ้งเตือน" action={<PrimaryBtn icon="plus" onClick={() => setOpen(true)}>เพิ่มแจ้งเตือน</PrimaryBtn>}/>
      <div style={{ padding: '12px 20px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map(i => (
          <div key={i.id} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 16, padding: '14px 14px', display: 'flex', gap: 12, alignItems: 'center', opacity: i.is_active ? 1 : 0.55 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: C.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
              {i.icon_kind === 'icon' ? <BRIcon name={i.icon_name || 'megaphone'} size={20} color={C.primary} stroke={2}/> : <span>{i.emoji || '📢'}</span>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: C.ink }}>{i.title}</div>
              <div style={{ fontSize: 12.5, color: C.ink2, marginTop: 3 }}>{i.message}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Toggle on={i.is_active} onChange={() => toggle(i)}/>
              <IconBtnSq icon="trash" tone="danger" onClick={() => setDeleteTarget(i.id)}/>
            </div>
          </div>
        ))}
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="เพิ่มแจ้งเตือนใหม่">
        <Input label="หัวข้อ" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} placeholder="หัวข้อแจ้งเตือน"/>
        <Textarea label="ข้อความ" value={form.message} onChange={v => setForm(f => ({ ...f, message: v }))} placeholder="รายละเอียด" rows={3}/>

        {/* Icon picker */}
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink, marginBottom: 8 }}>ไอคอน</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {ICON_LIST.map(ic => (
              <button key={ic} onClick={() => setForm(f => ({ ...f, icon_name: ic, icon_kind: 'icon' }))} style={{
                width: 38, height: 38, borderRadius: 10, cursor: 'pointer',
                background: form.icon_name===ic ? C.primarySoft : C.card,
                border: `1.5px solid ${form.icon_name===ic ? C.primary : C.line}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <BRIcon name={ic} size={18} color={form.icon_name===ic ? C.primary : C.ink3} stroke={2}/>
              </button>
            ))}
          </div>
          <div style={{ marginTop: 10, padding: '10px 12px', borderRadius: 10, background: activeTone.bg, border: `1px solid ${activeTone.color}33`, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: C.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BRIcon name={form.icon_name||'megaphone'} size={16} color={activeTone.color} stroke={2}/>
            </div>
            <div style={{ fontSize: 12, color: C.ink2 }}>ตัวอย่างไอคอน</div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, color: C.ink3, fontWeight: 600, marginBottom: 6 }}>โทนสี</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {TONES.map(t => {
              const active = form.tone === t.id;
              return (
                <button key={t.id} onClick={() => setForm(f => ({ ...f, tone: t.id }))} style={{ flex: 1, padding: '10px 8px', borderRadius: 10, background: active ? t.bg : C.card, border: `1.5px solid ${active ? t.color : C.line}`, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 16, height: 16, borderRadius: 99, background: t.color }}/>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: active ? t.color : C.ink3, fontFamily: thaiFont }}>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        <PrimaryBtn full onClick={create}>สร้างแจ้งเตือน</PrimaryBtn>
      </Modal>
    </div>
  );
};

// ─── Gallery Tab ───────────────────────────────────────────
const GalleryTab = () => {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = React.useState(false);
  const fileRef = React.useRef();
  const MAX = 20;
  const load = () => base44.entities.GalleryImage.list('order', 50).then(setImages).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleFiles = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    const toAdd = Array.from(files).slice(0, MAX - images.length);
    try {
      for (const file of toAdd) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        await base44.entities.GalleryImage.create({ image_url: file_url, caption: file.name });
      }
      load();
    } catch(e) { alert('อัปโหลดไม่สำเร็จ: ' + (e?.message || 'กรุณาลองใหม่')); }
    setUploading(false);
  };
  const [deleteTarget, setDeleteTarget] = useState(null);

  return (
    <div style={{ position: 'relative' }}>
      <DeleteModal open={deleteTarget !== null} message="ต้องการลบรูปภาพนี้?" onConfirm={async () => { await base44.entities.GalleryImage.delete(deleteTarget); setDeleteTarget(null); load(); }} onCancel={() => setDeleteTarget(null)}/>
      <SectionHead title="จัดการแกลลอรี่" sub={`${images.length} / ${MAX} ภาพ`} action={<PrimaryBtn icon="upload" disabled={uploading} onClick={() => fileRef.current?.click()}>{uploading ? 'กำลังอัปโหลด...' : 'อัปโหลดรูป'}</PrimaryBtn>}/>
      <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)}/>
      <div style={{ padding: '12px 20px 12px' }}>
        {images.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 20px', background: C.card, border: `1px dashed ${C.line2}`, borderRadius: 14, color: C.ink3 }}>ยังไม่มีรูปภาพ</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {images.map((img, i) => (
              <div key={img.id} style={{ position: 'relative', width: '100%', paddingBottom: '100%' }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: 12, overflow: 'hidden' }}>
                  {img.image_url ? <img src={img.image_url} alt={img.caption} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/> : <div style={{ width: '100%', height: '100%', background: C.primarySoft }}/>}
                </div>
                <button onClick={() => setDeleteTarget(img.id)} style={{ position: 'absolute', top: 6, right: 6, width: 28, height: 28, borderRadius: 99, background: 'rgba(255,255,255,0.95)', border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                  <BRIcon name="trash" size={13} color={C.danger} stroke={2}/>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── No Code Admin Tab ─────────────────────────────────────
const NoCodeAdminTab = () => {
  const [page, setPage] = useState({ heading: 'ตามหาเจ้าของ', subheading: '', verify_url: '' });
  const [pageId, setPageId] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [saving, setSaving] = useState(false);
  const [editBlock, setEditBlock] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => {
    base44.entities.NoCodePage.list().then(list => {
      if (list[0]) { setPage(list[0]); setPageId(list[0].id); }
    }).catch(() => {});
    base44.entities.NoCodeBlock.list('order', 50).then(b => setBlocks([...b].sort((a, b) => (a.order || 0) - (b.order || 0)))).catch(() => {});
  };
  useEffect(load, []);

  const savePage = async () => {
    setSaving(true);
    try {
      if (pageId) await base44.entities.NoCodePage.update(pageId, page);
      else { const r = await base44.entities.NoCodePage.create(page); setPageId(r.id); }
      alert('บันทึกสำเร็จ ✓');
    } catch(e) { alert('บันทึกไม่สำเร็จ: ' + (e?.message || 'กรุณาลองใหม่')); }
    setSaving(false);
  };

  const saveBlock = async (data) => {
    try {
      if (data.id) await base44.entities.NoCodeBlock.update(data.id, data);
      else await base44.entities.NoCodeBlock.create({ ...data, order: blocks.length });
      setEditBlock(null); load();
    } catch(e) { alert('บันทึกไม่สำเร็จ: ' + (e?.message || 'กรุณาลองใหม่')); }
  };

  const BLANK_BLOCK = { image1_url: '', image2_url: '', caption: '', verify_url: '', order: 0 };

  return (
    <div style={{ position: 'relative' }}>
      <DeleteModal open={deleteTarget !== null} message="ต้องการลบบล็อคนี้?" onConfirm={async () => { await base44.entities.NoCodeBlock.delete(deleteTarget); setDeleteTarget(null); load(); }} onCancel={() => setDeleteTarget(null)}/>
      <SectionHead title="จัดการหน้า No Code" sub="ตามหาเจ้าของพัสดุ" action={<PrimaryBtn icon="plus" size="sm" onClick={() => setEditBlock(BLANK_BLOCK)}>เพิ่มบล็อค</PrimaryBtn>}/>
      <div style={{ padding: '10px 20px 12px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Page settings */}
        <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>ตั้งค่าหน้า</div>
          <Input label="หัวข้อหน้า" value={page.heading} onChange={v => setPage(p => ({ ...p, heading: v }))} placeholder="ตามหาเจ้าของ"/>
          <Textarea label="คำอธิบาย" value={page.subheading} onChange={v => setPage(p => ({ ...p, subheading: v }))} placeholder="ข้อความแสดงในหน้า..." rows={3}/>
          <Input label="ลิ้งค์ปุ่มยืนยัน" value={page.verify_url} onChange={v => setPage(p => ({ ...p, verify_url: v }))} placeholder="https://..."/>
          <PrimaryBtn noIcon={true} disabled={saving} onClick={savePage}>{saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}</PrimaryBtn>
        </div>
        {/* Blocks list */}
        {blocks.map((b, i) => (
          <div key={b.id} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
              {[b.image1_url, b.image2_url].map((img, j) => (
                <div key={j} style={{ aspectRatio: '1/1', borderRadius: 10, overflow: 'hidden', background: C.primarySoft }}>
                  {img && <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>}
                </div>
              ))}
            </div>
            {b.caption && <div style={{ fontSize: 12.5, color: C.ink2, marginBottom: 8, textAlign: 'center' }}>{b.caption}</div>}
            <div style={{ display: 'flex', gap: 6 }}>
              <GhostBtn icon="edit" size="sm" onClick={() => setEditBlock({ ...b })}>แก้ไข</GhostBtn>
              <button onClick={() => setDeleteTarget(b.id)} style={{ width: 32, height: 32, borderRadius: 8, background: C.dangerSoft, border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BRIcon name="trash" size={13} color={C.danger}/>
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* Edit block modal */}
      {editBlock && (
        <Modal open={true} onClose={() => setEditBlock(null)} title={editBlock.id ? 'แก้ไขบล็อค' : 'เพิ่มบล็อคใหม่'}>
          <UploadBox label="รูปภาพ 1" value={editBlock.image1_url} onChange={v => setEditBlock(b => ({ ...b, image1_url: v }))} height={140}/>
          <UploadBox label="รูปภาพ 2 (ไม่บังคับ)" value={editBlock.image2_url} onChange={v => setEditBlock(b => ({ ...b, image2_url: v }))} height={140}/>
          <Input label="ข้อความใต้รูป (Caption)" value={editBlock.caption} onChange={v => setEditBlock(b => ({ ...b, caption: v }))} placeholder="เช่น รหัสพัสดุ, ชื่อผู้รับ"/>
          <Input label="ลิ้งค์ (ไม่บังคับ)" value={editBlock.verify_url} onChange={v => setEditBlock(b => ({ ...b, verify_url: v }))} placeholder="https://..."/>
          <PrimaryBtn full noIcon={true} onClick={() => saveBlock(editBlock)}>บันทึก</PrimaryBtn>
        </Modal>
      )}
    </div>
  );
};

// ─── Reorder helper ────────────────────────────────────────
const ReorderableList = ({ items, onReorder, renderItem }) => {
  const moveUp = (i) => { if (i === 0) return; const a = [...items]; [a[i-1], a[i]] = [a[i], a[i-1]]; onReorder(a); };
  const moveDown = (i) => { if (i === items.length-1) return; const a = [...items]; [a[i], a[i+1]] = [a[i+1], a[i]]; onReorder(a); };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map((item, i) => (
        <div key={item.id || i} style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, justifyContent: 'center' }}>
            <button onClick={() => moveUp(i)} disabled={i === 0} style={{ width: 26, height: 26, borderRadius: 7, border: `1px solid ${C.line}`, background: C.card, cursor: i===0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: i===0 ? 0.3 : 1 }}>
              <BRIcon name="chevU" size={13} color={C.ink2} stroke={2}/>
            </button>
            <button onClick={() => moveDown(i)} disabled={i === items.length-1} style={{ width: 26, height: 26, borderRadius: 7, border: `1px solid ${C.line}`, background: C.card, cursor: i===items.length-1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: i===items.length-1 ? 0.3 : 1 }}>
              <BRIcon name="chevD" size={13} color={C.ink2} stroke={2}/>
            </button>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>{renderItem(item, i)}</div>
        </div>
      ))}
    </div>
  );
};

// ─── Details Admin Tab ─────────────────────────────────────
const DetailsAdminTab = () => {
  const [items, setItems] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const BLANK = { title: '', excerpt: '', body: '', image_url: '', aspect_ratio: 'full', is_hot: false, kind: 'text', order: 0 };

  const load = () => { base44.entities.DetailContent.list('order', 100).then(b => setItems([...b].sort((a,b) => (a.order||0)-(b.order||0)))).catch(() => {}); };
  useEffect(() => { load(); }, []);

  const save = async (data) => {
    try {
      if (data.id) await base44.entities.DetailContent.update(data.id, data);
      else await base44.entities.DetailContent.create({ ...data, order: items.length });
      setEditItem(null); load();
    } catch(e) { alert('บันทึกไม่สำเร็จ: ' + (e?.message || 'กรุณาลองใหม่')); }
  };

  const handleReorder = async (newItems) => {
    setItems(newItems);
    await Promise.all(newItems.map((item, i) => base44.entities.DetailContent.update(item.id, { order: i })));
  };

  return (
    <div style={{ position: 'relative' }}>
      <DeleteModal open={deleteTarget !== null} message="ต้องการลบรายการนี้?" onConfirm={async () => { await base44.entities.DetailContent.delete(deleteTarget); setDeleteTarget(null); load(); }} onCancel={() => setDeleteTarget(null)}/>
      <SectionHead title="จัดการรายละเอียด" sub="ข้อความและรูปภาพ" action={<PrimaryBtn icon="plus" size="sm" onClick={() => setEditItem(BLANK)}>เพิ่มบล็อค</PrimaryBtn>}/>
      <div style={{ padding: '10px 20px 12px' }}>
        {items.length === 0 && <div style={{ textAlign: 'center', padding: '36px 20px', background: C.card, border: `1px dashed ${C.line2}`, borderRadius: 14, color: C.ink3 }}>ยังไม่มีข้อมูล</div>}
        <ReorderableList items={items} onReorder={handleReorder} renderItem={(d) => (
          <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, overflow: 'hidden' }}>
            {d.image_url && <img src={d.image_url} alt="" style={{ width: '100%', height: 100, objectFit: 'cover', display: 'block' }}/>}
            <div style={{ padding: '10px 12px' }}>
              {d.title && <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 2 }}>{d.title}</div>}
              {d.body && <div style={{ fontSize: 12, color: C.ink3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.body}</div>}
              {!d.title && !d.body && <div style={{ fontSize: 12, color: C.ink3 }}>บล็อกรูปภาพ</div>}
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <GhostBtn icon="edit" size="sm" onClick={() => setEditItem({ ...d })}>แก้ไข</GhostBtn>
                <button onClick={() => setDeleteTarget(d.id)} style={{ width: 32, height: 32, borderRadius: 8, background: C.dangerSoft, border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BRIcon name="trash" size={13} color={C.danger}/>
                </button>
              </div>
            </div>
          </div>
        )}/>
      </div>
      {editItem && (
        <Modal open={true} onClose={() => setEditItem(null)} title={editItem.id ? 'แก้ไขบล็อค' : 'เพิ่มบล็อคใหม่'}>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink, marginBottom: 6 }}>ประเภทบล็อค</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[{k:'text',l:'ข้อความ'},{k:'image',l:'รูปภาพ'}].map(t => (
                <button key={t.k} onClick={() => setEditItem(i => ({ ...i, kind: t.k }))} style={{ flex: 1, padding: '8px', borderRadius: 9, border: `1.5px solid ${editItem.kind===t.k ? C.primary : C.line}`, background: editItem.kind===t.k ? C.primarySoft : C.card, color: editItem.kind===t.k ? C.primary : C.ink2, fontFamily: thaiFont, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>{t.l}</button>
              ))}
            </div>
          </div>
          {editItem.kind === 'image' ? (
            <UploadBox label="รูปภาพ (แสดงเต็มความกว้าง)" value={editItem.image_url} onChange={v => setEditItem(i => ({ ...i, image_url: v }))} height={180}/>
          ) : (
            <>
              <Input label="หัวข้อ" value={editItem.title} onChange={v => setEditItem(i => ({ ...i, title: v }))} placeholder="หัวข้อ"/>
              <Textarea label="ข้อความ" value={editItem.body} onChange={v => setEditItem(i => ({ ...i, body: v }))} placeholder="เนื้อหา..." rows={5}/>
              <Input label="ข้อความเน้น (สั้น)" value={editItem.excerpt} onChange={v => setEditItem(i => ({ ...i, excerpt: v }))} placeholder="ข้อความเน้น"/>
            </>
          )}
          <PrimaryBtn full noIcon={true} onClick={() => save(editItem)}>บันทึก</PrimaryBtn>
        </Modal>
      )}
    </div>
  );
};

// ─── Address Admin Tab ─────────────────────────────────────
const AddressAdminTab = () => {
  const [items, setItems] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const BLANK = { heading: '', subheading: '', description: '', image_url: '', order: 0, kind: 'text' };

  const load = () => { base44.entities.AddressBlock.list('order', 100).then(b => setItems([...b].sort((a,b) => (a.order||0)-(b.order||0)))).catch(() => {}); };
  useEffect(() => { load(); }, []);

  const save = async (data) => {
    try {
      if (data.id) await base44.entities.AddressBlock.update(data.id, data);
      else await base44.entities.AddressBlock.create({ ...data, order: items.length });
      setEditItem(null); load();
    } catch(e) { alert('บันทึกไม่สำเร็จ: ' + (e?.message || 'กรุณาลองใหม่')); }
  };

  const handleReorder = async (newItems) => {
    setItems(newItems);
    for (let i = 0; i < newItems.length; i++) {
      await base44.entities.AddressBlock.update(newItems[i].id, { order: i });
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <DeleteModal open={deleteTarget !== null} message="ต้องการลบรายการนี้?" onConfirm={async () => { await base44.entities.AddressBlock.delete(deleteTarget); setDeleteTarget(null); load(); }} onCancel={() => setDeleteTarget(null)}/>
      <SectionHead title="จัดการที่อยู่" sub="ข้อความและรูปภาพ" action={<PrimaryBtn icon="plus" size="sm" onClick={() => setEditItem(BLANK)}>เพิ่มบล็อค</PrimaryBtn>}/>
      <div style={{ padding: '10px 20px 12px' }}>
        {items.length === 0 && <div style={{ textAlign: 'center', padding: '36px 20px', background: C.card, border: `1px dashed ${C.line2}`, borderRadius: 14, color: C.ink3 }}>ยังไม่มีข้อมูล</div>}
        <ReorderableList items={items} onReorder={handleReorder} renderItem={(d) => (
          <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, overflow: 'hidden' }}>
            {d.image_url && <img src={d.image_url} alt="" style={{ width: '100%', height: 80, objectFit: 'cover', display: 'block' }}/>}
            <div style={{ padding: '10px 12px' }}>
              {d.heading && <div style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>{d.heading}</div>}
              {d.description && <div style={{ fontSize: 12, color: C.ink3, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.description}</div>}
              {!d.heading && !d.description && <div style={{ fontSize: 12, color: C.ink3 }}>{d.kind === 'image' ? 'บล็อกรูปภาพ' : d.kind === 'address' ? 'บล็อกที่อยู่ (มีปุ่มคัดลอก)' : 'บล็อกข้อความ'}</div>}
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <GhostBtn icon="edit" size="sm" onClick={() => setEditItem({ ...d, kind: d.kind || (d.image_url && !d.heading ? 'image' : 'text') })}>แก้ไข</GhostBtn>
                <button onClick={() => setDeleteTarget(d.id)} style={{ width: 32, height: 32, borderRadius: 8, background: C.dangerSoft, border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BRIcon name="trash" size={13} color={C.danger}/>
                </button>
              </div>
            </div>
          </div>
        )}/>
      </div>
      {editItem && (
        <Modal open={true} onClose={() => setEditItem(null)} title={editItem.id ? 'แก้ไขบล็อค' : 'เพิ่มบล็อคใหม่'}>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink, marginBottom: 6 }}>ประเภทบล็อค</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[{k:'text',l:'ข้อความ'},{k:'address',l:'ที่อยู่'},{k:'image',l:'รูปภาพ'}].map(t => (
                <button key={t.k} onClick={() => setEditItem(i => ({ ...i, kind: t.k }))} style={{ flex: 1, padding: '8px', borderRadius: 9, border: `1.5px solid ${editItem.kind===t.k ? C.primary : C.line}`, background: editItem.kind===t.k ? C.primarySoft : C.card, color: editItem.kind===t.k ? C.primary : C.ink2, fontFamily: thaiFont, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>{t.l}</button>
              ))}
            </div>
          </div>
          {editItem.kind === 'image' ? (
            <UploadBox label="รูปภาพ (แสดงเต็มความกว้าง)" value={editItem.image_url} onChange={v => setEditItem(i => ({ ...i, image_url: v }))} height={180}/>
          ) : editItem.kind === 'address' ? (
            <>
              <Input label="หัวข้อ" value={editItem.heading} onChange={v => setEditItem(i => ({ ...i, heading: v }))} placeholder="หัวข้อ"/>
              <Input label="หัวข้อรอง" value={editItem.subheading} onChange={v => setEditItem(i => ({ ...i, subheading: v }))} placeholder="หัวข้อรอง"/>
              <Textarea label="ที่อยู่ (มีปุ่มคัดลอกแต่ละบรรทัด)" value={editItem.description} onChange={v => setEditItem(i => ({ ...i, description: v }))} placeholder={"ชื่อ: BR Cargo\nที่อยู่: 123/45 ถ...."} rows={5}/>
            </>
          ) : (
            <>
              <Input label="หัวข้อ" value={editItem.heading} onChange={v => setEditItem(i => ({ ...i, heading: v }))} placeholder="หัวข้อ"/>
              <Input label="หัวข้อรอง" value={editItem.subheading} onChange={v => setEditItem(i => ({ ...i, subheading: v }))} placeholder="หัวข้อรอง"/>
              <Textarea label="ข้อความ (แสดงเท่านั้น ไม่มีปุ่มคัดลอก)" value={editItem.description} onChange={v => setEditItem(i => ({ ...i, description: v }))} placeholder={"ข้อความที่ต้องการแสดง..."} rows={5}/>
            </>
          )}
          <PrimaryBtn full noIcon={true} onClick={() => save(editItem)}>บันทึก</PrimaryBtn>
        </Modal>
      )}
    </div>
  );
};

// ─── Admin Email Tab ───────────────────────────────────────
const EmailTab = () => {
  const [emails, setEmails] = useState([]);
  const [draft, setDraft] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const MAX = 5;
  const load = () => base44.entities.AdminEmail.list().then(setEmails);
  useEffect(() => { load(); }, []);

  const add = async () => {
    const v = draft.trim();
    if (!v) return;
    if (emails.length >= MAX) return alert(`จำกัดสูงสุด ${MAX} อีเมล`);
    if (!/^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(v)) return alert('รูปแบบอีเมลไม่ถูกต้อง');
    if (emails.some(e => e.email.toLowerCase() === v.toLowerCase())) return alert('อีเมลนี้มีอยู่แล้ว');
    try {
      await base44.entities.AdminEmail.create({ email: v });
      setDraft(''); load();
    } catch(e) { alert('เพิ่มไม่สำเร็จ: ' + (e?.message || 'กรุณาลองใหม่')); }
  };

  return (
    <div style={{ position: 'relative' }}>
      <DeleteModal open={deleteTarget !== null} message="ต้องการลบอีเมลแอดมิน?" onConfirm={async () => { await base44.entities.AdminEmail.delete(deleteTarget); setDeleteTarget(null); load(); }} onCancel={() => setDeleteTarget(null)}/>
      <SectionHead title="อีเมลแอดมิน" sub={`เพิ่มได้สูงสุด ${MAX} อีเมล`}/>
      <div style={{ padding: '12px 20px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {emails.map(e => (
          <div key={e.id} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: C.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <BRIcon name="mail" size={16} color={C.primary} stroke={2}/>
            </div>
            <div style={{ flex: 1, fontSize: 13.5, color: C.ink, fontFamily: `'Inter', sans-serif`, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.email}</div>
            <IconBtnSq icon="trash" tone="danger" onClick={() => setDeleteTarget(e.id)}/>
          </div>
        ))}
        {emails.length < MAX && (
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} placeholder="กรอกอีเมล..." style={{ ...inputStyle, flex: 1 }} onFocus={e => e.target.style.borderColor = C.primary} onBlur={e => e.target.style.borderColor = C.line}/>
            <PrimaryBtn icon="plus" onClick={add}>เพิ่ม</PrimaryBtn>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Promo/Banner Tab ──────────────────────────────────────
const BannerTab = () => {
  const [images, setImages] = useState([]);
  const [addOpen, setAddOpen] = useState(false);
  const [imgUrl, setImgUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const fileRef = React.useRef();
  const MAX = 20;

  const load = () => base44.entities.PromoImage.list('order', 20).then(setImages).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleFile = async (file) => {
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setImgUrl(file_url);
  };
  const add = async () => {
    if (!imgUrl) return;
    await base44.entities.PromoImage.create({ image_url: imgUrl, link_url: linkUrl.trim() });
    setImgUrl(''); setLinkUrl(''); setAddOpen(false); load();
  };

  return (
    <div style={{ position: 'relative' }}>
      <DeleteModal open={deleteTarget !== null} message="ต้องการลบรูปภาพนี้?" onConfirm={async () => { await base44.entities.PromoImage.delete(deleteTarget); setDeleteTarget(null); load(); }} onCancel={() => setDeleteTarget(null)}/>
      <Modal open={addOpen} onClose={() => { setAddOpen(false); setImgUrl(''); }} title="เพิ่มรูปโปรโมชั่น">
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files?.[0])}/>
        <UploadBox label="รูปภาพ" value={imgUrl} onChange={setImgUrl} height={180}/>
        <Input label="ลิ้งค์ (ไม่บังคับ)" value={linkUrl} onChange={setLinkUrl} placeholder="https://..."/>
        <PrimaryBtn icon="plus" full onClick={add} disabled={!imgUrl}>เพิ่มรูป</PrimaryBtn>
      </Modal>
      <SectionHead title="ข่าวสาร & โปรโมชั่น" sub={`สูงสุด ${MAX} ภาพ · สัดส่วน 1:1`} action={images.length < MAX && <PrimaryBtn icon="plus" size="sm" onClick={() => setAddOpen(true)}>เพิ่มรูป</PrimaryBtn>}/>
      <div style={{ padding: '8px 20px 12px' }}>
        {images.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 20px', background: C.card, border: `1px dashed ${C.line2}`, borderRadius: 14, color: C.ink3 }}>ยังไม่มีรูป</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {images.map(img => (
              <div key={img.id} style={{ position: 'relative', width: '100%', paddingBottom: '100%' }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: 14, overflow: 'hidden', border: `1px solid ${C.line}` }}>
                  {img.image_url ? <img src={img.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/> : <div style={{ width: '100%', height: '100%', background: C.primarySoft }}/>}
                </div>
                <button onClick={() => setDeleteTarget(img.id)} style={{ position: 'absolute', top: 6, right: 6, zIndex: 1, width: 28, height: 28, borderRadius: 99, background: 'rgba(255,255,255,0.95)', border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BRIcon name="trash" size={13} color={C.danger} stroke={2}/>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── BR PAY Tab ────────────────────────────────────────────
const BrPayTab = () => {
  const BLANK = { link_url: '', button_text: 'BR PAY', button_sub: 'กด web & สแกนจ่าย', emoji: '💳', image_url: '', bg_from: 'oklch(0.42 0.22 250)', bg_to: 'oklch(0.32 0.24 255)', bg_from_hex: '#1d4ed8', bg_to_hex: '#1e3a8a', text_color: '#ffffff', font_size: 18, shadow_opacity: 55, border_color: 'transparent', border_width: 0, padding_v: 14, padding_h: 20 };
  const [cfg, setCfg] = useState(BLANK);
  const [id, setId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const set = (k, v) => setCfg(c => ({ ...c, [k]: v }));

  useEffect(() => {
    base44.entities.BrPayConfig.list().then(list => {
      if (list[0]) { setCfg({ ...BLANK, ...list[0] }); setId(list[0].id); }
    }).catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      if (id) await base44.entities.BrPayConfig.update(id, cfg);
      else { const r = await base44.entities.BrPayConfig.create(cfg); setId(r.id); }
      alert('บันทึกสำเร็จ ✓');
    } catch(e) { alert('บันทึกไม่สำเร็จ: ' + (e?.message || 'กรุณาลองใหม่')); }
    setSaving(false);
  };

  const uploadLogo = async (file) => {
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    set('image_url', file_url);
    setUploading(false);
  };

  const logoRef = useRef();

  // Live preview
  const bg = `linear-gradient(135deg, ${cfg.bg_from_hex || cfg.bg_from}, ${cfg.bg_to_hex || cfg.bg_to})`;

  return (
    <div>
      <SectionHead title="ตั้งค่า BR PAY" sub="ปรับแต่งปุ่ม BR PAY บนหน้าแรก"/>
      <div style={{ padding: '10px 20px 12px', display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* Preview */}
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink, marginBottom: 8 }}>ตัวอย่าง</div>
          <div style={{
            background: bg, borderRadius: 18, padding: `${cfg.padding_v||14}px ${cfg.padding_h||20}px`,
            display: 'flex', alignItems: 'center', gap: 16,
            boxShadow: `0 6px 22px -8px rgba(40,60,180,${(cfg.shadow_opacity||55)/100})`,
            border: cfg.border_width > 0 ? `${cfg.border_width}px solid ${cfg.border_color}` : 'none',
          }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, flexShrink: 0, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid rgba(255,255,255,0.2)' }}>
              {cfg.image_url
                ? <img src={cfg.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 14 }}/>
                : <span style={{ fontSize: 24 }}>{cfg.emoji || '💳'}</span>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: `'Inter', sans-serif`, fontSize: cfg.font_size||18, fontWeight: 900, color: cfg.text_color||'#fff', letterSpacing: -0.4 }}>{cfg.button_text || 'BR PAY'}</div>
              <div style={{ fontSize: 11, color: cfg.text_color||'#fff', opacity: 0.75, marginTop: 2 }}>{cfg.button_sub}</div>
            </div>
            <BRIcon name="chevR" size={20} color={cfg.text_color||'#fff'} stroke={2.5}/>
          </div>
        </div>

        {/* Link */}
        <Input label="ลิ้งค์ (URL)" value={cfg.link_url} onChange={v => set('link_url', v)} placeholder="https://..."/>

        {/* Text */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Input label="ข้อความหลัก" value={cfg.button_text} onChange={v => set('button_text', v)} placeholder="BR PAY"/>
          <Input label="ข้อความรอง" value={cfg.button_sub} onChange={v => set('button_sub', v)} placeholder="กด web & สแกนจ่าย"/>
        </div>

        {/* Logo */}
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink, marginBottom: 8 }}>โลโก้ / ไอคอน</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 60, height: 60, borderRadius: 14, border: `1.5px solid ${C.line}`, background: C.primarySofter, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
              {cfg.image_url ? <img src={cfg.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/> : <span style={{ fontSize: 28 }}>{cfg.emoji||'💳'}</span>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <input ref={logoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => uploadLogo(e.target.files?.[0])}/>
              <GhostBtn icon="upload" size="sm" onClick={() => logoRef.current?.click()}>{uploading ? 'กำลังอัปโหลด...' : 'อัปโหลดโลโก้'}</GhostBtn>
              {cfg.image_url && <GhostBtn icon="trash" size="sm" onClick={() => set('image_url', '')}>ลบโลโก้</GhostBtn>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: C.ink3, marginBottom: 4 }}>หรือใส่ Emoji</div>
              <input value={cfg.emoji||''} onChange={e => set('emoji', e.target.value)} placeholder="💳" style={{ ...inputStyle, fontSize: 20, textAlign: 'center', padding: '6px 8px' }}/>
            </div>
          </div>
        </div>

        {/* Colors */}
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink, marginBottom: 8 }}>สีพื้นหลัง (Gradient)</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <div style={{ fontSize: 11, color: C.ink3, marginBottom: 4 }}>สีเริ่มต้น</div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input type="color" value={cfg.bg_from_hex || '#1d4ed8'} onChange={e => { set('bg_from_hex', e.target.value); set('bg_from', e.target.value); }} style={{ width: 36, height: 36, padding: 2, border: `2px solid ${C.line}`, borderRadius: 8, cursor: 'pointer', background: 'transparent' }}/>
                <input value={cfg.bg_from_hex || ''} onChange={e => { set('bg_from_hex', e.target.value); set('bg_from', e.target.value); }} placeholder="#1d4ed8" style={{ ...inputStyle, flex: 1, fontSize: 12 }}/>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.ink3, marginBottom: 4 }}>สีสุดท้าย</div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input type="color" value={cfg.bg_to_hex || '#1e3a8a'} onChange={e => { set('bg_to_hex', e.target.value); set('bg_to', e.target.value); }} style={{ width: 36, height: 36, padding: 2, border: `2px solid ${C.line}`, borderRadius: 8, cursor: 'pointer', background: 'transparent' }}/>
                <input value={cfg.bg_to_hex || ''} onChange={e => { set('bg_to_hex', e.target.value); set('bg_to', e.target.value); }} placeholder="#1e3a8a" style={{ ...inputStyle, flex: 1, fontSize: 12 }}/>
              </div>
            </div>
          </div>
        </div>

        {/* Text color */}
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink, marginBottom: 8 }}>สีตัวอักษร</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input type="color" value={cfg.text_color || '#ffffff'} onChange={e => set('text_color', e.target.value)} style={{ width: 36, height: 36, padding: 2, border: `2px solid ${C.line}`, borderRadius: 8, cursor: 'pointer', background: 'transparent' }}/>
            <input value={cfg.text_color || ''} onChange={e => set('text_color', e.target.value)} placeholder="#ffffff" style={{ ...inputStyle, flex: 1, fontSize: 12 }}/>
          </div>
        </div>

        {/* Sliders */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <div style={{ fontSize: 11, color: C.ink3, marginBottom: 4 }}>ขนาดตัวอักษร ({cfg.font_size||18}px)</div>
            <input type="range" min={12} max={32} value={cfg.font_size||18} onChange={e => set('font_size', +e.target.value)} style={{ width: '100%' }}/>
          </div>
          <div>
            <div style={{ fontSize: 11, color: C.ink3, marginBottom: 4 }}>เงา ({cfg.shadow_opacity||55}%)</div>
            <input type="range" min={0} max={100} value={cfg.shadow_opacity||55} onChange={e => set('shadow_opacity', +e.target.value)} style={{ width: '100%' }}/>
          </div>
          <div>
            <div style={{ fontSize: 11, color: C.ink3, marginBottom: 4 }}>Padding แนวตั้ง ({cfg.padding_v||14}px)</div>
            <input type="range" min={8} max={32} value={cfg.padding_v||14} onChange={e => set('padding_v', +e.target.value)} style={{ width: '100%' }}/>
          </div>
          <div>
            <div style={{ fontSize: 11, color: C.ink3, marginBottom: 4 }}>Padding แนวนอน ({cfg.padding_h||20}px)</div>
            <input type="range" min={8} max={40} value={cfg.padding_h||20} onChange={e => set('padding_h', +e.target.value)} style={{ width: '100%' }}/>
          </div>
        </div>

        {/* Border */}
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink, marginBottom: 8 }}>ขอบ (Border)</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, color: C.ink3, marginBottom: 4 }}>ความหนา ({cfg.border_width||0}px)</div>
              <input type="range" min={0} max={6} value={cfg.border_width||0} onChange={e => set('border_width', +e.target.value)} style={{ width: 120 }}/>
            </div>
            {(cfg.border_width||0) > 0 && (
              <div>
                <div style={{ fontSize: 11, color: C.ink3, marginBottom: 4 }}>สีขอบ</div>
                <input type="color" value={cfg.border_color || '#ffffff'} onChange={e => set('border_color', e.target.value)} style={{ width: 36, height: 36, padding: 2, border: `2px solid ${C.line}`, borderRadius: 8, cursor: 'pointer', background: 'transparent' }}/>
              </div>
            )}
          </div>
        </div>

        <PrimaryBtn full noIcon={true} disabled={saving} onClick={save}>{saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}</PrimaryBtn>
      </div>
    </div>
  );
};

// ─── News Admin Tab ────────────────────────────────────────
const NEWS_CATS = [
  { key: 'sea_freight', label: 'SEA FREIGHT' },
  { key: 'air_freight', label: 'AIR FREIGHT' },
  { key: 'announcement', label: 'ข่าวประกาศ' },
  { key: 'promotion', label: 'โปรโมชั่น' },
];

const NewsAdminTab = () => {
  const [items, setItems] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const BLANK = { title: '', category: 'announcement', excerpt: '', body: '', image_url: '', author_name: '', author_dept: '', is_hot: false };

  const load = () => { base44.entities.NewsArticle.list('-created_at', 50).then(setItems).catch(() => {}); };
  useEffect(() => { load(); }, []);

  const save = async (data) => {
    try {
      if (data.id) await base44.entities.NewsArticle.update(data.id, data);
      else await base44.entities.NewsArticle.create(data);
      setEditItem(null); load();
    } catch(e) { alert('บันทึกไม่สำเร็จ: ' + (e?.message || 'กรุณาลองใหม่')); }
  };

  return (
    <div style={{ position: 'relative' }}>
      <DeleteModal open={deleteTarget !== null} message="ต้องการลบข่าวนี้?" onConfirm={async () => { await base44.entities.NewsArticle.delete(deleteTarget); setDeleteTarget(null); load(); }} onCancel={() => setDeleteTarget(null)}/>
      <SectionHead title="จัดการข่าวขนส่ง" sub="ข่าวสารและบทความ" action={<PrimaryBtn icon="plus" size="sm" onClick={() => setEditItem(BLANK)}>เพิ่มข่าว</PrimaryBtn>}/>
      <div style={{ padding: '10px 20px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.length === 0 && <div style={{ textAlign: 'center', padding: '36px 20px', background: C.card, border: `1px dashed ${C.line2}`, borderRadius: 14, color: C.ink3 }}>ยังไม่มีข่าว</div>}
        {items.map(d => (
          <div key={d.id} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, overflow: 'hidden', display: 'flex', gap: 10, padding: 10, alignItems: 'center' }}>
            {d.image_url && <img src={d.image_url} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }}/>}
            <div style={{ flex: 1, minWidth: 0 }}>
              {d.is_hot && <span style={{ fontSize: 9, fontWeight: 800, color: C.danger, background: C.dangerSoft, padding: '1px 6px', borderRadius: 99, marginBottom: 4, display: 'inline-block' }}>HOT</span>}
              <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.title}</div>
              <div style={{ fontSize: 11, color: C.ink3, marginTop: 2 }}>{NEWS_CATS.find(c => c.key === d.category)?.label || d.category}</div>
            </div>
            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
              <IconBtnSq icon="edit" tone="primary" onClick={() => setEditItem({ ...d })}/>
              <IconBtnSq icon="trash" tone="danger" onClick={() => setDeleteTarget(d.id)}/>
            </div>
          </div>
        ))}
      </div>
      {editItem && (
        <Modal open={true} onClose={() => setEditItem(null)} title={editItem.id ? 'แก้ไขข่าว' : 'เพิ่มข่าวใหม่'}>
          <Input label="หัวข้อข่าว" value={editItem.title} onChange={v => setEditItem(i => ({ ...i, title: v }))} placeholder="หัวข้อ"/>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink, marginBottom: 6 }}>หมวดหมู่</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {NEWS_CATS.map(c => (
                <button key={c.key} onClick={() => setEditItem(i => ({ ...i, category: c.key }))} style={{
                  padding: '5px 12px', borderRadius: 9, border: `1.5px solid ${editItem.category===c.key ? C.primary : C.line}`,
                  background: editItem.category===c.key ? C.primarySoft : C.card,
                  color: editItem.category===c.key ? C.primary : C.ink2,
                  fontFamily: thaiFont, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}>{c.label}</button>
              ))}
            </div>
          </div>
          <UploadBox label="รูปภาพ (ไม่บังคับ)" value={editItem.image_url} onChange={v => setEditItem(i => ({ ...i, image_url: v }))} height={140}/>
          <Input label="ข้อความสั้น (excerpt)" value={editItem.excerpt} onChange={v => setEditItem(i => ({ ...i, excerpt: v }))} placeholder="สรุปสั้นๆ"/>
          <Textarea label="เนื้อหา" value={editItem.body} onChange={v => setEditItem(i => ({ ...i, body: v }))} placeholder="เนื้อหาบทความ..." rows={5}/>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Input label="ชื่อผู้เขียน" value={editItem.author_name} onChange={v => setEditItem(i => ({ ...i, author_name: v }))} placeholder="ชื่อ"/>
            <Input label="แผนก" value={editItem.author_dept} onChange={v => setEditItem(i => ({ ...i, author_dept: v }))} placeholder="แผนก"/>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Toggle on={editItem.is_hot} onChange={v => setEditItem(i => ({ ...i, is_hot: v }))}/>
            <span style={{ fontSize: 13, color: C.ink2 }}>แท็ก HOT</span>
          </div>
          <PrimaryBtn full noIcon={true} onClick={() => save(editItem)}>บันทึก</PrimaryBtn>
        </Modal>
      )}
    </div>
  );
};

// ─── Admin Screen ──────────────────────────────────────────
const AdminScreen = ({ onNavigate, isAdmin }) => {
  const [tab, setTab] = useState('schedules');

  // Android back button
  useEffect(() => {
    window.history.pushState({ brBack: true }, '');
    const handler = () => onNavigate && onNavigate('home');
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  if (!isAdmin) {
    return (
      <div style={{ fontFamily: thaiFont, background: C.bg, minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center', gap: 14 }}>
        <BRIcon name="shield" size={56} color={C.ink3} stroke={1.6}/>
        <div style={{ fontSize: 19, fontWeight: 700, fontFamily: thaiFontHeading, color: C.ink }}>ไม่มีสิทธิ์เข้าถึง</div>
        <div style={{ fontSize: 13, color: C.ink3 }}>หน้านี้สำหรับแอดมินเท่านั้น</div>
        <button onClick={() => onNavigate && onNavigate('home')} style={{ background: 'transparent', border: 0, color: C.primary, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>กลับหน้าแรก</button>
      </div>
    );
  }

  const tabs = [
    { key: 'schedules', label: 'ตารางรอบส่ง', icon: 'calendar' },
    { key: 'announcements', label: 'แจ้งเตือน', icon: 'megaphone' },
    { key: 'news', label: 'ข่าวขนส่ง', icon: 'doc' },
    { key: 'banner', label: 'โปรโมชั่น', icon: 'image' },
    { key: 'gallery', label: 'แกลลอรี่', icon: 'image' },
    { key: 'brpay', label: 'BR PAY', icon: 'ticket' },
    { key: 'nocode', label: 'No Code', icon: 'help' },
    { key: 'details', label: 'รายละเอียด', icon: 'info' },
    { key: 'address', label: 'ที่อยู่', icon: 'pin' },
    { key: 'admins', label: 'อีเมลแอดมิน', icon: 'mail' },
  ];

  const paneMap = { schedules: ScheduleManager, announcements: AnnounceTab, news: NewsAdminTab, banner: BannerTab, gallery: GalleryTab, brpay: BrPayTab, nocode: NoCodeAdminTab, details: DetailsAdminTab, address: AddressAdminTab, admins: EmailTab };
  const Pane = paneMap[tab];

  return (
    <div style={{ fontFamily: thaiFont, background: C.bg, minHeight: '100%', position: 'relative' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ padding: '16px 18px 14px', background: C.card, borderBottom: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => onNavigate && onNavigate('home')} style={{ ...iconBtnStyle, background: 'transparent' }}>
            <BRIcon name="chevL" size={22} color={C.ink}/>
          </button>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BRIcon name="settings" size={18} color="#fff" stroke={2}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 700, fontFamily: thaiFontHeading, color: C.ink }}>ระบบจัดการแอดมิน</div>
            <div style={{ fontSize: 11, color: C.ink3, marginTop: 1 }}>Admin Dashboard</div>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 99, background: C.successSoft, color: 'oklch(0.4 0.14 155)', fontSize: 11, fontWeight: 700 }}>
            <BRIcon name="shield" size={12} color="oklch(0.5 0.14 155)" stroke={2}/>
            แอดมิน
          </div>
        </div>
        <div style={{ background: C.card, borderBottom: `1px solid ${C.line}` }}>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '12px 16px', scrollbarWidth: 'none' }}>
            {tabs.map(t => {
              const active = tab === t.key;
              return (
                <button key={t.key} onClick={() => setTab(t.key)} style={{
                  display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
                  padding: '8px 14px', borderRadius: 11,
                  background: active ? C.primary : C.primarySofter, border: `1px solid ${active ? C.primary : C.line}`,
                  color: active ? '#fff' : C.ink2, fontSize: 12.5, fontWeight: 600, fontFamily: thaiFont, cursor: 'pointer', whiteSpace: 'nowrap',
                }}>
                  <BRIcon name={t.icon} size={14} color={active ? '#fff' : C.ink3} stroke={2}/>
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {Pane ? <Pane/> : <div style={{ padding: 40, textAlign: 'center', color: C.ink3 }}>กำลังโหลด...</div>}
    </div>
  );
};

export default AdminScreen;