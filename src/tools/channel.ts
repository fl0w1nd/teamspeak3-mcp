import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TeamSpeakConnection } from "../connection.js";
import { handleToolError, toolResponse } from "../utils/tool-handler.js";

export function registerChannelTools(server: McpServer, conn: TeamSpeakConnection): void {
  server.tool(
    "create_channel",
    "Create a new channel",
    {
      name: z.string().describe("Channel name"),
      parent_id: z.number().optional().describe("Parent channel ID"),
      permanent: z.boolean().default(false).describe("Permanent or temporary channel"),
    },
    handleToolError("create_channel", async ({ name, parent_id, permanent }) => {
      const ts = await conn.getClient();
      const channel = await ts.channelCreate(name, {
        cpid: parent_id !== undefined ? String(parent_id) : undefined,
        channelFlagPermanent: permanent,
      });
      return toolResponse(`Channel '${name}' created successfully (ID: ${channel.cid})`);
    })
  );

  server.tool(
    "delete_channel",
    "Delete a channel",
    {
      channel_id: z.number().describe("Channel ID to delete"),
      force: z.boolean().default(false).describe("Force deletion even if clients are present"),
    },
    handleToolError("delete_channel", async ({ channel_id, force }) => {
      const ts = await conn.getClient();
      await ts.channelDelete(String(channel_id), force);
      return toolResponse(`Channel ${channel_id} deleted successfully`);
    })
  );

  server.tool(
    "update_channel",
    "Update channel properties (name, description, password, talk power, limits, etc.)",
    {
      channel_id: z.number().describe("Channel ID to update"),
      name: z.string().optional().describe("New channel name"),
      description: z.string().optional().describe("New channel description"),
      password: z.string().optional().describe("New channel password (empty string to remove)"),
      max_clients: z.number().optional().describe("Maximum number of clients"),
      talk_power: z.number().optional().describe("Required talk power to speak in channel"),
      codec_quality: z.number().optional().describe("Audio codec quality 1-10"),
      permanent: z.boolean().optional().describe("Make channel permanent"),
    },
    handleToolError("update_channel", async ({ channel_id, name, description, password, max_clients, talk_power, codec_quality, permanent }) => {
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
      const changed = Object.keys(props).join(", ");
      return toolResponse(`Channel ${channel_id} updated successfully\nModified: ${changed}`);
    })
  );

  server.tool(
    "channel_info",
    "Get detailed information about a specific channel",
    {
      channel_id: z.number().describe("Channel ID to get info for"),
    },
    handleToolError("channel_info", async ({ channel_id }) => {
      const ts = await conn.getClient();
      const info = await ts.channelInfo(String(channel_id));

      const lines = [
        "**Channel Information:**",
        "",
        `- **Name**: ${info.channelName}`,
        `- **Topic**: ${info.channelTopic ?? "N/A"}`,
        `- **Description**: ${info.channelDescription ?? "N/A"}`,
        `- **Password Protected**: ${info.channelFlagPassword ? "Yes" : "No"}`,
        `- **Max Clients**: ${info.channelMaxclients === -1 ? "Unlimited" : info.channelMaxclients}`,
        `- **Codec**: ${info.channelCodec}`,
        `- **Codec Quality**: ${info.channelCodecQuality}`,
        `- **Talk Power Required**: ${info.channelNeededTalkPower}`,
        `- **Type**: ${info.channelFlagPermanent ? "Permanent" : info.channelFlagSemiPermanent ? "Semi-Permanent" : "Temporary"}`,
        `- **Order**: ${info.channelOrder}`,
      ];

      return toolResponse(lines.join("\n"));
    })
  );

  server.tool(
    "set_channel_talk_power",
    "Set talk power requirement for a channel (useful for AFK/silent channels)",
    {
      channel_id: z.number().describe("Channel ID to configure"),
      talk_power: z.number().optional().describe("Required talk power (0=everyone, 999=silent)"),
      preset: z.enum(["silent", "moderated", "normal"]).optional().describe("Quick preset: 'silent' (999), 'moderated' (50), 'normal' (0)"),
    },
    handleToolError("set_channel_talk_power", async ({ channel_id, talk_power, preset }) => {
      let power = talk_power;
      if (preset === "silent") power = 999;
      else if (preset === "moderated") power = 50;
      else if (preset === "normal") power = 0;

      if (power === undefined) {
        throw new Error("Either talk_power or preset must be specified");
      }

      const ts = await conn.getClient();
      await ts.channelEdit(String(channel_id), { channelNeededTalkPower: power });

      let desc: string;
      if (power === 0) desc = "Channel is now open - everyone can talk";
      else if (power >= 999) desc = "Channel is now silent - only high-privilege users can talk";
      else if (power >= 50) desc = "Channel is now moderated - only moderators+ can talk";
      else desc = `Custom talk power requirement: ${power}`;

      const presetLabel = preset ? ` (preset: ${preset})` : "";
      return toolResponse(`Talk power for channel ${channel_id} set to ${power}${presetLabel}\n${desc}`);
    })
  );

  server.tool(
    "manage_channel_permissions",
    "Add or remove specific permissions for a channel",
    {
      channel_id: z.number().describe("Channel ID to modify permissions for"),
      action: z.enum(["add", "remove", "list"]).describe("Action to perform"),
      permission: z.string().optional().describe("Permission name (required for add/remove)"),
      value: z.number().optional().describe("Permission value (required for add)"),
    },
    handleToolError("manage_channel_permissions", async ({ channel_id, action, permission, value }) => {
      const ts = await conn.getClient();
      const cid = String(channel_id);

      if (action === "add") {
        if (!permission || value === undefined) {
          throw new Error("Permission name and value required for add action");
        }
        await ts.channelSetPerm(cid, { permname: permission, permvalue: value });
        return toolResponse(`Permission '${permission}' added to channel ${channel_id} with value ${value}`);
      }

      if (action === "remove") {
        if (!permission) {
          throw new Error("Permission name required for remove action");
        }
        await ts.channelDelPerm(cid, permission);
        return toolResponse(`Permission '${permission}' removed from channel ${channel_id}`);
      }

      // action === "list"
      const perms = await ts.channelPermList(cid, true);
      if (perms.length === 0) {
        return toolResponse(`Channel ${channel_id} has no custom permissions.`);
      }

      const lines = [`**Channel ${channel_id} Permissions:**`, ""];
      for (const perm of perms) {
        lines.push(`- **${perm.getPerm()}**: ${perm.getValue()}`);
      }
      return toolResponse(lines.join("\n"));
    })
  );
}
