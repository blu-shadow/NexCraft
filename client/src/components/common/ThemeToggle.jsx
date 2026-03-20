// ═══════════════════════════════════════════════════════════
//                   THEME TOGGLE
// ═══════════════════════════════════════════════════════════
import useTheme from "../../hooks/useTheme";

const SunIcon  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
const MoonIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;

// ── Sizes
const sizeMap = {
  sm : { btn:"32px", icon:"15px" },
  md : { btn:"38px", icon:"17px" },
  lg : { btn:"44px", icon:"20px" },
};

// ── Toggle button variant
const ThemeToggle = ({ size = "md", variant = "icon" }) => {
  const { theme, toggleTheme, isDark } = useTheme();
  const s = sizeMap[size] || sizeMap.md;

  if (variant === "switch") {
    return (
      <button
        onClick={toggleTheme}
        title={`Switch to ${isDark ? "light" : "dark"} mode`}
        style={{
          display       : "flex",
          alignItems    : "center",
          gap           : "8px",
          padding       : "6px 14px 6px 6px",
          background    : isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
          border        : `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
          borderRadius  : "20px",
          cursor        : "pointer",
          transition    : "all 0.25s",
        }}
      >
        {/* Track */}
        <div style={{
          width         : "32px", height:"18px",
          background    : isDark ? "rgba(108,99,255,0.3)" : "rgba(245,158,11,0.3)",
          borderRadius  : "9px",
          position      : "relative",
          transition    : "background 0.3s",
          flexShrink    : 0,
        }}>
          {/* Thumb */}
          <div style={{
            position      : "absolute",
            top           : "2px",
            left          : isDark ? "16px" : "2px",
            width         : "14px", height:"14px",
            borderRadius  : "50%",
            background    : isDark ? "#a78bfa" : "#f59e0b",
            transition    : "left 0.3s cubic-bezier(0.34,1.56,0.64,1)",
            display       : "flex", alignItems:"center", justifyContent:"center",
            fontSize      : "8px",
          }}>
            {isDark ? "🌙" : "☀️"}
          </div>
        </div>
        <span style={{
          fontSize    : "12px",
          fontFamily  : "var(--font-display)",
          fontWeight  : "600",
          color       : isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
        }}>
          {isDark ? "Dark" : "Light"}
        </span>
      </button>
    );
  }

  // Default: icon button
  return (
    <button
      onClick={toggleTheme}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      style={{
        width         : s.btn,
        height        : s.btn,
        display       : "flex",
        alignItems    : "center",
        justifyContent: "center",
        background    : isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
        border        : `1px solid ${isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.09)"}`,
        borderRadius  : "9px",
        color         : isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)",
        cursor        : "pointer",
        transition    : "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
        flexShrink    : 0,
        overflow      : "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "rotate(20deg) scale(1.1)";
        e.currentTarget.style.color = isDark ? "#fbbf24" : "#6c63ff";
        e.currentTarget.style.borderColor = isDark ? "rgba(251,191,36,0.3)" : "rgba(108,99,255,0.3)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "rotate(0) scale(1)";
        e.currentTarget.style.color = isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)";
        e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.09)";
      }}
    >
      <div style={{
        animation : "themeIconIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        display   : "flex",
      }}>
        {isDark ? <SunIcon /> : <MoonIcon />}
      </div>
      <style>{`
        @keyframes themeIconIn {
          from { opacity:0; transform:rotate(-30deg) scale(0.7); }
          to   { opacity:1; transform:rotate(0)      scale(1);   }
        }
      `}</style>
    </button>
  );
};

export default ThemeToggle;
