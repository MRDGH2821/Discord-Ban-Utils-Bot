import { dbSettingsRef } from './DBUtils';
import type { AllSettingsOptions, SettingsOptions, SettingsParameter } from './typeDefs';

export const SettingsDescription: { [x in keyof Required<AllSettingsOptions>]: string } = {
  sendBanLog: 'Send Ban Log',
  sendBanCopyLog: 'Send Ban Copy Log',
  sendBanExportLog: 'Send Ban list Export Log',
  sendImportLog: 'Send Un/Ban list Import Log',
  sendExitLog: 'Send Member Exit Log',
  sendJoinLog: 'Send Member Join Log',
  sendKickLog: 'Send Kicked Member Log',
  sendMassBanLog: 'Send Mass Ban Log',
  sendMassUnbanLog: 'Send Mass UnBan Log',
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
    Object.assign(this, options);
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

    return dbSettingsRef.doc(this.guildId).set(newSettings, { merge: true });
  }

  modifySetting(setting: SettingsParameter, value: boolean) {
    const newSettings = { [setting]: value };
    Object.assign(this, newSettings);

    return dbSettingsRef
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
    const settings = keys.map((key) => `${SettingsDescription[key]}: ${this[key]}`);
    return settings.join('\n');
  }
}
