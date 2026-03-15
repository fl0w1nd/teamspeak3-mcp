#!/usr/bin/env node

import "dotenv/config";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { parseConfig } from "./config.js";
import { TeamSpeakConnection } from "./connection.js";
import { createServer } from "./server.js";

async function main(): Promise<void> {
  const config = parseConfig(process.argv.slice(2));
  const conn = new TeamSpeakConnection(config);
  const server = createServer(conn);

  const shutdown = async () => {
    try {
      await conn.disconnect();
    } catch {
      // best-effort cleanup
    }
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
