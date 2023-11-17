import { ApplyOptions } from '@sapphire/decorators';
import { Command, container } from '@sapphire/framework';
import { s } from '@sapphire/shapeshift';
import { Time } from '@sapphire/time-utilities';
import { ApplicationCommandOptionType, PermissionFlagsBits } from 'discord.js';
// @ts-ignore
import { getRawPaste } from 'dpaste-ts';
import { NOT_PERMITTED, SERVER_ONLY } from '../lib/Constants';
import type { BanEntityWithReason } from '../lib/typeDefs';
import { banEntitySchemaBuilder, importList } from '../lib/utils';


@ApplyOptions<Command.Options>({
  name: 'import-ban-list',
  description: 'Imports ban list via link',
  requiredClientPermissions: [PermissionFlagsBits.BanMembers],
  requiredUserPermissions: [PermissionFlagsBits.BanMembers],
  preconditions: ['GuildOnly'],
  detailedDescription: {
    help: 'Imports ban list via link.\nSupported links - dpaste.com and pastebin.com',
  },
  cooldownDelay: Time.Hour,
  cooldownLimit: 1,
  cooldownFilteredUsers: process.env.OWNER_ID ? [process.env.OWNER_ID] : undefined,
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

    const data = await getRawPaste(link);
    const defaultReason = `Imported by ${interaction.user.username} on ${new Date().toUTCString()}`;
    const BanEntitiesSchema = banEntitySchemaBuilder(defaultReason);

    const BanEntitiesWithReasonSchema = s.array<BanEntityWithReason>(
      s.object({
        id: s.string,
        reason: s.string.default(defaultReason),
      }).required,
    );

    try {
      const parsedData = JSON.parse(data);
      const validatedData = BanEntitiesWithReasonSchema.parse(parsedData);
      return await importList(interaction, validatedData, interaction.guild, 'ban');
    } catch (e) {
      try {
        const validatedData = BanEntitiesSchema.parse(data);
        return importList(interaction, validatedData, interaction.guild, 'ban');
      } catch {
        return interaction.editReply({
          content: 'Invalid data',
        });
      }
    }
  }
}


void container.stores.loadPiece({
  name: UserCommand.name,
  piece: UserCommand,
  store: 'commands',
});
