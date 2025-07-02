import { ApplyOptions } from "@sapphire/decorators";
import { container, Listener } from "@sapphire/framework";
import { chunk } from "@sapphire/utilities";
import {
  type APIEmbed,
  AttachmentBuilder,
  type Collection,
  EmbedBuilder,
  type Guild,
  type GuildBan,
} from "discord.js";
import { createPaste } from "dpaste-ts";
import { COLORS } from "../lib/Constants";
import db from "../lib/Database";
import { BUEvents } from "../lib/EventTypes";
import type {
  BanEntity,
  BanEntityWithReason,
  BanExportOptions,
  BanType,
} from "../lib/typeDefs";
import {
  debugErrorEmbed,
  debugErrorFile,
  fetchAllBans,
  getWebhook,
  sequentialPromises,
  truncateString,
} from "../lib/utils";

const PIECE_NAME = "Ban List Exporter";
@ApplyOptions<Listener.Options>({
  name: PIECE_NAME,
  event: BUEvents.BanListExport,
})
export default class UserEvent extends Listener<typeof BUEvents.BanListExport> {
  // eslint-disable-next-line class-methods-use-this
  private async banListLink<T>(array: Array<T>, title: string) {
    return createPaste({
      content: JSON.stringify(array),
      title,
      syntax: "text",
    });
  }

  private async exportBanList(
    includeReason: boolean,
    bans: Collection<string, GuildBan>,
    guildName: string,
  ): Promise<string[]> {
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
    shouldIgnoreFilterList = false,
  }: BanExportOptions) {
    this.exportAndReply({
      sourceGuild: guild,
      includeReason,
      requesterUser: user,
      sourceMessage: message,
      shouldIgnoreFilterList,
    }).catch((error: Error) => {
      this.container.logger.error(error);
      const errEmbed = debugErrorEmbed({
        title: "Error while exporting ban list",
        description: "An error occurred while exporting ban list",
        error,
        checks: [
          {
            question: "None",
            result: true,
          },
        ],
        inputs: [
          {
            name: "Include Reason",
            value: `${includeReason}`,
          },
        ],
        solution: "Please wait for sometime before trying again.",
      });
      const errFile = debugErrorFile(error);
      void this.sendLog(guild.id, errEmbed, [
        new AttachmentBuilder(errFile.attachment, { name: errFile.name }),
      ]);
      return message.reply({
        content: `${user}`,
        embeds: [errEmbed],
      });
    });
  }

  // eslint-disable-next-line class-methods-use-this
  public async filterList(guildId: string, shouldIgnoreFilterList = false) {
    const excData = await db.filterList.get(guildId).then((v) => v?.data);
    const list = [];
    if (!shouldIgnoreFilterList && excData && excData.exportFilter) {
      list.push(...excData.exportFilter);
    }
    return list;
  }

  public async exportAndReply({
    includeReason,
    sourceGuild: guild,
    requesterUser: user,
    sourceMessage: message,
    shouldIgnoreFilterList = false,
  }: BanExportOptions) {
    return new Promise((resolve, reject) => {
      fetchAllBans(guild)
        .then(async (bans) => {
          const excludeList = await this.filterList(
            guild.id,
            shouldIgnoreFilterList,
          );
          const filteredBans = bans.filter(
            (ban) => !excludeList.includes(ban.user.id),
          );

          return {
            links: await this.exportBanList(
              includeReason,
              filteredBans,
              guild.name,
            ),
            bans: filteredBans,
          };
        })
        .then(({ links, bans }) => {
          const resultEmbed = EmbedBuilder.from({
            title: "**Ban List Export Success!**",
            description: `Total Bans Found: ${bans.size}\n\nEach link contains ${
              includeReason ? 350 : 1000
            } bans.\nExcept the last one, which contains ${
              includeReason ? bans.size % 350 : bans.size % 1000
            } bans.`,
            color: COLORS.lightGray,
            fields: [
              {
                name: "**Number of parts**",
                value: `${links.length}`,
              },
              {
                name: "**Links**",
                value: links.join("\n"),
              },
            ],
            timestamp: new Date().toISOString(),
            footer: {
              text: `Requested by ${user.username}`,
              icon_url: user.displayAvatarURL(),
            },
          });
          const resultFile = new AttachmentBuilder(
            Buffer.from(links.join("\n")),
          )
            .setFile(Buffer.from(links.join("\n")))
            .setDescription("Ban list links")
            .setName(`Ban List of ${guild.name}.txt`);
          void this.sendLog(guild.id, resultEmbed, [resultFile]);
          return message.reply({
            content: `${user}`,
            embeds: [resultEmbed],
            files: [resultFile],
          });
        })
        .then(resolve)
        .catch(reject);
    });
  }

  public async sendLog(
    guildId: Guild["id"],
    embed: APIEmbed | EmbedBuilder,
    files: AttachmentBuilder[],
  ) {
    const settings = await db.servers.get(guildId).then((v) => v?.data);
    if (!settings || !settings?.sendBanExportLog) {
      return;
    }

    const webhook = await getWebhook(guildId, settings.webhookId);

    if (!webhook) {
      return;
    }

    await webhook.send({
      embeds: [embed],
      files,
    });
  }
}

void container.stores.loadPiece({
  name: PIECE_NAME,
  piece: UserEvent,
  store: "listeners",
});
