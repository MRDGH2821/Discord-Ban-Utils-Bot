import type { Guild, Message, User } from "discord.js";

export type DataType = { guildId: Guild["id"] };

export abstract class DataClass<T extends DataType> {
  public constructor(options: T) {
    Object.assign(this, options);
  }
  public abstract toJSON(): DataType;
  public abstract toString(): string;
}

export type BanEntity = User["id"];
export type BanEntityWithReason = {
  id: BanEntity;
  reason?: string | null | undefined;
};
export type BanType = BanEntity | BanEntityWithReason;

export type BanExportOptions = {
  includeReason: boolean;
  requesterUser: User;
  shouldIgnoreFilterList: boolean;
  sourceGuild: Guild;
  sourceMessage: Message;
};

export type ListImportOptions = {
  destinationGuild: Guild;
  list: NonNullable<BanEntityWithReason>[];
  mode: "ban" | "unban";
  requesterUser: User;
  shouldIgnoreFilterList: boolean;
  sourceMessage: Message;
};
export type SettingsParameter =
  | "sendBanExportLog"
  | "sendBanLog"
  | "sendExitLog"
  | "sendImportLog"
  | "sendJoinLog"
  | "sendKickLog"
  | "sendMassBanLog"
  | "sendMassUnbanLog"
  | "sendTimeoutLog"
  | "sendUnbanLog"
  | "sendUnTimeoutLog";
export type SendLogOptions = {
  description: string;
  guild: Guild;
  title: string;
  type: SettingsParameter;
};
