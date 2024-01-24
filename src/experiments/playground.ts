/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable unicorn/prefer-top-level-await */
/* eslint-disable pii/no-phone-number */
import '../lib/Firestore';
import { botLogger } from '../bot-logger';
import SettingsDB from './db/settings';

async function main() {
  botLogger.info('Getting data');
  await SettingsDB.servers
    .get('803424731474034709')
    .then((data) => botLogger.info(data))
    .catch((error) => botLogger.error(error));
}

void main();
