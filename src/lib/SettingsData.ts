import db from './Firestore';
import type { AllSettingsOptions, SettingsOptions, SettingsParameter } from './typeDefs';

const translation: { [x in keyof Required<AllSettingsOptions>]: string } = {
  sendBanLog: 'Send Ban Log',
  sendBanCopyLog: 'Send Ban Copy Log',
  sendBanExportLog: 'Send Ban list Export Log',
  sendImportLog: 'Send Un/Ban list Import Log',
  sendExitLog: 'Send Member Exit Log',
  sendJoinLog: 'Send Member Join Log',
  sendKickLog: 'Send Kicked Member Log',
  sendTimeoutLog: 'Send Timeout Log',
  sendUnbanLog: 'Send Unban Log',
  sendUnTimeoutLog: 'Send Un-Timeout Log',
  webhookId: 'Webhook ID',
  guildId: 'Server ID',
};

export default class SettingsData implements AllSettingsOptions {
  sendBanLog?: boolean;

  sendUnbanLog?: boolean;

  sendExitLog?: boolean;

  sendJoinLog?: boolean;

  sendKickLog?: boolean;

  sendTimeoutLog?: boolean;

  sendUnTimeoutLog?: boolean;

  sendImportLog?: boolean;

  sendBanExportLog?: boolean;

  sendBanCopyLog?: boolean;

  sendMassBanLog?: boolean;

  sendMassUnbanLog?: boolean;

  webhookId: string;

  guildId: string;

  constructor(options: AllSettingsOptions) {
    this.webhookId = options.webhookId;
    this.guildId = options.guildId;
    this.sendBanLog = options.sendBanLog;
    this.sendUnbanLog = options.sendUnbanLog;
    this.sendExitLog = options.sendExitLog;
    this.sendJoinLog = options.sendJoinLog;
    this.sendKickLog = options.sendKickLog;
    this.sendTimeoutLog = options.sendTimeoutLog;
    this.sendUnTimeoutLog = options.sendUnTimeoutLog;
    this.sendImportLog = options.sendImportLog;
    this.sendBanExportLog = options.sendBanExportLog;
    this.sendBanCopyLog = options.sendBanCopyLog;
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
      ...this,
    };
  }

  toString() {
    const keys = Object.keys(this) as (keyof AllSettingsOptions)[];
    const settings = keys.map((key) => `${translation[key]}: ${this[key]}`);
    return settings.join('\n');
  }
}
