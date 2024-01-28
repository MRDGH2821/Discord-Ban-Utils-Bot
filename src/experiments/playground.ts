import { schema } from 'typesaurus';
import { botLogger } from '../bot-logger';
import db from '../lib/Database';

const oldDB = schema(($) => ({
  servers: $.collection<Setting, Setting['serverID']>(),
}));

interface Setting {
  serverID: string;
  logChannelID: string;
  logWebhookID: string;
}

oldDB.servers
  .get('00000000000')
  .then((server) => {
    // return servers.forEach((server) =>

    botLogger.info(`Migrating ${server.data.serverID}`);
    return db.servers
      .set(server.data.serverID, {
        guildId: server.data.serverID,
        webhookId: server.data.logWebhookID,
      })
      .then(() => server.remove());

    // );
  })
  .catch(botLogger.error);
