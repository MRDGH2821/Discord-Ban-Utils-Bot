import type { Guild, Message, User } from 'discord.js';

export type BanEntity = User['id'];
export type BanEntityWithReason = { id: BanEntity; reason?: string | null };
export type BanType = BanEntity | BanEntityWithReason;

export type BanExportOptions = {
  sourceGuild: Guild;
  requesterUser: User;
  includeReason: boolean;
  sourceMessage: Message;
};

export type BanImportOptions = {
  destinationGuild: Guild;
  requesterUser: User;
  sourceMessage: Message;
  list: NonNullable<BanEntityWithReason>[];
};
