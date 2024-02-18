import { ApplyOptions } from '@sapphire/decorators';
import { SnowflakeRegex } from '@sapphire/discord.js-utilities';
import { Subcommand } from '@sapphire/plugin-subcommands';
import { s } from '@sapphire/shapeshift';
import { Time } from '@sapphire/time-utilities';
import type { User } from 'discord.js';
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  userMention,
} from 'discord.js';
import { COLORS, SERVER_ONLY } from '../lib/Constants';
import db from '../lib/Database';
import { emitBotEvent } from '../lib/EventTypes';

const userIdValidator = s.array<User['id']>(s.string.regex(SnowflakeRegex));

@ApplyOptions<Subcommand.Options>({
  name: 'exclusion-list',
  description: 'Exclude certain user IDs from being exported or imported',
  requiredUserPermissions: [['BanMembers', 'ManageGuild']],
  preconditions: ['GuildOnly'],
  detailedDescription: {
    help: 'Exclude certain user IDs from being exported or imported.\nImport Exclusion list will exclude the user IDs from being imported via ban import & mass ban. Useful when some users are good inside but not outside.\nExport Exclusion list will exclude the user IDs from being exported via ban export & mass ban. Useful when some users were banned due to server reasons but are good otherwise.',
  },
  subcommands: [
    {
      name: 'view',
      type: 'method',
      async chatInputRun(interaction) {
        if (!interaction.inGuild() || !interaction.guild) {
          return interaction.reply({
            content: SERVER_ONLY,
            ephemeral: true,
          });
        }
        await interaction.deferReply({ ephemeral: true });
        const { guildId } = interaction;
        const dbList = await db.exclusionList.get(guildId);
        if (!dbList) return interaction.editReply('No user IDs are excluded from export or import');

        const { exportExclusion, importExclusion } = dbList.data;
        const exportExclusionList = exportExclusion.map((userId) => userMention(userId)).join(', ');
        const importExclusionList = importExclusion.map((userId) => userMention(userId)).join(', ');

        return interaction.editReply({
          embeds: [
            {
              title: 'Exclusion List',
              description: `**Export Exclusion List:**\n${exportExclusionList || 'None'}\n\n**Import Exclusion List:**\n${importExclusionList || 'None'}`,
            },
          ],
        });
      },
    },
    {
      name: 'add',
      type: 'method',
      chatInputRun: 'updateExclusionList',
    },
    {
      name: 'remove',
      type: 'method',
      chatInputRun: 'updateExclusionList',
    },
  ],
})
export default class UserCommand extends Subcommand {
  // eslint-disable-next-line class-methods-use-this
  public parseIds(ids: string) {
    const idList = ids.match(SnowflakeRegex);
    return userIdValidator.run(idList).unwrap();
  }

  registerApplicationCommands(registry: Subcommand.Registry) {
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description,
      options: [
        {
          name: 'view',
          description: 'View exclusion list',
          type: ApplicationCommandOptionType.Subcommand,
        },
        {
          name: 'add',
          description:
            'Add user IDs to exclusion list. Prevents the user IDs from being exported or imported.',
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: 'exclusion-type',
              description: 'Select exclusion list type.',
              type: ApplicationCommandOptionType.String,
              required: true,
              choices: [
                {
                  name: 'Export',
                  value: 'export',
                },
                {
                  name: 'Import',
                  value: 'import',
                },
              ],
            },
            {
              name: 'user-ids',
              description: 'User IDs to add',
              type: ApplicationCommandOptionType.String,
            },
          ],
        },
        {
          name: 'remove',
          description:
            'Remove user IDs from exclusion list. Allows the user IDs being exported or imported.',
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: 'exclusion-type',
              description: 'Select exclusion list type',
              type: ApplicationCommandOptionType.String,
              required: true,
              choices: [
                {
                  name: 'Export',
                  value: 'export',
                },
                {
                  name: 'Import',
                  value: 'import',
                },
              ],
            },
            {
              name: 'user-ids',
              description: 'User IDs to remove',
              type: ApplicationCommandOptionType.String,
            },
          ],
        },
      ],
    });
  }
  // ToDo: add `exclusion-list add` and `exclusion-list remove` subcommands

  public async subChatInputRun(interaction: Subcommand.ChatInputCommandInteraction) {
    this.container.logger.info('subChatInputRun');
    interaction.deferReply();
  }

  public async askModalUserId(
    interaction: Subcommand.ChatInputCommandInteraction,
    cmd: 'add' | 'remove',
    listType: 'export' | 'import',
  ): Promise<User['id'][]> {
    const modal = new ModalBuilder()
      .setTitle(`Input user Ids to ${cmd} from ${listType} exclusion list`)
      .addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setLabel('User IDs')
            .setPlaceholder('User IDs')
            .setCustomId('exclude-user-ids-list')
            .setRequired(true)
            .setStyle(TextInputStyle.Paragraph),
        ),
      )
      .setCustomId('exclude-user-ids-list-modal');

    return interaction
      .showModal(modal)
      .then(() => interaction.awaitModalSubmit({ time: Time.Minute * 5 }))
      .then((modalCtx) => modalCtx.fields.getTextInputValue('exclude-user-ids-list'))
      .then((idList) => this.parseIds(idList));
  }

  public async updateExclusionList(interaction: Subcommand.ChatInputCommandInteraction) {
    this.container.logger.info('updateExclusionList');
    const subcmd = interaction.options.getSubcommand(true);
    const exclusionType = interaction.options.getString('exclusion-type', true);
    const userIds = interaction.options.getString('user-ids');

    if (!interaction.inGuild() || !interaction.guild) {
      return interaction.reply({
        content: SERVER_ONLY,
        ephemeral: true,
      });
    }

    if (
      !interaction.memberPermissions.has('BanMembers') &&
      !interaction.memberPermissions.has('ManageGuild')
    ) {
      return interaction.reply({
        content: 'You do not have permission to use this command.',
        ephemeral: true,
      });
    }

    const cmd = s.enum<'add' | 'remove'>('add', 'remove').default('add').run(subcmd).unwrap();
    const listType = s.enum<'export' | 'import'>('export', 'import').run(exclusionType).unwrap();

    const { guildId } = interaction;
    await interaction.deferReply();
    const idList: User['id'][] = [];

    if (userIds) {
      const parsedIdsByCmd = this.parseIds(userIds);
      idList.push(...parsedIdsByCmd);
    } else {
      const parsedIdsByModal = await this.askModalUserId(interaction, cmd, listType);
      idList.push(...parsedIdsByModal);
    }

    emitBotEvent('exclusionListUpdate', {
      guildId,
      exportExclusion: listType === 'export' ? idList : [],
      importExclusion: listType === 'import' ? idList : [],
      mode: cmd,
    });

    return interaction.editReply({
      embeds: [
        {
          title: '**List Update Scheduled!**',
          color: COLORS.charcoalInvisible,
          description:
            'The list will be updated shortly.\n\nYou may use `/exclusion-list view` view to check the updated list.',
        },
      ],
    });
  }
}
