import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TeamSpeakConnection } from "../connection.js";
import { handleToolError, toolResponse } from "../utils/tool-handler.js";

export function registerLoggingTools(server: McpServer, conn: TeamSpeakConnection): void {
  server.tool(
    "view_server_logs",
    "View recent entries from the virtual server log",
    {
      lines: z.number().min(1).max(100).default(50).describe("Number of log lines to retrieve"),
      reverse: z.boolean().default(true).describe("Show logs in reverse order (newest first)"),
      instance_log: z.boolean().default(false).describe("Show instance log instead of virtual server log"),
      begin_pos: z.number().optional().describe("Starting position in log file"),
    },
    handleToolError("view_server_logs", async ({ lines: lineCount, reverse, instance_log, begin_pos }) => {
      const ts = await conn.getClient();
      const entries = await ts.logView(
        lineCount,
        reverse ? 1 : 0,
        instance_log ? 1 : 0,
        begin_pos
      );

      if (entries.length === 0) {
        return toolResponse("No log entries found.");
      }

      const logLines = [`**Server Logs (${entries.length} entries):**`, ""];
      for (let i = 0; i < entries.length; i++) {
        logLines.push(`${i + 1}. ${entries[i].l}`);
      }
      return toolResponse(logLines.join("\n"));
    })
  );

  server.tool(
    "get_connection_info",
    "Get detailed connection information for the virtual server",
    {},
    handleToolError("get_connection_info", async () => {
      const ts = await conn.getClient();
      const info = await ts.connectionInfo();

      const lines = ["**Server Connection Information:**", ""];
      const entries = Object.entries(info);
      for (const [key, value] of entries) {
        lines.push(`- **${key}**: ${value}`);
      }
      return toolResponse(lines.join("\n"));
    })
  );
}
