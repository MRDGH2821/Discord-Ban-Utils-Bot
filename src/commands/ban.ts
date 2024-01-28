import { ApplyOptions } from '@sapphire/decorators';
import { Command, container } from '@sapphire/framework';
import { Time } from '@sapphire/time-utilities';
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  PermissionFlagsBits,
} from 'discord.js';
import { COLORS, NOT_PERMITTED, SERVER_ONLY } from '../lib/Constants';
import { emitBotEvent } from '../lib/utils';

const PIECE_NAME = 'ban';
@ApplyOptions<Command.Options>({
  name: PIECE_NAME,
  description: 'Bans a user',
  requiredClientPermissions: PermissionFlagsBits.BanMembers,
  requiredUserPermissions: PermissionFlagsBits.BanMembers,
  preconditions: ['GuildOnly'],
  detailedDescription: {
    help: 'Bans a user from current server.\nReason can be used from the list or you can input your custom reason',
  },
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
          description: 'How much message history to delete',
          type: ApplicationCommandOptionType.Integer,
          required: false,
          choices: [
            {
              name: "Don't delete messages (default)",
              value: 0,
            },
            {
              name: 'Previous hour',
              value: Time.Hour,
            },
            {
              name: 'Previous 3 hours',
              value: 3 * Time.Hour,
            },
            {
              name: 'Previous 6 hours',
              value: 6 * Time.Hour,
            },
            {
              name: 'Previous 12 hours',
              value: 12 * Time.Hour,
            },
            {
              name: 'Previous 24 hours',
              value: Time.Day,
            },
            {
              name: 'Previous 2 Days',
              value: 2 * Time.Day,
            },
            {
              name: 'Previous 3 Days',
              value: 3 * Time.Day,
            },
            {
              name: 'Previous 4 Days',
              value: 4 * Time.Day,
            },
            {
              name: 'Previous 5 Days',
              value: 5 * Time.Day,
            },
            {
              name: 'Previous 6 Days',
              value: 6 * Time.Day,
            },
            {
              name: 'Previous 7 Days',
              value: Time.Week,
            },
          ],
        },
      ],
    });
  }

  public override async autocompleteRun(interaction: Command.AutocompleteInteraction) {
    const val = interaction.options.getFocused();
    const stdReason = `Banned by ${interaction.user.username} on ${new Date().toDateString()}`;

    const possibleReasons = [
      stdReason,
      'Spamming in chat',
      'Raiding the server',
      'Posted NSFW',
      'Harassing other users',
      'Advertising without permission',
      'Malicious Bot',
      'Spam bot',
      'Nitro Scam',
      'Ping spam',
      'Crypto scam',
      'DM scam',
    ].filter((reason) => reason.toLowerCase().includes(val.toLowerCase()));

    const mappedReasons = possibleReasons.map((reason) => ({
      name: reason,
      value: reason,
    }));

    if (val.length < 3) {
      mappedReasons.push({
        name: '(Or type your own)',
        value: stdReason,
      });
    }
    return interaction.respond(mappedReasons.slice(0, 24));
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const convict = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason', true);
    let deleteMsgDays = interaction.options.getInteger('delete_messages') || 0;

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

    if (deleteMsgDays) {
      deleteMsgDays /= 1000;
    }

    const executor = await interaction.guild.members.fetch(interaction.user.id);

    return interaction.guild.members
      .ban(convict, {
        deleteMessageSeconds: deleteMsgDays,
        reason,
      })
      .then(() => {
        emitBotEvent('botGuildBanAdd', { convict, executor, reason });
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
                {
                  name: '**Duration of Message History deleted**',
                  value: deleteMsgDays ? `${deleteMsgDays} days` : 'Not deleted',
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
