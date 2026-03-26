import axios from "axios";

const OLLAMA_URL =
  process.env.OLLAMA_URL || "http://localhost:11434/api/chat";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3";
const OLLAMA_TIMEOUT_MS = parseNumber(process.env.OLLAMA_TIMEOUT_MS, 60000);

const ollamaClient = axios.create({
  baseURL: OLLAMA_URL,
  timeout: OLLAMA_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function chatWithOllama(messages) {
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

      throw new Error(
        `Ollama is unavailable at ${OLLAMA_URL}. Make sure Ollama is running and the "${OLLAMA_MODEL}" model is available. ${detail}`,
      );
    }

    throw error;
  }
}

function parseNumber(value, fallback) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
