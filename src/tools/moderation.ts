import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TeamSpeakConnection } from "../connection.js";
import { handleToolError, toolResponse } from "../utils/tool-handler.js";

export function registerModerationTools(server: McpServer, conn: TeamSpeakConnection): void {
  server.tool(
    "ban_list",
    "List all active ban rules on the virtual server",
    {},
    handleToolError("ban_list", async () => {
      const ts = await conn.getClient();
      const bans = await ts.banList();
      const data = bans.map((b) => ({
        ban_id: b.banid,
        ip: b.ip || null,
        name: b.name || null,
        uid: b.uid || null,
        duration: b.duration,
        invoker: b.invokername,
      }));
      return toolResponse(data, data.length === 0 ? "No active ban rules on this server." : undefined);
    })
  );

  server.tool(
    "ban_manage",
    "Create, delete, or clear ban rules on the server",
    {
      action: z.enum(["add", "delete", "delete_all"]).describe("Action to perform"),
      ban_id: z.number().optional().describe("Ban ID (required for delete)"),
      ip: z.string().optional().describe("IP address pattern to ban"),
      name: z.string().optional().describe("Name pattern to ban"),
      uid: z.string().optional().describe("Client unique identifier to ban"),
      time: z.number().default(0).describe("Ban duration in seconds (0 = permanent)"),
      reason: z.string().default("Banned by AI").describe("Ban reason"),
    },
    handleToolError("ban_manage", async ({ action, ban_id, ip, name, uid, time, reason }) => {
      const ts = await conn.getClient();

      if (action === "add") {
        const props: Record<string, string | number | undefined> = { time, banreason: reason };
        if (ip) props.ip = ip;
        if (name) props.name = name;
        if (uid) props.uid = uid;
        await ts.ban(props as Parameters<typeof ts.ban>[0]);
        return toolResponse({ status: "ok", action: "add", ip: ip ?? null, name: name ?? null, uid: uid ?? null });
      }

      if (action === "delete") {
        if (ban_id === undefined) throw new Error("ban_id is required for delete");
        await ts.banDel(String(ban_id));
        return toolResponse({ status: "ok", action: "delete", ban_id });
      }

      await ts.banDel();
      return toolResponse({ status: "ok", action: "delete_all" });
    })
  );

  server.tool(
    "complaint_list",
    "List complaints on the virtual server, optionally filtered by target client",
    {
      target_client_db_id: z.number().optional().describe("Target client database ID to filter"),
    },
    handleToolError("complaint_list", async ({ target_client_db_id }) => {
      const ts = await conn.getClient();
      const complaints = await ts.complainList(
        target_client_db_id !== undefined ? String(target_client_db_id) : undefined
      );
      const data = complaints.map((c) => ({
        target: { name: c.tname, database_id: c.tcldbid },
        from: { name: c.fname, database_id: c.fcldbid },
        message: c.message,
        timestamp: c.timestamp,
      }));
      return toolResponse(data, data.length === 0 ? "No complaints found." : undefined);
    })
  );
}
