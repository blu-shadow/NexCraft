// ═══════════════════════════════════════════════════════════
//                  MANAGE ORDERS PAGE
// ═══════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import DataTable, { StatusBadge } from "../components/DataTable";
import StatsCard, { StatsGrid }   from "../components/StatsCard";
import { adminGetAllOrders, updateOrderStatus, updatePaymentStatus, deleteOrder, getOrderStats } from "../../services/serviceOrderService";
import { formatCurrency, formatDate, timeAgo } from "../../utils/formatDate";
import { ORDER_STATUSES, PAYMENT_STATUSES }     from "../../utils/constants";

const orderStatusMap  = Object.fromEntries(ORDER_STATUSES.map((s) => [s.value, s]));
const paymentStatusMap= Object.fromEntries(PAYMENT_STATUSES.map((s) => [s.value, s]));

const CloseIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

const ManageOrders = () => {
  const [orders,  setOrders ] = useState([]);
  const [stats,   setStats  ] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // order detail modal
  const [statusFilter, setStatusFilter] = useState("");
  const [toast,   setToast  ] = useState(null);

  const showToast = (msg, type="success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const [ordersRes, statsRes] = await Promise.all([
        adminGetAllOrders({ status: statusFilter || undefined }),
        getOrderStats(),
      ]);
      setOrders(ordersRes.orders || []);
      setStats(statsRes.stats);
    } catch { setOrders([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [statusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      showToast(`Order status updated to "${newStatus}"`);
      load();
    } catch (err) { showToast(err.response?.data?.message || "Failed", "error"); }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete order ${row.orderId}?`)) return;
    try {
      await deleteOrder(row._id);
      showToast("Order deleted");
      load();
    } catch { showToast("Delete failed", "error"); }
  };

  const columns = [
    { key:"orderId",      label:"Order ID",  width:"130px", render:(v) => <span style={{ fontFamily:"var(--font-mono)", fontSize:"12px", color:"#a78bfa" }}>{v}</span> },
    { key:"customerInfo", label:"Customer",  render:(v) => (
        <div>
          <p style={{ fontSize:"13px", color:"#e8e8f0", fontWeight:"500" }}>{v?.name}</p>
          <p style={{ fontSize:"11px", color:"rgba(255,255,255,0.35)" }}>{v?.phone}</p>
        </div>
      )
    },
    { key:"service",   label:"Service",  render:(v) => <span style={{ fontSize:"12px", color:"rgba(255,255,255,0.6)" }}>{v?.title || "—"}</span> },
    { key:"status",    label:"Status",   render:(v, row) => (
        <select
          value={v}
          onChange={(e) => { e.stopPropagation(); handleStatusChange(row._id, e.target.value); }}
          style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"8px", color: orderStatusMap[v]?.color || "#e8e8f0", fontSize:"12px", padding:"4px 8px", cursor:"pointer", fontFamily:"var(--font-display)", fontWeight:"600", outline:"none" }}
          onClick={(e) => e.stopPropagation()}
        >
          {ORDER_STATUSES.map((s) => <option key={s.value} value={s.value} style={{ background:"#111124", color:"#e8e8f0" }}>{s.label}</option>)}
        </select>
      )
    },
    { key:"payment", label:"Payment", render:(v) => <StatusBadge value={v?.status} statusMap={paymentStatusMap} /> },
    { key:"budget",  label:"Budget",  render:(v) => <span style={{ fontSize:"12px", fontFamily:"var(--font-display)", color:"#fbbf24" }}>{formatCurrency(v?.amount)}</span> },
    { key:"createdAt",label:"Date",   render:(v) => <span style={{ fontSize:"11px", color:"rgba(255,255,255,0.35)" }}>{timeAgo(v)}</span> },
  ];

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{ position:"fixed", bottom:"24px", right:"24px", zIndex:999, padding:"12px 20px", background: toast.type==="error" ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)", border:`1px solid ${toast.type==="error" ? "rgba(239,68,68,0.3)" : "rgba(16,185,129,0.3)"}`, borderRadius:"12px", color: toast.type==="error" ? "#f87171":"#34d399", fontSize:"13px", fontFamily:"var(--font-display)", fontWeight:"600", backdropFilter:"blur(10px)", boxShadow:"0 8px 32px rgba(0,0,0,0.4)" }}>
          {toast.type==="error" ? "❌" : "✅"} {toast.msg}
        </div>
      )}

      {/* Stats */}
      {stats && (
        <StatsGrid cols={4}>
          <StatsCard title="Total Orders"    value={stats.totalOrders    || 0} icon="📦" color="#6c63ff" loading={loading} />
          <StatsCard title="Pending"         value={stats.pendingOrders  || 0} icon="⏳" color="#f59e0b" loading={loading} />
          <StatsCard title="Completed"       value={stats.completedOrders|| 0} icon="✅" color="#10b981" loading={loading} />
          <StatsCard title="Revenue"         value={formatCurrency(stats.totalRevenue || 0)} icon="💰" color="#f59e0b" loading={loading} />
        </StatsGrid>
      )}

      {/* Filter bar */}
      <div style={{ display:"flex", gap:"8px", marginBottom:"16px", flexWrap:"wrap" }}>
        {["", ...ORDER_STATUSES.map((s) => s.value)].map((val) => (
          <button
            key={val}
            onClick={() => setStatusFilter(val)}
            style={{
              padding     : "6px 14px",
              borderRadius: "20px",
              border      : "1px solid",
              fontSize    : "12px",
              fontFamily  : "var(--font-display)",
              fontWeight  : "600",
              cursor      : "pointer",
              background  : statusFilter === val ? "rgba(108,99,255,0.2)" : "rgba(255,255,255,0.04)",
              borderColor : statusFilter === val ? "rgba(108,99,255,0.4)" : "rgba(255,255,255,0.08)",
              color       : statusFilter === val ? "#a78bfa" : "rgba(255,255,255,0.4)",
              transition  : "all 0.2s",
            }}
          >
            {val === "" ? "All Orders" : ORDER_STATUSES.find((s) => s.value === val)?.label}
          </button>
        ))}
      </div>

      <DataTable
        title="Orders"
        columns={columns}
        data={orders}
        loading={loading}
        onView={(row) => setSelected(row)}
        onDelete={handleDelete}
        emptyText="No orders found"
        emptyIcon="📭"
        onRefresh={load}
        searchPlaceholder="Search by order ID, customer..."
        bulkActions={[{ label:"Delete Selected", icon:"🗑️", onClick: async (ids) => { for (const id of ids) { await deleteOrder(id).catch(() => {}); } showToast("Selected orders deleted"); load(); }, color:"#ef4444" }]}
      />

      {/* ── Order Detail Modal */}
      {selected && (
        <>
          <div className="overlay" onClick={() => setSelected(null)} />
          <div className="modal" style={{ width:"min(95vw,600px)", maxHeight:"90vh", overflowY:"auto" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
              <h3 style={{ fontFamily:"var(--font-display)", fontSize:"16px", fontWeight:"700", color:"#e8e8f0" }}>
                Order Detail
              </h3>
              <button onClick={() => setSelected(null)} style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"8px", width:"32px", height:"32px", color:"rgba(255,255,255,0.6)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <CloseIcon />
              </button>
            </div>

            {/* Order ID */}
            <div style={detailBox}>
              <p style={detailLabel}>Order ID</p>
              <p style={{ fontFamily:"var(--font-mono)", color:"#a78bfa", fontSize:"15px", fontWeight:"600" }}>{selected.orderId}</p>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"12px" }}>
              <div style={detailBox}>
                <p style={detailLabel}>Customer</p>
                <p style={detailValue}>{selected.customerInfo?.name}</p>
                <p style={{ fontSize:"12px", color:"rgba(255,255,255,0.4)" }}>{selected.customerInfo?.email}</p>
                <p style={{ fontSize:"12px", color:"rgba(255,255,255,0.4)" }}>{selected.customerInfo?.phone}</p>
              </div>
              <div style={detailBox}>
                <p style={detailLabel}>Service</p>
                <p style={detailValue}>{selected.service?.title || "—"}</p>
                <p style={{ fontSize:"12px", color:"rgba(255,255,255,0.4)", marginTop:"6px" }}>Budget: {formatCurrency(selected.budget?.amount)}</p>
                <p style={{ fontSize:"12px", color:"rgba(255,255,255,0.4)" }}>Date: {formatDate(selected.createdAt)}</p>
              </div>
            </div>

            <div style={{ ...detailBox, marginBottom:"12px" }}>
              <p style={detailLabel}>Requirements</p>
              <p style={{ fontSize:"13px", color:"rgba(255,255,255,0.7)", lineHeight:"1.6" }}>{selected.requirements}</p>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
              <div style={detailBox}>
                <p style={detailLabel}>Status</p>
                <StatusBadge value={selected.status} statusMap={orderStatusMap} />
              </div>
              <div style={detailBox}>
                <p style={detailLabel}>Payment</p>
                <StatusBadge value={selected.payment?.status} statusMap={paymentStatusMap} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const detailBox   = { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"10px", padding:"12px 14px", marginBottom:"0" };
const detailLabel = { fontSize:"10px", fontWeight:"600", color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"0.08em", fontFamily:"var(--font-display)", marginBottom:"6px" };
const detailValue = { fontSize:"14px", color:"#e8e8f0", fontWeight:"500", fontFamily:"var(--font-display)" };

export default ManageOrders;
