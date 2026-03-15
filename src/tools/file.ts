import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TeamSpeakConnection } from "../connection.js";
import { handleToolError, toolResponse } from "../utils/tool-handler.js";

export function registerFileTools(server: McpServer, conn: TeamSpeakConnection): void {
  server.tool(
    "file_list",
    "List files in a channel's file repository",
    {
      channel_id: z.number().describe("Channel ID"),
      path: z.string().default("/").describe("Directory path to list"),
      channel_password: z.string().optional().describe("Channel password if required"),
    },
    handleToolError("file_list", async ({ channel_id, path, channel_password }) => {
      const ts = await conn.getClient();
      const files = await ts.ftGetFileList(String(channel_id), path, channel_password);
      const data = files.map((f) => ({
        name: f.name,
        type: f.type === 0 ? "directory" : "file",
        size: f.type === 1 ? f.size : undefined,
      }));
      return toolResponse(data, data.length === 0 ? `No files found in channel ${channel_id} at path '${path}'.` : undefined);
    })
  );

  server.tool(
    "file_info",
    "Get detailed information about a specific file in a channel's file repository",
    {
      channel_id: z.number().describe("Channel ID containing the file"),
      file_path: z.string().describe("Full path to the file"),
      channel_password: z.string().optional().describe("Channel password if required"),
    },
    handleToolError("file_info", async ({ channel_id, file_path, channel_password }) => {
      const ts = await conn.getClient();
      const info = await ts.ftGetFileInfo(String(channel_id), file_path, channel_password);
      return toolResponse({
        name: info.name,
        size: info.size,
        datetime: info.datetime,
        channel_id: info.cid,
      });
    })
  );
}
