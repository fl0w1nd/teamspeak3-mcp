import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TeamSpeakConnection } from "../connection.js";
import { handleToolError, toolResponse } from "../utils/tool-handler.js";

export function registerServerGroupTools(server: McpServer, conn: TeamSpeakConnection): void {
  server.tool(
    "sgroup_create",
    "Create a new server group",
    {
      name: z.string().describe("Name for the new server group"),
      type: z.number().default(1).describe("Group type (0=template, 1=regular, 2=query)"),
    },
    handleToolError("sgroup_create", async ({ name, type }) => {
      const ts = await conn.getClient();
      const group = await ts.serverGroupCreate(name, type);
      return toolResponse({ group_id: group.sgid, name });
    })
  );

  server.tool(
    "sgroup_delete",
    "Delete a server group. Use force=true to remove even if clients are assigned",
    {
      group_id: z.number().describe("Server group ID to delete"),
      force: z.boolean().default(false).describe("Force deletion even if clients are assigned to this group"),
    },
    handleToolError("sgroup_delete", async ({ group_id, force }) => {
      const ts = await conn.getClient();
      await ts.serverGroupDel(String(group_id), force);
      return toolResponse({ status: "ok", group_id });
    })
  );

  server.tool(
    "sgroup_perm",
    "Manage permissions for a server group: add, remove, or list",
    {
      group_id: z.number().describe("Server group ID"),
      action: z.enum(["add", "remove", "list"]).describe("Action to perform"),
      permission: z.string().optional().describe("Permission name (for add/remove)"),
      value: z.number().optional().describe("Permission value (for add)"),
      skip: z.boolean().default(false).describe("Skip flag"),
      negate: z.boolean().default(false).describe("Negate flag"),
    },
    handleToolError("sgroup_perm", async ({ group_id, action, permission, value, skip, negate }) => {
      const ts = await conn.getClient();
      const gId = String(group_id);

      if (action === "add") {
        if (!permission || value === undefined) throw new Error("permission and value are required for add");
        await ts.serverGroupAddPerm(gId, { permname: permission, permvalue: value, permskip: skip, permnegated: negate });
        return toolResponse({ status: "ok", group_id, permission, value });
      }

      if (action === "remove") {
        if (!permission) throw new Error("permission is required for remove");
        await ts.serverGroupDelPerm(gId, permission);
        return toolResponse({ status: "ok", group_id, permission });
      }

      const perms = await ts.serverGroupPermList(gId, true);
      const data = perms.map((p) => ({ name: p.getPerm(), value: p.getValue() }));
      return toolResponse(data, data.length === 0 ? `Server group ${group_id} has no custom permissions.` : undefined);
    })
  );

  server.tool(
    "sgroup_clients",
    "List all clients assigned to a server group",
    {
      group_id: z.number().describe("Server group ID"),
    },
    handleToolError("sgroup_clients", async ({ group_id }) => {
      const ts = await conn.getClient();
      const members = await ts.serverGroupClientList(String(group_id));
      const data = members.map((m) => ({
        database_id: m.cldbid,
        nickname: m.clientNickname,
        unique_id: m.clientUniqueIdentifier,
      }));
      return toolResponse(data, data.length === 0 ? `Server group ${group_id} has no members.` : undefined);
    })
  );
}
