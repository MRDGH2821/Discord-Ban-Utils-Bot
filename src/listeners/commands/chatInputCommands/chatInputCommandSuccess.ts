import { ApplyOptions } from "@sapphire/decorators";
import {
  type ChatInputCommandSuccessPayload,
  container,
  Listener,
  LogLevel,
} from "@sapphire/framework";
import { Events } from "@sapphire/framework";
import type { Logger } from "@sapphire/plugin-logger";
import { logSuccessCommand } from "../../../lib/utils";

const PIECE_NAME = "Chat Input Command Success";
@ApplyOptions<Listener.Options>({
  event: Events.ChatInputCommandSuccess,
  name: PIECE_NAME,
})
export default class UserEvent extends Listener {
  public run(payload: ChatInputCommandSuccessPayload) {
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
