import { s } from '@sapphire/shapeshift';
import db from '../Firestore';
import type { AllExclusionListOptions, AllSettingsOptions } from '../typeDefs';
import type ExclusionListData from './ExclusionList/ExclusionListData';
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

export const ExclusionListValidator = s.object<AllExclusionListOptions>({
  importExclusion: s.array(s.string).optional,
  exportExclusion: s.array(s.string).optional,
  guildId: s.string,
});

export const dbExclusionListRef = db
  .collection('exclusion-list')
  .withConverter<AllExclusionListOptions>({
    toFirestore: (ExclusionList: ExclusionListData | AllExclusionListOptions) => ({
      ...ExclusionList,
    }),
    fromFirestore: (snapshot) => ExclusionListValidator.parse(snapshot.data()),
  });
