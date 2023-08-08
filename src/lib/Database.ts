import { Collection } from 'discord.js';
import { dbSettingsRef, settingsValidator } from './DBUtils';
import SettingsData from './SettingsData';
import type { AllSettingsOptions, CoreSettingsOptions } from './typeDefs';

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
