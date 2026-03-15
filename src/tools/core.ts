import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TeamSpeakConnection } from "../connection.js";
import { handleToolError, toolResponse } from "../utils/tool-handler.js";

export function registerCoreTools(server: McpServer, conn: TeamSpeakConnection): void {
  server.tool(
    "server_info",
    "Get TeamSpeak server information",
    {},
    handleToolError("server_info", async () => {
      const ts = await conn.getClient();
      const info = await ts.serverInfo();
      return toolResponse({
        name: info.virtualserverName,
        version: info.virtualserverVersion,
        platform: info.virtualserverPlatform,
        clients_online: info.virtualserverClientsonline,
        max_clients: info.virtualserverMaxclients,
        uptime_seconds: info.virtualserverUptime,
        port: info.virtualserverPort,
        created: info.virtualserverCreated,
        unique_id: info.virtualserverUniqueIdentifier,
      });
    })
  );

  server.tool(
    "list_clients",
    "List all clients connected to the server",
    {},
    handleToolError("list_clients", async () => {
      const ts = await conn.getClient();
      const clients = await ts.clientList();
      const data = clients.map((c) => ({
        client_id: c.clid,
        nickname: c.nickname,
        channel_id: c.cid,
      }));
      return toolResponse(data, data.length === 0 ? "No clients are currently connected to the server." : undefined);
    })
  );

  server.tool(
    "list_channels",
    "List all channels on the server",
    {},
    handleToolError("list_channels", async () => {
      const ts = await conn.getClient();
      const channels = await ts.channelList();
      const data = channels.map((ch) => ({
        channel_id: ch.cid,
        name: ch.name,
      }));
      return toolResponse(data, data.length === 0 ? "No channels exist on the server." : undefined);
    })
  );
}
