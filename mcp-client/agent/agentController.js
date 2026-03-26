import { z } from "zod";
import { chatWithOllama } from "../services/ollamaService.js";
import { executeTool, listAvailableTools } from "../services/toolExecutor.js";
import { parseAgentDecision } from "../utils/parser.js";

const MAX_HISTORY_MESSAGES = 16;
const MAX_TOOL_STEPS = 4;

const chatRequestSchema = z.object({
  sessionId: z.string().trim().min(1),
  message: z.string().trim().min(1),
  userId: z.number().int().positive().nullable().optional(),
});

const sessions = new Map();

export async function handleChatTurn(payload) {
  const request = chatRequestSchema.parse(payload);
  const session = getSession(request.sessionId);

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
    const modelResponse = await chatWithOllama([
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
    .map(
      (tool) =>
        `- ${tool.name}: ${tool.description || "No description provided."}`,
    )
    .join("\n");

  return `You are a helpful AI bookstore assistant.

You help users search books, manage carts, and place orders naturally.
You may use MCP tools when needed, but never mention internal implementation details, MCP, JSON parsing, or tool protocols to the user.

Available tools:
${toolLines}

Current user context:
- user_id: ${userId ?? "not available"}

Rules:
1. Return ONLY valid JSON.
2. If you need a tool, respond with:
{"tool":"toolName","input":{...}}
3. If no tool is needed, respond with:
{"tool":"none","response":"your natural answer"}
4. Do not include markdown fences.
5. Do not invent tool names.
6. For user-specific actions, use the current user_id when available.
7. Ask for clarification only when required information is genuinely missing.
8. After a tool result is provided, use it to answer naturally and concisely.`;
}

function buildToolResultMessage(toolResult) {
  return `Tool result for ${toolResult.tool}:
${JSON.stringify(
    {
      isError: toolResult.isError,
      structuredContent: toolResult.structuredContent,
      content: toolResult.content,
    },
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
