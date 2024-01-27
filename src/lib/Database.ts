import type { Guild, User, Webhook } from 'discord.js';
import type { Typesaurus } from 'typesaurus';
import { schema } from 'typesaurus';

const db = schema(($) => ({
  servers: $.collection<Setting, Setting['guildId']>(),
  exclusionList: $.collection<ExclusionList, ExclusionList['guildId']>().name('exclusion-list'),
}));

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

interface ExclusionList {
  importExclusion: User['id'][];
  exportExclusion: User['id'][];
  guildId: Guild['id'];
}

export default db;

export type DBSchema = Typesaurus.Schema<typeof db>;
