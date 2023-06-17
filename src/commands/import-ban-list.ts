import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { s } from '@sapphire/shapeshift';
import { retry, sleepSync } from '@sapphire/utilities';
import {
  ApplicationCommandOptionType,
  ButtonStyle,
  ComponentType,
  PermissionFlagsBits,
  type APIEmbed,
} from 'discord.js';
import { createPaste, getRawPaste } from 'dpaste-ts';
import { sequentialPromises } from 'yaspr';
import { COLORS } from '../lib/Constants';
import type { BanEntityWithReason, BanType } from '../lib/typeDefs';
import { truncateString } from '../lib/utils';

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
    this.container.logger.debug(data);
    const banListWithReason = s.array(
      s.object({
        id: s.string,
        reason: s.string.default(defaultReason),
      }),
    );
    const processedListWithReason = banListWithReason.run(bans);

    const banList = s
      .array(s.string)
      .transform((value) => value.map((v) => ({ id: v, reason: defaultReason })));
    const processedList = banList.run(bans);

    if (processedListWithReason.isOk()) {
      return this.initiateBans(interaction, processedListWithReason.value, defaultReason);
    }
    if (processedList.isOk()) {
      return this.initiateBans(interaction, processedList.value, defaultReason);
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
    this.container.logger.debug(list);
    if (!interaction.guild || !interaction.inGuild() || !interaction.inCachedGuild()) {
      return interaction.reply({
        content: 'This command can only be used in a guild.',
        ephemeral: true,
      });
    }
    if (!interaction.deferred) {
      await interaction.deferReply();
    }

    if (list.length === 0) {
      return interaction.editReply({
        content: 'No bans found in the list',
      });
    }

    await interaction.editReply({
      embeds: [
        {
          title: 'Importing ban list',
          description: `Found ${list.length} bans`,
          color: COLORS.whiteGray,
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

    const banStats: APIEmbed = {
      title: 'Ban list imported!',
      description: 'Ban statistics:',
      color: COLORS.hammerHandle,
      fields: [
        {
          name: 'Successful bans',
          value: successBans.length.toString(),
        },
        {
          name: 'Failed bans',
          value: failedBans.length.toString(),
        },
        {
          name: 'Total bans',
          value: list.length.toString(),
        },
      ],
    };

    await sequentialPromises(list, performBan).catch(async (err) => interaction.editReply({
      content: `An error occurred while importing ban list: ${err.message}`,
    }));

    return interaction.editReply({
      embeds: [banStats],
      components:
        failedBans.length > 0
          ? [
            {
              type: ComponentType.ActionRow,
              components: [
                {
                  type: ComponentType.Button,
                  label: 'Unsuccessful ban list link',
                  style: ButtonStyle.Link,
                  url: await createPaste({
                    content: JSON.stringify(failedBans, null, 2),
                    title: `[FAILED] ${truncateString(interaction.guild.name, 10)} Ban List`,
                  }),
                },
              ],
            },
          ]
          : undefined,
    });
  }
}
