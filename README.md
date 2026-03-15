<div align="center">

# TeamSpeak 3 MCP Server

**Let AI models manage your TeamSpeak 3 server through the Model Context Protocol.**

[![npm version](https://img.shields.io/npm/v/teamspeak3-mcp?color=cb0000&logo=npm)](https://www.npmjs.com/package/teamspeak3-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MCP SDK](https://img.shields.io/badge/MCP_SDK-1.9-blueviolet)](https://modelcontextprotocol.io/)
[![zread](https://img.shields.io/badge/Ask_Zread-_.svg?style=flat&color=00b0aa&labelColor=000000&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQuOTYxNTYgMS42MDAxSDIuMjQxNTZDMS44ODgxIDEuNjAwMSAxLjYwMTU2IDEuODg2NjQgMS42MDE1NiAyLjI0MDFWNC45NjAxQzEuNjAxNTYgNS4zMTM1NiAxLjg4ODEgNS42MDAxIDIuMjQxNTYgNS42MDAxSDQuOTYxNTZDNS4zMTUwMiA1LjYwMDEgNS42MDE1NiA1LjMxMzU2IDUuNjAxNTYgNC45NjAxVjIuMjQwMUM1LjYwMTU2IDEuODg2NjQgNS4zMTUwMiAxLjYwMDEgNC45NjE1NiAxLjYwMDFaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00Ljk2MTU2IDEwLjM5OTlIMi4yNDE1NkMxLjg4ODEgMTAuMzk5OSAxLjYwMTU2IDEwLjY4NjQgMS42MDE1NiAxMS4wMzk5VjEzLjc1OTlDMS42MDE1NiAxNC4xMTM0IDEuODg4MSAxNC4zOTk5IDIuMjQxNTYgMTQuMzk5OUg0Ljk2MTU2QzUuMzE1MDIgMTQuMzk5OSA1LjYwMTU2IDE0LjExMzQgNS42MDE1NiAxMy43NTk5VjExLjAzOTlDNS42MDE1NiAxMC42ODY0IDUuMzE1MDIgMTAuMzk5OSA0Ljk2MTU2IDEwLjM5OTlaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik0xMy43NTg0IDEuNjAwMUgxMS4wMzg0QzEwLjY4NSAxLjYwMDEgMTAuMzk4NCAxLjg4NjY0IDEwLjM5ODQgMi4yNDAxVjQuOTYwMUMxMC4zOTg0IDUuMzEzNTYgMTAuNjg1IDUuNjAwMSAxMS4wMzg0IDUuNjAwMUgxMy43NTg0QzE0LjExMTkgNS42MDAxIDE0LjM5ODQgNS4zMTM1NiAxNC4zOTg0IDQuOTYwMVYyLjI0MDFDMTQuMzk4NCAxLjg4NjY0IDE0LjExMTkgMS42MDAxIDEzLjc1ODQgMS42MDAxWiIgZmlsbD0iI2ZmZiIvPgo8cGF0aCBkPSJNNCAxMkwxMiA0TDQgMTJaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00IDEyTDEyIDQiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K&logoColor=ffffff)](https://zread.ai/fl0w1nd/teamspeak3-mcp)

[English](README.md) · [中文](README.zh-CN.md)

</div>

---

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that exposes TeamSpeak 3 ServerQuery operations as AI-callable tools. Connect Claude, Cursor, or any MCP-compatible client to manage your TeamSpeak server with natural language.

## Features

- **35 purpose-built tools** covering server management, channels, clients, groups, permissions, moderation, and more
- **Lazy connection** — connects to TeamSpeak only when the first tool is invoked
- **Exponential backoff retry** — automatic reconnection with up to 3 attempts
- **Graceful shutdown** — cleans up the ServerQuery session on process exit
- **Centralized error handling** — every tool returns structured MCP error responses
- **Zero-config transport** — runs over `stdio`, works out-of-the-box with any MCP client

## Requirements

- **Node.js** >= 18
- A TeamSpeak 3 server with **ServerQuery** access (port `10011` by default)

## Getting Started

Add the following to your MCP client configuration. This works with most clients:

```json
{
  "mcpServers": {
    "teamspeak": {
      "command": "npx",
      "args": ["teamspeak3-mcp"],
      "env": {
        "TEAMSPEAK_HOST": "your-server.com",
        "TEAMSPEAK_PASSWORD": "your-password"
      }
    }
  }
}
```

No installation needed — `npx` downloads and runs the package automatically.

### Claude Desktop

Add to your Claude Desktop config file (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "teamspeak": {
      "command": "npx",
      "args": ["teamspeak3-mcp"],
      "env": {
        "TEAMSPEAK_HOST": "your-server.com",
        "TEAMSPEAK_PASSWORD": "your-password"
      }
    }
  }
}
```

### Cursor

Add to your Cursor MCP settings (`.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "teamspeak": {
      "command": "npx",
      "args": ["teamspeak3-mcp"],
      "env": {
        "TEAMSPEAK_HOST": "your-server.com",
        "TEAMSPEAK_PASSWORD": "your-password"
      }
    }
  }
}
```

## Configuration

Configuration is resolved from **CLI arguments** first, then **environment variables**, with sensible defaults as fallback.

| Parameter | CLI Flag | Env Variable | Default |
|---|---|---|---|
| Host | `--host` | `TEAMSPEAK_HOST` | `localhost` |
| Query Port | `--port` | `TEAMSPEAK_PORT` | `10011` |
| Username | `--user` | `TEAMSPEAK_USER` | `serveradmin` |
| Password | `--password` | `TEAMSPEAK_PASSWORD` | *(required)* |
| Virtual Server ID | `--server-id` | `TEAMSPEAK_SERVER_ID` | `1` |
| Enabled Tools | `--tools` | `TEAMSPEAK_TOOLS` | *(all)* |

### Selective Tool Loading

By default all 35 tools are registered. Use `TEAMSPEAK_TOOLS` (or `--tools`) with a comma-separated list of module names to load only what you need — useful for reducing the tool list exposed to the AI model:

```json
{
  "mcpServers": {
    "teamspeak": {
      "command": "npx",
      "args": ["teamspeak3-mcp"],
      "env": {
        "TEAMSPEAK_HOST": "your-server.com",
        "TEAMSPEAK_PASSWORD": "your-password",
        "TEAMSPEAK_TOOLS": "server,channel,client"
      }
    }
  }
}
```

Available modules: `server`, `channel`, `client`, `sgroup`, `cgroup`, `permission`, `messaging`, `moderation`, `token`, `file`

## Tools Reference

### Server (`server_*`)

| Tool | Description |
|---|---|
| `server_info` | Get server details (scope: `overview` or `connection` statistics) |
| `server_list` | List resources (resource: `clients`, `channels`, `server_groups`, `channel_groups`) |
| `server_search` | Search for clients or channels by pattern |
| `server_log` | View recent virtual server or instance log entries |
| `server_diagnose` | Run a diagnostic check on the current connection's permissions |

### Channel (`channel_*`)

| Tool | Description |
|---|---|
| `channel_create` | Create a new channel (permanent or temporary) |
| `channel_delete` | Delete a channel (with optional force flag) |
| `channel_update` | Update channel properties (name, password, codec, talk power, etc.) |
| `channel_info` | Get detailed channel information |
| `channel_perm` | Add, remove, or list permissions on a channel |

### Client (`client_*`)

| Tool | Description |
|---|---|
| `client_info` | Get detailed info: platform, version, country, IP, idle time, etc. |
| `client_move` | Move a client to another channel |
| `client_kick` | Kick a client from the server or channel |
| `client_ban` | Ban a client (timed or permanent) |
| `client_perm` | Manage server group membership and individual permissions |
| `client_db_list` | List historical clients from the server database (includes offline clients) |
| `client_poke` | Send a poke alert notification to a client |

### Server Group (`sgroup_*`)

| Tool | Description |
|---|---|
| `sgroup_create` | Create a new server group |
| `sgroup_delete` | Delete a server group |
| `sgroup_perm` | Add, remove, or list permissions on a server group |
| `sgroup_clients` | List all clients assigned to a server group |

### Channel Group (`cgroup_*`)

| Tool | Description |
|---|---|
| `cgroup_create` | Create a new channel group |
| `cgroup_perm` | Add, remove, or list permissions on a channel group |
| `cgroup_assign` | Assign a client to a channel group in a specific channel |

### Permission (`perm_*`)

| Tool | Description |
|---|---|
| `perm_list` | List all available permission definitions (name, ID, description) |
| `perm_find` | Find all assignments of a permission across the server |
| `perm_overview` | Get effective permission overview for a client in a channel |

### Messaging (`msg_*`)

| Tool | Description |
|---|---|
| `msg_send` | Send a text message (mode: `channel` or `private`) |

### Moderation (`ban_*` / `complaint_*`)

| Tool | Description |
|---|---|
| `ban_list` | List all active ban rules |
| `ban_manage` | Create, delete, or clear ban rules by IP/name/UID |
| `complaint_list` | List complaints (optionally filtered by target client) |

### Tokens (`token_*`)

| Tool | Description |
|---|---|
| `token_list` | List all available privilege keys/tokens |
| `token_create` | Create a server group or channel group token |

### Files (`file_*`)

| Tool | Description |
|---|---|
| `file_list` | List files in a channel's file repository |
| `file_info` | Get detailed info about a specific file |

## Development

```bash
git clone https://github.com/fl0w1nd/teamspeak3-mcp.git
cd teamspeak3-mcp
pnpm install

pnpm build          # Build the project
pnpm dev            # Watch mode (auto-rebuild on changes)
pnpm inspect        # Debug with MCP Inspector (web UI)
```

### MCP Inspector

The project includes a pre-configured script for the [MCP Inspector](https://github.com/modelcontextprotocol/inspector), a web-based debugging tool:

```bash
pnpm inspect
```

This launches a local web UI where you can browse available tools, invoke them interactively, and inspect request/response payloads — useful for development and troubleshooting.

### Project Structure

```
src/
├── index.ts             # Entry point, stdio transport, graceful shutdown
├── config.ts            # CLI + env configuration parsing
├── connection.ts        # TeamSpeak connection with retry & lazy init
├── server.ts            # MCP server setup & tool registration
├── utils/
│   └── tool-handler.ts  # Error handling & response utilities
└── tools/
    ├── server.ts        # Server info, resource listing, search, logs, diagnostics
    ├── channel.ts       # Channel CRUD & permissions
    ├── client.ts        # Client management, permissions & poke
    ├── server-group.ts  # Server group CRUD, permissions & members
    ├── channel-group.ts # Channel group CRUD, permissions & assignment
    ├── permission.ts    # Global permission queries & overview
    ├── messaging.ts     # Channel & private messaging
    ├── moderation.ts    # Bans & complaints
    ├── token.ts         # Privilege token management
    └── file.ts          # Channel file browser
```

## License

[MIT](LICENSE)
