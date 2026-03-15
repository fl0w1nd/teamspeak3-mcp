import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TeamSpeakConnection } from "../connection.js";
import { handleToolError, toolResponse } from "../utils/tool-handler.js";

export function registerServerGroupTools(server: McpServer, conn: TeamSpeakConnection): void {
  server.tool(
    "list_server_groups",
    "List all server groups available on the virtual server",
    {},
    handleToolError("list_server_groups", async () => {
      const ts = await conn.getClient();
      const groups = await ts.serverGroupList();
      return toolResponse(groups.map((g) => ({
        group_id: g.sgid,
        name: g.name,
        type: g.type,
      })));
    })
  );

  server.tool(
    "create_server_group",
    "Create a new server group with specified name and type",
    {
      name: z.string().describe("Name for the new server group"),
      type: z.number().default(1).describe("Group type (0=template, 1=regular, 2=query)"),
    },
    handleToolError("create_server_group", async ({ name, type }) => {
      const ts = await conn.getClient();
      const group = await ts.serverGroupCreate(name, type);
      return toolResponse({ group_id: group.sgid, name });
    })
  );

  server.tool(
    "manage_server_group_permissions",
    "Add, remove or list permissions for a server group",
    {
      group_id: z.number().describe("Server group ID"),
      action: z.enum(["add", "remove", "list"]).describe("Action to perform"),
      permission: z.string().optional().describe("Permission name (for add/remove)"),
      value: z.number().optional().describe("Permission value (for add)"),
      skip: z.boolean().default(false).describe("Skip flag for permission"),
      negate: z.boolean().default(false).describe("Negate flag for permission"),
    },
    handleToolError("manage_server_group_permissions", async ({ group_id, action, permission, value, skip, negate }) => {
      const ts = await conn.getClient();
      const gId = String(group_id);

      if (action === "add") {
        if (!permission || value === undefined) throw new Error("Permission name and value required for add action");
        await ts.serverGroupAddPerm(gId, { permname: permission, permvalue: value, permskip: skip, permnegated: negate });
        return toolResponse({ status: "ok", group_id, permission, value });
      }

      if (action === "remove") {
        if (!permission) throw new Error("Permission name required for remove action");
        await ts.serverGroupDelPerm(gId, permission);
        return toolResponse({ status: "ok", group_id, permission });
      }

      const perms = await ts.serverGroupPermList(gId, true);
      return toolResponse(perms.map((p) => ({ name: p.getPerm(), value: p.getValue() })));
    })
  );
}
