import { ApplyOptions } from '@sapphire/decorators';
import { isGuildMember } from '@sapphire/discord.js-utilities';
import { Command } from '@sapphire/framework';
import { ApplicationCommandOptionType, PermissionFlagsBits } from 'discord.js';
import { NOT_PERMITTED, SERVER_ONLY } from '../lib/Constants';

@ApplyOptions<Command.Options>({
  name: 'timeout',
  description: 'time out a user',
  preconditions: ['GuildOnly'],
  requiredClientPermissions: PermissionFlagsBits.ModerateMembers,
  requiredUserPermissions: PermissionFlagsBits.ModerateMembers,
})
export default class UserCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description,
      defaultMemberPermissions: PermissionFlagsBits.ModerateMembers,
      dm_permission: false,
      dmPermission: false,
      options: [
        {
          name: 'user',
          description: 'The user to time out',
          required: true,
          type: ApplicationCommandOptionType.User,
        },
        {
          name: 'duration',
          description: 'The duration of the timeout',
          required: true,
          type: ApplicationCommandOptionType.Integer,
        },
        {
          name: 'reason',
          description: 'The reason for the timeout',
          type: ApplicationCommandOptionType.String,
        },
      ],
    });
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const convict = interaction.options.getMember('user');
    const duration = interaction.options.getInteger('duration', true);
    const reason = interaction.options.getString('reason') || undefined;

    if (!interaction.inGuild() || !interaction.guild) {
      return interaction.reply({
        content: SERVER_ONLY,
        ephemeral: true,
      });
    }

    if (!isGuildMember(convict)) {
      return interaction.reply({
        content: `${convict} is not in this server.`,
        ephemeral: true,
      });
    }

    if (!interaction.memberPermissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({
        content: NOT_PERMITTED,
        ephemeral: true,
      });
    }

    if (!convict.moderatable) {
      return interaction.reply({
        content: `Cannot timeout ${convict}`,
        ephemeral: true,
      });
    }

    return convict.disableCommunicationUntil(Date.now() + duration, reason).then((target) =>
      interaction.reply({
        embeds: [
          {
            title: `${target.user.username} is timed out!`,
            description: `\`${
              target.user.username
            }\` ${target} is timed out for ${duration}ms\n**Reason:** ${
              reason || 'No reason provided'
            }`,
            thumbnail: {
              url: convict.displayAvatarURL(),
            },
            fields: [
              {
                name: '**Reason**',
                value: reason || 'No reason provided',
              },
              {
                name: '**Convict ID**',
                value: convict.id,
              },
            ],
            timestamp: new Date().toISOString(),
          },
        ],
      }));
  }
}
