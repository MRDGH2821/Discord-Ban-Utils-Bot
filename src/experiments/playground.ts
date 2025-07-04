import { schema } from "typesaurus";
import { botLogger } from "../bot-logger.js";
import db from "../lib/Database.js";

const oldDB = schema(($) => ({
  servers: $.collection<Setting, Setting["serverID"]>(),
}));

type Setting = {
  logChannelID: string;
  logWebhookID: string;
  serverID: string;
};
const SID = "911985492281688134";
oldDB.servers
  .all()
  .then(async (servers) => {
    for (const server of servers) {
      // return servers.forEach((server) =>
      if (!server) {
        new Error("No server found");
        continue;
      }

      botLogger.info(`Migrating ${server.data.serverID}`);
      const oldValues = server.data;
      const { logChannelID, logWebhookID, serverID, ...newValues } = oldValues;
      await server
        .remove()
        .then(async () =>
          db.servers.upset(SID, {
            guildId: serverID,
            webhookId: logWebhookID,
            ...newValues,
          }),
        )
        .then(() => botLogger.info(`Migrated ${serverID}`));

      // );
    }
  })
  .catch((error) => botLogger.error(error));
