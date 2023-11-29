import { s } from '@sapphire/shapeshift';
import db from '../Firestore';
import type { AllExclusionsListOptions, AllSettingsOptions } from '../typeDefs';
import type ExclusionsListData from './ExclusionsList/ExclusionsListData';
import type SettingsData from './Settings/SettingsData';

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

export const exclusionsListValidator = s.object<AllExclusionsListOptions>({
  importExclusions: s.array(s.string).optional,
  exportExclusions: s.array(s.string).optional,
  guildId: s.string,
});

export const dbExclusionsListRef = db
  .collection('exclusionsList')
  .withConverter<AllExclusionsListOptions>({
    toFirestore: (exclusionsList: ExclusionsListData | AllExclusionsListOptions) => ({
      ...exclusionsList,
    }),
    fromFirestore: (snapshot) => exclusionsListValidator.parse(snapshot.data()),
  });
