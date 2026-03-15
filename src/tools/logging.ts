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
      const data = entries.map((e) => e.l);
      return toolResponse(data, data.length === 0 ? "No log entries found." : undefined);
    })
  );

  server.tool(
    "get_connection_info",
    "Get detailed connection information for the virtual server",
    {},
    handleToolError("get_connection_info", async () => {
      const ts = await conn.getClient();
      const info = await ts.connectionInfo();
      return toolResponse(info);
    })
  );
}
