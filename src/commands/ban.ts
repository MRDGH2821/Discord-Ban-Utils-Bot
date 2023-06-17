import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  MessageFlags,
  PermissionFlagsBits,
} from 'discord.js';
import { COLORS } from '../lib/Constants';

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
      `Banned by ${interaction.user.tag} on ${new Date().toDateString()}`,
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

    if (!interaction.guild) {
      return interaction.reply({
        content: 'This command can only be used in a guild.',
        flags: MessageFlags.Ephemeral,
      });
    }

    return interaction.guild.members
      .ban(convict, {
        deleteMessageSeconds: deleteMsgDays,
        reason,
      })
      .then(() => interaction.reply({
        embeds: [
          {
            title: '**Ban Hammer Dropped!**',
            color: COLORS.hammerHandle,
            description: `\`${convict.tag}\` ${convict} is banned from this server.`,
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
      .catch(async (error) => {
        const canBan = interaction.memberPermissions?.has(PermissionFlagsBits.BanMembers) || false;

        const isBannable = (await interaction.guild?.members
          .fetch({
            user: convict,
          })
          .then((convictMember) => convictMember.bannable)) ?? true;

        return interaction.reply({
          embeds: [
            {
              title: '**Cannot Ban...**',
              description: `User ${convict} cannot be banned :grimacing:\n\nIf this error is coming even after passing all checks, then please report the Error Dump section to developer.`,
              color: COLORS.error,
              fields: [
                {
                  name: '**Checks**',
                  value: `Can you ban? **\`${canBan}\`**\nUser bannable? **\`${isBannable}\`**`,
                },
                {
                  name: '**Possible Solutions**',
                  value: `Make sure you have ban permissions.\nAlso make sure that the bot role is above ${convict}'s highest role for this command to work.`,
                },
                {
                  name: '**Inputs given**',
                  value: `User: ${convict} \`${convict.tag}\`\nID: \`${convict.id}\`\nReason: ${reason}\nNumber of msgs (in days) to be deleted: ${deleteMsgDays}`,
                },
                {
                  name: '**Error Dump**',
                  value: `${error}`,
                },
              ],
            },
          ],
          files: [
            {
              name: 'Ban Error Dump.txt',
              attachment: Buffer.from(
                `${error}\n-------------------\n\n${JSON.stringify(error, null, 2)}`,
              ),
            },
          ],
        });
      });
  }
}