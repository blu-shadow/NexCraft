// ═══════════════════════════════════════════════════════════
//                    SERVICE CARD
// ═══════════════════════════════════════════════════════════
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "../../utils/formatDate";

const ArrowIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const CheckIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;

// Category color map
const CATEGORY_COLORS = {
  "web-design"        : { color:"#6c63ff", glow:"rgba(108,99,255,0.2)" },
  "web-development"   : { color:"#3b82f6", glow:"rgba(59,130,246,0.2)" },
  "web-app"           : { color:"#8b5cf6", glow:"rgba(139,92,246,0.2)" },
  "game-development"  : { color:"#10b981", glow:"rgba(16,185,129,0.2)" },
  "app-development"   : { color:"#f59e0b", glow:"rgba(245,158,11,0.2)"  },
  "motherboard-repair": { color:"#ef4444", glow:"rgba(239,68,68,0.2)"  },
  "chip-level-repair" : { color:"#06b6d4", glow:"rgba(6,182,212,0.2)"  },
  "other"             : { color:"#a78bfa", glow:"rgba(167,139,250,0.2)" },
};

const getPriceText = (pricing) => {
  if (!pricing) return null;
  if (pricing.type === "free") return "Free";
  if (pricing.type === "negotiable") return "Negotiable";
  if (pricing.type === "range") return `${formatCurrency(pricing.minPrice)} – ${formatCurrency(pricing.maxPrice)}`;
  return formatCurrency(pricing.minPrice);
};

/**
 * ServiceCard Props:
 *   service — the service object from API
 *   variant — "default" | "compact" | "featured"
 */
const ServiceCard = ({ service, variant = "default" }) => {
  const navigate    = useNavigate();
  const [hovered, setHovered] = useState(false);

  const { color, glow } = CATEGORY_COLORS[service.category] || CATEGORY_COLORS.other;
  const priceText         = getPriceText(service.pricing);
  const features          = (service.features || []).filter((f) => f.isIncluded).slice(0, 3);

  const handleClick = () => navigate(`/services/${service.slug}`);
  const handleOrder = (e) => { e.stopPropagation(); navigate(`/order/${service._id}`); };

  if (variant === "compact") {
    return (
      <div
        onClick={handleClick}
        style={{
          display       : "flex",
          alignItems    : "center",
          gap           : "14px",
          padding       : "14px 16px",
          background    : hovered ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
          border        : `1px solid ${hovered ? color + "30" : "var(--clr-border)"}`,
          borderRadius  : "12px",
          cursor        : "pointer",
          transition    : "all 0.2s",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div style={{ width:"42px", height:"42px", borderRadius:"10px", background:`${color}18`, border:`1px solid ${color}28`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"20px", flexShrink:0 }}>
          {service.icon || "🛠️"}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontFamily:"var(--font-display)", fontWeight:"600", fontSize:"13.5px", color:"var(--clr-text)", marginBottom:"2px", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{service.title}</p>
          {priceText && <p style={{ fontSize:"11.5px", color, fontFamily:"var(--font-display)", fontWeight:"600" }}>{priceText}</p>}
        </div>
        <ArrowIcon />
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background    : "var(--clr-surface)",
        border        : `1px solid ${hovered ? color + "40" : "var(--clr-border)"}`,
        borderRadius  : "20px",
        overflow      : "hidden",
        cursor        : "pointer",
        transition    : "all 0.3s cubic-bezier(0.34,1.2,0.64,1)",
        transform     : hovered ? "translateY(-6px)" : "translateY(0)",
        boxShadow     : hovered ? `0 20px 50px rgba(0,0,0,0.25), 0 0 0 1px ${color}25` : "0 2px 10px rgba(0,0,0,0.1)",
        position      : "relative",
        display       : "flex",
        flexDirection : "column",
      }}
    >
      {/* Top glow band */}
      <div style={{
        height    : "3px",
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        opacity   : hovered ? 1 : 0.4,
        transition: "opacity 0.3s",
      }} />

      {/* Service image or gradient */}
      <div style={{
        height    : variant === "featured" ? "200px" : "140px",
        background: service.image?.url
          ? `url(${service.image.url}) center/cover`
          : `linear-gradient(135deg, ${color}20, ${color}08)`,
        display       : "flex",
        alignItems    : "center",
        justifyContent: "center",
        position      : "relative",
        overflow      : "hidden",
      }}>
        {!service.image?.url && (
          <>
            <span style={{ fontSize:variant === "featured" ? "64px" : "48px", filter:"drop-shadow(0 4px 12px rgba(0,0,0,0.3))", zIndex:1 }}>{service.icon || "🛠️"}</span>
            {/* Background pattern */}
            <div style={{ position:"absolute", inset:0, backgroundImage:`radial-gradient(circle at 30% 50%, ${color}10 0%, transparent 60%), radial-gradient(circle at 70% 30%, ${color}08 0%, transparent 50%)` }} />
          </>
        )}

        {/* Featured badge */}
        {service.isFeatured && (
          <div style={{ position:"absolute", top:"12px", right:"12px", padding:"3px 10px", background:"rgba(245,158,11,0.2)", border:"1px solid rgba(245,158,11,0.35)", borderRadius:"20px", fontSize:"11px", fontFamily:"var(--font-display)", fontWeight:"700", color:"#fbbf24" }}>
            ⭐ Featured
          </div>
        )}

        {/* Category badge */}
        <div style={{ position:"absolute", top:"12px", left:"12px", padding:"3px 10px", background:`${color}20`, border:`1px solid ${color}35`, borderRadius:"20px", fontSize:"10.5px", fontFamily:"var(--font-display)", fontWeight:"600", color, textTransform:"capitalize" }}>
          {service.category?.replace(/-/g," ")}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding:"18px", flex:1, display:"flex", flexDirection:"column" }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"8px", marginBottom:"8px" }}>
          <h3 style={{ fontFamily:"var(--font-display)", fontWeight:"700", fontSize:"15px", color:"var(--clr-text)", lineHeight:"1.3", flex:1 }}>
            {service.title}
          </h3>
          {priceText && (
            <span style={{ fontSize:"13px", fontFamily:"var(--font-display)", fontWeight:"800", color, whiteSpace:"nowrap", flexShrink:0 }}>
              {priceText}
            </span>
          )}
        </div>

        <p style={{ fontSize:"12.5px", color:"var(--clr-text-muted)", lineHeight:"1.6", marginBottom:"14px", fontFamily:"var(--font-body)", flex:1 }}>
          {service.shortDescription}
        </p>

        {/* Features */}
        {features.length > 0 && (
          <div style={{ display:"flex", flexDirection:"column", gap:"5px", marginBottom:"16px" }}>
            {features.map((f, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:"7px" }}>
                <span style={{ color:"#10b981", flexShrink:0 }}><CheckIcon /></span>
                <span style={{ fontSize:"12px", color:"var(--clr-text-muted)", fontFamily:"var(--font-body)" }}>{f.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Delivery */}
        {service.deliveryTime && (
          <div style={{ display:"flex", alignItems:"center", gap:"6px", marginBottom:"14px" }}>
            <span style={{ fontSize:"12px" }}>⏱️</span>
            <span style={{ fontSize:"11.5px", color:"var(--clr-text-muted)", fontFamily:"var(--font-body)" }}>Delivery: {service.deliveryTime}</span>
          </div>
        )}

        {/* CTA Button */}
        <button
          onClick={handleOrder}
          style={{
            width         : "100%",
            padding       : "10px",
            background    : hovered ? `linear-gradient(135deg, ${color}, ${color}cc)` : `${color}15`,
            border        : `1px solid ${color}${hovered ? "60" : "30"}`,
            borderRadius  : "10px",
            color         : hovered ? "#fff" : color,
            fontSize      : "13px",
            fontFamily    : "var(--font-display)",
            fontWeight    : "700",
            cursor        : "pointer",
            display       : "flex",
            alignItems    : "center",
            justifyContent: "center",
            gap           : "6px",
            transition    : "all 0.25s",
            boxShadow     : hovered ? `0 6px 20px ${glow}` : "none",
          }}
        >
          Order Service <ArrowIcon />
        </button>
      </div>
    </div>
  );
};

export default ServiceCard;
