// ═══════════════════════════════════════════════════════════
//                    PROFILE CARD
// ═══════════════════════════════════════════════════════════
import { useState, useRef } from "react";
import useAuth  from "../../hooks/useAuth";
import { uploadAvatar, deleteAvatar } from "../../services/authService";
import { formatDate, getInitials }    from "../../utils/formatDate";

const EditIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const CameraIcon  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;
const TrashIcon   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const MailIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const PhoneIcon   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const CalIcon     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;

const ProfileCard = ({ onEditClick }) => {
  const { user, updateUser } = useAuth();
  const fileRef    = useRef();
  const [uploading, setUploading] = useState(false);
  const [toast,     setToast    ] = useState(null);
  const [avatarMenu,setAvatarMenu]=useState(false);

  const showToast = (msg, type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setAvatarMenu(false);
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      const res = await uploadAvatar(fd);
      updateUser({ avatar: res.avatar });
      showToast("Profile picture updated!");
    } catch { showToast("Upload failed", "error"); }
    setUploading(false);
  };

  const handleDeleteAvatar = async () => {
    setAvatarMenu(false);
    try {
      await deleteAvatar();
      updateUser({ avatar: { url:"", publicId:"" } });
      showToast("Profile picture removed");
    } catch { showToast("Failed to remove", "error"); }
  };

  if (!user) return null;

  const initials = getInitials(user.name || "U");

  return (
    <div style={{
      background  : "var(--clr-surface)",
      border      : "1px solid var(--clr-border)",
      borderRadius: "24px",
      overflow    : "hidden",
      position    : "relative",
    }}>
      {/* Toast */}
      {toast && (
        <div style={{ position:"absolute", top:"12px", right:"12px", zIndex:10, padding:"8px 16px", background:toast.type==="error"?"rgba(239,68,68,0.15)":"rgba(16,185,129,0.15)", border:`1px solid ${toast.type==="error"?"rgba(239,68,68,0.3)":"rgba(16,185,129,0.3)"}`, borderRadius:"10px", color:toast.type==="error"?"#f87171":"#34d399", fontSize:"12px", fontFamily:"var(--font-display)", fontWeight:"600" }}>
          {toast.type==="error"?"❌":"✅"} {toast.msg}
        </div>
      )}

      {/* ── Banner */}
      <div style={{ height:"90px", background:"linear-gradient(135deg,rgba(108,99,255,0.3),rgba(167,139,250,0.2),rgba(245,158,11,0.15))", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(circle at 20% 50%,rgba(108,99,255,0.15) 0%,transparent 50%),radial-gradient(circle at 80% 50%,rgba(245,158,11,0.1) 0%,transparent 50%)" }} />
      </div>

      {/* ── Avatar */}
      <div style={{ padding:"0 20px 20px" }}>
        <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginTop:"-40px", marginBottom:"16px" }}>
          {/* Avatar + upload */}
          <div style={{ position:"relative" }}>
            <div style={{
              width         : "80px", height:"80px",
              borderRadius  : "50%",
              border        : "4px solid var(--clr-bg)",
              background    : "linear-gradient(135deg,#6c63ff,#a78bfa)",
              display       : "flex", alignItems:"center", justifyContent:"center",
              fontSize      : "26px", fontWeight:"800", color:"#fff",
              fontFamily    : "var(--font-display)",
              overflow      : "hidden",
              boxShadow     : "0 8px 24px rgba(0,0,0,0.3)",
              cursor        : "pointer",
              position      : "relative",
            }}
              onClick={() => setAvatarMenu(!avatarMenu)}
            >
              {uploading ? (
                <div style={{ width:"24px", height:"24px", border:"3px solid rgba(255,255,255,0.3)", borderTop:"3px solid #fff", borderRadius:"50%", animation:"spin 0.6s linear infinite" }} />
              ) : user.avatar?.url ? (
                <img src={user.avatar.url} alt={user.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
              ) : initials}

              {/* Camera overlay */}
              <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", opacity:0, transition:"opacity 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.opacity=1}
                onMouseLeave={(e) => e.currentTarget.style.opacity=0}
              >
                <CameraIcon />
              </div>
            </div>

            {/* Avatar menu */}
            {avatarMenu && (
              <>
                <div onClick={() => setAvatarMenu(false)} style={{ position:"fixed", inset:0, zIndex:9 }} />
                <div style={{ position:"absolute", top:"100%", left:0, zIndex:10, marginTop:"6px", background:"#111124", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"12px", overflow:"hidden", boxShadow:"0 16px 40px rgba(0,0,0,0.4)", minWidth:"160px" }}>
                  <button onClick={() => { fileRef.current?.click(); setAvatarMenu(false); }}
                    style={{ display:"flex", alignItems:"center", gap:"8px", width:"100%", padding:"10px 14px", background:"transparent", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.7)", fontSize:"13px", fontFamily:"var(--font-display)", fontWeight:"500", transition:"all 0.15s" }}
                    onMouseEnter={(e)=>{e.currentTarget.style.background="rgba(255,255,255,0.05)";e.currentTarget.style.color="#e8e8f0";}}
                    onMouseLeave={(e)=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="rgba(255,255,255,0.7)";}}>
                    <CameraIcon /> Change Photo
                  </button>
                  {user.avatar?.url && (
                    <button onClick={handleDeleteAvatar}
                      style={{ display:"flex", alignItems:"center", gap:"8px", width:"100%", padding:"10px 14px", background:"transparent", border:"none", cursor:"pointer", color:"rgba(239,68,68,0.7)", fontSize:"13px", fontFamily:"var(--font-display)", fontWeight:"500", transition:"all 0.15s" }}
                      onMouseEnter={(e)=>{e.currentTarget.style.background="rgba(239,68,68,0.08)";e.currentTarget.style.color="#ef4444";}}
                      onMouseLeave={(e)=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="rgba(239,68,68,0.7)";}}>
                      <TrashIcon /> Remove Photo
                    </button>
                  )}
                </div>
              </>
            )}

            <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display:"none" }} />
          </div>

          {/* Edit button */}
          <button onClick={onEditClick} style={{ display:"flex", alignItems:"center", gap:"6px", padding:"7px 16px", background:"rgba(108,99,255,0.1)", border:"1px solid rgba(108,99,255,0.25)", borderRadius:"20px", color:"#a78bfa", fontSize:"12.5px", fontFamily:"var(--font-display)", fontWeight:"600", cursor:"pointer", transition:"all 0.2s" }}
            onMouseEnter={(e)=>{e.currentTarget.style.background="rgba(108,99,255,0.2)";}}
            onMouseLeave={(e)=>{e.currentTarget.style.background="rgba(108,99,255,0.1)";}}>
            <EditIcon /> Edit Profile
          </button>
        </div>

        {/* Name + bio */}
        <div style={{ marginBottom:"16px" }}>
          <h2 style={{ fontFamily:"var(--font-display)", fontWeight:"800", fontSize:"20px", color:"var(--clr-text)", marginBottom:"4px" }}>
            {user.name}
          </h2>
          {user.bio && (
            <p style={{ fontSize:"13.5px", color:"var(--clr-text-muted)", lineHeight:"1.6", fontFamily:"var(--font-body)", maxWidth:"400px" }}>
              {user.bio}
            </p>
          )}
        </div>

        {/* Info items */}
        <div style={{ display:"flex", flexDirection:"column", gap:"8px", padding:"14px", background:"rgba(255,255,255,0.02)", border:"1px solid var(--clr-border)", borderRadius:"12px" }}>
          {[
            { icon:<MailIcon />, value:user.email,    label:"Email"  },
            { icon:<PhoneIcon/>, value:user.phone||"Not set", label:"Phone" },
            { icon:<CalIcon  />, value:`Joined ${formatDate(user.createdAt)}`, label:"Member since" },
          ].map((item, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:"10px" }}>
              <span style={{ color:"var(--clr-text-muted)", flexShrink:0 }}>{item.icon}</span>
              <span style={{ fontSize:"13px", color: item.value === "Not set" ? "var(--clr-text-muted)" : "var(--clr-text)", fontFamily:"var(--font-body)" }}>
                {item.value}
              </span>
            </div>
          ))}
        </div>

        {/* Role badge */}
        <div style={{ marginTop:"12px" }}>
          <span style={{ fontSize:"11px", padding:"3px 10px", background:user.role==="admin"?"rgba(245,158,11,0.12)":"rgba(108,99,255,0.12)", border:`1px solid ${user.role==="admin"?"rgba(245,158,11,0.25)":"rgba(108,99,255,0.25)"}`, borderRadius:"20px", color:user.role==="admin"?"#fbbf24":"#a78bfa", fontFamily:"var(--font-display)", fontWeight:"700", textTransform:"uppercase", letterSpacing:"0.06em" }}>
            {user.role === "admin" ? "⭐ Admin" : "👤 User"}
          </span>
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

export default ProfileCard;
