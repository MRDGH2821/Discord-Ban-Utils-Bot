import { s } from '@sapphire/shapeshift';
import type SettingsData from './Database/Settings/SettingsData';
import db from './Firestore';
import type { AllSettingsOptions } from './typeDefs';

export const settingsValidator = s.object<AllSettingsOptions>({
  sendBanLog: s.boolean.optional,
  sendUnbanLog: s.boolean.optional,
  sendExitLog: s.boolean.optional,
  sendJoinLog: s.boolean.optional,
  sendKickLog: s.boolean.optional,
  sendTimeoutLog: s.boolean.optional,
  sendUnTimeoutLog: s.boolean.optional,
  sendImportLog: s.boolean.optional,
  sendBanExportLog: s.boolean.optional,
  sendBanCopyLog: s.boolean.optional,
  sendMassBanLog: s.boolean.optional,
  sendMassUnbanLog: s.boolean.optional,
  webhookId: s.string,
  guildId: s.string,
});

export const dbSettingsRef = db.collection('settings').withConverter<AllSettingsOptions>({
  toFirestore: (settings: SettingsData | AllSettingsOptions) => ({
    ...settings,
  }),
  fromFirestore: (snapshot) => settingsValidator.parse(snapshot.data()),
});
