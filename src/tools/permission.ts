import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TeamSpeakConnection } from "../connection.js";
import { handleToolError, toolResponse } from "../utils/tool-handler.js";

export function registerPermissionTools(server: McpServer, conn: TeamSpeakConnection): void {
  server.tool(
    "perm_list",
    "List all available permission definitions on the server (name, ID, description). Useful for discovering valid permission names before assigning them",
    {},
    handleToolError("perm_list", async () => {
      const ts = await conn.getClient();
      const perms = await ts.permissionList();
      const data = perms.map((p) => ({
        id: p.permid,
        name: p.permname,
        description: p.permdesc,
      }));
      return toolResponse(data);
    })
  );

  server.tool(
    "perm_find",
    "Find all assignments of a specific permission across server groups, channel groups, channels, and clients",
    {
      permission: z.string().describe("Permission name (e.g. 'b_virtualserver_info_view')"),
    },
    handleToolError("perm_find", async ({ permission }) => {
      const ts = await conn.getClient();
      const results = await ts.permFind(permission);
      const typeMap: Record<number, string> = {
        0: "server_group",
        1: "client",
        2: "channel",
        3: "channel_group",
        4: "channel_client",
      };
      const data = results.map((r) => ({
        type: typeMap[r.t] ?? `unknown(${r.t})`,
        id1: r.id1,
        id2: r.id2,
        value: r.p,
      }));
      return toolResponse(data, data.length === 0 ? `Permission '${permission}' is not assigned anywhere.` : undefined);
    })
  );

  server.tool(
    "perm_overview",
    "Get the effective permission overview for a client in a specific channel. Shows all permissions and their sources",
    {
      client_db_id: z.number().describe("Client database ID"),
      channel_id: z.number().describe("Channel ID"),
    },
    handleToolError("perm_overview", async ({ client_db_id, channel_id }) => {
      const ts = await conn.getClient();
      const results = await ts.permOverview(String(client_db_id), String(channel_id));
      const typeMap: Record<number, string> = {
        0: "server_group",
        1: "client",
        2: "channel",
        3: "channel_group",
        4: "channel_client",
      };
      const data = results.map((r) => ({
        source_type: typeMap[r.t] ?? `unknown(${r.t})`,
        source_id: r.id,
        source_id2: r.id2,
        permission_id: r.p,
        value: r.v,
        negate: !!r.n,
        skip: !!r.s,
      }));
      return toolResponse(data, data.length === 0 ? `No permissions found for client ${client_db_id} in channel ${channel_id}.` : undefined);
    })
  );
}
