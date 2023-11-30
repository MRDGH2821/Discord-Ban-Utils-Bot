import type { User } from 'discord.js';
import { FieldValue } from 'firebase-admin/firestore';
import {
  type AllExclusionListOptions,
  DataClass,
  type ExclusionListParameter,
} from '../../typeDefs';
import { dbExclusionListRef } from '../DBUtils';

export default class ExclusionListData extends DataClass<AllExclusionListOptions> {
  importExclusion?: User['id'][];

  exportExclusion?: User['id'][];

  guildId: string;

  constructor(options: AllExclusionListOptions) {
    super(options);
    this.guildId = options.guildId;
    Object.assign(this, options);
  }

  updateOne(listType: ExclusionListParameter, value: User['id'][]) {
    this[listType] = [...new Set([...(this[listType] || []), ...value])];

    return dbExclusionListRef.doc(this.guildId).update({
      [listType]: FieldValue.arrayUnion(...value),
    });
  }

  toJSON() {
    return {
      ...this,
    };
  }

  toString() {
    return `Import Exclusion: ${this.importExclusion?.join(', ') || 'None'}\nExport Exclusion: ${
      this.exportExclusion?.join(', ') || 'None'
    }\nGuild ID: ${this.guildId}`;
  }
}
