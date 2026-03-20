// ═══════════════════════════════════════════════════════════
//                      HOME PAGE
// ═══════════════════════════════════════════════════════════
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar           from "../components/common/Navbar";
import Footer           from "../components/common/Footer";
import HeroSection      from "../components/home/HeroSection";
import ServiceCard      from "../components/home/ServiceCard";
import { CardSkeleton } from "../components/common/Loader";
import { getFeaturedServices } from "../services/serviceOrderService";
import { getFeaturedBlogs }    from "../services/blogService";
import { getFeaturedVideos }   from "../services/youtubeService";
import { timeAgo }             from "../utils/formatDate";
import { SERVICE_CATEGORIES }  from "../utils/constants";

// ── Intersection Observer hook for scroll animations
const useInView = (threshold = 0.15) => {
  const ref   = useRef();
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
};

// ── Section wrapper with fade-in
const Section = ({ children, style = {} }) => {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} style={{ transition:"all 0.7s cubic-bezier(0.4,0,0.2,1)", opacity:inView?1:0, transform:inView?"translateY(0)":"translateY(32px)", ...style }}>
      {children}
    </div>
  );
};

const ArrowIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const PlayIcon  = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>;

const HomePage = () => {
  const [services, setServices] = useState([]);
  const [blogs,    setBlogs   ] = useState([]);
  const [videos,   setVideos  ] = useState([]);
  const [loadSvc,  setLoadSvc ] = useState(true);
  const [loadBlog, setLoadBlog] = useState(true);
  const [loadVid,  setLoadVid ] = useState(true);

  useEffect(() => {
    getFeaturedServices(6).then((r) => { setServices(r.services||[]); setLoadSvc(false); }).catch(() => setLoadSvc(false));
    getFeaturedBlogs(3).then((r)    => { setBlogs(r.blogs||[]);       setLoadBlog(false);}).catch(() => setLoadBlog(false));
    getFeaturedVideos(4).then((r)   => { setVideos(r.videos||[]);     setLoadVid(false); }).catch(() => setLoadVid(false));
  }, []);

  return (
    <div style={{ minHeight:"100vh", background:"var(--clr-bg)" }}>
      <Navbar />

      {/* ── Hero */}
      <HeroSection />

      {/* ══════════════════════════════════════
          SERVICES SECTION
      ══════════════════════════════════════ */}
      <Section>
        <div className="container" style={{ padding:"80px 20px" }}>
          {/* Header */}
          <div style={{ textAlign:"center", marginBottom:"48px" }}>
            <span style={{ display:"inline-block", padding:"4px 14px", background:"rgba(108,99,255,0.1)", border:"1px solid rgba(108,99,255,0.2)", borderRadius:"20px", fontSize:"11px", fontFamily:"var(--font-display)", fontWeight:"700", color:"#a78bfa", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"14px" }}>
              What We Offer
            </span>
            <h2 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(1.7rem,4vw,2.8rem)", fontWeight:"800", color:"var(--clr-text)", letterSpacing:"-0.5px", marginBottom:"12px" }}>
              Our Services
            </h2>
            <p style={{ fontSize:"15px", color:"var(--clr-text-muted)", maxWidth:"520px", margin:"0 auto", lineHeight:"1.7", fontFamily:"var(--font-body)" }}>
              From pixel-perfect designs to chip-level hardware repair — we cover the full spectrum of digital solutions.
            </p>
          </div>

          {/* Category filter pills */}
          <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", justifyContent:"center", marginBottom:"36px" }}>
            {SERVICE_CATEGORIES.slice(0,6).map((cat) => (
              <Link key={cat.value} to={`/services/category/${cat.value}`} style={{ display:"flex", alignItems:"center", gap:"5px", padding:"5px 14px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"20px", textDecoration:"none", color:"var(--clr-text-muted)", fontSize:"12px", fontFamily:"var(--font-display)", fontWeight:"500", transition:"all 0.2s" }}
                onMouseEnter={(e)=>{e.currentTarget.style.background="rgba(108,99,255,0.1)";e.currentTarget.style.color="#a78bfa";e.currentTarget.style.borderColor="rgba(108,99,255,0.25)";}}
                onMouseLeave={(e)=>{e.currentTarget.style.background="rgba(255,255,255,0.04)";e.currentTarget.style.color="var(--clr-text-muted)";e.currentTarget.style.borderColor="rgba(255,255,255,0.07)";}}>
                {cat.icon} {cat.label}
              </Link>
            ))}
          </div>

          {/* Services Grid */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:"20px", marginBottom:"36px" }}>
            {loadSvc
              ? Array.from({length:6}).map((_,i) => <CardSkeleton key={i} />)
              : services.length > 0
                ? services.map((s) => <ServiceCard key={s._id} service={s} />)
                : (
                    <div style={{ gridColumn:"1/-1", textAlign:"center", padding:"48px", color:"var(--clr-text-muted)", fontSize:"15px", fontFamily:"var(--font-body)" }}>
                      <div style={{ fontSize:"48px", marginBottom:"16px" }}>🛠️</div>
                      Services coming soon...
                    </div>
                  )
            }
          </div>

          {/* View all CTA */}
          <div style={{ textAlign:"center" }}>
            <Link to="/services" style={{ display:"inline-flex", alignItems:"center", gap:"8px", padding:"12px 28px", background:"rgba(108,99,255,0.1)", border:"1px solid rgba(108,99,255,0.25)", borderRadius:"50px", color:"#a78bfa", textDecoration:"none", fontSize:"14px", fontFamily:"var(--font-display)", fontWeight:"700", transition:"all 0.25s" }}
              onMouseEnter={(e)=>{e.currentTarget.style.background="rgba(108,99,255,0.2)";e.currentTarget.style.borderColor="rgba(108,99,255,0.4)";}}
              onMouseLeave={(e)=>{e.currentTarget.style.background="rgba(108,99,255,0.1)";e.currentTarget.style.borderColor="rgba(108,99,255,0.25)";}}>
              View All Services <ArrowIcon />
            </Link>
          </div>
        </div>
      </Section>

      {/* ══════════════════════════════════════
          PROCESS / HOW IT WORKS
      ══════════════════════════════════════ */}
      <Section>
        <div style={{ background:"linear-gradient(135deg,rgba(108,99,255,0.05),rgba(245,158,11,0.03))", borderTop:"1px solid var(--clr-border)", borderBottom:"1px solid var(--clr-border)", padding:"80px 20px" }}>
          <div className="container">
            <div style={{ textAlign:"center", marginBottom:"48px" }}>
              <h2 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(1.5rem,3.5vw,2.4rem)", fontWeight:"800", color:"var(--clr-text)", marginBottom:"12px" }}>How It Works</h2>
              <p style={{ fontSize:"14px", color:"var(--clr-text-muted)", fontFamily:"var(--font-body)" }}>Simple, fast, and transparent</p>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:"24px" }}>
              {[
                { step:"01", title:"Choose Service",    desc:"Browse our services and pick what fits your needs",          icon:"🎯", color:"#6c63ff" },
                { step:"02", title:"Submit Details",    desc:"Fill in your requirements and project details",              icon:"📝", color:"#f59e0b" },
                { step:"03", title:"We Get in Touch",   desc:"Our team reviews and contacts you within 24 hours",          icon:"💬", color:"#10b981" },
                { step:"04", title:"Project Delivered", desc:"Quality work, on time, with full satisfaction guarantee",    icon:"🚀", color:"#a78bfa" },
              ].map((item, i) => (
                <div key={i} style={{ textAlign:"center", padding:"28px 20px", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"20px", position:"relative", transition:"all 0.3s" }}
                  onMouseEnter={(e)=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.borderColor=`${item.color}30`;}}
                  onMouseLeave={(e)=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.borderColor="rgba(255,255,255,0.06)";}}>
                  <div style={{ fontSize:"36px", marginBottom:"12px", filter:"drop-shadow(0 4px 8px rgba(0,0,0,0.2))" }}>{item.icon}</div>
                  <div style={{ fontFamily:"var(--font-mono)", fontSize:"11px", color:item.color, fontWeight:"700", letterSpacing:"0.1em", marginBottom:"8px" }}>{item.step}</div>
                  <h3 style={{ fontFamily:"var(--font-display)", fontWeight:"700", fontSize:"15px", color:"var(--clr-text)", marginBottom:"8px" }}>{item.title}</h3>
                  <p style={{ fontSize:"12.5px", color:"var(--clr-text-muted)", lineHeight:"1.6", fontFamily:"var(--font-body)" }}>{item.desc}</p>
                  {i < 3 && (
                    <div style={{ position:"absolute", right:"-12px", top:"50%", transform:"translateY(-50%)", color:"rgba(255,255,255,0.2)", fontSize:"20px", zIndex:1 }} className="process-arrow">→</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ══════════════════════════════════════
          LATEST VIDEOS
      ══════════════════════════════════════ */}
      {(loadVid || videos.length > 0) && (
        <Section>
          <div className="container" style={{ padding:"80px 20px" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"32px", flexWrap:"wrap", gap:"12px" }}>
              <div>
                <span style={{ display:"block", fontSize:"11px", fontFamily:"var(--font-display)", fontWeight:"700", color:"#ef4444", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"6px" }}>📹 YouTube</span>
                <h2 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(1.4rem,3vw,2rem)", fontWeight:"800", color:"var(--clr-text)" }}>Latest Videos</h2>
              </div>
              <Link to="/youtube" style={{ display:"flex", alignItems:"center", gap:"6px", padding:"8px 18px", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:"20px", color:"#ef4444", textDecoration:"none", fontSize:"13px", fontFamily:"var(--font-display)", fontWeight:"600", transition:"all 0.2s" }}
                onMouseEnter={(e)=>e.currentTarget.style.background="rgba(239,68,68,0.18)"}
                onMouseLeave={(e)=>e.currentTarget.style.background="rgba(239,68,68,0.1)"}>
                View All <ArrowIcon />
              </Link>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:"16px" }}>
              {loadVid
                ? Array.from({length:4}).map((_,i) => <CardSkeleton key={i} />)
                : videos.map((v) => (
                    <Link key={v._id} to="/youtube" state={{ videoId: v._id }} style={{ textDecoration:"none" }}>
                      <div style={{ background:"var(--clr-surface)", border:"1px solid var(--clr-border)", borderRadius:"14px", overflow:"hidden", transition:"all 0.3s" }}
                        onMouseEnter={(e)=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow="0 16px 40px rgba(0,0,0,0.3)";}}
                        onMouseLeave={(e)=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none";}}>
                        <div style={{ position:"relative", paddingTop:"56.25%", background:"#0a0a18" }}>
                          <img src={v.thumbnailUrl} alt={v.title} style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }} onError={(e)=>e.target.style.display="none"} />
                          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0)", transition:"background 0.2s" }}
                            onMouseEnter={(e)=>{e.currentTarget.style.background="rgba(0,0,0,0.35)"}}
                            onMouseLeave={(e)=>{e.currentTarget.style.background="rgba(0,0,0,0)"}}>
                            <div style={{ width:"40px", height:"40px", borderRadius:"50%", background:"rgba(239,68,68,0.9)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                              <PlayIcon />
                            </div>
                          </div>
                        </div>
                        <div style={{ padding:"12px" }}>
                          <p style={{ fontFamily:"var(--font-display)", fontWeight:"600", fontSize:"13px", color:"var(--clr-text)", lineHeight:"1.35", overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>{v.title}</p>
                        </div>
                      </div>
                    </Link>
                  ))
              }
            </div>
          </div>
        </Section>
      )}

      {/* ══════════════════════════════════════
          LATEST BLOG POSTS
      ══════════════════════════════════════ */}
      {(loadBlog || blogs.length > 0) && (
        <Section>
          <div style={{ background:"linear-gradient(180deg,transparent,rgba(108,99,255,0.04),transparent)", padding:"80px 20px" }}>
            <div className="container">
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"32px", flexWrap:"wrap", gap:"12px" }}>
                <div>
                  <span style={{ display:"block", fontSize:"11px", fontFamily:"var(--font-display)", fontWeight:"700", color:"#a78bfa", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"6px" }}>📝 Blog</span>
                  <h2 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(1.4rem,3vw,2rem)", fontWeight:"800", color:"var(--clr-text)" }}>Latest Posts</h2>
                </div>
                <Link to="/blog" style={{ display:"flex", alignItems:"center", gap:"6px", padding:"8px 18px", background:"rgba(108,99,255,0.1)", border:"1px solid rgba(108,99,255,0.2)", borderRadius:"20px", color:"#a78bfa", textDecoration:"none", fontSize:"13px", fontFamily:"var(--font-display)", fontWeight:"600", transition:"all 0.2s" }}
                  onMouseEnter={(e)=>e.currentTarget.style.background="rgba(108,99,255,0.18)"}
                  onMouseLeave={(e)=>e.currentTarget.style.background="rgba(108,99,255,0.1)"}>
                  Read All <ArrowIcon />
                </Link>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:"20px" }}>
                {loadBlog
                  ? Array.from({length:3}).map((_,i) => <CardSkeleton key={i} />)
                  : blogs.map((b) => (
                      <Link key={b._id} to={`/blog/${b.slug}`} style={{ textDecoration:"none" }}>
                        <div style={{ background:"var(--clr-surface)", border:"1px solid var(--clr-border)", borderRadius:"16px", overflow:"hidden", transition:"all 0.3s", height:"100%" }}
                          onMouseEnter={(e)=>{e.currentTarget.style.transform="translateY(-5px)";e.currentTarget.style.boxShadow="0 16px 40px rgba(0,0,0,0.25)";e.currentTarget.style.borderColor="rgba(108,99,255,0.3)";}}
                          onMouseLeave={(e)=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none";e.currentTarget.style.borderColor="var(--clr-border)";}}>
                          {b.thumbnail?.url && <img src={b.thumbnail.url} alt={b.title} style={{ width:"100%", height:"160px", objectFit:"cover" }} />}
                          <div style={{ padding:"16px" }}>
                            <span style={{ fontSize:"10px", padding:"2px 8px", background:"rgba(108,99,255,0.12)", borderRadius:"20px", color:"#a78bfa", fontFamily:"var(--font-display)", fontWeight:"700", textTransform:"capitalize" }}>{b.category}</span>
                            <h3 style={{ fontFamily:"var(--font-display)", fontWeight:"700", fontSize:"15px", color:"var(--clr-text)", lineHeight:"1.3", marginTop:"10px", marginBottom:"8px", overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>{b.title}</h3>
                            <p style={{ fontSize:"12.5px", color:"var(--clr-text-muted)", lineHeight:"1.6", overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>{b.excerpt}</p>
                            <p style={{ fontSize:"11px", color:"rgba(255,255,255,0.25)", marginTop:"10px" }}>{timeAgo(b.createdAt)}</p>
                          </div>
                        </div>
                      </Link>
                    ))
                }
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* ══════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════ */}
      <Section>
        <div className="container" style={{ padding:"40px 20px 100px" }}>
          <div style={{ background:"linear-gradient(135deg,rgba(108,99,255,0.15),rgba(245,158,11,0.08))", border:"1px solid rgba(108,99,255,0.2)", borderRadius:"28px", padding:"clamp(32px,5vw,56px)", textAlign:"center", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:"-50%", left:"50%", transform:"translateX(-50%)", width:"400px", height:"400px", borderRadius:"50%", background:"radial-gradient(circle,rgba(108,99,255,0.12) 0%,transparent 70%)", pointerEvents:"none" }} />
            <div style={{ fontSize:"48px", marginBottom:"16px" }}>🚀</div>
            <h2 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(1.5rem,3.5vw,2.4rem)", fontWeight:"800", color:"var(--clr-text)", marginBottom:"12px", letterSpacing:"-0.5px" }}>
              Ready to Build Something Amazing?
            </h2>
            <p style={{ fontSize:"15px", color:"var(--clr-text-muted)", maxWidth:"480px", margin:"0 auto 28px", lineHeight:"1.7", fontFamily:"var(--font-body)" }}>
              Tell us your idea and we'll make it a reality. Contact us now and get your project started today.
            </p>
            <Link to="/order" style={{ display:"inline-flex", alignItems:"center", gap:"8px", padding:"14px 32px", background:"linear-gradient(135deg,#6c63ff,#4f46e5)", border:"none", borderRadius:"50px", color:"#fff", textDecoration:"none", fontSize:"15px", fontFamily:"var(--font-display)", fontWeight:"700", boxShadow:"0 8px 32px rgba(108,99,255,0.4)", transition:"all 0.3s" }}
              onMouseEnter={(e)=>{e.currentTarget.style.transform="translateY(-2px) scale(1.02)";e.currentTarget.style.boxShadow="0 14px 40px rgba(108,99,255,0.55)";}}
              onMouseLeave={(e)=>{e.currentTarget.style.transform="translateY(0) scale(1)";e.currentTarget.style.boxShadow="0 8px 32px rgba(108,99,255,0.4)";}}>
              Get Started Today <ArrowIcon />
            </Link>
          </div>
        </div>
      </Section>

      <Footer />

      <style>{`
        .container { max-width:1200px; margin:0 auto; }
        @media(max-width:600px) { .process-arrow { display:none !important; } }
      `}</style>
    </div>
  );
};

export default HomePage;
