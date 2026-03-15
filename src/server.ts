import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TeamSpeakConnection } from "./connection.js";
import { registerServerTools } from "./tools/server.js";
import { registerChannelTools } from "./tools/channel.js";
import { registerClientTools } from "./tools/client.js";
import { registerServerGroupTools } from "./tools/server-group.js";
import { registerChannelGroupTools } from "./tools/channel-group.js";
import { registerPermissionTools } from "./tools/permission.js";
import { registerMessagingTools } from "./tools/messaging.js";
import { registerModerationTools } from "./tools/moderation.js";
import { registerTokenTools } from "./tools/token.js";
import { registerFileTools } from "./tools/file.js";

export function createServer(conn: TeamSpeakConnection): McpServer {
  const server = new McpServer({
    name: "teamspeak-mcp",
    version: "1.0.0",
  });

  registerServerTools(server, conn);
  registerChannelTools(server, conn);
  registerClientTools(server, conn);
  registerServerGroupTools(server, conn);
  registerChannelGroupTools(server, conn);
  registerPermissionTools(server, conn);
  registerMessagingTools(server, conn);
  registerModerationTools(server, conn);
  registerTokenTools(server, conn);
  registerFileTools(server, conn);

  return server;
}
