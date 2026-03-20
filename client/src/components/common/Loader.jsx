// ═══════════════════════════════════════════════════════════
//                      LOADER
// ═══════════════════════════════════════════════════════════

// ── Full Page Loader
export const PageLoader = ({ text = "Loading..." }) => (
  <div style={{
    position      : "fixed",
    inset         : 0,
    background    : "var(--clr-bg)",
    display       : "flex",
    flexDirection : "column",
    alignItems    : "center",
    justifyContent: "center",
    gap           : "24px",
    zIndex        : 999,
  }}>
    {/* Animated logo mark */}
    <div style={{ position:"relative", width:"64px", height:"64px" }}>
      <svg viewBox="0 0 64 64" fill="none" style={{ width:"64px", height:"64px" }}>
        <defs>
          <linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6c63ff"/>
            <stop offset="100%" stopColor="#f59e0b"/>
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="28" stroke="rgba(108,99,255,0.12)" strokeWidth="4" fill="none"/>
        <circle cx="32" cy="32" r="28" stroke="url(#lg1)" strokeWidth="4" fill="none"
          strokeDasharray="176" strokeDashoffset="132"
          strokeLinecap="round"
          style={{ transformOrigin:"center", animation:"spin 1s linear infinite" }}
          transform="rotate(-90 32 32)"
        />
        <circle cx="32" cy="32" r="10" fill="url(#lg1)" opacity="0.9"/>
      </svg>
    </div>

    <div style={{ textAlign:"center" }}>
      <p style={{
        fontFamily  : "var(--font-display)",
        fontSize    : "15px",
        fontWeight  : "600",
        color       : "var(--clr-text-muted)",
        animation   : "pulse 1.5s ease infinite",
      }}>
        {text}
      </p>
    </div>

    <style>{`
      @keyframes spin  { to { transform:rotate(360deg); } }
      @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
    `}</style>
  </div>
);

// ── Inline Spinner
export const Spinner = ({ size = "md", color = "#6c63ff" }) => {
  const sizes = { sm:"16px", md:"24px", lg:"40px", xl:"60px" };
  const borders = { sm:"2px", md:"3px", lg:"4px", xl:"5px" };
  const s = sizes[size] || sizes.md;
  const b = borders[size] || borders.md;
  return (
    <div style={{
      width       : s, height:s,
      border      : `${b} solid rgba(108,99,255,0.15)`,
      borderTop   : `${b} solid ${color}`,
      borderRadius: "50%",
      animation   : "spin 0.7s linear infinite",
      flexShrink  : 0,
    }} />
  );
};

// ── Skeleton Block
export const Skeleton = ({ width = "100%", height = "16px", radius = "6px", style = {} }) => (
  <div className="skeleton" style={{ width, height, borderRadius:radius, flexShrink:0, ...style }} />
);

// ── Card Skeleton
export const CardSkeleton = () => (
  <div style={{ background:"var(--clr-surface)", border:"1px solid var(--clr-border)", borderRadius:"16px", padding:"20px" }}>
    <Skeleton height="180px" radius="10px" style={{ marginBottom:"16px" }} />
    <Skeleton width="70%" height="18px" style={{ marginBottom:"10px" }} />
    <Skeleton width="90%" height="13px" style={{ marginBottom:"6px" }} />
    <Skeleton width="75%" height="13px" style={{ marginBottom:"16px" }} />
    <div style={{ display:"flex", gap:"8px" }}>
      <Skeleton width="80px" height="28px" radius="20px" />
      <Skeleton width="60px" height="28px" radius="20px" />
    </div>
  </div>
);

// ── Content Loader (full section)
export const SectionLoader = ({ count = 3, columns = 3 }) => (
  <div style={{ display:"grid", gridTemplateColumns:`repeat(${columns}, 1fr)`, gap:"16px" }}>
    {Array.from({ length:count }).map((_,i) => <CardSkeleton key={i} />)}
  </div>
);

// ── Dots Loader
export const DotsLoader = ({ color = "#6c63ff" }) => (
  <div style={{ display:"flex", gap:"6px", alignItems:"center" }}>
    {[0,1,2].map((i) => (
      <div key={i} style={{
        width:"8px", height:"8px",
        borderRadius:"50%",
        background:color,
        animation:"dotBounce 1.2s ease infinite",
        animationDelay:`${i * 0.2}s`,
      }} />
    ))}
    <style>{`@keyframes dotBounce { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1);opacity:1} }`}</style>
  </div>
);

// ── Button Loader (inside button)
export const BtnLoader = () => (
  <div style={{ width:"16px", height:"16px", border:"2px solid rgba(255,255,255,0.3)", borderTop:"2px solid #fff", borderRadius:"50%", animation:"spin 0.6s linear infinite" }} />
);

// Default export = PageLoader
export default PageLoader;
