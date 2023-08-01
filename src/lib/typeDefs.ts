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
export type SettingsOptions = {
  sendBanLog?: boolean;
  sendUnbanLog?: boolean;
  sendExitLog?: boolean;
  sendJoinLog?: boolean;
  sendKickLog?: boolean;
  sendTimeoutLog?: boolean;
  sendUnTimeoutLog?: boolean;
  sendImportLog?: boolean;
  sendBanExportLog?: boolean;
  sendBanCopyLog?: boolean;
};

export type CoreSettingsOptions = {
  webhookId: string;
  guildId: string;
};
/* jscpd:ignore-end */

export type AllSettingsOptions = SettingsOptions & CoreSettingsOptions;

export type SettingsParameter = keyof SettingsOptions;

export type CoreSettingsParameter = keyof CoreSettingsOptions;

export type AllSettingsParamenter = SettingsParameter | CoreSettingsParameter;

export type SendLogOptions = {
  guild: Guild;
  title: string;
  description: string;
  type: SettingsParameter;
};
