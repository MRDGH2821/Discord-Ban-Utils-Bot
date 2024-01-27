import './EnvConfig';
import fs from 'node:fs';
import * as path from 'node:path';
import type { ServiceAccount } from 'firebase-admin/app';
import { applicationDefault, cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { botLogger as logger } from '../bot-logger';

// eslint-disable-next-line import/prefer-default-export
export function decodeBase64(base64String: string) {
  return Buffer.from(base64String, 'base64').toString();
}

const baseDir = path.resolve(process.cwd(), 'firebase-service-acc');
function searchCredFilePath(): string | undefined {
  const files = fs.readdirSync(baseDir);
  const credFile = files.find((file) => file.endsWith('.json'));
  if (credFile) {
    try {
      const credPath = path.resolve(baseDir, credFile);
      cert(credPath);
      logger.info('Using firebase service account credentials from:', credPath);
      return credPath;
    } catch (error) {
      logger.error(error);
      logger.warn('Invalid firebase service account credentials file:', credFile);
      return undefined;
    }
  } else {
    logger.warn('No firebase service account credentials file found in:', baseDir);
  }
  return undefined;
}
if (process.env.NODE_ENV === 'development') {
  logger.info('Searching for Firebase credentials file in:', baseDir);
  searchCredFilePath();
} else {
  process.env.FIRESTORE_EMULATOR_HOST = '';
  process.env.GOOGLE_APPLICATION_CREDENTIALS = searchCredFilePath();
}

function searchCredEnv() {
  if (
    !process.env.FIREBASE_CLIENT_EMAIL ||
    !process.env.FIREBASE_PRIVATE_KEY ||
    !process.env.FIREBASE_PROJECT_ID
  ) {
    logger.warn('Firebase credentials not found in 3 environment variables.');
    return null;
  }
  logger.info('Using firebase service account credentials from 3 environment variables.');
  return cert({
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

function searchBase64CredEnv() {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    logger.warn('Firebase credentials not found in base64 environment variable.');
    return null;
  }
  logger.info('Using firebase service account credentials from base64 environment variable.');
  const decoded = decodeBase64(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64);
  const cred = JSON.parse(decoded) as ServiceAccount;
  return cert(cred);
}

const finalCred = searchBase64CredEnv() || searchCredEnv() || applicationDefault();

if (!finalCred) {
  throw new Error("Can't find firebase service account credentials.");
}

initializeApp({
  credential: finalCred,
});
const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });
