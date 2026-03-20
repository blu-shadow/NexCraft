// ═══════════════════════════════════════════════════════════
//                   SETTINGS PAGE
//        Privacy, About, Certificates, Theme
// ═══════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar      from "../components/common/Navbar";
import ThemeToggle from "../components/common/ThemeToggle";
import useTheme    from "../hooks/useTheme";
import { getSiteConfig } from "../services/adminService";
import { formatDate }    from "../utils/formatDate";

const TABS = [
  { key:"theme",        label:"Appearance",   icon:"🎨" },
  { key:"about",        label:"About",         icon:"ℹ️"  },
  { key:"privacy",      label:"Privacy Policy",icon:"🔒" },
  { key:"certificates", label:"Certificates",  icon:"🏆" },
];

const SettingsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { theme, isDark, changeTheme }  = useTheme();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "theme");
  const [config,    setConfig   ] = useState(null);
  const [loading,   setLoading  ] = useState(true);

  useEffect(() => {
    getSiteConfig().then((r) => { setConfig(r.config); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const switchTab = (key) => {
    setActiveTab(key);
    const p = new URLSearchParams(searchParams);
    p.set("tab", key);
    setSearchParams(p);
  };

  const about = config?.about || {};
  const privacy = config?.privacy || {};
  const certs = config?.certificates || [];

  return (
    <div style={{ minHeight:"100vh", background:"var(--clr-bg)" }}>
      <Navbar />

      <div style={{ maxWidth:"840px", margin:"0 auto", padding:"80px 16px 120px" }}>
        {/* Header */}
        <div style={{ marginBottom:"28px" }}>
          <h1 style={{ fontFamily:"var(--font-display)", fontWeight:"800", fontSize:"clamp(1.5rem,3vw,2rem)", color:"var(--clr-text)", letterSpacing:"-0.5px" }}>Settings</h1>
          <p style={{ fontSize:"13px", color:"var(--clr-text-muted)", marginTop:"4px" }}>Customize your experience</p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"220px 1fr", gap:"20px" }} className="settings-grid">
          {/* ── Sidebar Tabs */}
          <div style={{ display:"flex", flexDirection:"column", gap:"4px" }}>
            {TABS.map((tab) => (
              <button key={tab.key} onClick={() => switchTab(tab.key)}
                style={{ display:"flex", alignItems:"center", gap:"10px", padding:"11px 14px", borderRadius:"12px", border:"none", cursor:"pointer", fontSize:"13.5px", fontFamily:"var(--font-display)", fontWeight:activeTab===tab.key?"700":"500", color:activeTab===tab.key?"var(--clr-text)":"var(--clr-text-muted)", background:activeTab===tab.key?"rgba(108,99,255,0.12)":"transparent", textAlign:"left", transition:"all 0.2s" }}
                onMouseEnter={(e)=>{ if(activeTab!==tab.key){e.currentTarget.style.background="rgba(255,255,255,0.04)";} }}
                onMouseLeave={(e)=>{ if(activeTab!==tab.key){e.currentTarget.style.background="transparent";} }}
              >
                <span style={{ fontSize:"16px" }}>{tab.icon}</span>
                {tab.label}
                {activeTab === tab.key && <span style={{ marginLeft:"auto", width:"4px", height:"4px", borderRadius:"50%", background:"#6c63ff" }} />}
              </button>
            ))}
          </div>

          {/* ── Content Panel */}
          <div style={{ background:"var(--clr-surface)", border:"1px solid var(--clr-border)", borderRadius:"20px", padding:"28px", minHeight:"400px" }}>

            {/* ═══ APPEARANCE TAB ═══ */}
            {activeTab === "theme" && (
              <div>
                <h2 style={sectionTitle}>Appearance</h2>
                <p style={sectionDesc}>Choose your preferred color scheme</p>

                {/* Theme options */}
                <div style={{ display:"flex", flexDirection:"column", gap:"10px", marginBottom:"28px" }}>
                  {[
                    { key:"dark",   label:"Dark Mode",    desc:"Easy on the eyes in low light",   icon:"🌙", bg:"#0f0f1a", accent:"#6c63ff" },
                    { key:"light",  label:"Light Mode",   desc:"Clean and bright interface",       icon:"☀️", bg:"#f2f2ff", accent:"#4f46e5" },
                    { key:"system", label:"System Default",desc:"Follows your device settings",   icon:"💻", bg:"linear-gradient(135deg,#0f0f1a 50%,#f2f2ff 50%)", accent:"#8b5cf6" },
                  ].map((t) => (
                    <div key={t.key}
                      onClick={() => changeTheme(t.key)}
                      style={{ display:"flex", alignItems:"center", gap:"16px", padding:"14px 16px", background: theme===t.key ? "rgba(108,99,255,0.08)" : "rgba(255,255,255,0.03)", border:`1.5px solid ${theme===t.key?"rgba(108,99,255,0.4)":"rgba(255,255,255,0.07)"}`, borderRadius:"14px", cursor:"pointer", transition:"all 0.25s" }}
                      onMouseEnter={(e)=>{ if(theme!==t.key){e.currentTarget.style.borderColor="rgba(255,255,255,0.15)";} }}
                      onMouseLeave={(e)=>{ if(theme!==t.key){e.currentTarget.style.borderColor="rgba(255,255,255,0.07)";} }}
                    >
                      {/* Color preview circle */}
                      <div style={{ width:"44px", height:"44px", borderRadius:"12px", background:t.bg, flexShrink:0, border:"2px solid rgba(255,255,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px", overflow:"hidden" }}>
                        {t.key === "system" ? (
                          <div style={{ width:"100%", height:"100%", background:"linear-gradient(135deg,#0f0f1a 50%,#f2f2ff 50%)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                            <span style={{ fontSize:"18px" }}>{t.icon}</span>
                          </div>
                        ) : t.icon}
                      </div>

                      <div style={{ flex:1 }}>
                        <p style={{ fontFamily:"var(--font-display)", fontWeight:"700", fontSize:"14px", color:"var(--clr-text)", marginBottom:"2px" }}>{t.label}</p>
                        <p style={{ fontSize:"12px", color:"var(--clr-text-muted)" }}>{t.desc}</p>
                      </div>

                      {/* Radio */}
                      <div style={{ width:"20px", height:"20px", borderRadius:"50%", border:`2px solid ${theme===t.key?"#6c63ff":"rgba(255,255,255,0.2)"}`, display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s", flexShrink:0 }}>
                        {theme === t.key && <div style={{ width:"10px", height:"10px", borderRadius:"50%", background:"#6c63ff" }} />}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick toggle */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"12px" }}>
                  <div>
                    <p style={{ fontFamily:"var(--font-display)", fontWeight:"600", fontSize:"14px", color:"var(--clr-text)", marginBottom:"2px" }}>Quick Toggle</p>
                    <p style={{ fontSize:"12px", color:"var(--clr-text-muted)" }}>Switch between dark and light instantly</p>
                  </div>
                  <ThemeToggle variant="switch" />
                </div>
              </div>
            )}

            {/* ═══ ABOUT TAB ═══ */}
            {activeTab === "about" && (
              <div>
                <h2 style={sectionTitle}>About</h2>
                {loading ? (
                  <div style={{ display:"flex", justifyContent:"center", padding:"40px" }}><span className="spinner spinner-lg" /></div>
                ) : (
                  <div>
                    {/* Founder */}
                    {about.founderName && (
                      <div style={{ display:"flex", alignItems:"center", gap:"14px", padding:"16px", background:"rgba(108,99,255,0.06)", border:"1px solid rgba(108,99,255,0.15)", borderRadius:"14px", marginBottom:"20px" }}>
                        <div style={{ width:"52px", height:"52px", borderRadius:"50%", background:"linear-gradient(135deg,#6c63ff,#a78bfa)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"22px", flexShrink:0, overflow:"hidden" }}>
                          {about.founderImage?.url ? <img src={about.founderImage.url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} /> : "👤"}
                        </div>
                        <div>
                          <p style={{ fontFamily:"var(--font-display)", fontWeight:"700", fontSize:"15px", color:"var(--clr-text)" }}>{about.founderName}</p>
                          {about.founderBio && <p style={{ fontSize:"12.5px", color:"var(--clr-text-muted)", lineHeight:"1.5" }}>{about.founderBio}</p>}
                        </div>
                      </div>
                    )}

                    {about.content && (
                      <div style={{ marginBottom:"20px" }}>
                        <h3 style={{ fontFamily:"var(--font-display)", fontWeight:"700", fontSize:"14px", color:"var(--clr-text)", marginBottom:"8px" }}>About Us</h3>
                        <p style={{ fontSize:"14px", color:"var(--clr-text-muted)", lineHeight:"1.75", fontFamily:"var(--font-body)" }}>{about.content}</p>
                      </div>
                    )}

                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px" }}>
                      {about.mission && (
                        <InfoCard icon="🎯" title="Mission" text={about.mission} color="#6c63ff" />
                      )}
                      {about.vision && (
                        <InfoCard icon="🔭" title="Vision" text={about.vision} color="#10b981" />
                      )}
                    </div>

                    {!about.content && !about.founderName && (
                      <div style={{ textAlign:"center", padding:"40px", color:"var(--clr-text-muted)" }}>
                        <div style={{ fontSize:"40px", marginBottom:"12px" }}>ℹ️</div>
                        <p>About information will be added soon.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ═══ PRIVACY TAB ═══ */}
            {activeTab === "privacy" && (
              <div>
                <h2 style={sectionTitle}>Privacy Policy</h2>
                {privacy.lastUpdated && (
                  <p style={{ fontSize:"12px", color:"var(--clr-text-muted)", marginBottom:"20px" }}>Last updated: {formatDate(privacy.lastUpdated)}</p>
                )}
                {loading ? (
                  <div style={{ display:"flex", justifyContent:"center", padding:"40px" }}><span className="spinner spinner-lg" /></div>
                ) : privacy.content ? (
                  <div style={{
                    fontSize:"14px", color:"var(--clr-text-muted)", lineHeight:"1.85",
                    fontFamily:"var(--font-body)", whiteSpace:"pre-wrap", wordBreak:"break-word",
                    maxHeight:"500px", overflowY:"auto", scrollbarWidth:"thin",
                    padding:"4px",
                  }}>
                    {privacy.content}
                  </div>
                ) : (
                  <div style={{ textAlign:"center", padding:"40px", color:"var(--clr-text-muted)" }}>
                    <div style={{ fontSize:"40px", marginBottom:"12px" }}>🔒</div>
                    <p>Privacy policy will be added soon.</p>
                  </div>
                )}
              </div>
            )}

            {/* ═══ CERTIFICATES TAB ═══ */}
            {activeTab === "certificates" && (
              <div>
                <h2 style={sectionTitle}>Certificates & Achievements</h2>
                {loading ? (
                  <div style={{ display:"flex", justifyContent:"center", padding:"40px" }}><span className="spinner spinner-lg" /></div>
                ) : certs.length > 0 ? (
                  <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
                    {certs.map((cert, i) => (
                      <div key={cert._id || i} style={{ display:"flex", gap:"16px", padding:"16px", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"14px", transition:"all 0.2s" }}
                        onMouseEnter={(e)=>{e.currentTarget.style.borderColor="rgba(245,158,11,0.25)";e.currentTarget.style.background="rgba(245,158,11,0.04)";}}
                        onMouseLeave={(e)=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.07)";e.currentTarget.style.background="rgba(255,255,255,0.02)";}}>
                        <div style={{ width:"52px", height:"52px", borderRadius:"12px", background:"rgba(245,158,11,0.15)", border:"1px solid rgba(245,158,11,0.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"24px", flexShrink:0, overflow:"hidden" }}>
                          {cert.image?.url ? <img src={cert.image.url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} /> : "🏆"}
                        </div>
                        <div style={{ flex:1 }}>
                          <p style={{ fontFamily:"var(--font-display)", fontWeight:"700", fontSize:"14px", color:"var(--clr-text)", marginBottom:"4px" }}>{cert.title}</p>
                          {cert.issuedBy && <p style={{ fontSize:"12px", color:"var(--clr-text-muted)", marginBottom:"2px" }}>Issued by {cert.issuedBy}</p>}
                          {cert.issuedDate && <p style={{ fontSize:"11.5px", color:"rgba(255,255,255,0.25)" }}>{formatDate(cert.issuedDate)}</p>}
                          {cert.description && <p style={{ fontSize:"12.5px", color:"var(--clr-text-muted)", marginTop:"6px", lineHeight:"1.5" }}>{cert.description}</p>}
                          {cert.credentialUrl && (
                            <a href={cert.credentialUrl} target="_blank" rel="noreferrer" style={{ display:"inline-block", marginTop:"8px", fontSize:"12px", color:"#fbbf24", textDecoration:"none", fontFamily:"var(--font-display)", fontWeight:"600" }}>
                              View Credential ↗
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign:"center", padding:"40px", color:"var(--clr-text-muted)" }}>
                    <div style={{ fontSize:"40px", marginBottom:"12px" }}>🏆</div>
                    <p>No certificates added yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`@media(max-width:640px){.settings-grid{grid-template-columns:1fr !important;}}`}</style>
    </div>
  );
};

const InfoCard = ({ icon, title, text, color }) => (
  <div style={{ padding:"14px", background:`${color}0a`, border:`1px solid ${color}20`, borderRadius:"12px" }}>
    <p style={{ fontSize:"13px", fontFamily:"var(--font-display)", fontWeight:"700", color, marginBottom:"6px" }}>{icon} {title}</p>
    <p style={{ fontSize:"12.5px", color:"var(--clr-text-muted)", lineHeight:"1.6" }}>{text}</p>
  </div>
);

const sectionTitle = { fontFamily:"var(--font-display)", fontWeight:"800", fontSize:"17px", color:"var(--clr-text)", marginBottom:"6px" };
const sectionDesc  = { fontSize:"13px", color:"var(--clr-text-muted)", marginBottom:"24px", fontFamily:"var(--font-body)" };

export default SettingsPage;
