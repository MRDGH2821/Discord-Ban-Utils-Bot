import { ApplyOptions } from '@sapphire/decorators';
import { SnowflakeRegex } from '@sapphire/discord.js-utilities';
import { container } from '@sapphire/framework';
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
import { COLORS, DUMMY_USER_ID, SERVER_ONLY } from '../lib/Constants';
import db from '../lib/Database';
import { emitBotEvent } from '../lib/EventTypes';

const userIdValidator = s.array<User['id']>(s.string().regex(SnowflakeRegex));

const PIECE_NAME = 'filter-list';

@ApplyOptions<Subcommand.Options>({
  name: PIECE_NAME,
  description: 'Filter certain user IDs from being exported or imported',
  requiredUserPermissions: [['BanMembers', 'ManageGuild']],
  preconditions: ['GuildOnly'],
  detailedDescription: {
    help: 'Filter certain user IDs from being exported or imported.\nImport Filter list will exclude the user IDs from being imported via ban import & mass ban. Useful when some users are good inside but not outside.\nExport Filter list will exclude the user IDs from being exported via ban export & mass ban. Useful when some users were banned due to server reasons but are good otherwise.',
    subcommands: [
      {
        name: 'view',
        description: 'View filter list',
        help: 'Shows you the current filter list for export and import',
      },
      {
        name: 'add',
        description: 'Add user IDs to filter list',
        help: 'When added, prevents the user IDs from being exported or imported',
      },
      {
        name: 'remove',
        description: 'Remove user IDs from filter list',
        help: 'When removed, allows the user IDs being exported or imported',
      },
    ],
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
        const dbList = await db.filterList.get(guildId);
        if (!dbList) return interaction.editReply('No user IDs are excluded from export or import');

        const { exportFilter, importFilter } = dbList.data;
        const exportFilterList = exportFilter
          .filter((id) => !id.includes(DUMMY_USER_ID))
          .map((userId) => userMention(userId))
          .join(', ');
        const importFilterList = importFilter
          .filter((id) => !id.includes(DUMMY_USER_ID))
          .map((userId) => userMention(userId))
          .join(', ');

        return interaction.editReply({
          embeds: [
            {
              title: 'Filter List',
              description: 'Filter list configured in this server',
              fields: [
                {
                  name: 'Export Filter List',
                  value: exportFilterList || 'None',
                },
                {
                  name: 'Import Filter List',
                  value: importFilterList || 'None',
                },
              ],
            },
          ],
        });
      },
    },
    {
      name: 'add',
      type: 'method',
      chatInputRun: 'updateFilterList',
    },
    {
      name: 'remove',
      type: 'method',
      chatInputRun: 'updateFilterList',
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
          description: 'View filter list',
          type: ApplicationCommandOptionType.Subcommand,
        },
        {
          name: 'add',
          description:
            'Add user IDs to filter list. Prevents the user IDs from being exported or imported.',
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: 'filter-type',
              description: 'Select filter list type.',
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
            'Remove user IDs from filter list. Allows the user IDs being exported or imported.',
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: 'filter-type',
              description: 'Select filter list type',
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
      .setTitle(`Input user Ids to ${cmd} from ${listType} filter list`)
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

  public async updateFilterList(interaction: Subcommand.ChatInputCommandInteraction) {
    this.container.logger.info('updateFilterList');
    const subcmd = interaction.options.getSubcommand(true);
    const filterType = interaction.options.getString('filter-type', true);
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

    const cmd = s.enum<'add' | 'remove'>(['add', 'remove']).default('add').run(subcmd).unwrap();
    const listType = s.enum<'export' | 'import'>(['export', 'import']).run(filterType).unwrap();

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

    emitBotEvent('filterListUpdate', {
      guildId,
      exportFilter: listType === 'export' ? idList : [DUMMY_USER_ID],
      importFilter: listType === 'import' ? idList : [DUMMY_USER_ID],
      mode: cmd,
      interaction,
    });

    return interaction.editReply({
      embeds: [
        {
          title: '**List Update Scheduled!**',
          color: COLORS.charcoalInvisible,
          description:
            'The list will be updated shortly.\n\nYou may use `/filter-list view` view to check the updated list.',
        },
      ],
    });
  }
}

void container.stores.loadPiece({
  name: PIECE_NAME,
  piece: UserCommand,
  store: 'commands',
});
