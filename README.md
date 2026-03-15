<div align="center">

# TeamSpeak 3 MCP Server

**Let AI models manage your TeamSpeak 3 server through the Model Context Protocol.**

[![npm version](https://img.shields.io/npm/v/teamspeak3-mcp?color=cb0000&logo=npm)](https://www.npmjs.com/package/teamspeak3-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MCP SDK](https://img.shields.io/badge/MCP_SDK-1.9-blueviolet)](https://modelcontextprotocol.io/)

[English](README.md) · [中文](README.zh-CN.md)

</div>

---

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that exposes TeamSpeak 3 ServerQuery operations as AI-callable tools. Connect Claude, Cursor, or any MCP-compatible client to manage your TeamSpeak server with natural language.

## Features

- **31 purpose-built tools** covering server management, channels, clients, permissions, moderation, and more
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
      "args": [
        "teamspeak3-mcp",
        "--host", "your-server.com",
        "--password", "your-password"
      ]
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

## Tools Reference

### Core

| Tool | Description |
|---|---|
| `server_info` | Get server name, version, platform, client count, uptime, etc. |
| `list_clients` | List all connected clients with IDs, nicknames, and channels |
| `list_channels` | List all channels on the server |

### Messaging

| Tool | Description |
|---|---|
| `send_channel_message` | Send a text message to a channel |
| `send_private_message` | Send a private message to a specific client |
| `poke_client` | Send a poke alert notification to a client |

### Channel Management

| Tool | Description |
|---|---|
| `create_channel` | Create a new channel (permanent or temporary) |
| `delete_channel` | Delete a channel (with optional force flag) |
| `update_channel` | Update channel properties (name, password, codec, talk power, etc.) |
| `channel_info` | Get detailed channel information |
| `manage_channel_permissions` | Add, remove, or list permissions on a channel |

### Client Management

| Tool | Description |
|---|---|
| `move_client` | Move a client to another channel |
| `kick_client` | Kick a client from the server or channel |
| `ban_client` | Ban a client (timed or permanent) |
| `client_info_detailed` | Get detailed info: platform, version, country, IP, idle time, etc. |
| `manage_user_permissions` | Add/remove server groups and individual permissions for a client |
| `diagnose_permissions` | Run a diagnostic check on the current connection's permissions |

### Server Groups

| Tool | Description |
|---|---|
| `list_server_groups` | List all server groups |
| `create_server_group` | Create a new server group |
| `manage_server_group_permissions` | Add, remove, or list permissions on a server group |

### Moderation

| Tool | Description |
|---|---|
| `list_bans` | List all active ban rules |
| `manage_ban_rules` | Create, delete, or clear ban rules by IP/name/UID |
| `list_complaints` | List complaints (optionally filtered by target client) |

### Search

| Tool | Description |
|---|---|
| `search_clients` | Search for clients by name or unique identifier |
| `find_channels` | Search for channels by name pattern |

### Privilege Tokens

| Tool | Description |
|---|---|
| `list_privilege_tokens` | List all available privilege keys/tokens |
| `create_privilege_token` | Create a server group or channel group token |

### File Browser

| Tool | Description |
|---|---|
| `list_files` | List files in a channel's file repository |
| `get_file_info` | Get detailed info about a specific file |

### Logging & Diagnostics

| Tool | Description |
|---|---|
| `view_server_logs` | View recent virtual server or instance log entries |
| `get_connection_info` | Get detailed server connection statistics |

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
├── index.ts           # Entry point, stdio transport, graceful shutdown
├── config.ts          # CLI + env configuration parsing
├── connection.ts      # TeamSpeak connection with retry & lazy init
├── server.ts          # MCP server setup & tool registration
├── utils/
│   └── tool-handler.ts  # Error handling & response utilities
└── tools/
    ├── core.ts        # Server info, client/channel listing
    ├── messaging.ts   # Channel/private messaging, poke
    ├── channel.ts     # Channel CRUD & permissions
    ├── client.ts      # Client management & permissions
    ├── server-group.ts # Server group management
    ├── moderation.ts  # Bans & complaints
    ├── search.ts      # Client/channel search
    ├── token.ts       # Privilege token management
    ├── file.ts        # File browser
    └── logging.ts     # Server logs & connection info
```

## License

[MIT](LICENSE)
