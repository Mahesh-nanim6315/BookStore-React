const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
require("dotenv").config();

const apiRoutes = require("./routes");
const maintenanceMiddleware = require("./middleware/maintenanceMiddleware");
const logger = require("./utils/logger");
const { errorMiddleware, notFoundMiddleware } = require("./middleware/errorMiddleware");

const app = express();
const port = Number(process.env.PORT || 5000);
const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";

app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({
    success: true,
    service: "bookstore-node-server",
  });
});

app.use("/api/v1", maintenanceMiddleware, apiRoutes);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

app.listen(port, () => {
  logger.info("Server running", {
    port,
    basePath: "/api/v1",
  });
});
