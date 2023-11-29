import { container } from '@sapphire/framework';
import { Collection } from 'discord.js';
import { AllExclusionsListOptions } from '../../typeDefs';
import { dbExclusionsListRef, exclusionsListValidator } from '../DBUtils';
import ExclusionsListData from './ExclusionsListData';

export default class ExclusionsListCache {
  static {
    dbExclusionsListRef.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'removed') {
          container.logger.debug('Removed exclusions list: ', change.doc.data());
          this.#delete(change.doc.data().guildId);
        } else {
          container.logger.debug('Updated exclusions list: ', change.doc.data());
          this.#update(change.doc.data());
        }
      });
    });
  }

  static #cache = new Collection<string, ExclusionsListData>();

  static async #fetchAll() {
    await dbExclusionsListRef
      .get()
      .then((snapshot) =>
        snapshot.forEach((doc) => {
          const data = doc.data();
          const exclusionsList = new ExclusionsListData(data);
          this.#cache.set(exclusionsList.guildId, exclusionsList);
        }),
      )
      .catch((error) => container.logger.error(error));
  }

  static async find(guildId: string, force = false) {
    if (this.#cache.size === 0) await this.#fetchAll();

    if (force) await this.#fetchOne(guildId);

    return this.#cache.get(guildId);
  }

  static #fetchOne(guildId: string) {
    return dbExclusionsListRef
      .doc(guildId)
      .get()
      .then((doc) => {
        const data = doc.data();
        const validatedData = exclusionsListValidator.parse(data);
        const exclusionsList = new ExclusionsListData(validatedData);
        return this.#cache.set(exclusionsList.guildId, exclusionsList);
      });
  }

  static async #update(list: AllExclusionsListOptions) {
    const validatedData = exclusionsListValidator.parse(list);

    const oldData = await this.find(list.guildId);

    if (oldData) {
      const newData = new ExclusionsListData({
        guildId: list.guildId,
        exportExclusions: [
          ...new Set([
            ...(oldData.exportExclusions || []),
            ...(validatedData.exportExclusions || []),
          ]),
        ],
        importExclusions: [
          ...new Set([
            ...(oldData.importExclusions || []),
            ...(validatedData.importExclusions || []),
          ]),
        ],
      });
      this.#cache.set(list.guildId, newData);
    } else {
      this.#cache.set(list.guildId, new ExclusionsListData(list));
    }
  }

  static #delete(guildId: string) {
    this.#cache.delete(guildId);
  }
}
