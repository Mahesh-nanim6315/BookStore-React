const authService = require("../services/authService");
const settingsModel = require("../models/settingsModel");

async function maintenanceMiddleware(req, _res, next) {
  try {
    if (!(await settingsModel.isMaintenanceModeEnabled())) {
      return next();
    }

    if (isMaintenanceAllowedPublicRoute(req.path)) {
      return next();
    }

    if (req.user && String(req.user.role || "").toLowerCase() === "admin") {
      return next();
    }

    const authorization = req.get("authorization") || "";
    const [scheme, token] = authorization.split(" ");

    if (String(scheme).toLowerCase() === "bearer" && token) {
      const authenticated = await authService.authenticateAccessToken(token);

      if (String(authenticated.formattedUser.role || "").toLowerCase() === "admin") {
        req.user = authenticated.formattedUser;
        req.rawUser = authenticated.user;
        req.authTokenRecord = authenticated.tokenRecord;
        return next();
      }
    }

    return next({
      statusCode: 503,
      message: "The site is currently in maintenance mode. Only admins can access it.",
    });
  } catch (error) {
    if (error.statusCode === 401) {
      return next({
        statusCode: 503,
        message: "The site is currently in maintenance mode. Only admins can access it.",
      });
    }

    return next(error);
  }
}

function isMaintenanceAllowedPublicRoute(path) {
  return path === "/login" || path === "/settings/public";
}

module.exports = maintenanceMiddleware;
