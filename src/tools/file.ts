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

      if (files.length === 0) {
        return toolResponse(`No files found in channel ${channel_id} at path '${path}'.`);
      }

      const lines = [`**Files in Channel ${channel_id} (Path: ${path}):**`, ""];
      for (const f of files) {
        const fileType = f.type === 0 ? "Directory" : "File";
        lines.push(`- **${f.name}** (${fileType})`);
        if (f.type === 1) {
          lines.push(`  - Size: ${f.size} bytes`);
        }
      }
      return toolResponse(lines.join("\n"));
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

      const lines = [
        `**File Information for '${file_path}':**`,
        "",
        `- **Name**: ${info.name}`,
        `- **Size**: ${info.size} bytes`,
        `- **Date**: ${info.datetime}`,
        `- **Channel ID**: ${info.cid}`,
      ];
      return toolResponse(lines.join("\n"));
    })
  );
}
