// ═══════════════════════════════════════════════════════════
//                  EDIT PROFILE FORM
// ═══════════════════════════════════════════════════════════
import { useState } from "react";
import useAuth      from "../../hooks/useAuth";
import { updateMyProfile, updatePassword } from "../../services/authService";
import { REGEX } from "../../utils/constants";

const EyeIcon    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const EyeOffIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;

const TABS = ["Profile", "Password"];

const EditProfileForm = ({ onClose }) => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("Profile");
  const [toast,     setToast    ] = useState(null);

  const showToast = (msg, type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  return (
    <div style={{ background:"var(--clr-surface)", border:"1px solid var(--clr-border)", borderRadius:"20px", overflow:"hidden" }}>
      {toast && (
        <div style={{ position:"fixed", bottom:"80px", right:"16px", zIndex:200, padding:"10px 18px", background:toast.type==="error"?"rgba(239,68,68,0.15)":"rgba(16,185,129,0.15)", border:`1px solid ${toast.type==="error"?"rgba(239,68,68,0.3)":"rgba(16,185,129,0.3)"}`, borderRadius:"12px", color:toast.type==="error"?"#f87171":"#34d399", fontSize:"13px", fontFamily:"var(--font-display)", fontWeight:"600", boxShadow:"0 8px 32px rgba(0,0,0,0.3)", backdropFilter:"blur(10px)", animation:"slideUp 0.3s ease" }}>
          {toast.type==="error"?"❌":"✅"} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ padding:"18px 20px", borderBottom:"1px solid var(--clr-border)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <h3 style={{ fontFamily:"var(--font-display)", fontWeight:"800", fontSize:"15px", color:"var(--clr-text)" }}>Edit Profile</h3>
        {onClose && (
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"8px", width:"30px", height:"30px", cursor:"pointer", color:"var(--clr-text-muted)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px" }}>×</button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", borderBottom:"1px solid var(--clr-border)" }}>
        {TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ flex:1, padding:"11px", background:"transparent", border:"none", cursor:"pointer", fontSize:"13px", fontFamily:"var(--font-display)", fontWeight:activeTab===tab?"700":"500", color:activeTab===tab?"var(--clr-text)":"var(--clr-text-muted)", borderBottom:`2px solid ${activeTab===tab?"#6c63ff":"transparent"}`, transition:"all 0.2s" }}>
            {tab}
          </button>
        ))}
      </div>

      <div style={{ padding:"20px" }}>
        {activeTab === "Profile" ? (
          <ProfileInfoForm user={user} updateUser={updateUser} showToast={showToast} />
        ) : (
          <PasswordForm showToast={showToast} />
        )}
      </div>

      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
};

// ── Profile Info Form
const ProfileInfoForm = ({ user, updateUser, showToast }) => {
  const [form, setForm] = useState({ name:user?.name||"", phone:user?.phone||"", bio:user?.bio||"" });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (form.phone && !REGEX.PHONE.test(form.phone)) e.phone = "Enter a valid BD phone number";
    if (form.bio.length > 200) e.bio = "Bio cannot exceed 200 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const res = await updateMyProfile(form);
      updateUser(res.user);
      showToast("Profile updated successfully!");
    } catch (err) { showToast(err.response?.data?.message || "Update failed","error"); }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
      <div>
        <label style={lbl}>Full Name *</label>
        <input value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} style={{ ...inp, borderColor:errors.name?"rgba(239,68,68,0.4)":"rgba(255,255,255,0.09)" }} placeholder="Your name" />
        {errors.name && <p style={err}>{errors.name}</p>}
      </div>

      <div>
        <label style={lbl}>Phone (BD)</label>
        <input value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})} style={{ ...inp, borderColor:errors.phone?"rgba(239,68,68,0.4)":"rgba(255,255,255,0.09)" }} placeholder="01XXXXXXXXX" type="tel" />
        {errors.phone && <p style={err}>{errors.phone}</p>}
      </div>

      <div>
        <label style={lbl}>Bio <span style={{ color:"var(--clr-text-muted)", fontWeight:"400" }}>(max 200 chars)</span></label>
        <textarea value={form.bio} onChange={(e)=>setForm({...form,bio:e.target.value})} style={{ ...inp, minHeight:"80px", resize:"vertical", borderColor:errors.bio?"rgba(239,68,68,0.4)":"rgba(255,255,255,0.09)" }} placeholder="Tell something about yourself..." maxLength={200} />
        <p style={{ fontSize:"11px", color:form.bio.length>190?"#ef4444":"var(--clr-text-muted)", textAlign:"right", marginTop:"3px" }}>{form.bio.length}/200</p>
        {errors.bio && <p style={err}>{errors.bio}</p>}
      </div>

      <button type="submit" disabled={saving} style={{ padding:"11px", background:"linear-gradient(135deg,#6c63ff,#4f46e5)", border:"none", borderRadius:"10px", color:"#fff", fontSize:"13px", fontFamily:"var(--font-display)", fontWeight:"700", cursor:saving?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", boxShadow:"0 4px 20px rgba(108,99,255,0.3)", marginTop:"4px" }}>
        {saving && <span style={{ width:"14px", height:"14px", border:"2px solid rgba(255,255,255,0.3)", borderTop:"2px solid #fff", borderRadius:"50%", animation:"spin 0.6s linear infinite" }} />}
        {saving ? "Saving..." : "Save Changes"}
      </button>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </form>
  );
};

// ── Password Form
const PasswordForm = ({ showToast }) => {
  const [form, setForm] = useState({ currentPassword:"", newPassword:"", confirmPassword:"" });
  const [show, setShow] = useState({ curr:false, new:false, conf:false });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.currentPassword) e.currentPassword = "Current password required";
    if (form.newPassword.length < 6) e.newPassword = "New password must be at least 6 characters";
    if (form.newPassword !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await updatePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      showToast("Password changed successfully!");
      setForm({ currentPassword:"", newPassword:"", confirmPassword:"" });
    } catch (err) { showToast(err.response?.data?.message || "Failed to change password","error"); }
    setSaving(false);
  };

  const PasswordField = ({ label, field, showKey, placeholder }) => (
    <div>
      <label style={lbl}>{label}</label>
      <div style={{ position:"relative" }}>
        <input
          type={show[showKey] ? "text" : "password"}
          value={form[field]}
          onChange={(e) => setForm({...form,[field]:e.target.value})}
          placeholder={placeholder}
          style={{ ...inp, paddingRight:"42px", borderColor:errors[field]?"rgba(239,68,68,0.4)":"rgba(255,255,255,0.09)" }}
        />
        <button type="button" onClick={() => setShow({...show,[showKey]:!show[showKey]})}
          style={{ position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"var(--clr-text-muted)", display:"flex" }}>
          {show[showKey] ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {errors[field] && <p style={err}>{errors[field]}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
      <PasswordField label="Current Password *" field="currentPassword" showKey="curr" placeholder="Enter current password" />
      <PasswordField label="New Password *" field="newPassword" showKey="new" placeholder="Min 6 characters" />
      <PasswordField label="Confirm New Password *" field="confirmPassword" showKey="conf" placeholder="Repeat new password" />

      {/* Password strength */}
      {form.newPassword && (
        <div>
          <div style={{ display:"flex", gap:"4px" }}>
            {[1,2,3,4].map((i) => {
              const strength = form.newPassword.length >= 12 ? 4 : form.newPassword.length >= 8 ? 3 : form.newPassword.length >= 6 ? 2 : 1;
              return <div key={i} style={{ flex:1, height:"3px", borderRadius:"2px", background: i <= strength ? (strength >= 4 ? "#10b981" : strength >= 3 ? "#f59e0b" : "#ef4444") : "rgba(255,255,255,0.08)", transition:"background 0.3s" }} />;
            })}
          </div>
          <p style={{ fontSize:"11px", color:"var(--clr-text-muted)", marginTop:"4px" }}>
            {form.newPassword.length >= 12 ? "Strong" : form.newPassword.length >= 8 ? "Good" : "Weak"} password
          </p>
        </div>
      )}

      <button type="submit" disabled={saving} style={{ padding:"11px", background:"linear-gradient(135deg,#6c63ff,#4f46e5)", border:"none", borderRadius:"10px", color:"#fff", fontSize:"13px", fontFamily:"var(--font-display)", fontWeight:"700", cursor:saving?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", boxShadow:"0 4px 20px rgba(108,99,255,0.3)", marginTop:"4px" }}>
        {saving && <span style={{ width:"14px", height:"14px", border:"2px solid rgba(255,255,255,0.3)", borderTop:"2px solid #fff", borderRadius:"50%", animation:"spin 0.6s linear infinite" }} />}
        {saving ? "Updating..." : "Change Password"}
      </button>
    </form>
  );
};

const lbl = { fontSize:"11px", fontWeight:"600", color:"var(--clr-text-muted)", fontFamily:"var(--font-display)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:"6px", display:"block" };
const inp = { width:"100%", padding:"10px 14px", background:"rgba(255,255,255,0.05)", border:"1.5px solid rgba(255,255,255,0.09)", borderRadius:"10px", color:"var(--clr-text)", fontSize:"13.5px", fontFamily:"var(--font-body)", outline:"none", boxSizing:"border-box", transition:"border-color 0.2s" };
const err = { fontSize:"11.5px", color:"#f87171", marginTop:"4px", fontFamily:"var(--font-body)" };

export default EditProfileForm;
