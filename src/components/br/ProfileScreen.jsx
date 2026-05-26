import React, { useState, useEffect } from 'react';
import { supabase } from '@/api/supabaseClient';
import { C, thaiFont, thaiFontHeading, thaiFontSubheading } from '../../lib/brColors';
import BRIcon from './BRIcon';

const inputStyle = {
  width: '100%', padding: '10px 12px', fontSize: 14, color: C.ink,
  fontFamily: thaiFont, background: C.bg, border: `1.5px solid ${C.line}`,
  borderRadius: 10, outline: 'none', boxSizing: 'border-box',
};

// ─── Avatar Config Storage ────────────────────────────────
export const AVATAR_STORAGE_KEY = 'br_avatar_config';

export const loadAvatarConfig = () => {
  try {
    const saved = localStorage.getItem(AVATAR_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return { type: 'letter', value: null, color: '#5B6EF5' };
};

const saveAvatarConfig = (cfg) => {
  try { localStorage.setItem(AVATAR_STORAGE_KEY, JSON.stringify(cfg)); } catch {}
};

// ─── Avatar Options ───────────────────────────────────────
const ANIMALS = [
  '🐱','🐶','🐻','🐼','🦊','🐰','🐨','🐧',
  '🐸','🐥','🐹','🦌','🦄','🦆','🦉','🐯',
  '🐮','🐷','🐙','🦋','🐝','🦁','🐺','🐣',
];

const HEARTS = [
  '❤️','💖','💗','💓','💞','💘','💝','💟',
  '🧡','💛','💚','💙','💜','🖤','🤍','🤎',
  '❤️‍🔥','💔','♥️','💌','💒','💑','💏','🫀',
];

const AVATAR_COLORS = [
  '#5B6EF5','#E85D75','#F5A623','#27AE60',
  '#9B59B6','#1ABC9C','#E74C3C','#3498DB',
  '#F39C12','#16A085','#8E44AD','#2C3E50',
  '#FF6B9D','#C0392B','#2980B9','#1E8449',
];

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// ─── Avatar Display helper ────────────────────────────────
export const AvatarDisplay = ({ config, size = 88, userInitial = 'U' }) => {
  const bg = config?.color || '#5B6EF5';
  let content;
  if (config?.type === 'emoji' && config?.value) {
    content = <span style={{ fontSize: size * 0.48, lineHeight: 1 }}>{config.value}</span>;
  } else if (config?.type === 'letter' && config?.value) {
    content = <span style={{ fontFamily: `'Inter', sans-serif`, fontWeight: 900, fontSize: size * 0.42, color: '#fff', lineHeight: 1 }}>{config.value}</span>;
  } else {
    content = <span style={{ fontFamily: `'Inter', sans-serif`, fontWeight: 900, fontSize: size * 0.42, color: '#fff', lineHeight: 1 }}>{userInitial}</span>;
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: 99,
      background: bg, border: '3px solid #fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: `0 8px 24px -6px ${bg}80`,
      flexShrink: 0,
    }}>
      {content}
    </div>
  );
};

// ─── Full-Screen Avatar Picker ────────────────────────────
const AvatarPicker = ({ current, onSelect, onClose, userInitial }) => {
  const [tab, setTab] = useState('animal');
  const [selectedType, setSelectedType] = useState(current.type || 'letter');
  const [selectedValue, setSelectedValue] = useState(current.value || null);
  const [selectedColor, setSelectedColor] = useState(current.color || '#5B6EF5');
  const [saving, setSaving] = useState(false);

  // Android back button support
  useEffect(() => {
    window.history.pushState({ brBack: true }, '');
    const handler = () => onClose();
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  const handleSelect = (type, value) => {
    setSelectedType(type);
    setSelectedValue(value);
  };

  const handleConfirm = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 300));
    onSelect({ type: selectedType, value: selectedValue, color: selectedColor });
    setSaving(false);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const previewCfg = { type: selectedType, value: selectedValue, color: selectedColor };

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 300,
      background: C.bg, display: 'flex', flexDirection: 'column',
      fontFamily: thaiFont,
    }}>
      {/* Header — sticky */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
        padding: '16px 18px 14px', background: C.card, borderBottom: `1px solid ${C.line}`,
      }}>
        <button onClick={onClose} style={{ width: 38, height: 38, borderRadius: 12, background: 'transparent', border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BRIcon name="chevL" size={22} color={C.ink}/>
        </button>
        <div style={{ fontSize: 19, fontWeight: 700, fontFamily: thaiFontHeading, color: C.ink }}>ตกแต่งโปรไฟล์</div>
      </div>

      {/* Scrollable content area */}
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', display: 'flex', flexDirection: 'column' }}>

        {/* Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '28px 20px 20px', background: `linear-gradient(180deg, ${C.primarySoft} 0%, ${C.bg} 100%)`, borderBottom: `1px solid ${C.line}` }}>
          <AvatarDisplay config={previewCfg} size={96} userInitial={userInitial}/>
          <div style={{ fontSize: 12.5, color: C.ink3, fontWeight: 600 }}>ตัวอย่างโปรไฟล์</div>
        </div>

        <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Tab selector */}
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { key: 'animal', label: '🐾 สัตว์น่ารัก' },
              { key: 'heart',  label: '💖 หัวใจ' },
              { key: 'letter', label: '🔤 ตัวอักษร' },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                flex: 1, padding: '9px 4px', borderRadius: 12,
                border: `1.5px solid ${tab === t.key ? C.primary : C.line}`,
                background: tab === t.key ? C.primarySoft : C.card,
                color: tab === t.key ? C.primary : C.ink2,
                fontFamily: thaiFontSubheading, fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.15s',
              }}>{t.label}</button>
            ))}
          </div>

          {/* Animal tab */}
          {tab === 'animal' && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.ink3, marginBottom: 10 }}>เลือกสัตว์น่ารัก</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 8 }}>
                {ANIMALS.map((em, i) => (
                  <button key={i} onClick={() => handleSelect('emoji', em)} style={{
                    aspectRatio: '1/1', borderRadius: 12,
                    border: `2px solid ${selectedType === 'emoji' && selectedValue === em ? selectedColor : C.line}`,
                    background: selectedType === 'emoji' && selectedValue === em ? selectedColor + '22' : C.bg,
                    cursor: 'pointer', fontSize: 22,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}>{em}</button>
                ))}
              </div>
            </div>
          )}

          {/* Heart tab */}
          {tab === 'heart' && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.ink3, marginBottom: 10 }}>เลือกหัวใจ</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 8 }}>
                {HEARTS.map((em, i) => (
                  <button key={i} onClick={() => handleSelect('emoji', em)} style={{
                    aspectRatio: '1/1', borderRadius: 12,
                    border: `2px solid ${selectedType === 'emoji' && selectedValue === em ? selectedColor : C.line}`,
                    background: selectedType === 'emoji' && selectedValue === em ? selectedColor + '22' : C.bg,
                    cursor: 'pointer', fontSize: 22,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}>{em}</button>
                ))}
              </div>
            </div>
          )}

          {/* Letter tab */}
          {tab === 'letter' && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.ink3, marginBottom: 10 }}>เลือกตัวอักษร A-Z</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
                {LETTERS.map(l => (
                  <button key={l} onClick={() => handleSelect('letter', l)} style={{
                    aspectRatio: '1/1', borderRadius: 12,
                    border: `2px solid ${selectedType === 'letter' && selectedValue === l ? selectedColor : C.line}`,
                    background: selectedType === 'letter' && selectedValue === l ? selectedColor : C.bg,
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: `'Inter', sans-serif`, fontWeight: 900, fontSize: 16,
                    color: selectedType === 'letter' && selectedValue === l ? '#fff' : C.ink2,
                    transition: 'all 0.15s',
                  }}>{l}</button>
                ))}
              </div>
            </div>
          )}

          {/* Color picker */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.ink3, marginBottom: 10 }}>เลือกสีพื้นหลัง</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 10 }}>
              {AVATAR_COLORS.map(clr => (
                <button key={clr} onClick={() => setSelectedColor(clr)} style={{
                  width: '100%', aspectRatio: '1/1', borderRadius: 99, background: clr, border: 0, cursor: 'pointer',
                  boxShadow: selectedColor === clr ? `0 0 0 3px #fff, 0 0 0 5px ${clr}` : 'none',
                  transition: 'all 0.15s',
                }}/>
              ))}
            </div>
          </div>

          {/* ปุ่มบันทึก/ยกเลิก — อยู่ใน scroll เดียวกัน */}
          <div style={{ display: 'flex', gap: 10, paddingBottom: 8 }}>
            <button onClick={handleCancel} disabled={saving} style={{
              flex: 1, padding: '14px', borderRadius: 16,
              background: C.card, border: `1.5px solid ${C.line2}`,
              cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.5 : 1,
              fontFamily: thaiFontSubheading, fontSize: 15, fontWeight: 700, color: C.ink2,
              transition: 'opacity 0.2s',
            }}>ยกเลิก</button>

            <button onClick={handleConfirm} disabled={saving} style={{
              flex: 2, padding: '14px', borderRadius: 16,
              background: saving ? 'oklch(0.72 0.10 245)' : `linear-gradient(180deg, ${C.primary}, ${C.primaryDark})`,
              border: 0, cursor: saving ? 'not-allowed' : 'pointer', color: '#fff',
              fontFamily: thaiFontSubheading, fontSize: 15, fontWeight: 700,
              boxShadow: saving ? 'none' : `0 6px 18px -4px ${C.primary}70`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.2s',
            }}>
              {saving && (
                <svg width="16" height="16" viewBox="0 0 24 24" style={{ animation: 'brSpin 0.8s linear infinite' }}>
                  <circle cx="12" cy="12" r="9" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5"/>
                  <path d="M21 12a9 9 0 0 1-9 9" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              )}
              {saving ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes brSpin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

// ─── Editable Row ─────────────────────────────────────────
const EditableRow = ({ icon, label, value, onSave, editingKey, activeEdit, setActiveEdit }) => {
  const editing = activeEdit === editingKey;
  const [draft, setDraft] = useState(value || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => { setDraft(value || ''); }, [value]);

  const handleSave = async () => {
    setSaving(true);
    await onSave(draft);
    setSaving(false);
    setActiveEdit(null);
  };

  return (
    <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 16, padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: C.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BRIcon name={icon} size={18} color={C.primary} stroke={2}/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: C.ink3, fontWeight: 600, marginBottom: 2 }}>{label}</div>
          {!editing && <div style={{ fontSize: 14, color: C.ink, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value || '-'}</div>}
        </div>
        {!editing && (
          <button onClick={() => { setDraft(value || ''); setActiveEdit(editingKey); }} style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 9, background: C.primarySoft, border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BRIcon name="edit" size={14} color={C.primary} stroke={2}/>
          </button>
        )}
      </div>
      {editing && (
        <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
          <input type="text" value={draft} onChange={e => setDraft(e.target.value)} placeholder={label}
            style={inputStyle} autoFocus onKeyDown={e => e.key === 'Enter' && handleSave()}/>
          <button onClick={handleSave} disabled={saving} style={{ flexShrink: 0, padding: '0 14px', borderRadius: 10, background: `linear-gradient(180deg, ${C.primary}, ${C.primaryDark})`, border: 0, cursor: 'pointer', color: '#fff', fontFamily: thaiFontSubheading, fontSize: 13, fontWeight: 700 }}>{saving ? '...' : 'บันทึก'}</button>
          <button onClick={() => setActiveEdit(null)} style={{ flexShrink: 0, padding: '0 12px', borderRadius: 10, background: C.card, border: `1px solid ${C.line}`, cursor: 'pointer', color: C.ink2, fontFamily: thaiFont, fontSize: 13, fontWeight: 600 }}>ยกเลิก</button>
        </div>
      )}
    </div>
  );
};

// ─── Password Row (with current-password validation) ─────
const PasswordRow = ({ authEmail, activeEdit, setActiveEdit }) => {
  const editing = activeEdit === 'password';
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setError('');
    setSuccess(false);
    if (!currentPw) return setError('กรุณากรอกรหัสผ่านปัจจุบัน');
    if (newPw.length < 6) return setError('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร');
    if (currentPw === newPw) return setError('รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม');
    if (!authEmail) return setError('ไม่พบข้อมูลบัญชี กรุณาออกจากระบบแล้วเข้าใหม่');
    setSaving(true);
    try {
      // ยืนยันรหัสผ่านปัจจุบันผ่าน Supabase ด้วย authEmail ที่ดึงจาก session
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: currentPw,
      });
      if (signInError) {
        if (signInError.message?.includes('Invalid login') || signInError.message?.includes('invalid_credentials')) {
          setError('รหัสผ่านปัจจุบันไม่ถูกต้อง');
        } else if (signInError.message?.includes('Too many requests')) {
          setError('ลองบ่อยเกินไป กรุณารอสักครู่');
        } else {
          setError('ยืนยันตัวตนไม่สำเร็จ กรุณาลองใหม่');
        }
        setSaving(false);
        return;
      }
      // เปลี่ยนรหัสผ่านใหม่
      const { error: updateError } = await supabase.auth.updateUser({ password: newPw });
      if (updateError) {
        setError('บันทึกรหัสผ่านไม่สำเร็จ กรุณาลองใหม่');
        setSaving(false);
        return;
      }
      // สำเร็จ
      setSuccess(true);
      setCurrentPw(''); setNewPw('');
      setTimeout(() => { setActiveEdit(null); setSuccess(false); }, 1500);
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาตรวจสอบการเชื่อมต่อแล้วลองใหม่');
    } finally {
      setSaving(false);
    }
  };

  const eyeBtn = (show, toggle) => (
    <button type="button" onClick={toggle} style={{ background: 'none', border: 0, cursor: 'pointer', padding: '0 10px', display: 'flex', alignItems: 'center', color: C.ink3, flexShrink: 0 }}>
      {show
        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
        : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10 10 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9 9 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"/></svg>}
    </button>
  );

  return (
    <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 16, padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: C.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BRIcon name="shield" size={18} color={C.primary} stroke={2}/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: C.ink3, fontWeight: 600, marginBottom: 2 }}>รหัสผ่าน</div>
          {!editing && <div style={{ fontSize: 14, color: C.ink, fontWeight: 600 }}>••••••••</div>}
        </div>
        {!editing && (
          <button onClick={() => { setActiveEdit('password'); }} style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 9, background: C.primarySoft, border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BRIcon name="edit" size={14} color={C.primary} stroke={2}/>
          </button>
        )}
      </div>
      {editing && (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Current password — red border on error */}
          <div style={{ display: 'flex', alignItems: 'center', background: C.bg, border: `1.5px solid ${error === 'รหัสผ่านไม่ถูกต้อง' ? C.danger : C.line}`, borderRadius: 10, overflow: 'hidden' }}>
            <input type={showCurrent ? 'text' : 'password'} value={currentPw}
              onChange={e => { setCurrentPw(e.target.value); setError(''); }}
              placeholder="รหัสผ่านปัจจุบัน" style={{ ...inputStyle, border: 0, flex: 1 }} autoFocus/>
            {eyeBtn(showCurrent, () => setShowCurrent(v => !v))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', background: C.bg, border: `1.5px solid ${C.line}`, borderRadius: 10, overflow: 'hidden' }}>
            <input type={showNew ? 'text' : 'password'} value={newPw} onChange={e => setNewPw(e.target.value)}
              placeholder="รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)" style={{ ...inputStyle, border: 0, flex: 1 }}
              onKeyDown={e => e.key === 'Enter' && handleSave()}/>
            {eyeBtn(showNew, () => setShowNew(v => !v))}
          </div>
          {/* Error message in red */}
          {error && (
            <div style={{ fontSize: 12.5, color: C.danger, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.danger} strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="9.5"/><path d="M12 7v6M12 16.5v.1"/></svg>
              {error}
            </div>
          )}
          {/* Success message in green */}
          {success && (
            <div style={{ fontSize: 12.5, color: C.success, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.success} strokeWidth="2.5" strokeLinecap="round"><path d="m4 12 5 5L20 6"/></svg>
              เปลี่ยนรหัสผ่านสำเร็จ!
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: '10px', borderRadius: 10, background: `linear-gradient(180deg, ${C.primary}, ${C.primaryDark})`, border: 0, cursor: saving ? 'not-allowed' : 'pointer', color: '#fff', fontFamily: thaiFontSubheading, fontSize: 13, fontWeight: 700 }}>{saving ? 'กำลังตรวจสอบ...' : 'บันทึกรหัสผ่าน'}</button>
            <button onClick={() => { setActiveEdit(null); setCurrentPw(''); setNewPw(''); setError(''); }} style={{ padding: '10px 14px', borderRadius: 10, background: C.card, border: `1px solid ${C.line}`, cursor: 'pointer', color: C.ink2, fontFamily: thaiFont, fontSize: 13, fontWeight: 600 }}>ยกเลิก</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Profile Screen ───────────────────────────────────────
const ProfileScreen = ({ user, onBack, onLogout }) => {
  const [profile, setProfile] = useState({
    phone: user?.phone || '',
    code_name: user?.code_name || '',
  });
  const [authEmail, setAuthEmail] = useState(user?.email || '');
  const [avatarConfig, setAvatarConfig] = useState(loadAvatarConfig);
  const [showPicker, setShowPicker] = useState(false);
  const [activeEdit, setActiveEdit] = useState(null); // ข้อ 3: จัดการ edit เดียวกัน

  // ดึง email จาก Supabase session และ users table (รองรับ LINE user ที่ไม่มี email ใน auth)
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const uid = data?.user?.id;
      if (data?.user?.email) {
        setAuthEmail(data.user.email);
      } else if (uid) {
        // LINE user — ดึง email จาก users table แทน
        supabase.from('users').select('email').eq('id', uid).single()
          .then(({ data: profile }) => {
            if (profile?.email) setAuthEmail(profile.email);
          }).catch(() => {});
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (user?.id) {
      supabase.from('users').select('phone,code_name,email').eq('id', user.id).single()
        .then(({ data }) => {
          if (data) {
            setProfile({ phone: data.phone || '', code_name: data.code_name || '' });
            if (data.email && !authEmail) setAuthEmail(data.email);
          }
        }).catch(() => {});
    }
  }, [user?.id]);

  // Android back button support
  useEffect(() => {
    window.history.pushState({ brBack: true }, '');
    const handler = () => { onBack(); };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  // ข้อ 1: save ลง Supabase โดยตรง
  const saveField = async (field, value) => {
    if (!user?.id) return;
    await supabase.from('users').upsert({ id: user.id, [field]: value }, { onConflict: 'id' });
    setProfile(p => ({ ...p, [field]: value }));
  };

  // ข้อ 1: save avatar ลง Supabase ด้วย
  const handleAvatarSelect = async (cfg) => {
    setAvatarConfig(cfg);
    saveAvatarConfig(cfg);
    if (user?.id) {
      await supabase.from('users').upsert({
        id: user.id,
        avatar_config: JSON.stringify(cfg),
      }, { onConflict: 'id' }).catch(() => {});
    }
  };

  const userInitial = user?.full_name?.[0]?.toUpperCase() || authEmail?.[0]?.toUpperCase() || 'U';

  return (
    <div style={{ fontFamily: thaiFont, background: C.bg, width: '100%', minHeight: '100dvh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 18px 14px', background: C.card, borderBottom: `1px solid ${C.line}` }}>
        <button onClick={onBack} style={{ width: 38, height: 38, borderRadius: 12, background: 'transparent', border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BRIcon name="chevL" size={22} color={C.ink}/>
        </button>
        <div style={{ fontSize: 19, fontWeight: 700, fontFamily: thaiFontHeading, color: C.ink, letterSpacing: -0.2 }}>โปรไฟล์</div>
      </div>

      {/* Avatar section */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '36px 20px 28px', background: `linear-gradient(180deg, ${C.primarySoft} 0%, ${C.bg} 100%)`, borderBottom: `1px solid ${C.line}` }}>
        <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowPicker(true)}>
          <AvatarDisplay config={avatarConfig} size={88} userInitial={userInitial}/>
          <div style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 99, background: C.primary, border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 2px 8px ${C.primary}60` }}>
            <BRIcon name="edit" size={12} color="#fff" stroke={2.5}/>
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 800, fontFamily: thaiFontHeading, color: C.ink }}>{user?.full_name || 'ผู้ใช้งาน'}</div>
          {profile.code_name && <div style={{ fontSize: 13, color: C.ink3, marginTop: 3 }}>@{profile.code_name}</div>}
        </div>
      </div>

      {/* Fields — ข้อ 2: paddingBottom พอดีกับ tab bar */}
      <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))' }}>
        <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: C.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BRIcon name="mail" size={18} color={C.primary} stroke={2}/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, color: C.ink3, fontWeight: 600, marginBottom: 2 }}>อีเมล</div>
            <div style={{ fontSize: 14, color: C.ink, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{authEmail || '-'}</div>
          </div>
        </div>

        {/* ข้อ 3: ส่ง activeEdit/setActiveEdit เพื่อให้เปิดแค่อันเดียว */}
        <EditableRow icon="phone" label="เบอร์โทร" value={profile.phone} onSave={v => saveField('phone', v)} editingKey="phone" activeEdit={activeEdit} setActiveEdit={setActiveEdit}/>
        <EditableRow icon="sparkle" label="Code Name" value={profile.code_name} onSave={v => saveField('code_name', v)} editingKey="code_name" activeEdit={activeEdit} setActiveEdit={setActiveEdit}/>
        <PasswordRow authEmail={authEmail} activeEdit={activeEdit} setActiveEdit={setActiveEdit}/>

        <button onClick={onLogout} style={{ width: '100%', padding: '14px', marginTop: 6, background: C.dangerSoft, border: `1px solid ${C.danger}33`, borderRadius: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: thaiFontSubheading, fontSize: 15, fontWeight: 700, color: C.danger }}>
          <BRIcon name="logout" size={18} color={C.danger} stroke={2}/>
          ออกจากระบบ
        </button>
      </div>

      {showPicker && (
        <AvatarPicker current={avatarConfig} onSelect={handleAvatarSelect} onClose={() => setShowPicker(false)} userInitial={userInitial}/>
      )}
    </div>
  );
};

export default ProfileScreen;