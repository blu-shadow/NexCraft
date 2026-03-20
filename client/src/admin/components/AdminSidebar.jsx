// ═══════════════════════════════════════════════════════════
//              ADMIN SIDEBAR + LAYOUT
// ═══════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import useAuth  from "../../hooks/useAuth";
import useSite  from "../../hooks/useSite";

// ── Icons (inline SVG for zero-dependency)
const Icons = {
  grid     : () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
  package  : () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  tool     : () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
  youtube  : () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.54C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none"/></svg>,
  file     : () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  users    : () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  tv       : () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/></svg>,
  image    : () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  settings : () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  logout   : () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  menu     : () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  close    : () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  chevron  : () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>,
  home     : () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
};

const MENU_ITEMS = [
  { path: "/admin/dashboard", label: "Dashboard",  icon: "grid",    badge: null         },
  { path: "/admin/orders",    label: "Orders",      icon: "package", badge: "orders"     },
  { path: "/admin/services",  label: "Services",    icon: "tool",    badge: null         },
  { path: "/admin/videos",    label: "YouTube",     icon: "youtube", badge: null         },
  { path: "/admin/blog",      label: "Blog",        icon: "file",    badge: null         },
  { path: "/admin/users",     label: "Users",       icon: "users",   badge: null         },
  { path: "/admin/channel",   label: "Channel",     icon: "tv",      badge: null         },
  { path: "/admin/logo",      label: "Logo",        icon: "image",   badge: null         },
  { path: "/admin/settings",  label: "Settings",    icon: "settings",badge: null         },
];

const AdminSidebar = () => {
  const { admin, adminLogout }  = useAuth();
  const { siteName, logoUrl }   = useSite();
  const location                = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Close mobile on resize to desktop
  useEffect(() => {
    const handler = () => { if (window.innerWidth > 1024) setMobileOpen(false); };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const getPageTitle = () => {
    const item = MENU_ITEMS.find((m) => location.pathname.startsWith(m.path));
    return item?.label || "Dashboard";
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--clr-bg)" }}>

      {/* ── Mobile Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position  : "fixed", inset: 0, zIndex: 49,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
          }}
        />
      )}

      {/* ════════════════════════════════════
          SIDEBAR
      ════════════════════════════════════ */}
      <aside style={{
        width          : collapsed ? "72px" : "260px",
        minHeight      : "100vh",
        background     : "linear-gradient(180deg, #0a0a18 0%, #0d0d22 100%)",
        borderRight    : "1px solid rgba(255,255,255,0.06)",
        display        : "flex",
        flexDirection  : "column",
        position       : "fixed",
        top            : 0,
        left           : mobileOpen ? 0 : (window.innerWidth <= 1024 ? "-100%" : 0),
        height         : "100vh",
        zIndex         : 50,
        transition     : "width 0.3s cubic-bezier(0.4,0,0.2,1), left 0.3s ease",
        overflowX      : "hidden",
        overflowY      : "auto",
        scrollbarWidth : "none",
      }}
      className="admin-sidebar"
      >
        {/* ── Logo */}
        <div style={{
          padding      : "20px 16px",
          borderBottom : "1px solid rgba(255,255,255,0.06)",
          display      : "flex",
          alignItems   : "center",
          gap          : "12px",
          minHeight    : "70px",
          flexShrink   : 0,
        }}>
          <div style={{
            width         : "38px", height: "38px",
            background    : "linear-gradient(135deg, #6c63ff, #f59e0b)",
            borderRadius  : "10px",
            display       : "flex",
            alignItems    : "center",
            justifyContent: "center",
            fontSize      : "18px",
            fontWeight    : "800",
            color         : "#fff",
            flexShrink    : 0,
            fontFamily    : "var(--font-display)",
            boxShadow     : "0 4px 16px rgba(108,99,255,0.4)",
          }}>
            {logoUrl
              ? <img src={logoUrl} alt="logo" style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "8px" }} />
              : "1K"
            }
          </div>

          {!collapsed && (
            <div style={{ overflow: "hidden" }}>
              <div style={{
                fontFamily  : "var(--font-display)",
                fontWeight  : "800",
                fontSize    : "16px",
                color       : "#fff",
                whiteSpace  : "nowrap",
                letterSpacing: "-0.3px",
              }}>
                {siteName}
              </div>
              <div style={{
                fontSize  : "11px",
                color     : "rgba(255,255,255,0.35)",
                fontWeight: "500",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
              }}>
                Admin Panel
              </div>
            </div>
          )}

          {/* Collapse toggle — desktop only */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              marginLeft    : "auto",
              width         : "28px", height: "28px",
              background    : "rgba(255,255,255,0.06)",
              border        : "1px solid rgba(255,255,255,0.08)",
              borderRadius  : "8px",
              color         : "rgba(255,255,255,0.4)",
              display       : "flex",
              alignItems    : "center",
              justifyContent: "center",
              cursor        : "pointer",
              flexShrink    : 0,
              transition    : "all 0.2s",
            }}
            title={collapsed ? "Expand" : "Collapse"}
          >
            <div style={{
              width    : "14px", height: "14px",
              transform: collapsed ? "rotate(180deg)" : "none",
              transition: "transform 0.3s",
            }}>
              <Icons.chevron />
            </div>
          </button>
        </div>

        {/* ── Navigation */}
        <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
          {MENU_ITEMS.map((item) => {
            const Icon      = Icons[item.icon];
            const isActive  = location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={collapsed ? item.label : ""}
                style={{
                  display       : "flex",
                  alignItems    : "center",
                  gap           : "12px",
                  padding       : collapsed ? "10px" : "10px 12px",
                  borderRadius  : "10px",
                  marginBottom  : "2px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  textDecoration: "none",
                  position      : "relative",
                  transition    : "all 0.2s",
                  background    : isActive
                    ? "linear-gradient(135deg, rgba(108,99,255,0.25), rgba(108,99,255,0.1))"
                    : "transparent",
                  border        : isActive
                    ? "1px solid rgba(108,99,255,0.3)"
                    : "1px solid transparent",
                  color         : isActive ? "#a78bfa" : "rgba(255,255,255,0.5)",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    e.currentTarget.style.color = "rgba(255,255,255,0.8)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                  }
                }}
              >
                {/* Active left bar */}
                {isActive && (
                  <span style={{
                    position  : "absolute",
                    left      : 0, top: "20%", bottom: "20%",
                    width     : "3px",
                    borderRadius: "0 3px 3px 0",
                    background: "linear-gradient(180deg, #6c63ff, #a78bfa)",
                  }} />
                )}

                {/* Icon */}
                <span style={{
                  width       : "20px", height: "20px",
                  flexShrink  : 0,
                  display     : "flex",
                  alignItems  : "center",
                  justifyContent: "center",
                }}>
                  <Icon />
                </span>

                {/* Label */}
                {!collapsed && (
                  <span style={{
                    fontFamily  : "var(--font-display)",
                    fontSize    : "13.5px",
                    fontWeight  : isActive ? "600" : "500",
                    whiteSpace  : "nowrap",
                    overflow    : "hidden",
                    letterSpacing: "0.01em",
                  }}>
                    {item.label}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* ── Bottom: Admin Info + Logout */}
        <div style={{
          padding     : "12px 8px",
          borderTop   : "1px solid rgba(255,255,255,0.06)",
          flexShrink  : 0,
        }}>
          {/* View Site */}
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            style={{
              display       : "flex",
              alignItems    : "center",
              gap           : "10px",
              padding       : collapsed ? "10px" : "10px 12px",
              borderRadius  : "10px",
              marginBottom  : "6px",
              textDecoration: "none",
              color         : "rgba(255,255,255,0.35)",
              justifyContent: collapsed ? "center" : "flex-start",
              transition    : "all 0.2s",
              fontSize      : "13px",
              fontFamily    : "var(--font-display)",
              fontWeight    : "500",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              e.currentTarget.style.color = "rgba(255,255,255,0.6)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "rgba(255,255,255,0.35)";
            }}
          >
            <span style={{ width: "18px", height: "18px", flexShrink: 0 }}>
              <Icons.home />
            </span>
            {!collapsed && "View Site"}
          </a>

          {/* Admin info row */}
          {!collapsed && admin && (
            <div style={{
              display     : "flex",
              alignItems  : "center",
              gap         : "10px",
              padding     : "10px 12px",
              background  : "rgba(255,255,255,0.04)",
              borderRadius: "10px",
              marginBottom: "6px",
            }}>
              <div style={{
                width         : "34px", height: "34px",
                borderRadius  : "50%",
                background    : "linear-gradient(135deg,#6c63ff,#a78bfa)",
                display       : "flex", alignItems: "center", justifyContent: "center",
                fontSize      : "13px", fontWeight: "700", color: "#fff",
                flexShrink    : 0, fontFamily: "var(--font-display)",
                overflow      : "hidden",
              }}>
                {admin.avatar?.url
                  ? <img src={admin.avatar.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : admin.name?.charAt(0).toUpperCase()
                }
              </div>
              <div style={{ overflow: "hidden", flex: 1 }}>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "#e8e8f0", fontFamily: "var(--font-display)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {admin.name}
                </div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {admin.isSuperAdmin ? "Super Admin" : "Admin"}
                </div>
              </div>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={adminLogout}
            title={collapsed ? "Logout" : ""}
            style={{
              display       : "flex",
              alignItems    : "center",
              gap           : "10px",
              padding       : collapsed ? "10px" : "10px 12px",
              borderRadius  : "10px",
              width         : "100%",
              background    : "transparent",
              border        : "none",
              cursor        : "pointer",
              color         : "rgba(239,68,68,0.6)",
              justifyContent: collapsed ? "center" : "flex-start",
              transition    : "all 0.2s",
              fontFamily    : "var(--font-display)",
              fontSize      : "13.5px",
              fontWeight    : "500",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239,68,68,0.1)";
              e.currentTarget.style.color = "#ef4444";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "rgba(239,68,68,0.6)";
            }}
          >
            <span style={{ width: "18px", height: "18px", flexShrink: 0 }}>
              <Icons.logout />
            </span>
            {!collapsed && "Logout"}
          </button>
        </div>
      </aside>

      {/* ════════════════════════════════════
          MAIN CONTENT AREA
      ════════════════════════════════════ */}
      <div style={{
        flex       : 1,
        marginLeft : window.innerWidth > 1024 ? (collapsed ? "72px" : "260px") : 0,
        transition : "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)",
        minHeight  : "100vh",
        display    : "flex",
        flexDirection: "column",
      }}>
        {/* Topbar */}
        <AdminTopbarInline
          pageTitle={getPageTitle()}
          onMenuClick={() => setMobileOpen(true)}
        />

        {/* Page Content */}
        <main style={{
          flex    : 1,
          padding : "24px",
          overflowX: "hidden",
        }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        .admin-sidebar::-webkit-scrollbar { width: 0; }
        @media (max-width: 1024px) {
          .admin-sidebar {
            left: ${mobileOpen ? "0" : "-100%"} !important;
            width: 260px !important;
          }
        }
      `}</style>
    </div>
  );
};

// ─────────────────────────────────────────
//   Inline Topbar (used inside layout)
// ─────────────────────────────────────────
const AdminTopbarInline = ({ pageTitle, onMenuClick }) => {
  const { admin }         = useAuth();
  const location          = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header style={{
      height        : "64px",
      background    : "rgba(13,13,26,0.95)",
      backdropFilter: "blur(20px)",
      borderBottom  : "1px solid rgba(255,255,255,0.06)",
      display       : "flex",
      alignItems    : "center",
      padding       : "0 24px",
      gap           : "16px",
      position      : "sticky",
      top           : 0,
      zIndex        : 40,
      flexShrink    : 0,
    }}>
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        style={{
          display       : "none",
          width         : "36px", height: "36px",
          background    : "rgba(255,255,255,0.06)",
          border        : "1px solid rgba(255,255,255,0.08)",
          borderRadius  : "8px",
          color         : "rgba(255,255,255,0.6)",
          alignItems    : "center",
          justifyContent: "center",
          cursor        : "pointer",
        }}
        className="admin-mobile-menu-btn"
      >
        <span style={{ width: "18px", height: "18px" }}><Icons.menu /></span>
      </button>

      {/* Page title */}
      <h1 style={{
        fontFamily  : "var(--font-display)",
        fontSize    : "18px",
        fontWeight  : "700",
        color       : "#e8e8f0",
        letterSpacing: "-0.3px",
      }}>
        {pageTitle}
      </h1>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
        {/* Super admin badge */}
        {admin?.isSuperAdmin && (
          <span style={{
            padding     : "3px 10px",
            background  : "rgba(245,158,11,0.12)",
            border      : "1px solid rgba(245,158,11,0.2)",
            borderRadius: "20px",
            fontSize    : "11px",
            fontWeight  : "600",
            color       : "#fbbf24",
            letterSpacing: "0.04em",
            fontFamily  : "var(--font-display)",
          }}>
            ⭐ Super Admin
          </span>
        )}

        {/* Admin avatar */}
        <div style={{
          width         : "36px", height: "36px",
          borderRadius  : "50%",
          background    : "linear-gradient(135deg,#6c63ff,#a78bfa)",
          display       : "flex", alignItems: "center", justifyContent: "center",
          fontSize      : "14px", fontWeight: "700", color: "#fff",
          fontFamily    : "var(--font-display)",
          overflow      : "hidden",
          border        : "2px solid rgba(108,99,255,0.4)",
        }}>
          {admin?.avatar?.url
            ? <img src={admin.avatar.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : admin?.name?.charAt(0).toUpperCase()
          }
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .admin-mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </header>
  );
};

// ─────────────────────────────────────────
//   useSite hook shim (in case not yet created)
// ─────────────────────────────────────────
function useSite() {
  try {
    const { useContext } = require !== undefined ? require("react") : { useContext: () => ({}) };
    const { SiteContext } = require("../../context/SiteContext");
    return useContext(SiteContext) || {};
  } catch {
    return { siteName: "1000 Din", logoUrl: null };
  }
}

export default AdminSidebar;
