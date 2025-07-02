import { ApplyOptions } from "@sapphire/decorators";
import {
  container,
  Events,
  Listener,
  type MessageCommandDeniedPayload,
  type UserError,
} from "@sapphire/framework";

const PIECE_NAME = "Message Command Denied";
@ApplyOptions<Listener.Options>({
  event: Events.MessageCommandDenied,
  name: PIECE_NAME,
})
export default class UserEvent extends Listener<
  typeof Events.MessageCommandDenied
> {
  public async run(
    { context, message: content }: UserError,
    { message }: MessageCommandDeniedPayload,
  ) {
    // `context: { silent: true }` should make UserError silent:
    // Use cases for this are for example permissions error when running the `eval` command.
    if (Reflect.get(new Object(context), "silent")) return;

    // eslint-disable-next-line consistent-return
    return message.reply({
      content,
      allowedMentions: { users: [message.author.id], roles: [] },
    });
  }
}

void container.stores.loadPiece({
  name: PIECE_NAME,
  piece: UserEvent,
  store: "listeners",
});
