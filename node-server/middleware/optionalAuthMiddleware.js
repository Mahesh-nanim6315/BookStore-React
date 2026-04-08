const authService = require("../services/authService");

async function optionalAuthMiddleware(req, _res, next) {
  try {
    if (req.user) {
      return next();
    }

    const authorization = req.get("authorization") || "";
    const [scheme, token] = authorization.split(" ");

    if (String(scheme).toLowerCase() !== "bearer" || !token) {
      return next();
    }

    const authenticated = await authService.authenticateAccessToken(token);
    req.user = authenticated.formattedUser;
    req.rawUser = authenticated.user;
    req.authTokenRecord = authenticated.tokenRecord;
    return next();
  } catch (_error) {
    return next();
  }
}

module.exports = optionalAuthMiddleware;
