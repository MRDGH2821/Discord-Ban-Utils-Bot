import type { User } from 'discord.js';
import { FieldValue } from 'firebase-admin/firestore';
import {
  type AllExclusionsListOptions,
  DataClass,
  type ExclusionsListParameter,
} from '../../typeDefs';
import { dbExclusionsListRef } from '../DBUtils';

export default class ExclusionsListData extends DataClass<AllExclusionsListOptions> {
  importExclusions?: User['id'][];

  exportExclusions?: User['id'][];

  guildId: string;

  constructor(options: AllExclusionsListOptions) {
    super(options);
    this.guildId = options.guildId;
    Object.assign(this, options);
  }

  updateOne(listType: ExclusionsListParameter, value: User['id'][]) {
    this[listType] = [...new Set([...(this[listType] || []), ...value])];

    return dbExclusionsListRef.doc(this.guildId).update({
      [listType]: FieldValue.arrayUnion(...value),
    });
  }

  toJSON() {
    return {
      ...this,
    };
  }

  toString() {
    return `Import Exclusions: ${this.importExclusions?.join(', ') || 'None'}\nExport Exclusions: ${
      this.exportExclusions?.join(', ') || 'None'
    }\nGuild ID: ${this.guildId}`;
  }
}
