import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { chunk } from '@sapphire/utilities';
import type { APIEmbed, Collection, GuildBan } from 'discord.js';
import { createPaste } from 'dpaste-ts';
import { sequentialPromises } from 'yaspr';
import { COLORS } from '../lib/Constants';
import type {
  BanEntity, BanEntityWithReason, BanExportOptions, BanType,
} from '../lib/typeDefs';
import { debugErrorEmbed, fetchAllBans, truncateString } from '../lib/utils';

@ApplyOptions<Listener.Options>({
  name: 'Export Ban List',
  event: 'exportBanList',
})
export default class UserEvent extends Listener {
  // eslint-disable-next-line class-methods-use-this
  private async banListLink<T>(array: Array<T>, title: string) {
    return createPaste({
      content: JSON.stringify(array),
      title,
      syntax: 'text',
    });
  }

  private async exportBanList(
    includeReason: boolean,
    bans: Collection<string, GuildBan>,
    guildName: string,
  ) {
    const banListWithReason = bans.map<BanEntityWithReason>((ban) => ({
      id: ban.user.id,
      reason: ban.reason,
    }));
    const banList = bans.map<BanEntity>((ban) => ban.user.id);

    const chunks: BanType[][] = includeReason
      ? chunk(banListWithReason, 350)
      : chunk(banList, 1000);

    let idx = 1;
    const getLink = async (list: (typeof chunks)[0]) => {
      const link = await this.banListLink(
        list,
        `${truncateString(guildName, 10)} Ban List [${idx}/${chunks.length}]`,
      );
      idx += 1;
      return link;
    };

    return sequentialPromises(chunks, getLink);
  }

  public async run(options: BanExportOptions) {
    const bans = await fetchAllBans(options.sourceGuild);
    const { includeReason, notifyInChannel } = options;
    try {
      const links = await this.exportBanList(includeReason, bans, options.sourceGuild.name);

      const resultEmbed: APIEmbed = {
        title: '**Ban List Export Success!**',
        description: `Total Bans Found: ${bans.size}\n\nEach link contains ${
          includeReason ? 350 : 1000
        } bans.\nExcept the last one, which contains ${
          includeReason ? bans.size % 350 : bans.size % 1000
        } bans.`,
        color: COLORS.whiteGray,
        fields: [
          {
            name: '**Number of parts**',
            value: `${links.length}`,
          },
          {
            name: '**Links**',
            value: links.join('\n'),
          },
        ],
        timestamp: new Date().toISOString(),
      };

      return await notifyInChannel.send({
        content: `${options.sourceMessage.author}`,
        embeds: [resultEmbed],
        files: [
          {
            attachment: Buffer.from(links.join('\n')),
            name: `Ban List of ${options.sourceGuild.name}.txt`,
            description: 'Ban list links',
          },
        ],
      });
    } catch (err) {
      this.container.logger.error(err);
      return notifyInChannel.send({
        content: `${options.sourceMessage.author}`,
        embeds: [
          debugErrorEmbed({
            title: 'Error while exporting ban list',
            description: 'An error occurred while exporting ban list',
            error: err,
            checks: [
              {
                question: 'None',
                result: true,
              },
            ],
            inputs: [
              {
                name: 'Include Reason',
                value: `${includeReason}`,
              },
            ],
            solution: 'Please wait for sometime before trying again.',
          }),
        ],
      });
    }
  }
}
