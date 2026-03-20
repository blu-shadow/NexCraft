// ═══════════════════════════════════════════════════════════
//                       FOOTER
// ═══════════════════════════════════════════════════════════
import { Link } from "react-router-dom";
import { useContext } from "react";
import { SiteContext } from "../../context/SiteContext";

const Footer = () => {
  const site = useContext(SiteContext) || {};
  const { siteName="1000 Din", social={}, contact={} } = site;

  const year = new Date().getFullYear();

  const LINKS = {
    Pages    : [{ label:"Home","/":"" },{ label:"YouTube", to:"/youtube" },{ label:"Blog", to:"/blog" },{ label:"Profile", to:"/profile" }],
    Services : [{ label:"Web Design" },{ label:"App Development" },{ label:"Game Dev" },{ label:"Motherboard Repair" }],
    Info     : [{ label:"About Us" },{ label:"Privacy Policy", to:"/settings?tab=privacy" },{ label:"Certificates" },{ label:"Contact" }],
  };

  const SOCIALS = [
    { key:"facebook",  icon:"📘", color:"#1877f2" },
    { key:"youtube",   icon:"▶️", color:"#ff0000" },
    { key:"instagram", icon:"📷", color:"#e1306c" },
    { key:"github",    icon:"🐙", color:"#e8e8f0" },
  ];

  return (
    <footer style={{
      background  : "linear-gradient(180deg,var(--clr-bg) 0%,#080812 100%)",
      borderTop   : "1px solid var(--clr-border)",
      marginBottom: "var(--bottom-nav-height)",
    }}>
      {/* ── Main content */}
      <div className="container" style={{ padding:"48px 20px 32px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:"32px" }} className="footer-grid">

          {/* Brand column */}
          <div>
            <Link to="/" style={{ display:"inline-flex", alignItems:"center", gap:"10px", textDecoration:"none", marginBottom:"16px" }}>
              <div style={{ width:"36px", height:"36px", background:"linear-gradient(135deg,#6c63ff,#f59e0b)", borderRadius:"10px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px", fontWeight:"800", color:"#fff", fontFamily:"var(--font-display)", boxShadow:"0 4px 14px rgba(108,99,255,0.3)" }}>1K</div>
              <span style={{ fontFamily:"var(--font-display)", fontWeight:"800", fontSize:"18px", color:"var(--clr-text)", letterSpacing:"-0.3px" }}>{siteName}</span>
            </Link>
            <p style={{ fontSize:"13px", color:"var(--clr-text-muted)", lineHeight:"1.7", maxWidth:"280px", marginBottom:"20px", fontFamily:"var(--font-body)" }}>
              Professional web design, development, app making, game development and hardware repair services.
            </p>

            {/* Social icons */}
            <div style={{ display:"flex", gap:"8px" }}>
              {SOCIALS.map(({ key, icon, color }) =>
                social[key] ? (
                  <a key={key} href={social[key]} target="_blank" rel="noreferrer"
                    style={{ width:"34px", height:"34px", borderRadius:"9px", background:`${color}14`, border:`1px solid ${color}25`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px", textDecoration:"none", transition:"all 0.2s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.background=`${color}25`; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.background=`${color}14`; }}
                  >{icon}</a>
                ) : null
              )}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([heading, links]) => (
            <div key={heading}>
              <p style={{ fontFamily:"var(--font-display)", fontWeight:"700", fontSize:"12px", color:"var(--clr-text)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"14px" }}>{heading}</p>
              <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                {links.map((link) => (
                  link.to
                    ? <Link key={link.label} to={link.to} style={{ fontSize:"13px", color:"var(--clr-text-muted)", textDecoration:"none", transition:"color 0.2s", fontFamily:"var(--font-body)" }}
                        onMouseEnter={(e) => e.currentTarget.style.color="var(--clr-primary-light)"}
                        onMouseLeave={(e) => e.currentTarget.style.color="var(--clr-text-muted)"}
                      >{link.label}</Link>
                    : <span key={link.label} style={{ fontSize:"13px", color:"var(--clr-text-muted)", fontFamily:"var(--font-body)", cursor:"default" }}>{link.label}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom bar */}
      <div style={{ borderTop:"1px solid var(--clr-border)", padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"10px" }}>
        <p style={{ fontSize:"12px", color:"var(--clr-text-muted)", fontFamily:"var(--font-body)" }}>
          © {year} <span style={{ color:"var(--clr-primary-light)", fontWeight:"600" }}>{siteName}</span>. All rights reserved.
        </p>
        <div style={{ display:"flex", gap:"16px" }}>
          {contact.email && <a href={`mailto:${contact.email}`} style={{ fontSize:"12px", color:"var(--clr-text-muted)", textDecoration:"none" }}>{contact.email}</a>}
          {contact.phone && <span style={{ fontSize:"12px", color:"var(--clr-text-muted)" }}>{contact.phone}</span>}
        </div>
      </div>

      <style>{`
        @media(max-width:768px) { .footer-grid { grid-template-columns:1fr 1fr !important; } }
        @media(max-width:480px) { .footer-grid { grid-template-columns:1fr !important; } }
      `}</style>
    </footer>
  );
};

export default Footer;
