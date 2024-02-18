import { ApplyOptions } from '@sapphire/decorators';
import { container, Listener } from '@sapphire/framework';
import { userMention } from 'discord.js';
import { COLORS, DUMMY_USER_ID } from '../lib/Constants';
import db from '../lib/Database';
import type { ExclusionListUpdateOptions } from '../lib/EventTypes';
import { BUEvents } from '../lib/EventTypes';
import { debugErrorEmbed, debugErrorFile } from '../lib/utils';

const PIECE_NAME = 'Update Exclusion List';
@ApplyOptions<Listener.Options>({
  name: PIECE_NAME,
  event: BUEvents.ExclusionListUpdate,
})
export default class UserEvent extends Listener {
  public override run(payload: ExclusionListUpdateOptions) {
    this.container.logger.debug('Updating Exclusion list:', payload);
    const { mode } = payload;

    db.exclusionList
      .upset(payload.guildId, ($) => {
        const func = mode === 'add' ? $.arrayUnion : $.arrayRemove;
        return {
          guildId: payload.guildId,
          exportExclusion: func(payload.exportExclusion),
          importExclusion: func(payload.importExclusion),
        };
      })
      .then((val) => val.get())
      .then((val) => {
        const { exportExclusion, importExclusion } = val!.data;
        const exportExclusionList = exportExclusion
          .filter((id) => !id.includes(DUMMY_USER_ID))
          .map((userId) => userMention(userId))
          .join(', ');
        const importExclusionList = importExclusion
          .filter((id) => !id.includes(DUMMY_USER_ID))
          .map((userId) => userMention(userId))
          .join(', ');

        return payload.interaction.editReply({
          embeds: [
            {
              title: '**List Updated!**',
              color: COLORS.charcoalInvisible,
              description: 'List Updated Successfully!',
              fields: [
                {
                  name: 'Export Exclusion List',
                  value: exportExclusionList || 'None',
                },
                {
                  name: 'Import Exclusion List',
                  value: importExclusionList || 'None',
                },
              ],
            },
          ],
        });
      })
      .catch((error) => {
        this.container.logger.error(error);
        const { interaction } = payload;
        return interaction.editReply({
          embeds: [
            debugErrorEmbed({
              checks: [
                {
                  question: 'Can you ban members or manage the server?',
                  result:
                    interaction.memberPermissions?.has('BanMembers') ||
                    interaction.memberPermissions?.has('ManageGuild') ||
                    false,
                },
              ],
              description: 'Unable to update the exclusion list',
              error,
              inputs: [
                {
                  name: 'Mode',
                  value: payload.mode,
                },
                {
                  name: 'User IDs',
                  value: [...payload.exportExclusion]
                    .concat(payload.importExclusion)
                    .flat()
                    .join(', '),
                },
              ],
              solution:
                'Please check if you have the required permissions and try again. Else wait for some time.',
              title: 'Exclusion List Update Failed',
            }),
          ],
          files: [debugErrorFile(error)],
        });
      });
  }
}

void container.stores.loadPiece({
  name: PIECE_NAME,
  piece: UserEvent,
  store: 'listeners',
});
