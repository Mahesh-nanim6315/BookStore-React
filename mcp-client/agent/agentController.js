import { z } from "zod";
import { chatWithModel } from "../services/llmService.js";
import { executeTool, listAvailableTools } from "../services/toolExecutor.js";
import { parseAgentDecision } from "../utils/parser.js";

const MAX_HISTORY_MESSAGES = 16;
const MAX_TOOL_STEPS = 2;

const chatRequestSchema = z.object({
  sessionId: z.string().trim().min(1),
  message: z.string().trim().min(1),
  userId: z.number().int().positive().nullable().optional(),
  accessToken: z.string().trim().min(1).nullable().optional(),
});

const sessions = new Map();

export async function handleChatTurn(payload) {
  const request = chatRequestSchema.parse(payload);
  const session = getSession(request.sessionId);
  const directIntentResult = await tryHandleDirectIntent(request);

  if (directIntentResult) {
    session.history.push({
      role: "user",
      content: request.message,
    });
    session.history.push({
      role: "assistant",
      content: directIntentResult.answer,
    });
    trimHistory(session.history);

    return {
      answer: directIntentResult.answer,
      sessionId: request.sessionId,
      debug: directIntentResult.debug,
    };
  }

  session.history.push({
    role: "user",
    content: request.message,
  });
  trimHistory(session.history);

  const toolCatalog = await listAvailableTools();
  const systemPrompt = buildSystemPrompt(toolCatalog, request.userId ?? null);
  const debugSteps = [];
  let finalAnswer = "I’m sorry, but I couldn’t complete that request.";

  for (let step = 0; step < MAX_TOOL_STEPS; step += 1) {
    const modelResponse = await chatWithModel([
      { role: "system", content: systemPrompt },
      ...session.history,
    ]);

    const decision = parseAgentDecision(modelResponse);

    if (decision.tool === "none") {
      finalAnswer = decision.response || modelResponse;
      session.history.push({
        role: "assistant",
        content: finalAnswer,
      });
      trimHistory(session.history);
      return {
        answer: finalAnswer,
        sessionId: request.sessionId,
        debug: debugSteps,
      };
    }

    try {
      const toolResult = await executeTool(decision.tool, decision.input, {
        userId: request.userId ?? null,
        userMessage: request.message,
        accessToken: request.accessToken ?? null,
      });

      debugSteps.push({
        type: "tool",
        tool: decision.tool,
        input: toolResult.input,
        isError: toolResult.isError,
        preview: summarizeToolResult(toolResult),
      });

      session.history.push({
        role: "assistant",
        content: JSON.stringify({
          tool: decision.tool,
          input: toolResult.input,
        }),
      });
      session.history.push({
        role: "user",
        content: buildToolResultMessage(toolResult),
      });
      trimHistory(session.history);

      if (toolResult.isError) {
        finalAnswer =
          "I ran into a problem while completing that action. Please try again or rephrase your request.";
        session.history.push({
          role: "assistant",
          content: finalAnswer,
        });
        trimHistory(session.history);
        return {
          answer: finalAnswer,
          sessionId: request.sessionId,
          debug: debugSteps,
        };
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown tool execution error";
      debugSteps.push({
        type: "error",
        tool: decision.tool,
        input: decision.input ?? {},
        isError: true,
        preview: message,
      });

      finalAnswer =
        "I understood the request, but I could not complete the action safely. Please try again with a bit more detail.";
      session.history.push({
        role: "assistant",
        content: finalAnswer,
      });
      trimHistory(session.history);
      return {
        answer: finalAnswer,
        sessionId: request.sessionId,
        debug: debugSteps,
      };
    }
  }

  session.history.push({
    role: "assistant",
    content: finalAnswer,
  });
  trimHistory(session.history);

  return {
    answer:
      "I need a clearer next step to finish that request. Please ask again more specifically.",
    sessionId: request.sessionId,
    debug: debugSteps,
  };
}

function getSession(sessionId) {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      history: [],
      createdAt: Date.now(),
    });
  }

  return sessions.get(sessionId);
}

function trimHistory(history) {
  if (history.length > MAX_HISTORY_MESSAGES) {
    history.splice(0, history.length - MAX_HISTORY_MESSAGES);
  }
}

function buildSystemPrompt(toolCatalog, userId) {
  const toolLines = toolCatalog
    .map((tool) => {
      const args = Object.keys(tool.inputSchema || {});
      return `${tool.name}(${args.join(", ")})`;
    })
    .join("; ");

  return `You are a bookstore assistant.
Return ONLY one JSON object and nothing else.
For tool use: {"tool":"toolName","input":{...}}
For normal reply: {"tool":"none","response":"..."}
Use exact tool names and exact input field names.
Never use markdown.
Available tools: ${toolLines}
Current user_id: ${userId ?? "null"}
If the user asks to find, search, list, or recommend books, use searchBooks.
If the user mentions a budget or "under", put that number in max_price.
After receiving a tool result, answer with tool:"none" and a short helpful response.`;
}

function buildToolResultMessage(toolResult) {
  const payload = toolResult.structuredContent ?? toolResult.content;

  return `Tool result for ${toolResult.tool}:
${JSON.stringify(
    payload,
    null,
    2,
  )}

Use this result to continue. Return ONLY valid JSON.`;
}

function summarizeToolResult(toolResult) {
  if (toolResult.structuredContent) {
    return JSON.stringify(toolResult.structuredContent).slice(0, 280);
  }

  const textContent = toolResult.content.find((item) => item.type === "text");
  return textContent?.text?.slice(0, 280) || "Tool executed.";
}

async function tryHandleDirectIntent(request) {
  const addToCartMatch = request.message.match(
    /\badd\b.*?\bbook(?:\s+id)?\s*(\d+)\b.*?\bcart\b|\bcart\b.*?\bbook(?:\s+id)?\s*(\d+)\b|\badd\b.*?\b(\d+)\b.*?\bcart\b/i,
  );
  const bookId = Number.parseInt(
    addToCartMatch?.[1] || addToCartMatch?.[2] || addToCartMatch?.[3] || "",
    10,
  );

  if (!Number.isFinite(bookId)) {
    return null;
  }

  if (!request.userId) {
    return {
      answer: "Please sign in first, then ask me again to add that book to your cart.",
      debug: [],
    };
  }

  const toolResult = await executeTool(
    "addToCart",
    { user_id: request.userId, book_id: bookId },
    {
      userId: request.userId,
      userMessage: request.message,
      accessToken: request.accessToken ?? null,
    },
  );

  const debug = [
    {
      type: "tool",
      tool: "addToCart",
      input: toolResult.input,
      isError: toolResult.isError,
      preview: summarizeToolResult(toolResult),
    },
  ];

  if (toolResult.isError) {
    return {
      answer:
        extractToolError(toolResult) ||
        "I couldn't add that book to your cart. Please try again.",
      debug,
    };
  }

  return {
    answer: `Book ${bookId} has been added to your cart.`,
    debug,
  };
}

function extractToolError(toolResult) {
  const textContent = toolResult.content.find((item) => item.type === "text")?.text;
  if (!textContent) {
    return null;
  }

  try {
    return JSON.parse(textContent).error || null;
  } catch {
    return textContent;
  }
}
