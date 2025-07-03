import { ApplyOptions } from "@sapphire/decorators";
import {
  container,
  type ContextMenuCommandSuccessPayload,
  Events,
  Listener,
  LogLevel,
} from "@sapphire/framework";
import type { Logger } from "@sapphire/plugin-logger";
import { logSuccessCommand } from "../../../lib/utils.js";

const PIECE_NAME = "Context Menu Command Success";
@ApplyOptions<Listener.Options>({
  event: Events.ContextMenuCommandSuccess,
  name: PIECE_NAME,
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
  name: PIECE_NAME,
  piece: UserEvent,
  store: "listeners",
});
