import { ApplyOptions } from '@sapphire/decorators';
import { isGuildMember } from '@sapphire/discord.js-utilities';
import { Command } from '@sapphire/framework';
import { ApplicationCommandOptionType, PermissionFlagsBits } from 'discord.js';
import { COLORS } from '../lib/Constants';
import { debugErrorEmbed, debugErrorFile } from '../lib/utils';

@ApplyOptions<Command.Options>({
  name: 'kick',
  description: 'Kick out a member',
  preconditions: ['GuildOnly'],
  requiredClientPermissions: PermissionFlagsBits.KickMembers,
  requiredUserPermissions: PermissionFlagsBits.KickMembers,
})
export default class UserCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description,
      dm_permission: false,
      dmPermission: false,
      defaultMemberPermissions: PermissionFlagsBits.KickMembers,
      options: [
        {
          name: 'user',
          description: 'The user to kick',
          type: ApplicationCommandOptionType.User,
          required: true,
        },
        {
          name: 'reason',
          description: 'The reason for kicking',
          type: ApplicationCommandOptionType.String,
        },
      ],
    });
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const convict = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason')
      || `Kicked by ${interaction.user.username} on ${new Date().toString()} ||for no reason :joy:||`;

    if (!interaction.inGuild() || !interaction.guild) {
      return interaction.reply({
        content: 'This command can only be used in a server',
        ephemeral: true,
      });
    }

    if (!isGuildMember(convict)) {
      return interaction.reply({
        content: `${convict} is not in this server.`,
        ephemeral: true,
      });
    }

    return convict.kick(reason).then(() =>
      interaction.reply({
        embeds: [
          {
            title: '**Kicking Wrench Thrown!**',
            color: COLORS.wrenchHandle,
            description: `\`${convict.user.username}\` ${convict} is kicked from this server.`,
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
      }));
  }
}
