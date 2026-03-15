import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TeamSpeakConnection } from "./connection.js";
import type { ToolModule } from "./config.js";
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

type RegisterFn = (server: McpServer, conn: TeamSpeakConnection) => void;

const registry: Record<ToolModule, RegisterFn> = {
  server: registerServerTools,
  channel: registerChannelTools,
  client: registerClientTools,
  sgroup: registerServerGroupTools,
  cgroup: registerChannelGroupTools,
  permission: registerPermissionTools,
  messaging: registerMessagingTools,
  moderation: registerModerationTools,
  token: registerTokenTools,
  file: registerFileTools,
};

export function createServer(conn: TeamSpeakConnection, enabledTools: Set<ToolModule>): McpServer {
  const server = new McpServer({
    name: "teamspeak-mcp",
    version: "1.0.0",
  });

  for (const [module, register] of Object.entries(registry)) {
    if (enabledTools.has(module as ToolModule)) {
      register(server, conn);
    }
  }

  return server;
}
