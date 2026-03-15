import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ReasonIdentifier } from "ts3-nodejs-library";
import type { TeamSpeakConnection } from "../connection.js";

export function registerClientTools(server: McpServer, conn: TeamSpeakConnection): void {
  server.tool(
    "move_client",
    "Move a client to another channel",
    {
      client_id: z.number().describe("Client ID"),
      channel_id: z.number().describe("Destination channel ID"),
    },
    async ({ client_id, channel_id }) => {
      const ts = conn.getClient();
      await ts.clientMove(String(client_id), String(channel_id));
      return { content: [{ type: "text", text: `Client ${client_id} moved to channel ${channel_id}` }] };
    }
  );

  server.tool(
    "kick_client",
    "Kick a client from server or channel",
    {
      client_id: z.number().describe("Client ID"),
      reason: z.string().default("Expelled by AI").describe("Kick reason"),
      from_server: z.boolean().default(false).describe("Kick from server (true) or channel (false)"),
    },
    async ({ client_id, reason, from_server }) => {
      const ts = conn.getClient();
      const reasonId = from_server ? ReasonIdentifier.KICK_SERVER : ReasonIdentifier.KICK_CHANNEL;
      await ts.clientKick(String(client_id), reasonId, reason);
      const location = from_server ? "from server" : "from channel";
      return { content: [{ type: "text", text: `Client ${client_id} kicked ${location}: ${reason}` }] };
    }
  );

  server.tool(
    "ban_client",
    "Ban a client from the server",
    {
      client_id: z.number().describe("Client ID"),
      reason: z.string().default("Banned by AI").describe("Ban reason"),
      duration: z.number().default(0).describe("Ban duration in seconds (0 = permanent)"),
    },
    async ({ client_id, reason, duration }) => {
      const ts = conn.getClient();
      await ts.banClient({ clid: String(client_id), time: duration, banreason: reason });
      const durationText = duration === 0 ? "permanently" : `for ${duration} seconds`;
      return { content: [{ type: "text", text: `Client ${client_id} banned ${durationText}: ${reason}` }] };
    }
  );

  server.tool(
    "client_info_detailed",
    "Get detailed information about a specific client",
    {
      client_id: z.number().describe("Client ID to get detailed info for"),
    },
    async ({ client_id }) => {
      const ts = conn.getClient();
      const infos = await ts.clientInfo([String(client_id)]);
      const info = infos[0];

      const uniqueId = info.clientUniqueIdentifier ?? "N/A";
      const displayUid = uniqueId.length > 32 ? uniqueId.slice(0, 32) + "..." : uniqueId;

      const lines = [
        "**Client Information:**",
        "",
        `- **Database ID**: ${info.clientDatabaseId}`,
        `- **Nickname**: ${info.clientNickname}`,
        `- **Unique ID**: ${displayUid}`,
        `- **Channel ID**: ${info.cid}`,
        `- **Talk Power**: ${info.clientTalkPower}`,
        `- **Client Type**: ${info.clientType === 1 ? "ServerQuery" : "Regular"}`,
        `- **Platform**: ${info.clientPlatform}`,
        `- **Version**: ${info.clientVersion}`,
        `- **Away**: ${info.clientAway ? "Yes" : "No"}`,
        `- **Away Message**: ${info.clientAwayMessage || "N/A"}`,
        `- **Input Muted**: ${info.clientInputMuted ? "Yes" : "No"}`,
        `- **Output Muted**: ${info.clientOutputMuted ? "Yes" : "No"}`,
        `- **Created**: ${info.clientCreated}`,
        `- **Last Connected**: ${info.clientLastconnected}`,
        `- **Country**: ${info.clientCountry || "N/A"}`,
        `- **IP Address**: ${info.connectionClientIp || "N/A"}`,
        `- **Idle Time**: ${info.clientIdleTime}ms`,
        `- **Is Recording**: ${info.clientIsRecording ? "Yes" : "No"}`,
      ];

      return { content: [{ type: "text", text: lines.join("\n") }] };
    }
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
    async ({ client_id, action, group_id, permission, value, skip, negate }) => {
      const ts = conn.getClient();

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
        return { content: [{ type: "text", text: `Client ${client_id} added to server group ${group_id}` }] };
      }

      if (action === "remove_group") {
        if (group_id === undefined) throw new Error("Server group ID required for remove_group");
        const dbId = await getDbId();
        await ts.serverGroupDelClient(dbId, String(group_id));
        return { content: [{ type: "text", text: `Client ${client_id} removed from server group ${group_id}` }] };
      }

      if (action === "list_groups") {
        const dbId = await getDbId();
        const groups = await ts.serverGroupsByClientId(dbId);
        if (groups.length === 0) {
          return { content: [{ type: "text", text: `Client ${client_id} has no server groups.` }] };
        }
        const lines = [`**Client ${client_id} Server Groups:**`, ""];
        for (const g of groups) {
          lines.push(`- **${g.name}** (ID: ${g.sgid})`);
        }
        return { content: [{ type: "text", text: lines.join("\n") }] };
      }

      if (action === "add_permission") {
        if (!permission || value === undefined) throw new Error("Permission name and value required");
        const dbId = await getDbId();
        await ts.clientAddPerm(dbId, { permname: permission, permvalue: value, permskip: skip, permnegated: negate });
        return { content: [{ type: "text", text: `Permission '${permission}' added to client ${client_id} with value ${value}` }] };
      }

      if (action === "remove_permission") {
        if (!permission) throw new Error("Permission name required");
        const dbId = await getDbId();
        await ts.clientDelPerm(dbId, permission);
        return { content: [{ type: "text", text: `Permission '${permission}' removed from client ${client_id}` }] };
      }

      // list_permissions
      const dbId = await getDbId();
      const perms = await ts.clientPermList(dbId, true);
      if (perms.length === 0) {
        return { content: [{ type: "text", text: `Client ${client_id} has no custom permissions.` }] };
      }
      const lines = [`**Client ${client_id} Permissions:**`, ""];
      for (const p of perms) {
        lines.push(`- **${p.getPerm()}**: ${p.getValue()}`);
      }
      return { content: [{ type: "text", text: lines.join("\n") }] };
    }
  );

  server.tool(
    "diagnose_permissions",
    "Diagnose current connection permissions and provide troubleshooting help",
    {},
    async () => {
      const ts = conn.getClient();
      const lines: string[] = ["**TeamSpeak MCP Permission Diagnostics**", ""];

      // Test whoami
      try {
        const whoami = await ts.whoami();
        lines.push("OK **Basic connection**: working");
        lines.push(`  - Client ID: ${whoami.clientId}`);
        lines.push(`  - Database ID: ${whoami.clientDatabaseId}`);
        lines.push(`  - Nickname: ${whoami.clientNickname}`);
        lines.push("");
      } catch (e) {
        lines.push(`FAIL **Basic connection**: ${e}`);
        return { content: [{ type: "text", text: lines.join("\n") }] };
      }

      // Test server_info
      try {
        await ts.serverInfo();
        lines.push("OK **server_info**: accessible");
      } catch (e) {
        lines.push(`FAIL **server_info**: ${e}`);
      }

      // Test client list
      try {
        await ts.clientList();
        lines.push("OK **list_clients**: accessible (elevated permissions)");
      } catch (e) {
        lines.push(`FAIL **list_clients**: ${e}`);
      }

      // Test channel list
      try {
        await ts.channelList();
        lines.push("OK **list_channels**: accessible");
      } catch (e) {
        lines.push(`FAIL **list_channels**: ${e}`);
      }

      lines.push("");
      lines.push("**Recommendations if failures exist:**");
      lines.push("1. Verify your ServerQuery password");
      lines.push("2. Use an admin token if available");
      lines.push("3. Create a ServerQuery user with admin permissions");
      lines.push("4. Ensure port 10011 (ServerQuery) is accessible");

      return { content: [{ type: "text", text: lines.join("\n") }] };
    }
  );
}
