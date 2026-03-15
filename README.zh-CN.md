<div align="center">

# TeamSpeak 3 MCP Server

**通过 Model Context Protocol，让 AI 模型管理你的 TeamSpeak 3 服务器。**

[![npm version](https://img.shields.io/npm/v/teamspeak3-mcp?color=cb0000&logo=npm)](https://www.npmjs.com/package/teamspeak3-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MCP SDK](https://img.shields.io/badge/MCP_SDK-1.9-blueviolet)](https://modelcontextprotocol.io/)
[![zread](https://img.shields.io/badge/Ask_Zread-_.svg?style=flat&color=00b0aa&labelColor=000000&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQuOTYxNTYgMS42MDAxSDIuMjQxNTZDMS44ODgxIDEuNjAwMSAxLjYwMTU2IDEuODg2NjQgMS42MDE1NiAyLjI0MDFWNC45NjAxQzEuNjAxNTYgNS4zMTM1NiAxLjg4ODEgNS42MDAxIDIuMjQxNTYgNS42MDAxSDQuOTYxNTZDNS4zMTUwMiA1LjYwMDEgNS42MDE1NiA1LjMxMzU2IDUuNjAxNTYgNC45NjAxVjIuMjQwMUM1LjYwMTU2IDEuODg2NjQgNS4zMTUwMiAxLjYwMDEgNC45NjE1NiAxLjYwMDFaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00Ljk2MTU2IDEwLjM5OTlIMi4yNDE1NkMxLjg4ODEgMTAuMzk5OSAxLjYwMTU2IDEwLjY4NjQgMS42MDE1NiAxMS4wMzk5VjEzLjc1OTlDMS42MDE1NiAxNC4xMTM0IDEuODg4MSAxNC4zOTk5IDIuMjQxNTYgMTQuMzk5OUg0Ljk2MTU2QzUuMzE1MDIgMTQuMzk5OSA1LjYwMTU2IDE0LjExMzQgNS42MDE1NiAxMy43NTk5VjExLjAzOTlDNS42MDE1NiAxMC42ODY0IDUuMzE1MDIgMTAuMzk5OSA0Ljk2MTU2IDEwLjM5OTlaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik0xMy43NTg0IDEuNjAwMUgxMS4wMzg0QzEwLjY4NSAxLjYwMDEgMTAuMzk4NCAxLjg4NjY0IDEwLjM5ODQgMi4yNDAxVjQuOTYwMUMxMC4zOTg0IDUuMzEzNTYgMTAuNjg1IDUuNjAwMSAxMS4wMzg0IDUuNjAwMUgxMy43NTg0QzE0LjExMTkgNS42MDAxIDE0LjM5ODQgNS4zMTM1NiAxNC4zOTg0IDQuOTYwMVYyLjI0MDFDMTQuMzk4NCAxLjg4NjY0IDE0LjExMTkgMS42MDAxIDEzLjc1ODQgMS42MDAxWiIgZmlsbD0iI2ZmZiIvPgo8cGF0aCBkPSJNNCAxMkwxMiA0TDQgMTJaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00IDEyTDEyIDQiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K&logoColor=ffffff)](https://zread.ai/fl0w1nd/teamspeak3-mcp)

[English](README.md) · [中文](README.zh-CN.md)

</div>

---

一个 [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) 服务器，将 TeamSpeak 3 ServerQuery 操作暴露为 AI 可调用的工具。连接 Claude、Cursor 或任何兼容 MCP 的客户端，即可通过自然语言管理你的 TeamSpeak 服务器。

## 特性

- **35 个精心设计的工具** — 覆盖服务器管理、频道、客户端、组、权限、审核等
- **延迟连接** — 仅在首次调用工具时才连接 TeamSpeak
- **指数退避重试** — 自动重连，最多尝试 3 次
- **优雅关闭** — 进程退出时自动清理 ServerQuery 会话
- **统一错误处理** — 所有工具均返回结构化的 MCP 错误响应
- **零配置传输** — 基于 `stdio` 运行，开箱即用

## 环境要求

- **Node.js** >= 18
- 一个启用了 **ServerQuery** 的 TeamSpeak 3 服务器（默认端口 `10011`）

## 快速开始

在你的 MCP 客户端配置中添加以下内容，适用于大多数客户端：

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

无需手动安装 — `npx` 会自动下载并运行。

### Claude Desktop

在 Claude Desktop 配置文件（`claude_desktop_config.json`）中添加：

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

在 Cursor MCP 配置（`.cursor/mcp.json`）中添加：

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

## 配置

配置优先级：**命令行参数** > **环境变量** > **默认值**。

| 参数 | 命令行标志 | 环境变量 | 默认值 |
|---|---|---|---|
| 服务器地址 | `--host` | `TEAMSPEAK_HOST` | `localhost` |
| 查询端口 | `--port` | `TEAMSPEAK_PORT` | `10011` |
| 用户名 | `--user` | `TEAMSPEAK_USER` | `serveradmin` |
| 密码 | `--password` | `TEAMSPEAK_PASSWORD` | *（必填）* |
| 虚拟服务器 ID | `--server-id` | `TEAMSPEAK_SERVER_ID` | `1` |
| 启用的工具 | `--tools` | `TEAMSPEAK_TOOLS` | *（全部）* |

### 按需加载工具

默认注册全部 35 个工具。可通过 `TEAMSPEAK_TOOLS`（或 `--tools`）指定逗号分隔的模块名，仅加载需要的工具 — 适合精简暴露给 AI 模型的工具列表：

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

可用模块：`server`、`channel`、`client`、`sgroup`、`cgroup`、`permission`、`messaging`、`moderation`、`token`、`file`

## 工具一览

### 服务器 (`server_*`)

| 工具 | 描述 |
|---|---|
| `server_info` | 获取服务器信息（scope: `overview` 概览 / `connection` 网络统计） |
| `server_list` | 列出资源（resource: `clients`, `channels`, `server_groups`, `channel_groups`） |
| `server_search` | 按模式搜索客户端或频道 |
| `server_log` | 查看虚拟服务器或实例的最近日志 |
| `server_diagnose` | 诊断当前连接的权限状态 |

### 频道 (`channel_*`)

| 工具 | 描述 |
|---|---|
| `channel_create` | 创建新频道（永久或临时） |
| `channel_delete` | 删除频道（可强制删除） |
| `channel_update` | 更新频道属性（名称、密码、编解码器、语音权限等） |
| `channel_info` | 获取频道详细信息 |
| `channel_perm` | 添加、删除或列出频道权限 |

### 客户端 (`client_*`)

| 工具 | 描述 |
|---|---|
| `client_info` | 获取客户端详细信息：平台、版本、国家、IP、空闲时间等 |
| `client_move` | 将客户端移动到另一个频道 |
| `client_kick` | 将客户端踢出服务器或频道 |
| `client_ban` | 封禁客户端（限时或永久） |
| `client_perm` | 管理服务器组成员资格和个人权限 |
| `client_db_list` | 列出服务器数据库中的历史客户端（包含离线客户端） |
| `client_poke` | 向客户端发送戳一戳提醒 |

### 服务器组 (`sgroup_*`)

| 工具 | 描述 |
|---|---|
| `sgroup_create` | 创建新的服务器组 |
| `sgroup_delete` | 删除服务器组 |
| `sgroup_perm` | 添加、删除或列出服务器组权限 |
| `sgroup_clients` | 列出服务器组中的所有成员 |

### 频道组 (`cgroup_*`)

| 工具 | 描述 |
|---|---|
| `cgroup_create` | 创建新的频道组 |
| `cgroup_perm` | 添加、删除或列出频道组权限 |
| `cgroup_assign` | 将客户端分配到指定频道的频道组 |

### 权限 (`perm_*`)

| 工具 | 描述 |
|---|---|
| `perm_list` | 列出所有可用权限定义（名称、ID、描述） |
| `perm_find` | 查找某个权限在服务器中的所有分配情况 |
| `perm_overview` | 获取客户端在指定频道的有效权限总览 |

### 消息 (`msg_*`)

| 工具 | 描述 |
|---|---|
| `msg_send` | 发送文字消息（mode: `channel` 频道 / `private` 私聊） |

### 审核 (`ban_*` / `complaint_*`)

| 工具 | 描述 |
|---|---|
| `ban_list` | 列出所有生效的封禁规则 |
| `ban_manage` | 按 IP/名称/UID 创建、删除或清除封禁规则 |
| `complaint_list` | 列出投诉记录（可按目标客户端筛选） |

### 令牌 (`token_*`)

| 工具 | 描述 |
|---|---|
| `token_list` | 列出所有可用的权限令牌 |
| `token_create` | 创建服务器组或频道组令牌 |

### 文件 (`file_*`)

| 工具 | 描述 |
|---|---|
| `file_list` | 列出频道文件仓库中的文件 |
| `file_info` | 获取指定文件的详细信息 |

## 开发

```bash
git clone https://github.com/fl0w1nd/teamspeak3-mcp.git
cd teamspeak3-mcp
pnpm install

pnpm build          # 构建项目
pnpm dev            # 监听模式（修改后自动重新构建）
pnpm inspect        # 使用 MCP Inspector 调试（Web UI）
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
├── index.ts             # 入口文件、stdio 传输、优雅关闭
├── config.ts            # 命令行 + 环境变量配置解析
├── connection.ts        # TeamSpeak 连接（重试 + 延迟初始化）
├── server.ts            # MCP 服务器创建与工具注册
├── utils/
│   └── tool-handler.ts  # 错误处理与响应工具函数
└── tools/
    ├── server.ts        # 服务器信息、资源列表、搜索、日志、诊断
    ├── channel.ts       # 频道增删改查 & 权限
    ├── client.ts        # 客户端管理、权限 & 戳一戳
    ├── server-group.ts  # 服务器组增删、权限 & 成员
    ├── channel-group.ts # 频道组增删、权限 & 分配
    ├── permission.ts    # 全局权限查询与概览
    ├── messaging.ts     # 频道 & 私聊消息
    ├── moderation.ts    # 封禁 & 投诉
    ├── token.ts         # 权限令牌管理
    └── file.ts          # 频道文件浏览
```

## 许可证

[MIT](LICENSE)
