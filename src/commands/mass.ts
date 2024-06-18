import { ApplyOptions } from '@sapphire/decorators';
import { SnowflakeRegex } from '@sapphire/discord.js-utilities';
import { container } from '@sapphire/framework';
import { Subcommand } from '@sapphire/plugin-subcommands';
import { s } from '@sapphire/shapeshift';
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  PermissionFlagsBits,
} from 'discord.js';
import { NOT_PERMITTED, SERVER_ONLY } from '../lib/Constants';
import type { ListImportOptions } from '../lib/typeDefs';
import { banEntitySchemaBuilder, debugErrorEmbed, importList } from '../lib/utils';

const IGNORE_FILTER_TEXT = 'ignore-filter-list';
const PIECE_NAME = 'mass';
@ApplyOptions<Subcommand.Options>({
  name: PIECE_NAME,
  description: 'Perform Mass ban or unban',
  subcommands: [
    {
      name: 'ban',
      type: 'method',
    },
    {
      name: 'unban',
      type: 'method',
    },
  ],
  preconditions: ['GuildOnly'],
  requiredUserPermissions: PermissionFlagsBits.BanMembers,
  requiredClientPermissions: PermissionFlagsBits.BanMembers,
  detailedDescription: {
    help: 'Perform mass ban or unban on a list of discord IDs',
    subcommands: [
      {
        name: 'ban',
        description: 'Perform Mass Ban',
        help: 'Perform mass ban on a list of discord IDs. Helpful when you have to bulk ban multiple spammers or raiders.',
      },
      {
        name: 'unban',
        description: 'Perform Mass Unban',
        help: 'Perform mass unban on a list of discord IDs. Helpful when you have to bulk unban multiple users.',
      },
    ],
  },
})
export default class UserCommand extends Subcommand {
  override registerApplicationCommands(registry: Subcommand.Registry) {
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description,
      defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
      dm_permission: false,
      dmPermission: false,
      type: ApplicationCommandType.ChatInput,
      options: [
        {
          name: 'ban',
          description: 'Perform Mass Ban',
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: 'ids',
              description: 'Discord IDs you want to mass ban',
              type: ApplicationCommandOptionType.String,
              required: true,
            },
            {
              name: 'reason',
              description: 'The reason for the ban',
              type: ApplicationCommandOptionType.String,
              required: true,
              autocomplete: true,
            },
            {
              name: IGNORE_FILTER_TEXT,
              description: 'Ignore the filter list while importing ban list (default: false)',
              type: ApplicationCommandOptionType.Boolean,
              required: false,
            },
          ],
        },
        {
          name: 'unban',
          description: 'Perform Mass Unban',
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: 'ids',
              description: 'Discord IDs you want to mass unban',
              type: ApplicationCommandOptionType.String,
              required: true,
            },
            {
              name: 'reason',
              description: 'The reason for the unban',
              type: ApplicationCommandOptionType.String,
              required: true,
              autocomplete: true,
            },
            {
              name: IGNORE_FILTER_TEXT,
              description: 'Ignore the filter list while importing unban list (default: true)',
              type: ApplicationCommandOptionType.Boolean,
              required: false,
            },
          ],
        },
      ],
    });
  }

  // eslint-disable-next-line class-methods-use-this
  private parseIds(ids: string, banReason: string) {
    const idList = ids.match(SnowflakeRegex);

    const schema = banEntitySchemaBuilder(banReason);

    return schema.run(idList);
  }

  public override async chatInputRun(interaction: Subcommand.ChatInputCommandInteraction) {
    await interaction.deferReply();
    const ids = interaction.options.getString('ids', true);
    const reason = interaction.options.getString('reason', true);
    const invokerCmd = interaction.options.getSubcommand(true);

    if (!interaction.inGuild() || !interaction.guild) {
      await interaction.reply({
        content: SERVER_ONLY,
        ephemeral: true,
      });
      return;
    }

    if (!interaction.memberPermissions.has(PermissionFlagsBits.BanMembers)) {
      await interaction.reply({
        content: NOT_PERMITTED,
        ephemeral: true,
      });
      return;
    }

    const schema = s.enum<ListImportOptions['mode']>(['ban', 'unban']);

    const mode = schema.parse(invokerCmd);
    const shouldIgnoreFilterList =
      interaction.options.getBoolean(IGNORE_FILTER_TEXT) || mode !== 'ban';

    const parsedIds = this.parseIds(ids, reason);

    if (parsedIds.isErr() || !parsedIds.isOk()) {
      await interaction.editReply({
        embeds: [
          debugErrorEmbed({
            checks: [
              {
                question: 'Can you ban?',
                result: interaction.memberPermissions.has(PermissionFlagsBits.BanMembers),
              },
              {
                question: 'Inside server?',
                result: interaction.inGuild(),
              },
            ],
            description: 'There was an error while parsing the list of IDs',
            error: parsedIds.error!,
            inputs: [
              {
                name: 'reason',
                value: reason,
              },
              {
                name: IGNORE_FILTER_TEXT,
                value: `${shouldIgnoreFilterList}`,
              },
            ],
            solution: 'Please check your ban list once',
            title: '**An error occurred**',
          }),
        ],
      });
      return;
    }

    await importList(interaction, parsedIds.value, interaction.guild, mode, shouldIgnoreFilterList);
  }
}

void container.stores.loadPiece({
  name: PIECE_NAME,
  piece: UserCommand,
  store: 'commands',
});
