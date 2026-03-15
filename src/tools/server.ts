import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TeamSpeakConnection } from "../connection.js";
import { handleToolError, toolResponse } from "../utils/tool-handler.js";

export function registerServerTools(server: McpServer, conn: TeamSpeakConnection): void {
  server.tool(
    "server_info",
    "Get TeamSpeak server information. Use scope 'overview' for general server details, 'connection' for network/bandwidth statistics",
    {
      scope: z.enum(["overview", "connection"]).default("overview").describe("Info scope: 'overview' = general server details, 'connection' = network statistics"),
    },
    handleToolError("server_info", async ({ scope }) => {
      const ts = await conn.getClient();

      if (scope === "connection") {
        const info = await ts.connectionInfo();
        return toolResponse(info);
      }

      const info = await ts.serverInfo();
      return toolResponse({
        name: info.virtualserverName,
        version: info.virtualserverVersion,
        platform: info.virtualserverPlatform,
        clients_online: info.virtualserverClientsonline,
        max_clients: info.virtualserverMaxclients,
        uptime_seconds: info.virtualserverUptime,
        port: info.virtualserverPort,
        created: info.virtualserverCreated,
        unique_id: info.virtualserverUniqueIdentifier,
      });
    })
  );

  server.tool(
    "server_list",
    "List server resources: online clients, channels, server groups, or channel groups",
    {
      resource: z.enum(["clients", "channels", "server_groups", "channel_groups"]).describe("Resource type to list"),
    },
    handleToolError("server_list", async ({ resource }) => {
      const ts = await conn.getClient();

      if (resource === "clients") {
        const clients = await ts.clientList();
        const data = clients.map((c) => ({ client_id: c.clid, nickname: c.nickname, channel_id: c.cid }));
        return toolResponse(data, data.length === 0 ? "No clients are currently connected to the server." : undefined);
      }

      if (resource === "channels") {
        const channels = await ts.channelList();
        const data = channels.map((ch) => ({ channel_id: ch.cid, name: ch.name }));
        return toolResponse(data, data.length === 0 ? "No channels exist on the server." : undefined);
      }

      if (resource === "server_groups") {
        const groups = await ts.serverGroupList();
        const data = groups.map((g) => ({ group_id: g.sgid, name: g.name, type: g.type }));
        return toolResponse(data, data.length === 0 ? "No server groups exist on this virtual server." : undefined);
      }

      // channel_groups
      const groups = await ts.channelGroupList();
      const data = groups.map((g) => ({ group_id: g.cgid, name: g.name, type: g.type }));
      return toolResponse(data, data.length === 0 ? "No channel groups exist on this virtual server." : undefined);
    })
  );

  server.tool(
    "server_search",
    "Search for online clients by name/UID or channels by name pattern",
    {
      type: z.enum(["client", "channel"]).describe("Search type"),
      pattern: z.string().describe("Search pattern (name or UID)"),
      by_uid: z.boolean().default(false).describe("Search clients by unique identifier instead of name (only for type=client)"),
    },
    handleToolError("server_search", async ({ type, pattern, by_uid }) => {
      const ts = await conn.getClient();

      if (type === "client") {
        if (by_uid) {
          const results = await ts.clientDbFind(pattern, true);
          const data = results.map((r) => ({ database_id: r.cldbid }));
          return toolResponse(data, data.length === 0 ? `No clients found matching UID pattern '${pattern}'.` : undefined);
        }
        const results = await ts.clientFind(pattern);
        const data = results.map((r) => ({ client_id: r.clid, nickname: r.clientNickname }));
        return toolResponse(data, data.length === 0 ? `No online clients found matching '${pattern}'.` : undefined);
      }

      // channel
      const results = await ts.channelFind(pattern);
      const data = results.map((r) => ({ channel_id: r.cid, name: r.channelName }));
      return toolResponse(data, data.length === 0 ? `No channels found matching '${pattern}'.` : undefined);
    })
  );

  server.tool(
    "server_log",
    "View recent entries from the virtual server log",
    {
      lines: z.number().min(1).max(100).default(50).describe("Number of log lines to retrieve"),
      reverse: z.boolean().default(true).describe("Newest first"),
      instance_log: z.boolean().default(false).describe("Show instance log instead of virtual server log"),
      begin_pos: z.number().optional().describe("Starting position in log file"),
    },
    handleToolError("server_log", async ({ lines: lineCount, reverse, instance_log, begin_pos }) => {
      const ts = await conn.getClient();
      const entries = await ts.logView(lineCount, reverse ? 1 : 0, instance_log ? 1 : 0, begin_pos);
      const data = entries.map((e) => e.l);
      return toolResponse(data, data.length === 0 ? "No log entries found." : undefined);
    })
  );

  server.tool(
    "server_diagnose",
    "Diagnose current ServerQuery connection permissions and provide troubleshooting info",
    {},
    handleToolError("server_diagnose", async () => {
      const ts = await conn.getClient();
      const checks: { test: string; status: "ok" | "fail"; detail?: string }[] = [];

      try {
        const whoami = await ts.whoami();
        checks.push({
          test: "connection",
          status: "ok",
          detail: `client_id=${whoami.clientId}, db_id=${whoami.clientDatabaseId}, nickname=${whoami.clientNickname}`,
        });
      } catch (e) {
        checks.push({ test: "connection", status: "fail", detail: String(e) });
        return toolResponse({ checks });
      }

      for (const [test, fn] of [
        ["server_info", () => ts.serverInfo()],
        ["list_clients", () => ts.clientList()],
        ["list_channels", () => ts.channelList()],
      ] as const) {
        try {
          await fn();
          checks.push({ test, status: "ok" });
        } catch (e) {
          checks.push({ test, status: "fail", detail: String(e) });
        }
      }

      return toolResponse({ checks });
    })
  );
}
