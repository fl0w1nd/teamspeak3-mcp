import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TeamSpeakConnection } from "../connection.js";

export function registerFileTools(server: McpServer, conn: TeamSpeakConnection): void {
  server.tool(
    "list_files",
    "List files in a channel's file repository",
    {
      channel_id: z.number().describe("Channel ID to list files for"),
      path: z.string().default("/").describe("Directory path to list"),
      channel_password: z.string().optional().describe("Channel password if required"),
    },
    async ({ channel_id, path, channel_password }) => {
      const ts = conn.getClient();
      const files = await ts.ftGetFileList(String(channel_id), path, channel_password);

      if (files.length === 0) {
        return { content: [{ type: "text", text: `No files found in channel ${channel_id} at path '${path}'.` }] };
      }

      const lines = [`**Files in Channel ${channel_id} (Path: ${path}):**`, ""];
      for (const f of files) {
        const fileType = f.type === 0 ? "Directory" : "File";
        lines.push(`- **${f.name}** (${fileType})`);
        if (f.type === 1) {
          lines.push(`  - Size: ${f.size} bytes`);
        }
      }
      return { content: [{ type: "text", text: lines.join("\n") }] };
    }
  );

  server.tool(
    "get_file_info",
    "Get detailed information about a specific file in a channel",
    {
      channel_id: z.number().describe("Channel ID containing the file"),
      file_path: z.string().describe("Full path to the file"),
      channel_password: z.string().optional().describe("Channel password if required"),
    },
    async ({ channel_id, file_path, channel_password }) => {
      const ts = conn.getClient();
      const info = await ts.ftGetFileInfo(String(channel_id), file_path, channel_password);

      const lines = [
        `**File Information for '${file_path}':**`,
        "",
        `- **Name**: ${info.name}`,
        `- **Size**: ${info.size} bytes`,
        `- **Date**: ${info.datetime}`,
        `- **Channel ID**: ${info.cid}`,
      ];
      return { content: [{ type: "text", text: lines.join("\n") }] };
    }
  );

  server.tool(
    "manage_file_permissions",
    "List active file transfers and manage file transfer permissions",
    {
      action: z.enum(["list_transfers", "stop_transfer"]).describe("Action to perform"),
      transfer_id: z.number().optional().describe("File transfer ID (for stop_transfer)"),
      delete_partial: z.boolean().default(false).describe("Delete partial file when stopping transfer"),
    },
    async ({ action, transfer_id, delete_partial }) => {
      const ts = conn.getClient();

      if (action === "list_transfers") {
        const transfers = await ts.ftList();

        if (transfers.length === 0) {
          return { content: [{ type: "text", text: "No active file transfers." }] };
        }

        const lines = ["**Active File Transfers:**", ""];
        for (const t of transfers) {
          lines.push(`- **Transfer ID ${t.serverftfid}**`);
          lines.push(`  - Client: ${t.clid}`);
          lines.push(`  - File: ${t.name}`);
          lines.push(`  - Size: ${t.size} bytes (done: ${t.sizedone})`);
          lines.push(`  - Speed: ${t.currentSpeed} B/s`);
          lines.push("");
        }
        return { content: [{ type: "text", text: lines.join("\n") }] };
      }

      // stop_transfer
      if (transfer_id === undefined) throw new Error("Transfer ID required for stop_transfer");
      await ts.ftStop(transfer_id, delete_partial ? 1 : 0);
      return { content: [{ type: "text", text: `File transfer ${transfer_id} stopped` }] };
    }
  );
}
