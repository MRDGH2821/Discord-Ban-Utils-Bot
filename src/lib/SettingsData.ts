import db from './Firestore';
import type { CoreSettingsOptions, SettingsOptions, SettingsParameter } from './typeDefs';

export default class SettingsData implements SettingsOptions, CoreSettingsOptions {
  sendBanLog?: boolean;

  sendUnbanLog?: boolean;

  sendExitLog?: boolean;

  sendJoinLog?: boolean;

  sendKickLog?: boolean;

  sendTimeoutLog?: boolean;

  sendUnTimeoutLog?: boolean;

  sendBanImportLog?: boolean;

  sendBanExportLog?: boolean;

  sendBanCopyLog?: boolean;

  sendMassBanLog?: boolean;

  sendMassUnbanLog?: boolean;

  webhookId: string;

  guildId: string;

  constructor(options: SettingsOptions & CoreSettingsOptions) {
    this.webhookId = options.webhookId;
    this.guildId = options.guildId;
    this.sendBanLog = options.sendBanLog;
    this.sendUnbanLog = options.sendUnbanLog;
    this.sendExitLog = options.sendExitLog;
    this.sendJoinLog = options.sendJoinLog;
    this.sendKickLog = options.sendKickLog;
    this.sendTimeoutLog = options.sendTimeoutLog;
    this.sendUnTimeoutLog = options.sendUnTimeoutLog;
    this.sendBanImportLog = options.sendBanImportLog;
    this.sendBanExportLog = options.sendBanExportLog;
    this.sendBanCopyLog = options.sendBanCopyLog;
    this.sendMassBanLog = options.sendMassBanLog;
    this.sendMassUnbanLog = options.sendMassUnbanLog;
  }

  modifySettings(settings: SettingsParameter[] | SettingsOptions) {
    let newSettings: SettingsOptions;
    if (Array.isArray(settings)) {
      newSettings = settings.reduce<SettingsOptions>((acc, curr) => {
        acc[curr] = true;
        return acc;
      }, {});
      Object.assign(this, newSettings);
    } else {
      newSettings = settings;
      Object.assign(this, settings);
    }

    return db.collection('settings').doc(this.guildId).set(newSettings, { merge: true });
  }

  modifySetting(setting: SettingsParameter, value: boolean) {
    const newSettings = { [setting]: value };
    Object.assign(this, newSettings);

    return db
      .collection('settings')
      .doc(this.guildId)
      .set(newSettings, { merge: true, mergeFields: [setting] });
  }

  toJSON() {
    return {
      sendBanLog: this.sendBanLog || false,
      sendUnbanLog: this.sendUnbanLog || false,
      sendExitLog: this.sendExitLog || false,
      sendJoinLog: this.sendJoinLog || false,
      sendKickLog: this.sendKickLog || false,
      sendTimeoutLog: this.sendTimeoutLog || false,
      sendUnTimeoutLog: this.sendUnTimeoutLog || false,
      sendBanImportLog: this.sendBanImportLog || false,
      sendBanExportLog: this.sendBanExportLog || false,
      sendBanCopyLog: this.sendBanCopyLog || false,
      sendMassBanLog: this.sendMassBanLog || false,
      sendMassUnbanLog: this.sendMassUnbanLog || false,
      guildId: this.guildId,
      webhookId: this.webhookId,
    };
  }

  toString() {
    return Object.entries(this)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
  }
}
