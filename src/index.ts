import { LogLevel, SapphireClient } from "@sapphire/framework";
import { GatewayIntentBits } from "discord.js";
import "./lib/setup";

const client = new SapphireClient({
  defaultPrefix: "!",
  caseInsensitiveCommands: true,
  logger: {
    level: LogLevel.Debug,
  },
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
  ],
  loadMessageCommandListeners: true,
});

const main = async () => {
  try {
    client.logger.info("Logging in");
    await client.login();
    client.logger.info("Logged in");
  } catch (error) {
    client.logger.fatal(error);
    client.destroy();
    process.exit(1);
  }
};

main();
