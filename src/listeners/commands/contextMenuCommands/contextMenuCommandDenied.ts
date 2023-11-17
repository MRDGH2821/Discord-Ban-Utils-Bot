/* eslint-disable consistent-return */
import { ApplyOptions } from '@sapphire/decorators';
import type { ContextMenuCommandDeniedPayload, Events } from '@sapphire/framework';
import { container, Listener, UserError } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({
  name: 'Context Menu Command Denied',
})
export default class UserEvent extends Listener<typeof Events.ContextMenuCommandDenied> {
  public async run(
    { context, message: content }: UserError,
    { interaction }: ContextMenuCommandDeniedPayload,
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
