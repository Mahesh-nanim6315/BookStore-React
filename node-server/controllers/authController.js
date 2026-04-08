const authService = require("../services/authService");

async function login(req, res, next) {
  try {
    const result = await authService.login({
      email: req.body.email,
      password: req.body.password,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function register(req, res, next) {
  try {
    const result = await authService.register(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const result = await authService.forgotPassword(req.body);
    res.status(result.statusCode || 200).json(result.body);
  } catch (error) {
    next(error);
  }
}

async function resetPassword(req, res, next) {
  try {
    const result = await authService.resetPassword(req.body);
    res.status(result.statusCode || 200).json(result.body);
  } catch (error) {
    next(error);
  }
}

async function getUser(req, res, next) {
  try {
    const result = await authService.getCurrentUser(req.user);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function logout(req, res, next) {
  try {
    const result = await authService.logout(req.authTokenRecord);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
  register,
  forgotPassword,
  resetPassword,
  getUser,
  logout,
};
