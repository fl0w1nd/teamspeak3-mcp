import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TeamSpeakConnection } from "../connection.js";
import { handleToolError, toolResponse } from "../utils/tool-handler.js";

export function registerChannelTools(server: McpServer, conn: TeamSpeakConnection): void {
  server.tool(
    "channel_create",
    "Create a new channel on the server",
    {
      name: z.string().describe("Channel name"),
      parent_id: z.number().optional().describe("Parent channel ID"),
      permanent: z.boolean().default(false).describe("Permanent or temporary channel"),
    },
    handleToolError("channel_create", async ({ name, parent_id, permanent }) => {
      const ts = await conn.getClient();
      const channel = await ts.channelCreate(name, {
        cpid: parent_id !== undefined ? String(parent_id) : undefined,
        channelFlagPermanent: permanent,
      });
      return toolResponse({ channel_id: channel.cid, name });
    })
  );

  server.tool(
    "channel_delete",
    "Delete a channel from the server",
    {
      channel_id: z.number().describe("Channel ID to delete"),
      force: z.boolean().default(false).describe("Force deletion even if clients are present"),
    },
    handleToolError("channel_delete", async ({ channel_id, force }) => {
      const ts = await conn.getClient();
      await ts.channelDelete(String(channel_id), force);
      return toolResponse({ status: "ok", channel_id });
    })
  );

  server.tool(
    "channel_update",
    "Update channel properties. Talk power presets: 0=normal, 50=moderated, 999=silent",
    {
      channel_id: z.number().describe("Channel ID to update"),
      name: z.string().optional().describe("New channel name"),
      description: z.string().optional().describe("New channel description"),
      password: z.string().optional().describe("New channel password (empty string to remove)"),
      max_clients: z.number().optional().describe("Maximum number of clients"),
      talk_power: z.number().optional().describe("Required talk power (0=normal, 50=moderated, 999=silent)"),
      codec_quality: z.number().optional().describe("Audio codec quality 1-10"),
      permanent: z.boolean().optional().describe("Make channel permanent"),
    },
    handleToolError("channel_update", async ({ channel_id, name, description, password, max_clients, talk_power, codec_quality, permanent }) => {
      const ts = await conn.getClient();
      const props: Record<string, string | number | boolean> = {};
      if (name !== undefined) props.channelName = name;
      if (description !== undefined) props.channelDescription = description;
      if (password !== undefined) props.channelPassword = password;
      if (max_clients !== undefined) props.channelMaxclients = max_clients;
      if (talk_power !== undefined) props.channelNeededTalkPower = talk_power;
      if (codec_quality !== undefined) props.channelCodecQuality = codec_quality;
      if (permanent !== undefined) props.channelFlagPermanent = permanent;

      await ts.channelEdit(String(channel_id), props);
      return toolResponse({ status: "ok", channel_id, modified: Object.keys(props) });
    })
  );

  server.tool(
    "channel_info",
    "Get detailed information about a specific channel",
    {
      channel_id: z.number().describe("Channel ID"),
    },
    handleToolError("channel_info", async ({ channel_id }) => {
      const ts = await conn.getClient();
      const info = await ts.channelInfo(String(channel_id));
      return toolResponse({
        name: info.channelName,
        topic: info.channelTopic ?? null,
        description: info.channelDescription ?? null,
        password_protected: !!info.channelFlagPassword,
        max_clients: info.channelMaxclients === -1 ? null : info.channelMaxclients,
        codec: info.channelCodec,
        codec_quality: info.channelCodecQuality,
        talk_power_required: info.channelNeededTalkPower,
        type: info.channelFlagPermanent ? "permanent" : info.channelFlagSemiPermanent ? "semi-permanent" : "temporary",
        order: info.channelOrder,
      });
    })
  );

  server.tool(
    "channel_perm",
    "Manage permissions on a specific channel: add, remove, or list",
    {
      channel_id: z.number().describe("Channel ID"),
      action: z.enum(["add", "remove", "list"]).describe("Action to perform"),
      permission: z.string().optional().describe("Permission name (required for add/remove)"),
      value: z.number().optional().describe("Permission value (required for add)"),
    },
    handleToolError("channel_perm", async ({ channel_id, action, permission, value }) => {
      const ts = await conn.getClient();
      const cid = String(channel_id);

      if (action === "add") {
        if (!permission || value === undefined) throw new Error("Permission name and value required for add action");
        await ts.channelSetPerm(cid, { permname: permission, permvalue: value });
        return toolResponse({ status: "ok", channel_id, permission, value });
      }

      if (action === "remove") {
        if (!permission) throw new Error("Permission name required for remove action");
        await ts.channelDelPerm(cid, permission);
        return toolResponse({ status: "ok", channel_id, permission });
      }

      const perms = await ts.channelPermList(cid, true);
      const data = perms.map((p) => ({ name: p.getPerm(), value: p.getValue() }));
      return toolResponse(data, data.length === 0 ? `Channel ${channel_id} has no custom permissions.` : undefined);
    })
  );
}
