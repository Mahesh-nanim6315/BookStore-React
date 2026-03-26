# Bookstore AI Chat Client

This service is the AI agent controller for your bookstore assistant.

It does three things:

1. Receives chat requests from the React UI
2. Uses Ollama (`llama3`) to decide whether a tool is needed
3. Calls the existing MCP server over stdio using the MCP SDK client

## Structure

```text
mcp-client/
  agent/
    agentController.js
  services/
    ollamaService.js
    toolExecutor.js
  utils/
    parser.js
  .env.example
  index.js
  package.json
```

## Install

```bash
cd D:\BookStore-React\mcp-client
npm install
```

## Environment

Copy `.env.example` to `.env` and set values:

```text
PORT=8787
OLLAMA_URL=http://localhost:11434/api/chat
OLLAMA_MODEL=llama3
OLLAMA_TIMEOUT_MS=60000
AGENT_ALLOWED_ORIGIN=http://localhost:5173
MCP_SERVER_COMMAND=node
MCP_SERVER_SCRIPT=../mcp/mcp-server.js
MCP_TOOL_TIMEOUT_MS=30000
LARAVEL_API_BASE_URL=http://127.0.0.1:8000/api/v1
LARAVEL_API_TOKEN=your-sanctum-token
LARAVEL_API_TIMEOUT_MS=15000
```

## Run

Start Ollama first:

```bash
ollama run llama3
```

Then start the agent client:

```bash
cd D:\BookStore-React\mcp-client
npm start
```

Health check:

```bash
http://localhost:8787/health
```

Chat endpoint:

```text
POST http://localhost:8787/api/chat
```

## System Prompt Design

The agent forces the LLM to return JSON only in one of these shapes:

```json
{"tool":"searchBooks","input":{"query":"harry potter"}}
```

or

```json
{"tool":"none","response":"Here are a few Harry Potter books you may like..."}
```

This keeps tool calling deterministic even though Ollama does not support native function calling.
