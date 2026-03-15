import { TeamSpeak, QueryProtocol } from "ts3-nodejs-library";
import type { AppConfig } from "./config.js";

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

export class TeamSpeakConnection {
  private client: TeamSpeak | null = null;
  private readonly config: AppConfig;

  constructor(config: AppConfig) {
    this.config = config;
  }

  /** Connect with exponential backoff retry (up to 3 attempts). */
  async connect(): Promise<TeamSpeak> {
    if (this.client) {
      return this.client;
    }

    let lastError: unknown;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
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
      } catch (err) {
        lastError = err;
        this.client = null;

        if (attempt < MAX_RETRIES) {
          const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
          console.error(
            `[connection] Attempt ${attempt}/${MAX_RETRIES} failed, retrying in ${delay}ms...`
          );
          await new Promise((r) => setTimeout(r, delay));
        }
      }
    }

    throw new Error(
      `Failed to connect after ${MAX_RETRIES} attempts: ${lastError instanceof Error ? lastError.message : lastError}`
    );
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
    }
  }

  /**
   * Returns the active TeamSpeak client.
   * @throws {Error} If not connected — call `connect_to_server` first.
   */
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
