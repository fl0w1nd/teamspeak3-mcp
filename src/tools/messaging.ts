import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TextMessageTargetMode } from "ts3-nodejs-library";
import type { TeamSpeakConnection } from "../connection.js";
import { handleToolError, toolResponse } from "../utils/tool-handler.js";

export function registerMessagingTools(server: McpServer, conn: TeamSpeakConnection): void {
  server.tool(
    "msg_send",
    "Send a text message to a channel or a private message to a client",
    {
      mode: z.enum(["channel", "private"]).describe("'channel' = send to a channel, 'private' = send to a specific client"),
      target_id: z.number().describe("Channel ID (for mode=channel) or Client ID (for mode=private)"),
      message: z.string().describe("Message text to send"),
    },
    handleToolError("msg_send", async ({ mode, target_id, message }) => {
      const ts = await conn.getClient();
      if (mode === "channel") {
        await ts.sendTextMessage(String(target_id), TextMessageTargetMode.CHANNEL, message);
      } else {
        await ts.sendTextMessage(String(target_id), TextMessageTargetMode.CLIENT, message);
      }
      return toolResponse({ status: "ok", mode, target_id, message });
    })
  );
}
