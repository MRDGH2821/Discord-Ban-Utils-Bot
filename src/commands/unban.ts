import { ApplyOptions } from '@sapphire/decorators';
import { Command, container } from '@sapphire/framework';
import { ApplicationCommandOptionType, PermissionFlagsBits } from 'discord.js';
import { COLORS, NOT_PERMITTED, SERVER_ONLY } from '../lib/Constants';
import { emitBotEvent } from '../lib/EventTypes';

const PIECE_NAME = 'unban';
@ApplyOptions<Command.Options>({
  name: PIECE_NAME,
  description: 'Unbans a member',
  preconditions: ['GuildOnly'],
  requiredClientPermissions: PermissionFlagsBits.BanMembers,
  requiredUserPermissions: PermissionFlagsBits.BanMembers,
  detailedDescription: {
    help: 'Bans a user from current server.\nReason can be used from the list or you can input your custom reason',
  },
})
export default class UserCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description,
      dm_permission: false,
      dmPermission: false,
      defaultMemberPermissions: PermissionFlagsBits.BanMembers,
      options: [
        {
          name: 'user',
          description: 'Enter User ID',
          type: ApplicationCommandOptionType.User,
          required: true,
        },
        {
          name: 'reason',
          description: 'Reason for unban',
          type: ApplicationCommandOptionType.String,
          autocomplete: true,
        },
      ],
    });
  }

  public override async autocompleteRun(interaction: Command.AutocompleteInteraction) {
    const val = interaction.options.getFocused();

    const possibleReasons = [
      `UnBanned by ${interaction.user.username} on ${new Date().toDateString()}`,
      'Banned by mistake',
      'Giving them 2nd chance',
      'User has atoned for their punishment',
    ].filter((reason) => reason.toLowerCase().includes(val.toLowerCase()));

    return interaction.respond(
      possibleReasons.map((reason) => ({
        name: reason,
        value: reason,
      })),
    );
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const user = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason') || 'No reason provided';

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

    const executor = await interaction.guild.members.fetch(interaction.user.id);

    return interaction.guild.members.unban(user, reason).then(() => {
      emitBotEvent('botGuildBanRemove', { convict: user, executor, reason });
      return interaction.reply({
        embeds: [
          {
            title: '**Member Unbanned!**',
            color: COLORS.orangeHammerHandle,
            description: `\`${user.username}\` ${user} is unbanned from this server.`,
            thumbnail: {
              url: user.displayAvatarURL(),
            },
            fields: [
              {
                name: '**Reason**',
                value: reason,
              },
              {
                name: '**User ID**',
                value: user.id,
              },
            ],
            timestamp: new Date().toISOString(),
          },
        ],
      });
    });
  }
}

void container.stores.loadPiece({
  name: PIECE_NAME,
  piece: UserCommand,
  store: 'commands',
});
