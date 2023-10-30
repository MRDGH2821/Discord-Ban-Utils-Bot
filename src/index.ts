import { LogLevel, SapphireClient } from '@sapphire/framework';
import { GatewayIntentBits, Partials } from 'discord.js';
import './lib/setup';
import { botLogger } from './bot-logger';

const client = new SapphireClient({
  defaultPrefix: '!',
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
client.stores.registerPath(__dirname);
const main = async () => {
  try {
    client.logger.info('Logging in');
    await client.login();
    client.logger.info('Logged in');
  } catch (error) {
    client.logger.fatal(error);
    client.destroy();
    process.exit(1);
  }
};

main();
