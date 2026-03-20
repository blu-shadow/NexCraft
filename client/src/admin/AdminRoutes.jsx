// ═══════════════════════════════════════════════════════════
//                   ADMIN ROUTES
//    Protected route wrapper + route config export
// ═══════════════════════════════════════════════════════════
import { Suspense } from "react";
import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

// ── Page Loader
const PageLoader = () => (
  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"calc(100vh - 64px)", flexDirection:"column", gap:"16px" }}>
    <div className="spinner spinner-lg" />
    <p style={{ color:"var(--clr-text-muted)", fontSize:"0.9rem", fontFamily:"var(--font-body)" }}>Loading...</p>
  </div>
);

// ─────────────────────────────────────────
//   AdminProtectedRoute — wraps admin pages
// ─────────────────────────────────────────
export const AdminProtectedRoute = () => {
  const { admin, adminLoading } = useAuth();

  if (adminLoading) return <PageLoader />;

  if (!admin) return <Navigate to="/admin/login" replace />;

  return (
    <Suspense fallback={<PageLoader />}>
      <Outlet />
    </Suspense>
  );
};

// ─────────────────────────────────────────
//   SuperAdminRoute — only for super admins
// ─────────────────────────────────────────
export const SuperAdminRoute = () => {
  const { admin, adminLoading } = useAuth();

  if (adminLoading) return <PageLoader />;

  if (!admin)              return <Navigate to="/admin/login"     replace />;
  if (!admin.isSuperAdmin) return <Navigate to="/admin/dashboard" replace />;

  return (
    <Suspense fallback={<PageLoader />}>
      <Outlet />
    </Suspense>
  );
};

// ─────────────────────────────────────────
//   PermissionRoute — checks specific permission
//   Usage: <PermissionRoute permission="manageBlog" />
// ─────────────────────────────────────────
export const PermissionRoute = ({ permission }) => {
  const { admin, adminLoading, hasPermission } = useAuth();

  if (adminLoading) return <PageLoader />;

  if (!admin) return <Navigate to="/admin/login" replace />;

  if (!hasPermission(permission)) {
    return (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"60vh", flexDirection:"column", gap:"16px", textAlign:"center" }}>
        <div style={{ fontSize:"48px" }}>🚫</div>
        <h2 style={{ fontFamily:"var(--font-display)", color:"#e8e8f0", fontSize:"20px" }}>Access Denied</h2>
        <p style={{ color:"rgba(255,255,255,0.4)", fontSize:"14px", fontFamily:"var(--font-body)" }}>
          You don't have <strong style={{ color:"#a78bfa" }}>{permission}</strong> permission.
        </p>
      </div>
    );
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Outlet />
    </Suspense>
  );
};

// ─────────────────────────────────────────
//   Public Admin Route — redirect if already logged in
// ─────────────────────────────────────────
export const AdminPublicRoute = ({ children }) => {
  const { admin, adminLoading } = useAuth();

  if (adminLoading) return <PageLoader />;

  if (admin) return <Navigate to="/admin/dashboard" replace />;

  return children;
};

export default AdminProtectedRoute;
