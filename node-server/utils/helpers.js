const crypto = require("crypto");

class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

const PASSWORD_RULE_MESSAGE =
  "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.";

const STRONG_PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

function isStrongPassword(password) {
  return STRONG_PASSWORD_PATTERN.test(String(password || ""));
}

function validateStrongPassword(password) {
  if (!isStrongPassword(password)) {
    throw new AppError("Validation failed.", 422, {
      errors: {
        password: [PASSWORD_RULE_MESSAGE],
      },
    });
  }
}

function nowTimestamp() {
  return new Date();
}

function nowMysql() {
  return nowTimestamp().toISOString().slice(0, 19).replace("T", " ");
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function randomHex(size = 32) {
  return crypto.randomBytes(size).toString("hex");
}

function sha256(value) {
  return crypto.createHash("sha256").update(String(value || "")).digest("hex");
}

module.exports = {
  AppError,
  PASSWORD_RULE_MESSAGE,
  STRONG_PASSWORD_PATTERN,
  normalizeEmail,
  isValidEmail,
  isStrongPassword,
  validateStrongPassword,
  nowMysql,
  nowTimestamp,
  addMinutes,
  randomHex,
  sha256,
};
