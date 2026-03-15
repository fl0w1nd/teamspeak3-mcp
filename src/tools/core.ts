import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TeamSpeakConnection } from "../connection.js";

export function registerCoreTools(server: McpServer, conn: TeamSpeakConnection): void {
  server.tool(
    "connect_to_server",
    "Connect to the configured TeamSpeak server",
    {},
    async () => {
      await conn.connect();
      return { content: [{ type: "text", text: "TeamSpeak server connection successful" }] };
    }
  );

  server.tool(
    "server_info",
    "Get TeamSpeak server information",
    {},
    async () => {
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

      return { content: [{ type: "text", text: lines.join("\n") }] };
    }
  );

  server.tool(
    "list_clients",
    "List all clients connected to the server",
    {},
    async () => {
      const ts = conn.getClient();
      const clients = await ts.clientList();

      const lines = ["**Connected clients:**", ""];
      for (const client of clients) {
        lines.push(`- **ID ${client.clid}**: ${client.nickname} (Channel: ${client.cid})`);
      }

      return { content: [{ type: "text", text: lines.join("\n") }] };
    }
  );

  server.tool(
    "list_channels",
    "List all channels on the server",
    {},
    async () => {
      const ts = conn.getClient();
      const channels = await ts.channelList();

      const lines = ["**Available channels:**", ""];
      for (const channel of channels) {
        lines.push(`- **ID ${channel.cid}**: ${channel.name}`);
      }

      return { content: [{ type: "text", text: lines.join("\n") }] };
    }
  );
}
