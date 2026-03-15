import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TeamSpeakConnection } from "../connection.js";
import { handleToolError, toolResponse } from "../utils/tool-handler.js";

export function registerPermissionTools(server: McpServer, conn: TeamSpeakConnection): void {
  const categoryPrefixes: Record<string, string[]> = {
    server:   ["b_serverinstance_", "i_serverinstance_", "b_virtualserver_", "i_virtualserver_"],
    channel:  ["b_channel_", "i_channel_"],
    client:   ["b_client_", "i_client_"],
    group:    ["b_group_", "i_group_", "b_virtualserver_servergroup_", "b_virtualserver_channelgroup_"],
    filetransfer: ["b_ft_", "i_ft_"],
  };

  server.tool(
    "perm_list",
    "List available permission definitions. Use 'filter' to search by keyword (e.g. 'kick') or 'category' to narrow by domain. Returns only names by default; set verbose=true for descriptions",
    {
      filter: z.string().optional().describe("Keyword to search in permission name or description"),
      category: z.enum(["server", "channel", "client", "group", "filetransfer"]).optional().describe("Filter by permission category"),
      verbose: z.boolean().default(false).describe("Include permission descriptions (increases token usage)"),
    },
    handleToolError("perm_list", async ({ filter, category, verbose }) => {
      const ts = await conn.getClient();
      let perms = await ts.permissionList();

      perms = perms.filter((p) => !p.permname.startsWith("i_needed_modify_power_"));

      if (category) {
        const prefixes = categoryPrefixes[category];
        perms = perms.filter((p) => prefixes.some((px) => p.permname.startsWith(px)));
      }

      if (filter) {
        const kw = filter.toLowerCase();
        perms = perms.filter((p) =>
          p.permname.toLowerCase().includes(kw) ||
          (p.permdesc && p.permdesc.toLowerCase().includes(kw)),
        );
      }

      const data = verbose
        ? perms.map((p) => ({ id: p.permid, name: p.permname, description: p.permdesc }))
        : perms.map((p) => p.permname);

      return toolResponse(
        data,
        data.length === 0
          ? `No permissions found${filter ? ` matching '${filter}'` : ""}${category ? ` in category '${category}'` : ""}.`
          : `${data.length} permissions returned. Use 'filter' or 'category' to narrow results.`,
      );
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
