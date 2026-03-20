// ═══════════════════════════════════════════════════════════
//                  MANAGE LOGO PAGE
// ═══════════════════════════════════════════════════════════
import { useState, useEffect, useRef } from "react";
import { getSiteConfig, updateBranding } from "../../services/adminService";
import { Toast, lbl, inp } from "./ManageVideos";

const UploadIcon = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>;

const ManageLogo = () => {
  const [form,    setForm   ] = useState({ siteName:"1000 Din", tagline:"Building the future, one day at a time", primaryColor:"#6c63ff", secondaryColor:"#7c3aed" });
  const [logo,    setLogo   ] = useState(null);
  const [logoPrev,setLogoPrev]=useState(null);
  const [saving,  setSaving ] = useState(false);
  const [toast,   setToast  ] = useState(null);
  const [dragging,setDragging]=useState(false);
  const logoRef = useRef();

  const showToast = (msg, type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  useEffect(() => {
    getSiteConfig().then((r) => {
      if (r?.config?.branding) {
        const b = r.config.branding;
        setForm({ siteName:b.siteName||"1000 Din", tagline:b.tagline||"", primaryColor:b.primaryColor||"#6c63ff", secondaryColor:b.secondaryColor||"#7c3aed" });
        setLogoPrev(b.logo?.url||null);
      }
    }).catch(()=>{});
  }, []);

  const handleFile = (file) => {
    if (!file) return;
    setLogo(file);
    setLogoPrev(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.siteName) return showToast("Site name required","error");
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => fd.append(k,v));
      if (logo) fd.append("logo", logo);
      await updateBranding(fd);
      showToast("Branding updated! Reload the site to see changes.");
    } catch (err) { showToast(err.response?.data?.message||"Failed","error"); }
    setSaving(false);
  };

  return (
    <div style={{ maxWidth:"700px" }}>
      {toast && <Toast toast={toast} />}

      <div style={{ background:"rgba(16,16,30,0.8)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"16px", padding:"28px" }}>
        <div style={{ marginBottom:"24px" }}>
          <h2 style={{ fontFamily:"var(--font-display)", fontSize:"17px", fontWeight:"800", color:"#e8e8f0", marginBottom:"6px" }}>Logo & Branding</h2>
          <p style={{ fontSize:"13px", color:"rgba(255,255,255,0.4)" }}>Update your site logo, name, and brand colors.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:"22px" }}>
          {/* Logo Upload */}
          <div>
            <label style={lbl}>Site Logo</label>
            <div
              onDragOver={(e)=>{e.preventDefault();setDragging(true);}}
              onDragLeave={()=>setDragging(false)}
              onDrop={handleDrop}
              onClick={()=>logoRef.current?.click()}
              style={{
                background   : dragging ? "rgba(108,99,255,0.08)" : "rgba(255,255,255,0.02)",
                border       : `2px dashed ${dragging ? "rgba(108,99,255,0.5)" : "rgba(255,255,255,0.1)"}`,
                borderRadius : "16px",
                padding      : "32px",
                textAlign    : "center",
                cursor       : "pointer",
                display      : "flex",
                flexDirection: "column",
                alignItems   : "center",
                gap          : "12px",
                transition   : "all 0.2s",
                minHeight    : "160px",
                justifyContent: "center",
              }}
              onMouseEnter={(e)=>{if(!dragging){e.currentTarget.style.borderColor="rgba(108,99,255,0.3)";e.currentTarget.style.background="rgba(108,99,255,0.04)";} }}
              onMouseLeave={(e)=>{if(!dragging){e.currentTarget.style.borderColor="rgba(255,255,255,0.1)";e.currentTarget.style.background="rgba(255,255,255,0.02)";} }}
            >
              {logoPrev ? (
                <>
                  <img src={logoPrev} alt="Logo preview" style={{ maxHeight:"80px", maxWidth:"240px", objectFit:"contain" }} />
                  <span style={{ fontSize:"12px", color:"rgba(255,255,255,0.3)" }}>Click to change logo</span>
                </>
              ) : (
                <>
                  <span style={{ color:"rgba(255,255,255,0.2)" }}><UploadIcon /></span>
                  <div>
                    <p style={{ fontSize:"14px", fontFamily:"var(--font-display)", fontWeight:"600", color:"rgba(255,255,255,0.5)", marginBottom:"4px" }}>
                      Drop logo here or click to upload
                    </p>
                    <p style={{ fontSize:"12px", color:"rgba(255,255,255,0.25)" }}>PNG, JPG, SVG, WebP — recommended 200×60px</p>
                  </div>
                </>
              )}
              <input ref={logoRef} type="file" accept="image/*" onChange={(e)=>handleFile(e.target.files[0])} style={{ display:"none" }} />
            </div>
          </div>

          {/* Site Name */}
          <div>
            <label style={lbl}>Site Name *</label>
            <input value={form.siteName} onChange={(e)=>setForm({...form,siteName:e.target.value})} placeholder="1000 Din" style={inp} required />
          </div>

          {/* Tagline */}
          <div>
            <label style={lbl}>Tagline</label>
            <input value={form.tagline} onChange={(e)=>setForm({...form,tagline:e.target.value})} placeholder="Building the future, one day at a time" style={inp} />
          </div>

          {/* Colors */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px" }}>
            <div>
              <label style={lbl}>Primary Color</label>
              <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                <input type="color" value={form.primaryColor} onChange={(e)=>setForm({...form,primaryColor:e.target.value})} style={{ width:"44px", height:"44px", border:"none", background:"none", cursor:"pointer", padding:0, borderRadius:"8px" }} />
                <input value={form.primaryColor} onChange={(e)=>setForm({...form,primaryColor:e.target.value})} style={{ ...inp, flex:1, fontFamily:"var(--font-mono)", fontSize:"13px" }} />
              </div>
            </div>
            <div>
              <label style={lbl}>Secondary Color</label>
              <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                <input type="color" value={form.secondaryColor} onChange={(e)=>setForm({...form,secondaryColor:e.target.value})} style={{ width:"44px", height:"44px", border:"none", background:"none", cursor:"pointer", padding:0, borderRadius:"8px" }} />
                <input value={form.secondaryColor} onChange={(e)=>setForm({...form,secondaryColor:e.target.value})} style={{ ...inp, flex:1, fontFamily:"var(--font-mono)", fontSize:"13px" }} />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"12px", padding:"20px" }}>
            <p style={{ ...lbl, marginBottom:"14px" }}>Live Preview</p>
            <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
              {logoPrev
                ? <img src={logoPrev} alt="" style={{ height:"40px", objectFit:"contain" }} />
                : <div style={{ width:"40px", height:"40px", background:`linear-gradient(135deg,${form.primaryColor},${form.secondaryColor})`, borderRadius:"10px", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:"800", fontFamily:"var(--font-display)", fontSize:"16px" }}>1K</div>
              }
              <div>
                <p style={{ fontFamily:"var(--font-display)", fontWeight:"800", fontSize:"16px", color:"#e8e8f0", letterSpacing:"-0.3px" }}>{form.siteName}</p>
                {form.tagline && <p style={{ fontSize:"11px", color:"rgba(255,255,255,0.35)", marginTop:"2px" }}>{form.tagline}</p>}
              </div>
            </div>
            <div style={{ marginTop:"14px", display:"flex", gap:"8px" }}>
              <div style={{ padding:"8px 20px", background:`linear-gradient(135deg,${form.primaryColor},${form.secondaryColor})`, borderRadius:"20px", color:"#fff", fontSize:"12px", fontFamily:"var(--font-display)", fontWeight:"600" }}>Primary Button</div>
              <div style={{ padding:"8px 20px", background:"transparent", border:`1.5px solid ${form.primaryColor}`, borderRadius:"20px", color:form.primaryColor, fontSize:"12px", fontFamily:"var(--font-display)", fontWeight:"600" }}>Secondary</div>
            </div>
          </div>

          <button type="submit" disabled={saving} style={{ padding:"13px", background:"linear-gradient(135deg,#6c63ff,#4f46e5)", border:"none", borderRadius:"12px", color:"#fff", fontSize:"14px", fontFamily:"var(--font-display)", fontWeight:"700", cursor:saving?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", boxShadow:"0 4px 20px rgba(108,99,255,0.4)" }}>
            {saving && <span className="spinner spinner-sm" />}
            {saving ? "Saving..." : "Save Branding"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ManageLogo;
