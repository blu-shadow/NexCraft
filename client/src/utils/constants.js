// ═══════════════════════════════════════════════════════════
//                    CONSTANTS
// ═══════════════════════════════════════════════════════════

// ─────────────────────────────────────────
//   API
// ─────────────────────────────────────────
export const API_URL     = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export const CLIENT_URL  = import.meta.env.VITE_CLIENT_URL || "http://localhost:5173";

// ─────────────────────────────────────────
//   Local Storage Keys
// ─────────────────────────────────────────
export const STORAGE_KEYS = {
  TOKEN        : "token",
  ADMIN_TOKEN  : "adminToken",
  THEME        : "1000din_theme",
  LAST_ROUTE   : "lastRoute",
};

// ─────────────────────────────────────────
//   Service Categories
// ─────────────────────────────────────────
export const SERVICE_CATEGORIES = [
  { value: "web-design",       label: "Web Design",               icon: "🎨" },
  { value: "web-development",  label: "Web Development",          icon: "💻" },
  { value: "web-app",          label: "Web App Making",           icon: "🌐" },
  { value: "game-development", label: "Game Development",         icon: "🎮" },
  { value: "app-development",  label: "App Development",          icon: "📱" },
  { value: "motherboard-repair",label:"Motherboard Repair",       icon: "🔧" },
  { value: "chip-level-repair",label: "Chip Level Repair",        icon: "🔬" },
  { value: "other",            label: "Other",                    icon: "✨" },
];

// ─────────────────────────────────────────
//   Blog Categories
// ─────────────────────────────────────────
export const BLOG_CATEGORIES = [
  { value: "tutorial", label: "Tutorial",   icon: "📖" },
  { value: "news",     label: "News",        icon: "📰" },
  { value: "update",   label: "Update",      icon: "🔔" },
  { value: "project",  label: "Project",     icon: "🚀" },
  { value: "tips",     label: "Tips & Tricks",icon: "💡" },
  { value: "other",    label: "Other",        icon: "📌" },
];

// ─────────────────────────────────────────
//   YouTube Video Categories
// ─────────────────────────────────────────
export const VIDEO_CATEGORIES = [
  { value: "tutorial", label: "Tutorial",   icon: "🎓" },
  { value: "project",  label: "Project",    icon: "🛠️"  },
  { value: "tips",     label: "Tips",        icon: "💡" },
  { value: "review",   label: "Review",      icon: "⭐" },
  { value: "vlog",     label: "Vlog",        icon: "📹" },
  { value: "other",    label: "Other",       icon: "🎬" },
];

// ─────────────────────────────────────────
//   Order Status Config
// ─────────────────────────────────────────
export const ORDER_STATUSES = [
  { value: "pending",     label: "Pending",     color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  { value: "confirmed",   label: "Confirmed",   color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  { value: "in-progress", label: "In Progress", color: "#8b5cf6", bg: "rgba(139,92,246,0.12)" },
  { value: "review",      label: "In Review",   color: "#06b6d4", bg: "rgba(6,182,212,0.12)"  },
  { value: "completed",   label: "Completed",   color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  { value: "cancelled",   label: "Cancelled",   color: "#ef4444", bg: "rgba(239,68,68,0.12)"  },
];

export const getOrderStatus = (value) =>
  ORDER_STATUSES.find((s) => s.value === value) || ORDER_STATUSES[0];

// ─────────────────────────────────────────
//   Payment Status Config
// ─────────────────────────────────────────
export const PAYMENT_STATUSES = [
  { value: "unpaid",  label: "Unpaid",  color: "#ef4444", bg: "rgba(239,68,68,0.12)"  },
  { value: "partial", label: "Partial", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  { value: "paid",    label: "Paid",    color: "#10b981", bg: "rgba(16,185,129,0.12)" },
];

export const getPaymentStatus = (value) =>
  PAYMENT_STATUSES.find((s) => s.value === value) || PAYMENT_STATUSES[0];

// ─────────────────────────────────────────
//   Order Priority
// ─────────────────────────────────────────
export const ORDER_PRIORITIES = [
  { value: "low",    label: "Low",    color: "#8888aa" },
  { value: "normal", label: "Normal", color: "#3b82f6" },
  { value: "high",   label: "High",   color: "#f59e0b" },
  { value: "urgent", label: "Urgent", color: "#ef4444" },
];

// ─────────────────────────────────────────
//   Pricing Types
// ─────────────────────────────────────────
export const PRICING_TYPES = [
  { value: "fixed",      label: "Fixed Price"  },
  { value: "range",      label: "Price Range"  },
  { value: "negotiable", label: "Negotiable"   },
  { value: "free",       label: "Free"         },
];

// ─────────────────────────────────────────
//   Bottom Navigation Items
// ─────────────────────────────────────────
export const BOTTOM_NAV_ITEMS = [
  { path: "/",        label: "Home",    icon: "home"    },
  { path: "/youtube", label: "YouTube", icon: "youtube" },
  { path: "/blog",    label: "Blog",    icon: "blog"    },
  { path: "/profile", label: "Profile", icon: "profile" },
];

// ─────────────────────────────────────────
//   Admin Sidebar Menu
// ─────────────────────────────────────────
export const ADMIN_MENU = [
  { path: "/admin/dashboard", label: "Dashboard",   icon: "grid",    permission: null             },
  { path: "/admin/orders",    label: "Orders",       icon: "package", permission: "manageOrders"  },
  { path: "/admin/services",  label: "Services",     icon: "tool",    permission: "manageServices"},
  { path: "/admin/videos",    label: "YouTube",      icon: "youtube", permission: "manageYoutube" },
  { path: "/admin/blog",      label: "Blog",         icon: "file",    permission: "manageBlog"    },
  { path: "/admin/users",     label: "Users",        icon: "users",   permission: "manageUsers"   },
  { path: "/admin/channel",   label: "Channel",      icon: "tv",      permission: "manageYoutube" },
  { path: "/admin/logo",      label: "Logo",         icon: "image",   permission: "manageSite"    },
  { path: "/admin/settings",  label: "Settings",     icon: "settings",permission: "manageSite"    },
];

// ─────────────────────────────────────────
//   Social Platform Icons Map
// ─────────────────────────────────────────
export const SOCIAL_PLATFORMS = {
  facebook : { label: "Facebook",  color: "#1877f2" },
  youtube  : { label: "YouTube",   color: "#ff0000" },
  instagram: { label: "Instagram", color: "#e1306c" },
  twitter  : { label: "Twitter",   color: "#1da1f2" },
  linkedin : { label: "LinkedIn",  color: "#0a66c2" },
  github   : { label: "GitHub",    color: "#333"    },
};

// ─────────────────────────────────────────
//   Validation Patterns
// ─────────────────────────────────────────
export const REGEX = {
  EMAIL : /^\S+@\S+\.\S+$/,
  PHONE : /^(\+88)?01[3-9]\d{8}$/,
  URL   : /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[\w-./?%&=]*)?$/,
  YOUTUBE_URL: /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
};

// ─────────────────────────────────────────
//   Pagination
// ─────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 10;
export const ADMIN_PAGE_SIZE   = 15;

// ─────────────────────────────────────────
//   Toast durations (ms)
// ─────────────────────────────────────────
export const TOAST = {
  SUCCESS : 3000,
  ERROR   : 5000,
  INFO    : 3000,
  WARNING : 4000,
};
