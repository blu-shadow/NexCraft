// ═══════════════════════════════════════════════════════════
//                     BLOG PAGE
// ═══════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar          from "../components/common/Navbar";
import Footer          from "../components/common/Footer";
import BlogCard        from "../components/blog/BlogCard";
import { CardSkeleton }from "../components/common/Loader";
import { getAllBlogs, getFeaturedBlogs } from "../services/blogService";
import { BLOG_CATEGORIES } from "../utils/constants";

const SearchIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const GridIcon   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
const ListIcon   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;

const BlogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [blogs,    setBlogs   ] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading,  setLoading ] = useState(true);
  const [total,    setTotal   ] = useState(0);
  const [page,     setPage    ] = useState(1);
  const [layout,   setLayout  ] = useState("grid"); // grid | list
  const [sortBy,   setSortBy  ] = useState("latest");

  const search   = searchParams.get("search")   || "";
  const category = searchParams.get("category") || "";
  const tag      = searchParams.get("tag")      || "";

  const LIMIT = 9;

  useEffect(() => {
    setPage(1);
    setBlogs([]);
    setLoading(true);
    loadBlogs(1);
    getFeaturedBlogs(3).then((r) => setFeatured(r.blogs||[])).catch(() => {});
  }, [search, category, tag, sortBy]);

  const loadBlogs = async (pageNum = 1) => {
    try {
      const params = { page:pageNum, limit:LIMIT, sort:sortBy==="popular"?"popular":"latest" };
      if (search)   params.search   = search;
      if (category) params.category = category;
      if (tag)      params.tag      = tag;
      const res = await getAllBlogs(params);
      setBlogs((prev) => pageNum === 1 ? (res.blogs||[]) : [...prev, ...(res.blogs||[])]);
      setTotal(res.total || 0);
    } catch {}
    setLoading(false);
  };

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    loadBlogs(next);
  };

  const setFilter = (key, val) => {
    const params = new URLSearchParams(searchParams);
    if (val) params.set(key, val); else params.delete(key);
    setSearchParams(params);
  };

  const hasMore = blogs.length < total;

  const isFiltered = search || category || tag;

  return (
    <div style={{ minHeight:"100vh", background:"var(--clr-bg)" }}>
      <Navbar />

      {/* ── Page Header */}
      <div style={{ padding:"80px 20px 0", textAlign:"center", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:"600px", height:"300px", borderRadius:"50%", background:"radial-gradient(circle,rgba(108,99,255,0.08) 0%,transparent 70%)", pointerEvents:"none" }} />
        <span style={{ display:"inline-block", padding:"4px 14px", background:"rgba(108,99,255,0.1)", border:"1px solid rgba(108,99,255,0.2)", borderRadius:"20px", fontSize:"11px", fontFamily:"var(--font-display)", fontWeight:"700", color:"#a78bfa", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"14px" }}>📝 Blog</span>
        <h1 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(2rem,5vw,3.5rem)", fontWeight:"800", color:"var(--clr-text)", letterSpacing:"-1px", marginBottom:"12px" }}>
          Insights & Updates
        </h1>
        <p style={{ fontSize:"15px", color:"var(--clr-text-muted)", maxWidth:"500px", margin:"0 auto 32px", lineHeight:"1.7", fontFamily:"var(--font-body)" }}>
          Tutorials, project updates, tips and tricks from the 1000 Din team.
        </p>
      </div>

      <div style={{ maxWidth:"1200px", margin:"0 auto", padding:"32px 20px 100px" }}>
        {/* ── Featured Posts */}
        {!isFiltered && featured.length > 0 && !loading && (
          <div style={{ marginBottom:"48px" }}>
            <h2 style={{ fontFamily:"var(--font-display)", fontWeight:"800", fontSize:"16px", color:"var(--clr-text)", marginBottom:"16px", display:"flex", alignItems:"center", gap:"8px" }}>
              <span style={{ padding:"3px 10px", background:"rgba(245,158,11,0.15)", border:"1px solid rgba(245,158,11,0.3)", borderRadius:"20px", fontSize:"11px", color:"#fbbf24" }}>⭐ Featured</span>
            </h2>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:"20px" }}>
              {featured.map((b) => <BlogCard key={b._id} blog={b} variant="featured" />)}
            </div>
            <div style={{ borderTop:"1px solid var(--clr-border)", marginTop:"40px" }} />
          </div>
        )}

        {/* ── Filters + Controls Row */}
        <div style={{ display:"flex", gap:"12px", alignItems:"center", marginBottom:"24px", flexWrap:"wrap" }}>
          {/* Search */}
          <div style={{ display:"flex", alignItems:"center", gap:"8px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"10px", padding:"0 14px", height:"40px", minWidth:"200px", flex:1, maxWidth:"320px" }}>
            <span style={{ color:"rgba(255,255,255,0.3)" }}><SearchIcon /></span>
            <input defaultValue={search} onChange={(e) => { clearTimeout(window._blogSearchTimer); window._blogSearchTimer = setTimeout(() => setFilter("search", e.target.value), 400); }} placeholder="Search posts..." style={{ background:"transparent", border:"none", outline:"none", color:"var(--clr-text)", fontSize:"13px", fontFamily:"var(--font-body)", width:"100%" }} />
          </div>

          {/* Category pills */}
          <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
            <button onClick={() => setFilter("category","")} style={filterPill(!category)}>All</button>
            {BLOG_CATEGORIES.map((cat) => (
              <button key={cat.value} onClick={() => setFilter("category", cat.value === category ? "" : cat.value)} style={filterPill(category===cat.value)}>
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>

          <div style={{ marginLeft:"auto", display:"flex", gap:"6px", alignItems:"center" }}>
            {/* Sort */}
            <select value={sortBy} onChange={(e)=>setSortBy(e.target.value)} style={{ padding:"6px 12px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:"8px", color:"var(--clr-text-muted)", fontSize:"12px", fontFamily:"var(--font-display)", cursor:"pointer", outline:"none" }}>
              <option value="latest" style={{ background:"#111124" }}>Latest</option>
              <option value="popular" style={{ background:"#111124" }}>Popular</option>
            </select>

            {/* Layout toggle */}
            <div style={{ display:"flex", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"8px", overflow:"hidden" }}>
              {["grid","list"].map((l) => (
                <button key={l} onClick={() => setLayout(l)} style={{ padding:"7px 10px", background:layout===l?"rgba(108,99,255,0.2)":"transparent", border:"none", cursor:"pointer", color:layout===l?"#a78bfa":"rgba(255,255,255,0.4)", display:"flex", alignItems:"center", transition:"all 0.2s" }}>
                  {l === "grid" ? <GridIcon /> : <ListIcon />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active filter badge */}
        {isFiltered && (
          <div style={{ display:"flex", gap:"8px", alignItems:"center", marginBottom:"20px" }}>
            <span style={{ fontSize:"12px", color:"var(--clr-text-muted)" }}>Filters:</span>
            {search   && <FilterBadge label={`"${search}"`}   onRemove={() => setFilter("search","")}   />}
            {category && <FilterBadge label={category}         onRemove={() => setFilter("category","")} />}
            {tag      && <FilterBadge label={`#${tag}`}        onRemove={() => setFilter("tag","")}      />}
            <span style={{ fontSize:"12px", color:"var(--clr-text-muted)" }}>— {total} result{total !== 1?"s":""}</span>
          </div>
        )}

        {/* ── Blog Grid */}
        {loading && blogs.length === 0 ? (
          <div style={{ display:"grid", gridTemplateColumns: layout==="grid" ? "repeat(auto-fill,minmax(300px,1fr))" : "1fr", gap:"20px" }}>
            {Array.from({length:6}).map((_,i) => <CardSkeleton key={i} />)}
          </div>
        ) : blogs.length === 0 ? (
          <div style={{ textAlign:"center", padding:"80px 20px" }}>
            <div style={{ fontSize:"56px", marginBottom:"16px" }}>📭</div>
            <h3 style={{ fontFamily:"var(--font-display)", fontWeight:"700", fontSize:"18px", color:"var(--clr-text)", marginBottom:"8px" }}>No posts found</h3>
            <p style={{ color:"var(--clr-text-muted)", fontSize:"14px" }}>
              {isFiltered ? "Try different filters" : "No blog posts yet. Check back soon!"}
            </p>
          </div>
        ) : (
          <>
            <div style={{ display:"grid", gridTemplateColumns: layout==="grid" ? "repeat(auto-fill,minmax(300px,1fr))" : "1fr", gap:"20px" }}>
              {blogs.map((blog) => (
                <BlogCard key={blog._id} blog={blog} variant={layout === "list" ? "horizontal" : "default"} />
              ))}
            </div>

            {hasMore && (
              <div style={{ textAlign:"center", marginTop:"36px" }}>
                <button onClick={handleLoadMore} style={{ padding:"11px 32px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"20px", color:"var(--clr-text-muted)", fontSize:"13px", cursor:"pointer", fontFamily:"var(--font-display)", fontWeight:"600", transition:"all 0.2s" }}
                  onMouseEnter={(e)=>{e.currentTarget.style.background="rgba(255,255,255,0.09)";e.currentTarget.style.color="var(--clr-text)";}}
                  onMouseLeave={(e)=>{e.currentTarget.style.background="rgba(255,255,255,0.05)";e.currentTarget.style.color="var(--clr-text-muted)";}}>
                  Load More Posts
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

const filterPill = (active) => ({
  padding:"5px 12px", borderRadius:"20px", border:"1px solid", fontSize:"11.5px",
  fontFamily:"var(--font-display)", fontWeight:"600", cursor:"pointer", transition:"all 0.2s",
  background: active ? "rgba(108,99,255,0.15)" : "rgba(255,255,255,0.04)",
  borderColor: active ? "rgba(108,99,255,0.35)" : "rgba(255,255,255,0.08)",
  color: active ? "#a78bfa" : "var(--clr-text-muted)",
});

const FilterBadge = ({ label, onRemove }) => (
  <span style={{ display:"inline-flex", alignItems:"center", gap:"6px", padding:"3px 10px", background:"rgba(108,99,255,0.12)", border:"1px solid rgba(108,99,255,0.25)", borderRadius:"20px", fontSize:"11px", color:"#a78bfa", fontFamily:"var(--font-display)", fontWeight:"600" }}>
    {label}
    <button onClick={onRemove} style={{ background:"none", border:"none", cursor:"pointer", color:"#a78bfa", lineHeight:1, fontSize:"14px", padding:0 }}>×</button>
  </span>
);

export default BlogPage;
