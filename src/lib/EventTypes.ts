import type { AnyInteractableInteraction } from "@sapphire/discord.js-utilities";
import { container } from "@sapphire/framework";
import type { GuildMember, User } from "discord.js";
import type { DBSchema } from "./Database.js";
import type { BanExportOptions, ListImportOptions } from "./typeDefs.js";

export type ValueOf<T> = T[keyof T];

export type BotGuildBanAddOptions = {
  convict: User;
  executor: GuildMember;
  reason: string;
};
export type BotGuildBanRemoveOptions = BotGuildBanAddOptions;
export type BotGuildMemberKickOptions = Pick<
  BotGuildBanAddOptions,
  "executor" | "reason"
> & {
  convict: GuildMember;
};
export type BotTimeoutOptions = BotGuildMemberKickOptions;
export type BotSettingsUpdateOptions = {
  newSettings: DBSchema["servers"]["Data"];
  oldSettings?: DBSchema["servers"]["Data"] | null | undefined;
};

export type FilterListUpdateOptions = {
  exportFilter: string[];
  guildId: string;
  importFilter: string[];
  interaction: AnyInteractableInteraction;
  mode: "add" | "remove";
};

export const BUEvents = {
  BanListExport: "banListExport" as const,
  ListImport: "listImport" as const,
  BotGuildBanAdd: "botGuildBanAdd" as const,
  BotGuildBanRemove: "botGuildBanRemove" as const,
  BotGuildMemberKick: "botGuildMemberKick" as const,
  BotTimeout: "botTimeout" as const,
  BotSettingsUpdate: "botSettingsUpdate" as const,
  FilterListUpdate: "filterListUpdate" as const,
} as const;

export type BUEventParams = {
  [BUEvents.BanListExport]: [payload: BanExportOptions];
  [BUEvents.ListImport]: [payload: ListImportOptions];
  [BUEvents.BotGuildBanAdd]: [payload: BotGuildBanAddOptions];
  [BUEvents.BotGuildBanRemove]: [payload: BotGuildBanRemoveOptions];
  [BUEvents.BotGuildMemberKick]: [payload: BotGuildMemberKickOptions];
  [BUEvents.BotTimeout]: [payload: BotTimeoutOptions];
  [BUEvents.BotSettingsUpdate]: [payload: BotSettingsUpdateOptions];
  [BUEvents.FilterListUpdate]: [payload: FilterListUpdateOptions];
};

export function emitBotEvent<E extends keyof BUEventParams>(
  event: ValueOf<typeof BUEvents>,
  ...args: BUEventParams[E]
) {
  container.client.emit(event, ...args);
}
