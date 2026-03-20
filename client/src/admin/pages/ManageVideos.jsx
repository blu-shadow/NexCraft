// ═══════════════════════════════════════════════════════════
//                MANAGE YOUTUBE VIDEOS PAGE
// ═══════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import DataTable                from "../components/DataTable";
import { getAllVideos, addVideo, updateVideo, deleteVideo } from "../../services/youtubeService";
import { VIDEO_CATEGORIES } from "../../utils/constants";
import { timeAgo }          from "../../utils/formatDate";

const CloseIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const PlusIcon  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const YoutubeIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23 7s-.3-2-1.2-2.8c-1.1-1.2-2.4-1.2-3-1.3C16.2 2.8 12 2.8 12 2.8s-4.2 0-6.8.1C4.6 3 3.3 3 2.2 4.2 1.3 5 1 7 1 7S.7 9.3.7 11.5v2.1c0 2.2.3 4.4.3 4.4s.3 2 1.2 2.8c1.1 1.2 2.6 1.1 3.3 1.2C7.5 22.1 12 22.1 12 22.1s4.2 0 6.8-.2c.6-.1 1.9-.1 3-1.3.9-.8 1.2-2.8 1.2-2.8s.3-2.2.3-4.4v-2.1C23.3 9.3 23 7 23 7zm-13.5 8.9V8.1l8.1 3.9-8.1 3.8z"/></svg>;

const EMPTY = { title:"", description:"", youtubeUrl:"", category:"tutorial", tags:"", isFeatured:false };

const ManageVideos = () => {
  const [videos,  setVideos ] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal  ] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form,    setForm   ] = useState(EMPTY);
  const [saving,  setSaving ] = useState(false);
  const [toast,   setToast  ] = useState(null);

  const showToast = (msg, type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };
  const load = async () => {
    setLoading(true);
    try { const r = await getAllVideos({ limit:100 }); setVideos(r.videos||[]); } catch { setVideos([]); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit   = (row) => {
    setEditing(row);
    setForm({ title:row.title||"", description:row.description||"", youtubeUrl:row.youtubeUrl||"", category:row.category||"tutorial", tags:(row.tags||[]).join(", "), isFeatured:row.isFeatured||false });
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.youtubeUrl) return showToast("Title and YouTube URL required","error");
    setSaving(true);
    try {
      const payload = { ...form, tags: form.tags ? form.tags.split(",").map(t=>t.trim()).filter(Boolean) : [] };
      if (editing) await updateVideo(editing._id, payload);
      else         await addVideo(payload);
      showToast(editing ? "Video updated!" : "Video added!");
      setModal(false); load();
    } catch (err) { showToast(err.response?.data?.message||"Failed","error"); }
    setSaving(false);
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Remove "${row.title}"?`)) return;
    try { await deleteVideo(row._id); showToast("Video removed"); load(); } catch { showToast("Delete failed","error"); }
  };

  const columns = [
    { key:"thumbnailUrl", label:"Thumb", width:"70px", sortable:false, render:(v) => (
        <img src={v} alt="" style={{ width:"60px", height:"34px", objectFit:"cover", borderRadius:"6px", background:"#0a0a18" }} onError={(e)=>e.target.style.display="none"} />
      )
    },
    { key:"title",       label:"Title",    render:(v,row) => (
        <div>
          <p style={{ fontSize:"13px", color:"#e8e8f0", fontWeight:"600", fontFamily:"var(--font-display)" }}>{v}</p>
          <a href={row.youtubeUrl} target="_blank" rel="noreferrer" style={{ fontSize:"11px", color:"rgba(239,68,68,0.7)" }} onClick={(e)=>e.stopPropagation()}>Open on YouTube ↗</a>
        </div>
      )
    },
    { key:"category",    label:"Category", render:(v) => <span style={{ fontSize:"12px", color:"rgba(255,255,255,0.5)", textTransform:"capitalize" }}>{v}</span> },
    { key:"isFeatured",  label:"Featured", sortable:false, render:(v) => v ? "⭐" : "—" },
    { key:"isPublished", label:"Status",   render:(v) => <span style={{ fontSize:"11px", padding:"3px 10px", borderRadius:"20px", background:v?"rgba(16,185,129,0.12)":"rgba(239,68,68,0.12)", color:v?"#34d399":"#f87171", fontFamily:"var(--font-display)", fontWeight:"600" }}>{v?"Published":"Hidden"}</span> },
    { key:"createdAt",   label:"Added",    render:(v) => <span style={{ fontSize:"11px", color:"rgba(255,255,255,0.35)" }}>{timeAgo(v)}</span> },
  ];

  return (
    <div>
      {toast && <Toast toast={toast} />}
      <DataTable title="YouTube Videos" columns={columns} data={videos} loading={loading} onEdit={openEdit} onDelete={handleDelete} emptyText="No videos added yet" emptyIcon="▶️" onRefresh={load}
        headerExtra={
          <button onClick={openCreate} style={addBtn}>
            <PlusIcon /> Add Video
          </button>
        }
      />

      {modal && (
        <>
          <div className="overlay" onClick={() => setModal(false)} />
          <div style={modalStyle}>
            <ModalHeader title={editing?"Edit Video":"Add YouTube Video"} onClose={()=>setModal(false)} />
            <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
              {/* YouTube URL preview */}
              <div style={{ background:"rgba(239,68,68,0.06)", border:"1px solid rgba(239,68,68,0.15)", borderRadius:"10px", padding:"12px 14px", display:"flex", alignItems:"center", gap:"10px" }}>
                <span style={{ color:"#ef4444" }}><YoutubeIcon /></span>
                <span style={{ fontSize:"12px", color:"rgba(255,255,255,0.5)", fontFamily:"var(--font-body)" }}>Paste any YouTube URL — watch, youtu.be, shorts, embed</span>
              </div>
              <div>
                <label style={lbl}>YouTube URL *</label>
                <input value={form.youtubeUrl} onChange={(e)=>setForm({...form,youtubeUrl:e.target.value})} placeholder="https://www.youtube.com/watch?v=..." style={inp} required />
              </div>
              <div>
                <label style={lbl}>Video Title *</label>
                <input value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} placeholder="Video title..." style={inp} required />
              </div>
              <div>
                <label style={lbl}>Description</label>
                <textarea value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} placeholder="Brief description..." style={{ ...inp, minHeight:"80px", resize:"vertical" }} />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                <div>
                  <label style={lbl}>Category</label>
                  <select value={form.category} onChange={(e)=>setForm({...form,category:e.target.value})} style={{ ...inp, cursor:"pointer" }}>
                    {VIDEO_CATEGORIES.map((c)=><option key={c.value} value={c.value} style={{ background:"#111124" }}>{c.icon} {c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Tags (comma separated)</label>
                  <input value={form.tags} onChange={(e)=>setForm({...form,tags:e.target.value})} placeholder="react, javascript, tutorial" style={inp} />
                </div>
              </div>
              <label style={{ display:"flex", alignItems:"center", gap:"10px", cursor:"pointer" }}>
                <input type="checkbox" checked={form.isFeatured} onChange={(e)=>setForm({...form,isFeatured:e.target.checked})} style={{ accentColor:"#6c63ff", width:"16px", height:"16px" }} />
                <span style={{ fontSize:"13px", color:"rgba(255,255,255,0.6)" }}>Mark as Featured</span>
              </label>
              <FormActions onCancel={()=>setModal(false)} saving={saving} label={editing?"Save Changes":"Add Video"} />
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default ManageVideos;

// ── Shared mini-components for all admin pages
export const Toast = ({ toast }) => (
  <div style={{ position:"fixed", bottom:"24px", right:"24px", zIndex:999, padding:"12px 20px", background:toast.type==="error"?"rgba(239,68,68,0.15)":"rgba(16,185,129,0.15)", border:`1px solid ${toast.type==="error"?"rgba(239,68,68,0.3)":"rgba(16,185,129,0.3)"}`, borderRadius:"12px", color:toast.type==="error"?"#f87171":"#34d399", fontSize:"13px", fontFamily:"var(--font-display)", fontWeight:"600", backdropFilter:"blur(10px)", boxShadow:"0 8px 32px rgba(0,0,0,0.4)", animation:"slideUp 0.3s ease" }}>
    {toast.type==="error"?"❌":"✅"} {toast.msg}
  </div>
);

export const ModalHeader = ({ title, onClose }) => (
  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
    <h3 style={{ fontFamily:"var(--font-display)", fontSize:"16px", fontWeight:"800", color:"#e8e8f0" }}>{title}</h3>
    <button onClick={onClose} style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"8px", width:"32px", height:"32px", color:"rgba(255,255,255,0.6)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><CloseIcon /></button>
  </div>
);

export const FormActions = ({ onCancel, saving, label }) => (
  <div style={{ display:"flex", gap:"10px", marginTop:"8px" }}>
    <button type="button" onClick={onCancel} style={{ flex:1, padding:"11px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"10px", color:"rgba(255,255,255,0.5)", fontSize:"13px", cursor:"pointer", fontFamily:"var(--font-display)", fontWeight:"600" }}>Cancel</button>
    <button type="submit" disabled={saving} style={{ flex:2, padding:"11px", background:"linear-gradient(135deg,#6c63ff,#4f46e5)", border:"none", borderRadius:"10px", color:"#fff", fontSize:"13px", fontFamily:"var(--font-display)", fontWeight:"700", cursor:saving?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", boxShadow:"0 4px 20px rgba(108,99,255,0.4)" }}>
      {saving && <span className="spinner spinner-sm" />}
      {saving ? "Saving..." : label}
    </button>
  </div>
);

export const addBtn = { display:"flex", alignItems:"center", gap:"6px", padding:"8px 16px", background:"linear-gradient(135deg,#6c63ff,#4f46e5)", border:"none", borderRadius:"10px", color:"#fff", fontSize:"13px", fontFamily:"var(--font-display)", fontWeight:"600", cursor:"pointer", boxShadow:"0 4px 16px rgba(108,99,255,0.4)" };
export const modalStyle = { position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)", zIndex:101, width:"min(95vw,600px)", maxHeight:"90vh", overflowY:"auto", background:"#111124", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"20px", padding:"28px", boxShadow:"0 24px 80px rgba(0,0,0,0.7)", scrollbarWidth:"none" };
export const lbl = { fontSize:"11px", fontWeight:"600", color:"rgba(255,255,255,0.4)", fontFamily:"var(--font-display)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:"6px", display:"block" };
export const inp = { width:"100%", padding:"10px 14px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:"10px", color:"#e8e8f0", fontSize:"13px", fontFamily:"var(--font-body)", outline:"none", display:"block", boxSizing:"border-box" };
