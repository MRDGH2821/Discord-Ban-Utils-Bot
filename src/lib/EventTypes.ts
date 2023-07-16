import type { GuildMember, User } from 'discord.js';
import type { BanExportOptions, BanImportOptions } from './typeDefs';

export type BotGuildBanAddOptions = {
  convict: User;
  executor: GuildMember;
  reason: string;
};

export const BUEvents = {
  BanListExport: 'banListExport' as const,
  BanListImport: 'banListImport' as const,
  BotGuildBanAdd: 'botGuildBanAdd' as const,
} as const;

export interface BUEventParams {
  [BUEvents.BanListExport]: [payload: BanExportOptions];
  [BUEvents.BanListImport]: [payload: BanImportOptions];
  [BUEvents.BotGuildBanAdd]: [payload: BotGuildBanAddOptions];
}
