import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TeamSpeakConnection } from "../connection.js";
import { handleToolError, toolResponse } from "../utils/tool-handler.js";

export function registerFileTools(server: McpServer, conn: TeamSpeakConnection): void {
  server.tool(
    "list_files",
    "List files in a channel's file repository",
    {
      channel_id: z.number().describe("Channel ID to list files for"),
      path: z.string().default("/").describe("Directory path to list"),
      channel_password: z.string().optional().describe("Channel password if required"),
    },
    handleToolError("list_files", async ({ channel_id, path, channel_password }) => {
      const ts = await conn.getClient();
      const files = await ts.ftGetFileList(String(channel_id), path, channel_password);
      return toolResponse(files.map((f) => ({
        name: f.name,
        type: f.type === 0 ? "directory" : "file",
        size: f.type === 1 ? f.size : undefined,
      })));
    })
  );

  server.tool(
    "get_file_info",
    "Get detailed information about a specific file in a channel",
    {
      channel_id: z.number().describe("Channel ID containing the file"),
      file_path: z.string().describe("Full path to the file"),
      channel_password: z.string().optional().describe("Channel password if required"),
    },
    handleToolError("get_file_info", async ({ channel_id, file_path, channel_password }) => {
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
