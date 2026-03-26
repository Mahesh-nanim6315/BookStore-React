const JSON_BLOCK_PATTERN = /```json\s*([\s\S]*?)```|```([\s\S]*?)```/i;

export function parseAgentDecision(rawText) {
  const text = String(rawText ?? "").trim();

  if (!text) {
    return {
      tool: "none",
      response: "I’m sorry, but I couldn’t generate a response just now.",
      raw: text,
    };
  }

  const normalized = extractCandidateJson(text);
  if (!normalized) {
    return {
      tool: "none",
      response: text,
      raw: text,
    };
  }

  try {
    const parsed = JSON.parse(normalized);

    if (
      parsed &&
      typeof parsed === "object" &&
      typeof parsed.tool === "string" &&
      parsed.tool.trim() !== ""
    ) {
      return {
        tool: parsed.tool,
        input: parsed.input && typeof parsed.input === "object" ? parsed.input : {},
        response:
          typeof parsed.response === "string" ? parsed.response : undefined,
        raw: text,
      };
    }
  } catch {
    // Fall back to treating the model output as a final answer.
  }

  return {
    tool: "none",
    response: text,
    raw: text,
  };
}

function extractCandidateJson(text) {
  const fenced = text.match(JSON_BLOCK_PATTERN);
  if (fenced) {
    return (fenced[1] || fenced[2] || "").trim();
  }

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return null;
  }

  return text.slice(firstBrace, lastBrace + 1).trim();
}
