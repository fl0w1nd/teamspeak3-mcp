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

      if (tokens.length === 0) {
        return toolResponse("No privilege tokens found.");
      }

      const lines = ["**Privilege Tokens:**", ""];
      for (const t of tokens) {
        const tokenPreview = t.token.length > 20 ? t.token.slice(0, 20) + "..." : t.token;
        const typeName = t.tokenType === 0 ? "Server Group" : "Channel Group";
        lines.push(`- **Token**: ${tokenPreview}`);
        lines.push(`  - Type: ${typeName} (ID: ${t.tokenId1})`);
        lines.push(`  - Description: ${t.tokenDescription || "No description"}`);
        lines.push("");
      }
      return toolResponse(lines.join("\n"));
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

      return toolResponse(`Privilege token created successfully\n**Token**: ${result.token}`);
    })
  );
}
