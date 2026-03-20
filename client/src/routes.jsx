// ═══════════════════════════════════════════════════════════
//                    ROUTES.JSX
//          All App Routes — Lazy Loaded
// ═══════════════════════════════════════════════════════════
import { lazy } from "react";

// ─────────────────────────────────────────
//   Lazy imports — each page loads only when visited
// ─────────────────────────────────────────

// ── Public Pages
const HomePage        = lazy(() => import("./pages/HomePage"));
const YoutubePage     = lazy(() => import("./pages/YoutubePage"));
const BlogPage        = lazy(() => import("./pages/BlogPage"));
const BlogDetailPage  = lazy(() => import("./pages/BlogDetailPage"));
const ProfilePage     = lazy(() => import("./pages/ProfilePage"));
const SettingsPage    = lazy(() => import("./pages/SettingsPage"));
const LoginPage       = lazy(() => import("./pages/LoginPage"));
const RegisterPage    = lazy(() => import("./pages/RegisterPage"));
const ServiceDetail   = lazy(() => import("./pages/ServiceDetailPage"));
const OrderPage       = lazy(() => import("./pages/OrderPage"));
const NotFoundPage    = lazy(() => import("./pages/NotFoundPage"));

// ── Admin Pages
const AdminLogin      = lazy(() => import("./admin/pages/AdminLogin"));
const AdminDashboard  = lazy(() => import("./admin/pages/AdminDashboard"));
const ManageServices  = lazy(() => import("./admin/pages/ManageServices"));
const ManageVideos    = lazy(() => import("./admin/pages/ManageVideos"));
const ManageBlog      = lazy(() => import("./admin/pages/ManageBlog"));
const ManageOrders    = lazy(() => import("./admin/pages/ManageOrders"));
const ManageUsers     = lazy(() => import("./admin/pages/ManageUsers"));
const ManageChannel   = lazy(() => import("./admin/pages/ManageChannel"));
const ManageLogo      = lazy(() => import("./admin/pages/ManageLogo"));
const SiteSettings    = lazy(() => import("./admin/pages/SiteSettings"));

// ─────────────────────────────────────────
//   Route Config
// ─────────────────────────────────────────
export const publicRoutes = [
  { path: "/",              element: HomePage       },
  { path: "/youtube",       element: YoutubePage    },
  { path: "/blog",          element: BlogPage        },
  { path: "/blog/:slug",    element: BlogDetailPage  },
  { path: "/profile",       element: ProfilePage     },
  { path: "/settings",      element: SettingsPage    },
  { path: "/login",         element: LoginPage       },
  { path: "/register",      element: RegisterPage    },
  { path: "/services/:slug",element: ServiceDetail   },
  { path: "/order/:id",     element: OrderPage       },
  { path: "*",              element: NotFoundPage    },
];

export const adminRoutes = [
  { path: "/admin",                  element: AdminDashboard, index: true },
  { path: "/admin/dashboard",        element: AdminDashboard  },
  { path: "/admin/services",         element: ManageServices  },
  { path: "/admin/videos",           element: ManageVideos    },
  { path: "/admin/blog",             element: ManageBlog      },
  { path: "/admin/orders",           element: ManageOrders    },
  { path: "/admin/users",            element: ManageUsers     },
  { path: "/admin/channel",          element: ManageChannel   },
  { path: "/admin/logo",             element: ManageLogo      },
  { path: "/admin/settings",         element: SiteSettings    },
];

export {
  HomePage, YoutubePage, BlogPage, BlogDetailPage,
  ProfilePage, SettingsPage, LoginPage, RegisterPage,
  ServiceDetail, OrderPage, NotFoundPage,
  AdminLogin, AdminDashboard, ManageServices,
  ManageVideos, ManageBlog, ManageOrders,
  ManageUsers, ManageChannel, ManageLogo, SiteSettings,
};
