import { ApplyOptions } from '@sapphire/decorators';
import {
  container,
  Listener,
  type Events,
  type MessageCommandDeniedPayload,
  type UserError,
} from '@sapphire/framework';

@ApplyOptions<Listener.Options>({
  name: 'Message Command Denied',
})
export default class UserEvent extends Listener<typeof Events.MessageCommandDenied> {
  public async run(
    { context, message: content }: UserError,
    { message }: MessageCommandDeniedPayload,
  ) {
    // `context: { silent: true }` should make UserError silent:
    // Use cases for this are for example permissions error when running the `eval` command.
    if (Reflect.get(Object(context), 'silent')) return;

    // eslint-disable-next-line consistent-return
    return message.reply({
      content,
      allowedMentions: { users: [message.author.id], roles: [] },
    });
  }
}

container.stores.loadPiece({
  name: UserEvent.name,
  piece: UserEvent,
  store: 'listeners',
});
