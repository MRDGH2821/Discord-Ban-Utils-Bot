import { container } from '@sapphire/framework';
import type { GuildMember, User } from 'discord.js';
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

export const BUEvents = {
  BanListExport: 'banListExport' as const,
  ListImport: 'listImport' as const,
  BotGuildBanAdd: 'botGuildBanAdd' as const,
  BotGuildBanRemove: 'botGuildBanRemove' as const,
  BotGuildMemberKick: 'botGuildMemberKick' as const,
} as const;

export interface BUEventParams {
  [BUEvents.BanListExport]: [payload: BanExportOptions];
  [BUEvents.ListImport]: [payload: ListImportOptions];
  [BUEvents.BotGuildBanAdd]: [payload: BotGuildBanAddOptions];
  [BUEvents.BotGuildBanRemove]: [payload: BotGuildBanRemoveOptions];
  [BUEvents.BotGuildMemberKick]: [payload: BotGuildMemberKickOptions];
}

export function emitBotEvent<E extends keyof BUEventParams>(
  event: ValueOf<typeof BUEvents>,
  ...args: BUEventParams[E]
) {
  container.client.emit(event, ...args);
}
