// ═══════════════════════════════════════════════════════════
//                  ADMIN MIDDLEWARE
//      Fine-grained Permission & Activity Logging
// ═══════════════════════════════════════════════════════════

// ─────────────────────────────────────────
//   requirePermission — Specific Permission Check
//   Usage: router.post("/", adminProtect, requirePermission("manageBlog"), handler)
// ─────────────────────────────────────────
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: "❌ Admin authentication required.",
      });
    }

    // Super admin bypasses all permission checks
    if (req.admin.isSuperAdmin) return next();

    const hasPermission = req.admin.permissions?.[permission] === true;

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: `❌ Permission denied. You need "${permission}" access to do this.`,
        required: permission,
      });
    }

    next();
  };
};

// ─────────────────────────────────────────
//   requireAnyPermission — At least ONE of listed permissions
//   Usage: requireAnyPermission(["manageUsers", "manageOrders"])
// ─────────────────────────────────────────
const requireAnyPermission = (permissions = []) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: "❌ Admin authentication required.",
      });
    }

    if (req.admin.isSuperAdmin) return next();

    const hasAny = permissions.some(
      (perm) => req.admin.permissions?.[perm] === true
    );

    if (!hasAny) {
      return res.status(403).json({
        success : false,
        message : `❌ Permission denied. You need one of: ${permissions.join(", ")}`,
        required: permissions,
      });
    }

    next();
  };
};

// ─────────────────────────────────────────
//   requireAllPermissions — Must have ALL listed permissions
//   Usage: requireAllPermissions(["manageBlog", "manageSite"])
// ─────────────────────────────────────────
const requireAllPermissions = (permissions = []) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: "❌ Admin authentication required.",
      });
    }

    if (req.admin.isSuperAdmin) return next();

    const missingPerms = permissions.filter(
      (perm) => !req.admin.permissions?.[perm]
    );

    if (missingPerms.length > 0) {
      return res.status(403).json({
        success : false,
        message : `❌ Missing permissions: ${missingPerms.join(", ")}`,
        missing : missingPerms,
      });
    }

    next();
  };
};

// ─────────────────────────────────────────
//   superAdminOnly — Only Super Admin
// ─────────────────────────────────────────
const superAdminOnly = (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({
      success: false,
      message: "❌ Admin authentication required.",
    });
  }

  if (!req.admin.isSuperAdmin) {
    return res.status(403).json({
      success: false,
      message: "❌ This action requires Super Admin access.",
    });
  }

  next();
};

// ─────────────────────────────────────────
//   logAdminActivity — Log admin actions to console (Dev)
//   Can be extended to save logs to DB later
// ─────────────────────────────────────────
const logAdminActivity = (action) => {
  return (req, res, next) => {
    if (req.admin && process.env.NODE_ENV === "development") {
      const MAGENTA = "\x1b[35m";
      const RESET   = "\x1b[0m";
      const time    = new Date().toLocaleTimeString("en-BD", { timeZone: "Asia/Dhaka" });

      console.log(
        `${MAGENTA}[ADMIN LOG] ${time} | ${req.admin.name} (${req.admin.email}) → ${action} | IP: ${req.ip}${RESET}`
      );
    }
    next();
  };
};

// ─────────────────────────────────────────
//   preventSelfAction — Admin can't act on own account
//   Usage: router.delete("/:id", adminProtect, preventSelfAction, handler)
// ─────────────────────────────────────────
const preventSelfAction = (req, res, next) => {
  if (!req.admin) return next();

  const targetId = req.params.id || req.body.adminId;

  if (targetId && req.admin._id.toString() === targetId.toString()) {
    return res.status(400).json({
      success: false,
      message: "❌ You cannot perform this action on your own account.",
    });
  }

  next();
};

// ─────────────────────────────────────────
//   maintenanceBypass — Allow admins through maintenance mode
// ─────────────────────────────────────────
const maintenanceBypass = async (req, res, next) => {
  try {
    const SiteConfig = require("../models/SiteConfig.model");
    const config     = await SiteConfig.getConfig();

    if (!config.maintenance.isEnabled) return next(); // Not in maintenance

    // Allow admins to still access everything
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
      const jwt     = require("jsonwebtoken");
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role === "admin") return next();
    }

    // Block everyone else
    return res.status(503).json({
      success: false,
      message: config.maintenance.message || "We are under maintenance. Please try again later.",
      maintenance: true,
    });

  } catch {
    next(); // On error, let it through
  }
};

// ═══════════════════════════════════════════════════════════

module.exports = {
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  superAdminOnly,
  logAdminActivity,
  preventSelfAction,
  maintenanceBypass,
};
