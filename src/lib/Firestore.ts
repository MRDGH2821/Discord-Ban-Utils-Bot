import fs from 'fs';
import * as path from 'path';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import './EnvConfig';

const basePath = path.resolve(process.cwd(), 'firebase-service-acc');
if (process.env.NODE_ENV !== 'development') {
  process.env.FIRESTORE_EMULATOR_HOST = '';
  const configs = fs.readdirSync(basePath).filter((file) => file.endsWith('.json'));

  console.debug(configs);
  configs.sort();

  const validConfigs = configs.filter((config) => {
    const configPath = path.resolve(basePath, config);
    // console.log(configPath);
    const configContents = JSON.parse(fs.readFileSync(configPath).toString());
    // console.log(configContents);

    if (configContents.type === 'service_account') {
      return true;
    }
    return false;
  });
  const certPath = path.resolve(basePath, validConfigs[0]);
  // console.log(certPath);
  process.env.GOOGLE_APPLICATION_CREDENTIALS = certPath;
}
initializeApp();
const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });

export default db;
