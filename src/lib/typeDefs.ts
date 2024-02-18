import type { Guild, Message, User } from 'discord.js';

export type DataType = { guildId: Guild['id'] };

export abstract class DataClass<T extends DataType> {
  constructor(options: T) {
    Object.assign(this, options);
  }
  abstract toJSON(): DataType;
  abstract toString(): string;
}

export type BanEntity = User['id'];
export type BanEntityWithReason = { id: BanEntity; reason?: string | null | undefined };
export type BanType = BanEntity | BanEntityWithReason;

export type BanExportOptions = {
  sourceGuild: Guild;
  requesterUser: User;
  includeReason: boolean;
  sourceMessage: Message;
  shouldIgnoreExclusionList: boolean;
};

export type ListImportOptions = {
  destinationGuild: Guild;
  requesterUser: User;
  sourceMessage: Message;
  list: NonNullable<BanEntityWithReason>[];
  mode: 'ban' | 'unban';
  shouldIgnoreExclusionList: boolean;
};
export type SettingsParameter =
  | 'sendBanLog'
  | 'sendUnbanLog'
  | 'sendExitLog'
  | 'sendJoinLog'
  | 'sendKickLog'
  | 'sendTimeoutLog'
  | 'sendUnTimeoutLog'
  | 'sendImportLog'
  | 'sendBanExportLog'
  | 'sendMassBanLog'
  | 'sendMassUnbanLog';
export type SendLogOptions = {
  guild: Guild;
  title: string;
  description: string;
  type: SettingsParameter;
};
