import { ApplyOptions } from '@sapphire/decorators';
import {
  container,
  Listener,
  LogLevel,
  type ContextMenuCommandSuccessPayload,
} from '@sapphire/framework';
import type { Logger } from '@sapphire/plugin-logger';
import { logSuccessCommand } from '../../../lib/utils';

@ApplyOptions<Listener.Options>({
  name: 'Context Menu Command Success',
})
export default class UserEvent extends Listener {
  public run(payload: ContextMenuCommandSuccessPayload) {
    logSuccessCommand(payload);
  }

  public override onLoad() {
    this.enabled = (this.container.logger as Logger).level <= LogLevel.Debug;
    return super.onLoad();
  }
}

void container.stores.loadPiece({
  name: UserEvent.name,
  piece: UserEvent,
  store: 'listeners',
});
