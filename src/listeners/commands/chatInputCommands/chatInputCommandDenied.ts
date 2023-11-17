/* eslint-disable consistent-return */
import { ApplyOptions } from '@sapphire/decorators';
import type { ChatInputCommandDeniedPayload, Events } from '@sapphire/framework';
import { container, Listener, UserError } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({
  name: 'Chat Input Command Denied',
})
export default class UserEvent extends Listener<typeof Events.ChatInputCommandDenied> {
  public async run(
    { context, message: content }: UserError,
    { interaction }: ChatInputCommandDeniedPayload,
  ) {
    // `context: { silent: true }` should make UserError silent:
    // Use cases for this are for example permissions error when running the `eval` command.
    if (Reflect.get(Object(context), 'silent')) return;

    if (interaction.deferred || interaction.replied) {
      return interaction.editReply({
        content,
        allowedMentions: { users: [interaction.user.id], roles: [] },
      });
    }

    return interaction.reply({
      content,
      allowedMentions: { users: [interaction.user.id], roles: [] },
      ephemeral: true,
    });
  }
}

container.stores.loadPiece({
  name: UserEvent.name,
  piece: UserEvent,
  store: 'listeners',
});
