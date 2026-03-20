// ═══════════════════════════════════════════════════════════
//                    ADMIN LOGIN PAGE
// ═══════════════════════════════════════════════════════════
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const EyeIcon     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const EyeOffIcon  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const LockIcon    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const MailIcon    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;

const AdminLogin = () => {
  const navigate             = useNavigate();
  const { adminLogin, error } = useAuth();

  const [form,       setForm      ] = useState({ email: "", password: "" });
  const [showPass,   setShowPass  ] = useState(false);
  const [loading,    setLoading   ] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    if (!form.email || !form.password) {
      return setLocalError("Email and password are required");
    }

    setLoading(true);
    const res = await adminLogin(form.email, form.password);
    if (!res?.success) {
      setLocalError(res?.message || error || "Login failed");
    }
    setLoading(false);
  };

  const displayError = localError || error;

  return (
    <div style={{
      minHeight      : "100vh",
      background     : "#0a0a18",
      display        : "flex",
      alignItems     : "center",
      justifyContent : "center",
      padding        : "20px",
      position       : "relative",
      overflow       : "hidden",
    }}>
      {/* Background glows */}
      <div style={{ position:"absolute", top:"-10%", left:"-10%", width:"500px", height:"500px", borderRadius:"50%", background:"radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)", pointerEvents:"none" }} />
      <div style={{ position:"absolute", bottom:"-10%", right:"-5%", width:"400px", height:"400px", borderRadius:"50%", background:"radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)", pointerEvents:"none" }} />

      {/* Grid pattern */}
      <div style={{
        position  : "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
        backgroundSize : "40px 40px",
      }} />

      <div style={{
        width        : "100%",
        maxWidth     : "420px",
        background   : "rgba(16,16,32,0.9)",
        backdropFilter: "blur(24px)",
        border       : "1px solid rgba(255,255,255,0.08)",
        borderRadius : "24px",
        padding      : "40px",
        boxShadow    : "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(108,99,255,0.1)",
        position     : "relative",
        animation    : "modalIn 0.4s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:"32px" }}>
          <div style={{
            width         : "64px", height:"64px",
            background    : "linear-gradient(135deg,#6c63ff,#f59e0b)",
            borderRadius  : "18px",
            display       : "flex",
            alignItems    : "center",
            justifyContent: "center",
            fontSize      : "28px",
            fontWeight    : "800",
            color         : "#fff",
            margin        : "0 auto 16px",
            fontFamily    : "var(--font-display)",
            boxShadow     : "0 8px 32px rgba(108,99,255,0.4)",
          }}>
            1K
          </div>
          <h1 style={{ fontFamily:"var(--font-display)", fontSize:"22px", fontWeight:"800", color:"#e8e8f0", marginBottom:"6px" }}>
            Admin Portal
          </h1>
          <p style={{ fontSize:"13px", color:"rgba(255,255,255,0.35)", fontFamily:"var(--font-body)" }}>
            Sign in to manage 1000 Din
          </p>
        </div>

        {/* Error */}
        {displayError && (
          <div style={{
            background  : "rgba(239,68,68,0.1)",
            border      : "1px solid rgba(239,68,68,0.25)",
            borderRadius: "10px",
            padding     : "10px 14px",
            marginBottom: "20px",
            fontSize    : "13px",
            color       : "#f87171",
            fontFamily  : "var(--font-body)",
            display     : "flex",
            alignItems  : "center",
            gap         : "8px",
          }}>
            ⚠️ {displayError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
          {/* Email */}
          <div>
            <label style={labelStyle}>Admin Email</label>
            <div style={inputWrap(false)}>
              <span style={iconWrap}><MailIcon /></span>
              <input
                type="email"
                placeholder="admin@1000din.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={inputStyle}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={labelStyle}>Password</label>
            <div style={inputWrap(false)}>
              <span style={iconWrap}><LockIcon /></span>
              <input
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                style={inputStyle}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.3)", padding:"0 4px", display:"flex" }}
              >
                {showPass ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width         : "100%",
              padding       : "13px",
              background    : loading ? "rgba(108,99,255,0.4)" : "linear-gradient(135deg,#6c63ff,#4f46e5)",
              border        : "none",
              borderRadius  : "12px",
              color         : "#fff",
              fontSize      : "14px",
              fontWeight    : "700",
              fontFamily    : "var(--font-display)",
              cursor        : loading ? "not-allowed" : "pointer",
              display       : "flex",
              alignItems    : "center",
              justifyContent: "center",
              gap           : "8px",
              marginTop     : "8px",
              boxShadow     : loading ? "none" : "0 4px 20px rgba(108,99,255,0.4)",
              transition    : "all 0.2s",
              letterSpacing : "0.02em",
            }}
          >
            {loading && <span className="spinner spinner-sm" />}
            {loading ? "Signing in..." : "Sign In to Admin Panel"}
          </button>
        </form>

        {/* Back to site */}
        <p style={{ textAlign:"center", marginTop:"24px", fontSize:"12px", color:"rgba(255,255,255,0.25)", fontFamily:"var(--font-body)" }}>
          <a href="/" style={{ color:"rgba(108,99,255,0.6)", textDecoration:"none" }}>
            ← Back to website
          </a>
        </p>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity:0; transform:translateY(20px) scale(0.97); }
          to   { opacity:1; transform:translateY(0)    scale(1);    }
        }
      `}</style>
    </div>
  );
};

const labelStyle = { fontSize:"11px", fontWeight:"600", color:"rgba(255,255,255,0.4)", fontFamily:"var(--font-display)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:"6px", display:"block" };
const inputWrap  = () => ({ display:"flex", alignItems:"center", gap:"10px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"10px", padding:"0 14px", height:"44px", transition:"border-color 0.2s" });
const iconWrap   = { color:"rgba(255,255,255,0.3)", display:"flex", flexShrink:0 };
const inputStyle = { flex:1, background:"transparent", border:"none", outline:"none", color:"#e8e8f0", fontSize:"14px", fontFamily:"var(--font-body)" };

export default AdminLogin;
