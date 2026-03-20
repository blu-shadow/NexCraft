// ═══════════════════════════════════════════════════════════
//               VIDEO UPLOAD PLAYER
//   For Cloudinary-uploaded blog videos (not YouTube)
// ═══════════════════════════════════════════════════════════
import { useState, useRef } from "react";

const PlayIcon    = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
const PauseIcon   = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>;
const VolIcon     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>;
const MuteIcon    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>;
const FullIcon    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>;

const fmtTime = (s) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2,"0")}`;
};

const VideoUploadPlayer = ({ src, title = "", poster = "" }) => {
  const videoRef    = useRef();
  const containerRef= useRef();
  const progressRef = useRef();

  const [playing,  setPlaying ] = useState(false);
  const [muted,    setMuted   ] = useState(false);
  const [volume,   setVolume  ] = useState(1);
  const [current,  setCurrent ] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading,  setLoading ] = useState(true);
  const [showCtrl, setShowCtrl] = useState(true);
  const [buffered, setBuffered ] = useState(0);
  const hideTimer = useRef();

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) { v.pause(); setPlaying(false); }
    else { v.play(); setPlaying(true); }
  };

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    setCurrent(v.currentTime);
    if (v.buffered.length) setBuffered((v.buffered.end(0) / v.duration) * 100);
  };

  const handleSeek = (e) => {
    const rect = progressRef.current.getBoundingClientRect();
    const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const v    = videoRef.current;
    if (v) { v.currentTime = pct * duration; setCurrent(pct * duration); }
  };

  const handleVolume = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setMuted(val === 0);
    if (videoRef.current) videoRef.current.volume = val;
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !muted;
    setMuted(!muted);
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!document.fullscreenElement) el.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  const showControls = () => {
    setShowCtrl(true);
    clearTimeout(hideTimer.current);
    if (playing) {
      hideTimer.current = setTimeout(() => setShowCtrl(false), 2500);
    }
  };

  const pct = duration ? (current / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={showControls}
      onMouseEnter={showControls}
      onMouseLeave={() => playing && setShowCtrl(false)}
      style={{
        position     : "relative",
        borderRadius : "16px",
        overflow     : "hidden",
        background   : "#000",
        boxShadow    : "0 10px 40px rgba(0,0,0,0.5)",
        cursor       : showCtrl ? "default" : "none",
        userSelect   : "none",
        aspectRatio  : "16/9",
      }}
    >
      {/* ── Video element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted={muted}
        style={{ width:"100%", height:"100%", objectFit:"contain", display:"block" }}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={(e) => { setDuration(e.target.duration); setLoading(false); }}
        onWaiting={() => setLoading(true)}
        onPlaying={() => setLoading(false)}
        onEnded={() => setPlaying(false)}
        onClick={toggle}
      />

      {/* ── Loading spinner */}
      {loading && (
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.4)" }}>
          <div style={{ width:"44px", height:"44px", border:"4px solid rgba(255,255,255,0.2)", borderTop:"4px solid #fff", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
        </div>
      )}

      {/* ── Big Play/Pause button (center) */}
      {!playing && !loading && (
        <div onClick={toggle} style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", background:"rgba(0,0,0,0.3)" }}>
          <div style={{ width:"72px", height:"72px", borderRadius:"50%", background:"rgba(0,0,0,0.7)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", transition:"transform 0.2s", boxShadow:"0 8px 30px rgba(0,0,0,0.4)" }}
            onMouseEnter={(e)=>e.currentTarget.style.transform="scale(1.1)"}
            onMouseLeave={(e)=>e.currentTarget.style.transform="scale(1)"}
          >
            <PlayIcon />
          </div>
        </div>
      )}

      {/* ── Controls overlay */}
      <div style={{
        position   : "absolute",
        bottom     : 0, left:0, right:0,
        background : "linear-gradient(transparent, rgba(0,0,0,0.85))",
        padding    : "32px 16px 14px",
        transition : "opacity 0.3s",
        opacity    : showCtrl ? 1 : 0,
      }}>
        {/* Title */}
        {title && <p style={{ fontSize:"12px", color:"rgba(255,255,255,0.8)", fontFamily:"var(--font-display)", fontWeight:"600", marginBottom:"10px", overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>{title}</p>}

        {/* Progress bar */}
        <div
          ref={progressRef}
          onClick={handleSeek}
          style={{ height:"4px", background:"rgba(255,255,255,0.2)", borderRadius:"2px", cursor:"pointer", position:"relative", marginBottom:"10px" }}
        >
          {/* Buffered */}
          <div style={{ position:"absolute", left:0, top:0, height:"100%", width:`${buffered}%`, background:"rgba(255,255,255,0.3)", borderRadius:"2px", transition:"width 0.3s" }} />
          {/* Played */}
          <div style={{ position:"absolute", left:0, top:0, height:"100%", width:`${pct}%`, background:"linear-gradient(90deg,#6c63ff,#a78bfa)", borderRadius:"2px" }} />
          {/* Thumb */}
          <div style={{ position:"absolute", top:"50%", left:`${pct}%`, transform:"translate(-50%,-50%)", width:"12px", height:"12px", borderRadius:"50%", background:"#fff", boxShadow:"0 2px 8px rgba(0,0,0,0.4)", transition:"transform 0.1s" }} />
        </div>

        {/* Controls row */}
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          {/* Play/Pause */}
          <button onClick={toggle} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", width:"28px", height:"28px" }}>
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>

          {/* Time */}
          <span style={{ fontSize:"11px", color:"rgba(255,255,255,0.8)", fontFamily:"var(--font-mono)", whiteSpace:"nowrap", letterSpacing:"0.05em" }}>
            {fmtTime(current)} / {fmtTime(duration)}
          </span>

          <div style={{ flex:1 }} />

          {/* Volume */}
          <button onClick={toggleMute} style={{ background:"none", border:"none", cursor:"pointer", color:"#fff", display:"flex", alignItems:"center" }}>
            {muted || volume === 0 ? <MuteIcon /> : <VolIcon />}
          </button>
          <input type="range" min="0" max="1" step="0.05" value={muted ? 0 : volume} onChange={handleVolume}
            style={{ width:"60px", accentColor:"#6c63ff", cursor:"pointer" }}
          />

          {/* Fullscreen */}
          <button onClick={toggleFullscreen} style={{ background:"none", border:"none", cursor:"pointer", color:"#fff", display:"flex", alignItems:"center" }}>
            <FullIcon />
          </button>
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

export default VideoUploadPlayer;
