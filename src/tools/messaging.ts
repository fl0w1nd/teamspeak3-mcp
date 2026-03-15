import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TextMessageTargetMode } from "ts3-nodejs-library";
import type { TeamSpeakConnection } from "../connection.js";
import { handleToolError, toolResponse } from "../utils/tool-handler.js";

export function registerMessagingTools(server: McpServer, conn: TeamSpeakConnection): void {
  server.tool(
    "send_channel_message",
    "Send a message to a TeamSpeak channel",
    {
      channel_id: z.number().optional().describe("Channel ID (uses current channel if not specified)"),
      message: z.string().describe("Message to send"),
    },
    handleToolError("send_channel_message", async ({ channel_id, message }) => {
      const ts = await conn.getClient();
      const target = String(channel_id ?? 0);
      await ts.sendTextMessage(target, TextMessageTargetMode.CHANNEL, message);
      return toolResponse(`Message sent to channel: ${message}`);
    })
  );

  server.tool(
    "send_private_message",
    "Send a private message to a user",
    {
      client_id: z.number().describe("Target client ID"),
      message: z.string().describe("Message to send"),
    },
    handleToolError("send_private_message", async ({ client_id, message }) => {
      const ts = await conn.getClient();
      await ts.sendTextMessage(String(client_id), TextMessageTargetMode.CLIENT, message);
      return toolResponse(`Private message sent to client ${client_id}: ${message}`);
    })
  );

  server.tool(
    "poke_client",
    "Send a poke (alert notification) to a client - more attention-grabbing than a private message",
    {
      client_id: z.number().describe("Target client ID to poke"),
      message: z.string().describe("Poke message to send"),
    },
    handleToolError("poke_client", async ({ client_id, message }) => {
      const ts = await conn.getClient();
      await ts.clientPoke(String(client_id), message);
      return toolResponse(`Poke sent to client ${client_id}: ${message}`);
    })
  );
}
