// ═══════════════════════════════════════════════════════════
//                     LOGIN PAGE
// ═══════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { Link, useNavigate }   from "react-router-dom";
import useAuth from "../hooks/useAuth";

const EyeIcon     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const EyeOffIcon  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const MailIcon    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const LockIcon    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;

const LoginPage = () => {
  const navigate              = useNavigate();
  const { login, isLoggedIn, error, setError } = useAuth();

  const [form,    setForm   ] = useState({ email:"", password:"" });
  const [showPass,setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localErr,setLocalErr] = useState("");
  const [focused, setFocused] = useState("");

  useEffect(() => { if (isLoggedIn) navigate("/"); }, [isLoggedIn]);
  useEffect(() => { setError?.(""); setLocalErr(""); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalErr("");
    if (!form.email || !form.password) return setLocalErr("Please fill all fields");
    setLoading(true);
    const res = await login(form.email, form.password);
    if (!res?.success) setLocalErr(res?.message || error || "Login failed");
    setLoading(false);
  };

  const displayErr = localErr || error;

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--clr-bg)", padding:"20px", position:"relative", overflow:"hidden" }}>
      {/* Background */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
        <div style={{ position:"absolute", top:"-10%", left:"50%", transform:"translateX(-50%)", width:"600px", height:"600px", borderRadius:"50%", background:"radial-gradient(circle,rgba(108,99,255,0.1) 0%,transparent 65%)" }} />
        <div style={{ position:"absolute", bottom:"-5%", right:"-5%", width:"400px", height:"400px", borderRadius:"50%", background:"radial-gradient(circle,rgba(245,158,11,0.06) 0%,transparent 65%)" }} />
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px)", backgroundSize:"40px 40px" }} />
      </div>

      <div style={{ width:"100%", maxWidth:"400px", position:"relative", animation:"modalIn 0.5s cubic-bezier(0.34,1.3,0.64,1)" }}>
        {/* Card */}
        <div style={{ background:"rgba(16,16,32,0.92)", backdropFilter:"blur(24px)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"28px", padding:"40px 36px", boxShadow:"0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(108,99,255,0.1)" }}>
          {/* Logo */}
          <div style={{ textAlign:"center", marginBottom:"32px" }}>
            <div style={{ width:"60px", height:"60px", background:"linear-gradient(135deg,#6c63ff,#f59e0b)", borderRadius:"16px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"26px", fontWeight:"800", color:"#fff", margin:"0 auto 14px", fontFamily:"var(--font-display)", boxShadow:"0 8px 28px rgba(108,99,255,0.4)" }}>1K</div>
            <h1 style={{ fontFamily:"var(--font-display)", fontSize:"22px", fontWeight:"800", color:"#e8e8f0", marginBottom:"5px", letterSpacing:"-0.3px" }}>Welcome back</h1>
            <p style={{ fontSize:"13px", color:"rgba(255,255,255,0.35)", fontFamily:"var(--font-body)" }}>Sign in to your 1000 Din account</p>
          </div>

          {/* Error */}
          {displayErr && (
            <div style={{ padding:"10px 14px", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:"10px", marginBottom:"20px", fontSize:"13px", color:"#f87171", display:"flex", alignItems:"center", gap:"8px", animation:"shake 0.4s ease" }}>
              ⚠️ {displayErr}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
            {/* Email */}
            <div>
              <label style={lbl}>Email Address</label>
              <div style={inputWrap(focused==="email")}>
                <span style={iconWrap}><MailIcon /></span>
                <input type="email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} onFocus={()=>setFocused("email")} onBlur={()=>setFocused("")} placeholder="your@email.com" style={inp} autoComplete="email" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={lbl}>Password</label>
              <div style={inputWrap(focused==="password")}>
                <span style={iconWrap}><LockIcon /></span>
                <input type={showPass?"text":"password"} value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})} onFocus={()=>setFocused("password")} onBlur={()=>setFocused("")} placeholder="••••••••" style={inp} autoComplete="current-password" />
                <button type="button" onClick={()=>setShowPass(!showPass)} style={{ background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,0.3)",padding:"0 4px",display:"flex",flexShrink:0 }}>
                  {showPass ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              <div style={{ textAlign:"right", marginTop:"6px" }}>
                <Link to="/forgot-password" style={{ fontSize:"12px", color:"rgba(108,99,255,0.7)", textDecoration:"none", fontFamily:"var(--font-display)", fontWeight:"500", transition:"color 0.2s" }}
                  onMouseEnter={(e)=>e.currentTarget.style.color="#a78bfa"}
                  onMouseLeave={(e)=>e.currentTarget.style.color="rgba(108,99,255,0.7)"}>
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} style={{ width:"100%", padding:"13px", marginTop:"6px", background:loading?"rgba(108,99,255,0.4)":"linear-gradient(135deg,#6c63ff,#4f46e5)", border:"none", borderRadius:"14px", color:"#fff", fontSize:"14px", fontFamily:"var(--font-display)", fontWeight:"700", cursor:loading?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", boxShadow:loading?"none":"0 6px 24px rgba(108,99,255,0.4)", transition:"all 0.3s", letterSpacing:"0.02em" }}
              onMouseEnter={(e)=>{ if(!loading){e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 10px 30px rgba(108,99,255,0.55)";} }}
              onMouseLeave={(e)=>{ e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 6px 24px rgba(108,99,255,0.4)"; }}>
              {loading && <span style={{ width:"16px",height:"16px",border:"2px solid rgba(255,255,255,0.3)",borderTop:"2px solid #fff",borderRadius:"50%",animation:"spin 0.6s linear infinite" }} />}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display:"flex", alignItems:"center", gap:"12px", margin:"24px 0" }}>
            <div style={{ flex:1, height:"1px", background:"rgba(255,255,255,0.07)" }} />
            <span style={{ fontSize:"11px", color:"rgba(255,255,255,0.25)", fontFamily:"var(--font-body)" }}>OR</span>
            <div style={{ flex:1, height:"1px", background:"rgba(255,255,255,0.07)" }} />
          </div>

          {/* Register link */}
          <p style={{ textAlign:"center", fontSize:"13px", color:"rgba(255,255,255,0.4)", fontFamily:"var(--font-body)" }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color:"#a78bfa", fontWeight:"700", textDecoration:"none", fontFamily:"var(--font-display)", transition:"color 0.2s" }}
              onMouseEnter={(e)=>e.currentTarget.style.color="#c4b5fd"}
              onMouseLeave={(e)=>e.currentTarget.style.color="#a78bfa"}>
              Create one
            </Link>
          </p>
        </div>

        {/* Back to home */}
        <p style={{ textAlign:"center", marginTop:"20px", fontSize:"12px" }}>
          <Link to="/" style={{ color:"rgba(255,255,255,0.25)", textDecoration:"none", fontFamily:"var(--font-body)", transition:"color 0.2s" }}
            onMouseEnter={(e)=>e.currentTarget.style.color="rgba(255,255,255,0.5)"}
            onMouseLeave={(e)=>e.currentTarget.style.color="rgba(255,255,255,0.25)"}>
            ← Back to website
          </Link>
        </p>
      </div>

      <style>{`
        @keyframes modalIn { from{opacity:0;transform:translateY(24px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes shake   { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
      `}</style>
    </div>
  );
};

const lbl     = { fontSize:"11px", fontWeight:"600", color:"rgba(255,255,255,0.4)", fontFamily:"var(--font-display)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:"7px", display:"block" };
const inputWrap = (focused) => ({ display:"flex", alignItems:"center", gap:"10px", background:"rgba(255,255,255,0.05)", border:`1.5px solid ${focused?"rgba(108,99,255,0.5)":"rgba(255,255,255,0.08)"}`, borderRadius:"12px", padding:"0 14px", height:"46px", transition:"border-color 0.2s", boxShadow:focused?"0 0 0 3px rgba(108,99,255,0.12)":"none" });
const iconWrap= { color:"rgba(255,255,255,0.3)", display:"flex", flexShrink:0 };
const inp     = { flex:1, background:"transparent", border:"none", outline:"none", color:"#e8e8f0", fontSize:"14px", fontFamily:"var(--font-body)" };

export default LoginPage;
