import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { chunk } from '@sapphire/utilities';
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  Collection,
  GuildBan,
  MessageFlags,
  PermissionFlagsBits,
  type APIEmbed,
} from 'discord.js';
import { createPaste } from 'dpaste-ts';
import { COLORS } from '../lib/Constants';
import { truncateString } from '../lib/utils';

@ApplyOptions<Command.Options>({
  name: 'export-ban-list',
  description: 'A basic slash command',
  requiredClientPermissions: [
    PermissionFlagsBits.ViewAuditLog,
    PermissionFlagsBits.BanMembers,
    PermissionFlagsBits.EmbedLinks,
  ],
  preconditions: ['GuildOnly'],
})
export default class UserCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description,
      dm_permission: false,
      dmPermission: false,
      type: ApplicationCommandType.ChatInput,
      options: [
        {
          name: 'include-reason',
          description: 'Export the ban list with ban reason (default: true)',
          type: ApplicationCommandOptionType.Boolean,
          required: false,
        },
      ],
    });
  }

  // eslint-disable-next-line class-methods-use-this
  private async banListLink<T>(array: T, title: string) {
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
    const banListWithReason = bans.map((ban) => ({ id: ban.user.id, reason: ban.reason }));
    const banList = bans.map((ban) => ban.user.id);

    const chunks = includeReason ? chunk(banListWithReason, 350) : chunk(banList, 1000);

    const links = chunks.map(async (list, index) => this.banListLink(list, `${truncateString(guildName, 10)} Ban List [Part ${index + 1}]`));

    return Promise.all(links);
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const includeReason = interaction.options.getBoolean('include-reason') || true;
    if (!interaction.guild) {
      return interaction.reply({
        content: 'Please use this command inside server',
        flags: MessageFlags.Ephemeral,
      });
    }

    const bans = await interaction.guild.bans.fetch();

    const statusEmbed: APIEmbed = {
      title: '**Exporting Ban List**',
      color: COLORS.whiteGray,
      description: `Found ${bans.size} bans.\nIncluding Reason?: ${includeReason}`,
      timestamp: new Date().toISOString(),
    };

    await interaction.reply({ embeds: [statusEmbed] });

    const links = await this.exportBanList(includeReason, bans, interaction.guild.name);

    const resultEmbed: APIEmbed = {
      title: '**Ban List Export Success!**',
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

    return interaction.reply({
      embeds: [resultEmbed],
      files: [
        {
          attachment: Buffer.from(links.toString()),
          name: `Ban List of ${interaction.guild.name}.txt`,
          description: 'Ban list links',
        },
      ],
    });
  }
}
