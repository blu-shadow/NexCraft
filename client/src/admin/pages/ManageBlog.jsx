// ═══════════════════════════════════════════════════════════
//                  MANAGE BLOG PAGE
// ═══════════════════════════════════════════════════════════
import { useState, useEffect, useRef } from "react";
import DataTable               from "../components/DataTable";
import { Toast, ModalHeader, FormActions, addBtn, modalStyle, lbl, inp } from "./ManageVideos";
import { adminGetAllBlogs, createBlog, updateBlog, deleteBlog, uploadBlogVideo, deleteBlogVideo } from "../../services/blogService";
import { BLOG_CATEGORIES } from "../../utils/constants";
import { timeAgo }         from "../../utils/formatDate";

const PlusIcon   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const VideoIcon  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>;
const UploadIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>;

const EMPTY = { title:"", content:"", excerpt:"", category:"tutorial", tags:"", status:"draft", isFeatured:false };

const ManageBlog = () => {
  const [blogs,    setBlogs  ] = useState([]);
  const [loading,  setLoading] = useState(true);
  const [modal,    setModal  ] = useState(false);
  const [editing,  setEditing] = useState(null);
  const [form,     setForm   ] = useState(EMPTY);
  const [thumbnail,setThumbnail]=useState(null);
  const [thumbPrev,setThumbPrev]=useState(null);
  const [saving,   setSaving ] = useState(false);
  const [toast,    setToast  ] = useState(null);
  const [videoModal,setVideoModal]=useState(null); // blog id for video upload
  const [videoFile, setVideoFile ] = useState(null);
  const [uploadProg,setUploadProg] = useState(0);
  const [uploading, setUploading ] = useState(false);
  const thumbRef = useRef();
  const videoRef = useRef();

  const showToast = (msg, type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  const load = async () => {
    setLoading(true);
    try { const r = await adminGetAllBlogs({ limit:100 }); setBlogs(r.blogs||[]); } catch { setBlogs([]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setThumbnail(null); setThumbPrev(null); setModal(true); };
  const openEdit   = (row) => {
    setEditing(row);
    setForm({ title:row.title||"", content:row.content||"", excerpt:row.excerpt||"", category:row.category||"tutorial", tags:(row.tags||[]).join(", "), status:row.status||"draft", isFeatured:row.isFeatured||false });
    setThumbPrev(row.thumbnail?.url||null);
    setThumbnail(null);
    setModal(true);
  };

  const handleThumb = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setThumbnail(f);
    setThumbPrev(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content) return showToast("Title and content required","error");
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => fd.append(k, typeof v === "boolean" ? String(v) : v));
      if (thumbnail) fd.append("thumbnail", thumbnail);
      if (editing) await updateBlog(editing._id, fd);
      else         await createBlog(fd);
      showToast(editing?"Blog updated!":"Blog created!");
      setModal(false); load();
    } catch (err) { showToast(err.response?.data?.message||"Failed","error"); }
    setSaving(false);
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete "${row.title}"?`)) return;
    try { await deleteBlog(row._id); showToast("Blog deleted"); load(); } catch { showToast("Delete failed","error"); }
  };

  const handleVideoUpload = async () => {
    if (!videoFile || !videoModal) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("video", videoFile);
      await uploadBlogVideo(videoModal, fd, setUploadProg);
      showToast("Video uploaded!"); setVideoModal(null); setVideoFile(null); load();
    } catch (err) { showToast(err.response?.data?.message||"Upload failed","error"); }
    setUploading(false);
  };

  const handleDeleteVideo = async (row) => {
    if (!window.confirm("Remove this video?")) return;
    try { await deleteBlogVideo(row._id); showToast("Video removed"); load(); } catch { showToast("Failed","error"); }
  };

  const columns = [
    { key:"thumbnail", label:"", width:"70px", sortable:false, render:(v) => v?.url ? <img src={v.url} alt="" style={{ width:"60px", height:"38px", objectFit:"cover", borderRadius:"6px" }} /> : <div style={{ width:"60px", height:"38px", background:"rgba(255,255,255,0.05)", borderRadius:"6px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"20px" }}>📝</div> },
    { key:"title",    label:"Title",  render:(v,row) => (
        <div>
          <p style={{ fontSize:"13px", color:"#e8e8f0", fontWeight:"600", fontFamily:"var(--font-display)" }}>{v}</p>
          <p style={{ fontSize:"11px", color:"rgba(255,255,255,0.35)", marginTop:"2px" }}>{row.excerpt?.slice(0,60) || "No excerpt"}</p>
        </div>
      )
    },
    { key:"category", label:"Category",render:(v)=><span style={{ fontSize:"12px", color:"rgba(255,255,255,0.5)", textTransform:"capitalize" }}>{v}</span> },
    { key:"status",   label:"Status",  render:(v)=><span style={{ fontSize:"11px", padding:"3px 10px", borderRadius:"20px", fontFamily:"var(--font-display)", fontWeight:"600", background:v==="published"?"rgba(16,185,129,0.12)":v==="draft"?"rgba(245,158,11,0.12)":"rgba(255,255,255,0.06)", color:v==="published"?"#34d399":v==="draft"?"#fbbf24":"rgba(255,255,255,0.4)" }}>{v}</span> },
    { key:"views",    label:"Views",   render:(v)=><span style={{ fontFamily:"var(--font-display)", fontSize:"13px", color:"#a78bfa", fontWeight:"700" }}>{v||0}</span> },
    { key:"video",    label:"Video",   sortable:false, render:(v,row)=>(
        <div style={{ display:"flex", gap:"6px" }}>
          {v?.url
            ? <button onClick={(e)=>{e.stopPropagation();handleDeleteVideo(row);}} style={{ padding:"4px 8px", background:"rgba(239,68,68,0.12)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:"6px", color:"#f87171", fontSize:"11px", cursor:"pointer", fontFamily:"var(--font-display)" }}>Remove</button>
            : <button onClick={(e)=>{e.stopPropagation();setVideoModal(row._id);}} style={{ padding:"4px 8px", background:"rgba(108,99,255,0.12)", border:"1px solid rgba(108,99,255,0.2)", borderRadius:"6px", color:"#a78bfa", fontSize:"11px", cursor:"pointer", fontFamily:"var(--font-display)", display:"flex", alignItems:"center", gap:"4px" }}><VideoIcon/>Upload</button>
          }
        </div>
      )
    },
    { key:"createdAt",label:"Date",    render:(v)=><span style={{ fontSize:"11px", color:"rgba(255,255,255,0.35)" }}>{timeAgo(v)}</span> },
  ];

  return (
    <div>
      {toast && <Toast toast={toast} />}

      <DataTable title="Blog Posts" columns={columns} data={blogs} loading={loading} onEdit={openEdit} onDelete={handleDelete} emptyText="No blog posts yet" emptyIcon="📝" onRefresh={load}
        headerExtra={<button onClick={openCreate} style={addBtn}><PlusIcon />New Post</button>}
      />

      {/* Blog Form Modal */}
      {modal && (
        <>
          <div className="overlay" onClick={()=>setModal(false)} />
          <div style={{ ...modalStyle, width:"min(95vw,720px)" }}>
            <ModalHeader title={editing?"Edit Blog Post":"New Blog Post"} onClose={()=>setModal(false)} />
            <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
              {/* Thumbnail */}
              <div>
                <label style={lbl}>Thumbnail Image</label>
                <div onClick={()=>thumbRef.current?.click()} style={{ background:"rgba(255,255,255,0.03)", border:"2px dashed rgba(255,255,255,0.1)", borderRadius:"12px", padding:"16px", textAlign:"center", cursor:"pointer", minHeight:"100px", display:"flex", alignItems:"center", justifyContent:"center", gap:"10px", transition:"border-color 0.2s" }}
                  onMouseEnter={(e)=>e.currentTarget.style.borderColor="rgba(108,99,255,0.4)"}
                  onMouseLeave={(e)=>e.currentTarget.style.borderColor="rgba(255,255,255,0.1)"}
                >
                  {thumbPrev ? <img src={thumbPrev} alt="" style={{ maxHeight:"80px", objectFit:"contain", borderRadius:"8px" }} /> : <><UploadIcon /><span style={{ fontSize:"13px", color:"rgba(255,255,255,0.4)" }}>Click to upload thumbnail</span></>}
                  <input ref={thumbRef} type="file" accept="image/*" onChange={handleThumb} style={{ display:"none" }} />
                </div>
              </div>

              <div>
                <label style={lbl}>Title *</label>
                <input value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} placeholder="Blog post title..." style={inp} required />
              </div>

              <div>
                <label style={lbl}>Content *</label>
                <textarea value={form.content} onChange={(e)=>setForm({...form,content:e.target.value})} placeholder="Write your blog content here..." style={{ ...inp, minHeight:"180px", resize:"vertical" }} required />
              </div>

              <div>
                <label style={lbl}>Excerpt (short summary)</label>
                <textarea value={form.excerpt} onChange={(e)=>setForm({...form,excerpt:e.target.value})} placeholder="Brief summary shown in blog list..." style={{ ...inp, minHeight:"60px", resize:"vertical" }} maxLength={300} />
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"12px" }}>
                <div>
                  <label style={lbl}>Category</label>
                  <select value={form.category} onChange={(e)=>setForm({...form,category:e.target.value})} style={{ ...inp, cursor:"pointer" }}>
                    {BLOG_CATEGORIES.map((c)=><option key={c.value} value={c.value} style={{ background:"#111124" }}>{c.icon} {c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Status</label>
                  <select value={form.status} onChange={(e)=>setForm({...form,status:e.target.value})} style={{ ...inp, cursor:"pointer" }}>
                    <option value="draft" style={{ background:"#111124" }}>Draft</option>
                    <option value="published" style={{ background:"#111124" }}>Published</option>
                    <option value="archived" style={{ background:"#111124" }}>Archived</option>
                  </select>
                </div>
                <div>
                  <label style={lbl}>Tags</label>
                  <input value={form.tags} onChange={(e)=>setForm({...form,tags:e.target.value})} placeholder="react, web, tips" style={inp} />
                </div>
              </div>

              <label style={{ display:"flex", alignItems:"center", gap:"10px", cursor:"pointer" }}>
                <input type="checkbox" checked={form.isFeatured} onChange={(e)=>setForm({...form,isFeatured:e.target.checked})} style={{ accentColor:"#6c63ff", width:"16px", height:"16px" }} />
                <span style={{ fontSize:"13px", color:"rgba(255,255,255,0.6)" }}>Mark as Featured</span>
              </label>

              <FormActions onCancel={()=>setModal(false)} saving={saving} label={editing?"Save Changes":"Publish Post"} />
            </form>
          </div>
        </>
      )}

      {/* Video Upload Modal */}
      {videoModal && (
        <>
          <div className="overlay" onClick={()=>setVideoModal(null)} />
          <div style={{ ...modalStyle, width:"min(95vw,480px)" }}>
            <ModalHeader title="Upload Blog Video" onClose={()=>setVideoModal(null)} />
            <div>
              <div onClick={()=>videoRef.current?.click()} style={{ background:"rgba(255,255,255,0.03)", border:"2px dashed rgba(255,255,255,0.1)", borderRadius:"12px", padding:"32px", textAlign:"center", cursor:"pointer", transition:"border-color 0.2s" }}
                onMouseEnter={(e)=>e.currentTarget.style.borderColor="rgba(108,99,255,0.4)"}
                onMouseLeave={(e)=>e.currentTarget.style.borderColor="rgba(255,255,255,0.1)"}
              >
                <div style={{ fontSize:"36px", marginBottom:"10px" }}>🎬</div>
                <p style={{ fontSize:"14px", color:videoFile?"#a78bfa":"rgba(255,255,255,0.4)", fontFamily:"var(--font-display)", fontWeight:"600" }}>
                  {videoFile ? videoFile.name : "Click to choose video"}
                </p>
                <p style={{ fontSize:"12px", color:"rgba(255,255,255,0.3)", marginTop:"4px" }}>MP4, MOV, MKV — max 200MB</p>
                <input ref={videoRef} type="file" accept="video/*" onChange={(e)=>setVideoFile(e.target.files[0])} style={{ display:"none" }} />
              </div>

              {uploading && (
                <div style={{ marginTop:"16px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"6px" }}>
                    <span style={{ fontSize:"12px", color:"rgba(255,255,255,0.5)", fontFamily:"var(--font-display)" }}>Uploading...</span>
                    <span style={{ fontSize:"12px", color:"#a78bfa", fontFamily:"var(--font-display)", fontWeight:"700" }}>{uploadProg}%</span>
                  </div>
                  <div style={{ height:"6px", background:"rgba(255,255,255,0.06)", borderRadius:"3px", overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${uploadProg}%`, background:"linear-gradient(90deg,#6c63ff,#a78bfa)", borderRadius:"3px", transition:"width 0.3s" }} />
                  </div>
                </div>
              )}

              <div style={{ display:"flex", gap:"10px", marginTop:"20px" }}>
                <button onClick={()=>setVideoModal(null)} style={{ flex:1, padding:"11px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"10px", color:"rgba(255,255,255,0.5)", fontSize:"13px", cursor:"pointer", fontFamily:"var(--font-display)", fontWeight:"600" }}>Cancel</button>
                <button onClick={handleVideoUpload} disabled={!videoFile||uploading} style={{ flex:2, padding:"11px", background:"linear-gradient(135deg,#6c63ff,#4f46e5)", border:"none", borderRadius:"10px", color:"#fff", fontSize:"13px", fontFamily:"var(--font-display)", fontWeight:"700", cursor:(!videoFile||uploading)?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", opacity:(!videoFile||uploading)?0.5:1 }}>
                  {uploading && <span className="spinner spinner-sm" />}
                  {uploading ? `Uploading ${uploadProg}%...` : "Upload Video"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ManageBlog;
