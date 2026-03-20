// ═══════════════════════════════════════════════════════════
//                  SITE SETTINGS PAGE
//         Privacy, About, Certificates, Social, SEO
// ═══════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { getSiteConfig, updateAbout, updatePrivacy, updateContact, updateSocial, updateSeo, addCertificate, deleteCertificate, toggleMaintenance } from "../../services/adminService";
import { Toast, lbl, inp } from "./ManageVideos";
import { formatDate } from "../../utils/formatDate";

const TABS = [
  { key:"about",    label:"About",        icon:"👤" },
  { key:"privacy",  label:"Privacy",      icon:"🔒" },
  { key:"certs",    label:"Certificates", icon:"🏆" },
  { key:"contact",  label:"Contact",      icon:"📞" },
  { key:"social",   label:"Social Links", icon:"🔗" },
  { key:"seo",      label:"SEO",          icon:"🔍" },
  { key:"system",   label:"System",       icon:"⚙️" },
];

const SiteSettings = () => {
  const [activeTab, setActiveTab] = useState("about");
  const [config,    setConfig   ] = useState(null);
  const [toast,     setToast    ] = useState(null);
  const [saving,    setSaving   ] = useState(false);

  const showToast = (msg, type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  const load = async () => {
    try { const r = await getSiteConfig(); setConfig(r.config); } catch {}
  };

  useEffect(() => { load(); }, []);

  const saveSection = async (saveFunc, data) => {
    setSaving(true);
    try { await saveFunc(data); showToast("Settings saved!"); load(); } catch (err) { showToast(err.response?.data?.message||"Save failed","error"); }
    setSaving(false);
  };

  if (!config) return <div style={{ padding:"40px", textAlign:"center" }}><span className="spinner spinner-lg" /></div>;

  return (
    <div>
      {toast && <Toast toast={toast} />}

      {/* Tab bar */}
      <div style={{ display:"flex", gap:"4px", marginBottom:"24px", flexWrap:"wrap" }}>
        {TABS.map((t) => (
          <button key={t.key} onClick={()=>setActiveTab(t.key)} style={{
            padding     :"8px 16px",
            borderRadius:"10px",
            border      :"1px solid",
            fontSize    :"13px",
            fontFamily  :"var(--font-display)",
            fontWeight  :"600",
            cursor      :"pointer",
            display     :"flex",
            alignItems  :"center",
            gap         :"6px",
            transition  :"all 0.2s",
            background  : activeTab===t.key ? "rgba(108,99,255,0.2)" : "rgba(255,255,255,0.04)",
            borderColor : activeTab===t.key ? "rgba(108,99,255,0.4)" : "rgba(255,255,255,0.08)",
            color       : activeTab===t.key ? "#a78bfa" : "rgba(255,255,255,0.4)",
          }}>
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      <div style={{ background:"rgba(16,16,30,0.8)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"16px", padding:"28px", maxWidth:"720px" }}>

        {/* ── ABOUT */}
        {activeTab === "about" && (
          <AboutTab config={config} saving={saving} onSave={(d)=>saveSection(updateAbout,d)} />
        )}

        {/* ── PRIVACY */}
        {activeTab === "privacy" && (
          <PrivacyTab config={config} saving={saving} onSave={(d)=>saveSection(updatePrivacy,d)} />
        )}

        {/* ── CERTIFICATES */}
        {activeTab === "certs" && (
          <CertsTab config={config} saving={saving} onAdd={(d)=>saveSection(addCertificate,d)} onDelete={async(id)=>{ await deleteCertificate(id); showToast("Certificate deleted"); load(); }} />
        )}

        {/* ── CONTACT */}
        {activeTab === "contact" && (
          <ContactTab config={config} saving={saving} onSave={(d)=>saveSection(updateContact,d)} />
        )}

        {/* ── SOCIAL */}
        {activeTab === "social" && (
          <SocialTab config={config} saving={saving} onSave={(d)=>saveSection(updateSocial,d)} />
        )}

        {/* ── SEO */}
        {activeTab === "seo" && (
          <SeoTab config={config} saving={saving} onSave={(d)=>saveSection(updateSeo,d)} />
        )}

        {/* ── SYSTEM */}
        {activeTab === "system" && (
          <SystemTab config={config} saving={saving} onToggleMaintenance={async(msg)=>{ await saveSection(toggleMaintenance,[msg]); }} />
        )}
      </div>
    </div>
  );
};

// ── About Tab
const AboutTab = ({ config, saving, onSave }) => {
  const a = config.about || {};
  const [f, setF] = useState({ title:a.title||"", content:a.content||"", mission:a.mission||"", vision:a.vision||"", founderName:a.founderName||"", founderBio:a.founderBio||"" });
  return (
    <form onSubmit={(e)=>{e.preventDefault();onSave(f);}} style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
      <SectionHeader title="About Page" desc="Shown on the About section of your website" />
      <div><label style={lbl}>Page Title</label><input value={f.title} onChange={(e)=>setF({...f,title:e.target.value})} style={inp} placeholder="About Us" /></div>
      <div><label style={lbl}>About Content</label><textarea value={f.content} onChange={(e)=>setF({...f,content:e.target.value})} style={{ ...inp, minHeight:"120px", resize:"vertical" }} placeholder="Tell your story..." /></div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px" }}>
        <div><label style={lbl}>Mission</label><textarea value={f.mission} onChange={(e)=>setF({...f,mission:e.target.value})} style={{ ...inp, minHeight:"80px", resize:"vertical" }} placeholder="Our mission..." /></div>
        <div><label style={lbl}>Vision</label><textarea value={f.vision} onChange={(e)=>setF({...f,vision:e.target.value})} style={{ ...inp, minHeight:"80px", resize:"vertical" }} placeholder="Our vision..." /></div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px" }}>
        <div><label style={lbl}>Founder Name</label><input value={f.founderName} onChange={(e)=>setF({...f,founderName:e.target.value})} style={inp} placeholder="Name" /></div>
        <div><label style={lbl}>Founder Bio</label><input value={f.founderBio} onChange={(e)=>setF({...f,founderBio:e.target.value})} style={inp} placeholder="Brief bio..." /></div>
      </div>
      <SaveBtn saving={saving} />
    </form>
  );
};

// ── Privacy Tab
const PrivacyTab = ({ config, saving, onSave }) => {
  const p = config.privacy || {};
  const [f, setF] = useState({ title:p.title||"Privacy Policy", content:p.content||"" });
  return (
    <form onSubmit={(e)=>{e.preventDefault();onSave(f);}} style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
      <SectionHeader title="Privacy Policy" desc={`Last updated: ${p.lastUpdated ? formatDate(p.lastUpdated) : "Not set"}`} />
      <div><label style={lbl}>Title</label><input value={f.title} onChange={(e)=>setF({...f,title:e.target.value})} style={inp} /></div>
      <div><label style={lbl}>Privacy Policy Content</label><textarea value={f.content} onChange={(e)=>setF({...f,content:e.target.value})} style={{ ...inp, minHeight:"300px", resize:"vertical", fontFamily:"var(--font-mono)", fontSize:"12px" }} placeholder="Write your privacy policy here. You can use markdown or plain text." /></div>
      <SaveBtn saving={saving} />
    </form>
  );
};

// ── Certificates Tab
const CertsTab = ({ config, saving, onAdd, onDelete }) => {
  const certs = config.certificates || [];
  const [f, setF] = useState({ title:"", issuedBy:"", issuedDate:"", credentialUrl:"", description:"" });
  const [adding, setAdding] = useState(false);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>
      <SectionHeader title="Certificates & Achievements" desc={`${certs.length} certificate${certs.length!==1?"s":""} added`} />

      {/* Existing */}
      <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
        {certs.map((c) => (
          <div key={c._id} style={{ display:"flex", alignItems:"center", gap:"14px", padding:"12px 16px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"10px" }}>
            <span style={{ fontSize:"24px", flexShrink:0 }}>🏆</span>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:"13px", color:"#e8e8f0", fontWeight:"600", fontFamily:"var(--font-display)" }}>{c.title}</p>
              <p style={{ fontSize:"11px", color:"rgba(255,255,255,0.35)", marginTop:"2px" }}>{c.issuedBy}{c.issuedDate && ` • ${formatDate(c.issuedDate)}`}</p>
            </div>
            <button onClick={()=>onDelete(c._id)} style={{ padding:"4px 10px", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:"6px", color:"#f87171", fontSize:"11px", cursor:"pointer", fontFamily:"var(--font-display)" }}>Remove</button>
          </div>
        ))}
        {certs.length === 0 && <p style={{ textAlign:"center", color:"rgba(255,255,255,0.25)", fontSize:"13px", padding:"20px" }}>No certificates yet</p>}
      </div>

      {/* Add form */}
      {adding ? (
        <form onSubmit={(e)=>{e.preventDefault();onAdd(f);setF({title:"",issuedBy:"",issuedDate:"",credentialUrl:"",description:""});setAdding(false);}} style={{ background:"rgba(108,99,255,0.06)", border:"1px solid rgba(108,99,255,0.2)", borderRadius:"12px", padding:"16px", display:"flex", flexDirection:"column", gap:"12px" }}>
          <p style={{ fontSize:"13px", fontWeight:"700", color:"#a78bfa", fontFamily:"var(--font-display)", marginBottom:"4px" }}>Add Certificate</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
            <div><label style={lbl}>Title *</label><input value={f.title} onChange={(e)=>setF({...f,title:e.target.value})} style={inp} placeholder="Certificate name" required /></div>
            <div><label style={lbl}>Issued By</label><input value={f.issuedBy} onChange={(e)=>setF({...f,issuedBy:e.target.value})} style={inp} placeholder="Organization" /></div>
            <div><label style={lbl}>Issue Date</label><input type="date" value={f.issuedDate} onChange={(e)=>setF({...f,issuedDate:e.target.value})} style={inp} /></div>
            <div><label style={lbl}>Credential URL</label><input value={f.credentialUrl} onChange={(e)=>setF({...f,credentialUrl:e.target.value})} style={inp} placeholder="https://..." /></div>
          </div>
          <div><label style={lbl}>Description</label><input value={f.description} onChange={(e)=>setF({...f,description:e.target.value})} style={inp} placeholder="Brief description" /></div>
          <div style={{ display:"flex", gap:"8px" }}>
            <button type="button" onClick={()=>setAdding(false)} style={{ flex:1, padding:"9px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"8px", color:"rgba(255,255,255,0.5)", fontSize:"12px", cursor:"pointer", fontFamily:"var(--font-display)", fontWeight:"600" }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ flex:2, padding:"9px", background:"linear-gradient(135deg,#6c63ff,#4f46e5)", border:"none", borderRadius:"8px", color:"#fff", fontSize:"12px", cursor:"pointer", fontFamily:"var(--font-display)", fontWeight:"700" }}>Add Certificate</button>
          </div>
        </form>
      ) : (
        <button onClick={()=>setAdding(true)} style={{ padding:"10px", background:"rgba(108,99,255,0.1)", border:"1px dashed rgba(108,99,255,0.3)", borderRadius:"10px", color:"#a78bfa", fontSize:"13px", cursor:"pointer", fontFamily:"var(--font-display)", fontWeight:"600" }}>
          + Add Certificate
        </button>
      )}
    </div>
  );
};

// ── Contact Tab
const ContactTab = ({ config, saving, onSave }) => {
  const c = config.contact || {};
  const [f, setF] = useState({ email:c.email||"", phone:c.phone||"", address:c.address||"", mapUrl:c.mapUrl||"" });
  return (
    <form onSubmit={(e)=>{e.preventDefault();onSave(f);}} style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
      <SectionHeader title="Contact Information" desc="Displayed on contact and footer sections" />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px" }}>
        <div><label style={lbl}>Email</label><input value={f.email} onChange={(e)=>setF({...f,email:e.target.value})} type="email" style={inp} placeholder="hello@1000din.com" /></div>
        <div><label style={lbl}>Phone</label><input value={f.phone} onChange={(e)=>setF({...f,phone:e.target.value})} style={inp} placeholder="+880 1X..." /></div>
      </div>
      <div><label style={lbl}>Address</label><input value={f.address} onChange={(e)=>setF({...f,address:e.target.value})} style={inp} placeholder="Dhaka, Bangladesh" /></div>
      <div><label style={lbl}>Google Maps URL</label><input value={f.mapUrl} onChange={(e)=>setF({...f,mapUrl:e.target.value})} type="url" style={inp} placeholder="https://maps.google.com/..." /></div>
      <SaveBtn saving={saving} />
    </form>
  );
};

// ── Social Tab
const SocialTab = ({ config, saving, onSave }) => {
  const s = config.social || {};
  const [f, setF] = useState({ facebook:s.facebook||"", youtube:s.youtube||"", instagram:s.instagram||"", twitter:s.twitter||"", linkedin:s.linkedin||"", github:s.github||"" });
  const platforms = [
    { key:"facebook",  label:"Facebook",  color:"#1877f2", icon:"📘" },
    { key:"youtube",   label:"YouTube",   color:"#ff0000", icon:"▶️" },
    { key:"instagram", label:"Instagram", color:"#e1306c", icon:"📷" },
    { key:"twitter",   label:"Twitter",   color:"#1da1f2", icon:"🐦" },
    { key:"linkedin",  label:"LinkedIn",  color:"#0a66c2", icon:"💼" },
    { key:"github",    label:"GitHub",    color:"#e8e8f0", icon:"🐙" },
  ];
  return (
    <form onSubmit={(e)=>{e.preventDefault();onSave(f);}} style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
      <SectionHeader title="Social Media Links" desc="Your social profiles shown on the site" />
      <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
        {platforms.map((p) => (
          <div key={p.key} style={{ display:"flex", alignItems:"center", gap:"12px" }}>
            <div style={{ width:"38px", height:"38px", borderRadius:"10px", background:`${p.color}15`, border:`1px solid ${p.color}25`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px", flexShrink:0 }}>{p.icon}</div>
            <input value={f[p.key]} onChange={(e)=>setF({...f,[p.key]:e.target.value})} style={{ ...inp, flex:1 }} placeholder={`${p.label} URL`} type="url" />
          </div>
        ))}
      </div>
      <SaveBtn saving={saving} />
    </form>
  );
};

// ── SEO Tab
const SeoTab = ({ config, saving, onSave }) => {
  const s = config.seo || {};
  const [f, setF] = useState({ metaTitle:s.metaTitle||"", metaDescription:s.metaDescription||"", metaKeywords:JSON.stringify(s.metaKeywords||[]) });
  return (
    <form onSubmit={(e)=>{e.preventDefault();onSave({...f,metaKeywords:f.metaKeywords});}} style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
      <SectionHeader title="SEO Settings" desc="Controls how your site appears in search engines" />
      <div><label style={lbl}>Meta Title</label><input value={f.metaTitle} onChange={(e)=>setF({...f,metaTitle:e.target.value})} style={inp} placeholder="1000 Din — Web & Tech Services" maxLength={60} /><p style={{ fontSize:"11px", color: f.metaTitle.length > 55 ? "#ef4444":"rgba(255,255,255,0.3)", marginTop:"4px" }}>{f.metaTitle.length}/60 chars</p></div>
      <div><label style={lbl}>Meta Description</label><textarea value={f.metaDescription} onChange={(e)=>setF({...f,metaDescription:e.target.value})} style={{ ...inp, minHeight:"80px", resize:"vertical" }} placeholder="Professional web & tech services..." maxLength={160} /><p style={{ fontSize:"11px", color: f.metaDescription.length > 155 ? "#ef4444":"rgba(255,255,255,0.3)", marginTop:"4px" }}>{f.metaDescription.length}/160 chars</p></div>
      <div><label style={lbl}>Keywords (comma separated)</label><input value={f.metaKeywords} onChange={(e)=>setF({...f,metaKeywords:e.target.value})} style={inp} placeholder="web design, app development, Bangladesh" /></div>
      <SaveBtn saving={saving} />
    </form>
  );
};

// ── System Tab
const SystemTab = ({ config, saving, onToggleMaintenance }) => {
  const m = config.maintenance || { isEnabled:false, message:"" };
  const [msg, setMsg] = useState(m.message||"");
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>
      <SectionHeader title="System Settings" desc="Maintenance mode and system controls" />
      <div style={{ padding:"20px", background: m.isEnabled ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.03)", border:`1px solid ${m.isEnabled ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.07)"}`, borderRadius:"12px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"12px" }}>
          <div>
            <p style={{ fontSize:"14px", color:"#e8e8f0", fontWeight:"700", fontFamily:"var(--font-display)" }}>🔧 Maintenance Mode</p>
            <p style={{ fontSize:"12px", color:"rgba(255,255,255,0.4)", marginTop:"3px" }}>When enabled, visitors see a maintenance message. Admins can still access the site.</p>
          </div>
          <div style={{ padding:"6px 16px", borderRadius:"20px", background: m.isEnabled ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)", color: m.isEnabled ? "#f87171" : "#34d399", fontSize:"12px", fontFamily:"var(--font-display)", fontWeight:"700" }}>
            {m.isEnabled ? "🔴 ON" : "🟢 OFF"}
          </div>
        </div>
        <div style={{ marginBottom:"12px" }}>
          <label style={lbl}>Maintenance Message</label>
          <input value={msg} onChange={(e)=>setMsg(e.target.value)} style={inp} placeholder="We are under maintenance. Please check back soon!" />
        </div>
        <button onClick={()=>onToggleMaintenance(msg)} disabled={saving} style={{ width:"100%", padding:"10px", background: m.isEnabled ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)", border:`1px solid ${m.isEnabled ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`, borderRadius:"10px", color: m.isEnabled ? "#34d399" : "#f87171", fontSize:"13px", fontFamily:"var(--font-display)", fontWeight:"700", cursor:"pointer" }}>
          {m.isEnabled ? "Turn OFF Maintenance Mode" : "Turn ON Maintenance Mode"}
        </button>
      </div>
    </div>
  );
};

// Shared micro-components
const SectionHeader = ({ title, desc }) => (
  <div style={{ marginBottom:"4px" }}>
    <h3 style={{ fontFamily:"var(--font-display)", fontSize:"16px", fontWeight:"800", color:"#e8e8f0", marginBottom:"4px" }}>{title}</h3>
    {desc && <p style={{ fontSize:"12px", color:"rgba(255,255,255,0.35)", fontFamily:"var(--font-body)" }}>{desc}</p>}
    <div style={{ height:"1px", background:"rgba(255,255,255,0.07)", marginTop:"16px" }} />
  </div>
);

const SaveBtn = ({ saving }) => (
  <button type="submit" disabled={saving} style={{ padding:"12px", background:"linear-gradient(135deg,#6c63ff,#4f46e5)", border:"none", borderRadius:"10px", color:"#fff", fontSize:"13px", fontFamily:"var(--font-display)", fontWeight:"700", cursor:saving?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", boxShadow:"0 4px 20px rgba(108,99,255,0.4)", marginTop:"8px" }}>
  {saving && <span className="spinner spinner-sm" />}
  {saving ? "Saving..." : "Save Changes"}
</button>
);

export default SiteSettings;
