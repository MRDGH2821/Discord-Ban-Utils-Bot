// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable promise/no-nesting */
import { schema } from "typesaurus";
import { botLogger } from "../bot-logger";
import db from "../lib/Database";

const oldDB = schema(($) => ({
  servers: $.collection<Setting, Setting["serverID"]>(),
}));

interface Setting {
  serverID: string;
  logChannelID: string;
  logWebhookID: string;
}
const SID = "911985492281688134";
oldDB.servers
  .all()
  .then((servers) => {
    return servers.forEach((server) => {
      // return servers.forEach((server) =>
      if (!server) return Error("No server found");

      botLogger.info(`Migrating ${server.data.serverID}`);
      const oldValues = server.data;
      const { logChannelID, logWebhookID, serverID, ...newValues } = oldValues;
      return server
        .remove()
        .then(() =>
          db.servers.upset(SID, {
            guildId: serverID,
            webhookId: logWebhookID,
            ...newValues,
          }),
        )
        .then(() => botLogger.info(`Migrated ${serverID}`));

      // );
    });
  })
  .catch((err) => botLogger.error(err));
