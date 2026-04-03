import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { z } from "zod";
import {
  invokeLocalTool,
  listRegisteredTools,
  runWithRequestContext,
} from "../../mcp/mcp-server.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const MCP_SERVER_COMMAND = process.env.MCP_SERVER_COMMAND || "node";
const MCP_SERVER_SCRIPT =
  process.env.MCP_SERVER_SCRIPT || "../mcp/mcp-server.js";
const MCP_TOOL_TIMEOUT_MS = parseNumber(process.env.MCP_TOOL_TIMEOUT_MS, 30000);

let mcpClientPromise = null;
let toolCatalogPromise = null;
let useDirectToolExecution = false;

const toolSchemas = {
  searchBooks: z.object({
    query: z.string().trim().min(1),
    max_price: z.number().positive().optional(),
  }),
  getBookDetails: z.object({
    book_id: z.number().int().positive(),
  }),
  addToCart: z.object({
    user_id: z.number().int().positive(),
    book_id: z.number().int().positive(),
    api_token: z.string().trim().min(1).optional(),
  }),
  getCart: z.object({
    user_id: z.number().int().positive(),
    api_token: z.string().trim().min(1).optional(),
  }),
  placeOrder: z.object({
    user_id: z.number().int().positive(),
    payment_id: z.string().trim().min(1).optional(),
    api_token: z.string().trim().min(1).optional(),
  }),
  getOrders: z.object({
    user_id: z.number().int().positive(),
    api_token: z.string().trim().min(1).optional(),
  }),
  getOrderDetails: z.object({
    user_id: z.number().int().positive(),
    order_id: z.number().int().positive(),
    api_token: z.string().trim().min(1).optional(),
  }),
  getSubscriptionPlans: z.object({}),
  startSubscriptionCheckout: z.object({
    user_id: z.number().int().positive(),
    plan: z.enum(["free", "premium", "ultimate"]),
    billing_cycle: z.enum(["monthly", "yearly"]),
    api_token: z.string().trim().min(1).optional(),
  }),
  cancelSubscription: z.object({
    user_id: z.number().int().positive(),
    api_token: z.string().trim().min(1).optional(),
  }),
  resumeSubscription: z.object({
    user_id: z.number().int().positive(),
    api_token: z.string().trim().min(1).optional(),
  }),
  getWishlist: z.object({
    user_id: z.number().int().positive(),
    api_token: z.string().trim().min(1).optional(),
  }),
  toggleWishlist: z.object({
    user_id: z.number().int().positive(),
    book_id: z.number().int().positive(),
    api_token: z.string().trim().min(1).optional(),
  }),
  getLibrary: z.object({
    user_id: z.number().int().positive(),
    api_token: z.string().trim().min(1).optional(),
  }),
  addToLibrary: z.object({
    user_id: z.number().int().positive(),
    book_id: z.number().int().positive(),
    format: z.enum(["ebook", "audio", "paperback"]).optional(),
    api_token: z.string().trim().min(1).optional(),
  }),
  rentBook: z.object({
    user_id: z.number().int().positive(),
    book_id: z.number().int().positive(),
    format: z.enum(["ebook", "audio"]),
    api_token: z.string().trim().min(1).optional(),
  }),
};

export async function listAvailableTools() {
  if (!toolCatalogPromise) {
    toolCatalogPromise = loadToolCatalog().catch((error) => {
        toolCatalogPromise = null;
        throw error;
      });
  }

  return toolCatalogPromise;
}

export async function executeTool(toolName, rawInput, context = {}) {
  const schema = toolSchemas[toolName];

  if (!schema) {
    throw new Error(`Unsupported tool "${toolName}" requested by the model.`);
  }

  const hydratedInput = injectContextualDefaults(toolName, rawInput, context);
  const validatedInput = schema.parse(hydratedInput);
  const result = await callTool(toolName, validatedInput);

  return {
    tool: toolName,
    input: validatedInput,
    content: result.content ?? [],
    structuredContent: result.structuredContent ?? null,
    isError: Boolean(result.isError),
  };
}

async function getMcpClient() {
  if (useDirectToolExecution) {
    return null;
  }

  if (!mcpClientPromise) {
    mcpClientPromise = connectClient().catch((error) => {
      if (shouldUseDirectFallback(error)) {
        useDirectToolExecution = true;
        return null;
      }

      mcpClientPromise = null;
      throw error;
    });
  }

  return mcpClientPromise;
}

async function loadToolCatalog() {
  const client = await getMcpClient();
  if (!client) {
    return buildDirectToolCatalog();
  }

  const { tools } = await client.listTools();
  return tools.map((tool) => ({
    name: tool.name,
    description: tool.description || "",
    inputSchema: tool.inputSchema || {},
  }));
}

async function callTool(toolName, validatedInput) {
  const client = await getMcpClient();
  if (!client) {
    return runWithRequestContext(
      { apiToken: validatedInput.api_token ?? null },
      () => invokeLocalTool(toolName, validatedInput),
    );
  }

  return client.callTool(
    {
      name: toolName,
      arguments: validatedInput,
    },
    undefined,
    {
      maxTotalTimeout: MCP_TOOL_TIMEOUT_MS,
    },
  );
}

async function connectClient() {
  const client = new Client({
    name: "bookstore-agent-client",
    version: "1.0.0",
  });

  client.onerror = (error) => {
    console.error("MCP client error:", error);
  };

  const scriptPath = path.resolve(projectRoot, MCP_SERVER_SCRIPT);
  const transport = new StdioClientTransport({
    command: MCP_SERVER_COMMAND,
    args: [scriptPath],
    env: {
      ...process.env,
    },
    cwd: path.dirname(scriptPath),
  });

  await client.connect(transport);
  return client;
}

function injectContextualDefaults(toolName, rawInput, context) {
  const input = rawInput && typeof rawInput === "object" ? { ...rawInput } : {};
  const userScopedTools = new Set([
    "addToCart",
    "getCart",
    "placeOrder",
    "getOrders",
    "getOrderDetails",
    "startSubscriptionCheckout",
    "cancelSubscription",
    "resumeSubscription",
    "getWishlist",
    "toggleWishlist",
    "getLibrary",
    "addToLibrary",
    "rentBook",
  ]);

  if (userScopedTools.has(toolName) && input.user_id == null && context.userId) {
    input.user_id = context.userId;
  }

  if (userScopedTools.has(toolName) && input.api_token == null && context.accessToken) {
    input.api_token = context.accessToken;
  }

  if (
    toolName === "searchBooks" &&
    (typeof input.query !== "string" || !input.query.trim())
  ) {
    input.query = deriveSearchQuery(context.userMessage);
  }

  return input;
}

function buildDirectToolCatalog() {
  return listRegisteredTools().map((tool) => ({
    name: tool.name,
    description: tool.description || "",
    inputSchema: buildInputHint(tool.name),
  }));
}

function buildInputHint(toolName) {
  const schema = toolSchemas[toolName];
  const shape = schema?.shape;
  if (!shape) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(shape).map(([key, value]) => [key, describeZodField(value)]),
  );
}

function describeZodField(field) {
  const typeName =
    field?._def?.type ||
    field?._zod?.def?.type ||
    field?.def?.type ||
    "value";
  const optional =
    typeof field?.isOptional === "function" && field.isOptional() ? "?" : "";

  return `${typeName}${optional}`;
}

function shouldUseDirectFallback(error) {
  return error instanceof Error && error.message.includes("spawn EPERM");
}

function deriveSearchQuery(userMessage) {
  const text = String(userMessage ?? "")
    .toLowerCase()
    .replaceAll(/\b(find|search|show|list|recommend|suggest|need|want|get|me|a|an|the|book|books)\b/g, " ")
    .replaceAll(/\b(under|below|less than|max|maximum)\s+\d+(?:\.\d+)?\b/g, " ")
    .replaceAll(/\b(rs|inr|\$)\s*\d+(?:\.\d+)?\b/g, " ")
    .replaceAll(/\d+(?:\.\d+)?/g, " ")
    .replaceAll(/[^\w\s]/g, " ")
    .replaceAll(/\s+/g, " ")
    .trim();

  return text || "books";
}

function parseNumber(value, fallback) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
