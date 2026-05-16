import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { C, thaiFont } from '../../lib/brColors';
import BRIcon from './BRIcon';

const DetailHeader = ({ title, onBack }) => {
  useEffect(() => {
    window.history.pushState({ brBack: true }, '');
    const handler = () => { onBack(); };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '16px 18px 14px',
      background: C.card, borderBottom: `1px solid ${C.line}`,
    }}>
      <button onClick={onBack} style={{ width: 38, height: 38, borderRadius: 12, background: 'transparent', border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <BRIcon name="chevL" size={22} color={C.ink}/>
      </button>
      <div style={{ fontFamily: thaiFont, fontSize: 19, fontWeight: 700, color: C.ink, letterSpacing: -0.2, flex: 1 }}>{title}</div>
    </div>
  );
};

// ─── Details Page ───────────────────────────────────────────
export const DetailsPage = ({ onBack }) => {
  const [items, setItems] = useState([]);
  useEffect(() => {
    base44.entities.DetailContent.list('-created_at', 50).then(setItems).catch(() => {});
  }, []);

  return (
    <div style={{ fontFamily: thaiFont, background: C.bg, minHeight: '100%' }}>
      <DetailHeader title="รายละเอียด" onBack={onBack}/>
      <div style={{ padding: '18px 20px 12px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {items.length === 0 ? (
          <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 18, padding: '24px 18px', textAlign: 'center', color: C.ink3 }}>ยังไม่มีรายละเอียด</div>
        ) : items.map(d => {
          // image-only block
          if (d.kind === 'image' || (!d.title && !d.body && !d.excerpt && d.image_url)) {
            return (
              <div key={d.id} style={{ borderRadius: 18, overflow: 'hidden', border: `1px solid ${C.line}` }}>
                <img src={d.image_url} alt="" style={{ width: '100%', height: 'auto', display: 'block' }}/>
              </div>
            );
          }
          return (
            <div key={d.id} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 18, overflow: 'hidden' }}>
              {d.image_url && <img src={d.image_url} alt="" style={{ width: '100%', height: 'auto', display: 'block' }}/>}
              <div style={{ padding: '18px 18px' }}>
                {d.title && <div style={{ fontSize: 17, fontWeight: 700, color: C.ink, marginBottom: 6 }}>{d.title}</div>}
                {d.excerpt && <div style={{ fontSize: 13, color: C.primary, fontWeight: 600, marginBottom: 10 }}>{d.excerpt}</div>}
                {d.body && <div style={{ fontSize: 13.5, color: C.ink2, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{d.body}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Address Page ───────────────────────────────────────────
const CopyBtn = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const doCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); }).catch(() => {});
  };
  return (
    <button onClick={doCopy} style={{
      flexShrink: 0, padding: '3px 10px', borderRadius: 8,
      background: copied ? C.successSoft : C.primarySofter, border: `1px solid ${copied ? C.success : C.line2}`,
      color: copied ? 'oklch(0.45 0.14 155)' : C.primary,
      fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: thaiFont,
      display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.2s',
    }}>
      <BRIcon name={copied ? 'check' : 'doc'} size={11} color={copied ? 'oklch(0.5 0.14 155)' : C.primary} stroke={2}/>
      {copied ? 'คัดลอกแล้ว' : 'คัดลอก'}
    </button>
  );
};

export const AddressPage = ({ onBack }) => {
  const [blocks, setBlocks] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  const copyAll = (id, text) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    base44.entities.AddressBlock.list('order', 50).then(b => setBlocks([...b].sort((a, b) => (a.order || 0) - (b.order || 0)))).catch(() => {});
  }, []);

  return (
    <div style={{ fontFamily: thaiFont, background: C.bg, minHeight: '100%' }}>
      <DetailHeader title="ที่อยู่" onBack={onBack}/>
      <div style={{ padding: '18px 20px 12px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {blocks.length === 0 ? (
          <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 18, padding: '24px 18px', textAlign: 'center', color: C.ink3 }}>ยังไม่มีข้อมูลที่อยู่</div>
        ) : blocks.map(b => {
          // image-only block
          if (b.kind === 'image' || (b.image_url && !b.heading && !b.description)) {
            return (
              <div key={b.id} style={{ borderRadius: 18, overflow: 'hidden', border: `1px solid ${C.line}` }}>
                <img src={b.image_url} alt="" style={{ width: '100%', height: 'auto', display: 'block' }}/>
              </div>
            );
          }
          // text block — no copy buttons
          if (b.kind === 'text') {
            return (
              <div key={b.id} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 18, overflow: 'hidden' }}>
                {b.image_url && <img src={b.image_url} alt="" style={{ width: '100%', height: 'auto', display: 'block' }}/>}
                <div style={{ padding: '18px 18px' }}>
                  {b.heading && <div style={{ fontSize: 18, fontWeight: 700, color: C.ink, marginBottom: b.subheading ? 4 : 10 }}>{b.heading}</div>}
                  {b.subheading && <div style={{ fontSize: 13, color: C.ink3, marginBottom: 10 }}>{b.subheading}</div>}
                  {b.description && <div style={{ fontSize: 13.5, color: C.ink2, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{b.description}</div>}
                </div>
              </div>
            );
          }
          // address block (default for legacy) — with copy buttons
          return (
            <div key={b.id} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 18, overflow: 'hidden' }}>
              {b.image_url && <img src={b.image_url} alt="" style={{ width: '100%', height: 'auto', display: 'block' }}/>}
              <div style={{ padding: '18px 18px' }}>
                {b.heading && <div style={{ fontSize: 18, fontWeight: 700, color: C.ink, marginBottom: b.subheading ? 4 : 14 }}>{b.heading}</div>}
                {b.subheading && <div style={{ fontSize: 13, color: C.ink3, marginBottom: 14 }}>{b.subheading}</div>}
                {b.description && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 14, border: `1px solid ${C.line}`, borderRadius: 12, overflow: 'hidden' }}>
                    {b.description.split('\n').filter(l => l.trim()).map((line, i, arr) => {
                      const sep = line.indexOf(':');
                      const key = sep > 0 && sep < 30 ? line.slice(0, sep).trim() : null;
                      const val = sep > 0 && sep < 30 ? line.slice(sep + 1).trim() : line;
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: i % 2 === 0 ? '#fff' : C.bg, borderBottom: i < arr.length - 1 ? `1px solid ${C.line}` : 'none' }}>
                          {key && <div style={{ minWidth: 90, fontSize: 12, color: C.ink3, fontWeight: 600 }}>{key}</div>}
                          <div style={{ flex: 1, fontSize: 13.5, color: C.ink, fontWeight: 500, wordBreak: 'break-word', lineHeight: 1.5 }}>{key ? val : line}</div>
                          <CopyBtn text={key ? val : line}/>
                        </div>
                      );
                    })}
                  </div>
                )}
                {b.description && (
                  <button onClick={() => copyAll(b.id, b.description)} style={{
                    width: '100%', padding: '11px 14px',
                    background: copiedId === b.id ? `linear-gradient(180deg, ${C.success}, oklch(0.45 0.14 155))` : `linear-gradient(180deg, ${C.primary}, ${C.primaryDark})`,
                    border: 0, borderRadius: 12, cursor: 'pointer', color: '#fff',
                    fontFamily: thaiFont, fontSize: 13, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    boxShadow: `0 6px 14px -4px ${copiedId === b.id ? C.success : C.primary}70`,
                    transition: 'background 0.2s',
                  }}>
                    <BRIcon name={copiedId === b.id ? 'check' : 'doc'} size={15} color="#fff" stroke={2}/>
                    {copiedId === b.id ? 'คัดลอกแล้ว ✓' : 'คัดลอกที่อยู่ทั้งหมด'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── No Code Page ───────────────────────────────────────────
export const NoCodePage = ({ onBack }) => {
  const [page, setPage] = useState({ heading: 'No Code', subheading: '', verify_url: '' });
  const [blocks, setBlocks] = useState([]);

  useEffect(() => {
    base44.entities.NoCodePage.list().then(list => { if (list[0]) setPage(list[0]); }).catch(() => {});
    base44.entities.NoCodeBlock.list('order', 50).then(b => setBlocks([...b].sort((a, b) => (a.order || 0) - (b.order || 0)))).catch(() => {});
  }, []);

  return (
    <div style={{ fontFamily: thaiFont, background: C.bg, minHeight: '100%' }}>
      <DetailHeader title={page.heading || 'No Code'} onBack={onBack}/>
      <div style={{ padding: '18px 20px 12px' }}>
        <div style={{ fontSize: 13.5, color: C.ink2, lineHeight: 1.6, marginBottom: 18 }}>
          {page.subheading || 'หากเป็นเจ้าของพัสดุด้านล่างนี้ กรุณาแคปรูปรายการที่เป็นของตัวเองแล้วกดปุ่ม ยืนยันการเป็นเจ้าของ พร้อมแนบหลักฐานการเป็นเจ้าของ'}
        </div>
        <button onClick={() => page.verify_url && window.open(page.verify_url, '_blank')} style={{
          width: '100%', padding: '14px 16px',
          background: `linear-gradient(180deg, ${C.primary}, ${C.primaryDark})`,
          border: 0, borderRadius: 14, cursor: 'pointer', color: '#fff',
          fontFamily: thaiFont, fontSize: 15, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: `0 8px 18px -5px ${C.primary}80`,
        }}>
          <BRIcon name="shield" size={18} color="#fff" stroke={2}/>
          ยืนยันการเป็นเจ้าของ
        </button>
        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {blocks.map((b, i) => (
            <div key={b.id} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 16, padding: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[b.image1_url, b.image2_url].map((img, j) => (
                  <div key={j} style={{ borderRadius: 10, overflow: 'hidden', aspectRatio: '1/1' }}>
                    {img ? <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/> : <div style={{ width: '100%', height: '100%', background: C.primarySoft }}/>}
                  </div>
                ))}
              </div>
              {b.caption && <div style={{ marginTop: 8, textAlign: 'center', fontFamily: `'JetBrains Mono', monospace`, fontSize: 12.5, color: C.ink2 }}>{b.caption}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── News Article Page ───────────────────────────────────────
export const NewsArticlePage = ({ articleId, onBack }) => {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.NewsArticle.list('-created_at', 200)
      .then(list => setArticle(list.find(a => a.id === articleId) || null))
      .catch(() => {}).finally(() => setLoading(false));
  }, [articleId]);

  const catMap = {
    sea_freight: { label: 'SEA FREIGHT', color: C.primary, bg: C.primarySoft, icon: 'ship' },
    air_freight: { label: 'AIR FREIGHT', color: C.primary, bg: C.primarySoft, icon: 'plane' },
    announcement: { label: 'ข่าวประกาศ', color: C.success, bg: C.successSoft, icon: 'megaphone' },
  };
  const cat = article ? (catMap[article.category] || { label: article.category, color: C.primary, bg: C.primarySoft, icon: 'doc' }) : null;

  const fmtDate = (iso) => {
    if (!iso) return '';
    try { return new Date(iso).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }); } catch { return iso; }
  };

  return (
    <div style={{ fontFamily: thaiFont, background: C.bg, minHeight: '100%' }}>
      <DetailHeader title={cat?.label || 'ข่าวสาร'} onBack={onBack}/>
      {loading ? (
        <div style={{ padding: '60px 0', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 28, height: 28, border: `3px solid ${C.line}`, borderTopColor: C.primary, borderRadius: '50%', animation: 'brSpin 0.8s linear infinite' }}/>
          <style>{`@keyframes brSpin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : !article ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: C.ink3 }}>ไม่พบข่าวนี้</div>
      ) : (
        <div>
          <div style={{ height: 200, background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {article.image_url
              ? <img src={article.image_url} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
              : <BRIcon name={cat.icon} size={64} color="rgba(255,255,255,0.85)" stroke={1.8}/>}
            {article.is_hot && (
              <div style={{ position: 'absolute', top: 14, left: 14, background: C.danger, color: '#fff', fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 99 }}>🔥 HOT</div>
            )}
          </div>
          <div style={{ padding: '18px 20px 12px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 99, background: cat.bg, color: cat.color, fontSize: 11, fontWeight: 800, letterSpacing: 0.6 }}>
                <BRIcon name={cat.icon} size={12} color={cat.color} stroke={2.2}/>
                {cat.label}
              </span>
              {article.created_at && <span style={{ fontSize: 11.5, color: C.ink3 }}>{fmtDate(article.created_at)}</span>}
            </div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: C.ink, letterSpacing: -0.5, lineHeight: 1.25 }}>{article.title}</h1>
            {article.excerpt && (
              <div style={{ fontSize: 15, color: C.ink2, lineHeight: 1.55, padding: '12px 14px', background: C.card, borderRadius: 12, border: `1px solid ${C.line}`, borderLeft: `4px solid ${cat.color}` }}>{article.excerpt}</div>
            )}
            {(article.author_name || article.author_dept) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: `1px solid ${C.line}` }}>
                <div style={{ width: 38, height: 38, borderRadius: 99, background: cat.bg, color: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: `'Inter', sans-serif`, fontWeight: 800, fontSize: 14 }}>
                  {(article.author_name?.[0] || 'B').toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink }}>{article.author_name || 'BR Cargo'}</div>
                  {article.author_dept && <div style={{ fontSize: 11.5, color: C.ink3 }}>{article.author_dept}</div>}
                </div>
              </div>
            )}
            {article.body && <div style={{ fontSize: 15, color: C.ink, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{article.body}</div>}
          </div>
        </div>
      )}
    </div>
  );
};