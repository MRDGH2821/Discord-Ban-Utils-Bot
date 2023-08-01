import type { GuildMember, User } from 'discord.js';
import type { BanExportOptions, ListImportOptions } from './typeDefs';

export type BotGuildBanAddOptions = {
  convict: User;
  executor: GuildMember;
  reason: string;
};

export const BUEvents = {
  BanListExport: 'banListExport' as const,
  ListImport: 'listImport' as const,
  BotGuildBanAdd: 'botGuildBanAdd' as const,
} as const;

export interface BUEventParams {
  [BUEvents.BanListExport]: [payload: BanExportOptions];
  [BUEvents.ListImport]: [payload: ListImportOptions];
  [BUEvents.BotGuildBanAdd]: [payload: BotGuildBanAddOptions];
}
