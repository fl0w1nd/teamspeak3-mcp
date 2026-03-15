<div align="center">

# TeamSpeak 3 MCP Server

**通过 Model Context Protocol，让 AI 模型管理你的 TeamSpeak 3 服务器。**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MCP SDK](https://img.shields.io/badge/MCP_SDK-1.9-blueviolet)](https://modelcontextprotocol.io/)

[English](README.md) · [中文](README.zh-CN.md)

</div>

---

一个 [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) 服务器，将 TeamSpeak 3 ServerQuery 操作暴露为 AI 可调用的工具。连接 Claude、Cursor 或任何兼容 MCP 的客户端，即可通过自然语言管理你的 TeamSpeak 服务器。

## 特性

- **31 个精心设计的工具** — 覆盖服务器管理、频道、客户端、权限、审核等
- **延迟连接** — 仅在首次调用工具时才连接 TeamSpeak
- **指数退避重试** — 自动重连，最多尝试 3 次
- **优雅关闭** — 进程退出时自动清理 ServerQuery 会话
- **统一错误处理** — 所有工具均返回结构化的 MCP 错误响应
- **零配置传输** — 基于 `stdio` 运行，开箱即用

## 前提条件

- **Node.js** >= 18
- **pnpm**（推荐）或 npm
- 一个启用了 **ServerQuery** 的 TeamSpeak 3 服务器（默认端口 `10011`）

## 快速开始

```bash
# 克隆仓库
git clone https://github.com/fl0w1nd/teamspeak3-mcp.git
cd teamspeak3-mcp

# 安装依赖
pnpm install

# 构建
pnpm build

# 运行（通过环境变量配置）
TEAMSPEAK_HOST=your-server.com \
TEAMSPEAK_PASSWORD=your-password \
pnpm start
```

## 配置

配置优先级：**命令行参数** > **环境变量** > **默认值**。

| 参数 | 命令行标志 | 环境变量 | 默认值 |
|---|---|---|---|
| 服务器地址 | `--host` | `TEAMSPEAK_HOST` | `localhost` |
| 查询端口 | `--port` | `TEAMSPEAK_PORT` | `10011` |
| 用户名 | `--user` | `TEAMSPEAK_USER` | `serveradmin` |
| 密码 | `--password` | `TEAMSPEAK_PASSWORD` | *（必填）* |
| 虚拟服务器 ID | `--server-id` | `TEAMSPEAK_SERVER_ID` | `1` |

也可以复制示例配置文件：

```bash
cp config.example.env .env
```

## MCP 客户端集成

### Claude Desktop

在 Claude Desktop 配置文件（`claude_desktop_config.json`）中添加：

```json
{
  "mcpServers": {
    "teamspeak": {
      "command": "node",
      "args": ["/absolute/path/to/teamspeak3-mcp/dist/index.js"],
      "env": {
        "TEAMSPEAK_HOST": "your-server.com",
        "TEAMSPEAK_PORT": "10011",
        "TEAMSPEAK_USER": "serveradmin",
        "TEAMSPEAK_PASSWORD": "your-password",
        "TEAMSPEAK_SERVER_ID": "1"
      }
    }
  }
}
```

### Cursor

在 Cursor MCP 配置（`.cursor/mcp.json`）中添加：

```json
{
  "mcpServers": {
    "teamspeak": {
      "command": "node",
      "args": ["/absolute/path/to/teamspeak3-mcp/dist/index.js"],
      "env": {
        "TEAMSPEAK_HOST": "your-server.com",
        "TEAMSPEAK_PASSWORD": "your-password"
      }
    }
  }
}
```

### 命令行参数

也可以通过命令行参数传递凭据（优先级高于环境变量）：

```json
{
  "mcpServers": {
    "teamspeak": {
      "command": "node",
      "args": [
        "/absolute/path/to/teamspeak3-mcp/dist/index.js",
        "--host", "your-server.com",
        "--password", "your-password"
      ]
    }
  }
}
```

## 工具一览

### 核心

| 工具 | 描述 |
|---|---|
| `server_info` | 获取服务器名称、版本、平台、在线人数、运行时间等 |
| `list_clients` | 列出所有在线客户端及其 ID、昵称和所在频道 |
| `list_channels` | 列出服务器上的所有频道 |

### 消息

| 工具 | 描述 |
|---|---|
| `send_channel_message` | 向频道发送文字消息 |
| `send_private_message` | 向指定客户端发送私信 |
| `poke_client` | 向客户端发送戳一戳提醒 |

### 频道管理

| 工具 | 描述 |
|---|---|
| `create_channel` | 创建新频道（永久或临时） |
| `delete_channel` | 删除频道（可强制删除） |
| `update_channel` | 更新频道属性（名称、密码、编解码器、语音权限等） |
| `channel_info` | 获取频道详细信息 |
| `manage_channel_permissions` | 添加、删除或列出频道权限 |

### 客户端管理

| 工具 | 描述 |
|---|---|
| `move_client` | 将客户端移动到另一个频道 |
| `kick_client` | 将客户端踢出服务器或频道 |
| `ban_client` | 封禁客户端（限时或永久） |
| `client_info_detailed` | 获取客户端详细信息：平台、版本、国家、IP、空闲时间等 |
| `manage_user_permissions` | 管理用户的服务器组和个人权限 |
| `diagnose_permissions` | 诊断当前连接的权限状态 |

### 服务器组

| 工具 | 描述 |
|---|---|
| `list_server_groups` | 列出所有服务器组 |
| `create_server_group` | 创建新的服务器组 |
| `manage_server_group_permissions` | 添加、删除或列出服务器组权限 |

### 审核

| 工具 | 描述 |
|---|---|
| `list_bans` | 列出所有生效的封禁规则 |
| `manage_ban_rules` | 按 IP/名称/UID 创建、删除或清除封禁规则 |
| `list_complaints` | 列出投诉记录（可按目标客户端筛选） |

### 搜索

| 工具 | 描述 |
|---|---|
| `search_clients` | 按名称或唯一标识符搜索客户端 |
| `find_channels` | 按名称模式搜索频道 |

### 权限令牌

| 工具 | 描述 |
|---|---|
| `list_privilege_tokens` | 列出所有可用的权限令牌 |
| `create_privilege_token` | 创建服务器组或频道组令牌 |

### 文件浏览

| 工具 | 描述 |
|---|---|
| `list_files` | 列出频道文件仓库中的文件 |
| `get_file_info` | 获取指定文件的详细信息 |

### 日志与诊断

| 工具 | 描述 |
|---|---|
| `view_server_logs` | 查看虚拟服务器或实例的最近日志 |
| `get_connection_info` | 获取服务器连接统计信息 |

## 开发

```bash
# 安装依赖
pnpm install

# 构建项目
pnpm build

# 监听模式（修改后自动重新构建）
pnpm dev

# 使用 MCP Inspector 调试（Web UI）
pnpm inspect
```

### MCP Inspector

项目预配置了 [MCP Inspector](https://github.com/modelcontextprotocol/inspector) 调试工具脚本：

```bash
pnpm inspect
```

启动后会打开一个本地 Web 界面，你可以浏览所有可用工具、交互式调用它们、检查请求/响应数据 — 适合开发和排查问题。

### 项目结构

```
src/
├── index.ts           # 入口文件、stdio 传输、优雅关闭
├── config.ts          # 命令行 + 环境变量配置解析
├── connection.ts      # TeamSpeak 连接（重试 + 延迟初始化）
├── server.ts          # MCP 服务器创建与工具注册
├── utils/
│   └── tool-handler.ts  # 错误处理与响应工具函数
└── tools/
    ├── core.ts        # 服务器信息、客户端/频道列表
    ├── messaging.ts   # 频道/私人消息、戳一戳
    ├── channel.ts     # 频道增删改查 & 权限
    ├── client.ts      # 客户端管理 & 权限
    ├── server-group.ts # 服务器组管理
    ├── moderation.ts  # 封禁 & 投诉
    ├── search.ts      # 客户端/频道搜索
    ├── token.ts       # 权限令牌管理
    ├── file.ts        # 文件浏览
    └── logging.ts     # 服务器日志 & 连接信息
```

## 许可证

[MIT](LICENSE)
