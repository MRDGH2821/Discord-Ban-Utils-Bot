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

export type ListImportOptions = {
  destinationGuild: Guild;
  requesterUser: User;
  sourceMessage: Message;
  list: NonNullable<BanEntityWithReason>[];
  mode: 'ban' | 'unban';
};

/* jscpd:ignore-start */
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
  | 'sendBanCopyLog'
  | 'sendMassBanLog'
  | 'sendMassUnbanLog';

export type SettingsOptions = Partial<Record<SettingsParameter, boolean>>;

export type CoreSettingsOptions = {
  webhookId: string;
  guildId: Guild['id'];
};
/* jscpd:ignore-end */

export type AllSettingsOptions = SettingsOptions & CoreSettingsOptions;

export type CoreSettingsParameter = keyof CoreSettingsOptions;

export type AllSettingsParamenter = SettingsParameter | CoreSettingsParameter;

export type SendLogOptions = {
  guild: Guild;
  title: string;
  description: string;
  type: SettingsParameter;
};
