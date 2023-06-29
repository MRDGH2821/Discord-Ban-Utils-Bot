import { s } from '@sapphire/shapeshift';
import { Collection } from 'discord.js';
import db from './Firestore';
import SettingsData from './SettingsData';
import type { CoreSettingsOptions, SettingsOptions } from './typeDefs';

const settingsValidator = s.object<SettingsOptions & CoreSettingsOptions>({
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

export default class Database {
  static #cache = new Collection<string, SettingsData>();

  static async #fetchDB() {
    await db
      .collection('settings')
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          const data = doc.data();
          const validatedData = settingsValidator.parse(data);
          const settings = new SettingsData(validatedData);
          this.#cache.set(settings.guildId, settings);
        });
      });
  }

  static #fetchData(guildId: string) {
    return db
      .collection('settings')
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

    return db
      .collection('settings')
      .doc(settings.guildId)
      .set(validatedData)
      .then(() => settings);
  }
}
