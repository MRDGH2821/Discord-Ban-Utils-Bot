import { s } from '@sapphire/shapeshift';
import { Collection } from 'discord.js';
import db from './Firestore';
import SettingsData from './SettingsData';
import type { AllSettingsOptions, CoreSettingsOptions } from './typeDefs';

const settingsValidator = s.object<AllSettingsOptions>({
  sendBanLog: s.boolean.optional,
  sendUnbanLog: s.boolean.optional,
  sendExitLog: s.boolean.optional,
  sendJoinLog: s.boolean.optional,
  sendKickLog: s.boolean.optional,
  sendTimeoutLog: s.boolean.optional,
  sendUnTimeoutLog: s.boolean.optional,
  sendBanImportLog: s.boolean.optional,
  sendBanExportLog: s.boolean.optional,
  sendBanCopyLog: s.boolean.optional,
  sendMassBanLog: s.boolean.optional,
  sendMassUnbanLog: s.boolean.optional,
  webhookId: s.string,
  guildId: s.string,
});

const dbSettingsRef = db.collection('settings').withConverter<AllSettingsOptions>({
  toFirestore: (settings: SettingsData | AllSettingsOptions) => ({ ...settings }),
  fromFirestore: (snapshot) => settingsValidator.parse(snapshot.data()),
});

export default class Database {
  static #cache = new Collection<string, SettingsData>();

  static async #fetchDB() {
    await dbSettingsRef.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        const data = doc.data();
        const settings = new SettingsData(data);
        this.#cache.set(settings.guildId, settings);
      });
    });
  }

  static #fetchData(guildId: string) {
    return dbSettingsRef
      .doc(guildId)
      .get()
      .then((doc) => {
        const data = doc.data();
        const validatedData = settingsValidator.parse(data);
        const settings = new SettingsData(validatedData);
        this.#cache.set(settings.guildId, settings);
      });
  }

  static async getSettings(guildId: string, force = false) {
    if (this.#cache.size < 1) await this.#fetchDB();

    if (force) await this.#fetchData(guildId);

    return this.#cache.get(guildId);
  }

  static async newServerSetting(options: CoreSettingsOptions) {
    const validatedData = settingsValidator.parse(options);
    const settings = new SettingsData(validatedData);
    this.#cache.set(settings.guildId, settings);

    return dbSettingsRef
      .doc(settings.guildId)
      .set(validatedData)
      .then(() => settings);
  }
}
