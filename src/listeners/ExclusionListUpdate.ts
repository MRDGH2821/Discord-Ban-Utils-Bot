import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import db from '../lib/Database';
import type { ExclusionListUpdateOptions } from '../lib/EventTypes';
import { BUEvents } from '../lib/EventTypes';

const PIECE_NAME = 'Update Exclusion List';
@ApplyOptions<Listener.Options>({
  name: PIECE_NAME,
  event: BUEvents.ExclusionListUpdate,
})
export default class UserEvent extends Listener {
  public override run(payload: ExclusionListUpdateOptions) {
    this.container.logger.debug('Updating Exclusion list:', payload);
    const { mode } = payload;

    db.exclusionList
      .upset(payload.guildId, ($) => {
        const func = mode === 'add' ? $.arrayUnion : $.arrayRemove;
        return {
          guildId: payload.guildId,
          exportExclusion: func(payload.exportExclusion),
          importExclusion: func(payload.importExclusion),
        };
      })
      .then(this.container.logger.debug)
      .catch(this.container.logger.error);
  }
}
