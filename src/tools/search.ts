import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TeamSpeakConnection } from "../connection.js";

export function registerSearchTools(server: McpServer, conn: TeamSpeakConnection): void {
  server.tool(
    "search_clients",
    "Search for clients by name pattern or unique identifier",
    {
      pattern: z.string().describe("Search pattern for client name or UID"),
      search_by_uid: z.boolean().default(false).describe("Search by unique identifier instead of name"),
    },
    async ({ pattern, search_by_uid }) => {
      const ts = conn.getClient();

      if (search_by_uid) {
        const results = await ts.clientDbFind(pattern, true);
        if (results.length === 0) {
          return { content: [{ type: "text", text: `No clients found matching UID pattern '${pattern}'.` }] };
        }
        const lines = [`**Search Results for UID '${pattern}':**`, ""];
        for (const r of results) {
          lines.push(`- **DB ID ${r.cldbid}**`);
        }
        return { content: [{ type: "text", text: lines.join("\n") }] };
      }

      const results = await ts.clientFind(pattern);
      if (results.length === 0) {
        return { content: [{ type: "text", text: `No clients found matching '${pattern}'.` }] };
      }
      const lines = [`**Search Results for '${pattern}':**`, ""];
      for (const r of results) {
        lines.push(`- **ID ${r.clid}**: ${r.clientNickname}`);
      }
      return { content: [{ type: "text", text: lines.join("\n") }] };
    }
  );

  server.tool(
    "find_channels",
    "Search for channels by name pattern",
    {
      pattern: z.string().describe("Search pattern for channel name"),
    },
    async ({ pattern }) => {
      const ts = conn.getClient();
      const results = await ts.channelFind(pattern);

      if (results.length === 0) {
        return { content: [{ type: "text", text: `No channels found matching '${pattern}'.` }] };
      }

      const lines = [`**Channel Search Results for '${pattern}':**`, ""];
      for (const r of results) {
        lines.push(`- **ID ${r.cid}**: ${r.channelName}`);
      }
      return { content: [{ type: "text", text: lines.join("\n") }] };
    }
  );
}
