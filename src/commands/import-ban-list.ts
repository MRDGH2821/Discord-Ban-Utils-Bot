import { ApplyOptions } from '@sapphire/decorators';
import { Command, container } from '@sapphire/framework';
import { s } from '@sapphire/shapeshift';
import { Time } from '@sapphire/time-utilities';
import { ApplicationCommandOptionType, PermissionFlagsBits } from 'discord.js';
import { getRawPaste } from 'dpaste-ts';
import { NOT_PERMITTED, SERVER_ONLY } from '../lib/Constants';
import type { BanEntityWithReason } from '../lib/typeDefs';
import { banEntitySchemaBuilder, debugErrorEmbed, importList } from '../lib/utils';

const PIECE_NAME = 'import-ban-list';
@ApplyOptions<Command.Options>({
  name: PIECE_NAME,
  description: 'Imports ban list via link',
  requiredClientPermissions: [PermissionFlagsBits.BanMembers],
  requiredUserPermissions: [PermissionFlagsBits.BanMembers],
  preconditions: ['GuildOnly'],
  detailedDescription: {
    help: 'Imports ban list via link.\nSupported links - dpaste.com and pastebin.com',
  },
  cooldownDelay: Time.Hour,
  cooldownLimit: 1,
})
export default class UserCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description,
      default_member_permissions: 'BAN_MEMBERS',
      defaultMemberPermissions: [PermissionFlagsBits.BanMembers],
      dm_permission: false,
      dmPermission: false,
      options: [
        {
          name: 'link',
          description: 'Link to the ban list',
          type: ApplicationCommandOptionType.String,
          required: true,
        },
        {
          name: 'reason',
          description: 'Reason for the ban list import. Used only if ban reason is missing.',
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: 'ignore-filter-list',
          description: 'Ignore the filter list while importing ban list (default: false)',
          type: ApplicationCommandOptionType.Boolean,
          required: false,
        },
      ],
    });
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    if (!interaction.guild || !interaction.inGuild() || !interaction.inCachedGuild()) {
      return interaction.reply({
        content: SERVER_ONLY,
        ephemeral: true,
      });
    }

    if (!interaction.memberPermissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({
        content: NOT_PERMITTED,
        ephemeral: true,
      });
    }

    await interaction.deferReply();
    const link = interaction.options.getString('link', true);
    const shouldIgnoreFilterList = interaction.options.getBoolean('ignore-filter-list') || false;

    const data = await getRawPaste(link);
    const defaultReason =
      interaction.options.getString('reason') ||
      `Imported by ${interaction.user.username} on ${new Date().toUTCString()}`;
    const BanEntitiesSchema = banEntitySchemaBuilder(defaultReason);

    const BanEntitiesWithReasonSchema = s.array<BanEntityWithReason>(
      s
        .object({
          id: s.string(),
          reason: s.string().nullable().nullish().optional().default(defaultReason),
        })
        .required(),
    );

    try {
      const parsedData = JSON.parse(data) as object;
      const validatedData = BanEntitiesWithReasonSchema.parse(parsedData);
      return await importList(
        interaction,
        validatedData,
        interaction.guild,
        'ban',
        shouldIgnoreFilterList,
      );
    } catch (error) {
      try {
        const validatedData = BanEntitiesSchema.parse(data);
        return await importList(
          interaction,
          validatedData,
          interaction.guild,
          'ban',
          shouldIgnoreFilterList,
        );
      } catch (error2) {
        return interaction.editReply({
          embeds: [
            debugErrorEmbed({
              checks: [
                {
                  question: 'Can you ban',
                  result: interaction.memberPermissions.has(PermissionFlagsBits.BanMembers),
                },
              ],
              error: error2 as Error,
              description: 'Failed to parse the data.',
              inputs: [
                {
                  name: 'Link',
                  value: link,
                },
                {
                  name: 'Reason',
                  value: defaultReason,
                },
              ],
              solution:
                'Please wait for some time before trying again. Or contact bot developer & provide the link.',
              title: 'Failed to import ban list',
            }),
          ],
        });
      }
    }
  }
}

void container.stores.loadPiece({
  name: PIECE_NAME,
  piece: UserCommand,
  store: 'commands',
});
