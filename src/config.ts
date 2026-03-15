export const ALL_TOOL_MODULES = [
  "server", "channel", "client", "sgroup", "cgroup",
  "permission", "messaging", "moderation", "token", "file",
] as const;

export type ToolModule = (typeof ALL_TOOL_MODULES)[number];

export interface AppConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  serverId: number;
  tools: Set<ToolModule>;
}

export function parseConfig(argv: string[]): AppConfig {
  const args = new Map<string, string>();

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith("--") && i + 1 < argv.length) {
      args.set(arg.slice(2), argv[++i]);
    }
  }

  const password = args.get("password") ?? process.env.TEAMSPEAK_PASSWORD ?? "";

  if (!password) {
    console.error(
      "[config] Warning: No TeamSpeak password provided. " +
      "Set --password or TEAMSPEAK_PASSWORD. Connection will likely fail."
    );
  }

  const toolsRaw = args.get("tools") ?? process.env.TEAMSPEAK_TOOLS ?? "";
  const tools = parseToolModules(toolsRaw);

  return {
    host: args.get("host") ?? process.env.TEAMSPEAK_HOST ?? "localhost",
    port: parseInt(args.get("port") ?? process.env.TEAMSPEAK_PORT ?? "10011", 10),
    user: args.get("user") ?? process.env.TEAMSPEAK_USER ?? "serveradmin",
    password,
    serverId: parseInt(args.get("server-id") ?? process.env.TEAMSPEAK_SERVER_ID ?? "1", 10),
    tools,
  };
}

function parseToolModules(raw: string): Set<ToolModule> {
  if (!raw.trim()) return new Set(ALL_TOOL_MODULES);

  const valid = new Set<string>(ALL_TOOL_MODULES);
  const result = new Set<ToolModule>();

  for (const name of raw.split(",")) {
    const trimmed = name.trim().toLowerCase();
    if (!trimmed) continue;
    if (!valid.has(trimmed)) {
      console.error(
        `[config] Unknown tool module "${trimmed}". Available: ${ALL_TOOL_MODULES.join(", ")}`,
      );
      continue;
    }
    result.add(trimmed as ToolModule);
  }

  if (result.size === 0) {
    console.error("[config] No valid tool modules specified, loading all.");
    return new Set(ALL_TOOL_MODULES);
  }

  return result;
}
