import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TeamSpeakConnection } from "../connection.js";
import { handleToolError, toolResponse } from "../utils/tool-handler.js";

export function registerSearchTools(server: McpServer, conn: TeamSpeakConnection): void {
  server.tool(
    "search_clients",
    "Search for clients by name pattern or unique identifier",
    {
      pattern: z.string().describe("Search pattern for client name or UID"),
      search_by_uid: z.boolean().default(false).describe("Search by unique identifier instead of name"),
    },
    handleToolError("search_clients", async ({ pattern, search_by_uid }) => {
      const ts = await conn.getClient();

      if (search_by_uid) {
        const results = await ts.clientDbFind(pattern, true);
        const data = results.map((r) => ({ database_id: r.cldbid }));
        return toolResponse(data, data.length === 0 ? `No clients found matching UID pattern '${pattern}'.` : undefined);
      }

      const results = await ts.clientFind(pattern);
      const data = results.map((r) => ({ client_id: r.clid, nickname: r.clientNickname }));
      return toolResponse(data, data.length === 0 ? `No online clients found matching '${pattern}'.` : undefined);
    })
  );

  server.tool(
    "find_channels",
    "Search for channels by name pattern",
    {
      pattern: z.string().describe("Search pattern for channel name"),
    },
    handleToolError("find_channels", async ({ pattern }) => {
      const ts = await conn.getClient();
      const results = await ts.channelFind(pattern);
      const data = results.map((r) => ({ channel_id: r.cid, name: r.channelName }));
      return toolResponse(data, data.length === 0 ? `No channels found matching '${pattern}'.` : undefined);
    })
  );
}
