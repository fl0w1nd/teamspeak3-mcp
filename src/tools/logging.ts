import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LogLevel } from "ts3-nodejs-library";
import type { TeamSpeakConnection } from "../connection.js";
import { handleToolError, toolResponse } from "../utils/tool-handler.js";

const LOG_LEVEL_MAP: Record<number, LogLevel> = {
  1: LogLevel.ERROR,
  2: LogLevel.WARNING,
  3: LogLevel.DEBUG,
  4: LogLevel.INFO,
};

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
      const ts = conn.getClient();
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
    "add_log_entry",
    "Add a custom entry to the server log",
    {
      log_level: z.number().min(1).max(4).describe("Log level (1=ERROR, 2=WARNING, 3=DEBUG, 4=INFO)"),
      message: z.string().describe("Log message to add"),
    },
    handleToolError("add_log_entry", async ({ log_level, message }) => {
      const ts = conn.getClient();
      const level = LOG_LEVEL_MAP[log_level];
      if (!level) throw new Error("Invalid log level");
      await ts.logAdd(level, message);
      return toolResponse("Log entry added successfully");
    })
  );

  server.tool(
    "get_connection_info",
    "Get detailed connection information for the virtual server",
    {},
    handleToolError("get_connection_info", async () => {
      const ts = conn.getClient();
      const info = await ts.connectionInfo();

      const lines = ["**Server Connection Information:**", ""];
      const entries = Object.entries(info);
      for (const [key, value] of entries) {
        lines.push(`- **${key}**: ${value}`);
      }
      return toolResponse(lines.join("\n"));
    })
  );

  server.tool(
    "get_instance_logs",
    "Get instance-level logs instead of virtual server logs",
    {
      lines: z.number().min(1).max(100).default(50).describe("Number of log lines to retrieve"),
      reverse: z.boolean().default(true).describe("Show logs in reverse order (newest first)"),
      begin_pos: z.number().optional().describe("Starting position in log file"),
    },
    handleToolError("get_instance_logs", async ({ lines: lineCount, reverse, begin_pos }) => {
      const ts = conn.getClient();
      const entries = await ts.logView(
        lineCount,
        reverse ? 1 : 0,
        1,
        begin_pos
      );

      if (entries.length === 0) {
        return toolResponse("No instance log entries found.");
      }

      const logLines = [`**Instance Logs (${entries.length} entries):**`, ""];
      for (let i = 0; i < entries.length; i++) {
        logLines.push(`${i + 1}. ${entries[i].l}`);
      }
      return toolResponse(logLines.join("\n"));
    })
  );
}
