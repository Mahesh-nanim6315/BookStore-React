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
  if (detectPlaceOrderIntent(request.message)) {
    return handlePlaceOrderIntent(request);
  }

  if (detectCartIntent(request.message)) {
    return handleCartIntent(request);
  }

  const ordersIntent = detectOrdersIntent(request.message);
  if (ordersIntent) {
    return handleOrdersIntent(request, ordersIntent.limit);
  }

  const addToCartMatch = request.message.match(
    /\badd\b.*?\bbook(?:\s+id)?\s*(\d+)\b.*?\bcart\b|\bcart\b.*?\bbook(?:\s+id)?\s*(\d+)\b|\badd\b.*?\b(\d+)\b.*?\bcart\b/i,
  );
  const bookId = Number.parseInt(
    addToCartMatch?.[1] || addToCartMatch?.[2] || addToCartMatch?.[3] || "",
    10,
  );

  if (!Number.isFinite(bookId)) {
    const searchIntent = detectSearchIntent(request.message);
    if (searchIntent) {
      return handleSearchIntent(request);
    }

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
    answer: formatAddToCartReply(toolResult, bookId),
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

async function handleOrdersIntent(request, limit) {
  if (!request.userId) {
    return {
      answer: "Please sign in first, then ask me to show your orders.",
      debug: [],
    };
  }

  const toolResult = await executeTool(
    "getOrders",
    { user_id: request.userId },
    {
      userId: request.userId,
      userMessage: request.message,
      accessToken: request.accessToken ?? null,
    },
  );

  const debug = [
    {
      type: "tool",
      tool: "getOrders",
      input: toolResult.input,
      isError: toolResult.isError,
      preview: summarizeToolResult(toolResult),
    },
  ];

  if (toolResult.isError) {
    return {
      answer:
        extractToolError(toolResult) ||
        "I couldn't fetch your orders right now. Please try again.",
      debug,
    };
  }
  return {
    answer: formatOrdersReply(toolResult, limit),
    debug,
  };
}

async function handleSearchIntent(request) {
  const rawQuery = deriveSearchQuery(request.message);
  const maxPrice = deriveBudget(request.message);
  const toolResult = await executeTool(
    "searchBooks",
    {
      query: rawQuery,
      ...(maxPrice != null ? { max_price: maxPrice } : {}),
    },
    {
      userId: request.userId ?? null,
      userMessage: request.message,
      accessToken: request.accessToken ?? null,
    },
  );

  const debug = [
    {
      type: "tool",
      tool: "searchBooks",
      input: toolResult.input,
      isError: toolResult.isError,
      preview: summarizeToolResult(toolResult),
    },
  ];

  if (toolResult.isError) {
    return {
      answer:
        extractToolError(toolResult) ||
        "I couldn't search the catalog right now. Please try again.",
      debug,
    };
  }
  return {
    answer: formatSearchReply(toolResult),
    debug,
  };
}

async function handleCartIntent(request) {
  if (!request.userId) {
    return {
      answer: "Please sign in first, then ask me to show your cart.",
      debug: [],
    };
  }

  const toolResult = await executeTool(
    "getCart",
    { user_id: request.userId },
    {
      userId: request.userId,
      userMessage: request.message,
      accessToken: request.accessToken ?? null,
    },
  );

  const debug = [
    {
      type: "tool",
      tool: "getCart",
      input: toolResult.input,
      isError: toolResult.isError,
      preview: summarizeToolResult(toolResult),
    },
  ];

  if (toolResult.isError) {
    return {
      answer:
        extractToolError(toolResult) ||
        "I couldn't fetch your cart right now. Please try again.",
      debug,
    };
  }

  return {
    answer: formatCartReply(toolResult),
    debug,
  };
}

async function handlePlaceOrderIntent(request) {
  if (!request.userId) {
    return {
      answer: "Please sign in first, then ask me to place your order.",
      debug: [],
    };
  }

  const toolResult = await executeTool(
    "placeOrder",
    { user_id: request.userId },
    {
      userId: request.userId,
      userMessage: request.message,
      accessToken: request.accessToken ?? null,
    },
  );

  const debug = [
    {
      type: "tool",
      tool: "placeOrder",
      input: toolResult.input,
      isError: toolResult.isError,
      preview: summarizeToolResult(toolResult),
    },
  ];

  if (toolResult.isError) {
    return {
      answer:
        extractToolError(toolResult) ||
        "I couldn't place your order right now. Please try again.",
      debug,
    };
  }

  return {
    answer: formatPlaceOrderReply(toolResult),
    debug,
  };
}

function detectOrdersIntent(message) {
  const text = String(message ?? "").toLowerCase();
  if (!/\border(s)?\b/.test(text)) {
    return null;
  }

  const match = text.match(/\b(last|latest|recent)\s+(\d+)\s+orders?\b/);
  const limit = match ? Number.parseInt(match[2], 10) : 5;
  return {
    limit: Number.isFinite(limit) && limit > 0 ? Math.min(limit, 10) : 5,
  };
}

function detectCartIntent(message) {
  const text = String(message ?? "").toLowerCase();
  return /\b(cart)\b/.test(text) && /\b(show|get|view|what(?:'s| is)|see|check)\b/.test(text);
}

function detectPlaceOrderIntent(message) {
  const text = String(message ?? "").toLowerCase();
  return /\b(place|checkout|complete|submit)\b/.test(text) && /\b(order|cart)\b/.test(text);
}

function detectSearchIntent(message) {
  const text = String(message ?? "").toLowerCase();
  return (
    /\b(book|books)\b/.test(text) &&
    (/\b(find|search|show|list|recommend|suggest)\b/.test(text) ||
      /\bunder\b/.test(text) ||
      /\brupees\b|\binr\b|\brs\b/.test(text) ||
      /\b(drama|fantasy|thriller|romance|horror|historical|science fiction|sci fi|sci-fi|mystery|technology|novel)\b/.test(text))
  );
}

function deriveSearchQuery(message) {
  return String(message ?? "")
    .toLowerCase()
    .replace(/\b(find|search|show|list|recommend|suggest|need|want|get|me|please|for|a|an|the|book|books|rupees|rs|inr)\b/g, " ")
    .replace(/\b(under|below|less than|max|maximum)\s+\d+(?:\.\d+)?\b/g, " ")
    .replace(/\b(rs|inr|rupees|\$)\s*\d+(?:\.\d+)?\b/g, " ")
    .replace(/\b(all formats|all format|out of all formats|cheapest format|format|formats)\b/g, " ")
    .replace(/[^\w\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim() || "books";
}

function deriveBudget(message) {
  const match = String(message ?? "").match(
    /\b(?:under|below|less than|max|maximum)\s*(?:rs\.?|inr|rupees)?\s*(\d+(?:\.\d+)?)/i,
  );

  if (!match) {
    return null;
  }

  const value = Number.parseFloat(match[1]);
  return Number.isFinite(value) ? value : null;
}

function describeCheapestFormat(prices) {
  if (!prices || typeof prices !== "object") {
    return null;
  }

  const formats = ["ebook", "audio", "paperback"]
    .map((format) => ({
      format,
      price: Number(prices[format]),
    }))
    .filter((entry) => Number.isFinite(entry.price) && entry.price > 0)
    .sort((left, right) => left.price - right.price);

  if (!formats.length) {
    const fallback = Number(prices.fallback);
    return Number.isFinite(fallback) && fallback > 0 ? `paperback at INR ${fallback}` : null;
  }

  return `${formats[0].format} at INR ${formats[0].price}`;
}

function dedupeBooks(books) {
  const seen = new Set();
  return books.filter((book) => {
    const key = String(book.name ?? book.id ?? "").toLowerCase();
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function formatAddToCartReply(toolResult, bookId) {
  const data = toolResult.structuredContent ?? {};
  const format = data.selected_format || "selected format";
  const price = data.selected_price != null ? ` for INR ${data.selected_price}` : "";
  return `Done. I added book #${bookId} to your cart as ${format}${price}.\n\nWould you like me to show your cart or place the order next?`;
}

function formatOrdersReply(toolResult, limit) {
  const orders =
    toolResult.structuredContent?.backend_response?.data?.orders ??
    toolResult.structuredContent?.backend_response?.orders ??
    [];
  const recentOrders = orders.slice(0, limit);

  if (!recentOrders.length) {
    return "You don't have any orders yet.\n\nWould you like me to help you find a book to order?";
  }

  const lines = [
    `Here are your latest ${recentOrders.length} orders:`,
    "",
    "| Order ID | Status | Payment | Items | Total |",
    "| --- | --- | --- | --- | --- |",
    ...recentOrders.map((order) => {
      const total = order.total_amount ?? order.total ?? "n/a";
      const items = order.items_count ?? order.items?.length ?? 0;
      return `| #${order.id} | ${order.status ?? "unknown"} | ${order.payment_status ?? "unknown"} | ${items} | INR ${total} |`;
    }),
    "",
    "Would you like the details for any specific order?",
  ];

  return lines.join("\n");
}

function formatSearchReply(toolResult) {
  const data = toolResult.structuredContent ?? {};
  const books = dedupeBooks(data.books ?? []);
  if (!books.length) {
    const genre = data.matched_category ? ` in ${data.matched_category}` : "";
    const budget = data.max_price != null ? ` under INR ${data.max_price}` : "";
    return `I couldn't find any matching books${genre}${budget}.\n\nWould you like me to try a broader genre or a slightly higher budget?`;
  }

  const lines = [
    `I found ${books.length} good option${books.length === 1 ? "" : "s"} for you:`,
    "",
    "| Title | Author | Category | Cheapest Format |",
    "| --- | --- | --- | --- |",
    ...books.slice(0, 5).map((book) => {
      return `| ${book.name} | ${book.author || "Unknown author"} | ${book.category || "Uncategorized"} | ${describeCheapestFormat(book.prices) || "n/a"} |`;
    }),
    "",
    "Would you like me to add one of these to your cart or refine the search further?",
  ];

  return lines.join("\n");
}

function formatCartReply(toolResult) {
  const cart =
    toolResult.structuredContent?.backend_response?.data?.cart ??
    toolResult.structuredContent?.backend_response?.cart ??
    toolResult.structuredContent?.backend_response?.data ??
    null;
  const items = cart?.items ?? [];

  if (!items.length) {
    return "Your cart is empty right now.\n\nWould you like me to help you find a book to add?";
  }

  const total = cart?.total ?? cart?.total_amount ?? cart?.grand_total ?? null;
  const lines = [
    "Here’s what’s currently in your cart:",
    "",
    "| Title | Format | Quantity | Price |",
    "| --- | --- | --- | --- |",
    ...items.map((item) => {
      const title = item.book?.name || item.name || `Book #${item.book_id ?? "n/a"}`;
      return `| ${title} | ${item.format || "n/a"} | ${item.quantity ?? 1} | INR ${item.price ?? "n/a"} |`;
    }),
  ];

  if (total != null) {
    lines.push("", `Estimated total: INR ${total}`);
  }

  lines.push("", "Would you like me to place this order for you?");
  return lines.join("\n");
}

function formatPlaceOrderReply(toolResult) {
  const payload =
    toolResult.structuredContent?.backend_response?.data?.order ??
    toolResult.structuredContent?.backend_response?.order ??
    null;
  const orderId = payload?.id ?? "your";
  const total = payload?.total_amount ?? payload?.total ?? null;
  const status = payload?.status ?? "completed";
  const totalLine = total != null ? ` The total is INR ${total}.` : "";

  return `Your order ${orderId === "your" ? "has been placed" : `#${orderId} has been placed`} successfully. Current status: ${status}.${totalLine}\n\nWould you like me to show your latest orders too?`;
}
