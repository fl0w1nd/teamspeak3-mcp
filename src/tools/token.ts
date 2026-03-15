import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TokenType } from "ts3-nodejs-library";
import type { TeamSpeakConnection } from "../connection.js";
import { handleToolError, toolResponse } from "../utils/tool-handler.js";

export function registerTokenTools(server: McpServer, conn: TeamSpeakConnection): void {
  server.tool(
    "token_list",
    "List all privilege keys/tokens available on the server",
    {},
    handleToolError("token_list", async () => {
      const ts = await conn.getClient();
      const tokens = await ts.privilegeKeyList();
      const data = tokens.map((t) => ({
        token: t.token,
        type: t.tokenType === 0 ? "server_group" : "channel_group",
        group_id: t.tokenId1,
        description: t.tokenDescription || null,
      }));
      return toolResponse(data, data.length === 0 ? "No privilege tokens exist on this server." : undefined);
    })
  );

  server.tool(
    "token_create",
    "Create a new privilege key/token for server or channel group access",
    {
      token_type: z.number().min(0).max(1).describe("0 = server group token, 1 = channel group token"),
      group_id: z.number().describe("Server group ID (type=0) or channel group ID (type=1)"),
      channel_id: z.number().optional().describe("Channel ID (required for channel group tokens)"),
      description: z.string().optional().describe("Token description"),
      custom_set: z.string().optional().describe("Custom client properties (format: ident=value|ident=value)"),
    },
    handleToolError("token_create", async ({ token_type, group_id, channel_id, description, custom_set }) => {
      const ts = await conn.getClient();

      if (token_type === TokenType.ServerGroup) {
        const result = await ts.privilegeKeyAdd(TokenType.ServerGroup, String(group_id), undefined, description, custom_set);
        return toolResponse({ token: result.token });
      }

      if (channel_id === undefined) throw new Error("channel_id is required for channel group tokens");
      const result = await ts.privilegeKeyAdd(TokenType.ChannelGroup, String(group_id), String(channel_id), description, custom_set);
      return toolResponse({ token: result.token });
    })
  );
}
