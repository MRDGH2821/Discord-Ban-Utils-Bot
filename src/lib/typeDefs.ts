import type {
  Guild, Message, TextBasedChannel, User,
} from 'discord.js';

export type BanEntity = string;
export type BanEntityWithReason = { id: string; reason: string | null | undefined };
export type BanType = BanEntity | BanEntityWithReason;

export type BanExportOptions = {
  sourceGuild: Guild;
  requesterUser: User;
  notifyInChannel: TextBasedChannel;
  includeReason: boolean;
  sourceMessage: Message;
};
