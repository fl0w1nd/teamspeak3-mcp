import { TeamSpeak, QueryProtocol } from "ts3-nodejs-library";
import type { AppConfig } from "./config.js";

export class TeamSpeakConnection {
  private client: TeamSpeak | null = null;
  private readonly config: AppConfig;

  constructor(config: AppConfig) {
    this.config = config;
  }

  async connect(): Promise<TeamSpeak> {
    if (this.client) {
      return this.client;
    }

    this.client = await TeamSpeak.connect({
      host: this.config.host,
      queryport: this.config.port,
      protocol: QueryProtocol.RAW,
      username: this.config.user,
      password: this.config.password,
      nickname: "TeamSpeak-MCP",
    });

    await this.client.useBySid(String(this.config.serverId));
    return this.client;
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
    }
  }

  getClient(): TeamSpeak {
    if (!this.client) {
      throw new Error("Not connected to TeamSpeak server. Use connect_to_server first.");
    }
    return this.client;
  }

  isConnected(): boolean {
    return this.client !== null;
  }
}
