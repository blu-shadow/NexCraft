// ═══════════════════════════════════════════════════════════
//                  CHANNEL HEADER
//  YouTube page top — channel name, logo, subscribe button
// ═══════════════════════════════════════════════════════════
import { useState } from "react";
import { Skeleton } from "../common/Loader";

const BellIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;

const ChannelHeader = ({ channel, loading = false }) => {
  const [subscribed, setSubscribed] = useState(false);
  const [notified,   setNotified  ] = useState(false);
  const [subAnim,    setSubAnim   ] = useState(false);

  if (loading) {
    return (
      <div style={{ padding:"28px 0 20px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"18px", flexWrap:"wrap" }}>
          <Skeleton width="70px" height="70px" radius="50%" />
          <div style={{ flex:1 }}>
            <Skeleton width="180px" height="22px" style={{ marginBottom:"8px" }} />
            <Skeleton width="140px" height="14px" style={{ marginBottom:"6px" }} />
            <Skeleton width="100px" height="13px" />
          </div>
          <Skeleton width="120px" height="40px" radius="20px" />
        </div>
      </div>
    );
  }

  if (!channel) return null;

  const handleSubscribe = () => {
    setSubAnim(true);
    setTimeout(() => setSubAnim(false), 400);

    if (!subscribed) {
      setSubscribed(true);
      // Open YouTube subscribe page
      if (channel.subscribeUrl) {
        window.open(channel.subscribeUrl, "_blank");
      }
    } else {
      setSubscribed(false);
      setNotified(false);
    }
  };

  const handleBell = (e) => {
    e.stopPropagation();
    if (subscribed) setNotified(!notified);
  };

  return (
    <div style={{
      padding     : "24px 0 20px",
      borderBottom: "1px solid var(--clr-border)",
      marginBottom: "24px",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:"18px", flexWrap:"wrap" }}>
        {/* Channel Logo */}
        <div style={{
          width         : "72px", height:"72px",
          borderRadius  : "50%",
          background    : "linear-gradient(135deg,rgba(239,68,68,0.2),rgba(239,68,68,0.05))",
          border        : "3px solid rgba(239,68,68,0.3)",
          display       : "flex", alignItems:"center", justifyContent:"center",
          fontSize      : "32px",
          flexShrink    : 0,
          overflow      : "hidden",
          boxShadow     : "0 6px 20px rgba(239,68,68,0.15)",
        }}>
          {channel.channelLogo?.url
            ? <img src={channel.channelLogo.url} alt={channel.channelName} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
            : "▶️"
          }
        </div>

        {/* Channel Info */}
        <div style={{ flex:1, minWidth:"160px" }}>
          <h2 style={{
            fontFamily  : "var(--font-display)",
            fontWeight  : "800",
            fontSize    : "clamp(16px,3vw,22px)",
            color       : "var(--clr-text)",
            marginBottom: "4px",
            letterSpacing: "-0.3px",
          }}>
            {channel.channelName}
          </h2>

          <div style={{ display:"flex", alignItems:"center", gap:"10px", flexWrap:"wrap" }}>
            {channel.channelHandle && (
              <span style={{ fontSize:"13px", color:"var(--clr-text-muted)", fontFamily:"var(--font-body)" }}>
                {channel.channelHandle}
              </span>
            )}
            {channel.subscriberCount && (
              <>
                {channel.channelHandle && <span style={{ color:"var(--clr-border)", fontSize:"12px" }}>•</span>}
                <span style={{ fontSize:"13px", color:"var(--clr-text-muted)" }}>
                  {channel.subscriberCount} subscribers
                </span>
              </>
            )}
          </div>

          {channel.description && (
            <p style={{ fontSize:"12.5px", color:"var(--clr-text-muted)", marginTop:"6px", lineHeight:"1.5", maxWidth:"500px", fontFamily:"var(--font-body)" }}>
              {channel.description.slice(0, 120)}{channel.description.length > 120 ? "..." : ""}
            </p>
          )}
        </div>

        {/* Subscribe Button group */}
        <div style={{ display:"flex", alignItems:"center", gap:"8px", flexShrink:0 }}>
          {/* Bell (show only after subscribed) */}
          {subscribed && (
            <button
              onClick={handleBell}
              title={notified ? "Turn off notifications" : "Turn on notifications"}
              style={{
                width         : "38px", height:"38px",
                borderRadius  : "50%",
                background    : notified ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)",
                border        : "1px solid rgba(255,255,255,0.12)",
                color         : notified ? "#fbbf24" : "rgba(255,255,255,0.5)",
                display       : "flex", alignItems:"center", justifyContent:"center",
                cursor        : "pointer",
                transition    : "all 0.2s",
                animation     : notified ? "ring 0.5s ease" : "none",
              }}
            >
              <BellIcon />
            </button>
          )}

          {/* Subscribe button */}
          <button
            onClick={handleSubscribe}
            style={{
              display       : "flex",
              alignItems    : "center",
              gap           : "7px",
              padding       : "10px 22px",
              background    : subscribed
                ? "rgba(255,255,255,0.1)"
                : "linear-gradient(135deg,#ef4444,#dc2626)",
              border        : subscribed ? "1px solid rgba(255,255,255,0.15)" : "none",
              borderRadius  : "22px",
              color         : subscribed ? "var(--clr-text-muted)" : "#fff",
              fontSize      : "13.5px",
              fontFamily    : "var(--font-display)",
              fontWeight    : "700",
              cursor        : "pointer",
              transition    : "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
              transform     : subAnim ? "scale(0.92)" : "scale(1)",
              boxShadow     : subscribed ? "none" : "0 6px 20px rgba(239,68,68,0.35)",
              letterSpacing : "0.02em",
            }}
          >
            {subscribed ? "✓ Subscribed" : "Subscribe"}
          </button>
        </div>
      </div>

      {/* Channel URL link */}
      {channel.channelUrl && (
        <div style={{ marginTop:"12px" }}>
          <a
            href={channel.channelUrl}
            target="_blank"
            rel="noreferrer"
            style={{ fontSize:"12px", color:"rgba(239,68,68,0.7)", textDecoration:"none", display:"inline-flex", alignItems:"center", gap:"5px", fontFamily:"var(--font-body)", transition:"color 0.2s" }}
            onMouseEnter={(e) => e.currentTarget.style.color="#ef4444"}
            onMouseLeave={(e) => e.currentTarget.style.color="rgba(239,68,68,0.7)"}
          >
            View full channel on YouTube ↗
          </a>
        </div>
      )}

      <style>{`
        @keyframes ring {
          0%,100%{transform:rotate(0)} 20%{transform:rotate(-15deg)} 40%{transform:rotate(15deg)} 60%{transform:rotate(-10deg)} 80%{transform:rotate(10deg)}
        }
      `}</style>
    </div>
  );
};

export default ChannelHeader;
