import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ReasonIdentifier } from "ts3-nodejs-library";
import type { TeamSpeakConnection } from "../connection.js";
import { handleToolError, toolResponse } from "../utils/tool-handler.js";

export function registerClientTools(server: McpServer, conn: TeamSpeakConnection): void {
  server.tool(
    "move_client",
    "Move a client to another channel",
    {
      client_id: z.number().describe("Client ID"),
      channel_id: z.number().describe("Destination channel ID"),
    },
    handleToolError("move_client", async ({ client_id, channel_id }) => {
      const ts = await conn.getClient();
      await ts.clientMove(String(client_id), String(channel_id));
      return toolResponse({ status: "ok", client_id, channel_id });
    })
  );

  server.tool(
    "kick_client",
    "Kick a client from server or channel",
    {
      client_id: z.number().describe("Client ID"),
      reason: z.string().default("Expelled by AI").describe("Kick reason"),
      from_server: z.boolean().default(false).describe("Kick from server (true) or channel (false)"),
    },
    handleToolError("kick_client", async ({ client_id, reason, from_server }) => {
      const ts = await conn.getClient();
      const reasonId = from_server ? ReasonIdentifier.KICK_SERVER : ReasonIdentifier.KICK_CHANNEL;
      await ts.clientKick(String(client_id), reasonId, reason);
      return toolResponse({ status: "ok", client_id, from: from_server ? "server" : "channel", reason });
    })
  );

  server.tool(
    "ban_client",
    "Ban a client from the server",
    {
      client_id: z.number().describe("Client ID"),
      reason: z.string().default("Banned by AI").describe("Ban reason"),
      duration: z.number().default(0).describe("Ban duration in seconds (0 = permanent)"),
    },
    handleToolError("ban_client", async ({ client_id, reason, duration }) => {
      const ts = await conn.getClient();
      await ts.banClient({ clid: String(client_id), time: duration, banreason: reason });
      return toolResponse({ status: "ok", client_id, duration, permanent: duration === 0, reason });
    })
  );

  server.tool(
    "client_info_detailed",
    "Get detailed information about a specific client",
    {
      client_id: z.number().describe("Client ID to get detailed info for"),
    },
    handleToolError("client_info_detailed", async ({ client_id }) => {
      const ts = await conn.getClient();
      const infos = await ts.clientInfo([String(client_id)]);
      const info = infos[0];
      return toolResponse({
        database_id: info.clientDatabaseId,
        nickname: info.clientNickname,
        unique_id: info.clientUniqueIdentifier ?? null,
        channel_id: info.cid,
        talk_power: info.clientTalkPower,
        client_type: info.clientType === 1 ? "server_query" : "regular",
        platform: info.clientPlatform,
        version: info.clientVersion,
        away: !!info.clientAway,
        away_message: info.clientAwayMessage || null,
        input_muted: !!info.clientInputMuted,
        output_muted: !!info.clientOutputMuted,
        created: info.clientCreated,
        last_connected: info.clientLastconnected,
        country: info.clientCountry || null,
        ip: info.connectionClientIp || null,
        idle_time_ms: info.clientIdleTime,
        is_recording: !!info.clientIsRecording,
      });
    })
  );

  server.tool(
    "manage_user_permissions",
    "Manage user permissions: add/remove server groups, set individual permissions",
    {
      client_id: z.number().describe("Client ID to manage permissions for"),
      action: z.enum(["add_group", "remove_group", "list_groups", "add_permission", "remove_permission", "list_permissions"]).describe("Action to perform"),
      group_id: z.number().optional().describe("Server group ID (for add_group/remove_group)"),
      permission: z.string().optional().describe("Permission name (for add_permission/remove_permission)"),
      value: z.number().optional().describe("Permission value (for add_permission)"),
      skip: z.boolean().default(false).describe("Skip flag for permission"),
      negate: z.boolean().default(false).describe("Negate flag for permission"),
    },
    handleToolError("manage_user_permissions", async ({ client_id, action, group_id, permission, value, skip, negate }) => {
      const ts = await conn.getClient();

      const getDbId = async (): Promise<string> => {
        const infos = await ts.clientInfo([String(client_id)]);
        const dbId = infos[0].clientDatabaseId;
        if (!dbId) throw new Error("Could not get client database ID");
        return String(dbId);
      };

      if (action === "add_group") {
        if (group_id === undefined) throw new Error("Server group ID required for add_group");
        const dbId = await getDbId();
        await ts.serverGroupAddClient(dbId, String(group_id));
        return toolResponse({ status: "ok", client_id, group_id });
      }

      if (action === "remove_group") {
        if (group_id === undefined) throw new Error("Server group ID required for remove_group");
        const dbId = await getDbId();
        await ts.serverGroupDelClient(dbId, String(group_id));
        return toolResponse({ status: "ok", client_id, group_id });
      }

      if (action === "list_groups") {
        const dbId = await getDbId();
        const groups = await ts.serverGroupsByClientId(dbId);
        const data = groups.map((g) => ({ group_id: g.sgid, name: g.name }));
        return toolResponse(data, data.length === 0 ? `Client ${client_id} has no server groups assigned.` : undefined);
      }

      if (action === "add_permission") {
        if (!permission || value === undefined) throw new Error("Permission name and value required");
        const dbId = await getDbId();
        await ts.clientAddPerm(dbId, { permname: permission, permvalue: value, permskip: skip, permnegated: negate });
        return toolResponse({ status: "ok", client_id, permission, value });
      }

      if (action === "remove_permission") {
        if (!permission) throw new Error("Permission name required");
        const dbId = await getDbId();
        await ts.clientDelPerm(dbId, permission);
        return toolResponse({ status: "ok", client_id, permission });
      }

      // list_permissions
      const dbId = await getDbId();
      const perms = await ts.clientPermList(dbId, true);
      const data = perms.map((p) => ({ name: p.getPerm(), value: p.getValue() }));
      return toolResponse(data, data.length === 0 ? `Client ${client_id} has no custom permissions.` : undefined);
    })
  );

  server.tool(
    "diagnose_permissions",
    "Diagnose current connection permissions and provide troubleshooting help",
    {},
    handleToolError("diagnose_permissions", async () => {
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
