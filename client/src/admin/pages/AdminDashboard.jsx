// ═══════════════════════════════════════════════════════════
//                  ADMIN DASHBOARD
// ═══════════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import { useNavigate }         from "react-router-dom";
import StatsCard, { StatsGrid, MiniStat } from "../components/StatsCard";
import DataTable, { StatusBadge }         from "../components/DataTable";
import { getDashboardStats }              from "../../services/adminService";
import { getOrderStats }                  from "../../services/serviceOrderService";
import { formatCurrency, formatDate, timeAgo, getInitials } from "../../utils/formatDate";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "../../utils/constants";

const orderStatusMap  = Object.fromEntries(ORDER_STATUSES.map((s) => [s.value, s]));
const paymentStatusMap= Object.fromEntries(PAYMENT_STATUSES.map((s) => [s.value, s]));

const AdminDashboard = () => {
  const navigate       = useNavigate();
  const [stats,  setStats ] = useState(null);
  const [loading,setLoading]=useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [dashRes, orderRes] = await Promise.all([
          getDashboardStats(),
          getOrderStats(),
        ]);
        setStats({ ...dashRes, orderStats: orderRes.stats, recentOrders: orderRes.recentOrders || dashRes.recentOrders });
      } catch {
        setStats(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const s = stats?.stats || {};

  // ── Recent orders table columns
  const orderCols = [
    { key: "orderId",       label: "Order ID",  width:"130px", render: (v) => <span style={{ fontFamily:"var(--font-mono)", fontSize:"12px", color:"#a78bfa" }}>{v}</span> },
    { key: "customerInfo",  label: "Customer",  render: (v) => (
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          <div style={{ width:"28px", height:"28px", borderRadius:"50%", background:"linear-gradient(135deg,#6c63ff,#a78bfa)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px", fontWeight:"700", color:"#fff", fontFamily:"var(--font-display)", flexShrink:0 }}>
            {getInitials(v?.name || "?")}
          </div>
          <div>
            <p style={{ fontSize:"13px", color:"#e8e8f0", fontWeight:"500" }}>{v?.name}</p>
            <p style={{ fontSize:"11px", color:"rgba(255,255,255,0.3)" }}>{v?.phone}</p>
          </div>
        </div>
      )
    },
    { key: "service",  label: "Service",   render: (v) => <span style={{ fontSize:"12px", color:"rgba(255,255,255,0.6)" }}>{v?.title || "—"}</span> },
    { key: "status",   label: "Status",    render: (v) => <StatusBadge value={v} statusMap={orderStatusMap} /> },
    { key: "payment",  label: "Payment",   render: (v) => <StatusBadge value={v?.status} statusMap={paymentStatusMap} /> },
    { key: "createdAt",label: "Date",      render: (v) => <span style={{ fontSize:"12px", color:"rgba(255,255,255,0.4)" }}>{timeAgo(v)}</span> },
  ];

  // ── Recent users
  const recentUsers = stats?.recentUsers || [];

  return (
    <div style={{ animation:"slideUp 0.4s ease" }}>
      {/* ── Welcome banner */}
      <div style={{
        background   : "linear-gradient(135deg, rgba(108,99,255,0.15) 0%, rgba(108,99,255,0.05) 100%)",
        border       : "1px solid rgba(108,99,255,0.2)",
        borderRadius : "16px",
        padding      : "20px 24px",
        marginBottom : "24px",
        display      : "flex",
        alignItems   : "center",
        justifyContent:"space-between",
        flexWrap     : "wrap",
        gap          : "12px",
      }}>
        <div>
          <h2 style={{ fontFamily:"var(--font-display)", fontSize:"20px", fontWeight:"800", color:"#e8e8f0", marginBottom:"4px" }}>
            👋 Welcome back, Admin!
          </h2>
          <p style={{ fontSize:"13px", color:"rgba(255,255,255,0.4)", fontFamily:"var(--font-body)" }}>
            Here's what's happening with 1000 Din today.
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/orders")}
          style={{ padding:"8px 18px", background:"rgba(108,99,255,0.2)", border:"1px solid rgba(108,99,255,0.3)", borderRadius:"10px", color:"#a78bfa", fontSize:"13px", fontFamily:"var(--font-display)", fontWeight:"600", cursor:"pointer" }}
        >
          View Orders →
        </button>
      </div>

      {/* ── Stats Grid */}
      <StatsGrid cols={4}>
        <StatsCard title="Total Orders"    value={loading ? "—" : s.orders?.total    || 0} icon="📦" color="#6c63ff" trend="up"   trendValue="+12%" sparkData={[5,8,6,12,10,15,13,20]} loading={loading} onClick={() => navigate("/admin/orders")} />
        <StatsCard title="Pending Orders"  value={loading ? "—" : s.orders?.pending  || 0} icon="⏳" color="#f59e0b" trend="flat" trendValue="Same"  sparkData={[3,5,4,6,5,4,6,5]}  loading={loading} onClick={() => navigate("/admin/orders?status=pending")} />
        <StatsCard title="Total Users"     value={loading ? "—" : s.users?.total     || 0} icon="👥" color="#10b981" trend="up"   trendValue="+8%"  sparkData={[10,14,12,18,20,22,25,28]} loading={loading} onClick={() => navigate("/admin/users")} />
        <StatsCard title="Revenue (BDT)"   value={loading ? "—" : formatCurrency(s.revenue?.total || 0)} icon="💰" color="#f59e0b" trend="up" trendValue="+18%" sparkData={[1000,1500,1200,2000,1800,2500,2200,3000]} loading={loading} />
      </StatsGrid>

      <StatsGrid cols={4}>
        <StatsCard title="Published Blogs" value={loading ? "—" : s.blogs?.published || 0} icon="📝" color="#3b82f6" loading={loading} onClick={() => navigate("/admin/blog")} />
        <StatsCard title="YouTube Videos"  value={loading ? "—" : s.videos?.total    || 0} icon="▶️" color="#ef4444" loading={loading} onClick={() => navigate("/admin/videos")} />
        <StatsCard title="Active Services" value={loading ? "—" : s.services?.total  || 0} icon="🛠️" color="#8b5cf6" loading={loading} onClick={() => navigate("/admin/services")} />
        <StatsCard title="Completed"       value={loading ? "—" : s.orders?.completed|| 0} icon="✅" color="#10b981" loading={loading} />
      </StatsGrid>

      {/* ── Bottom grid: Orders Table + Recent Users */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:"20px", alignItems:"start" }} className="dash-grid">
        {/* Recent Orders Table */}
        <DataTable
          title="Recent Orders"
          columns={orderCols}
          data={stats?.recentOrders || []}
          loading={loading}
          searchable={false}
          onView={(row) => navigate(`/admin/orders`)}
          emptyText="No orders yet"
          emptyIcon="📭"
          defaultRowsPerPage={5}
          rowsPerPageOptions={[5]}
          onRefresh={() => window.location.reload()}
          headerExtra={
            <button onClick={() => navigate("/admin/orders")} style={{ fontSize:"12px", color:"#a78bfa", background:"none", border:"none", cursor:"pointer", fontFamily:"var(--font-display)", fontWeight:"600" }}>
              View all →
            </button>
          }
        />

        {/* Recent Users */}
        <div style={{ background:"rgba(16,16,30,0.8)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"16px", overflow:"hidden" }}>
          <div style={{ padding:"16px 20px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:"14px", fontWeight:"700", color:"#e8e8f0", fontFamily:"var(--font-display)" }}>
              New Users
            </span>
            <button onClick={() => navigate("/admin/users")} style={{ fontSize:"12px", color:"#a78bfa", background:"none", border:"none", cursor:"pointer", fontFamily:"var(--font-display)", fontWeight:"600" }}>
              View all →
            </button>
          </div>
          <div style={{ padding:"8px 0" }}>
            {loading
              ? Array.from({length:5}).map((_,i) => (
                  <div key={i} style={{ display:"flex", gap:"10px", alignItems:"center", padding:"10px 16px" }}>
                    <div className="skeleton" style={{ width:"36px", height:"36px", borderRadius:"50%", flexShrink:0 }} />
                    <div style={{ flex:1 }}>
                      <div className="skeleton" style={{ height:"12px", width:"60%", borderRadius:"4px", marginBottom:"6px" }} />
                      <div className="skeleton" style={{ height:"10px", width:"80%", borderRadius:"4px" }} />
                    </div>
                  </div>
                ))
              : recentUsers.length === 0
                ? <p style={{ textAlign:"center", padding:"24px", color:"rgba(255,255,255,0.3)", fontSize:"13px" }}>No users yet</p>
                : recentUsers.map((u) => (
                    <div key={u._id} style={{ display:"flex", gap:"10px", alignItems:"center", padding:"10px 16px", transition:"background 0.15s", cursor:"pointer" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <div style={{ width:"36px", height:"36px", borderRadius:"50%", background:"linear-gradient(135deg,#6c63ff,#a78bfa)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"13px", fontWeight:"700", color:"#fff", fontFamily:"var(--font-display)", flexShrink:0, overflow:"hidden" }}>
                        {u.avatar?.url ? <img src={u.avatar.url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} /> : getInitials(u.name)}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontSize:"13px", color:"#e8e8f0", fontWeight:"500", fontFamily:"var(--font-display)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{u.name}</p>
                        <p style={{ fontSize:"11px", color:"rgba(255,255,255,0.3)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{timeAgo(u.createdAt)}</p>
                      </div>
                    </div>
                  ))
            }
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        @media(max-width:900px) { .dash-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
