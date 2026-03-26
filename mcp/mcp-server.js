import axios from "axios";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const APP_NAME = "bookstore-laravel-mcp";
const APP_VERSION = "1.0.0";
const DEFAULT_TIMEOUT_MS = 15000;
const API_BASE_URL = normalizeBaseUrl(
  process.env.LARAVEL_API_BASE_URL || "http://127.0.0.1:8000/api/v1",
);
const API_TOKEN = process.env.LARAVEL_API_TOKEN?.trim() || "";
const API_TIMEOUT_MS = parsePositiveInteger(
  process.env.LARAVEL_API_TIMEOUT_MS,
  DEFAULT_TIMEOUT_MS,
);

let authenticatedUserPromise = null;

const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : {}),
  },
});

const server = new McpServer(
  {
    name: APP_NAME,
    version: APP_VERSION,
  },
  {
    capabilities: {
      logging: {},
      tools: {},
    },
  },
);

server.registerTool(
  "searchBooks",
  {
    title: "Search Books",
    description:
      "Search the Laravel bookstore catalog by text query and optional maximum price.",
    inputSchema: {
      query: z.string().trim().min(1, "query is required"),
      max_price: z.number().positive().optional(),
    },
  },
  async ({ query, max_price }) => {
    try {
      const payload = await searchBooks(query, max_price);
      return successResult(payload);
    } catch (error) {
      return errorResult(error);
    }
  },
);

server.registerTool(
  "getBookDetails",
  {
    title: "Get Book Details",
    description: "Fetch a single book and related details from the Laravel backend.",
    inputSchema: {
      book_id: z.number().int().positive(),
    },
  },
  async ({ book_id }) => {
    try {
      const payload = await getBookDetails(book_id);
      return successResult(payload);
    } catch (error) {
      return errorResult(error);
    }
  },
);

server.registerTool(
  "addToCart",
  {
    title: "Add To Cart",
    description:
      "Add a book to the authenticated user's cart. Requires LARAVEL_API_TOKEN.",
    inputSchema: {
      user_id: z.number().int().positive(),
      book_id: z.number().int().positive(),
    },
  },
  async ({ user_id, book_id }) => {
    try {
      await ensureAuthenticatedUser(user_id);

      const selectedPurchase = await resolveDefaultPurchase(book_id);
      const response = await apiRequest({
        method: "post",
        url: `/cart/add/${book_id}`,
        data: {
          format: selectedPurchase.format,
          price: selectedPurchase.price,
        },
      });

      const payload = {
        requested_user_id: user_id,
        selected_format: selectedPurchase.format,
        selected_price: selectedPurchase.price,
        backend_response: response.data,
      };

      return successResult(payload);
    } catch (error) {
      return errorResult(error);
    }
  },
);

server.registerTool(
  "getCart",
  {
    title: "Get Cart",
    description:
      "Read the authenticated user's cart from Laravel. Requires LARAVEL_API_TOKEN.",
    inputSchema: {
      user_id: z.number().int().positive(),
    },
  },
  async ({ user_id }) => {
    try {
      await ensureAuthenticatedUser(user_id);
      const response = await apiRequest({
        method: "get",
        url: "/cart",
      });

      const payload = {
        requested_user_id: user_id,
        backend_response: response.data,
      };

      return successResult(payload);
    } catch (error) {
      return errorResult(error);
    }
  },
);

server.registerTool(
  "getOrders",
  {
    title: "Get Orders",
    description:
      "List the authenticated user's orders from Laravel. Requires LARAVEL_API_TOKEN.",
    inputSchema: {
      user_id: z.number().int().positive(),
    },
  },
  async ({ user_id }) => {
    try {
      await ensureAuthenticatedUser(user_id);
      const response = await apiRequest({
        method: "get",
        url: "/orders",
      });

      return successResult({
        requested_user_id: user_id,
        backend_response: response.data,
      });
    } catch (error) {
      return errorResult(error);
    }
  },
);

server.registerTool(
  "getOrderDetails",
  {
    title: "Get Order Details",
    description:
      "Fetch a single order for the authenticated user. Requires LARAVEL_API_TOKEN.",
    inputSchema: {
      user_id: z.number().int().positive(),
      order_id: z.number().int().positive(),
    },
  },
  async ({ user_id, order_id }) => {
    try {
      await ensureAuthenticatedUser(user_id);
      const response = await apiRequest({
        method: "get",
        url: `/orders/${order_id}`,
      });

      return successResult({
        requested_user_id: user_id,
        order_id,
        backend_response: response.data,
      });
    } catch (error) {
      return errorResult(error);
    }
  },
);

server.registerTool(
  "placeOrder",
  {
    title: "Place Order",
    description:
      "Create an order directly from the authenticated user's cart. Requires LARAVEL_API_TOKEN.",
    inputSchema: {
      user_id: z.number().int().positive(),
      payment_id: z.string().trim().min(1).optional(),
    },
  },
  async ({ user_id, payment_id }) => {
    try {
      await ensureAuthenticatedUser(user_id);
      const response = await apiRequest({
        method: "post",
        url: "/orders",
        data: payment_id ? { payment_id } : {},
      });

      return successResult({
        requested_user_id: user_id,
        backend_response: response.data,
      });
    } catch (error) {
      return errorResult(error);
    }
  },
);

server.registerTool(
  "getSubscriptionPlans",
  {
    title: "Get Subscription Plans",
    description: "Fetch the bookstore subscription plans from Laravel.",
    inputSchema: {},
  },
  async () => {
    try {
      const response = await apiRequest({
        method: "get",
        url: "/plans",
      });

      return successResult({
        backend_response: response.data,
      });
    } catch (error) {
      return errorResult(error);
    }
  },
);

server.registerTool(
  "startSubscriptionCheckout",
  {
    title: "Start Subscription Checkout",
    description:
      "Start or change a subscription for the authenticated user. Requires LARAVEL_API_TOKEN.",
    inputSchema: {
      user_id: z.number().int().positive(),
      plan: z.enum(["free", "premium", "ultimate"]),
      billing_cycle: z.enum(["monthly", "yearly"]),
    },
  },
  async ({ user_id, plan, billing_cycle }) => {
    try {
      await ensureAuthenticatedUser(user_id);
      const response = await apiRequest({
        method: "post",
        url: "/subscription/checkout",
        data: {
          plan,
          billing_cycle,
        },
      });

      return successResult({
        requested_user_id: user_id,
        plan,
        billing_cycle,
        backend_response: response.data,
      });
    } catch (error) {
      return errorResult(error);
    }
  },
);

server.registerTool(
  "cancelSubscription",
  {
    title: "Cancel Subscription",
    description:
      "Cancel the authenticated user's active subscription at period end. Requires LARAVEL_API_TOKEN.",
    inputSchema: {
      user_id: z.number().int().positive(),
    },
  },
  async ({ user_id }) => {
    try {
      await ensureAuthenticatedUser(user_id);
      const response = await apiRequest({
        method: "post",
        url: "/subscription/cancel",
      });

      return successResult({
        requested_user_id: user_id,
        backend_response: response.data,
      });
    } catch (error) {
      return errorResult(error);
    }
  },
);

server.registerTool(
  "resumeSubscription",
  {
    title: "Resume Subscription",
    description:
      "Resume a subscription in grace period for the authenticated user. Requires LARAVEL_API_TOKEN.",
    inputSchema: {
      user_id: z.number().int().positive(),
    },
  },
  async ({ user_id }) => {
    try {
      await ensureAuthenticatedUser(user_id);
      const response = await apiRequest({
        method: "post",
        url: "/subscription/resume",
      });

      return successResult({
        requested_user_id: user_id,
        backend_response: response.data,
      });
    } catch (error) {
      return errorResult(error);
    }
  },
);

server.registerTool(
  "getWishlist",
  {
    title: "Get Wishlist",
    description:
      "Fetch the authenticated user's wishlist. Requires LARAVEL_API_TOKEN.",
    inputSchema: {
      user_id: z.number().int().positive(),
    },
  },
  async ({ user_id }) => {
    try {
      await ensureAuthenticatedUser(user_id);
      const response = await apiRequest({
        method: "get",
        url: "/wishlist",
      });

      return successResult({
        requested_user_id: user_id,
        backend_response: response.data,
      });
    } catch (error) {
      return errorResult(error);
    }
  },
);

server.registerTool(
  "toggleWishlist",
  {
    title: "Toggle Wishlist",
    description:
      "Add or remove a book from the authenticated user's wishlist. Requires LARAVEL_API_TOKEN.",
    inputSchema: {
      user_id: z.number().int().positive(),
      book_id: z.number().int().positive(),
    },
  },
  async ({ user_id, book_id }) => {
    try {
      await ensureAuthenticatedUser(user_id);
      const response = await apiRequest({
        method: "post",
        url: "/wishlist/toggle",
        data: { book_id },
      });

      return successResult({
        requested_user_id: user_id,
        book_id,
        backend_response: response.data,
      });
    } catch (error) {
      return errorResult(error);
    }
  },
);

server.registerTool(
  "getLibrary",
  {
    title: "Get Library",
    description:
      "Fetch the authenticated user's library. Requires LARAVEL_API_TOKEN.",
    inputSchema: {
      user_id: z.number().int().positive(),
    },
  },
  async ({ user_id }) => {
    try {
      await ensureAuthenticatedUser(user_id);
      const response = await apiRequest({
        method: "get",
        url: "/library",
      });

      return successResult({
        requested_user_id: user_id,
        backend_response: response.data,
      });
    } catch (error) {
      return errorResult(error);
    }
  },
);

server.registerTool(
  "addToLibrary",
  {
    title: "Add To Library",
    description:
      "Add a book format directly to the authenticated user's library. Requires LARAVEL_API_TOKEN.",
    inputSchema: {
      user_id: z.number().int().positive(),
      book_id: z.number().int().positive(),
      format: z.enum(["ebook", "audio", "paperback"]).optional(),
    },
  },
  async ({ user_id, book_id, format }) => {
    try {
      await ensureAuthenticatedUser(user_id);
      const selectedFormat =
        format ?? (await resolveDefaultFormat(book_id, ["ebook", "audio", "paperback"]));

      const response = await apiRequest({
        method: "post",
        url: `/library/add/${book_id}`,
        data: { format: selectedFormat },
      });

      return successResult({
        requested_user_id: user_id,
        book_id,
        selected_format: selectedFormat,
        backend_response: response.data,
      });
    } catch (error) {
      return errorResult(error);
    }
  },
);

server.registerTool(
  "rentBook",
  {
    title: "Rent Book",
    description:
      "Rent an ebook or audiobook for the authenticated user. Requires LARAVEL_API_TOKEN.",
    inputSchema: {
      user_id: z.number().int().positive(),
      book_id: z.number().int().positive(),
      format: z.enum(["ebook", "audio"]),
    },
  },
  async ({ user_id, book_id, format }) => {
    try {
      await ensureAuthenticatedUser(user_id);
      const endpoint =
        format === "ebook" ? `/ebook/rent/${book_id}` : `/audio/rent/${book_id}`;
      const response = await apiRequest({
        method: "post",
        url: endpoint,
      });

      return successResult({
        requested_user_id: user_id,
        book_id,
        format,
        backend_response: response.data,
      });
    } catch (error) {
      return errorResult(error);
    }
  },
);

async function searchBooks(query, maxPrice) {
  const response = await apiRequest({
    method: "get",
    url: "/products",
    params: {
      search: query,
      sort: "price_asc",
    },
  });

  const books = extractBooksCollection(response.data);
  const normalizedBooks = books
    .map(normalizeBookSummary)
    .filter((book) => (maxPrice == null ? true : book.best_price <= maxPrice));

  return {
    query,
    max_price: maxPrice ?? null,
    total_matches: normalizedBooks.length,
    books: normalizedBooks,
  };
}

async function getBookDetails(bookId) {
  const response = await apiRequest({
    method: "get",
    url: `/books/${bookId}`,
  });

  const bookPayload = response.data?.data ?? response.data;
  const book = bookPayload?.book ?? bookPayload;

  return {
    book_id: bookId,
    details: {
      book,
      reviews: bookPayload?.reviews ?? [],
      recommended_books: bookPayload?.recommended_books ?? [],
      recently_viewed: bookPayload?.recently_viewed ?? [],
    },
  };
}

async function resolveDefaultPurchase(bookId) {
  const details = await getBookDetails(bookId);
  const book = details?.details?.book;

  if (!book) {
    throw new Error(`Book ${bookId} was not returned by the backend.`);
  }

  const candidates = [
    {
      format: "ebook",
      enabled: Boolean(book.has_ebook),
      price: toNullableNumber(book.ebook_price),
    },
    {
      format: "audio",
      enabled: Boolean(book.has_audio),
      price: toNullableNumber(book.audio_price),
    },
    {
      format: "paperback",
      enabled: Boolean(book.has_paperback),
      price: toNullableNumber(book.paperback_price),
    },
  ]
    .filter((item) => item.enabled && item.price != null)
    .sort((left, right) => left.price - right.price);

  if (candidates.length > 0) {
    return candidates[0];
  }

  const fallbackPrice = toNullableNumber(book.price);
  if (fallbackPrice != null) {
    return {
      format: "paperback",
      price: fallbackPrice,
    };
  }

  throw new Error(
    `Book ${bookId} does not expose any purchasable format with a valid price.`,
  );
}

async function resolveDefaultFormat(bookId, allowedFormats) {
  const details = await getBookDetails(bookId);
  const book = details?.details?.book;

  if (!book) {
    throw new Error(`Book ${bookId} was not returned by the backend.`);
  }

  const availableFormats = [
    { format: "ebook", enabled: Boolean(book.has_ebook) },
    { format: "audio", enabled: Boolean(book.has_audio) },
    { format: "paperback", enabled: Boolean(book.has_paperback) },
  ]
    .filter((item) => item.enabled && allowedFormats.includes(item.format))
    .map((item) => item.format);

  if (availableFormats.length === 0) {
    throw new Error(
      `Book ${bookId} does not expose any allowed format in [${allowedFormats.join(", ")}].`,
    );
  }

  return availableFormats[0];
}

async function ensureAuthenticatedUser(expectedUserId) {
  requireApiToken();

  if (!authenticatedUserPromise) {
    authenticatedUserPromise = apiRequest({
      method: "get",
      url: "/user",
    })
      .then((response) => response.data?.user ?? response.data?.data?.user)
      .catch((error) => {
        authenticatedUserPromise = null;
        throw error;
      });
  }

  const user = await authenticatedUserPromise;
  if (!user?.id) {
    throw new Error(
      "Laravel did not return the authenticated user. Check your Sanctum token.",
    );
  }

  if (Number(user.id) !== Number(expectedUserId)) {
    throw new Error(
      `Configured API token belongs to user ${user.id}, but the tool call requested user ${expectedUserId}.`,
    );
  }

  return user;
}

function normalizeBookSummary(book) {
  const prices = {
    ebook: toNullableNumber(book.ebook_price),
    audio: toNullableNumber(book.audio_price),
    paperback: toNullableNumber(book.paperback_price),
    fallback: toNullableNumber(book.price),
  };

  const priceCandidates = [prices.ebook, prices.audio, prices.paperback].filter(
    (value) => value != null,
  );
  const bestPrice =
    priceCandidates.length > 0
      ? Math.min(...priceCandidates)
      : prices.fallback ?? 0;

  return {
    id: book.id,
    name: book.name,
    description: book.description,
    language: book.language,
    image: book.image,
    author: book.author ?? null,
    category: book.category ?? null,
    prices,
    best_price: bestPrice,
    formats: {
      ebook: Boolean(book.has_ebook),
      audio: Boolean(book.has_audio),
      paperback: Boolean(book.has_paperback),
    },
    stock: book.stock ?? null,
    is_premium: Boolean(book.is_premium),
  };
}

function extractBooksCollection(payload) {
  const books =
    payload?.data?.books?.data ??
    payload?.data?.books ??
    payload?.books?.data ??
    payload?.books ??
    [];

  if (!Array.isArray(books)) {
    throw new Error("Unexpected books response shape returned by Laravel.");
  }

  return books;
}

async function apiRequest(config) {
  try {
    return await http.request(config);
  } catch (error) {
    throw buildApiError(error);
  }
}

function buildApiError(error) {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data;
    const backendMessage =
      data?.message ||
      data?.error ||
      (typeof data === "string" ? data : null) ||
      error.message;

    const message = status
      ? `Laravel API request failed with status ${status}: ${backendMessage}`
      : `Laravel API request failed: ${backendMessage}`;

    const wrapped = new Error(message);
    wrapped.name = "LaravelApiError";
    wrapped.cause = {
      status: status ?? null,
      response: data ?? null,
    };
    return wrapped;
  }

  return error instanceof Error ? error : new Error(String(error));
}

function successResult(payload) {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(payload, null, 2),
      },
    ],
    structuredContent: payload,
  };
}

function errorResult(error) {
  const message =
    error instanceof Error ? error.message : "Unknown MCP server error.";
  const details =
    error instanceof Error && "cause" in error && error.cause
      ? { cause: error.cause }
      : {};

  return {
    isError: true,
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            error: message,
            ...details,
          },
          null,
          2,
        ),
      },
    ],
  };
}

function requireApiToken() {
  if (!API_TOKEN) {
    throw new Error(
      "This tool requires LARAVEL_API_TOKEN because the Laravel cart endpoints are protected by Sanctum.",
    );
  }
}

function normalizeBaseUrl(value) {
  return value.replace(/\/+$/, "");
}

function parsePositiveInteger(value, fallback) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function toNullableNumber(value) {
  if (value == null || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(
    `${APP_NAME} is running over stdio against ${API_BASE_URL}`,
  );
}

main().catch((error) => {
  console.error("Failed to start MCP server:", error);
  process.exit(1);
});
