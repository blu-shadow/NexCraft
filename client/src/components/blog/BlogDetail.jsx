// ═══════════════════════════════════════════════════════════
//                    BLOG DETAIL
//    Full blog content with comments, likes, share
// ═══════════════════════════════════════════════════════════
import { useState } from "react";
import { Link }     from "react-router-dom";
import useAuth      from "../../hooks/useAuth";
import { addComment, deleteComment, toggleLike } from "../../services/blogService";
import { formatDate, timeAgo, getInitials, readTime } from "../../utils/formatDate";
import VideoUploadPlayer from "./VideoUploadPlayer";

const HeartIcon  = ({ fill }) => <svg width="18" height="18" viewBox="0 0 24 24" fill={fill?"currentColor":"none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const ShareIcon  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;
const ArrowIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
const SendIcon   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const TrashIcon  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;

const BlogDetail = ({ blog, onUpdate }) => {
  const { user, isLoggedIn } = useAuth();

  const [liked,       setLiked      ] = useState(blog.likes?.some((id) => id === user?._id));
  const [likeCount,   setLikeCount  ] = useState(blog.likes?.length || 0);
  const [comments,    setComments   ] = useState(blog.comments || []);
  const [commentText, setCommentText] = useState("");
  const [sending,     setSending    ] = useState(false);
  const [copied,      setCopied     ] = useState(false);

  if (!blog) return null;

  const handleLike = async () => {
    if (!isLoggedIn) return;
    const wasLiked = liked;
    setLiked(!liked);
    setLikeCount((c) => wasLiked ? c - 1 : c + 1);
    try { await toggleLike(blog._id); } catch { setLiked(wasLiked); setLikeCount((c) => wasLiked ? c + 1 : c - 1); }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !isLoggedIn) return;
    setSending(true);
    try {
      const res = await addComment(blog._id, commentText.trim());
      setComments(res.comments || [...comments, { user: user._id, name: user.name, text: commentText, createdAt: new Date() }]);
      setCommentText("");
    } catch {}
    setSending(false);
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(blog._id, commentId);
      setComments((c) => c.filter((x) => x._id !== commentId));
    } catch {}
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: blog.title, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const CATEGORY_COLORS = { tutorial:"#6c63ff", news:"#3b82f6", update:"#10b981", project:"#f59e0b", tips:"#ec4899", other:"#8888aa" };
  const catColor = CATEGORY_COLORS[blog.category] || CATEGORY_COLORS.other;

  return (
    <article style={{ maxWidth:"740px", margin:"0 auto" }}>
      {/* ── Back button */}
      <Link to="/blog" style={{ display:"inline-flex", alignItems:"center", gap:"6px", color:"var(--clr-text-muted)", textDecoration:"none", fontSize:"13px", fontFamily:"var(--font-display)", fontWeight:"500", marginBottom:"24px", transition:"color 0.2s" }}
        onMouseEnter={(e)=>e.currentTarget.style.color="var(--clr-text)"}
        onMouseLeave={(e)=>e.currentTarget.style.color="var(--clr-text-muted)"}
      >
        <ArrowIcon /> Back to Blog
      </Link>

      {/* ── Category + Meta */}
      <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"16px", flexWrap:"wrap" }}>
        <span style={{ fontSize:"11px", padding:"3px 10px", background:`${catColor}18`, border:`1px solid ${catColor}30`, borderRadius:"20px", color:catColor, fontFamily:"var(--font-display)", fontWeight:"700", textTransform:"capitalize" }}>
          {blog.category}
        </span>
        <span style={{ fontSize:"12px", color:"var(--clr-text-muted)" }}>{formatDate(blog.publishedAt || blog.createdAt)}</span>
        <span style={{ fontSize:"12px", color:"var(--clr-text-muted)" }}>·</span>
        <span style={{ fontSize:"12px", color:"var(--clr-text-muted)" }}>{readTime(blog.content)}</span>
      </div>

      {/* ── Title */}
      <h1 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(1.6rem,4vw,2.6rem)", fontWeight:"800", color:"var(--clr-text)", lineHeight:"1.2", letterSpacing:"-0.5px", marginBottom:"16px" }}>
        {blog.title}
      </h1>

      {/* ── Author */}
      <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"28px", paddingBottom:"20px", borderBottom:"1px solid var(--clr-border)" }}>
        <div style={{ width:"40px", height:"40px", borderRadius:"50%", background:`linear-gradient(135deg,${catColor},${catColor}88)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"14px", fontWeight:"700", color:"#fff", fontFamily:"var(--font-display)", overflow:"hidden" }}>
          {blog.author?.avatar?.url ? <img src={blog.author.avatar.url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} /> : getInitials(blog.author?.name || "A")}
        </div>
        <div>
          <p style={{ fontFamily:"var(--font-display)", fontWeight:"700", fontSize:"14px", color:"var(--clr-text)" }}>{blog.author?.name || "Admin"}</p>
          <p style={{ fontSize:"12px", color:"var(--clr-text-muted)" }}>Published {timeAgo(blog.publishedAt || blog.createdAt)}</p>
        </div>

        {/* Like + Share */}
        <div style={{ marginLeft:"auto", display:"flex", gap:"8px" }}>
          <button onClick={handleLike} disabled={!isLoggedIn}
            style={{ display:"flex", alignItems:"center", gap:"6px", padding:"7px 14px", background:liked?"rgba(239,68,68,0.12)":"rgba(255,255,255,0.05)", border:`1px solid ${liked?"rgba(239,68,68,0.3)":"rgba(255,255,255,0.1)"}`, borderRadius:"20px", color:liked?"#ef4444":"var(--clr-text-muted)", fontSize:"12.5px", fontFamily:"var(--font-display)", fontWeight:"600", cursor:isLoggedIn?"pointer":"not-allowed", transition:"all 0.2s" }}>
            <HeartIcon fill={liked} />{likeCount}
          </button>
          <button onClick={handleShare} style={{ display:"flex", alignItems:"center", gap:"6px", padding:"7px 14px", background:copied?"rgba(16,185,129,0.12)":"rgba(255,255,255,0.05)", border:`1px solid ${copied?"rgba(16,185,129,0.3)":"rgba(255,255,255,0.1)"}`, borderRadius:"20px", color:copied?"#34d399":"var(--clr-text-muted)", fontSize:"12.5px", fontFamily:"var(--font-display)", fontWeight:"600", cursor:"pointer", transition:"all 0.2s" }}>
            <ShareIcon />{copied?"Copied!":"Share"}
          </button>
        </div>
      </div>

      {/* ── Thumbnail */}
      {blog.thumbnail?.url && (
        <div style={{ borderRadius:"16px", overflow:"hidden", marginBottom:"28px", boxShadow:"0 8px 32px rgba(0,0,0,0.2)" }}>
          <img src={blog.thumbnail.url} alt={blog.title} style={{ width:"100%", maxHeight:"400px", objectFit:"cover", display:"block" }} />
        </div>
      )}

      {/* ── Blog Video Player (Cloudinary upload) */}
      {blog.video?.url && (
        <div style={{ marginBottom:"28px" }}>
          <VideoUploadPlayer src={blog.video.url} title={blog.title} />
        </div>
      )}

      {/* ── Content */}
      <div style={{
        color      : "var(--clr-text-muted)",
        fontSize   : "15px",
        lineHeight : "1.85",
        fontFamily : "var(--font-body)",
        whiteSpace : "pre-wrap",
        wordBreak  : "break-word",
      }}
        dangerouslySetInnerHTML={{ __html: blog.content?.replace(/\n/g, "<br/>") || "" }}
      />

      {/* ── Tags */}
      {blog.tags?.length > 0 && (
        <div style={{ marginTop:"32px", paddingTop:"20px", borderTop:"1px solid var(--clr-border)", display:"flex", gap:"6px", flexWrap:"wrap" }}>
          {blog.tags.map((tag) => (
            <Link key={tag} to={`/blog?tag=${tag}`} style={{ fontSize:"12px", padding:"4px 12px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"20px", color:"var(--clr-text-muted)", textDecoration:"none", transition:"all 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor=`${catColor}40`; e.currentTarget.style.color=catColor; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor="rgba(255,255,255,0.08)"; e.currentTarget.style.color="var(--clr-text-muted)"; }}
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}

      {/* ── Comments Section */}
      <div style={{ marginTop:"40px" }}>
        <h3 style={{ fontFamily:"var(--font-display)", fontWeight:"800", fontSize:"17px", color:"var(--clr-text)", marginBottom:"20px" }}>
          💬 Comments ({comments.length})
        </h3>

        {/* Add comment */}
        {isLoggedIn ? (
          <form onSubmit={handleComment} style={{ display:"flex", gap:"10px", marginBottom:"24px", alignItems:"flex-start" }}>
            <div style={{ width:"36px", height:"36px", borderRadius:"50%", background:`linear-gradient(135deg,#6c63ff,#a78bfa)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"13px", fontWeight:"700", color:"#fff", fontFamily:"var(--font-display)", flexShrink:0, overflow:"hidden" }}>
              {user?.avatar?.url ? <img src={user.avatar.url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} /> : getInitials(user?.name || "?")}
            </div>
            <div style={{ flex:1, display:"flex", gap:"8px" }}>
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                maxLength={500}
                style={{ flex:1, padding:"10px 14px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:"10px", color:"var(--clr-text)", fontSize:"13.5px", fontFamily:"var(--font-body)", outline:"none" }}
              />
              <button type="submit" disabled={!commentText.trim() || sending}
                style={{ padding:"10px 16px", background:"linear-gradient(135deg,#6c63ff,#4f46e5)", border:"none", borderRadius:"10px", color:"#fff", cursor:(!commentText.trim()||sending)?"not-allowed":"pointer", display:"flex", alignItems:"center", gap:"5px", fontSize:"12px", fontFamily:"var(--font-display)", fontWeight:"700", opacity:(!commentText.trim()||sending)?0.5:1, transition:"opacity 0.2s" }}>
                <SendIcon />
              </button>
            </div>
          </form>
        ) : (
          <div style={{ padding:"14px", background:"rgba(108,99,255,0.06)", border:"1px solid rgba(108,99,255,0.15)", borderRadius:"10px", marginBottom:"24px", textAlign:"center" }}>
            <p style={{ fontSize:"13px", color:"var(--clr-text-muted)", fontFamily:"var(--font-body)" }}>
              <Link to="/login" style={{ color:"#a78bfa", fontWeight:"600", textDecoration:"none" }}>Login</Link> to add a comment
            </p>
          </div>
        )}

        {/* Comments list */}
        <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
          {comments.length === 0 ? (
            <p style={{ textAlign:"center", color:"var(--clr-text-muted)", fontSize:"13px", padding:"20px", fontFamily:"var(--font-body)" }}>
              No comments yet. Be the first to comment!
            </p>
          ) : (
            comments.map((c, i) => (
              <div key={c._id || i} style={{ display:"flex", gap:"10px", padding:"12px 14px", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"12px" }}>
                <div style={{ width:"34px", height:"34px", borderRadius:"50%", background:"linear-gradient(135deg,#6c63ff,#a78bfa)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"12px", fontWeight:"700", color:"#fff", fontFamily:"var(--font-display)", flexShrink:0, overflow:"hidden" }}>
                  {c.avatar ? <img src={c.avatar} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} /> : getInitials(c.name || "?")}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"4px" }}>
                    <span style={{ fontSize:"13px", fontWeight:"700", color:"var(--clr-text)", fontFamily:"var(--font-display)" }}>{c.name}</span>
                    <span style={{ fontSize:"11px", color:"var(--clr-text-muted)" }}>{timeAgo(c.createdAt)}</span>
                  </div>
                  <p style={{ fontSize:"13.5px", color:"var(--clr-text-muted)", lineHeight:"1.6", fontFamily:"var(--font-body)" }}>{c.text}</p>
                </div>
                {(user?._id === (c.user?._id || c.user)) && (
                  <button onClick={() => handleDeleteComment(c._id)} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(239,68,68,0.4)", padding:"4px", transition:"color 0.2s" }}
                    onMouseEnter={(e) => e.currentTarget.style.color="#ef4444"}
                    onMouseLeave={(e) => e.currentTarget.style.color="rgba(239,68,68,0.4)"}
                  ><TrashIcon /></button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </article>
  );
};

export default BlogDetail;
