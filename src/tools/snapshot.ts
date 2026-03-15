import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TeamSpeakConnection } from "../connection.js";

export function registerSnapshotTools(server: McpServer, conn: TeamSpeakConnection): void {
  server.tool(
    "create_server_snapshot",
    "Create a snapshot of the virtual server configuration",
    {},
    async () => {
      const ts = conn.getClient();
      const result = await ts.createSnapshot();

      const preview = result.snapshot.length > 500
        ? result.snapshot.slice(0, 500) + "..."
        : result.snapshot;

      const lines = [
        "**Server Snapshot Created Successfully**",
        "",
        `- **Version**: ${result.version}`,
        "",
        "Snapshot data (preview):",
        "```",
        preview,
        "```",
        "",
        "Use `deploy_server_snapshot` with the full snapshot data to restore this configuration.",
      ];

      return { content: [{ type: "text", text: lines.join("\n") }] };
    }
  );

  server.tool(
    "deploy_server_snapshot",
    "Deploy/restore a server configuration from a snapshot",
    {
      snapshot_data: z.string().describe("Snapshot data to deploy (from create_server_snapshot)"),
    },
    async ({ snapshot_data }) => {
      const ts = conn.getClient();
      await ts.deploySnapshot(snapshot_data);
      return {
        content: [{
          type: "text",
          text: "Server snapshot deployed successfully\n\nNote: The server configuration has been restored from the snapshot.",
        }],
      };
    }
  );
}
