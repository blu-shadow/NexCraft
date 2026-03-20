// ═══════════════════════════════════════════════════════════
//                   STATS CARD
//        Dashboard metrics with trend indicators
// ═══════════════════════════════════════════════════════════

// ── Trend Arrow
const TrendUp   = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const TrendDown = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>;
const TrendFlat = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>;

// ─────────────────────────────────────────
//   Mini Sparkline chart (pure CSS/SVG)
// ─────────────────────────────────────────
const Sparkline = ({ data = [], color = "#6c63ff" }) => {
  if (!data || data.length < 2) return null;

  const max    = Math.max(...data);
  const min    = Math.min(...data);
  const range  = max - min || 1;
  const w      = 80;
  const h      = 32;
  const pts    = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  });

  const polyline = pts.join(" ");
  const area = `M${pts[0]} L${pts.join(" L")} L${w},${h} L0,${h} Z`;

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id={`spark-${color.replace("#","")}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0"   />
        </linearGradient>
      </defs>
      {/* Area fill */}
      <path
        d={area}
        fill={`url(#spark-${color.replace("#","")})`}
      />
      {/* Line */}
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      <circle
        cx={w}
        cy={pts[pts.length - 1].split(",")[1]}
        r="3"
        fill={color}
      />
    </svg>
  );
};

// ═══════════════════════════════════════════════════════════
//   STATS CARD
// ═══════════════════════════════════════════════════════════
/**
 * Props:
 *  title       — "Total Orders"
 *  value       — 1240 or "৳45,000"
 *  icon        — emoji or SVG element
 *  trend       — "up" | "down" | "flat" | null
 *  trendValue  — "+12%", "-5%"
 *  trendLabel  — "vs last month"
 *  color       — hex color for accent
 *  sparkData   — [10, 20, 15, 30, ...] array for sparkline
 *  loading     — boolean
 *  onClick     — optional click handler
 *  variant     — "default" | "gradient" | "minimal"
 */
const StatsCard = ({
  title      = "Metric",
  value      = "—",
  icon       = "📊",
  trend      = null,
  trendValue = null,
  trendLabel = "vs last month",
  color      = "#6c63ff",
  sparkData  = null,
  loading    = false,
  onClick    = null,
  variant    = "default",
}) => {
  const trendColor =
    trend === "up"   ? "#10b981" :
    trend === "down" ? "#ef4444" : "#8888aa";

  const TrendIcon =
    trend === "up"   ? TrendUp   :
    trend === "down" ? TrendDown : TrendFlat;

  // ── Loading Skeleton
  if (loading) {
    return (
      <div style={cardBase(variant, color, !!onClick)}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          <div className="skeleton" style={{ width: "42px", height: "42px", borderRadius: "10px" }} />
          <div className="skeleton" style={{ width: "60px", height: "22px", borderRadius: "6px" }} />
        </div>
        <div className="skeleton" style={{ width: "80px",  height: "14px", borderRadius: "4px", marginBottom: "10px" }} />
        <div className="skeleton" style={{ width: "120px", height: "32px", borderRadius: "6px" }} />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      style={cardBase(variant, color, !!onClick)}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.borderColor = `${color}50`;
          e.currentTarget.style.boxShadow = `0 12px 40px rgba(0,0,0,0.3), 0 0 0 1px ${color}30`;
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
          e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.2)";
        }
      }}
    >
      {/* ── Top row: Icon + Trend */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
        {/* Icon */}
        <div style={{
          width         : "46px", height: "46px",
          borderRadius  : "12px",
          background    : `${color}18`,
          border        : `1px solid ${color}30`,
          display       : "flex",
          alignItems    : "center",
          justifyContent: "center",
          fontSize      : "22px",
          flexShrink    : 0,
        }}>
          {typeof icon === "string" ? icon : <span style={{ width: "22px", height: "22px", color }}>{icon}</span>}
        </div>

        {/* Sparkline */}
        {sparkData && (
          <div style={{ opacity: 0.8 }}>
            <Sparkline data={sparkData} color={color} />
          </div>
        )}
      </div>

      {/* ── Title */}
      <p style={{
        fontSize    : "12px",
        fontWeight  : "500",
        color       : "rgba(255,255,255,0.4)",
        textTransform: "uppercase",
        letterSpacing: "0.07em",
        marginBottom: "6px",
        fontFamily  : "var(--font-display)",
      }}>
        {title}
      </p>

      {/* ── Value */}
      <p style={{
        fontSize    : "28px",
        fontWeight  : "800",
        color       : "#f0f0fa",
        fontFamily  : "var(--font-display)",
        lineHeight  : "1.1",
        letterSpacing: "-0.5px",
        marginBottom: trendValue ? "10px" : 0,
      }}>
        {value}
      </p>

      {/* ── Trend */}
      {trendValue && (
        <div style={{
          display    : "flex",
          alignItems : "center",
          gap        : "5px",
          paddingTop : "10px",
          borderTop  : "1px solid rgba(255,255,255,0.05)",
          marginTop  : "2px",
        }}>
          <span style={{
            display    : "flex",
            alignItems : "center",
            gap        : "3px",
            color      : trendColor,
            fontSize   : "12px",
            fontWeight : "700",
            fontFamily : "var(--font-display)",
          }}>
            <TrendIcon />
            {trendValue}
          </span>
          {trendLabel && (
            <span style={{
              fontSize : "11.5px",
              color    : "rgba(255,255,255,0.3)",
              fontFamily: "var(--font-body)",
            }}>
              {trendLabel}
            </span>
          )}
        </div>
      )}

      {/* Gradient bottom accent */}
      <div style={{
        position  : "absolute",
        bottom    : 0, left: "10%", right: "10%",
        height    : "2px",
        background: `linear-gradient(90deg, transparent, ${color}60, transparent)`,
        borderRadius: "2px",
      }} />
    </div>
  );
};

// ── Base card style factory
const cardBase = (variant, color, clickable) => ({
  position      : "relative",
  background    : variant === "gradient"
    ? `linear-gradient(135deg, ${color}18 0%, ${color}08 100%)`
    : "rgba(20,20,38,0.8)",
  border        : `1px solid ${variant === "gradient" ? color + "25" : "rgba(255,255,255,0.07)"}`,
  borderRadius  : "16px",
  padding       : "20px",
  overflow      : "hidden",
  transition    : "all 0.25s ease",
  cursor        : clickable ? "pointer" : "default",
  boxShadow     : "0 4px 20px rgba(0,0,0,0.2)",
  backdropFilter: "blur(10px)",
});

// ═══════════════════════════════════════════════════════════
//   STATS GRID — convenience wrapper for 4-column layout
// ═══════════════════════════════════════════════════════════
export const StatsGrid = ({ children, cols = 4 }) => (
  <div style={{
    display            : "grid",
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gap                : "16px",
    marginBottom       : "28px",
  }}
    className="stats-grid"
  >
    {children}
    <style>{`
      @media (max-width: 1200px) { .stats-grid { grid-template-columns: repeat(2, 1fr) !important; } }
      @media (max-width: 600px)  { .stats-grid { grid-template-columns: 1fr !important; } }
    `}</style>
  </div>
);

// ═══════════════════════════════════════════════════════════
//   MINI STAT — compact version for sidebar/small spaces
// ═══════════════════════════════════════════════════════════
export const MiniStat = ({ label, value, color = "#6c63ff", icon }) => (
  <div style={{
    display    : "flex",
    alignItems : "center",
    gap        : "12px",
    padding    : "10px 14px",
    background : "rgba(255,255,255,0.03)",
    border     : "1px solid rgba(255,255,255,0.06)",
    borderRadius: "10px",
  }}>
    <div style={{
      width         : "34px", height: "34px",
      borderRadius  : "9px",
      background    : `${color}18`,
      display       : "flex",
      alignItems    : "center",
      justifyContent: "center",
      fontSize      : "16px",
      flexShrink    : 0,
    }}>
      {icon}
    </div>
    <div>
      <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-display)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1px" }}>{label}</p>
      <p style={{ fontSize: "17px", fontWeight: "700", color: "#e8e8f0", fontFamily: "var(--font-display)", letterSpacing: "-0.3px" }}>{value}</p>
    </div>
  </div>
);

export default StatsCard;
