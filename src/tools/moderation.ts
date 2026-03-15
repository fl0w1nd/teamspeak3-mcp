import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TeamSpeakConnection } from "../connection.js";
import { handleToolError, toolResponse } from "../utils/tool-handler.js";

export function registerModerationTools(server: McpServer, conn: TeamSpeakConnection): void {
  server.tool(
    "list_bans",
    "List all active ban rules on the virtual server",
    {},
    handleToolError("list_bans", async () => {
      const ts = await conn.getClient();
      const bans = await ts.banList();

      if (bans.length === 0) {
        return toolResponse("No active ban rules.");
      }

      const lines = ["**Active Ban Rules:**", ""];
      for (const ban of bans) {
        lines.push(`- **ID ${ban.banid}**`);
        lines.push(`  - IP: ${ban.ip || "N/A"}`);
        lines.push(`  - Name: ${ban.name || "N/A"}`);
        lines.push(`  - UID: ${ban.uid || "N/A"}`);
        lines.push(`  - Duration: ${ban.duration} seconds`);
        lines.push(`  - Invoker: ${ban.invokername}`);
        lines.push("");
      }
      return toolResponse(lines.join("\n"));
    })
  );

  server.tool(
    "manage_ban_rules",
    "Create, delete or manage ban rules",
    {
      action: z.enum(["add", "delete", "delete_all"]).describe("Action to perform"),
      ban_id: z.number().optional().describe("Ban ID (required for delete)"),
      ip: z.string().optional().describe("IP address pattern to ban"),
      name: z.string().optional().describe("Name pattern to ban"),
      uid: z.string().optional().describe("Client unique identifier to ban"),
      time: z.number().default(0).describe("Ban duration in seconds (0 = permanent)"),
      reason: z.string().default("Banned by AI").describe("Ban reason"),
    },
    handleToolError("manage_ban_rules", async ({ action, ban_id, ip, name, uid, time, reason }) => {
      const ts = await conn.getClient();

      if (action === "add") {
        const props: Record<string, string | number | undefined> = { time, banreason: reason };
        if (ip) props.ip = ip;
        if (name) props.name = name;
        if (uid) props.uid = uid;
        await ts.ban(props as Parameters<typeof ts.ban>[0]);
        return toolResponse("Ban rule added successfully");
      }

      if (action === "delete") {
        if (ban_id === undefined) throw new Error("Ban ID required for delete action");
        await ts.banDel(String(ban_id));
        return toolResponse(`Ban rule ${ban_id} deleted successfully`);
      }

      // delete_all
      await ts.banDel();
      return toolResponse("All ban rules deleted successfully");
    })
  );

  server.tool(
    "list_complaints",
    "List complaints on the virtual server",
    {
      target_client_database_id: z.number().optional().describe("Target client database ID to filter complaints"),
    },
    handleToolError("list_complaints", async ({ target_client_database_id }) => {
      const ts = await conn.getClient();
      const complaints = await ts.complainList(
        target_client_database_id !== undefined ? String(target_client_database_id) : undefined
      );

      if (complaints.length === 0) {
        return toolResponse("No complaints found.");
      }

      const lines = ["**Complaints:**", ""];
      for (const c of complaints) {
        lines.push(`- Target: ${c.tname} (DB ID: ${c.tcldbid})`);
        lines.push(`  - From: ${c.fname} (DB ID: ${c.fcldbid})`);
        lines.push(`  - Message: ${c.message}`);
        lines.push(`  - Time: ${c.timestamp}`);
        lines.push("");
      }
      return toolResponse(lines.join("\n"));
    })
  );
}
