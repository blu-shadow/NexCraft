// ═══════════════════════════════════════════════════════════
//                  SERVICE ORDER FORM
// ═══════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { useNavigate }         from "react-router-dom";
import useAuth                 from "../../hooks/useAuth";
import { placeOrder }          from "../../services/serviceOrderService";
import { getAllServices }       from "../../services/serviceOrderService";
import { REGEX }               from "../../utils/constants";

const CheckIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;

const STEPS = ["Service", "Your Info", "Requirements", "Confirm"];

const ServiceOrderForm = ({ preSelectedService = null, onSuccess = null }) => {
  const navigate        = useNavigate();
  const { user }        = useAuth();
  const [step,      setStep    ] = useState(0);
  const [services,  setServices] = useState([]);
  const [loading,   setLoading ] = useState(false);
  const [submitting,setSubmitting]=useState(false);
  const [submitted, setSubmitted]=useState(false);
  const [orderId,   setOrderId ] = useState(null);
  const [errors,    setErrors  ] = useState({});

  const [form, setForm] = useState({
    serviceId    : preSelectedService?._id || "",
    name         : user?.name  || "",
    email        : user?.email || "",
    phone        : user?.phone || "",
    address      : "",
    requirements : "",
    budgetAmount : "",
    deadline     : "",
  });

  const selectedService = services.find((s) => s._id === form.serviceId) || preSelectedService;

  useEffect(() => {
    getAllServices().then((r) => setServices(r.services || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (user) setForm((f) => ({ ...f, name:user.name||"", email:user.email||"", phone:user.phone||"" }));
  }, [user]);

  // ── Validation per step
  const validateStep = () => {
    const e = {};
    if (step === 0 && !form.serviceId) e.serviceId = "Please select a service";
    if (step === 1) {
      if (!form.name.trim())               e.name  = "Name is required";
      if (!REGEX.EMAIL.test(form.email))   e.email = "Valid email required";
      if (!REGEX.PHONE.test(form.phone))   e.phone = "Valid BD phone number required";
    }
    if (step === 2 && form.requirements.trim().length < 20) e.requirements = "Please describe your requirements (min 20 chars)";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => { if (validateStep()) setStep((s) => s + 1); };
  const prevStep = () => { setStep((s) => s - 1); setErrors({}); };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    try {
      const res = await placeOrder({
        serviceId   : form.serviceId,
        name        : form.name,
        email       : form.email,
        phone       : form.phone,
        address     : form.address,
        requirements: form.requirements,
        budgetAmount: form.budgetAmount || 0,
        deadline    : form.deadline || null,
      });
      setOrderId(res.order?.orderId);
      setSubmitted(true);
      onSuccess?.(res.order);
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || "Order failed. Please try again." });
    }
    setSubmitting(false);
  };

  // ── Success screen
  if (submitted) {
    return (
      <div style={{ textAlign:"center", padding:"40px 20px", animation:"scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1)" }}>
        <div style={{ width:"72px", height:"72px", borderRadius:"50%", background:"rgba(16,185,129,0.15)", border:"2px solid #10b981", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", animation:"pulse 2s ease infinite" }}>
          <span style={{ color:"#10b981" }}><CheckIcon /></span>
        </div>
        <h3 style={{ fontFamily:"var(--font-display)", fontSize:"20px", fontWeight:"800", color:"var(--clr-text)", marginBottom:"8px" }}>Order Placed! 🎉</h3>
        <p style={{ color:"var(--clr-text-muted)", fontSize:"14px", marginBottom:"8px", fontFamily:"var(--font-body)" }}>
          We'll contact you within 24 hours.
        </p>
        {orderId && <p style={{ fontFamily:"var(--font-mono)", fontSize:"13px", color:"#a78bfa", marginBottom:"24px" }}>Order ID: {orderId}</p>}
        <div style={{ display:"flex", gap:"10px", justifyContent:"center", flexWrap:"wrap" }}>
          <button onClick={() => navigate("/")} style={{ padding:"10px 24px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"10px", color:"var(--clr-text-muted)", fontSize:"13px", cursor:"pointer", fontFamily:"var(--font-display)", fontWeight:"600" }}>Go Home</button>
          {user && <button onClick={() => navigate("/profile?tab=orders")} style={{ padding:"10px 24px", background:"linear-gradient(135deg,#6c63ff,#4f46e5)", border:"none", borderRadius:"10px", color:"#fff", fontSize:"13px", cursor:"pointer", fontFamily:"var(--font-display)", fontWeight:"700" }}>View My Orders</button>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily:"var(--font-body)" }}>
      {/* ── Progress Steps */}
      <div style={{ display:"flex", alignItems:"center", marginBottom:"28px", gap:"0" }}>
        {STEPS.map((label, i) => (
          <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:"6px" }}>
            <div style={{ display:"flex", alignItems:"center", width:"100%" }}>
              {i > 0 && <div style={{ flex:1, height:"2px", background: i <= step ? "linear-gradient(90deg,#6c63ff,#a78bfa)" : "rgba(255,255,255,0.07)", transition:"background 0.4s" }} />}
              <div style={{
                width         : "28px", height:"28px",
                borderRadius  : "50%",
                background    : i < step ? "linear-gradient(135deg,#6c63ff,#4f46e5)" : i === step ? "rgba(108,99,255,0.2)" : "rgba(255,255,255,0.05)",
                border        : `2px solid ${i <= step ? "#6c63ff" : "rgba(255,255,255,0.1)"}`,
                display       : "flex",
                alignItems    : "center",
                justifyContent: "center",
                fontSize      : "11px",
                fontWeight    : "700",
                color         : i < step ? "#fff" : i === step ? "#a78bfa" : "rgba(255,255,255,0.3)",
                transition    : "all 0.3s",
                flexShrink    : 0,
                fontFamily    : "var(--font-display)",
              }}>
                {i < step ? "✓" : i + 1}
              </div>
              {i < STEPS.length - 1 && <div style={{ flex:1, height:"2px", background: i < step ? "linear-gradient(90deg,#a78bfa,#6c63ff)" : "rgba(255,255,255,0.07)", transition:"background 0.4s" }} />}
            </div>
            <span style={{ fontSize:"10px", fontFamily:"var(--font-display)", fontWeight:i===step?"700":"400", color:i===step?"#a78bfa":"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"0.06em", whiteSpace:"nowrap" }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* ── Step 0: Select Service */}
      {step === 0 && (
        <div style={{ animation:"slideUp 0.3s ease" }}>
          <p style={stepTitle}>Choose a Service</p>
          <div style={{ display:"flex", flexDirection:"column", gap:"8px", maxHeight:"320px", overflowY:"auto", scrollbarWidth:"none" }}>
            {services.map((s) => (
              <div key={s._id}
                onClick={() => setForm({ ...form, serviceId:s._id })}
                style={{
                  display      : "flex", alignItems:"center", gap:"12px",
                  padding      : "12px 14px",
                  background   : form.serviceId === s._id ? "rgba(108,99,255,0.1)" : "rgba(255,255,255,0.03)",
                  border       : `1.5px solid ${form.serviceId === s._id ? "rgba(108,99,255,0.4)" : "rgba(255,255,255,0.07)"}`,
                  borderRadius : "10px",
                  cursor       : "pointer",
                  transition   : "all 0.2s",
                }}
                onMouseEnter={(e) => { if (form.serviceId !== s._id) e.currentTarget.style.borderColor="rgba(255,255,255,0.15)"; }}
                onMouseLeave={(e) => { if (form.serviceId !== s._id) e.currentTarget.style.borderColor="rgba(255,255,255,0.07)"; }}
              >
                <span style={{ fontSize:"22px", flexShrink:0 }}>{s.icon || "🛠️"}</span>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:"13.5px", color:"var(--clr-text)", fontWeight:"600", fontFamily:"var(--font-display)" }}>{s.title}</p>
                  <p style={{ fontSize:"11.5px", color:"var(--clr-text-muted)" }}>{s.shortDescription?.slice(0,60)}...</p>
                </div>
                <div style={{ width:"18px", height:"18px", borderRadius:"50%", border:`2px solid ${form.serviceId===s._id?"#6c63ff":"rgba(255,255,255,0.2)"}`, background:form.serviceId===s._id?"#6c63ff":"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.2s" }}>
                  {form.serviceId === s._id && <span style={{ color:"#fff", fontSize:"10px" }}>✓</span>}
                </div>
              </div>
            ))}
          </div>
          {errors.serviceId && <p style={errStyle}>{errors.serviceId}</p>}
        </div>
      )}

      {/* ── Step 1: Contact Info */}
      {step === 1 && (
        <div style={{ animation:"slideUp 0.3s ease", display:"flex", flexDirection:"column", gap:"14px" }}>
          <p style={stepTitle}>Your Contact Information</p>
          <Field label="Full Name *" value={form.name} onChange={(v)=>setForm({...form,name:v})} placeholder="Your name" error={errors.name} />
          <Field label="Email *" value={form.email} onChange={(v)=>setForm({...form,email:v})} placeholder="your@email.com" type="email" error={errors.email} />
          <Field label="Phone * (BD)" value={form.phone} onChange={(v)=>setForm({...form,phone:v})} placeholder="01XXXXXXXXX" type="tel" error={errors.phone} />
          <Field label="Address (optional)" value={form.address} onChange={(v)=>setForm({...form,address:v})} placeholder="Dhaka, Bangladesh" />
        </div>
      )}

      {/* ── Step 2: Requirements */}
      {step === 2 && (
        <div style={{ animation:"slideUp 0.3s ease", display:"flex", flexDirection:"column", gap:"14px" }}>
          <p style={stepTitle}>Project Requirements</p>
          <div>
            <label style={lbl}>Describe your requirements *</label>
            <textarea
              value={form.requirements}
              onChange={(e) => setForm({ ...form, requirements:e.target.value })}
              placeholder="Tell us what you need in detail. Include any specific features, style preferences, timeline, etc..."
              style={{ ...inp, minHeight:"140px", resize:"vertical" }}
              maxLength={2000}
            />
            <p style={{ fontSize:"11px", color:"var(--clr-text-muted)", marginTop:"4px", textAlign:"right" }}>{form.requirements.length}/2000</p>
            {errors.requirements && <p style={errStyle}>{errors.requirements}</p>}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
            <div>
              <label style={lbl}>Budget (BDT — optional)</label>
              <input value={form.budgetAmount} onChange={(e)=>setForm({...form,budgetAmount:e.target.value})} placeholder="0" type="number" min="0" style={inp} />
            </div>
            <div>
              <label style={lbl}>Deadline (optional)</label>
              <input value={form.deadline} onChange={(e)=>setForm({...form,deadline:e.target.value})} type="date" min={new Date().toISOString().split("T")[0]} style={inp} />
            </div>
          </div>
        </div>
      )}

      {/* ── Step 3: Confirm */}
      {step === 3 && (
        <div style={{ animation:"slideUp 0.3s ease" }}>
          <p style={stepTitle}>Confirm Your Order</p>
          <div style={{ display:"flex", flexDirection:"column", gap:"10px", marginBottom:"16px" }}>
            {[
              { label:"Service",      value:selectedService?.title || "—" },
              { label:"Name",         value:form.name              },
              { label:"Email",        value:form.email             },
              { label:"Phone",        value:form.phone             },
              { label:"Budget",       value:form.budgetAmount ? `৳${form.budgetAmount}` : "Not specified" },
              { label:"Deadline",     value:form.deadline || "Not specified" },
            ].map((item) => (
              <div key={item.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", padding:"8px 12px", background:"rgba(255,255,255,0.03)", borderRadius:"8px", gap:"12px" }}>
                <span style={{ fontSize:"12px", color:"var(--clr-text-muted)", fontFamily:"var(--font-display)", fontWeight:"600", textTransform:"uppercase", letterSpacing:"0.05em", flexShrink:0 }}>{item.label}</span>
                <span style={{ fontSize:"13px", color:"var(--clr-text)", fontFamily:"var(--font-body)", textAlign:"right" }}>{item.value}</span>
              </div>
            ))}
            <div style={{ padding:"8px 12px", background:"rgba(255,255,255,0.03)", borderRadius:"8px" }}>
              <span style={{ fontSize:"12px", color:"var(--clr-text-muted)", fontFamily:"var(--font-display)", fontWeight:"600", textTransform:"uppercase", letterSpacing:"0.05em", display:"block", marginBottom:"4px" }}>Requirements</span>
              <p style={{ fontSize:"12.5px", color:"var(--clr-text)", lineHeight:"1.6", fontFamily:"var(--font-body)" }}>{form.requirements.slice(0,200)}{form.requirements.length>200?"...":""}</p>
            </div>
          </div>
          {errors.submit && <p style={{ ...errStyle, marginBottom:"10px", textAlign:"center" }}>{errors.submit}</p>}
        </div>
      )}

      {/* ── Navigation Buttons */}
      <div style={{ display:"flex", gap:"10px", marginTop:"24px" }}>
        {step > 0 && (
          <button onClick={prevStep} style={{ flex:1, padding:"11px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"10px", color:"var(--clr-text-muted)", fontSize:"13px", cursor:"pointer", fontFamily:"var(--font-display)", fontWeight:"600" }}>
            ← Back
          </button>
        )}
        <button
          onClick={step < STEPS.length - 1 ? nextStep : handleSubmit}
          disabled={submitting}
          style={{ flex:step === 0 ? 1 : 2, padding:"11px", background:"linear-gradient(135deg,#6c63ff,#4f46e5)", border:"none", borderRadius:"10px", color:"#fff", fontSize:"13px", fontFamily:"var(--font-display)", fontWeight:"700", cursor:submitting?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", boxShadow:"0 4px 20px rgba(108,99,255,0.35)", opacity:submitting?0.7:1 }}
        >
          {submitting && <span style={{ width:"14px", height:"14px", border:"2px solid rgba(255,255,255,0.3)", borderTop:"2px solid #fff", borderRadius:"50%", animation:"spin 0.6s linear infinite" }} />}
          {submitting ? "Placing Order..." : step < STEPS.length - 1 ? "Continue →" : "Place Order ✓"}
        </button>
      </div>
    </div>
  );
};

// ── Shared micro components
const Field = ({ label, value, onChange, placeholder, type="text", error }) => (
  <div>
    <label style={lbl}>{label}</label>
    <input value={value} onChange={(e)=>onChange(e.target.value)} placeholder={placeholder} type={type} style={{ ...inp, borderColor:error?"rgba(239,68,68,0.4)":"rgba(255,255,255,0.09)" }} />
    {error && <p style={errStyle}>{error}</p>}
  </div>
);

const stepTitle = { fontFamily:"var(--font-display)", fontSize:"14px", fontWeight:"700", color:"var(--clr-text)", marginBottom:"16px" };
const lbl = { fontSize:"11px", fontWeight:"600", color:"var(--clr-text-muted)", fontFamily:"var(--font-display)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:"6px", display:"block" };
const inp = { width:"100%", padding:"10px 14px", background:"rgba(255,255,255,0.05)", border:"1.5px solid rgba(255,255,255,0.09)", borderRadius:"10px", color:"var(--clr-text)", fontSize:"13.5px", fontFamily:"var(--font-body)", outline:"none", boxSizing:"border-box", transition:"border-color 0.2s" };
const errStyle = { fontSize:"11.5px", color:"#f87171", marginTop:"4px", fontFamily:"var(--font-body)" };

export default ServiceOrderForm;
