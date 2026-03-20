// ═══════════════════════════════════════════════════════════
//                  MANAGE USERS PAGE
// ═══════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import DataTable from "../components/DataTable";
import { getAllUsers, toggleUserStatus, deleteUser } from "../../services/adminService";
import { Toast } from "./ManageVideos";
import { timeAgo, getInitials, formatDate } from "../../utils/formatDate";

const ManageUsers = () => {
  const [users,   setUsers  ] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast,   setToast  ] = useState(null);

  const showToast = (msg, type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  const load = async () => {
    setLoading(true);
    try { const r = await getAllUsers({ limit:200 }); setUsers(r.users||[]); } catch { setUsers([]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleToggle = async (row) => {
    try { await toggleUserStatus(row._id); showToast(`User ${row.isActive?"blocked":"activated"}`); load(); } catch { showToast("Failed","error"); }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete account of ${row.name}?`)) return;
    try { await deleteUser(row._id); showToast("User deleted"); load(); } catch { showToast("Delete failed","error"); }
  };

  const columns = [
    { key:"avatar", label:"", width:"50px", sortable:false, render:(v,row) => (
        <div style={{ width:"36px", height:"36px", borderRadius:"50%", background:"linear-gradient(135deg,#6c63ff,#a78bfa)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"13px", fontWeight:"700", color:"#fff", fontFamily:"var(--font-display)", overflow:"hidden", flexShrink:0 }}>
          {v?.url ? <img src={v.url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} /> : getInitials(row.name||"?")}
        </div>
      )
    },
    { key:"name",  label:"User",  render:(v,row) => (
        <div>
          <p style={{ fontSize:"13px", color:"#e8e8f0", fontWeight:"600", fontFamily:"var(--font-display)" }}>{v}</p>
          <p style={{ fontSize:"11px", color:"rgba(255,255,255,0.35)" }}>{row.email}</p>
        </div>
      )
    },
    { key:"phone",     label:"Phone",   render:(v)=><span style={{ fontSize:"12px", color:"rgba(255,255,255,0.5)", fontFamily:"var(--font-mono)" }}>{v||"—"}</span> },
    { key:"createdAt", label:"Joined",  render:(v)=><span style={{ fontSize:"11px", color:"rgba(255,255,255,0.35)" }}>{timeAgo(v)}</span> },
    { key:"lastLogin", label:"Last Login", render:(v)=><span style={{ fontSize:"11px", color:"rgba(255,255,255,0.35)" }}>{v ? timeAgo(v) : "Never"}</span> },
    { key:"isActive",  label:"Status", render:(v,row) => (
        <button onClick={(e)=>{e.stopPropagation();handleToggle(row);}} style={{ padding:"3px 12px", borderRadius:"20px", border:"none", cursor:"pointer", fontSize:"11px", fontWeight:"700", fontFamily:"var(--font-display)", background:v?"rgba(16,185,129,0.15)":"rgba(239,68,68,0.15)", color:v?"#34d399":"#f87171" }}>
          {v ? "Active" : "Blocked"}
        </button>
      )
    },
  ];

  return (
    <div>
      {toast && <Toast toast={toast} />}
      <DataTable title="Registered Users" columns={columns} data={users} loading={loading} onDelete={handleDelete} emptyText="No users registered yet" emptyIcon="👥" onRefresh={load} searchPlaceholder="Search by name, email, phone..." />
    </div>
  );
};

export { ManageUsers };
export default ManageUsers;
