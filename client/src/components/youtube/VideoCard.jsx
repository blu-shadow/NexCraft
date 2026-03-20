// ═══════════════════════════════════════════════════════════
//                     VIDEO CARD
// ═══════════════════════════════════════════════════════════
import { useState } from "react";
import { formatDate } from "../../utils/formatDate";

const PlayIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
);

const VIDEO_CATEGORY_COLORS = {
  tutorial: "#6c63ff",
  project : "#10b981",
  tips    : "#f59e0b",
  review  : "#3b82f6",
  vlog    : "#ec4899",
  other   : "#8888aa",
};

/**
 * VideoCard Props:
 *   video    — video object
 *   onClick  — called when card clicked (passes video)
 *   active   — bool, is this the currently playing video?
 *   variant  — "default" | "horizontal" | "mini"
 */
const VideoCard = ({ video, onClick, active = false, variant = "default" }) => {
  const [imgError, setImgError] = useState(false);
  const [hovered,  setHovered ] = useState(false);

  if (!video) return null;

  const catColor = VIDEO_CATEGORY_COLORS[video.category] || VIDEO_CATEGORY_COLORS.other;
  const thumbnail = !imgError && video.thumbnailUrl
    ? video.thumbnailUrl
    : null;

  // ── Mini variant (sidebar list item)
  if (variant === "mini") {
    return (
      <div
        onClick={() => onClick?.(video)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display     : "flex",
          gap         : "10px",
          padding     : "8px",
          borderRadius: "10px",
          background  : active ? "rgba(108,99,255,0.1)" : hovered ? "rgba(255,255,255,0.04)" : "transparent",
          border      : `1px solid ${active ? "rgba(108,99,255,0.3)" : "transparent"}`,
          cursor      : "pointer",
          transition  : "all 0.2s",
        }}
      >
        {/* Thumbnail */}
        <div style={{ width:"96px", height:"54px", borderRadius:"7px", overflow:"hidden", flexShrink:0, background:"#0a0a18", position:"relative" }}>
          {thumbnail
            ? <img src={thumbnail} alt={video.title} style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={() => setImgError(true)} />
            : <div style={{ width:"100%", height:"100%", background:`linear-gradient(135deg,${catColor}20,${catColor}08)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"20px" }}>▶️</div>
          }
          {active && (
            <div style={{ position:"absolute", inset:0, background:"rgba(108,99,255,0.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <div style={{ width:"8px", height:"8px", borderRadius:"50%", background:"#a78bfa", animation:"pulse 1s ease infinite" }} />
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontSize:"12px", fontFamily:"var(--font-display)", fontWeight:"600", color: active ? "#a78bfa" : "var(--clr-text)", lineHeight:"1.3", marginBottom:"4px", overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
            {video.title}
          </p>
          <span style={{ fontSize:"10px", padding:"2px 7px", background:`${catColor}18`, borderRadius:"20px", color:catColor, fontFamily:"var(--font-display)", fontWeight:"600", textTransform:"capitalize" }}>
            {video.category}
          </span>
        </div>
      </div>
    );
  }

  // ── Horizontal variant
  if (variant === "horizontal") {
    return (
      <div
        onClick={() => onClick?.(video)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display     : "flex",
          gap         : "14px",
          padding     : "12px",
          borderRadius: "14px",
          background  : active ? "rgba(108,99,255,0.08)" : hovered ? "rgba(255,255,255,0.03)" : "transparent",
          border      : `1px solid ${active ? "rgba(108,99,255,0.25)" : hovered ? "rgba(255,255,255,0.07)" : "transparent"}`,
          cursor      : "pointer",
          transition  : "all 0.2s",
        }}
      >
        {/* Thumbnail */}
        <div style={{ width:"140px", height:"79px", borderRadius:"10px", overflow:"hidden", flexShrink:0, position:"relative", background:"#0a0a18" }}>
          {thumbnail
            ? <img src={thumbnail} alt={video.title} style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={() => setImgError(true)} />
            : <div style={{ width:"100%", height:"100%", background:`linear-gradient(135deg,${catColor}20,${catColor}08)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"28px" }}>▶️</div>
          }
          <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0)", display:"flex", alignItems:"center", justifyContent:"center", transition:"background 0.2s" }}
            onMouseEnter={(e) => e.currentTarget.style.background="rgba(0,0,0,0.35)"}
            onMouseLeave={(e) => e.currentTarget.style.background="rgba(0,0,0,0)"}
          >
            <div style={{ width:"32px", height:"32px", borderRadius:"50%", background:"rgba(0,0,0,0.6)", display:"flex", alignItems:"center", justifyContent:"center", opacity:hovered?1:0, transition:"opacity 0.2s" }}>
              <PlayIcon />
            </div>
          </div>
        </div>

        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontSize:"13.5px", fontFamily:"var(--font-display)", fontWeight:"600", color:active?"#a78bfa":"var(--clr-text)", lineHeight:"1.35", marginBottom:"6px", overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
            {video.title}
          </p>
          {video.description && <p style={{ fontSize:"12px", color:"var(--clr-text-muted)", lineHeight:"1.5", overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", marginBottom:"8px" }}>{video.description}</p>}
          <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
            <span style={{ fontSize:"10.5px", padding:"2px 8px", background:`${catColor}18`, borderRadius:"20px", color:catColor, fontFamily:"var(--font-display)", fontWeight:"600", textTransform:"capitalize" }}>{video.category}</span>
            {video.createdAt && <span style={{ fontSize:"11px", color:"var(--clr-text-muted)" }}>{formatDate(video.createdAt)}</span>}
          </div>
        </div>
      </div>
    );
  }

  // ── Default grid card
  return (
    <div
      onClick={() => onClick?.(video)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background  : "var(--clr-surface)",
        border      : `1px solid ${active ? "rgba(108,99,255,0.4)" : hovered ? "rgba(255,255,255,0.12)" : "var(--clr-border)"}`,
        borderRadius: "16px",
        overflow    : "hidden",
        cursor      : "pointer",
        transition  : "all 0.3s cubic-bezier(0.34,1.2,0.64,1)",
        transform   : hovered && !active ? "translateY(-4px)" : "translateY(0)",
        boxShadow   : hovered ? "0 16px 40px rgba(0,0,0,0.3)" : active ? "0 0 0 2px rgba(108,99,255,0.4)" : "none",
      }}
    >
      {/* Thumbnail */}
      <div style={{ position:"relative", paddingTop:"56.25%", background:"#0a0a18", overflow:"hidden" }}>
        {thumbnail
          ? <img src={thumbnail} alt={video.title} style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", transition:"transform 0.4s ease" }} onError={() => setImgError(true)}
              onMouseEnter={(e) => e.currentTarget.style.transform="scale(1.05)"}
              onMouseLeave={(e) => e.currentTarget.style.transform="scale(1)"}
            />
          : <div style={{ position:"absolute", inset:0, background:`linear-gradient(135deg,${catColor}18,${catColor}06)`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ fontSize:"48px", filter:"drop-shadow(0 4px 10px rgba(0,0,0,0.3))" }}>▶️</span>
            </div>
        }

        {/* Play overlay */}
        <div style={{ position:"absolute", inset:0, background:hovered?"rgba(0,0,0,0.3)":"rgba(0,0,0,0)", transition:"background 0.3s", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ width:"52px", height:"52px", borderRadius:"50%", background:"rgba(0,0,0,0.7)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", opacity:hovered?1:0, transform:hovered?"scale(1)":"scale(0.8)", transition:"all 0.3s cubic-bezier(0.34,1.56,0.64,1)", boxShadow:"0 4px 20px rgba(0,0,0,0.4)" }}>
            <PlayIcon />
          </div>
        </div>

        {/* Currently playing indicator */}
        {active && (
          <div style={{ position:"absolute", top:"8px", left:"8px", display:"flex", alignItems:"center", gap:"5px", padding:"3px 10px", background:"rgba(108,99,255,0.85)", borderRadius:"20px", backdropFilter:"blur(4px)" }}>
            <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#fff", animation:"pulse 1s ease infinite" }} />
            <span style={{ fontSize:"10px", color:"#fff", fontFamily:"var(--font-display)", fontWeight:"700" }}>PLAYING</span>
          </div>
        )}

        {/* Category badge */}
        <div style={{ position:"absolute", bottom:"8px", right:"8px", padding:"2px 8px", background:`${catColor}cc`, borderRadius:"20px", fontSize:"10px", fontFamily:"var(--font-display)", fontWeight:"700", color:"#fff", textTransform:"capitalize", backdropFilter:"blur(4px)" }}>
          {video.category}
        </div>

        {/* Featured star */}
        {video.isFeatured && (
          <div style={{ position:"absolute", top:"8px", right:"8px", fontSize:"14px" }}>⭐</div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding:"12px 14px" }}>
        <p style={{
          fontFamily  : "var(--font-display)",
          fontWeight  : "600",
          fontSize    : "13.5px",
          color       : active ? "#a78bfa" : "var(--clr-text)",
          lineHeight  : "1.35",
          marginBottom: "6px",
          overflow    : "hidden",
          display     : "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        }}>
          {video.title}
        </p>
        {video.description && (
          <p style={{ fontSize:"12px", color:"var(--clr-text-muted)", lineHeight:"1.5", overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", marginBottom:"8px" }}>
            {video.description}
          </p>
        )}
        {video.createdAt && (
          <p style={{ fontSize:"11px", color:"var(--clr-text-subtle, rgba(255,255,255,0.25))" }}>
            {formatDate(video.createdAt)}
          </p>
        )}
      </div>
    </div>
  );
};

export default VideoCard;
