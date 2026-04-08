const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authModel = require("../models/authModel");
const settingsModel = require("../models/settingsModel");
const subscriptionModel = require("../models/subscriptionModel");
const logger = require("../utils/logger");
const {
  AppError,
  addMinutes,
  isValidEmail,
  normalizeEmail,
  nowMysql,
  nowTimestamp,
  randomHex,
  sha256,
  validateStrongPassword,
} = require("../utils/helpers");

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const JWT_SECRET = process.env.JWT_SECRET || "change-me";
const FRONTEND_URL = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");
const PASSWORD_RESET_EXPIRE_MINUTES = Number(
  process.env.PASSWORD_RESET_EXPIRE_MINUTES || 60,
);

const DEFAULT_ROLE_PERMISSIONS = {
  admin: [
    "access_dashboard",
    "manage_orders",
    "manage_payments",
    "books.view",
    "books.create",
    "books.edit",
    "books.delete",
    "authors.view",
    "authors.create",
    "authors.edit",
    "authors.delete",
    "users.view",
    "users.create",
    "users.edit",
    "users.delete",
    "manage_reviews",
    "manage_notifications",
    "manage_roles_permissions",
  ],
  manager: [
    "access_dashboard",
    "manage_orders",
    "books.view",
    "books.create",
    "books.edit",
    "books.delete",
    "authors.view",
    "authors.create",
    "authors.edit",
    "authors.delete",
    "manage_reviews",
    "manage_notifications",
  ],
  staff: ["access_dashboard", "manage_orders", "manage_reviews"],
  user: [],
};

const loginAttempts = new Map();
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 60 * 1000;

async function login({ email, password, ipAddress, userAgent }) {
  const normalizedEmail = normalizeEmail(email);
  validateLoginInput(normalizedEmail, password);
  ensureNotRateLimited(normalizedEmail, ipAddress);

  const user = await findUserByEmail(normalizedEmail);
  if (!user || !(await bcrypt.compare(String(password), String(user.password)))) {
    recordFailedLogin(normalizedEmail, ipAddress);
    throw invalidCredentialsError();
  }

  if (!Number(user.is_active)) {
    recordFailedLogin(normalizedEmail, ipAddress);
    throw invalidEmailError(
      "This account has been deactivated. Please contact support.",
    );
  }

  const maintenanceMode = await isMaintenanceModeEnabled();
  if (maintenanceMode && String(user.role || "").toLowerCase() !== "admin") {
    throw new AppError(
      "The site is currently in maintenance mode. Only admins can sign in.",
      503,
    );
  }

  clearFailedLogin(normalizedEmail, ipAddress);
  const token = await issueToken(user.id);
  const formattedUser = await formatUser(user);

  logger.info("User login successful", {
    userId: user.id,
    email: normalizedEmail,
    userAgent: userAgent || null,
  });

  return {
    success: true,
    token,
    user: formattedUser,
    message: "Login successful",
  };
}

async function register(payload) {
  await assertRegistrationAvailable();

  const name = String(payload.name || "").trim();
  const email = normalizeEmail(payload.email);
  const password = String(payload.password || "");
  const passwordConfirmation = String(payload.password_confirmation || "");

  const errors = {};

  if (!name) {
    errors.name = ["The name field is required."];
  }

  if (!email) {
    errors.email = ["The email field is required."];
  } else if (!isValidEmail(email)) {
    errors.email = ["The email field must be a valid email address."];
  } else if (await findUserByEmail(email)) {
    errors.email = ["The email has already been taken."];
  }

  if (!password) {
    errors.password = ["The password field is required."];
  } else if (password !== passwordConfirmation) {
    errors.password = ["The password field confirmation does not match."];
  } else if (!isStrongPasswordValue(password)) {
    errors.password = [
      "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.",
    ];
  }

  if (!passwordConfirmation) {
    errors.password_confirmation = ["The password confirmation field is required."];
  }

  if (Object.keys(errors).length > 0) {
    throw new AppError("Validation failed.", 422, { errors });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const now = nowMysql();

  const userId = await authModel.createUser({
    name,
    email,
    passwordHash,
    now,
  });
  const user = await findUserById(userId);
  const token = await issueToken(user.id);

  logger.info("User registration successful", {
    userId: user.id,
    email,
  });

  return {
    success: true,
    token,
    user: await formatUser(user),
    message: "Registration successful",
  };
}

async function forgotPassword(payload) {
  await assertPasswordResetAvailable();

  const email = normalizeEmail(payload.email);
  if (!email) {
    throw new AppError("Validation failed.", 422, {
      errors: {
        email: ["The email field is required."],
      },
    });
  }

  if (!isValidEmail(email)) {
    throw new AppError("Validation failed.", 422, {
      errors: {
        email: ["The email field must be a valid email address."],
      },
    });
  }

  const user = await findUserByEmail(email);
  if (!user) {
    return {
      statusCode: 422,
      body: {
        success: false,
        errors: {
          email: ["We can't find a user with that email address."],
        },
        message: "We can't find a user with that email address.",
      },
    };
  }

  const rawToken = randomHex(32);
  const tokenHash = await bcrypt.hash(rawToken, 10);
  const now = nowMysql();

  await authModel.upsertPasswordResetToken({
    email,
    tokenHash,
    createdAt: now,
  });

  logger.info("Password reset token generated", {
    userId: user.id,
    email,
    resetUrl: `${FRONTEND_URL}/reset-password/${rawToken}?email=${encodeURIComponent(email)}`,
  });

  return {
    statusCode: 200,
    body: {
      success: true,
      message: "We have emailed your password reset link.",
    },
  };
}

async function resetPassword(payload) {
  await assertPasswordResetAvailable();

  const token = String(payload.token || "").trim();
  const email = normalizeEmail(payload.email);
  const password = String(payload.password || "");
  const passwordConfirmation = String(payload.password_confirmation || "");

  const errors = {};

  if (!token) {
    errors.token = ["The token field is required."];
  }

  if (!email) {
    errors.email = ["The email field is required."];
  } else if (!isValidEmail(email)) {
    errors.email = ["The email field must be a valid email address."];
  }

  if (!password) {
    errors.password = ["The password field is required."];
  } else if (password !== passwordConfirmation) {
    errors.password = ["The password field confirmation does not match."];
  } else if (!isStrongPasswordValue(password)) {
    errors.password = [
      "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.",
    ];
  }

  if (!passwordConfirmation) {
    errors.password_confirmation = ["The password confirmation field is required."];
  }

  if (Object.keys(errors).length > 0) {
    throw new AppError("Validation failed.", 422, { errors });
  }

  const resetRecord = await authModel.findPasswordResetTokenByEmail(email);

  if (!resetRecord) {
    return invalidResetPasswordResponse();
  }

  const createdAt = new Date(resetRecord.created_at);
  const expiresAt = addMinutes(createdAt, PASSWORD_RESET_EXPIRE_MINUTES);

  if (Number.isNaN(createdAt.getTime()) || nowTimestamp() > expiresAt) {
    await authModel.deletePasswordResetTokenByEmail(email);
    return invalidResetPasswordResponse();
  }

  const matches = await bcrypt.compare(token, resetRecord.token);
  if (!matches) {
    return invalidResetPasswordResponse();
  }

  const user = await findUserByEmail(email);
  if (!user) {
    return invalidResetPasswordResponse();
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const now = nowMysql();

  await authModel.resetUserPasswordAndRevokeTokens({
    userId: user.id,
    email,
    passwordHash,
    rememberToken: randomHex(30),
    now,
  });

  logger.info("Password reset completed", {
    userId: user.id,
    email,
  });

  return {
    statusCode: 200,
    body: {
      success: true,
      message: "Your password has been reset.",
    },
  };
}

async function logout(tokenRecord) {
  if (tokenRecord?.id) {
    await authModel.deleteAccessTokenById(tokenRecord.id);
  }

  return {
    success: true,
    message: "Logout successful",
  };
}

async function getCurrentUser(user) {
  return {
    success: true,
    user:
      user && Array.isArray(user.permissions) && Object.prototype.hasOwnProperty.call(user, "avatar_url")
        ? user
        : await formatUser(user),
  };
}

async function authenticateAccessToken(rawToken) {
  if (!rawToken) {
    throw new AppError("Unauthenticated.", 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(rawToken, JWT_SECRET);
  } catch (_error) {
    throw new AppError("Unauthenticated.", 401);
  }

  const tokenHash = sha256(rawToken);
  const tokenRecord = await authModel.findAccessTokenByHash(tokenHash);

  if (!tokenRecord || Number(tokenRecord.tokenable_id) !== Number(decoded.sub)) {
    throw new AppError("Unauthenticated.", 401);
  }

  if (tokenRecord.expires_at && new Date(tokenRecord.expires_at) < nowTimestamp()) {
    await authModel.deleteAccessTokenById(tokenRecord.id);
    throw new AppError("Unauthenticated.", 401);
  }

  const user = await findUserById(decoded.sub);
  if (!user) {
    throw new AppError("Unauthenticated.", 401);
  }

  if (!Number(user.is_active)) {
    throw new AppError("Unauthenticated.", 401);
  }

  await authModel.touchAccessTokenLastUsed(tokenRecord.id, nowMysql());

  return {
    user,
    formattedUser: await formatUser(user),
    tokenRecord,
  };
}

async function issueToken(userId) {
  const now = nowTimestamp();
  const jwtId = randomHex(16);
  const token = jwt.sign({ sub: String(userId), jti: jwtId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
  const decoded = jwt.decode(token);
  const expiresAt = decoded?.exp
    ? new Date(decoded.exp * 1000).toISOString().slice(0, 19).replace("T", " ")
    : null;

  await authModel.createAccessTokenRecord({
    userId,
    tokenHash: sha256(token),
    expiresAt,
    now: now.toISOString().slice(0, 19).replace("T", " "),
  });

  return token;
}

async function formatUser(user) {
  const permissions = await resolvePermissions(user.role);
  const gracePeriodSubscription = await subscriptionModel.findGracePeriodByUserId(user.id);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    permissions,
    plan: user.plan || null,
    billing_cycle: user.billing_cycle || null,
    plan_expires_at: user.plan_expires_at || null,
    has_active_subscription: hasActiveSubscription(user),
    subscription_on_grace_period: Boolean(gracePeriodSubscription),
    avatar_url: resolveUserImageUrl(user.avatar, "images/default-avatar.png"),
    cover_url: resolveUserImageUrl(user.cover, "images/default-cover.jpg"),
  };
}

async function resolvePermissions(role) {
  const normalizedRole = String(role || "user").toLowerCase();
  if (normalizedRole === "admin") {
    return DEFAULT_ROLE_PERMISSIONS.admin;
  }

  const saved = await authModel.findRolePermissionsByRole(normalizedRole);

  if (saved?.permissions) {
    try {
      const permissions = JSON.parse(saved.permissions);
      if (Array.isArray(permissions)) {
        return [...new Set(permissions)];
      }
    } catch (_error) {
      logger.warn("Failed to parse role permissions", { role: normalizedRole });
    }
  }

  return DEFAULT_ROLE_PERMISSIONS[normalizedRole] || [];
}

function hasActiveSubscription(user) {
  if (!user.plan_expires_at || user.plan === "free") {
    return false;
  }

  const expiresAt = new Date(user.plan_expires_at);
  return !Number.isNaN(expiresAt.getTime()) && expiresAt > nowTimestamp();
}

function resolveUserImageUrl(path, fallback) {
  const assetBaseUrl = (process.env.ASSET_BASE_URL || process.env.API_BASE_URL || "").replace(
    /\/+$/,
    "",
  );
  const fallbackUrl = assetBaseUrl ? `${assetBaseUrl}/${fallback}` : `/${fallback}`;

  if (!path) {
    return fallbackUrl;
  }

  const normalizedPath = String(path).replace(/^\/+/, "");
  if (/^https?:\/\//i.test(normalizedPath)) {
    return normalizedPath;
  }

  return assetBaseUrl ? `${assetBaseUrl}/${normalizedPath}` : `/${normalizedPath}`;
}

async function findUserByEmail(email) {
  return authModel.findUserByEmail(email);
}

async function findUserById(id) {
  return authModel.findUserById(id);
}

async function isMaintenanceModeEnabled() {
  return settingsModel.isMaintenanceModeEnabled();
}

async function assertRegistrationAvailable() {
  if (await isMaintenanceModeEnabled()) {
    throw new AppError(
      "Registration is unavailable while maintenance mode is enabled.",
      503,
    );
  }
}

async function assertPasswordResetAvailable() {
  if (await isMaintenanceModeEnabled()) {
    throw new AppError(
      "Password reset is unavailable while maintenance mode is enabled.",
      503,
    );
  }
}

function validateLoginInput(email, password) {
  const errors = {};

  if (!email) {
    errors.email = ["The email field is required."];
  } else if (!isValidEmail(email)) {
    errors.email = ["The email field must be a valid email address."];
  }

  if (!String(password || "")) {
    errors.password = ["The password field is required."];
  }

  if (Object.keys(errors).length > 0) {
    throw new AppError("Validation failed.", 422, { errors });
  }
}

function invalidCredentialsError() {
  return new AppError("Invalid credentials.", 422, {
    errors: {
      email: ["Invalid credentials."],
    },
  });
}

function invalidEmailError(message) {
  return new AppError(message, 422, {
    errors: {
      email: [message],
    },
  });
}

function invalidResetPasswordResponse() {
  return {
    statusCode: 422,
    body: {
      success: false,
      errors: {
        email: ["This password reset token is invalid."],
      },
      message: "This password reset token is invalid.",
    },
  };
}

function ensureNotRateLimited(email, ipAddress) {
  const key = `${email}|${ipAddress || "unknown"}`;
  const existing = loginAttempts.get(key);

  if (!existing) {
    return;
  }

  if (existing.expiresAt <= Date.now()) {
    loginAttempts.delete(key);
    return;
  }

  if (existing.count < MAX_LOGIN_ATTEMPTS) {
    return;
  }

  const seconds = Math.max(1, Math.ceil((existing.expiresAt - Date.now()) / 1000));
  throw new AppError("Invalid credentials.", 422, {
    errors: {
      email: [
        `Too many login attempts. Please try again in ${seconds} seconds.`,
      ],
    },
  });
}

function recordFailedLogin(email, ipAddress) {
  const key = `${email}|${ipAddress || "unknown"}`;
  const existing = loginAttempts.get(key);

  if (!existing || existing.expiresAt <= Date.now()) {
    loginAttempts.set(key, {
      count: 1,
      expiresAt: Date.now() + LOGIN_WINDOW_MS,
    });
    return;
  }

  existing.count += 1;
  loginAttempts.set(key, existing);
}

function clearFailedLogin(email, ipAddress) {
  const key = `${email}|${ipAddress || "unknown"}`;
  loginAttempts.delete(key);
}

function isStrongPasswordValue(password) {
  try {
    validateStrongPassword(password);
    return true;
  } catch (_error) {
    return false;
  }
}

module.exports = {
  login,
  register,
  forgotPassword,
  resetPassword,
  logout,
  getCurrentUser,
  authenticateAccessToken,
};
