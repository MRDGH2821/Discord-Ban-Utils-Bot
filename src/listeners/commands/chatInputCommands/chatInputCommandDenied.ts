import { ApplyOptions } from "@sapphire/decorators";
import type {
  ChatInputCommandDeniedPayload,
  UserError,
} from "@sapphire/framework";
import { container, Events, Listener } from "@sapphire/framework";

const PIECE_NAME = "Chat Input Command Denied";
@ApplyOptions<Listener.Options>({
  event: Events.ChatInputCommandDenied,
  name: PIECE_NAME,
})
export default class UserEvent extends Listener<
  typeof Events.ChatInputCommandDenied
> {
  public async run(
    { context, message: content }: UserError,
    { interaction }: ChatInputCommandDeniedPayload,
  ) {
    // `context: { silent: true }` should make UserError silent:
    // Use cases for this are for example permissions error when running the `eval` command.
    if (Reflect.get({ ...context }, "silent")) return;

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

void container.stores.loadPiece({
  name: PIECE_NAME,
  piece: UserEvent,
  store: "listeners",
});
