import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TokenType } from "ts3-nodejs-library";
import type { TeamSpeakConnection } from "../connection.js";
import { handleToolError, toolResponse } from "../utils/tool-handler.js";

export function registerTokenTools(server: McpServer, conn: TeamSpeakConnection): void {
  server.tool(
    "list_privilege_tokens",
    "List all privilege keys/tokens available on the server",
    {},
    handleToolError("list_privilege_tokens", async () => {
      const ts = await conn.getClient();
      const tokens = await ts.privilegeKeyList();
      return toolResponse(tokens.map((t) => ({
        token: t.token,
        type: t.tokenType === 0 ? "server_group" : "channel_group",
        group_id: t.tokenId1,
        description: t.tokenDescription || null,
      })));
    })
  );

  server.tool(
    "create_privilege_token",
    "Create a new privilege key/token for server or channel group access",
    {
      token_type: z.number().min(0).max(1).describe("Token type (0=server group, 1=channel group)"),
      group_id: z.number().describe("Server group ID (for type 0) or channel group ID (for type 1)"),
      channel_id: z.number().optional().describe("Channel ID (required for channel group tokens)"),
      description: z.string().optional().describe("Optional description for the token"),
      custom_set: z.string().optional().describe("Optional custom client properties (format: ident=value|ident=value)"),
    },
    handleToolError("create_privilege_token", async ({ token_type, group_id, channel_id, description, custom_set }) => {
      const ts = await conn.getClient();
      let result: { token: string };

      if (token_type === TokenType.ServerGroup) {
        result = await ts.privilegeKeyAdd(
          TokenType.ServerGroup,
          String(group_id),
          undefined,
          description,
          custom_set
        );
      } else {
        if (channel_id === undefined) {
          throw new Error("Channel ID is required for channel group tokens");
        }
        result = await ts.privilegeKeyAdd(
          TokenType.ChannelGroup,
          String(group_id),
          String(channel_id),
          description,
          custom_set
        );
      }

      return toolResponse({ token: result.token });
    })
  );
}
