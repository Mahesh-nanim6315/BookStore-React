const { AppError } = require("../utils/helpers");
const logger = require("../utils/logger");

function notFoundMiddleware(req, res, next) {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found.`, 404));
}

function errorMiddleware(error, req, res, _next) {
  const statusCode = Number(error.statusCode || error.status || 500);
  const message = error.message || "Operation failed";
  const details = error.details || null;

  logger.error("Request failed", {
    method: req.method,
    path: req.originalUrl,
    statusCode,
    error: message,
  });

  const response = {
    success: false,
    message,
  };

  if (statusCode === 422 && details?.errors) {
    response.errors = details.errors;
  }

  if (details && typeof details === "object") {
    for (const [key, value] of Object.entries(details)) {
      if (key === "errors") {
        continue;
      }

      response[key] = value;
    }
  }

  if (process.env.NODE_ENV !== "production" && statusCode >= 500) {
    response.debug = {
      stack: error.stack,
    };
  }

  res.status(statusCode).json(response);
}

module.exports = {
  notFoundMiddleware,
  errorMiddleware,
};
