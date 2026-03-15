export interface AppConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  serverId: number;
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

  return {
    host: args.get("host") ?? process.env.TEAMSPEAK_HOST ?? "localhost",
    port: parseInt(args.get("port") ?? process.env.TEAMSPEAK_PORT ?? "10011", 10),
    user: args.get("user") ?? process.env.TEAMSPEAK_USER ?? "serveradmin",
    password,
    serverId: parseInt(args.get("server-id") ?? process.env.TEAMSPEAK_SERVER_ID ?? "1", 10),
  };
}
