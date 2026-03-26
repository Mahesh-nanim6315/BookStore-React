# Bookstore MCP Server

This folder contains the MCP server for the Laravel online bookstore backend.

It exposes these tools for MCP-compatible AI clients:

- `searchBooks`
- `getBookDetails`
- `addToCart`
- `getCart`
- `getOrders`
- `getOrderDetails`
- `placeOrder`
- `getSubscriptionPlans`
- `startSubscriptionCheckout`
- `cancelSubscription`
- `resumeSubscription`
- `getWishlist`
- `toggleWishlist`
- `getLibrary`
- `addToLibrary`
- `rentBook`

## What It Connects To

The server talks to your Laravel backend over REST using Axios.

Default API base URL:

```text
http://127.0.0.1:8000/api/v1
```

## Requirements

- Node.js 18+
- Laravel backend running locally
- A valid Sanctum token for cart actions

## Install

From this folder:

```bash
npm install
```

## Run

```bash
node mcp-server.js
```

You can also use:

```bash
npm start
```

## Environment Variables

The MCP server reads these environment variables:

- `LARAVEL_API_BASE_URL`
- `LARAVEL_API_TOKEN`
- `LARAVEL_API_TIMEOUT_MS`

Example values:

```text
LARAVEL_API_BASE_URL=http://127.0.0.1:8000/api/v1
LARAVEL_API_TOKEN=your-sanctum-token
LARAVEL_API_TIMEOUT_MS=15000
```

## Claude Desktop Setup

Use the example config in [claude-desktop-config.example.json](/d:/BookStore-React/mcp/claude-desktop-config.example.json).

Example:

```json
{
  "mcpServers": {
    "bookstore-laravel": {
      "command": "node",
      "args": ["D:\\BookStore-React\\mcp\\mcp-server.js"],
      "env": {
        "LARAVEL_API_BASE_URL": "http://127.0.0.1:8000/api/v1",
        "LARAVEL_API_TOKEN": "paste-a-valid-sanctum-token-here",
        "LARAVEL_API_TIMEOUT_MS": "15000"
      }
    }
  }
}
```

After saving the config, restart Claude Desktop.

## Cursor Setup

Add the same MCP server command in Cursor's MCP settings.

Use:

- Command: `node`
- Args: `D:\BookStore-React\mcp\mcp-server.js`

Set these environment variables in Cursor:

- `LARAVEL_API_BASE_URL=http://127.0.0.1:8000/api/v1`
- `LARAVEL_API_TOKEN=your-sanctum-token`
- `LARAVEL_API_TIMEOUT_MS=15000`

## Tool Notes

### `searchBooks`

- Accepts: `query`, optional `max_price`
- Calls Laravel product search and filters results by price

### `getBookDetails`

- Accepts: `book_id`
- Fetches a single book from Laravel

### `addToCart`

- Accepts: `user_id`, `book_id`
- Requires `LARAVEL_API_TOKEN`
- Verifies the token belongs to the requested user
- Automatically chooses the cheapest available purchasable format

### `getCart`

- Accepts: `user_id`
- Requires `LARAVEL_API_TOKEN`
- Returns the authenticated user's cart

### `getOrders`

- Accepts: `user_id`
- Requires `LARAVEL_API_TOKEN`
- Returns the authenticated user's order list

### `getOrderDetails`

- Accepts: `user_id`, `order_id`
- Requires `LARAVEL_API_TOKEN`
- Returns a single authenticated order

### `placeOrder`

- Accepts: `user_id`, optional `payment_id`
- Requires `LARAVEL_API_TOKEN`
- Places an order from the user's current cart

### `getSubscriptionPlans`

- No input required
- Returns the public bookstore subscription plans

### `startSubscriptionCheckout`

- Accepts: `user_id`, `plan`, `billing_cycle`
- Requires `LARAVEL_API_TOKEN`
- Starts or changes a subscription using the Laravel subscription flow

### `cancelSubscription`

- Accepts: `user_id`
- Requires `LARAVEL_API_TOKEN`
- Cancels the active subscription at the end of the billing period

### `resumeSubscription`

- Accepts: `user_id`
- Requires `LARAVEL_API_TOKEN`
- Resumes a subscription that is in its grace period

### `getWishlist`

- Accepts: `user_id`
- Requires `LARAVEL_API_TOKEN`
- Returns the user's wishlist

### `toggleWishlist`

- Accepts: `user_id`, `book_id`
- Requires `LARAVEL_API_TOKEN`
- Adds or removes a book from wishlist

### `getLibrary`

- Accepts: `user_id`
- Requires `LARAVEL_API_TOKEN`
- Returns the user's library items

### `addToLibrary`

- Accepts: `user_id`, `book_id`, optional `format`
- Requires `LARAVEL_API_TOKEN`
- Adds a format directly to the user's library

### `rentBook`

- Accepts: `user_id`, `book_id`, `format`
- Requires `LARAVEL_API_TOKEN`
- Supports `ebook` and `audio` rentals

## Important Backend Note

Your Laravel backend uses authenticated cart routes under `/api/v1/cart`.

That means:

- `searchBooks` and `getBookDetails` can work without a token if the backend allows them
- `addToCart` and `getCart` need a valid Sanctum token

## Files In This Folder

- [mcp-server.js](/d:/BookStore-React/mcp/mcp-server.js)
- [package.json](/d:/BookStore-React/mcp/package.json)
- [package-lock.json](/d:/BookStore-React/mcp/package-lock.json)
- [claude-desktop-config.example.json](/d:/BookStore-React/mcp/claude-desktop-config.example.json)
