const { AppError } = require("../utils/helpers");

function requireRole(...roles) {
  const allowedRoles = roles.map((role) => String(role).toLowerCase());

  return (req, _res, next) => {
    if (!req.user) {
      return next(new AppError("Unauthenticated.", 401));
    }

    const userRole = String(req.user.role || "").toLowerCase();
    if (!allowedRoles.includes(userRole)) {
      return next(
        new AppError("You do not have the required role for this action.", 403),
      );
    }

    return next();
  };
}

function requirePermission(permission) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new AppError("Unauthenticated.", 401));
    }

    const permissions = Array.isArray(req.user.permissions) ? req.user.permissions : [];
    if (
      String(req.user.role || "").toLowerCase() !== "admin" &&
      !permissions.includes(permission)
    ) {
      return next(
        new AppError("You do not have permission to perform this action.", 403),
      );
    }

    return next();
  };
}

module.exports = {
  requireRole,
  requirePermission,
};
