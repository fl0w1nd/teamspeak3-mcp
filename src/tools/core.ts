import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TeamSpeakConnection } from "../connection.js";
import { handleToolError, toolResponse } from "../utils/tool-handler.js";

export function registerCoreTools(server: McpServer, conn: TeamSpeakConnection): void {
  server.tool(
    "connect_to_server",
    "Connect to the configured TeamSpeak server",
    {},
    handleToolError("connect_to_server", async () => {
      await conn.connect();
      return toolResponse("TeamSpeak server connection successful");
    })
  );

  server.tool(
    "server_info",
    "Get TeamSpeak server information",
    {},
    handleToolError("server_info", async () => {
      const ts = conn.getClient();
      const info = await ts.serverInfo();

      const lines = [
        "**TeamSpeak Server Information:**",
        "",
        `- **Name**: ${info.virtualserverName}`,
        `- **Version**: ${info.virtualserverVersion}`,
        `- **Platform**: ${info.virtualserverPlatform}`,
        `- **Clients**: ${info.virtualserverClientsonline}/${info.virtualserverMaxclients}`,
        `- **Uptime**: ${info.virtualserverUptime} seconds`,
        `- **Port**: ${info.virtualserverPort}`,
        `- **Created**: ${info.virtualserverCreated}`,
        `- **Unique ID**: ${info.virtualserverUniqueIdentifier}`,
      ];

      return toolResponse(lines.join("\n"));
    })
  );

  server.tool(
    "list_clients",
    "List all clients connected to the server",
    {},
    handleToolError("list_clients", async () => {
      const ts = conn.getClient();
      const clients = await ts.clientList();

      const lines = ["**Connected clients:**", ""];
      for (const client of clients) {
        lines.push(`- **ID ${client.clid}**: ${client.nickname} (Channel: ${client.cid})`);
      }

      return toolResponse(lines.join("\n"));
    })
  );

  server.tool(
    "list_channels",
    "List all channels on the server",
    {},
    handleToolError("list_channels", async () => {
      const ts = conn.getClient();
      const channels = await ts.channelList();

      const lines = ["**Available channels:**", ""];
      for (const channel of channels) {
        lines.push(`- **ID ${channel.cid}**: ${channel.name}`);
      }

      return toolResponse(lines.join("\n"));
    })
  );
}
