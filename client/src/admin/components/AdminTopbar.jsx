// ═══════════════════════════════════════════════════════════
//                   ADMIN TOPBAR
// ═══════════════════════════════════════════════════════════
import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation }    from "react-router-dom";
import useAuth  from "../../hooks/useAuth";

// ── Icons
const SearchIcon  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const BellIcon    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const MoonIcon    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
const SunIcon     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
const ChevronDown = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>;
const LogoutIcon  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const UserIcon    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const MenuIcon    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;

// ─────────────────────────────────────────
//   Breadcrumb builder
// ─────────────────────────────────────────
const buildBreadcrumb = (pathname) => {
  const map = {
    "/admin/dashboard": ["Dashboard"],
    "/admin/orders"   : ["Dashboard", "Orders"],
    "/admin/services" : ["Dashboard", "Services"],
    "/admin/videos"   : ["Dashboard", "YouTube"],
    "/admin/blog"     : ["Dashboard", "Blog"],
    "/admin/users"    : ["Dashboard", "Users"],
    "/admin/channel"  : ["Dashboard", "Channel"],
    "/admin/logo"     : ["Dashboard", "Logo"],
    "/admin/settings" : ["Dashboard", "Settings"],
  };
  return map[pathname] || ["Dashboard"];
};

// ─────────────────────────────────────────
//   Notification Item (mock)
// ─────────────────────────────────────────
const MOCK_NOTIFS = [
  { id: 1, text: "New order received — ORD-001",  time: "2 min ago",   read: false, color: "#6c63ff" },
  { id: 2, text: "User Rahim registered",          time: "15 min ago",  read: false, color: "#10b981" },
  { id: 3, text: "Order #ORD-002 completed",       time: "1 hour ago",  read: true,  color: "#f59e0b" },
  { id: 4, text: "New comment on blog post",       time: "3 hours ago", read: true,  color: "#3b82f6" },
];

const AdminTopbar = ({ onMenuToggle, pageTitle }) => {
  const navigate           = useNavigate();
  const location           = useLocation();
  const { admin, adminLogout } = useAuth();

  const [searchOpen,   setSearchOpen  ] = useState(false);
  const [searchQuery,  setSearchQuery ] = useState("");
  const [notifOpen,    setNotifOpen   ] = useState(false);
  const [profileOpen,  setProfileOpen ] = useState(false);
  const [isDark,       setIsDark      ] = useState(true);
  const [unreadCount,  setUnreadCount ] = useState(
    MOCK_NOTIFS.filter((n) => !n.read).length
  );

  const searchRef  = useRef(null);
  const notifRef   = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current  && !notifRef.current.contains(e.target))   setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Theme toggle
  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.setAttribute("data-theme", isDark ? "light" : "dark");
  };

  const markAllRead = () => setUnreadCount(0);

  const breadcrumb = buildBreadcrumb(location.pathname);

  return (
    <header style={{
      height       : "64px",
      background   : "rgba(10,10,24,0.96)",
      backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)",
      borderBottom : "1px solid rgba(255,255,255,0.06)",
      display      : "flex",
      alignItems   : "center",
      padding      : "0 20px",
      gap          : "12px",
      position     : "sticky",
      top          : 0,
      zIndex       : 40,
      flexShrink   : 0,
    }}>

      {/* ── Mobile menu button */}
      {onMenuToggle && (
        <button onClick={onMenuToggle} style={iconBtnStyle}>
          <MenuIcon />
        </button>
      )}

      {/* ── Breadcrumb */}
      <div style={{
        display   : "flex",
        alignItems: "center",
        gap       : "6px",
        fontSize  : "13px",
        fontFamily: "var(--font-display)",
      }}>
        {breadcrumb.map((crumb, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {i > 0 && (
              <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "12px" }}>/</span>
            )}
            <span style={{
              color     : i === breadcrumb.length - 1
                ? "#e8e8f0"
                : "rgba(255,255,255,0.35)",
              fontWeight: i === breadcrumb.length - 1 ? "600" : "400",
              cursor    : i < breadcrumb.length - 1 ? "pointer" : "default",
            }}
              onClick={() => i < breadcrumb.length - 1 && navigate("/admin/dashboard")}
            >
              {crumb}
            </span>
          </span>
        ))}
      </div>

      {/* ── Search bar */}
      <div style={{
        display      : "flex",
        alignItems   : "center",
        gap          : "8px",
        background   : "rgba(255,255,255,0.04)",
        border       : `1px solid ${searchOpen ? "rgba(108,99,255,0.4)" : "rgba(255,255,255,0.07)"}`,
        borderRadius : "10px",
        padding      : "0 14px",
        height       : "36px",
        width        : searchOpen ? "220px" : "140px",
        transition   : "all 0.3s ease",
        marginLeft   : "auto",
        cursor       : "text",
        boxShadow    : searchOpen ? "0 0 0 3px rgba(108,99,255,0.1)" : "none",
      }}
        onClick={() => { setSearchOpen(true); searchRef.current?.focus(); }}
      >
        <span style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>
          <SearchIcon />
        </span>
        <input
          ref={searchRef}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onBlur={() => !searchQuery && setSearchOpen(false)}
          placeholder="Search..."
          style={{
            background  : "transparent",
            border      : "none",
            outline     : "none",
            color       : "#e8e8f0",
            fontSize    : "13px",
            fontFamily  : "var(--font-body)",
            width       : "100%",
          }}
        />
        {searchQuery && (
          <button
            onClick={() => { setSearchQuery(""); setSearchOpen(false); }}
            style={{ ...iconBtnStyle, width: "18px", height: "18px", padding: 0, fontSize: "14px", color: "rgba(255,255,255,0.4)" }}
          >
            ×
          </button>
        )}
      </div>

      {/* ── Theme toggle */}
      <button onClick={toggleTheme} style={iconBtnStyle} title="Toggle theme">
        {isDark ? <SunIcon /> : <MoonIcon />}
      </button>

      {/* ── Notifications */}
      <div ref={notifRef} style={{ position: "relative" }}>
        <button
          onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
          style={{ ...iconBtnStyle, position: "relative" }}
          title="Notifications"
        >
          <BellIcon />
          {unreadCount > 0 && (
            <span style={{
              position    : "absolute",
              top         : "-2px", right: "-2px",
              width       : "16px", height: "16px",
              background  : "linear-gradient(135deg,#ef4444,#dc2626)",
              borderRadius: "50%",
              fontSize    : "9px",
              fontWeight  : "700",
              color       : "#fff",
              display     : "flex",
              alignItems  : "center",
              justifyContent: "center",
              fontFamily  : "var(--font-display)",
              border      : "2px solid #0a0a18",
            }}>
              {unreadCount}
            </span>
          )}
        </button>

        {/* Notification Dropdown */}
        {notifOpen && (
          <div style={dropdownStyle}>
            <div style={{
              display       : "flex",
              alignItems    : "center",
              justifyContent: "space-between",
              padding       : "14px 16px 10px",
              borderBottom  : "1px solid rgba(255,255,255,0.06)",
            }}>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "#e8e8f0", fontFamily: "var(--font-display)" }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  style={{ fontSize: "11px", color: "#a78bfa", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-display)" }}
                >
                  Mark all read
                </button>
              )}
            </div>

            <div style={{ maxHeight: "280px", overflowY: "auto" }}>
              {MOCK_NOTIFS.map((n) => (
                <div key={n.id} style={{
                  display   : "flex",
                  gap       : "10px",
                  padding   : "12px 16px",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  background: n.read ? "transparent" : "rgba(108,99,255,0.04)",
                  cursor    : "pointer",
                  transition: "background 0.15s",
                }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = n.read ? "transparent" : "rgba(108,99,255,0.04)"}
                >
                  <span style={{
                    width        : "8px", height: "8px",
                    borderRadius : "50%",
                    background   : n.read ? "transparent" : n.color,
                    flexShrink   : 0,
                    marginTop    : "5px",
                    border       : n.read ? "1px solid rgba(255,255,255,0.15)" : "none",
                  }} />
                  <div>
                    <p style={{ fontSize: "12.5px", color: n.read ? "rgba(255,255,255,0.5)" : "#e8e8f0", marginBottom: "2px", fontFamily: "var(--font-body)" }}>
                      {n.text}
                    </p>
                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-body)" }}>{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Admin Profile */}
      <div ref={profileRef} style={{ position: "relative" }}>
        <button
          onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
          style={{
            display     : "flex",
            alignItems  : "center",
            gap         : "8px",
            background  : "rgba(255,255,255,0.05)",
            border      : "1px solid rgba(255,255,255,0.08)",
            borderRadius: "10px",
            padding     : "5px 10px 5px 5px",
            cursor      : "pointer",
            transition  : "all 0.2s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = "rgba(108,99,255,0.3)"}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
        >
          {/* Avatar */}
          <div style={{
            width        : "28px", height: "28px",
            borderRadius : "7px",
            background   : "linear-gradient(135deg,#6c63ff,#a78bfa)",
            display      : "flex", alignItems: "center", justifyContent: "center",
            fontSize     : "12px", fontWeight: "700", color: "#fff",
            overflow     : "hidden",
            fontFamily   : "var(--font-display)",
          }}>
            {admin?.avatar?.url
              ? <img src={admin.avatar.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : admin?.name?.charAt(0).toUpperCase()
            }
          </div>

          <span style={{
            fontSize  : "13px",
            fontWeight: "600",
            color     : "#e8e8f0",
            fontFamily: "var(--font-display)",
            maxWidth  : "100px",
            overflow  : "hidden",
            textOverflow: "ellipsis",
            whiteSpace  : "nowrap",
          }}>
            {admin?.name?.split(" ")[0]}
          </span>

          <span style={{
            color    : "rgba(255,255,255,0.3)",
            transition: "transform 0.2s",
            transform : profileOpen ? "rotate(180deg)" : "none",
          }}>
            <ChevronDown />
          </span>
        </button>

        {/* Profile Dropdown */}
        {profileOpen && (
          <div style={{ ...dropdownStyle, right: 0, minWidth: "200px" }}>
            {/* Profile Header */}
            <div style={{
              padding    : "14px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>
              <p style={{ fontSize: "13.5px", fontWeight: "700", color: "#e8e8f0", fontFamily: "var(--font-display)" }}>
                {admin?.name}
              </p>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", marginTop: "2px" }}>
                {admin?.email}
              </p>
              {admin?.isSuperAdmin && (
                <span style={{
                  display     : "inline-block",
                  marginTop   : "6px",
                  padding     : "2px 8px",
                  background  : "rgba(245,158,11,0.12)",
                  border      : "1px solid rgba(245,158,11,0.2)",
                  borderRadius: "20px",
                  fontSize    : "10px",
                  fontWeight  : "600",
                  color       : "#fbbf24",
                  fontFamily  : "var(--font-display)",
                  letterSpacing: "0.04em",
                }}>
                  ⭐ SUPER ADMIN
                </span>
              )}
            </div>

            {/* Menu Items */}
            {[
              { icon: <UserIcon />, label: "My Profile",  action: () => { setProfileOpen(false); } },
              { icon: <LogoutIcon />, label: "Logout",    action: adminLogout, danger: true       },
            ].map((item, i) => (
              <button
                key={i}
                onClick={item.action}
                style={{
                  display       : "flex",
                  alignItems    : "center",
                  gap           : "10px",
                  width         : "100%",
                  padding       : "10px 16px",
                  background    : "transparent",
                  border        : "none",
                  cursor        : "pointer",
                  color         : item.danger ? "rgba(239,68,68,0.7)" : "rgba(255,255,255,0.6)",
                  fontSize      : "13px",
                  fontFamily    : "var(--font-display)",
                  fontWeight    : "500",
                  textAlign     : "left",
                  transition    : "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = item.danger ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.05)";
                  e.currentTarget.style.color = item.danger ? "#ef4444" : "#e8e8f0";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = item.danger ? "rgba(239,68,68,0.7)" : "rgba(255,255,255,0.6)";
                }}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};

// ── Shared styles
const iconBtnStyle = {
  width         : "36px",
  height        : "36px",
  background    : "rgba(255,255,255,0.04)",
  border        : "1px solid rgba(255,255,255,0.07)",
  borderRadius  : "9px",
  color         : "rgba(255,255,255,0.5)",
  display       : "flex",
  alignItems    : "center",
  justifyContent: "center",
  cursor        : "pointer",
  transition    : "all 0.2s",
  flexShrink    : 0,
};

const dropdownStyle = {
  position    : "absolute",
  top         : "calc(100% + 8px)",
  right       : 0,
  minWidth    : "280px",
  background  : "#111124",
  border      : "1px solid rgba(255,255,255,0.1)",
  borderRadius: "14px",
  boxShadow   : "0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(108,99,255,0.1)",
  overflow    : "hidden",
  zIndex      : 50,
  animation   : "dropdownIn 0.2s cubic-bezier(0.34,1.56,0.64,1)",
};

export default AdminTopbar;
