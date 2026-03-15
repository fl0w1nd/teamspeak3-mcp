import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TeamSpeakConnection } from "./connection.js";
import { registerCoreTools } from "./tools/core.js";
import { registerMessagingTools } from "./tools/messaging.js";

export function createServer(conn: TeamSpeakConnection): McpServer {
  const server = new McpServer({
    name: "teamspeak-mcp",
    version: "1.0.0",
  });

  registerCoreTools(server, conn);
  registerMessagingTools(server, conn);

  return server;
}
