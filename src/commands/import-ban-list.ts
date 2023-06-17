import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { s } from '@sapphire/shapeshift';
import { retry, sleepSync } from '@sapphire/utilities';
import { ApplicationCommandOptionType, PermissionFlagsBits } from 'discord.js';
import { getRawPaste } from 'dpaste-ts';
import { sequentialPromises } from 'yaspr';
import type { BanEntityWithReason, BanType } from '../lib/typeDefs';

@ApplyOptions<Command.Options>({
  name: 'import-ban-list',
  description: 'Imports ban list via link',
  requiredClientPermissions: [PermissionFlagsBits.BanMembers],
  requiredUserPermissions: [PermissionFlagsBits.BanMembers],
  preconditions: ['GuildOnly'],
  detailedDescription: 'Imports ban list via link.\nSupported links - dpaste.com and pastebin.com',
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
        content: 'This command can only be used in a guild.',
        ephemeral: true,
      });
    }

    const link = interaction.options.getString('link', true);

    const data = await getRawPaste(link);

    const bans = JSON.parse(data) as BanType[];
    const defaultReason = `Imported by ${interaction.user.username} from ${link}`;

    const banListWithReason = s.array(
      s.object({
        id: s.string,
        reason: s.string.default(defaultReason),
      }),
    );
    const processedListWithReason = banListWithReason.run(bans);

    const banList = s.array(s.string);
    const processedList = banList.run(bans);

    const validatedList: BanEntityWithReason[] = [];

    if (processedListWithReason.isOk()) {
      validatedList.concat(processedListWithReason.value);
      return this.initiateBans(interaction, validatedList, defaultReason);
    }
    if (processedList.isOk()) {
      processedList.value.forEach((ban) => {
        validatedList.push({ id: ban, reason: defaultReason });
      });
      return this.initiateBans(interaction, validatedList, defaultReason);
    }
    return interaction.reply({
      content: 'Invalid ban list',
      ephemeral: true,
    });
  }

  // eslint-disable-next-line class-methods-use-this
  public async initiateBans(
    interaction: Command.ChatInputCommandInteraction,
    list: BanEntityWithReason[],
    defaultReason: string,
  ) {
    if (!interaction.guild || !interaction.inGuild() || !interaction.inCachedGuild()) {
      return interaction.reply({
        content: 'This command can only be used in a guild.',
        ephemeral: true,
      });
    }
    if (!interaction.deferred) {
      await interaction.deferReply();
    }

    await interaction.editReply({
      embeds: [
        {
          title: 'Importing ban list',
          description: `Found ${list.length} bans`,
        },
      ],
    });

    const successBans: BanEntityWithReason[] = [];
    const failedBans: BanEntityWithReason[] = [];
    const performBan = async (ban: BanEntityWithReason) => {
      await retry(
        async () => interaction.guild.members
          .ban(ban.id, { reason: ban.reason || defaultReason })
          .then(() => {
            successBans.push(ban);
          })
          .catch(() => {
            failedBans.push(ban);
            return sleepSync(1000);
          }),
        3,
      );

      return interaction.editReply({
        content: `(${list.findIndex((b) => b.id === ban.id) + 1}/${list.length})`,
      });
    };

    return sequentialPromises(list, performBan);
  }
}
