import type { AnyInteractableInteraction } from "@sapphire/discord.js-utilities";
import {
  type ChatInputCommandSuccessPayload,
  type Command,
  container,
  type ContextMenuCommandSuccessPayload,
  type MessageCommandSuccessPayload,
} from "@sapphire/framework";
import { s } from "@sapphire/shapeshift";
import { codeBlock } from "@sapphire/utilities";
import { cyan } from "colorette";
import type {
  APIEmbed,
  APIUser,
  AuditLogEvent,
  ChatInputCommandInteraction,
  CommandInteractionOption,
  Guild,
  GuildMember,
  Snowflake,
  User,
  Webhook,
} from "discord.js";
import { chatInputApplicationCommandMention } from "discord.js";
import { COLORS } from "./Constants.js";
import type { DBSchema } from "./Database.js";
import db from "./Database.js";
import { emitBotEvent } from "./EventTypes.js";
import type {
  BanEntity,
  BanEntityWithReason,
  ListImportOptions,
  SendLogOptions,
  SettingsParameter,
} from "./typeDefs.js";

function getShardInfo(id: number) {
  return `[${cyan(id.toString())}]`;
}

function getCommandInfo(command: Command) {
  return cyan(command.name);
}

function getAuthorInfo(author: APIUser | User) {
  return `${author.username}[${cyan(author.id)}]`;
}

function getGuildInfo(guild: Guild | null) {
  if (guild === null) return "Direct Messages";
  return `${guild.name}[${cyan(guild.id)}]`;
}

export function getSuccessLoggerData(
  guild: Guild | null,
  user: User,
  command: Command,
) {
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
    | ChatInputCommandSuccessPayload
    | ContextMenuCommandSuccessPayload
    | MessageCommandSuccessPayload,
): void {
  const successLoggerData: ReturnType<typeof getSuccessLoggerData> =
    "interaction" in payload
      ? getSuccessLoggerData(
          payload.interaction.guild,
          payload.interaction.user,
          payload.command,
        )
      : getSuccessLoggerData(
          payload.message.guild,
          payload.message.author,
          payload.command,
        );

  container.logger.debug(
    `${successLoggerData.shard} - ${successLoggerData.commandName} ${successLoggerData.author} ${successLoggerData.sentAt}`,
  );
}

/**
 * truncates string to given length and appends "..."
 *
 * @param str - input string
 * @param num - truncate length
 * @returns - truncated string
 */
export function truncateString(str: string, num: number): string {
  if (str.length <= num) {
    return str;
  }

  return `${str.slice(0, num)}...`;
}

type DebugEmbedOptions = {
  checks: { question: string; result: boolean }[];
  description: string;
  error: Error;
  inputs: readonly Pick<CommandInteractionOption, "name" | "value">[];
  solution: string;
  title: string;
};

/**
 * Creates a debug embed
 *
 * @param options - options for the debug embed
 * @returns the debug embed
 */
export function debugErrorEmbed(options: DebugEmbedOptions): APIEmbed {
  const errField = {
    name: "**Error Message**",
    value: `${options.error.message}\n\n${codeBlock(
      "json",
      JSON.stringify(options.error, null, 2),
    )}`,
  };
  const fields = [
    {
      name: "**Checks**",
      value: options.checks
        .map((check) => `${check.question}? **\`${check.result}\`**`)
        .join("\n"),
    },
    {
      name: "**Possible Solutions**",
      value: options.solution,
    },
    {
      name: "**Inputs**",
      value: options.inputs
        .map((input) => `${input.name}: ${input.value}`)
        .join("\n"),
    },
  ];

  if (errField.value.length > 1_024) {
    const TIP =
      "_(For more details, check the error message file, if attached)_";
    errField.value = `${TIP}\n${options.error.message}\n\n${codeBlock(
      "json",
      truncateString(
        JSON.stringify(options.error, null, 2),
        900 - TIP.length - options.error.message.length,
      ),
    )}`;
  }

  fields.push(errField);
  return {
    title: options.title,
    description: options.description,
    color: COLORS.redError,
    fields,
  };
}

export function debugErrorFile(error: Error) {
  return {
    name: "Error Dump.txt",
    attachment: Buffer.from(
      `${error.message}\n-------------------\n\n${JSON.stringify(error, null, 2)}`,
    ),
  };
}

export async function fetchAllBans(guild: Guild) {
  container.logger.debug(
    "Fetching all bans in guild:",
    guild.name,
    `(${guild.id})`,
  );
  const first1kBans = await guild.bans.fetch();
  container.logger.debug(
    "Found",
    first1kBans.size,
    "bans in guild:",
    guild.name,
    `(${guild.id})`,
  );
  let masterBanList = first1kBans.clone();
  if (first1kBans.size < 1_000) return masterBanList;
  while (masterBanList.size % 1_000 === 0) {
    try {
      const newBanList = await guild.bans.fetch({
        limit: 1_000,
        after: masterBanList.lastKey()!,
      });
      container.logger.debug(
        "Found the next",
        newBanList.size,
        "bans in guild:",
        guild.name,
        `(${guild.id})`,
      );
      if (newBanList.size === 0) break;
      masterBanList = masterBanList.concat(newBanList);
    } catch (error) {
      container.logger.error(error);
      throw error;
    }
  }

  container.logger.debug(
    "Found a total of",
    masterBanList.size,
    "bans in guild:",
    guild.name,
    `(${guild.id})`,
  );
  return masterBanList;
}

export const selectedSettingsValidator = s
  .array(
    s.enum<SettingsParameter>([
      "sendBanLog",
      "sendUnbanLog",
      "sendExitLog",
      "sendJoinLog",
      "sendKickLog",
      "sendTimeoutLog",
      "sendUnTimeoutLog",
      "sendImportLog",
      "sendBanExportLog",
      "sendMassBanLog",
      "sendMassUnbanLog",
    ]),
  )
  .transform((values) => {
    const acc: Partial<DBSchema["servers"]["Data"]> = {};
    for (const key of values) {
      acc[key] = true;
    }

    return acc;
  });

export async function sendLog({
  guild,
  title,
  description,
  type,
}: SendLogOptions) {
  const settings = await db.servers.get(guild.id).then((dbDoc) => dbDoc?.data);
  if (!settings) return;
  if (!settings.webhookId) return;
  if (!settings[type]) return;

  const hook = await guild
    .fetchWebhooks()
    .then((hooks) => hooks.find((hook) => hook.id === settings.webhookId));
  if (!hook) return;

  hook
    .send({
      embeds: [
        {
          title,
          description,
          color: COLORS.charcoalInvisible,
        },
      ],
    })
    .catch((error) => container.logger.error(error));
}

export function jumpLink(user: GuildMember | GuildMember["user"]) {
  return `https://discord.com/users/${user.id}`;
}

export async function getWebhook(
  guildId: Guild["id"],
  webhookId?: Webhook["id"],
) {
  return container.client.guilds
    .fetch(guildId)
    .then(async (guild) => guild.fetchWebhooks())
    .then((hooks) =>
      hooks.find(
        (webhook) =>
          webhook.id === webhookId ||
          webhook.owner?.id === container.client.user?.id,
      ),
    );
}

export function banEntitySchemaBuilder(banReason: string) {
  const transformer = (value: string) => ({
    id: value,
    reason: banReason,
  });
  return s
    .array<BanEntity>(s.string().lengthGreaterThan(1))
    .transform<
      BanEntityWithReason[]
    >((values) => values.map((stringifiedEntity) => transformer(stringifiedEntity)));
}

export async function importList(
  interaction: AnyInteractableInteraction,
  list: BanEntityWithReason[],
  guild: Guild,
  mode: ListImportOptions["mode"],
  shouldIgnoreFilterList = mode !== "ban",
) {
  const msg = await interaction.editReply({
    embeds: [
      {
        title: `Importing ${mode} list`,
        description: `Found ${
          list.length
        } ${mode}s.\n\nYou will be notified here when the import is complete.\nFilter list is ${
          shouldIgnoreFilterList ? "ignored" : "applied"
        }`,
        color: COLORS.lightGray,
      },
    ],
  });
  container.logger.debug(
    "Found",
    list.length,
    `${mode}s to import in guild:`,
    guild.name,
    `(${guild.id})`,
  );

  const importOptions: ListImportOptions = {
    destinationGuild: guild,
    requesterUser: interaction.user,
    sourceMessage: msg,
    list,
    mode,
    shouldIgnoreFilterList,
  };
  emitBotEvent("listImport", importOptions);
  // interaction.client.emit('importBanList', importOptions);
  return msg;
}

export async function getAuditLogData(
  auditType: AuditLogEvent,
  guildId: Guild["id"],
) {
  const guild = await container.client.guilds.fetch(guildId);

  const settings = await db.servers.get(guild.id).then((dbDoc) => dbDoc?.data);
  if (!settings) return null;

  const webhook = await getWebhook(guild.id, settings.webhookId);
  if (!webhook) return null;

  const logs = await guild.fetchAuditLogs({
    limit: 1,
    type: auditType,
  });

  const latestLog = logs.entries.first();
  const executor = latestLog?.executor;
  const target = latestLog?.target;
  const reason = latestLog?.reason;
  const isDoneByCmd = executor?.id === container.client.user?.id;

  return {
    settings,
    webhook,
    executor,
    target,
    reason,
    isDoneByCmd,
    auditLog: latestLog,
  };
}

export { emitBotEvent, type ValueOf } from "./EventTypes.js";

export async function sequentialPromises<S, T>(
  params: S[],
  func: (param: S) => Promise<T>,
): Promise<T[]> {
  const results: T[] = [];
  await params.reduce(async (prev, param) => {
    await prev;
    results.push(await func(param));
  }, Promise.resolve());
  return results;
}

export const SettingsDescription: {
  [x in keyof Required<DBSchema["servers"]["Data"]>]: string;
} = {
  sendBanLog: "Send Ban Log",
  sendBanExportLog: "Send Ban list Export Log",
  sendImportLog: "Send Un/Ban list Import Log",
  sendExitLog: "Send Member Exit Log",
  sendJoinLog: "Send Member Join Log",
  sendKickLog: "Send Kicked Member Log",
  sendMassBanLog: "Send Mass Ban Log",
  sendMassUnbanLog: "Send Mass UnBan Log",
  sendTimeoutLog: "Send Timeout Log",
  sendUnbanLog: "Send Unban Log",
  sendUnTimeoutLog: "Send Un-Timeout Log",
  webhookId: "Webhook ID",
  guildId: "Server ID",
};

function isKeyOfSettingsDescription(
  key: string,
): key is keyof typeof SettingsDescription {
  return key in SettingsDescription;
}

export function settingFormatter(data: DBSchema["servers"]["Data"]) {
  const settings = Object.entries(data)
    .filter(([key]) => isKeyOfSettingsDescription(key))
    .map(([key, value]) => {
      const keyTyped = key as keyof typeof SettingsDescription;
      return `${SettingsDescription[keyTyped]}: ${value}`;
    });
  return settings.join("\n");
}

export function getCmdNameFromInteraction(
  interaction: ChatInputCommandInteraction,
) {
  const command = interaction.commandName;
  const subCmdGrp = interaction.options.getSubcommandGroup();
  const subCmd = interaction.options.getSubcommand();

  if (subCmdGrp) {
    return chatInputApplicationCommandMention(
      command,
      subCmdGrp,
      subCmd,
      interaction.commandId,
    );
  }

  if (subCmd) {
    return chatInputApplicationCommandMention(
      command,
      subCmd,
      interaction.commandId,
    );
  }

  return chatInputApplicationCommandMention(command, interaction.commandId);
}

export function formatCmdName(
  name: string,
  id: Snowflake,
  subName?: string,
  group?: string,
) {
  if (subName && group) {
    return chatInputApplicationCommandMention(name, group, subName, id);
  }

  if (subName) {
    return chatInputApplicationCommandMention(name, subName, id);
  }

  return chatInputApplicationCommandMention(name, id);
}
