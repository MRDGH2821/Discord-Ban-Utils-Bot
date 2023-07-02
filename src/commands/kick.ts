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
        content: 'Cannot kick because they are not in the server',
        ephemeral: true,
      });
    }

    return convict
      .kick(reason)
      .then(() =>
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
        }))
      .catch((err) =>
        interaction.reply({
          embeds: [
            debugErrorEmbed({
              title: '**Cannot kick...**',
              checks: [
                { question: '**Is bot above member?**', result: convict.manageable },
                {
                  question: '**Is member kickable by bot?**',
                  result: convict.kickable,
                },
              ],
              error: err,
              description: `Failed to kick ${convict.user} :grimacing:\n\nIf this error is coming even after passing all checks, then please report the Error Dump section to developer.`,
              inputs: [
                {
                  name: 'Convict',
                  value: convict.user.toString(),
                },
                {
                  name: 'Reason',
                  value: reason || 'No Reason given',
                },
              ],
              solution:
                'Make sure that the you & bot both have permissions to kick and the highest role is above the member you are trying to kick',
            }),
          ],
          files: [debugErrorFile(err)],
        }));
  }
}
