import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TeamSpeakConnection } from "../connection.js";
import { handleToolError, toolResponse } from "../utils/tool-handler.js";

export function registerChannelGroupTools(server: McpServer, conn: TeamSpeakConnection): void {
  server.tool(
    "cgroup_create",
    "Create a new channel group",
    {
      name: z.string().describe("Name for the new channel group"),
      type: z.number().default(1).describe("Group type (0=template, 1=regular, 2=query)"),
    },
    handleToolError("cgroup_create", async ({ name, type }) => {
      const ts = await conn.getClient();
      const group = await ts.channelGroupCreate(name, type);
      return toolResponse({ group_id: group.cgid, name });
    })
  );

  server.tool(
    "cgroup_perm",
    "Manage permissions for a channel group: add, remove, or list",
    {
      group_id: z.number().describe("Channel group ID"),
      action: z.enum(["add", "remove", "list"]).describe("Action to perform"),
      permission: z.string().optional().describe("Permission name (for add/remove)"),
      value: z.number().optional().describe("Permission value (for add)"),
    },
    handleToolError("cgroup_perm", async ({ group_id, action, permission, value }) => {
      const ts = await conn.getClient();
      const gId = String(group_id);

      if (action === "add") {
        if (!permission || value === undefined) throw new Error("permission and value are required for add");
        await ts.channelGroupAddPerm(gId, { permname: permission, permvalue: value });
        return toolResponse({ status: "ok", group_id, permission, value });
      }

      if (action === "remove") {
        if (!permission) throw new Error("permission is required for remove");
        await ts.channelGroupDelPerm(gId, permission);
        return toolResponse({ status: "ok", group_id, permission });
      }

      const perms = await ts.channelGroupPermList(gId, true);
      const data = perms.map((p) => ({ name: p.getPerm(), value: p.getValue() }));
      return toolResponse(data, data.length === 0 ? `Channel group ${group_id} has no custom permissions.` : undefined);
    })
  );

  server.tool(
    "cgroup_assign",
    "Assign a client to a channel group in a specific channel",
    {
      group_id: z.number().describe("Channel group ID to assign"),
      channel_id: z.number().describe("Channel ID where the assignment applies"),
      client_db_id: z.number().describe("Client database ID"),
    },
    handleToolError("cgroup_assign", async ({ group_id, channel_id, client_db_id }) => {
      const ts = await conn.getClient();
      await ts.setClientChannelGroup(String(group_id), String(channel_id), String(client_db_id));
      return toolResponse({ status: "ok", group_id, channel_id, client_db_id });
    })
  );
}
