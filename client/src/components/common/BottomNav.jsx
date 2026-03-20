// ═══════════════════════════════════════════════════════════
//                    BOTTOM NAVIGATION
//         Home · YouTube · Blog · Profile — Mobile First
// ═══════════════════════════════════════════════════════════
import { useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

// ── Icons (crisp, 22×22)
const HomeIcon    = ({ filled }) => filled
  ? <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
  : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;

const YoutubeIcon = ({ filled }) => filled
  ? <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M23 7s-.3-2-1.2-2.8C20.7 3 19.4 3 18.8 2.9 16.2 2.8 12 2.8 12 2.8s-4.2 0-6.8.1C4.6 3 3.3 3 2.2 4.2 1.3 5 1 7 1 7S.7 9.3.7 11.5v2.1c0 2.2.3 4.4.3 4.4S1.3 20 2.2 20.8c1.1 1.2 2.6 1.1 3.3 1.2C7.5 22.1 12 22.1 12 22.1s4.2 0 6.8-.2c.6-.1 1.9-.1 3-1.3.9-.8 1.2-2.8 1.2-2.8s.3-2.2.3-4.4v-2.1C23.3 9.3 23 7 23 7zm-13.5 8.9V8.1l8.1 3.9-8.1 3.8z"/></svg>
  : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.54C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none"/></svg>;

const BlogIcon    = ({ filled }) => filled
  ? <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z"/></svg>
  : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;

const ProfileIcon = ({ filled }) => filled
  ? <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
  : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;

const NAV_ITEMS = [
  { path:"/",        label:"Home",    Icon:HomeIcon    },
  { path:"/youtube", label:"YouTube", Icon:YoutubeIcon },
  { path:"/blog",    label:"Blog",    Icon:BlogIcon    },
  { path:"/profile", label:"Profile", Icon:ProfileIcon },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const handleProfileClick = () => {
    navigate(isLoggedIn ? "/profile" : "/login");
  };

  return (
    <>
      <nav style={{
        position      : "fixed",
        bottom        : 0, left:0, right:0,
        zIndex        : 90,
        height        : "64px",
        background    : "var(--nav-bg, rgba(13,13,26,0.97))",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderTop     : "1px solid var(--nav-border, rgba(255,255,255,0.07))",
        display       : "flex",
        alignItems    : "center",
        justifyContent: "space-around",
        padding       : "0 8px",
        paddingBottom : "env(safe-area-inset-bottom, 0px)",
      }}>
        {NAV_ITEMS.map(({ path, label, Icon }) => {
          const active = isActive(path);
          const isProfile = path === "/profile";

          return (
            <button
              key={path}
              onClick={isProfile ? handleProfileClick : () => navigate(path)}
              style={{
                display       : "flex",
                flexDirection : "column",
                alignItems    : "center",
                gap           : "3px",
                flex          : 1,
                height        : "100%",
                background    : "none",
                border        : "none",
                cursor        : "pointer",
                padding       : "8px 4px",
                position      : "relative",
                transition    : "all 0.2s",
              }}
            >
              {/* Active indicator top line */}
              {active && (
                <span style={{
                  position      : "absolute",
                  top           : 0,
                  left          : "20%", right:"20%",
                  height        : "2.5px",
                  background    : "linear-gradient(90deg, #6c63ff, #a78bfa)",
                  borderRadius  : "0 0 3px 3px",
                  animation     : "navLineIn 0.25s ease",
                }} />
              )}

              {/* Icon wrapper */}
              <div style={{
                width         : "40px",
                height        : "32px",
                display       : "flex",
                alignItems    : "center",
                justifyContent: "center",
                borderRadius  : "10px",
                background    : active ? "rgba(108,99,255,0.15)" : "transparent",
                color         : active ? "#a78bfa" : "rgba(255,255,255,0.35)",
                transition    : "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
                transform     : active ? "scale(1.05)" : "scale(1)",
              }}>
                {/* YouTube icon red when active */}
                <span style={{ color: active && label === "YouTube" ? "#ef4444" : "inherit" }}>
                  <Icon filled={active} />
                </span>
              </div>

              {/* Label */}
              <span style={{
                fontSize    : "10px",
                fontFamily  : "var(--font-display)",
                fontWeight  : active ? "700" : "400",
                color       : active ? (label === "YouTube" ? "#ef4444" : "#a78bfa") : "rgba(255,255,255,0.3)",
                letterSpacing: active ? "0.02em" : "0",
                transition  : "all 0.2s",
                lineHeight  : 1,
              }}>
                {label}
              </span>
            </button>
          );
        })}
      </nav>

      <style>{`
        @keyframes navLineIn {
          from { opacity:0; transform:scaleX(0); }
          to   { opacity:1; transform:scaleX(1); }
        }
      `}</style>
    </>
  );
};

export default BottomNav;
