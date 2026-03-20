// ═══════════════════════════════════════════════════════════
//                MANAGE SERVICES PAGE
// ═══════════════════════════════════════════════════════════
import { useState, useEffect, useRef } from "react";
import DataTable, { StatusBadge }       from "../components/DataTable";
import { getAllServices, createService, updateService, deleteService, toggleServiceStatus } from "../../services/serviceOrderService";
import { SERVICE_CATEGORIES } from "../../utils/constants";

const CloseIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const PlusIcon  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const UploadIcon= () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>;

const EMPTY_FORM = { title:"", shortDescription:"", fullDescription:"", category:"web-design", icon:"🛠️", deliveryTime:"", isFeatured:false, pricing:{ type:"negotiable", minPrice:0, maxPrice:0, currency:"BDT" }, features:[] };

const ManageServices = () => {
  const [services, setServices] = useState([]);
  const [loading,  setLoading ] = useState(true);
  const [modal,    setModal   ] = useState(false);
  const [editing,  setEditing ] = useState(null);
  const [form,     setForm    ] = useState(EMPTY_FORM);
  const [image,    setImage   ] = useState(null);
  const [preview,  setPreview ] = useState(null);
  const [saving,   setSaving  ] = useState(false);
  const [toast,    setToast   ] = useState(null);
  const [featureInput, setFeatureInput] = useState("");
  const imgRef = useRef();

  const showToast = (msg, type="success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const load = async () => {
    setLoading(true);
    try {
      const res = await getAllServices();
      setServices(res.services || []);
    } catch { setServices([]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setImage(null); setPreview(null); setModal(true); };
  const openEdit   = (row) => {
    setEditing(row);
    setForm({
      title            : row.title || "",
      shortDescription : row.shortDescription || "",
      fullDescription  : row.fullDescription  || "",
      category         : row.category  || "web-design",
      icon             : row.icon      || "🛠️",
      deliveryTime     : row.deliveryTime || "",
      isFeatured       : row.isFeatured   || false,
      pricing          : row.pricing      || EMPTY_FORM.pricing,
      features         : row.features     || [],
    });
    setPreview(row.image?.url || null);
    setImage(null);
    setModal(true);
  };

  const handleImage = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setImage(f);
    setPreview(URL.createObjectURL(f));
  };

  const addFeature = () => {
    if (!featureInput.trim()) return;
    setForm((f) => ({ ...f, features:[...f.features, { text:featureInput.trim(), isIncluded:true }] }));
    setFeatureInput("");
  };

  const removeFeature = (i) => setForm((f) => ({ ...f, features:f.features.filter((_,idx) => idx!==i) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.shortDescription || !form.fullDescription) return showToast("Fill all required fields", "error");
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === "features" || k === "pricing") fd.append(k, JSON.stringify(v));
        else fd.append(k, v);
      });
      if (image) fd.append("image", image);
      if (editing) await updateService(editing._id, fd);
      else         await createService(fd);
      showToast(editing ? "Service updated!" : "Service created!");
      setModal(false);
      load();
    } catch (err) { showToast(err.response?.data?.message || "Failed", "error"); }
    setSaving(false);
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete "${row.title}"?`)) return;
    try { await deleteService(row._id); showToast("Service deleted"); load(); }
    catch { showToast("Delete failed","error"); }
  };

  const handleToggle = async (row) => {
    try { await toggleServiceStatus(row._id); load(); }
    catch { showToast("Toggle failed","error"); }
  };

  const columns = [
    { key:"icon",  label:"",       width:"50px",  sortable:false, render:(v) => <span style={{ fontSize:"24px" }}>{v}</span> },
    { key:"title", label:"Service",render:(v, row) => (
        <div>
          <p style={{ fontSize:"13px", color:"#e8e8f0", fontWeight:"600", fontFamily:"var(--font-display)" }}>{v}</p>
          <p style={{ fontSize:"11px", color:"rgba(255,255,255,0.35)", marginTop:"2px" }}>{row.shortDescription?.slice(0,60)}...</p>
        </div>
      )
    },
    { key:"category",  label:"Category", render:(v) => <span style={{ fontSize:"12px", color:"rgba(255,255,255,0.5)", textTransform:"capitalize" }}>{v?.replace("-"," ")}</span> },
    { key:"pricing",   label:"Pricing",  render:(v) => <span style={{ fontSize:"12px", color:"#fbbf24", fontFamily:"var(--font-display)", fontWeight:"600" }}>{v?.type === "negotiable" ? "Negotiable" : v?.type === "free" ? "Free" : `৳${v?.minPrice}${v?.maxPrice ? "–৳"+v?.maxPrice : ""}`}</span> },
    { key:"totalOrders",label:"Orders",  render:(v) => <span style={{ fontSize:"13px", fontFamily:"var(--font-display)", color:"#a78bfa", fontWeight:"700" }}>{v || 0}</span> },
    { key:"isActive",  label:"Status",   render:(v, row) => (
        <button onClick={(e) => { e.stopPropagation(); handleToggle(row); }}
          style={{ padding:"3px 12px", borderRadius:"20px", border:"none", cursor:"pointer", fontSize:"11px", fontWeight:"700", fontFamily:"var(--font-display)", background: v ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)", color: v ? "#34d399" : "#f87171" }}
        >
          {v ? "Active" : "Inactive"}
        </button>
      )
    },
    { key:"isFeatured",label:"Featured", sortable:false, render:(v) => v ? <span style={{ color:"#fbbf24", fontSize:"16px" }}>⭐</span> : <span style={{ color:"rgba(255,255,255,0.2)", fontSize:"16px" }}>☆</span> },
  ];

  return (
    <div>
      {toast && <div style={{ position:"fixed", bottom:"24px", right:"24px", zIndex:999, padding:"12px 20px", background: toast.type==="error" ? "rgba(239,68,68,0.15)":"rgba(16,185,129,0.15)", border:`1px solid ${toast.type==="error" ? "rgba(239,68,68,0.3)":"rgba(16,185,129,0.3)"}`, borderRadius:"12px", color:toast.type==="error" ? "#f87171":"#34d399", fontSize:"13px", fontFamily:"var(--font-display)", fontWeight:"600", backdropFilter:"blur(10px)" }}>{toast.type==="error" ? "❌":"✅"} {toast.msg}</div>}

      <DataTable
        title="Services"
        columns={columns}
        data={services}
        loading={loading}
        onEdit={openEdit}
        onDelete={handleDelete}
        emptyText="No services yet. Add your first service!"
        emptyIcon="🛠️"
        onRefresh={load}
        headerExtra={
          <button onClick={openCreate} style={{ display:"flex", alignItems:"center", gap:"6px", padding:"8px 16px", background:"linear-gradient(135deg,#6c63ff,#4f46e5)", border:"none", borderRadius:"10px", color:"#fff", fontSize:"13px", fontFamily:"var(--font-display)", fontWeight:"600", cursor:"pointer", boxShadow:"0 4px 16px rgba(108,99,255,0.4)" }}>
            <PlusIcon /> Add Service
          </button>
        }
      />

      {/* ── Modal */}
      {modal && (
        <>
          <div className="overlay" onClick={() => setModal(false)} />
          <div style={{
            position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)",
            zIndex:101, width:"min(95vw,680px)", maxHeight:"90vh", overflowY:"auto",
            background:"#111124", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"20px",
            padding:"28px", boxShadow:"0 24px 80px rgba(0,0,0,0.7)",
            scrollbarWidth:"none",
          }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"24px" }}>
              <h3 style={{ fontFamily:"var(--font-display)", fontSize:"16px", fontWeight:"800", color:"#e8e8f0" }}>
                {editing ? "Edit Service" : "Add New Service"}
              </h3>
              <button onClick={() => setModal(false)} style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"8px", width:"32px", height:"32px", color:"rgba(255,255,255,0.6)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><CloseIcon /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
              {/* Image upload */}
              <div>
                <label style={lbl}>Service Image</label>
                <div onClick={() => imgRef.current?.click()} style={{ background:"rgba(255,255,255,0.03)", border:"2px dashed rgba(255,255,255,0.1)", borderRadius:"12px", padding:"20px", textAlign:"center", cursor:"pointer", position:"relative", overflow:"hidden", minHeight:"120px", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"8px", transition:"border-color 0.2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor="rgba(108,99,255,0.4)"}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor="rgba(255,255,255,0.1)"}
                >
                  {preview ? <img src={preview} alt="" style={{ maxHeight:"100px", maxWidth:"100%", objectFit:"contain", borderRadius:"8px" }} /> : <><UploadIcon /><span style={{ fontSize:"13px", color:"rgba(255,255,255,0.4)", fontFamily:"var(--font-body)" }}>Click to upload image</span></>}
                  <input ref={imgRef} type="file" accept="image/*" onChange={handleImage} style={{ display:"none" }} />
                </div>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                <div>
                  <label style={lbl}>Title *</label>
                  <input value={form.title} onChange={(e) => setForm({...form,title:e.target.value})} placeholder="Web Design" style={inp} required />
                </div>
                <div>
                  <label style={lbl}>Icon (emoji)</label>
                  <input value={form.icon} onChange={(e) => setForm({...form,icon:e.target.value})} placeholder="🛠️" style={{ ...inp, fontSize:"20px", textAlign:"center" }} />
                </div>
              </div>

              <div>
                <label style={lbl}>Category *</label>
                <select value={form.category} onChange={(e) => setForm({...form,category:e.target.value})} style={{ ...inp, cursor:"pointer" }}>
                  {SERVICE_CATEGORIES.map((c) => <option key={c.value} value={c.value} style={{ background:"#111124" }}>{c.icon} {c.label}</option>)}
                </select>
              </div>

              <div>
                <label style={lbl}>Short Description * (max 200 chars)</label>
                <input value={form.shortDescription} onChange={(e) => setForm({...form,shortDescription:e.target.value})} placeholder="Brief summary of this service..." style={inp} maxLength={200} required />
              </div>

              <div>
                <label style={lbl}>Full Description *</label>
                <textarea value={form.fullDescription} onChange={(e) => setForm({...form,fullDescription:e.target.value})} placeholder="Detailed description..." style={{ ...inp, minHeight:"100px", resize:"vertical" }} required />
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"12px" }}>
                <div>
                  <label style={lbl}>Pricing Type</label>
                  <select value={form.pricing.type} onChange={(e) => setForm({...form,pricing:{...form.pricing,type:e.target.value}})} style={{ ...inp, cursor:"pointer" }}>
                    {["fixed","range","negotiable","free"].map((t) => <option key={t} value={t} style={{ background:"#111124" }}>{t}</option>)}
                  </select>
                </div>
                {form.pricing.type !== "negotiable" && form.pricing.type !== "free" && <>
                  <div>
                    <label style={lbl}>Min Price (৳)</label>
                    <input type="number" value={form.pricing.minPrice} onChange={(e) => setForm({...form,pricing:{...form.pricing,minPrice:e.target.value}})} style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>Max Price (৳)</label>
                    <input type="number" value={form.pricing.maxPrice} onChange={(e) => setForm({...form,pricing:{...form.pricing,maxPrice:e.target.value}})} style={inp} />
                  </div>
                </>}
                <div>
                  <label style={lbl}>Delivery Time</label>
                  <input value={form.deliveryTime} onChange={(e) => setForm({...form,deliveryTime:e.target.value})} placeholder="3-5 days" style={inp} />
                </div>
              </div>

              {/* Features */}
              <div>
                <label style={lbl}>Features</label>
                <div style={{ display:"flex", gap:"8px", marginBottom:"8px" }}>
                  <input value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} onKeyDown={(e) => e.key==="Enter" && (e.preventDefault(), addFeature())} placeholder="Add a feature..." style={{ ...inp, flex:1, marginBottom:0 }} />
                  <button type="button" onClick={addFeature} style={{ padding:"0 16px", background:"rgba(108,99,255,0.2)", border:"1px solid rgba(108,99,255,0.3)", borderRadius:"10px", color:"#a78bfa", cursor:"pointer", fontFamily:"var(--font-display)", fontWeight:"600", fontSize:"13px" }}>Add</button>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
                  {form.features.map((f, i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:"8px", padding:"8px 12px", background:"rgba(255,255,255,0.04)", borderRadius:"8px" }}>
                      <span style={{ color:"#34d399", flexShrink:0 }}>✓</span>
                      <span style={{ flex:1, fontSize:"13px", color:"rgba(255,255,255,0.7)" }}>{f.text}</span>
                      <button type="button" onClick={() => removeFeature(i)} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(239,68,68,0.6)", fontSize:"16px", lineHeight:1 }}>×</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Featured toggle */}
              <label style={{ display:"flex", alignItems:"center", gap:"10px", cursor:"pointer" }}>
                <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({...form,isFeatured:e.target.checked})} style={{ accentColor:"#6c63ff", width:"16px", height:"16px" }} />
                <span style={{ fontSize:"13px", color:"rgba(255,255,255,0.6)", fontFamily:"var(--font-body)" }}>Mark as Featured (shows on Home page)</span>
              </label>

              {/* Submit */}
              <div style={{ display:"flex", gap:"10px", marginTop:"8px" }}>
                <button type="button" onClick={() => setModal(false)} style={{ flex:1, padding:"11px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"10px", color:"rgba(255,255,255,0.5)", fontSize:"13px", cursor:"pointer", fontFamily:"var(--font-display)", fontWeight:"600" }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ flex:2, padding:"11px", background:"linear-gradient(135deg,#6c63ff,#4f46e5)", border:"none", borderRadius:"10px", color:"#fff", fontSize:"13px", fontFamily:"var(--font-display)", fontWeight:"700", cursor:saving?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", boxShadow:"0 4px 20px rgba(108,99,255,0.4)" }}>
                  {saving && <span className="spinner spinner-sm" />}
                  {saving ? "Saving..." : editing ? "Save Changes" : "Create Service"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

const lbl = { fontSize:"11px", fontWeight:"600", color:"rgba(255,255,255,0.4)", fontFamily:"var(--font-display)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:"6px", display:"block" };
const inp = { width:"100%", padding:"10px 14px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:"10px", color:"#e8e8f0", fontSize:"13px", fontFamily:"var(--font-body)", outline:"none", display:"block", boxSizing:"border-box" };

export default ManageServices;
