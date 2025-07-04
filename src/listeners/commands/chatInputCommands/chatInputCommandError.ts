import { ApplyOptions } from "@sapphire/decorators";
import type { ChatInputCommandErrorPayload } from "@sapphire/framework";
import { container, Events, Listener } from "@sapphire/framework";
import { invitation } from "../../../lib/DynamicConstants.js";
import {
  debugErrorEmbed,
  debugErrorFile,
  formatCmdName,
} from "../../../lib/utils.js";

const PIECE_NAME = "Chat Input Command Error";
@ApplyOptions<Listener.Options>({
  event: Events.ChatInputCommandError,
  name: PIECE_NAME,
})
export default class UserEvent extends Listener<
  typeof Events.ChatInputCommandError
> {
  public override async run(
    error: Error,
    { command, interaction }: ChatInputCommandErrorPayload,
  ) {
    const errEmb = debugErrorEmbed({
      title: "Slash Command error",
      description: `An error occurred while executing the command ${formatCmdName(command.name, interaction.commandId)}.`,
      checks: [
        {
          question: "Can any checks be performed",
          result: false,
        },
      ],
      error,
      inputs: interaction.options.data,
      solution:
        "Please try again later. If the problem persists, please contact the bot owner.",
    });

    const errFile = debugErrorFile(error);
    const { inviteRow } = invitation(this.container.client);
    return interaction
      .reply({
        embeds: [errEmb],
        components: [inviteRow],
        files: [errFile],
      })
      .catch(async () =>
        interaction.followUp({
          embeds: [errEmb],
          components: [inviteRow],
          files: [errFile],
        }),
      );
  }
}
void container.stores.loadPiece({
  name: PIECE_NAME,
  piece: UserEvent,
  store: "listeners",
});
