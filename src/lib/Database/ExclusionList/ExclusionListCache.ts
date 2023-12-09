import { container } from '@sapphire/framework';
import { Collection } from 'discord.js';
import { AllExclusionListOptions } from '../../typeDefs';
import { dbExclusionListRef, ExclusionListValidator } from '../DBUtils';
import ExclusionListData from './ExclusionListData';

export default class ExclusionListCache {
  static {
    dbExclusionListRef.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'removed') {
          container.logger.debug('Removed Exclusion list: ', change.doc.data());
          this.#delete(change.doc.data().guildId);
        } else {
          container.logger.debug('Updated Exclusion list: ', change.doc.data());
          void this.#update(change.doc.data());
        }
      });
    });
  }

  static #cache = new Collection<string, ExclusionListData>();

  static async #fetchAll() {
    await dbExclusionListRef
      .get()
      .then((snapshot) =>
        snapshot.forEach((doc) => {
          const data = doc.data();
          const ExclusionList = new ExclusionListData(data);
          this.#cache.set(ExclusionList.guildId, ExclusionList);
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
    return dbExclusionListRef
      .doc(guildId)
      .get()
      .then((doc) => {
        const data = doc.data();
        const validatedData = ExclusionListValidator.parse(data);
        const ExclusionList = new ExclusionListData(validatedData);
        return this.#cache.set(ExclusionList.guildId, ExclusionList);
      });
  }

  static async #update(list: AllExclusionListOptions) {
    const validatedData = ExclusionListValidator.parse(list);

    const oldData = await this.find(list.guildId);

    if (oldData) {
      const newData = new ExclusionListData({
        guildId: list.guildId,
        exportExclusion: [
          ...new Set([
            ...(oldData.exportExclusion || []),
            ...(validatedData.exportExclusion || []),
          ]),
        ],
        importExclusion: [
          ...new Set([
            ...(oldData.importExclusion || []),
            ...(validatedData.importExclusion || []),
          ]),
        ],
      });
      this.#cache.set(list.guildId, newData);
    } else {
      this.#cache.set(list.guildId, new ExclusionListData(list));
    }
  }

  static #delete(guildId: string) {
    this.#cache.delete(guildId);
  }
}
