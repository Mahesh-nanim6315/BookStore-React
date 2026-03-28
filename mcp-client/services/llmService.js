import axios from "axios";

const LLM_PROVIDER = (process.env.LLM_PROVIDER || "ollama").trim().toLowerCase();
const AUTO_FALLBACK_TO_OLLAMA =
  (process.env.AUTO_FALLBACK_TO_OLLAMA || "true").trim().toLowerCase() !== "false";

const OLLAMA_URL =
  process.env.OLLAMA_URL || "http://localhost:11434/api/chat";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3";
const OLLAMA_TIMEOUT_MS = parseNumber(process.env.OLLAMA_TIMEOUT_MS, 60000);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim() || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const GEMINI_TIMEOUT_MS = parseNumber(process.env.GEMINI_TIMEOUT_MS, 60000);
const GEMINI_BASE_URL =
  process.env.GEMINI_BASE_URL ||
  "https://generativelanguage.googleapis.com/v1beta/models";

const ollamaClient = axios.create({
  baseURL: OLLAMA_URL,
  timeout: OLLAMA_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
  },
});

const geminiClient = axios.create({
  baseURL: GEMINI_BASE_URL,
  timeout: GEMINI_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
  },
});

export function getLlmStatus() {
  return {
    provider: LLM_PROVIDER,
    fallbackToOllama: AUTO_FALLBACK_TO_OLLAMA,
    model: LLM_PROVIDER === "gemini" ? GEMINI_MODEL : OLLAMA_MODEL,
    fallbackModel: LLM_PROVIDER === "gemini" ? OLLAMA_MODEL : null,
  };
}

export async function chatWithModel(messages) {
  if (LLM_PROVIDER === "gemini") {
    try {
      return await chatWithGemini(messages);
    } catch (error) {
      if (shouldFallbackToOllama(error)) {
        console.warn(
          `Gemini failed (${error.message}). Falling back to Ollama model "${OLLAMA_MODEL}".`,
        );
        return chatWithOllama(messages);
      }

      throw toUserFacingError(error);
    }
  }

  return chatWithOllama(messages);
}

async function chatWithOllama(messages) {
  try {
    const response = await ollamaClient.post("", {
      model: OLLAMA_MODEL,
      stream: false,
      messages,
      options: {
        temperature: 0.2,
      },
    });

    return response.data?.message?.content ?? "";
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const detail =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message;

      throw createProviderError(
        "ollama_unavailable",
        `Ollama is unavailable at ${OLLAMA_URL}. Make sure Ollama is running and the "${OLLAMA_MODEL}" model is available. ${detail}`,
      );
    }

    throw error;
  }
}

async function chatWithGemini(messages) {
  if (!GEMINI_API_KEY) {
    throw createProviderError(
      "gemini_missing_key",
      "Gemini is selected, but GEMINI_API_KEY is missing. Add it to mcp-client/.env or backend/.env.",
    );
  }

  try {
    const response = await geminiClient.post(
      `/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`,
      {
        contents: toGeminiContents(messages),
        generationConfig: {
          temperature: 0.2,
        },
      },
    );

    const parts =
      response.data?.candidates?.[0]?.content?.parts
        ?.map((part) => part?.text || "")
        .filter(Boolean) ?? [];

    return parts.join("").trim();
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const detail =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message;
      const status = error.response?.status ?? null;
      const quotaExceeded =
        status === 429 ||
        /quota exceeded|rate limit|resource has been exhausted|limit: 0|retry in/i.test(
          String(detail),
        );

      throw createProviderError(
        quotaExceeded ? "gemini_quota_exceeded" : "gemini_unavailable",
        quotaExceeded
          ? `Gemini quota is currently exhausted for model "${GEMINI_MODEL}".`
          : `Gemini is unavailable for model "${GEMINI_MODEL}". Check GEMINI_API_KEY and model access. ${detail}`,
        {
          status,
          quotaExceeded,
          detail: String(detail),
        },
      );
    }

    throw error;
  }
}

function shouldFallbackToOllama(error) {
  return (
    AUTO_FALLBACK_TO_OLLAMA &&
    LLM_PROVIDER === "gemini" &&
    error instanceof Error &&
    (error.code === "gemini_quota_exceeded" || error.code === "gemini_unavailable")
  );
}

function toUserFacingError(error) {
  if (!(error instanceof Error)) {
    return error;
  }

  if (error.code === "gemini_quota_exceeded") {
    return createProviderError(
      "gemini_quota_exceeded",
      `Gemini quota is exhausted right now, and the automatic Ollama fallback did not complete. ${error.detail || ""}`.trim(),
    );
  }

  return error;
}

function createProviderError(code, message, details = {}) {
  const error = new Error(message);
  error.code = code;
  Object.assign(error, details);
  return error;
}

function toGeminiContents(messages) {
  return messages.map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [
      {
        text:
          message.role === "system"
            ? `System instruction:\n${message.content}`
            : String(message.content ?? ""),
      },
    ],
  }));
}

function parseNumber(value, fallback) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
