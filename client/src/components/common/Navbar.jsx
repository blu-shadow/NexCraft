// ═══════════════════════════════════════════════════════════
//                      NAVBAR
// ═══════════════════════════════════════════════════════════
import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth  from "../../hooks/useAuth";
import useSite  from "../../hooks/useSite";
import ThemeToggle from "./ThemeToggle";

const SearchIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const MenuIcon   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const CloseIcon  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const UserIcon   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const LogoutIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;

const NAV_LINKS = [
  { path: "/",        label: "Home"    },
  { path: "/youtube", label: "YouTube" },
  { path: "/blog",    label: "Blog"    },
];

const Navbar = () => {
  const location              = useLocation();
  const navigate              = useNavigate();
  const { user, logout, isLoggedIn } = useAuth();
  const { siteName, logoUrl } = useSite();

  const [scrolled,     setScrolled    ] = useState(false);
  const [mobileOpen,   setMobileOpen  ] = useState(false);
  const [profileOpen,  setProfileOpen ] = useState(false);
  const [searchOpen,   setSearchOpen  ] = useState(false);
  const [searchQuery,  setSearchQuery ] = useState("");
  const profileRef = useRef();
  const searchRef  = useRef();

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile on route change
  useEffect(() => { setMobileOpen(false); setProfileOpen(false); }, [location.pathname]);

  // Click outside
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/blog?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery(""); setSearchOpen(false);
    }
  };

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <>
      <nav style={{
        position      : "fixed",
        top           : 0, left: 0, right: 0,
        zIndex        : 90,
        height        : "60px",
        background    : scrolled
          ? "rgba(15,15,26,0.95)"
          : "rgba(15,15,26,0.6)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom  : scrolled
          ? "1px solid rgba(255,255,255,0.07)"
          : "1px solid transparent",
        transition    : "all 0.3s ease",
        display       : "flex",
        alignItems    : "center",
        padding       : "0 20px",
        gap           : "16px",
      }}>
        {/* ── Logo */}
        <Link to="/" style={{ display:"flex", alignItems:"center", gap:"10px", textDecoration:"none", flexShrink:0 }}>
          {logoUrl
            ? <img src={logoUrl} alt={siteName} style={{ height:"34px", objectFit:"contain" }} />
            : (
              <>
                <div style={{
                  width         : "34px", height:"34px",
                  background    : "linear-gradient(135deg,#6c63ff,#f59e0b)",
                  borderRadius  : "9px",
                  display       : "flex", alignItems:"center", justifyContent:"center",
                  fontSize      : "15px", fontWeight:"800", color:"#fff",
                  fontFamily    : "var(--font-display)",
                  boxShadow     : "0 4px 14px rgba(108,99,255,0.35)",
                  flexShrink    : 0,
                }}>
                  1K
                </div>
                <span style={{
                  fontFamily  : "var(--font-display)",
                  fontWeight  : "800",
                  fontSize    : "17px",
                  color       : "#e8e8f0",
                  letterSpacing: "-0.3px",
                }}>
                  {siteName}
                </span>
              </>
            )
          }
        </Link>

        {/* ── Desktop Nav Links */}
        <div style={{ display:"flex", alignItems:"center", gap:"4px", marginLeft:"16px" }} className="desktop-nav">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                padding       : "6px 14px",
                borderRadius  : "8px",
                textDecoration: "none",
                fontSize      : "13.5px",
                fontFamily    : "var(--font-display)",
                fontWeight    : isActive(link.path) ? "700" : "500",
                color         : isActive(link.path) ? "#e8e8f0" : "rgba(255,255,255,0.45)",
                background    : isActive(link.path) ? "rgba(255,255,255,0.08)" : "transparent",
                transition    : "all 0.2s",
                position      : "relative",
              }}
              onMouseEnter={(e) => { if (!isActive(link.path)) e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
              onMouseLeave={(e) => { if (!isActive(link.path)) e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}
            >
              {link.label}
              {isActive(link.path) && (
                <span style={{
                  position  : "absolute",
                  bottom    : "-2px", left:"50%",
                  transform : "translateX(-50%)",
                  width     : "20px", height:"2px",
                  background: "linear-gradient(90deg,#6c63ff,#a78bfa)",
                  borderRadius: "2px",
                }} />
              )}
            </Link>
          ))}
        </div>

        {/* ── Spacer */}
        <div style={{ flex:1 }} />

        {/* ── Search */}
        <div style={{ position:"relative" }}>
          {searchOpen ? (
            <form onSubmit={handleSearch} style={{ display:"flex", alignItems:"center" }}>
              <input
                ref={searchRef}
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => !searchQuery && setSearchOpen(false)}
                placeholder="Search blogs..."
                style={{
                  width       : "180px",
                  padding     : "7px 14px",
                  background  : "rgba(255,255,255,0.07)",
                  border      : "1px solid rgba(108,99,255,0.4)",
                  borderRadius: "20px",
                  color       : "#e8e8f0",
                  fontSize    : "13px",
                  fontFamily  : "var(--font-body)",
                  outline     : "none",
                  boxShadow   : "0 0 0 3px rgba(108,99,255,0.1)",
                }}
              />
            </form>
          ) : (
            <button onClick={() => setSearchOpen(true)} style={iconBtn}>
              <SearchIcon />
            </button>
          )}
        </div>

        {/* ── Theme Toggle */}
        <ThemeToggle size="sm" />

        {/* ── Auth / Profile */}
        {isLoggedIn ? (
          <div ref={profileRef} style={{ position:"relative" }}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              style={{
                width         : "34px", height:"34px",
                borderRadius  : "50%",
                background    : "linear-gradient(135deg,#6c63ff,#a78bfa)",
                border        : "2px solid rgba(108,99,255,0.4)",
                display       : "flex", alignItems:"center", justifyContent:"center",
                cursor        : "pointer",
                fontSize      : "13px", fontWeight:"700", color:"#fff",
                fontFamily    : "var(--font-display)",
                overflow      : "hidden",
                transition    : "all 0.2s",
                boxShadow     : profileOpen ? "0 0 0 3px rgba(108,99,255,0.25)" : "none",
              }}
            >
              {user?.avatar?.url
                ? <img src={user.avatar.url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                : user?.name?.charAt(0).toUpperCase()
              }
            </button>

            {profileOpen && (
              <div style={{
                position    : "absolute",
                top         : "calc(100% + 8px)",
                right       : 0,
                minWidth    : "200px",
                background  : "#111124",
                border      : "1px solid rgba(255,255,255,0.1)",
                borderRadius: "14px",
                boxShadow   : "0 20px 60px rgba(0,0,0,0.5)",
                overflow    : "hidden",
                animation   : "dropIn 0.2s cubic-bezier(0.34,1.56,0.64,1)",
                zIndex      : 100,
              }}>
                <div style={{ padding:"14px 16px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                  <p style={{ fontSize:"13.5px", fontWeight:"700", color:"#e8e8f0", fontFamily:"var(--font-display)" }}>{user?.name}</p>
                  <p style={{ fontSize:"12px", color:"rgba(255,255,255,0.3)", marginTop:"2px" }}>{user?.email}</p>
                </div>
                {[
                  { label:"My Profile",  icon:<UserIcon />,  path:"/profile" },
                  { label:"My Orders",   icon:"📦",          path:"/profile?tab=orders" },
                ].map((item) => (
                  <Link key={item.label} to={item.path} style={{ display:"flex", alignItems:"center", gap:"10px", padding:"10px 16px", textDecoration:"none", color:"rgba(255,255,255,0.6)", fontSize:"13px", fontFamily:"var(--font-display)", fontWeight:"500", transition:"all 0.15s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background="rgba(255,255,255,0.04)"; e.currentTarget.style.color="#e8e8f0"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="rgba(255,255,255,0.6)"; }}
                  >
                    <span style={{ fontSize:"14px" }}>{item.icon}</span>{item.label}
                  </Link>
                ))}
                <button onClick={logout} style={{ display:"flex", alignItems:"center", gap:"10px", width:"100%", padding:"10px 16px", background:"transparent", border:"none", cursor:"pointer", color:"rgba(239,68,68,0.7)", fontSize:"13px", fontFamily:"var(--font-display)", fontWeight:"500", transition:"all 0.15s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background="rgba(239,68,68,0.08)"; e.currentTarget.style.color="#ef4444"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="rgba(239,68,68,0.7)"; }}
                >
                  <LogoutIcon /> Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" style={{ display:"flex", alignItems:"center", gap:"6px", padding:"7px 16px", background:"rgba(108,99,255,0.15)", border:"1px solid rgba(108,99,255,0.3)", borderRadius:"20px", color:"#a78bfa", fontSize:"13px", fontFamily:"var(--font-display)", fontWeight:"600", textDecoration:"none", transition:"all 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.background="rgba(108,99,255,0.25)"; e.currentTarget.style.color="#e8e8f0"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background="rgba(108,99,255,0.15)"; e.currentTarget.style.color="#a78bfa"; }}
            className="desktop-nav"
          >
            Login
          </Link>
        )}

        {/* ── Mobile menu button */}
        <button onClick={() => setMobileOpen(!mobileOpen)} style={{ ...iconBtn, display:"none" }} className="mobile-menu-btn">
          {mobileOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </nav>

      {/* ── Mobile Drawer */}
      {mobileOpen && (
        <>
          <div onClick={() => setMobileOpen(false)} style={{ position:"fixed", inset:0, zIndex:88, background:"rgba(0,0,0,0.5)", backdropFilter:"blur(4px)" }} />
          <div style={{
            position      : "fixed",
            top           : "60px", left:0, right:0,
            zIndex        : 89,
            background    : "rgba(13,13,26,0.98)",
            backdropFilter: "blur(24px)",
            borderBottom  : "1px solid rgba(255,255,255,0.07)",
            padding       : "16px 20px",
            animation     : "slideDown 0.25s ease",
          }}>
            {NAV_LINKS.map((link) => (
              <Link key={link.path} to={link.path} style={{
                display       : "flex", alignItems:"center",
                padding       : "12px 14px",
                borderRadius  : "10px",
                textDecoration: "none",
                fontSize      : "15px",
                fontFamily    : "var(--font-display)",
                fontWeight    : isActive(link.path) ? "700" : "500",
                color         : isActive(link.path) ? "#e8e8f0" : "rgba(255,255,255,0.55)",
                background    : isActive(link.path) ? "rgba(108,99,255,0.12)" : "transparent",
                marginBottom  : "4px",
              }}>
                {link.label}
              </Link>
            ))}
            <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)", marginTop:"12px", paddingTop:"12px" }}>
              {isLoggedIn ? (
                <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                  <div style={{ width:"38px", height:"38px", borderRadius:"50%", background:"linear-gradient(135deg,#6c63ff,#a78bfa)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"14px", fontWeight:"700", color:"#fff", overflow:"hidden" }}>
                    {user?.avatar?.url ? <img src={user.avatar.url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} /> : user?.name?.charAt(0)}
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:"13px", color:"#e8e8f0", fontWeight:"600", fontFamily:"var(--font-display)" }}>{user?.name}</p>
                    <Link to="/profile" style={{ fontSize:"12px", color:"#a78bfa", textDecoration:"none" }}>View Profile</Link>
                  </div>
                  <button onClick={logout} style={{ padding:"6px 14px", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:"8px", color:"#f87171", fontSize:"12px", cursor:"pointer", fontFamily:"var(--font-display)", fontWeight:"600" }}>Logout</button>
                </div>
              ) : (
                <div style={{ display:"flex", gap:"10px" }}>
                  <Link to="/login"    style={{ flex:1, padding:"10px", textAlign:"center", background:"rgba(108,99,255,0.15)", border:"1px solid rgba(108,99,255,0.3)", borderRadius:"10px", color:"#a78bfa", textDecoration:"none", fontSize:"14px", fontFamily:"var(--font-display)", fontWeight:"600" }}>Login</Link>
                  <Link to="/register" style={{ flex:1, padding:"10px", textAlign:"center", background:"linear-gradient(135deg,#6c63ff,#4f46e5)", border:"none", borderRadius:"10px", color:"#fff", textDecoration:"none", fontSize:"14px", fontFamily:"var(--font-display)", fontWeight:"600" }}>Register</Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <style>{`
        .desktop-nav { display: flex !important; }
        .mobile-menu-btn { display: none !important; }
        @media (max-width: 680px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
        @keyframes dropIn {
          from { opacity:0; transform:translateY(-8px) scale(0.97); }
          to   { opacity:1; transform:translateY(0)    scale(1);    }
        }
        @keyframes slideDown {
          from { opacity:0; transform:translateY(-10px); }
          to   { opacity:1; transform:translateY(0);     }
        }
      `}</style>
    </>
  );
};

function useSite() {
  try {
    const { useContext } = require("react");
    const { SiteContext } = require("../../context/SiteContext");
    return useContext(SiteContext) || {};
  } catch {
    return { siteName:"1000 Din", logoUrl:null };
  }
}

const iconBtn = {
  width:"36px", height:"36px",
  background:"rgba(255,255,255,0.05)",
  border:"1px solid rgba(255,255,255,0.08)",
  borderRadius:"9px",
  color:"rgba(255,255,255,0.55)",
  display:"flex", alignItems:"center", justifyContent:"center",
  cursor:"pointer",
  transition:"all 0.2s",
  flexShrink:0,
};

export default Navbar;
