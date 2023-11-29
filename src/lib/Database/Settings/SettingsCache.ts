import { container } from '@sapphire/framework';
import { Collection } from 'discord.js';
import { dbSettingsRef, settingsValidator } from '../../DBUtils';
import type { AllSettingsOptions, CoreSettingsOptions } from '../../typeDefs';
import SettingsData from './SettingsData';

export default class SettingsCache {
  static {
    dbSettingsRef.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'removed') {
          container.logger.debug('Removed setting: ', change.doc.data());
          this.#removeSettingFromCache(change.doc.data().guildId);
        } else {
          container.logger.debug('Updated setting: ', change.doc.data());
          this.#updateSettingInCache(change.doc.data());
        }
      });
    });
  }

  static #cache = new Collection<string, SettingsData>();

  static async #fetchDB() {
    await dbSettingsRef
      .get()
      .then((snapshot) =>
        snapshot.forEach((doc) => {
          const data = doc.data();
          const settings = new SettingsData(data);
          this.#cache.set(settings.guildId, settings);
        }),
      )
      .catch((error) => container.logger.error(error));
  }

  static #fetchData(guildId: string) {
    return dbSettingsRef
      .doc(guildId)
      .get()
      .then((doc) => {
        const data = doc.data();
        const validatedData = settingsValidator.parse(data);
        const settings = new SettingsData(validatedData);
        return this.#cache.set(settings.guildId, settings);
      });
  }

  static async getSettings(guildId: string, force = false) {
    if (this.#cache.size === 0) await this.#fetchDB();

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

  static #updateSettingInCache(settings: AllSettingsOptions) {
    const validatedData = settingsValidator.parse(settings);
    const newSettings = new SettingsData(validatedData);
    this.#cache.set(newSettings.guildId, newSettings);
  }

  static #removeSettingFromCache(guildId: string) {
    this.#cache.delete(guildId);
  }
}