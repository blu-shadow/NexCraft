// ═══════════════════════════════════════════════════════════
//                   REGISTER PAGE
// ═══════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { Link, useNavigate }   from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { REGEX } from "../utils/constants";

const EyeIcon    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const EyeOffIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const UserIcon   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const MailIcon   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const PhoneIcon  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const LockIcon   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const CheckIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;

const getStrength = (pw) => {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8)             s++;
  if (/[A-Z]/.test(pw))          s++;
  if (/[0-9]/.test(pw))          s++;
  if (/[^A-Za-z0-9]/.test(pw))   s++;
  return s;
};
const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
const strengthColor = ["", "#ef4444", "#f59e0b", "#3b82f6", "#10b981"];

const RegisterPage = () => {
  const navigate                   = useNavigate();
  const { register, isLoggedIn, error, setError } = useAuth();

  const [form, setForm] = useState({ name:"", email:"", phone:"", password:"", confirmPassword:"" });
  const [showPass, setShowPass]     = useState(false);
  const [showConf, setShowConf]     = useState(false);
  const [focused,  setFocused ]     = useState("");
  const [loading,  setLoading ]     = useState(false);
  const [errors,   setErrors  ]     = useState({});
  const [agreed,   setAgreed  ]     = useState(false);

  useEffect(() => { if (isLoggedIn) navigate("/"); }, [isLoggedIn]);
  useEffect(() => { setError?.(""); }, []);

  const strength = getStrength(form.password);

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.length < 2)     e.name     = "Name must be at least 2 characters";
    if (!REGEX.EMAIL.test(form.email))                  e.email    = "Enter a valid email address";
    if (form.phone && !REGEX.PHONE.test(form.phone))   e.phone    = "Enter a valid BD phone number";
    if (form.password.length < 6)                       e.password = "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword)         e.confirmPassword = "Passwords do not match";
    if (!agreed)                                        e.agreed   = "Please agree to the terms";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const res = await register({ name:form.name, email:form.email, phone:form.phone, password:form.password });
    if (!res?.success) setErrors({ submit: res?.message || error || "Registration failed" });
    setLoading(false);
  };

  const FIELDS = [
    { key:"name",    label:"Full Name *",    icon:<UserIcon  />, type:"text",     placeholder:"Your full name",    autoComplete:"name" },
    { key:"email",   label:"Email Address *",icon:<MailIcon  />, type:"email",    placeholder:"your@email.com",    autoComplete:"email" },
    { key:"phone",   label:"Phone (optional)",icon:<PhoneIcon/>, type:"tel",     placeholder:"01XXXXXXXXX",       autoComplete:"tel" },
  ];

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--clr-bg)", padding:"20px", position:"relative", overflow:"hidden" }}>
      {/* Background */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
        <div style={{ position:"absolute", top:"-5%", right:"-5%", width:"500px", height:"500px", borderRadius:"50%", background:"radial-gradient(circle,rgba(108,99,255,0.1) 0%,transparent 65%)" }} />
        <div style={{ position:"absolute", bottom:"-10%", left:"-5%", width:"400px", height:"400px", borderRadius:"50%", background:"radial-gradient(circle,rgba(16,185,129,0.06) 0%,transparent 65%)" }} />
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px)", backgroundSize:"40px 40px" }} />
      </div>

      <div style={{ width:"100%", maxWidth:"420px", position:"relative", animation:"modalIn 0.5s cubic-bezier(0.34,1.3,0.64,1)" }}>
        <div style={{ background:"rgba(16,16,32,0.92)", backdropFilter:"blur(24px)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"28px", padding:"40px 36px", boxShadow:"0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(108,99,255,0.08)" }}>
          {/* Header */}
          <div style={{ textAlign:"center", marginBottom:"28px" }}>
            <div style={{ width:"60px", height:"60px", background:"linear-gradient(135deg,#6c63ff,#f59e0b)", borderRadius:"16px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"26px", fontWeight:"800", color:"#fff", margin:"0 auto 14px", fontFamily:"var(--font-display)", boxShadow:"0 8px 28px rgba(108,99,255,0.4)" }}>1K</div>
            <h1 style={{ fontFamily:"var(--font-display)", fontSize:"22px", fontWeight:"800", color:"#e8e8f0", marginBottom:"5px" }}>Create account</h1>
            <p style={{ fontSize:"13px", color:"rgba(255,255,255,0.35)", fontFamily:"var(--font-body)" }}>Join 1000 Din today</p>
          </div>

          {/* Submit error */}
          {errors.submit && (
            <div style={{ padding:"10px 14px", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:"10px", marginBottom:"16px", fontSize:"13px", color:"#f87171", animation:"shake 0.4s ease" }}>
              ⚠️ {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
            {/* Text fields */}
            {FIELDS.map((f) => (
              <div key={f.key}>
                <label style={lbl}>{f.label}</label>
                <div style={inputWrap(focused===f.key, !!errors[f.key])}>
                  <span style={iconWrap}>{f.icon}</span>
                  <input type={f.type} value={form[f.key]} onChange={(e)=>setForm({...form,[f.key]:e.target.value})} onFocus={()=>setFocused(f.key)} onBlur={()=>setFocused("")} placeholder={f.placeholder} style={inp} autoComplete={f.autoComplete} />
                  {form[f.key] && !errors[f.key] && f.key !== "phone" && (
                    <span style={{ color:"#10b981", flexShrink:0 }}><CheckIcon /></span>
                  )}
                </div>
                {errors[f.key] && <p style={errTxt}>{errors[f.key]}</p>}
              </div>
            ))}

            {/* Password */}
            <div>
              <label style={lbl}>Password *</label>
              <div style={inputWrap(focused==="password", !!errors.password)}>
                <span style={iconWrap}><LockIcon /></span>
                <input type={showPass?"text":"password"} value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})} onFocus={()=>setFocused("password")} onBlur={()=>setFocused("")} placeholder="Min 6 characters" style={inp} autoComplete="new-password" />
                <button type="button" onClick={()=>setShowPass(!showPass)} style={{ background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,0.3)",padding:"0 4px",display:"flex",flexShrink:0 }}>
                  {showPass ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {/* Strength bar */}
              {form.password && (
                <div style={{ marginTop:"6px" }}>
                  <div style={{ display:"flex", gap:"3px", marginBottom:"3px" }}>
                    {[1,2,3,4].map((i) => (
                      <div key={i} style={{ flex:1, height:"3px", borderRadius:"2px", background:i<=strength?strengthColor[strength]:"rgba(255,255,255,0.08)", transition:"background 0.3s" }} />
                    ))}
                  </div>
                  <p style={{ fontSize:"10.5px", color:strengthColor[strength], fontFamily:"var(--font-display)", fontWeight:"600" }}>
                    {strengthLabel[strength]} password
                  </p>
                </div>
              )}
              {errors.password && <p style={errTxt}>{errors.password}</p>}
            </div>

            {/* Confirm password */}
            <div>
              <label style={lbl}>Confirm Password *</label>
              <div style={inputWrap(focused==="conf", !!errors.confirmPassword)}>
                <span style={iconWrap}><LockIcon /></span>
                <input type={showConf?"text":"password"} value={form.confirmPassword} onChange={(e)=>setForm({...form,confirmPassword:e.target.value})} onFocus={()=>setFocused("conf")} onBlur={()=>setFocused("")} placeholder="Repeat password" style={inp} autoComplete="new-password" />
                {form.confirmPassword && form.confirmPassword === form.password && (
                  <span style={{ color:"#10b981", flexShrink:0 }}><CheckIcon /></span>
                )}
                <button type="button" onClick={()=>setShowConf(!showConf)} style={{ background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,0.3)",padding:"0 4px",display:"flex",flexShrink:0 }}>
                  {showConf ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.confirmPassword && <p style={errTxt}>{errors.confirmPassword}</p>}
            </div>

            {/* Agree to terms */}
            <label style={{ display:"flex", alignItems:"flex-start", gap:"10px", cursor:"pointer", marginTop:"4px" }}>
              <div onClick={() => setAgreed(!agreed)}
                style={{ width:"18px", height:"18px", borderRadius:"5px", border:`1.5px solid ${agreed?"#6c63ff":"rgba(255,255,255,0.2)"}`, background:agreed?"rgba(108,99,255,0.2)":"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:"1px", transition:"all 0.2s" }}>
                {agreed && <span style={{ color:"#a78bfa" }}><CheckIcon /></span>}
              </div>
              <span style={{ fontSize:"12px", color:"rgba(255,255,255,0.45)", lineHeight:"1.5", fontFamily:"var(--font-body)" }}>
                I agree to the{" "}
                <Link to="/settings?tab=privacy" style={{ color:"#a78bfa", textDecoration:"none" }}>Privacy Policy</Link>
                {" "}and terms of service
              </span>
            </label>
            {errors.agreed && <p style={{ ...errTxt, marginTop:"-8px" }}>{errors.agreed}</p>}

            {/* Submit */}
            <button type="submit" disabled={loading}
              style={{ width:"100%", padding:"13px", marginTop:"8px", background:loading?"rgba(108,99,255,0.4)":"linear-gradient(135deg,#6c63ff,#4f46e5)", border:"none", borderRadius:"14px", color:"#fff", fontSize:"14px", fontFamily:"var(--font-display)", fontWeight:"700", cursor:loading?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", boxShadow:loading?"none":"0 6px 24px rgba(108,99,255,0.4)", transition:"all 0.3s", letterSpacing:"0.02em" }}
              onMouseEnter={(e)=>{ if(!loading){e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 10px 30px rgba(108,99,255,0.55)";} }}
              onMouseLeave={(e)=>{ e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 6px 24px rgba(108,99,255,0.4)"; }}>
              {loading && <span style={{ width:"16px",height:"16px",border:"2px solid rgba(255,255,255,0.3)",borderTop:"2px solid #fff",borderRadius:"50%",animation:"spin 0.6s linear infinite" }} />}
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div style={{ display:"flex", alignItems:"center", gap:"12px", margin:"22px 0" }}>
            <div style={{ flex:1, height:"1px", background:"rgba(255,255,255,0.07)" }} />
            <span style={{ fontSize:"11px", color:"rgba(255,255,255,0.25)" }}>OR</span>
            <div style={{ flex:1, height:"1px", background:"rgba(255,255,255,0.07)" }} />
          </div>

          <p style={{ textAlign:"center", fontSize:"13px", color:"rgba(255,255,255,0.4)", fontFamily:"var(--font-body)" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color:"#a78bfa", fontWeight:"700", textDecoration:"none", fontFamily:"var(--font-display)" }}>Sign in</Link>
          </p>
        </div>

        <p style={{ textAlign:"center", marginTop:"18px", fontSize:"12px" }}>
          <Link to="/" style={{ color:"rgba(255,255,255,0.25)", textDecoration:"none", fontFamily:"var(--font-body)" }}>← Back to website</Link>
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

const lbl       = { fontSize:"11px", fontWeight:"600", color:"rgba(255,255,255,0.4)", fontFamily:"var(--font-display)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:"6px", display:"block" };
const inputWrap = (focused, hasErr) => ({ display:"flex", alignItems:"center", gap:"10px", background:"rgba(255,255,255,0.05)", border:`1.5px solid ${hasErr?"rgba(239,68,68,0.4)":focused?"rgba(108,99,255,0.5)":"rgba(255,255,255,0.08)"}`, borderRadius:"12px", padding:"0 14px", height:"44px", transition:"border-color 0.2s", boxShadow:focused&&!hasErr?"0 0 0 3px rgba(108,99,255,0.12)":"none" });
const iconWrap  = { color:"rgba(255,255,255,0.3)", display:"flex", flexShrink:0 };
const inp       = { flex:1, background:"transparent", border:"none", outline:"none", color:"#e8e8f0", fontSize:"13.5px", fontFamily:"var(--font-body)" };
const errTxt    = { fontSize:"11.5px", color:"#f87171", marginTop:"4px", fontFamily:"var(--font-body)" };

export default RegisterPage;
