import "./lib/setup.js";
import { LogLevel, SapphireClient } from "@sapphire/framework";
import { GatewayIntentBits, Partials } from "discord.js";
import { botLogger } from "./bot-logger.js";

const client = new SapphireClient({
  defaultPrefix: "!",
  caseInsensitiveCommands: true,
  logger: {
    instance: botLogger,
    level: LogLevel.Debug,
    depth: 2,
  },
  intents: [
    GatewayIntentBits.AutoModerationConfiguration,
    GatewayIntentBits.AutoModerationExecution,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildWebhooks,
  ],
  loadMessageCommandListeners: true,
  partials: [Partials.GuildMember, Partials.User, Partials.User],
});
// client.stores.registerPath(__dirname);
const main = async () => {
  try {
    client.logger.info("Logging in");
    await client.login();
    client.logger.info(`Logged in as: ${client.user?.tag}`);
  } catch (error) {
    client.logger.fatal(error);
    client.destroy().catch((error_) => botLogger.error(error_));
    process.exit(1);
  }
};

void main();
