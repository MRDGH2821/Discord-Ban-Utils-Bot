import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import type { ExclusionListUpdateOptions } from '../lib/EventTypes';
import { BUEvents } from '../lib/EventTypes';

const PIECE_NAME = 'Update Exclusion List';
@ApplyOptions<Listener.Options>({
  name: PIECE_NAME,
  event: BUEvents.ExclusionListUpdate,
})
export default class UserEvent extends Listener {
  public override run(payload: ExclusionListUpdateOptions) {
    this.container.logger.debug('Exclusion list updated:', payload);

    // todo: add logic to update the exclusion list
  }
}
