import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { chunk } from '@sapphire/utilities';
import {
  type APIEmbed,
  type Collection,
  type Guild,
  type GuildBan,
  type MessagePayloadOption,
} from 'discord.js';
import { createPaste } from 'dpaste-ts';
import { sequentialPromises } from 'yaspr';
import { COLORS } from '../lib/Constants';
import Database from '../lib/Database';
import { BUEvents } from '../lib/EventTypes';
import type {
  BanEntity, BanEntityWithReason, BanExportOptions, BanType,
} from '../lib/typeDefs';
import {
  debugErrorEmbed, fetchAllBans, getWebhook, truncateString,
} from '../lib/utils';

@ApplyOptions<Listener.Options>({
  name: 'Ban List Exporter',
  event: BUEvents.BanListExport,
})
export default class UserEvent extends Listener<typeof BUEvents.BanListExport> {
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

  public async run({
    sourceGuild: guild,
    requesterUser: user,
    sourceMessage: message,
    includeReason,
  }: BanExportOptions) {
    const bans = await fetchAllBans(guild);

    try {
      const links = await this.exportBanList(includeReason, bans, guild.name);
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
        footer: {
          text: `Requested by ${user.username}`,
          icon_url: user.displayAvatarURL(),
        },
      };
      const resultFile = {
        attachment: Buffer.from(links.join('\n')),
        name: `Ban List of ${guild.name}.txt`,
        description: 'Ban list links',
      };

      this.sendLog(guild.id, resultEmbed, [resultFile]);

      return await message.reply({
        content: `${user}`,
        embeds: [resultEmbed],
        files: [resultFile],
      });
    } catch (err) {
      this.container.logger.error(err);
      const errEmbed = debugErrorEmbed({
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
      });
      this.sendLog(guild.id, errEmbed);
      return message.reply({
        content: `${user}`,
        embeds: [errEmbed],
      });
    }
  }

  public async sendLog(
    guildId: Guild['id'],
    embed: APIEmbed,
    files?: MessagePayloadOption['files'],
  ) {
    const settings = await Database.getSettings(guildId);
    if (!settings || !settings?.sendBanExportLog) {
      return;
    }

    const webhook = await getWebhook(guildId, settings.webhookId);

    if (!webhook) {
      this.container.logger.debug('No webhook found in guild', guildId);
      return;
    }

    await webhook.send({
      embeds: [embed],
      files,
    });
  }
}
