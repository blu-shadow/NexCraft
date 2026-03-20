// ═══════════════════════════════════════════════════════════
//                   FORMAT DATE UTILITY
// ═══════════════════════════════════════════════════════════

// ─────────────────────────────────────────
//   Full readable date: "June 15, 2024"
// ─────────────────────────────────────────
export const formatDate = (date, locale = "en-BD") => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString(locale, {
    year : "numeric",
    month: "long",
    day  : "numeric",
  });
};

// ─────────────────────────────────────────
//   Short date: "15 Jun 2024"
// ─────────────────────────────────────────
export const formatShortDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-GB", {
    day  : "2-digit",
    month: "short",
    year : "numeric",
  });
};

// ─────────────────────────────────────────
//   Date + Time: "15 Jun 2024, 10:30 AM"
// ─────────────────────────────────────────
export const formatDateTime = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-BD", {
    timeZone: "Asia/Dhaka",
    day     : "2-digit",
    month   : "short",
    year    : "numeric",
    hour    : "2-digit",
    minute  : "2-digit",
    hour12  : true,
  });
};

// ─────────────────────────────────────────
//   Time only: "10:30 AM"
// ─────────────────────────────────────────
export const formatTime = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleTimeString("en-BD", {
    timeZone: "Asia/Dhaka",
    hour    : "2-digit",
    minute  : "2-digit",
    hour12  : true,
  });
};

// ─────────────────────────────────────────
//   Relative time: "2 hours ago", "just now", "3 days ago"
// ─────────────────────────────────────────
export const timeAgo = (date) => {
  if (!date) return "—";

  const now      = new Date();
  const past     = new Date(date);
  const diffMs   = now - past;
  const diffSec  = Math.floor(diffMs / 1000);
  const diffMin  = Math.floor(diffSec  / 60);
  const diffHour = Math.floor(diffMin  / 60);
  const diffDay  = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay  / 7);
  const diffMonth= Math.floor(diffDay  / 30);
  const diffYear = Math.floor(diffDay  / 365);

  if (diffSec  < 30)   return "just now";
  if (diffSec  < 60)   return `${diffSec} seconds ago`;
  if (diffMin  < 60)   return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
  if (diffHour < 24)   return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`;
  if (diffDay  < 7)    return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
  if (diffWeek < 4)    return `${diffWeek} week${diffWeek > 1 ? "s" : ""} ago`;
  if (diffMonth < 12)  return `${diffMonth} month${diffMonth > 1 ? "s" : ""} ago`;
  return `${diffYear} year${diffYear > 1 ? "s" : ""} ago`;
};

// ─────────────────────────────────────────
//   Days remaining: "5 days left" / "Overdue"
// ─────────────────────────────────────────
export const daysRemaining = (deadline) => {
  if (!deadline) return null;
  const now   = new Date();
  const end   = new Date(deadline);
  const diff  = Math.ceil((end - now) / (1000 * 60 * 60 * 24));

  if (diff < 0)  return { label: "Overdue",         color: "#ef4444", days: diff };
  if (diff === 0)return { label: "Due today",        color: "#f59e0b", days: 0 };
  if (diff <= 3) return { label: `${diff} days left`,color: "#f59e0b", days: diff };
  return             { label: `${diff} days left`,   color: "#10b981", days: diff };
};

// ─────────────────────────────────────────
//   Format currency: "৳1,200" or "BDT 1,200"
// ─────────────────────────────────────────
export const formatCurrency = (amount, currency = "BDT") => {
  if (amount === null || amount === undefined) return "—";
  const num = parseFloat(amount).toLocaleString("en-BD");
  if (currency === "BDT") return `৳${num}`;
  return `${currency} ${num}`;
};

// ─────────────────────────────────────────
//   Format number: 1200 → "1.2K", 1500000 → "1.5M"
// ─────────────────────────────────────────
export const formatNumber = (num) => {
  if (!num && num !== 0) return "0";
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000)     return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
};

// ─────────────────────────────────────────
//   Read time: "5 min read"
// ─────────────────────────────────────────
export const readTime = (content = "") => {
  const words = content.trim().split(/\s+/).length;
  const mins  = Math.ceil(words / 200); // avg 200 wpm
  return `${mins} min read`;
};

// ─────────────────────────────────────────
//   Truncate text: "Hello world this is a long..." → "Hello world this..."
// ─────────────────────────────────────────
export const truncate = (text = "", maxLength = 100) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "...";
};

// ─────────────────────────────────────────
//   Capitalize first letter
// ─────────────────────────────────────────
export const capitalize = (str = "") => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// ─────────────────────────────────────────
//   Slug to title: "web-design" → "Web Design"
// ─────────────────────────────────────────
export const slugToTitle = (slug = "") => {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

// ─────────────────────────────────────────
//   Get initials: "Abdur Rahman" → "AR"
// ─────────────────────────────────────────
export const getInitials = (name = "") => {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
};

// ─────────────────────────────────────────
//   Format file size: 1024 → "1 KB"
// ─────────────────────────────────────────
export const formatFileSize = (bytes) => {
  if (!bytes) return "0 B";
  const k     = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i     = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};
