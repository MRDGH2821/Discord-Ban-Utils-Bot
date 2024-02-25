import { ApplyOptions } from '@sapphire/decorators';
import type { ChatInputCommandErrorPayload } from '@sapphire/framework';
import { container, Events, Listener } from '@sapphire/framework';
import { invitation } from '../../../lib/DynamicConstants';
import { debugErrorEmbed, getCmdname } from '../../../lib/utils';

const PIECE_NAME = 'Chat Input Command Error';
@ApplyOptions<Listener.Options>({
  event: Events.ChatInputCommandError,
  name: PIECE_NAME,
})
export default class UserEvent extends Listener<typeof Events.ChatInputCommandError> {
  public override run(error: Error, { interaction }: ChatInputCommandErrorPayload) {
    const errEmb = debugErrorEmbed({
      title: 'Slash Command error',
      description: `An error occurred while executing the command ${getCmdname(interaction)}.`,
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

    const { inviteRow } = invitation(this.container.client);
    return interaction
      .reply({
        embeds: [errEmb],
        components: [inviteRow],
      })
      .catch(() => interaction.followUp({ embeds: [errEmb], components: [inviteRow] }));
  }
}
void container.stores.loadPiece({
  name: PIECE_NAME,
  piece: UserEvent,
  store: 'listeners',
});
