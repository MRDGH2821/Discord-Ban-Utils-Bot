import type { Guild, Webhook } from 'discord.js';
import { schema } from 'typesaurus';

const SettingsDB = schema(($) => ({
  servers: $.collection<Settings>(),
}));

type Settings = Record<Guild['id'], Setting>;

interface Setting {
  guildId: Guild['id'];
  webhookId: Webhook['id'];
  sendBanCopyLog?: boolean | null;
  sendBanExportLog?: boolean | null;
  sendBanLog?: boolean | null;
  sendExitLog?: boolean | null;
  sendImportLog?: boolean | null;
  sendJoinLog?: boolean | null;
  sendKickLog?: boolean | null;
  sendMassBanLog?: boolean | null;
  sendMassUnbanLog?: boolean | null;
  sendTimeoutLog?: boolean | null;
  sendUnbanLog?: boolean | null;
  sendUnTimeoutLog?: boolean | null;
}

export default SettingsDB;
