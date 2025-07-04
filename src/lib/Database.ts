import "./Firestore.js";
import type { Guild, User, Webhook } from "discord.js";
import type { Typesaurus } from "typesaurus";
import { schema } from "typesaurus";

const db = schema(($) => ({
  servers: $.collection<Setting, Setting["guildId"]>(),
  filterList: $.collection<FilterList, FilterList["guildId"]>().name(
    "filter-list",
  ),
}));

type Setting = {
  guildId: Guild["id"];
  sendBanExportLog?: boolean | null;
  sendBanLog?: boolean | null;
  sendExitLog?: boolean | null;
  sendImportLog?: boolean | null;
  sendJoinLog?: boolean | null;
  sendKickLog?: boolean | null;
  sendMassBanLog?: boolean | null;
  sendMassUnbanLog?: boolean | null;
  sendTimeoutLog?: boolean | null;
  sendUnTimeoutLog?: boolean | null;
  sendUnbanLog?: boolean | null;
  webhookId: Webhook["id"];
};

type FilterList = {
  exportFilter: User["id"][];
  guildId: Guild["id"];
  importFilter: User["id"][];
};

export default db;

export type DBSchema = Typesaurus.Schema<typeof db>;
