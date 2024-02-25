import { ApplyOptions } from '@sapphire/decorators';
import { container, Listener } from '@sapphire/framework';
import type { ChatInputSubcommandErrorPayload } from '@sapphire/plugin-subcommands';
import { SubcommandPluginEvents } from '@sapphire/plugin-subcommands';
import { invitation } from '../../../lib/DynamicConstants';
import { debugErrorEmbed, debugErrorFile, getCmdNameFromInteraction } from '../../../lib/utils';

const PIECE_NAME = 'Chat Input Subcommand Error';
@ApplyOptions<Listener.Options>({
  event: SubcommandPluginEvents.ChatInputSubcommandError,
  name: PIECE_NAME,
})
export default class UserEvent extends Listener<
  typeof SubcommandPluginEvents.ChatInputSubcommandError
> {
  public override run(error: Error, { interaction }: ChatInputSubcommandErrorPayload) {
    const errEmb = debugErrorEmbed({
      title: 'Slash Command error',
      description: `An error occurred while executing the command ${getCmdNameFromInteraction(interaction)}.`,
      checks: [
        {
          question: 'Can any checks be performed',
          result: false,
        },
      ],
      error,
      inputs: interaction.options.data,
      solution: 'Please try again later. If the problem persists, please contact the bot owner.',
    });

    const errFile = debugErrorFile(error);
    const { inviteRow } = invitation(this.container.client);
    return interaction
      .reply({
        embeds: [errEmb],
        components: [inviteRow],
        files: [errFile],
      })
      .catch(() =>
        interaction.followUp({ embeds: [errEmb], components: [inviteRow], files: [errFile] }),
      );
  }
}
void container.stores.loadPiece({
  name: PIECE_NAME,
  piece: UserEvent,
  store: 'listeners',
});
