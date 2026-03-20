// ═══════════════════════════════════════════════════════════
//                   YOUTUBE PLAYER
//   Embedded iframe with like, share, comment, subscribe
// ═══════════════════════════════════════════════════════════
import { useState, useRef, useEffect } from "react";

const ThumbIcon  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>;
const ThumbFill  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>;
const ShareIcon  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;
const CommentIcon= () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const CloseIcon  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const SendIcon   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;

const YoutubePlayer = ({
  video,           // video object from API
  autoplay = false,
  showActions = true,
  compact = false,
}) => {
  const [liked,        setLiked       ] = useState(false);
  const [likeCount,    setLikeCount   ] = useState(Math.floor(Math.random() * 900) + 100);
  const [showComments, setShowComments] = useState(false);
  const [showShare,    setShowShare   ] = useState(false);
  const [comments,     setComments    ] = useState([]);
  const [commentText,  setCommentText ] = useState("");
  const [copied,       setCopied      ] = useState(false);
  const iframeRef = useRef();

  if (!video) return null;

  const embedUrl = video.embedUrl ||
    `https://www.youtube.com/embed/${video.videoId}?rel=0&modestbranding=1${autoplay ? "&autoplay=1" : ""}`;

  const youtubeUrl = `https://www.youtube.com/watch?v=${video.videoId}`;

  // ── Like → opens YouTube like
  const handleLike = () => {
    setLiked(!liked);
    setLikeCount((c) => liked ? c - 1 : c + 1);
    // Open YouTube for real action
    window.open(`${youtubeUrl}&feature=like`, "_blank");
  };

  // ── Share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: video.title, url: youtubeUrl });
        return;
      } catch {}
    }
    setShowShare(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(youtubeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Comment → redirect to YouTube comments
  const handleComment = () => {
    window.open(`${youtubeUrl}#comments`, "_blank");
  };

  // ── Subscribe
  const handleSubscribe = (subscribeUrl) => {
    window.open(subscribeUrl || `https://www.youtube.com/watch?v=${video.videoId}`, "_blank");
  };

  const aspectRatio = compact ? "56.25%" : "56.25%";

  return (
    <div style={{ width:"100%", animation:"scaleIn 0.3s ease" }}>
      {/* ── Iframe Player */}
      <div style={{
        position    : "relative",
        paddingTop  : aspectRatio,
        borderRadius: compact ? "12px" : "16px",
        overflow    : "hidden",
        background  : "#000",
        boxShadow   : "0 8px 40px rgba(0,0,0,0.5)",
      }}>
        <iframe
          ref={iframeRef}
          src={embedUrl}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{
            position : "absolute",
            top:0, left:0,
            width:"100%", height:"100%",
            border:"none",
          }}
        />
      </div>

      {/* ── Video Info + Actions */}
      {showActions && (
        <div style={{ padding:compact?"12px 0":"16px 0" }}>
          {/* Title */}
          <h3 style={{
            fontFamily  : "var(--font-display)",
            fontSize    : compact ? "14px" : "16px",
            fontWeight  : "700",
            color       : "var(--clr-text)",
            marginBottom: "6px",
            lineHeight  : "1.3",
          }}>
            {video.title}
          </h3>

          {/* Description */}
          {!compact && video.description && (
            <p style={{ fontSize:"13px", color:"var(--clr-text-muted)", marginBottom:"14px", lineHeight:"1.6", fontFamily:"var(--font-body)" }}>
              {video.description}
            </p>
          )}

          {/* Action Row */}
          <div style={{ display:"flex", alignItems:"center", gap:"8px", flexWrap:"wrap" }}>
            {/* Like */}
            <ActionButton
              icon={liked ? <ThumbFill /> : <ThumbIcon />}
              label={`${likeCount}`}
              onClick={handleLike}
              active={liked}
              activeColor="#ef4444"
              title="Like on YouTube"
            />

            {/* Share */}
            <ActionButton icon={<ShareIcon />} label="Share" onClick={handleShare} title="Share this video" />

            {/* Comment */}
            <ActionButton icon={<CommentIcon />} label="Comment" onClick={handleComment} title="Comment on YouTube" />

            {/* View on YouTube */}
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                marginLeft  : "auto",
                display     : "inline-flex",
                alignItems  : "center",
                gap         : "6px",
                padding     : "7px 14px",
                background  : "rgba(239,68,68,0.12)",
                border      : "1px solid rgba(239,68,68,0.25)",
                borderRadius: "20px",
                color       : "#ef4444",
                fontSize    : "12px",
                fontFamily  : "var(--font-display)",
                fontWeight  : "600",
                textDecoration: "none",
                transition  : "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background="rgba(239,68,68,0.2)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background="rgba(239,68,68,0.12)"; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#ef4444"><path d="M23 7s-.3-2-1.2-2.8C20.7 3 19.4 3 18.8 2.9 16.2 2.8 12 2.8 12 2.8s-4.2 0-6.8.1C4.6 3 3.3 3 2.2 4.2 1.3 5 1 7 1 7S.7 9.3.7 11.5v2.1c0 2.2.3 4.4.3 4.4S1.3 20 2.2 20.8c1.1 1.2 2.6 1.1 3.3 1.2C7.5 22.1 12 22.1 12 22.1s4.2 0 6.8-.2c.6-.1 1.9-.1 3-1.3.9-.8 1.2-2.8 1.2-2.8s.3-2.2.3-4.4v-2.1C23.3 9.3 23 7 23 7zm-13.5 8.9V8.1l8.1 3.9-8.1 3.8z"/></svg>
              Watch on YouTube
            </a>
          </div>
        </div>
      )}

      {/* ── Share Modal */}
      {showShare && (
        <>
          <div onClick={() => setShowShare(false)} style={{ position:"fixed", inset:0, zIndex:99, background:"rgba(0,0,0,0.5)", backdropFilter:"blur(4px)" }} />
          <div style={{ position:"fixed", bottom:"80px", left:"50%", transform:"translateX(-50%)", zIndex:100, width:"min(90vw,380px)", background:"#111124", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"16px", padding:"20px", boxShadow:"0 20px 60px rgba(0,0,0,0.5)", animation:"slideUp 0.3s ease" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
              <p style={{ fontFamily:"var(--font-display)", fontWeight:"700", color:"#e8e8f0", fontSize:"14px" }}>Share Video</p>
              <button onClick={() => setShowShare(false)} style={{ background:"rgba(255,255,255,0.07)", border:"none", borderRadius:"7px", width:"28px", height:"28px", color:"rgba(255,255,255,0.5)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><CloseIcon /></button>
            </div>

            {/* Social share buttons */}
            <div style={{ display:"flex", gap:"8px", marginBottom:"14px", flexWrap:"wrap" }}>
              {[
                { label:"WhatsApp",  color:"#25D366", href:`https://api.whatsapp.com/send?text=${encodeURIComponent(video.title + " " + youtubeUrl)}` },
                { label:"Facebook",  color:"#1877f2", href:`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(youtubeUrl)}` },
                { label:"Twitter",   color:"#1da1f2", href:`https://twitter.com/intent/tweet?text=${encodeURIComponent(video.title)}&url=${encodeURIComponent(youtubeUrl)}` },
                { label:"Telegram",  color:"#229ED9", href:`https://t.me/share/url?url=${encodeURIComponent(youtubeUrl)}&text=${encodeURIComponent(video.title)}` },
              ].map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer"
                  style={{ flex:"1 1 calc(50% - 4px)", padding:"9px 10px", background:`${s.color}15`, border:`1px solid ${s.color}30`, borderRadius:"10px", color:s.color, fontSize:"12px", fontFamily:"var(--font-display)", fontWeight:"600", textDecoration:"none", textAlign:"center", transition:"all 0.2s" }}
                  onMouseEnter={(e)=>e.currentTarget.style.background=`${s.color}25`}
                  onMouseLeave={(e)=>e.currentTarget.style.background=`${s.color}15`}
                >
                  {s.label}
                </a>
              ))}
            </div>

            {/* Copy link */}
            <div style={{ display:"flex", gap:"8px" }}>
              <input readOnly value={youtubeUrl} style={{ flex:1, padding:"9px 12px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:"8px", color:"rgba(255,255,255,0.6)", fontSize:"12px", fontFamily:"var(--font-mono)", outline:"none" }} />
              <button onClick={handleCopy} style={{ padding:"9px 14px", background:copied?"rgba(16,185,129,0.2)":"rgba(108,99,255,0.2)", border:`1px solid ${copied?"rgba(16,185,129,0.3)":"rgba(108,99,255,0.3)"}`, borderRadius:"8px", color:copied?"#34d399":"#a78bfa", fontSize:"12px", cursor:"pointer", fontFamily:"var(--font-display)", fontWeight:"600", whiteSpace:"nowrap", transition:"all 0.2s" }}>
                {copied ? "✓ Copied!" : "Copy"}
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes scaleIn { from{opacity:0;transform:scale(0.98)} to{opacity:1;transform:scale(1)} }
        @keyframes slideUp  { from{opacity:0;transform:translateX(-50%) translateY(10px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
      `}</style>
    </div>
  );
};

const ActionButton = ({ icon, label, onClick, active, activeColor="#6c63ff", title }) => (
  <button
    onClick={onClick}
    title={title}
    style={{
      display       : "inline-flex",
      alignItems    : "center",
      gap           : "6px",
      padding       : "7px 14px",
      background    : active ? `${activeColor}18` : "rgba(255,255,255,0.05)",
      border        : `1px solid ${active ? activeColor + "35" : "rgba(255,255,255,0.09)"}`,
      borderRadius  : "20px",
      color         : active ? activeColor : "var(--clr-text-muted)",
      fontSize      : "12.5px",
      fontFamily    : "var(--font-display)",
      fontWeight    : "600",
      cursor        : "pointer",
      transition    : "all 0.2s",
    }}
    onMouseEnter={(e) => { e.currentTarget.style.background = active ? `${activeColor}25` : "rgba(255,255,255,0.09)"; }}
    onMouseLeave={(e) => { e.currentTarget.style.background = active ? `${activeColor}18` : "rgba(255,255,255,0.05)"; }}
  >
    {icon}{label}
  </button>
);

export default YoutubePlayer;
