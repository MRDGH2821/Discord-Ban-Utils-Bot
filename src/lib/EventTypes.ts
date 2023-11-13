import { container } from '@sapphire/framework';
import type { GuildMember, User } from 'discord.js';
import type { BanExportOptions, ListImportOptions } from './typeDefs';

export type BotGuildBanAddOptions = {
  convict: User;
  executor: GuildMember;
  reason: string;
};

export type BotGuildBanRemoveOptions = BotGuildBanAddOptions;

export const BUEvents = {
  BanListExport: 'banListExport' as const,
  ListImport: 'listImport' as const,
  BotGuildBanAdd: 'botGuildBanAdd' as const,
  BotGuildBanRemove: 'botGuildBanRemove' as const,
} as const;

export interface BUEventParams {
  [BUEvents.BanListExport]: [payload: BanExportOptions];
  [BUEvents.ListImport]: [payload: ListImportOptions];
  [BUEvents.BotGuildBanAdd]: [payload: BotGuildBanAddOptions];
  [BUEvents.BotGuildBanRemove]: [payload: BotGuildBanRemoveOptions];
}

export function emitBotEvent<E extends keyof BUEventParams>(
  event: keyof typeof BUEvents,
  ...args: BUEventParams[E]
) {
  container.client.emit(event, ...args);
}
