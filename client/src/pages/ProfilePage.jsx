// ═══════════════════════════════════════════════════════════
//                    PROFILE PAGE
// ═══════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar          from "../components/common/Navbar";
import ProfileCard     from "../components/profile/ProfileCard";
import EditProfileForm from "../components/profile/EditProfileForm";
import { CardSkeleton } from "../components/common/Loader";
import useAuth         from "../hooks/useAuth";
import { getMyOrders } from "../services/serviceOrderService";
import { formatDate, formatCurrency, timeAgo } from "../utils/formatDate";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "../utils/constants";

const orderStatusMap  = Object.fromEntries(ORDER_STATUSES.map((s) => [s.value, s]));
const paymentStatusMap= Object.fromEntries(PAYMENT_STATUSES.map((s) => [s.value, s]));

const TABS = ["overview", "orders", "edit"];

const ProfilePage = () => {
  const navigate              = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isLoggedIn }  = useAuth();

  const [orders,   setOrders ] = useState([]);
  const [loadOrd,  setLoadOrd] = useState(true);
  const [activeTab,setActiveTab]= useState(searchParams.get("tab") || "overview");

  useEffect(() => {
    if (!isLoggedIn) { navigate("/login"); return; }
    getMyOrders({ limit:20 }).then((r) => { setOrders(r.orders||[]); setLoadOrd(false); }).catch(() => setLoadOrd(false));
  }, [isLoggedIn]);

  const switchTab = (tab) => {
    setActiveTab(tab);
    const p = new URLSearchParams(searchParams);
    p.set("tab", tab);
    setSearchParams(p);
  };

  if (!user) return null;

  return (
    <div style={{ minHeight:"100vh", background:"var(--clr-bg)" }}>
      <Navbar />

      <div style={{ maxWidth:"960px", margin:"0 auto", padding:"80px 16px 120px" }}>
        {/* ── Tab Buttons */}
        <div style={{ display:"flex", gap:"6px", marginBottom:"24px", background:"rgba(255,255,255,0.03)", border:"1px solid var(--clr-border)", borderRadius:"14px", padding:"5px" }}>
          {[
            { key:"overview", label:"Overview",    icon:"👤" },
            { key:"orders",   label:`Orders (${orders.length})`, icon:"📦" },
            { key:"edit",     label:"Edit Profile",icon:"✏️" },
          ].map((tab) => (
            <button key={tab.key} onClick={() => switchTab(tab.key)}
              style={{ flex:1, padding:"9px 14px", borderRadius:"10px", border:"none", cursor:"pointer", fontSize:"13px", fontFamily:"var(--font-display)", fontWeight:activeTab===tab.key?"700":"500", color:activeTab===tab.key?"var(--clr-text)":"var(--clr-text-muted)", background:activeTab===tab.key?"rgba(108,99,255,0.15)":"transparent", transition:"all 0.2s", display:"flex", alignItems:"center", justifyContent:"center", gap:"6px", boxShadow:activeTab===tab.key?"0 2px 8px rgba(108,99,255,0.2)":"none" }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ══ OVERVIEW TAB ══ */}
        {activeTab === "overview" && (
          <div style={{ display:"grid", gridTemplateColumns:"340px 1fr", gap:"20px", alignItems:"start" }} className="profile-grid">
            <ProfileCard onEditClick={() => switchTab("edit")} />

            {/* Right column: Stats + Recent orders */}
            <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
              {/* Stats */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"12px" }}>
                {[
                  { label:"Total Orders",     value:orders.length,                                    icon:"📦", color:"#6c63ff" },
                  { label:"Completed",        value:orders.filter((o)=>o.status==="completed").length, icon:"✅", color:"#10b981" },
                  { label:"In Progress",      value:orders.filter((o)=>o.status==="in-progress").length,icon:"🔧",color:"#f59e0b" },
                ].map((s) => (
                  <div key={s.label} style={{ background:"var(--clr-surface)", border:"1px solid var(--clr-border)", borderRadius:"16px", padding:"18px", textAlign:"center", transition:"all 0.2s" }}
                    onMouseEnter={(e)=>{e.currentTarget.style.borderColor=`${s.color}30`;e.currentTarget.style.transform="translateY(-2px)";}}
                    onMouseLeave={(e)=>{e.currentTarget.style.borderColor="var(--clr-border)";e.currentTarget.style.transform="translateY(0)";}}>
                    <div style={{ fontSize:"24px", marginBottom:"8px" }}>{s.icon}</div>
                    <p style={{ fontFamily:"var(--font-display)", fontWeight:"800", fontSize:"22px", color:s.color, letterSpacing:"-0.5px" }}>{s.value}</p>
                    <p style={{ fontSize:"11px", color:"var(--clr-text-muted)", fontFamily:"var(--font-display)", textTransform:"uppercase", letterSpacing:"0.05em", marginTop:"2px" }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Recent orders preview */}
              <div style={{ background:"var(--clr-surface)", border:"1px solid var(--clr-border)", borderRadius:"16px", overflow:"hidden" }}>
                <div style={{ padding:"14px 18px", borderBottom:"1px solid var(--clr-border)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontFamily:"var(--font-display)", fontWeight:"700", fontSize:"14px", color:"var(--clr-text)" }}>Recent Orders</span>
                  <button onClick={() => switchTab("orders")} style={{ background:"none", border:"none", cursor:"pointer", color:"#a78bfa", fontSize:"12px", fontFamily:"var(--font-display)", fontWeight:"600" }}>View all →</button>
                </div>
                {loadOrd
                  ? Array.from({length:3}).map((_,i) => <div key={i} style={{ padding:"12px 18px" }}><CardSkeleton /></div>)
                  : orders.slice(0,3).map((order) => <OrderRow key={order._id} order={order} />)
                }
                {!loadOrd && orders.length === 0 && (
                  <div style={{ padding:"32px", textAlign:"center", color:"var(--clr-text-muted)", fontSize:"13px" }}>No orders yet</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══ ORDERS TAB ══ */}
        {activeTab === "orders" && (
          <div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"20px" }}>
              <h2 style={{ fontFamily:"var(--font-display)", fontWeight:"800", fontSize:"18px", color:"var(--clr-text)" }}>My Orders</h2>
              <span style={{ fontSize:"13px", color:"var(--clr-text-muted)" }}>{orders.length} total</span>
            </div>

            {loadOrd ? (
              <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
                {Array.from({length:4}).map((_,i) => <CardSkeleton key={i} />)}
              </div>
            ) : orders.length === 0 ? (
              <div style={{ textAlign:"center", padding:"80px 20px" }}>
                <div style={{ fontSize:"56px", marginBottom:"16px" }}>📭</div>
                <h3 style={{ fontFamily:"var(--font-display)", fontWeight:"700", color:"var(--clr-text)", fontSize:"18px", marginBottom:"8px" }}>No orders yet</h3>
                <p style={{ color:"var(--clr-text-muted)", fontSize:"14px", marginBottom:"20px" }}>Place your first service order to get started!</p>
                <button onClick={() => navigate("/")} style={{ padding:"10px 24px", background:"linear-gradient(135deg,#6c63ff,#4f46e5)", border:"none", borderRadius:"10px", color:"#fff", fontSize:"13px", fontFamily:"var(--font-display)", fontWeight:"700", cursor:"pointer" }}>Browse Services</button>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
                {orders.map((order) => (
                  <div key={order._id} style={{ background:"var(--clr-surface)", border:"1px solid var(--clr-border)", borderRadius:"16px", padding:"18px 20px", transition:"all 0.2s" }}
                    onMouseEnter={(e)=>{e.currentTarget.style.borderColor="rgba(108,99,255,0.25)";e.currentTarget.style.transform="translateY(-1px)";}}
                    onMouseLeave={(e)=>{e.currentTarget.style.borderColor="var(--clr-border)";e.currentTarget.style.transform="translateY(0)";}}>
                    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:"12px" }}>
                      <div>
                        <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"6px" }}>
                          <span style={{ fontFamily:"var(--font-mono)", fontSize:"12px", color:"#a78bfa", fontWeight:"600" }}>{order.orderId}</span>
                          <StatusBadge val={order.status} map={orderStatusMap} />
                          <StatusBadge val={order.payment?.status} map={paymentStatusMap} />
                        </div>
                        <p style={{ fontFamily:"var(--font-display)", fontWeight:"700", fontSize:"15px", color:"var(--clr-text)", marginBottom:"4px" }}>
                          {order.service?.icon} {order.service?.title || "Service"}
                        </p>
                        <p style={{ fontSize:"12px", color:"var(--clr-text-muted)" }}>Placed {timeAgo(order.createdAt)}</p>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        {order.budget?.amount > 0 && (
                          <p style={{ fontFamily:"var(--font-display)", fontWeight:"800", fontSize:"16px", color:"#fbbf24" }}>{formatCurrency(order.budget.amount)}</p>
                        )}
                        {order.deadline && (
                          <p style={{ fontSize:"11.5px", color:"var(--clr-text-muted)", marginTop:"3px" }}>Due: {formatDate(order.deadline)}</p>
                        )}
                      </div>
                    </div>

                    {order.requirements && (
                      <div style={{ marginTop:"12px", padding:"10px 14px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"10px" }}>
                        <p style={{ fontSize:"12.5px", color:"var(--clr-text-muted)", lineHeight:"1.6" }}>
                          {order.requirements.slice(0,150)}{order.requirements.length>150?"...":""}
                        </p>
                      </div>
                    )}

                    {/* Status Timeline */}
                    {order.statusHistory?.length > 0 && (
                      <div style={{ marginTop:"14px", display:"flex", gap:"0", overflowX:"auto", scrollbarWidth:"none" }}>
                        {ORDER_STATUSES.slice(0,-1).map((s, i) => {
                          const reached = order.statusHistory.some((h) => h.status === s.value);
                          return (
                            <div key={s.value} style={{ display:"flex", alignItems:"center", flex:1, minWidth:"60px" }}>
                              <div style={{ width:"10px", height:"10px", borderRadius:"50%", background:reached?s.color:"rgba(255,255,255,0.1)", flexShrink:0, border:`2px solid ${reached?s.color:"rgba(255,255,255,0.1)"}`, transition:"all 0.3s", boxShadow:reached?`0 0 8px ${s.color}40`:"none" }} />
                              {i < ORDER_STATUSES.length - 2 && <div style={{ flex:1, height:"2px", background:reached?"rgba(108,99,255,0.4)":"rgba(255,255,255,0.06)" }} />}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ EDIT TAB ══ */}
        {activeTab === "edit" && (
          <EditProfileForm onClose={() => switchTab("overview")} />
        )}
      </div>

      <style>{`@media(max-width:768px){.profile-grid{grid-template-columns:1fr !important;}}`}</style>
    </div>
  );
};

const OrderRow = ({ order }) => {
  const s = ORDER_STATUSES.find((x) => x.value === order.status) || {};
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"12px", padding:"12px 18px", borderBottom:"1px solid var(--clr-border)", transition:"background 0.15s" }}
      onMouseEnter={(e)=>e.currentTarget.style.background="rgba(255,255,255,0.02)"}
      onMouseLeave={(e)=>e.currentTarget.style.background="transparent"}>
      <span style={{ fontSize:"20px" }}>{order.service?.icon||"📦"}</span>
      <div style={{ flex:1 }}>
        <p style={{ fontSize:"13px", color:"var(--clr-text)", fontWeight:"600", fontFamily:"var(--font-display)" }}>{order.service?.title||"Service"}</p>
        <p style={{ fontSize:"11px", color:"var(--clr-text-muted)" }}>{timeAgo(order.createdAt)}</p>
      </div>
      <span style={{ fontSize:"11px", padding:"3px 9px", borderRadius:"20px", background:`${s.bg}`, color:`${s.color}`, fontFamily:"var(--font-display)", fontWeight:"700" }}>{s.label}</span>
    </div>
  );
};

const StatusBadge = ({ val, map }) => {
  const s = map[val] || {};
  return <span style={{ fontSize:"10.5px", padding:"2px 8px", borderRadius:"20px", background:s.bg, color:s.color, fontFamily:"var(--font-display)", fontWeight:"700" }}>{s.label||val}</span>;
};

export default ProfilePage;
