import type { GuildBan, GuildMember } from 'discord.js';
import type { BanExportOptions, BanImportOptions } from './typeDefs';

export const BUEvents = {
  BanListExport: 'banListExport' as const,
  BanListImport: 'banListImport' as const,
  BotGuildBanAdd: 'botGuildBanAdd' as const,
} as const;

export interface BUEventParams {
  [BUEvents.BanListExport]: [payload: BanExportOptions];
  [BUEvents.BanListImport]: [payload: BanImportOptions];
  [BUEvents.BotGuildBanAdd]: [ban: GuildBan, executor: GuildMember];
}

declare module 'discord.js' {
  interface ClientEvents extends BUEventParams {}
}
