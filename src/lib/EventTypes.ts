import type { AnyInteractableInteraction } from '@sapphire/discord.js-utilities';
import { container } from '@sapphire/framework';
import type { GuildMember, User } from 'discord.js';
import type { DBSchema } from './Database';
import type { BanExportOptions, ListImportOptions } from './typeDefs';

export type ValueOf<T> = T[keyof T];

export type BotGuildBanAddOptions = {
  convict: User;
  executor: GuildMember;
  reason: string;
};
export type BotGuildBanRemoveOptions = BotGuildBanAddOptions;
export type BotGuildMemberKickOptions = Pick<BotGuildBanAddOptions, 'reason' | 'executor'> & {
  convict: GuildMember;
};
export type BotTimeoutOptions = BotGuildMemberKickOptions;
export type BotSettingsUpdateOptions = {
  oldSettings?: DBSchema['servers']['Data'] | undefined | null;
  newSettings: DBSchema['servers']['Data'];
};

export type FilterListUpdateOptions = {
  guildId: string;
  exportFilter: string[];
  importFilter: string[];
  mode: 'add' | 'remove';
  interaction: AnyInteractableInteraction;
};

export const BUEvents = {
  BanListExport: 'banListExport' as const,
  ListImport: 'listImport' as const,
  BotGuildBanAdd: 'botGuildBanAdd' as const,
  BotGuildBanRemove: 'botGuildBanRemove' as const,
  BotGuildMemberKick: 'botGuildMemberKick' as const,
  BotTimeout: 'botTimeout' as const,
  BotSettingsUpdate: 'botSettingsUpdate' as const,
  FilterListUpdate: 'filterListUpdate' as const,
} as const;

export interface BUEventParams {
  [BUEvents.BanListExport]: [payload: BanExportOptions];
  [BUEvents.ListImport]: [payload: ListImportOptions];
  [BUEvents.BotGuildBanAdd]: [payload: BotGuildBanAddOptions];
  [BUEvents.BotGuildBanRemove]: [payload: BotGuildBanRemoveOptions];
  [BUEvents.BotGuildMemberKick]: [payload: BotGuildMemberKickOptions];
  [BUEvents.BotTimeout]: [payload: BotTimeoutOptions];
  [BUEvents.BotSettingsUpdate]: [payload: BotSettingsUpdateOptions];
  [BUEvents.FilterListUpdate]: [payload: FilterListUpdateOptions];
}

export function emitBotEvent<E extends keyof BUEventParams>(
  event: ValueOf<typeof BUEvents>,
  ...args: BUEventParams[E]
) {
  container.client.emit(event, ...args);
}
