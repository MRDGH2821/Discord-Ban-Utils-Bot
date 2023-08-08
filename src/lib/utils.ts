import type { AnyInteractableInteraction } from '@sapphire/discord.js-utilities';
import {
  container,
  type ChatInputCommandSuccessPayload,
  type Command,
  type ContextMenuCommandSuccessPayload,
  type MessageCommandSuccessPayload,
} from '@sapphire/framework';
import { s } from '@sapphire/shapeshift';
import { cyan } from 'colorette';
import type {
  APIEmbed, APIUser, Guild, GuildMember, User, Webhook,
} from 'discord.js';
import { COLORS } from './Constants';
import Database from './Database';
import { emitBotEvent } from './EventTypes';
import type {
  BanEntity,
  BanEntityWithReason,
  ListImportOptions,
  SendLogOptions,
  SettingsOptions,
  SettingsParameter,
} from './typeDefs';

function getShardInfo(id: number) {
  return `[${cyan(id.toString())}]`;
}

function getCommandInfo(command: Command) {
  return cyan(command.name);
}

function getAuthorInfo(author: User | APIUser) {
  return `${author.username}[${cyan(author.id)}]`;
}

function getGuildInfo(guild: Guild | null) {
  if (guild === null) return 'Direct Messages';
  return `${guild.name}[${cyan(guild.id)}]`;
}

export function getSuccessLoggerData(guild: Guild | null, user: User, command: Command) {
  const shard = getShardInfo(guild?.shardId ?? 0);
  const commandName = getCommandInfo(command);
  const author = getAuthorInfo(user);
  const sentAt = getGuildInfo(guild);

  return {
    shard,
    commandName,
    author,
    sentAt,
  };
}

export function logSuccessCommand(
  payload:
  | ContextMenuCommandSuccessPayload
  | ChatInputCommandSuccessPayload
  | MessageCommandSuccessPayload,
): void {
  let successLoggerData: ReturnType<typeof getSuccessLoggerData>;

  if ('interaction' in payload) {
    successLoggerData = getSuccessLoggerData(
      payload.interaction.guild,
      payload.interaction.user,
      payload.command,
    );
  } else {
    successLoggerData = getSuccessLoggerData(
      payload.message.guild,
      payload.message.author,
      payload.command,
    );
  }

  container.logger.debug(
    `${successLoggerData.shard} - ${successLoggerData.commandName} ${successLoggerData.author} ${successLoggerData.sentAt}`,
  );
}

/**
 * truncates string to given length and appends "..."
 * @function truncateString
 * @param {string} str - input string
 * @param {number} num - truncate length
 * @returns {string} - truncated string
 */
export function truncateString(str: string, num: number): string {
  if (str.length <= num) {
    return str;
  }
  return `${str.slice(0, num)}...`;
}

type DebugEmbedOptions = {
  title: string;
  description: string;
  error: Error | unknown;
  checks: { question: string; result: boolean }[];
  solution: string;
  inputs: { name: string; value: string }[];
};

/**
 * Creates a debug embed
 * @function debugErrorEmbed
 * @param options {DebugEmbedOptions} - options for the debug embed
 * @returns {APIEmbed} - the debug embed
 */
export function debugErrorEmbed(options: DebugEmbedOptions): APIEmbed {
  return {
    title: options.title,
    description: options.description,
    color: COLORS.error,
    fields: [
      {
        name: '**Checks**',
        value: options.checks
          .map((check) => `${check.question}? **\`${check.result}\`**`)
          .join('\n'),
      },
      {
        name: '**Possible Solutions**',
        value: options.solution,
      },
      {
        name: '**Inputs**',
        value: options.inputs.map((input) => `${input.name}: ${input.value}`).join('\n'),
      },
      {
        name: '**Error Message**',
        value: `${options.error}\n\n${JSON.stringify(options.error, null, 2)}}`,
      },
    ],
  };
}

export function debugErrorFile(error: Error) {
  return {
    name: 'Error Dump.txt',
    attachment: Buffer.from(`${error}\n-------------------\n\n${JSON.stringify(error, null, 2)}`),
  };
}

export async function fetchAllBans(guild: Guild) {
  const first1kBans = await guild.bans.fetch();
  let masterBanList = first1kBans.clone();
  while (masterBanList.size % 1000 === 0) {
    // eslint-disable-next-line no-await-in-loop
    const newBanList = await guild.bans.fetch({
      limit: 1000,
      after: masterBanList.lastKey(),
    });
    masterBanList = masterBanList.concat(newBanList);
  }
  return masterBanList;
}

export const selectedSettingsValidator = s
  .array(
    s.enum<SettingsParameter>(
      'sendBanLog',
      'sendUnbanLog',
      'sendExitLog',
      'sendJoinLog',
      'sendKickLog',
      'sendTimeoutLog',
      'sendUnTimeoutLog',
      'sendImportLog',
      'sendBanExportLog',
      'sendBanCopyLog',
    ),
  )
  .transform((values) =>
    values.reduce<SettingsOptions>((acc, curr) => {
      acc[curr] = true;
      return acc;
    }, {}));

export async function sendLog({
  guild, title, description, type,
}: SendLogOptions) {
  const settings = await Database.getSettings(guild.id);
  if (!settings) return;
  if (!settings.webhookId) return;
  if (!settings[type]) return;

  const hook = await guild
    .fetchWebhooks()
    .then((hooks) => hooks.find((h) => h.id === settings.webhookId));
  if (!hook) return;

  hook.send({
    embeds: [
      {
        title,
        description,
        color: COLORS.invisible,
      },
    ],
  });
}

export function jumpLink(user: GuildMember | GuildMember['user']) {
  return `https://discord.com/users/${user.id}`;
}

export function getWebhook(guildId: Guild['id'], webhookId?: Webhook['id']) {
  return (
    container.client.guilds
      .fetch(guildId)
      .then((guild) => guild.fetchWebhooks())
      // eslint-disable-next-line max-len
      .then((hooks) =>
        hooks.find((w) => w.id === webhookId || w.owner?.id === container.client.user?.id))
  );
}

export function banEntitySchemaBuilder(banReason: string) {
  const transformer = (value: string) => ({
    id: value,
    reason: banReason,
  });
  return s
    .array<BanEntity>(s.string.lengthGreaterThan(1))
    .transform<BanEntityWithReason[]>((values) => values.map((v) => transformer(v)));
}

export async function importList(
  interaction: AnyInteractableInteraction,
  list: BanEntityWithReason[],
  guild: Guild,
  mode: ListImportOptions['mode'],
) {
  const msg = await interaction.editReply({
    embeds: [
      {
        title: `Importing ${mode} list`,
        description: `Found ${list.length} ${mode}s.\n\nYou will be notified here when the import is complete.`,
        color: COLORS.whiteGray,
      },
    ],
  });
  container.logger.debug(
    'Found',
    list.length,
    `${mode}s to import in guild`,
    guild.name,
    '(',
    guild.id,
    ')',
  );

  const importOptions: ListImportOptions = {
    destinationGuild: guild,
    requesterUser: interaction.user,
    sourceMessage: msg,
    list,
    mode,
  };
  emitBotEvent('ListImport', importOptions);
  // interaction.client.emit('importBanList', importOptions);
  return msg;
}
export { emitBotEvent };
