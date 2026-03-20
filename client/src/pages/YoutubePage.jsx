// ═══════════════════════════════════════════════════════════
//                    YOUTUBE PAGE
// ═══════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import Navbar         from "../components/common/Navbar";
import ChannelHeader  from "../components/youtube/ChannelHeader";
import YoutubePlayer  from "../components/youtube/YoutubePlayer";
import VideoCard      from "../components/youtube/VideoCard";
import { Skeleton }   from "../components/common/Loader";
import { getAllVideos, getChannelInfo } from "../services/youtubeService";
import { VIDEO_CATEGORIES } from "../utils/constants";

const SearchIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;

const YoutubePage = () => {
  const [channel,  setChannel ] = useState(null);
  const [videos,   setVideos  ] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading,  setLoading ] = useState(true);
  const [category, setCategory] = useState("all");
  const [search,   setSearch  ] = useState("");
  const [page,     setPage    ] = useState(1);
  const [hasMore,  setHasMore ] = useState(true);
  const [loadMore, setLoadMore] = useState(false);

  const LIMIT = 12;

  useEffect(() => {
    getChannelInfo().then((r) => setChannel(r.channel)).catch(() => {});
  }, []);

  useEffect(() => {
    setPage(1); setVideos([]); setHasMore(true);
    fetchVideos(1, true);
  }, [category, search]);

  const fetchVideos = async (pageNum = 1, reset = false) => {
    if (pageNum === 1) setLoading(true); else setLoadMore(true);
    try {
      const params = { page:pageNum, limit:LIMIT };
      if (category !== "all") params.category = category;
      if (search.trim()) params.search = search.trim();
      const res = await getAllVideos(params);
      const newVids = res.videos || [];
      setVideos((prev) => reset ? newVids : [...prev, ...newVids]);
      setHasMore(newVids.length === LIMIT);
      // Auto-select first video
      if (pageNum === 1 && newVids.length > 0 && !selected) {
        setSelected(newVids[0]);
      }
    } catch {}
    setLoading(false);
    setLoadMore(false);
  };

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchVideos(next);
  };

  // Filter display videos
  const displayVideos = videos.filter((v) =>
    !search || v.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight:"100vh", background:"var(--clr-bg)" }}>
      <Navbar />

      <div style={{ maxWidth:"1400px", margin:"0 auto", padding:"76px 16px 100px" }}>
        {/* Channel Header */}
        <ChannelHeader channel={channel} loading={!channel} />

        {/* ── Search + Category Filters */}
        <div style={{ display:"flex", gap:"12px", alignItems:"center", marginBottom:"24px", flexWrap:"wrap" }}>
          {/* Search */}
          <div style={{ display:"flex", alignItems:"center", gap:"8px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"10px", padding:"0 14px", height:"40px", minWidth:"200px", flex:1, maxWidth:"320px" }}>
            <span style={{ color:"rgba(255,255,255,0.3)" }}><SearchIcon /></span>
            <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search videos..." style={{ background:"transparent", border:"none", outline:"none", color:"var(--clr-text)", fontSize:"13px", fontFamily:"var(--font-body)", width:"100%" }} />
          </div>

          {/* Category pills */}
          <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
            {[{ value:"all", label:"All", icon:"🎬" }, ...VIDEO_CATEGORIES].map((cat) => (
              <button key={cat.value} onClick={() => setCategory(cat.value)}
                style={{ padding:"6px 14px", borderRadius:"20px", border:"1px solid", fontSize:"12px", fontFamily:"var(--font-display)", fontWeight:"600", cursor:"pointer", transition:"all 0.2s", display:"flex", alignItems:"center", gap:"4px", background:category===cat.value?"rgba(239,68,68,0.15)":"rgba(255,255,255,0.04)", borderColor:category===cat.value?"rgba(239,68,68,0.4)":"rgba(255,255,255,0.08)", color:category===cat.value?"#ef4444":"var(--clr-text-muted)" }}>
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Main Layout: Player + Video List */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:"24px", alignItems:"start" }} className="yt-layout">
          {/* Left: Player */}
          <div>
            {loading && !selected ? (
              <div>
                <Skeleton height="0" style={{ paddingTop:"56.25%", borderRadius:"16px", marginBottom:"16px" }} />
                <Skeleton height="20px" width="70%" style={{ marginBottom:"8px" }} />
                <Skeleton height="14px" width="50%" />
              </div>
            ) : selected ? (
              <YoutubePlayer video={selected} showActions={true} />
            ) : (
              <div style={{ paddingTop:"56.25%", position:"relative", background:"rgba(255,255,255,0.03)", borderRadius:"16px", border:"1px solid var(--clr-border)" }}>
                <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"12px" }}>
                  <span style={{ fontSize:"48px" }}>📹</span>
                  <p style={{ color:"var(--clr-text-muted)", fontSize:"15px", fontFamily:"var(--font-display)", fontWeight:"600" }}>Select a video to watch</p>
                </div>
              </div>
            )}

            {/* Video grid (below player on desktop) */}
            {!loading && displayVideos.length > 0 && (
              <div style={{ marginTop:"32px" }}>
                <h3 style={{ fontFamily:"var(--font-display)", fontWeight:"700", fontSize:"15px", color:"var(--clr-text)", marginBottom:"16px" }}>
                  All Videos <span style={{ color:"var(--clr-text-muted)", fontWeight:"400", fontSize:"13px" }}>({displayVideos.length})</span>
                </h3>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:"14px" }}>
                  {displayVideos.map((v) => (
                    <VideoCard key={v._id} video={v} onClick={setSelected} active={selected?._id === v._id} />
                  ))}
                </div>

                {hasMore && (
                  <div style={{ textAlign:"center", marginTop:"28px" }}>
                    <button onClick={handleLoadMore} disabled={loadMore}
                      style={{ padding:"10px 28px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"20px", color:"var(--clr-text-muted)", fontSize:"13px", cursor:"pointer", fontFamily:"var(--font-display)", fontWeight:"600", display:"inline-flex", alignItems:"center", gap:"8px" }}>
                      {loadMore ? <><span style={{ width:"14px", height:"14px", border:"2px solid rgba(255,255,255,0.2)", borderTop:"2px solid white", borderRadius:"50%", animation:"spin 0.6s linear infinite" }} /> Loading...</> : "Load More Videos"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {!loading && displayVideos.length === 0 && (
              <div style={{ textAlign:"center", padding:"60px 20px", color:"var(--clr-text-muted)" }}>
                <div style={{ fontSize:"48px", marginBottom:"16px" }}>🔍</div>
                <p style={{ fontFamily:"var(--font-display)", fontWeight:"600", fontSize:"16px" }}>No videos found</p>
                <p style={{ fontSize:"13px", marginTop:"6px" }}>Try a different search or category</p>
              </div>
            )}
          </div>

          {/* Right: Video List Sidebar */}
          <div style={{ position:"sticky", top:"80px" }}>
            <h3 style={{ fontFamily:"var(--font-display)", fontWeight:"700", fontSize:"14px", color:"var(--clr-text)", marginBottom:"14px", display:"flex", alignItems:"center", gap:"8px" }}>
              <span style={{ width:"4px", height:"16px", background:"linear-gradient(#ef4444,#dc2626)", borderRadius:"2px" }} />
              Up Next
            </h3>
            <div style={{ display:"flex", flexDirection:"column", gap:"4px", maxHeight:"calc(100vh - 200px)", overflowY:"auto", scrollbarWidth:"none" }}>
              {loading
                ? Array.from({length:8}).map((_,i) => (
                    <div key={i} style={{ display:"flex", gap:"10px", padding:"8px" }}>
                      <Skeleton width="96px" height="54px" radius="7px" style={{ flexShrink:0 }} />
                      <div style={{ flex:1 }}><Skeleton height="13px" style={{ marginBottom:"6px" }} /><Skeleton height="11px" width="60%" /></div>
                    </div>
                  ))
                : displayVideos.map((v) => (
                    <VideoCard key={v._id} video={v} onClick={setSelected} active={selected?._id === v._id} variant="mini" />
                  ))
              }
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform:rotate(360deg); } }
        @media(max-width:900px) { .yt-layout { grid-template-columns:1fr !important; } }
      `}</style>
    </div>
  );
};

export default YoutubePage;
