// ═══════════════════════════════════════════════════════════
//                    HERO SECTION
// ═══════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const ArrowIcon  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const PlayIcon   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>;

// ── Animated tech words
const WORDS = ["Web Design", "App Dev", "Game Dev", "PCB Repair", "Web Apps", "Chip-Level"];

const HeroSection = () => {
  const [wordIdx, setWordIdx] = useState(0);
  const [fading,  setFading ] = useState(false);
  const [count,   setCount  ] = useState({ projects:0, clients:0, satisfaction:0 });

  // Word rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setWordIdx((i) => (i + 1) % WORDS.length);
        setFading(false);
      }, 300);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Count-up animation
  useEffect(() => {
    const targets = { projects:50, clients:120, satisfaction:99 };
    const duration = 1800;
    const steps = 60;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount({
        projects    : Math.round(targets.projects     * ease),
        clients     : Math.round(targets.clients      * ease),
        satisfaction: Math.round(targets.satisfaction * ease),
      });
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, []);

  return (
    <section style={{
      minHeight     : "100vh",
      display       : "flex",
      flexDirection : "column",
      alignItems    : "center",
      justifyContent: "center",
      padding       : "100px 20px 60px",
      position      : "relative",
      overflow      : "hidden",
      textAlign     : "center",
    }}>
      {/* ── Background glows */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:"-5%", left:"50%", transform:"translateX(-50%)", width:"700px", height:"700px", borderRadius:"50%", background:"radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 65%)" }} />
        <div style={{ position:"absolute", bottom:"10%", left:"-10%", width:"400px", height:"400px", borderRadius:"50%", background:"radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 65%)" }} />
        <div style={{ position:"absolute", bottom:"5%", right:"-5%", width:"350px", height:"350px", borderRadius:"50%", background:"radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 65%)" }} />

        {/* Grid */}
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize:"50px 50px", maskImage:"radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)" }} />

        {/* Floating orbs */}
        {[
          { size:12, top:"20%",left:"10%", color:"#6c63ff", delay:0    },
          { size:8,  top:"35%",right:"12%",color:"#f59e0b", delay:1.5  },
          { size:10, top:"70%",left:"15%", color:"#10b981", delay:0.8  },
          { size:6,  top:"60%",right:"20%",color:"#a78bfa", delay:2    },
          { size:14, top:"15%",right:"25%",color:"#f59e0b", delay:0.4  },
        ].map((orb, i) => (
          <div key={i} style={{
            position     : "absolute",
            top          : orb.top, left:orb.left, right:orb.right,
            width        : `${orb.size}px`, height:`${orb.size}px`,
            borderRadius : "50%",
            background   : orb.color,
            opacity      : 0.4,
            animation    : `float ${3 + i * 0.5}s ease-in-out infinite alternate`,
            animationDelay:`${orb.delay}s`,
            filter       : "blur(1px)",
          }} />
        ))}
      </div>

      {/* ── Badge */}
      <div style={{
        display     : "inline-flex",
        alignItems  : "center",
        gap         : "8px",
        padding     : "6px 16px",
        background  : "rgba(108,99,255,0.1)",
        border      : "1px solid rgba(108,99,255,0.25)",
        borderRadius: "20px",
        marginBottom: "28px",
        animation   : "slideUp 0.6s ease",
      }}>
        <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#6c63ff", boxShadow:"0 0 8px #6c63ff", animation:"pulse 2s ease infinite" }} />
        <span style={{ fontSize:"12px", fontFamily:"var(--font-display)", fontWeight:"600", color:"#a78bfa", letterSpacing:"0.05em" }}>
          Available for Projects
        </span>
      </div>

      {/* ── Heading */}
      <h1 style={{
        fontFamily  : "var(--font-display)",
        fontSize    : "clamp(2.2rem, 7vw, 4.8rem)",
        fontWeight  : "800",
        lineHeight  : "1.1",
        letterSpacing:"-1.5px",
        color       : "var(--clr-text)",
        maxWidth    : "820px",
        marginBottom: "8px",
        animation   : "slideUp 0.7s ease",
      }}>
        Building
        <span style={{ display:"block", background:"linear-gradient(135deg,#6c63ff,#a78bfa,#f59e0b)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
          Digital Futures
        </span>
      </h1>

      {/* ── Animated word */}
      <div style={{
        height      : "clamp(2rem, 4vw, 3rem)",
        display     : "flex",
        alignItems  : "center",
        justifyContent: "center",
        marginBottom: "20px",
        animation   : "slideUp 0.8s ease",
      }}>
        <span style={{ fontSize:"clamp(1.2rem, 3vw, 2rem)", fontFamily:"var(--font-display)", fontWeight:"700", color:"var(--clr-text-muted)" }}>
          Specializing in{" "}
        </span>
        <span style={{
          fontSize    : "clamp(1.2rem, 3vw, 2rem)",
          fontFamily  : "var(--font-display)",
          fontWeight  : "800",
          color       : "#6c63ff",
          marginLeft  : "8px",
          display     : "inline-block",
          opacity     : fading ? 0 : 1,
          transform   : fading ? "translateY(-8px)" : "translateY(0)",
          transition  : "all 0.3s ease",
          minWidth    : "180px",
          textAlign   : "left",
        }}>
          {WORDS[wordIdx]}
        </span>
      </div>

      {/* ── Subtext */}
      <p style={{
        fontSize    : "clamp(0.95rem, 2vw, 1.1rem)",
        color       : "var(--clr-text-muted)",
        maxWidth    : "560px",
        lineHeight  : "1.75",
        marginBottom: "36px",
        animation   : "slideUp 0.9s ease",
        fontFamily  : "var(--font-body)",
      }}>
        From pixel-perfect websites to chip-level motherboard repair — we deliver quality tech solutions tailored for you.
      </p>

      {/* ── CTA Buttons */}
      <div style={{
        display       : "flex",
        gap           : "12px",
        flexWrap      : "wrap",
        justifyContent: "center",
        marginBottom  : "64px",
        animation     : "slideUp 1s ease",
      }}>
        <Link to="/order" style={{
          display       : "inline-flex",
          alignItems    : "center",
          gap           : "8px",
          padding       : "13px 28px",
          background    : "linear-gradient(135deg,#6c63ff,#4f46e5)",
          border        : "none",
          borderRadius  : "50px",
          color         : "#fff",
          fontSize      : "14px",
          fontFamily    : "var(--font-display)",
          fontWeight    : "700",
          textDecoration: "none",
          boxShadow     : "0 8px 30px rgba(108,99,255,0.4)",
          transition    : "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
          letterSpacing : "0.02em",
        }}
          onMouseEnter={(e) => { e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 12px 40px rgba(108,99,255,0.55)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 8px 30px rgba(108,99,255,0.4)"; }}
        >
          Get Started <ArrowIcon />
        </Link>

        <Link to="/youtube" style={{
          display       : "inline-flex",
          alignItems    : "center",
          gap           : "8px",
          padding       : "13px 28px",
          background    : "rgba(255,255,255,0.05)",
          border        : "1px solid rgba(255,255,255,0.12)",
          borderRadius  : "50px",
          color         : "var(--clr-text-muted)",
          fontSize      : "14px",
          fontFamily    : "var(--font-display)",
          fontWeight    : "600",
          textDecoration: "none",
          transition    : "all 0.2s",
        }}
          onMouseEnter={(e) => { e.currentTarget.style.background="rgba(255,255,255,0.1)"; e.currentTarget.style.color="var(--clr-text)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background="rgba(255,255,255,0.05)"; e.currentTarget.style.color="var(--clr-text-muted)"; }}
        >
          <PlayIcon /> Watch Videos
        </Link>
      </div>

      {/* ── Stats Row */}
      <div style={{
        display     : "flex",
        gap         : "0",
        flexWrap    : "wrap",
        justifyContent: "center",
        background  : "rgba(255,255,255,0.03)",
        border      : "1px solid rgba(255,255,255,0.07)",
        borderRadius: "20px",
        backdropFilter: "blur(10px)",
        overflow    : "hidden",
        animation   : "slideUp 1.1s ease",
      }}>
        {[
          { label:"Projects Done",   value:`${count.projects}+`, color:"#6c63ff" },
          { label:"Happy Clients",   value:`${count.clients}+`,  color:"#10b981" },
          { label:"Satisfaction",    value:`${count.satisfaction}%`, color:"#f59e0b" },
        ].map((stat, i) => (
          <div key={i} style={{
            padding  : "22px 36px",
            textAlign: "center",
            borderRight: i < 2 ? "1px solid rgba(255,255,255,0.07)" : "none",
          }}
            className="hero-stat"
          >
            <p style={{ fontFamily:"var(--font-display)", fontSize:"clamp(1.5rem,3vw,2.2rem)", fontWeight:"800", color:stat.color, letterSpacing:"-0.5px", lineHeight:1 }}>
              {stat.value}
            </p>
            <p style={{ fontSize:"11.5px", color:"var(--clr-text-muted)", marginTop:"6px", fontFamily:"var(--font-display)", fontWeight:"500", textTransform:"uppercase", letterSpacing:"0.06em" }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes float { from{transform:translateY(0)} to{transform:translateY(-12px)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1;box-shadow:0 0 8px currentColor} 50%{opacity:0.6;box-shadow:0 0 16px currentColor} }
        @media(max-width:480px) { .hero-stat { padding:16px 20px !important; } }
      `}</style>
    </section>
  );
};

export default HeroSection;
