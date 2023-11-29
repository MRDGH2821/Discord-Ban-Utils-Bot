import { container } from '@sapphire/framework';
import { Collection } from 'discord.js';
import type { AllSettingsOptions, CoreSettingsOptions } from '../../typeDefs';
import { dbSettingsRef, settingsValidator } from '../DBUtils';
import SettingsData from './SettingsData';

export default class SettingsCache {
  static {
    dbSettingsRef.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'removed') {
          container.logger.debug('Removed setting: ', change.doc.data());
          this.#delete(change.doc.data().guildId);
        } else {
          container.logger.debug('Updated setting: ', change.doc.data());
          this.#update(change.doc.data());
        }
      });
    });
  }

  static #cache = new Collection<string, SettingsData>();

  static async #fetchAll() {
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

  static #fetchOne(guildId: string) {
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

  static async find(guildId: string, force = false) {
    if (this.#cache.size === 0) await this.#fetchAll();

    if (force) await this.#fetchOne(guildId);

    return this.#cache.get(guildId);
  }

  static async createSetting(options: CoreSettingsOptions) {
    const validatedData = settingsValidator.parse(options);
    const settings = new SettingsData(validatedData);
    this.#cache.set(settings.guildId, settings);

    return dbSettingsRef
      .doc(settings.guildId)
      .set(validatedData)
      .then(() => settings);
  }

  static #update(settings: AllSettingsOptions) {
    const validatedData = settingsValidator.parse(settings);
    const newSettings = new SettingsData(validatedData);
    this.#cache.set(newSettings.guildId, newSettings);
  }

  static #delete(guildId: string) {
    this.#cache.delete(guildId);
  }
}
