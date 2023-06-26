import admin from 'firebase-admin';
import fs from 'fs';
import Nodefire from 'nodefire';
import * as path from 'path';
import './EnvConfig';

Nodefire.setCacheSize(50);

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
const app = admin.initializeApp();

app.firestore().settings({ ignoreUndefinedProperties: true });

const db = new Nodefire(app.database().ref());

export default db;
