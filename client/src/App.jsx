// ═══════════════════════════════════════════════════════════
//                      APP.JSX
//        Main App — Routing, Layout, Suspense
// ═══════════════════════════════════════════════════════════
import { Suspense, useEffect }  from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";

import { useTheme }  from "./context/ThemeContext";
import { useAuth  }  from "./hooks/useAuth";

// ── Layouts & Common Components
import BottomNav     from "./components/common/BottomNav";
import Loader        from "./components/common/Loader";

// ── Admin Layout
import AdminLayout   from "./admin/components/AdminSidebar";

// ── Route Configs
import { publicRoutes, adminRoutes, AdminLogin } from "./routes";

// ─────────────────────────────────────────
//   Page Fallback Loader
// ─────────────────────────────────────────
const PageLoader = () => (
  <div style={{
    display        : "flex",
    alignItems     : "center",
    justifyContent : "center",
    height         : "calc(100vh - 64px)",
    flexDirection  : "column",
    gap            : "16px",
  }}>
    <div className="spinner spinner-lg" />
    <p style={{ color: "var(--clr-text-muted)", fontSize: "0.9rem" }}>
      Loading...
    </p>
  </div>
);

// ─────────────────────────────────────────
//   Protected Route — Admin Only
// ─────────────────────────────────────────
const AdminProtectedRoute = ({ children }) => {
  const { admin, adminLoading } = useAuth();

  if (adminLoading) return <PageLoader />;

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

// ─────────────────────────────────────────
//   User Protected Route — Must be logged in
// ─────────────────────────────────────────
const UserProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// ─────────────────────────────────────────
//   Routes that show Bottom Navigation
// ─────────────────────────────────────────
const BOTTOM_NAV_ROUTES = ["/", "/youtube", "/blog", "/profile", "/settings"];

const showBottomNav = (pathname) => {
  // Show on main routes & sub-routes like /blog/some-slug
  return (
    BOTTOM_NAV_ROUTES.includes(pathname) ||
    pathname.startsWith("/blog/") ||
    pathname.startsWith("/services/") ||
    pathname.startsWith("/order/")
  );
};

// ─────────────────────────────────────────
//   Scroll To Top on Route Change
// ─────────────────────────────────────────
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  return null;
};

// ─────────────────────────────────────────
//   Maintenance Mode Check
// ─────────────────────────────────────────
const MaintenanceBanner = ({ message }) => (
  <div style={{
    background  : "linear-gradient(135deg, #ef4444, #b91c1c)",
    color       : "#fff",
    textAlign   : "center",
    padding     : "10px 16px",
    fontSize    : "0.85rem",
    fontFamily  : "var(--font-display)",
    fontWeight  : "600",
    position    : "sticky",
    top         : 0,
    zIndex      : 999,
    letterSpacing: "0.03em",
  }}>
    🔧 {message || "Site is under maintenance. Some features may be unavailable."}
  </div>
);

// ═══════════════════════════════════════════════════════════
//                     MAIN APP
// ═══════════════════════════════════════════════════════════
const App = () => {
  const { theme }       = useTheme();
  const { pathname }    = useLocation();

  // Apply theme to HTML element
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const isAdminRoute   = pathname.startsWith("/admin");
  const isAuthRoute    = pathname === "/login" || pathname === "/register";
  const showNav        = showBottomNav(pathname) && !isAdminRoute;

  return (
    <>
      <ScrollToTop />

      {/* ── Admin Panel */}
      {isAdminRoute ? (
        <Routes>
          {/* Admin Login — no layout */}
          <Route
            path="/admin/login"
            element={
              <Suspense fallback={<PageLoader />}>
                <AdminLogin />
              </Suspense>
            }
          />

          {/* Protected Admin routes with sidebar layout */}
          <Route
            path="/admin/*"
            element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }
          >
            {adminRoutes
              .filter((r) => r.path !== "/admin/login")
              .map(({ path, element: Element, index }) => (
                <Route
                  key={path}
                  index={index}
                  path={index ? undefined : path.replace("/admin/", "")}
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <Element />
                    </Suspense>
                  }
                />
              ))}
          </Route>
        </Routes>

      ) : (
        /* ── Public / User App */
        <>
          <Routes>
            {publicRoutes.map(({ path, element: Element, protected: isProtected }) => (
              <Route
                key={path}
                path={path}
                element={
                  <Suspense fallback={<PageLoader />}>
                    {isProtected ? (
                      <UserProtectedRoute>
                        <Element />
                      </UserProtectedRoute>
                    ) : (
                      <Element />
                    )}
                  </Suspense>
                }
              />
            ))}
          </Routes>

          {/* Bottom Navigation — hidden on auth pages & admin */}
          {showNav && !isAuthRoute && <BottomNav />}
        </>
      )}
    </>
  );
};

export default App;
