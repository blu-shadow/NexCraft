// ═══════════════════════════════════════════════════════════
//                     BLOG CARD
// ═══════════════════════════════════════════════════════════
import { useState } from "react";
import { Link }     from "react-router-dom";
import { timeAgo, readTime, getInitials, truncate } from "../../utils/formatDate";

const HeartIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const EyeIcon   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const MsgIcon   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;

const CATEGORY_COLORS = {
  tutorial: { color:"#6c63ff", bg:"rgba(108,99,255,0.12)" },
  news    : { color:"#3b82f6", bg:"rgba(59,130,246,0.12)"  },
  update  : { color:"#10b981", bg:"rgba(16,185,129,0.12)"  },
  project : { color:"#f59e0b", bg:"rgba(245,158,11,0.12)"  },
  tips    : { color:"#ec4899", bg:"rgba(236,72,153,0.12)"  },
  other   : { color:"#8888aa", bg:"rgba(136,136,170,0.12)" },
};

/**
 * BlogCard Props:
 *   blog     — blog object from API
 *   variant  — "default" | "featured" | "compact" | "horizontal"
 */
const BlogCard = ({ blog, variant = "default" }) => {
  const [imgError, setImgError] = useState(false);
  const [hovered,  setHovered ] = useState(false);

  if (!blog) return null;

  const { color, bg } = CATEGORY_COLORS[blog.category] || CATEGORY_COLORS.other;
  const hasThumb = !imgError && blog.thumbnail?.url;
  const hasVideo = !!blog.video?.url;

  // ── Compact list item
  if (variant === "compact") {
    return (
      <Link to={`/blog/${blog.slug}`} style={{ textDecoration:"none" }}>
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{ display:"flex", gap:"12px", padding:"12px", borderRadius:"12px", background:hovered?"rgba(255,255,255,0.04)":"transparent", transition:"background 0.2s" }}
        >
          {hasThumb && (
            <img src={blog.thumbnail.url} alt={blog.title} style={{ width:"72px", height:"50px", objectFit:"cover", borderRadius:"8px", flexShrink:0 }} onError={() => setImgError(true)} />
          )}
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontSize:"13px", fontFamily:"var(--font-display)", fontWeight:"600", color:"var(--clr-text)", lineHeight:"1.35", overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", marginBottom:"4px" }}>
              {blog.title}
            </p>
            <span style={{ fontSize:"11px", color:"var(--clr-text-muted)" }}>{timeAgo(blog.createdAt)}</span>
          </div>
        </div>
      </Link>
    );
  }

  // ── Horizontal card
  if (variant === "horizontal") {
    return (
      <Link to={`/blog/${blog.slug}`} style={{ textDecoration:"none" }}>
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            display     : "flex",
            gap         : "16px",
            padding     : "14px",
            background  : hovered ? "rgba(255,255,255,0.03)" : "var(--clr-surface)",
            border      : `1px solid ${hovered ? "rgba(255,255,255,0.12)" : "var(--clr-border)"}`,
            borderRadius: "14px",
            transition  : "all 0.2s",
          }}
        >
          <div style={{ width:"130px", height:"90px", borderRadius:"10px", overflow:"hidden", flexShrink:0, background:`${color}12`, position:"relative" }}>
            {hasThumb
              ? <img src={blog.thumbnail.url} alt={blog.title} style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={() => setImgError(true)} />
              : <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"28px" }}>📝</div>
            }
            {hasVideo && <div style={{ position:"absolute", bottom:"4px", right:"4px", background:"rgba(0,0,0,0.7)", borderRadius:"4px", padding:"2px 5px", fontSize:"10px", color:"#fff" }}>📹</div>}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"6px" }}>
              <span style={{ fontSize:"10px", padding:"2px 8px", background:bg, borderRadius:"20px", color, fontFamily:"var(--font-display)", fontWeight:"700", textTransform:"capitalize" }}>{blog.category}</span>
              <span style={{ fontSize:"11px", color:"var(--clr-text-muted)" }}>{readTime(blog.content)}</span>
            </div>
            <h3 style={{ fontFamily:"var(--font-display)", fontWeight:"700", fontSize:"14px", color:"var(--clr-text)", lineHeight:"1.3", marginBottom:"6px", overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
              {blog.title}
            </h3>
            <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
              <span style={{ fontSize:"11px", color:"var(--clr-text-muted)" }}>{timeAgo(blog.createdAt)}</span>
              <span style={{ display:"flex", alignItems:"center", gap:"3px", fontSize:"11px", color:"var(--clr-text-muted)" }}><EyeIcon />{blog.views || 0}</span>
              <span style={{ display:"flex", alignItems:"center", gap:"3px", fontSize:"11px", color:"var(--clr-text-muted)" }}><HeartIcon />{blog.likes?.length || 0}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // ── Featured / Default vertical card
  return (
    <Link to={`/blog/${blog.slug}`} style={{ textDecoration:"none" }}>
      <article
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background  : "var(--clr-surface)",
          border      : `1px solid ${hovered ? color + "40" : "var(--clr-border)"}`,
          borderRadius: "20px",
          overflow    : "hidden",
          transition  : "all 0.3s cubic-bezier(0.34,1.2,0.64,1)",
          transform   : hovered ? "translateY(-5px)" : "translateY(0)",
          boxShadow   : hovered ? `0 16px 40px rgba(0,0,0,0.25), 0 0 0 1px ${color}20` : "0 2px 8px rgba(0,0,0,0.08)",
          display     : "flex",
          flexDirection: "column",
          height      : "100%",
        }}
      >
        {/* Thumbnail */}
        <div style={{ position:"relative", paddingTop: variant === "featured" ? "50%" : "56.25%", background:`${color}10`, overflow:"hidden", flexShrink:0 }}>
          {hasThumb
            ? <img src={blog.thumbnail.url} alt={blog.title} style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", transition:"transform 0.5s ease" }} onError={() => setImgError(true)}
                onMouseEnter={(e) => e.currentTarget.style.transform="scale(1.06)"}
                onMouseLeave={(e) => e.currentTarget.style.transform="scale(1)"}
              />
            : <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <span style={{ fontSize: variant === "featured" ? "60px" : "48px", filter:"drop-shadow(0 4px 10px rgba(0,0,0,0.3))" }}>📝</span>
              </div>
          }

          {/* Overlays */}
          <div style={{ position:"absolute", top:"10px", left:"10px", display:"flex", gap:"6px" }}>
            <span style={{ fontSize:"10px", padding:"3px 9px", background:bg, border:`1px solid ${color}35`, borderRadius:"20px", color, fontFamily:"var(--font-display)", fontWeight:"700", textTransform:"capitalize", backdropFilter:"blur(4px)" }}>
              {blog.category}
            </span>
            {blog.isFeatured && (
              <span style={{ fontSize:"10px", padding:"3px 9px", background:"rgba(245,158,11,0.2)", border:"1px solid rgba(245,158,11,0.35)", borderRadius:"20px", color:"#fbbf24", fontFamily:"var(--font-display)", fontWeight:"700", backdropFilter:"blur(4px)" }}>
                ⭐ Featured
              </span>
            )}
          </div>

          {hasVideo && (
            <div style={{ position:"absolute", bottom:"10px", right:"10px", display:"flex", alignItems:"center", gap:"5px", padding:"3px 9px", background:"rgba(0,0,0,0.7)", borderRadius:"20px", backdropFilter:"blur(4px)" }}>
              <span style={{ fontSize:"10px" }}>📹</span>
              <span style={{ fontSize:"10px", color:"#fff", fontFamily:"var(--font-display)", fontWeight:"600" }}>Has Video</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding:"16px 18px", flex:1, display:"flex", flexDirection:"column" }}>
          <h3 style={{
            fontFamily  : "var(--font-display)",
            fontWeight  : "700",
            fontSize    : variant === "featured" ? "17px" : "15px",
            color       : "var(--clr-text)",
            lineHeight  : "1.3",
            marginBottom: "8px",
            overflow    : "hidden",
            display     : "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}>
            {blog.title}
          </h3>

          <p style={{ fontSize:"12.5px", color:"var(--clr-text-muted)", lineHeight:"1.65", marginBottom:"auto", fontFamily:"var(--font-body)", overflow:"hidden", display:"-webkit-box", WebkitLineClamp:3, WebkitBoxOrient:"vertical" }}>
            {blog.excerpt || truncate(blog.content, 120)}
          </p>

          {/* Tags */}
          {blog.tags?.length > 0 && (
            <div style={{ display:"flex", gap:"5px", flexWrap:"wrap", marginTop:"10px" }}>
              {blog.tags.slice(0,3).map((tag) => (
                <span key={tag} style={{ fontSize:"10px", padding:"2px 8px", background:"rgba(255,255,255,0.05)", borderRadius:"20px", color:"var(--clr-text-muted)", fontFamily:"var(--font-display)" }}>#{tag}</span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:"14px", paddingTop:"12px", borderTop:"1px solid var(--clr-border)" }}>
            {/* Author */}
            <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
              <div style={{ width:"26px", height:"26px", borderRadius:"50%", background:`linear-gradient(135deg,${color},${color}88)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"10px", fontWeight:"700", color:"#fff", fontFamily:"var(--font-display)", flexShrink:0, overflow:"hidden" }}>
                {blog.author?.avatar?.url
                  ? <img src={blog.author.avatar.url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                  : getInitials(blog.author?.name || "A")
                }
              </div>
              <span style={{ fontSize:"11.5px", color:"var(--clr-text-muted)", fontFamily:"var(--font-display)", fontWeight:"500" }}>{blog.author?.name || "Admin"}</span>
            </div>

            {/* Stats */}
            <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
              <span style={{ display:"flex", alignItems:"center", gap:"3px", fontSize:"11px", color:"var(--clr-text-muted)" }}><EyeIcon />{blog.views || 0}</span>
              <span style={{ display:"flex", alignItems:"center", gap:"3px", fontSize:"11px", color:"var(--clr-text-muted)" }}><HeartIcon />{blog.likes?.length || 0}</span>
              <span style={{ display:"flex", alignItems:"center", gap:"3px", fontSize:"11px", color:"var(--clr-text-muted)" }}><MsgIcon />{blog.comments?.length || 0}</span>
              <span style={{ fontSize:"11px", color:"var(--clr-text-muted)" }}>{readTime(blog.content)}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default BlogCard;
