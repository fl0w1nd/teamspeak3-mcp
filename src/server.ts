import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TeamSpeakConnection } from "./connection.js";
import { registerCoreTools } from "./tools/core.js";
import { registerMessagingTools } from "./tools/messaging.js";
import { registerChannelTools } from "./tools/channel.js";
import { registerClientTools } from "./tools/client.js";
import { registerServerGroupTools } from "./tools/server-group.js";
import { registerModerationTools } from "./tools/moderation.js";
import { registerSearchTools } from "./tools/search.js";

export function createServer(conn: TeamSpeakConnection): McpServer {
  const server = new McpServer({
    name: "teamspeak-mcp",
    version: "1.0.0",
  });

  registerCoreTools(server, conn);
  registerMessagingTools(server, conn);
  registerChannelTools(server, conn);
  registerClientTools(server, conn);
  registerServerGroupTools(server, conn);
  registerModerationTools(server, conn);
  registerSearchTools(server, conn);

  return server;
}
