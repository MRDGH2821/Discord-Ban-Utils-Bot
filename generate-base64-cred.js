import fs from 'fs';
import path from 'path';

const baseDir = path.resolve(process.cwd(), 'firebase-service-acc');
const files = fs.readdirSync(baseDir);
const credFile = files.find((file) => file.endsWith('.json'));

if (!credFile) {
  throw new Error('No Firebase credential file found');
}
const cred = JSON.parse(fs.readFileSync(path.resolve(baseDir, credFile), 'utf-8'));
const jsonString = JSON.stringify(cred);

const encoded = Buffer.from(jsonString).toString('base64');

fs.writeFileSync(
  './firebase-service-acc/firebase-admin-cred-base64.txt',
  `FIREBASE_SERVICE_ACCOUNT_BASE64=${encoded}`,
);

console.log('Saved to ./firebase-service-acc/firebase-admin-cred-base64.txt');
