import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  PermissionFlagsBits,
} from 'discord.js';
import { COLORS, NOT_PERMITTED, SERVER_ONLY } from '../lib/Constants';
import { emitBotEvent } from '../lib/utils';

@ApplyOptions<Command.Options>({
  name: 'ban',
  description: 'Bans a user',
  requiredClientPermissions: PermissionFlagsBits.BanMembers,
  requiredUserPermissions: PermissionFlagsBits.BanMembers,
  preconditions: ['GuildOnly'],
})
export default class UserCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description,
      defaultMemberPermissions: PermissionFlagsBits.BanMembers,
      dmPermission: false,
      dm_permission: false,
      type: ApplicationCommandType.ChatInput,
      options: [
        {
          name: 'user',
          description: 'The user to ban',
          type: ApplicationCommandOptionType.User,
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
          name: 'delete_messages',
          description: 'The number of days to delete messages for',
          type: ApplicationCommandOptionType.Integer,
          required: false,
          maxValue: 7,
          max_value: 7,
        },
      ],
    });
  }

  public override async autocompleteRun(interaction: Command.AutocompleteInteraction) {
    const val = interaction.options.getFocused();

    const possibleReasons = [
      `Banned by ${interaction.user.username} on ${new Date().toDateString()}`,
      'Spamming in chat',
      'Raiding the server',
      'Posted NSFW',
      'Harassing other users',
      'Advertising without permission',
      'Malicious Bot',
    ].filter((reason) => reason.toLowerCase().includes(val.toLowerCase()));

    return interaction.respond(
      possibleReasons.map((reason) => ({
        name: reason,
        value: reason,
      })),
    );
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const convict = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason', true);
    const deleteMsgDays = interaction.options.getInteger('delete_messages') || undefined;

    if (!interaction.inGuild() || !interaction.guild) {
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

    const mod = await interaction.guild.members.fetch(interaction.user.id);

    return interaction.guild.members
      .ban(convict, {
        deleteMessageSeconds: deleteMsgDays,
        reason,
      })
      .then(() => {
        emitBotEvent('BotGuildBanAdd', { convict, executor: mod, reason });
        return interaction.reply({
          embeds: [
            {
              title: '**Ban Hammer Dropped!**',
              color: COLORS.orangeHammerHandle,
              description: `\`${convict.username}\` ${convict} is banned from this server.`,
              thumbnail: {
                url: convict.displayAvatarURL(),
              },
              fields: [
                {
                  name: '**Reason**',
                  value: reason,
                },
                {
                  name: '**Convict ID**',
                  value: convict.id,
                },
              ],
              timestamp: new Date().toISOString(),
            },
          ],
        });
      });
  }
}
