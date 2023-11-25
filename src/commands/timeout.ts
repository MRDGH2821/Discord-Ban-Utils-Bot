import { ApplyOptions } from '@sapphire/decorators';
import { isGuildMember } from '@sapphire/discord.js-utilities';
import { Command, container } from '@sapphire/framework';
import { Time } from '@sapphire/time-utilities';
import { ApplicationCommandOptionType, PermissionFlagsBits } from 'discord.js';
import ms from 'enhanced-ms';
import { COLORS, NOT_PERMITTED, SERVER_ONLY } from '../lib/Constants';
import { emitBotEvent } from '../lib/utils';

@ApplyOptions<Command.Options>({
  name: 'timeout',
  description: 'time out a user',
  preconditions: ['GuildOnly'],
  requiredClientPermissions: PermissionFlagsBits.ModerateMembers,
  requiredUserPermissions: PermissionFlagsBits.ModerateMembers,
  detailedDescription: {
    help: 'Timeout a user for a specific duration.\nCan un-timeout by using "Remove Timeout" option',
  },
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
          autocomplete: true,
          max_value: Time.Day * 27,
          maxValue: Time.Day * 27,
        },
        {
          name: 'reason',
          description: 'The reason for the timeout',
          type: ApplicationCommandOptionType.String,
        },
      ],
    });
  }

  public override async autocompleteRun(interaction: Command.AutocompleteInteraction) {
    const value = interaction.options.getFocused();

    const choices = [
      {
        name: 'Remove Timeout',
        value: -1,
      },
      {
        name: '1 Minute (minimum)',
        value: Time.Minute,
      },
      {
        name: '27 Days (maximum)',
        value: Time.Day * 27,
      },
    ];

    try {
      const time = ms(value);
      if (!time) throw new Error('Invalid time');

      const timeSentence = ms(time, { includeMs: true });
      if (!timeSentence) throw new Error('Invalid time');

      if (time < Time.Minute || time > Time.Day * 27) {
        throw new Error('Invalid time');
      }

      choices.push({
        name: timeSentence,
        value: time,
      });
    } catch {
      const defaultChoices: { name: string; value: number }[] = [
        {
          name: ms(ms('5 min')!)!,
          value: ms('5 min')!,
        },
        {
          name: ms(ms('10 min')!)!,
          value: ms('10 min')!,
        },
        {
          name: ms(ms('15 min')!)!,
          value: ms('15 min')!,
        },
        {
          name: ms(ms('30 min')!)!,
          value: ms('30 min')!,
        },
        {
          name: ms(ms('1 hour')!)!,
          value: ms('1 hour')!,
        },
        {
          name: ms(ms('2 hours')!)!,
          value: ms('2 hours')!,
        },
        {
          name: ms(ms('3 hours')!)!,
          value: ms('3 hours')!,
        },
        {
          name: ms(ms('6 hours')!)!,
          value: ms('6 hours')!,
        },
        {
          name: ms(ms('12 hours')!)!,
          value: ms('12 hours')!,
        },
        {
          name: ms(ms('1 day')!)!,
          value: ms('1 day')!,
        },
        {
          name: ms(ms('2 days')!)!,
          value: ms('2 days')!,
        },
        {
          name: ms(ms('3 days')!)!,
          value: ms('3 days')!,
        },
        {
          name: ms(ms('4 days')!)!,
          value: ms('4 days')!,
        },
        {
          name: ms(ms('5 days')!)!,
          value: ms('5 days')!,
        },
        {
          name: ms(ms('6 days')!)!,
          value: ms('6 days')!,
        },
        {
          name: ms(ms('7 days')!)!,
          value: ms('7 days')!,
        },
        {
          name: ms(ms('14 days')!)!,
          value: ms('14 days')!,
        },
        {
          name: ms(ms('21 days')!)!,
          value: ms('21 days')!,
        },
      ];

      choices.push(...defaultChoices);
    }
    return interaction.respond(choices.slice(0, 25));
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const convict = interaction.options.getMember('user');
    const duration = interaction.options.getInteger('duration', true);
    const reason = interaction.options.getString('reason') || 'No reason provided';

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

    const fields = [
      {
        name: '**Reason**',
        value: reason,
      },
    ];
    const thumbnail = {
      url: convict.displayAvatarURL(),
    };

    if (duration <= 0) {
      return convict.disableCommunicationUntil(null, reason).then((target) =>
        interaction.reply({
          embeds: [
            {
              title: `${target.user.username} is no longer timed out!`,
              description: `\`${target.user.username}\` ${target} is no longer timed out`,
              color: COLORS.lightGray,
              thumbnail,
              fields,
              timestamp: new Date().toISOString(),
            },
          ],
        }));
    }

    const durationSentence = ms(duration!, { includeMs: true });

    if (duration > Time.Day * 27) {
      return interaction.reply({
        content: `Timeout duration cannot exceed 27 days.\nYou provided ${durationSentence}`,
        ephemeral: true,
      });
    }

    const executor = await interaction.guild.members.fetch(interaction.user.id);

    return convict.timeout(duration, reason).then((target) => {
      emitBotEvent('botTimeout', { convict, executor, reason });
      return interaction.reply({
        embeds: [
          {
            title: `${target.user.username} is timed out!`,
            description: `\`${target.user.username}\` ${target} is timed out for ${durationSentence}\n**Reason:** ${reason}`,
            color: COLORS.cadetBlueFreeze,
            thumbnail,
            fields: fields.concat({
              name: '**Convict ID**',
              value: convict.id,
            }),
            timestamp: new Date().toISOString(),
          },
        ],
      });
    });
  }
}

container.stores.loadPiece({
  name: UserCommand.name,
  piece: UserCommand,
  store: 'commands',
});
