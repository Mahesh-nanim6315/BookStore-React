import "dotenv/config";
import express from "express";
import cors from "cors";
import { z } from "zod";
import { handleChatTurn } from "./agent/agentController.js";

const app = express();
const PORT = parseNumber(process.env.PORT, 8787);
const AGENT_ALLOWED_ORIGIN =
  process.env.AGENT_ALLOWED_ORIGIN || "http://localhost:5173";

const requestSchema = z.object({
  sessionId: z.string().trim().min(1),
  message: z.string().trim().min(1),
  userId: z.number().int().positive().nullable().optional(),
});

app.use(
  cors({
    origin: AGENT_ALLOWED_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_request, response) => {
  response.json({
    success: true,
    service: "bookstore-agent-client",
  });
});

app.post("/api/chat", async (request, response) => {
  try {
    const payload = requestSchema.parse(request.body);
    const result = await handleChatTurn(payload);

    response.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Chat request failed:", error);

    const message = getErrorMessage(error);
    const statusCode = error instanceof z.ZodError ? 400 : 502;

    response.status(statusCode).json({
      success: false,
      message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Bookstore agent client listening on http://localhost:${PORT}`);
});

function parseNumber(value, fallback) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getErrorMessage(error) {
  if (error instanceof z.ZodError) {
    return error.issues.map((issue) => issue.message).join(", ");
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "The AI chat request failed before a response could be generated.";
}
