import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ButtonStyle,
  ComponentType,
  MessageFlags,
  PermissionFlagsBits,
  type APIEmbed,
} from 'discord.js';
import { COLORS } from '../lib/Constants';
import type { BanExportOptions } from '../lib/typeDefs';

@ApplyOptions<Command.Options>({
  name: 'export-ban-list',
  description: 'A basic slash command',
  requiredClientPermissions: [
    PermissionFlagsBits.ViewAuditLog,
    PermissionFlagsBits.BanMembers,
    PermissionFlagsBits.EmbedLinks,
  ],
  preconditions: ['GuildOnly'],
})
export default class UserCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description,
      dm_permission: false,
      dmPermission: false,
      type: ApplicationCommandType.ChatInput,
      options: [
        {
          name: 'include-reason',
          description: 'Export the ban list with ban reason (default: true)',
          type: ApplicationCommandOptionType.Boolean,
          required: false,
        },
      ],
    });
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const reasonFlag = interaction.options.getBoolean('include-reason');
    const includeReason = reasonFlag === null ? true : reasonFlag;

    if (!interaction.guild || !interaction.inGuild() || !interaction.inCachedGuild()) {
      return interaction.reply({
        content: 'Please use this command inside server',
        flags: MessageFlags.Ephemeral,
      });
    }

    return interaction
      .reply({
        embeds: [
          {
            title: '**Confirm Export**',
            description:
              'Exporting a ban list may take a long time and cannot be cancelled once started. \nAre you sure you want to export?',
          },
        ],
        components: [
          {
            type: ComponentType.ActionRow,
            components: [
              {
                type: ComponentType.Button,
                style: ButtonStyle.Success,
                label: 'Yes',
                custom_id: 'export-ban-list-yes',
              },
              {
                type: ComponentType.Button,
                style: ButtonStyle.Danger,
                label: 'No',
                custom_id: 'export-ban-list-no',
              },
            ],
          },
        ],
      })
      .then((itxResponse) => itxResponse.awaitMessageComponent({
        filter(btx) {
          return btx.user.id === interaction.user.id;
        },
        componentType: ComponentType.Button,
        dispose: true,
      }))
      .then((btx) => {
        if (btx.customId === 'export-ban-list-yes') {
          const statusEmbed: APIEmbed = {
            title: '**Ban List export Scheduled**',
            color: COLORS.whiteGray,
            description:
              "Ban list export is scheduled. You will be notified in this channel when it's done.",
            timestamp: new Date().toISOString(),
          };

          const exportBanOptions: BanExportOptions = {
            sourceGuild: btx.guild,
            includeReason,
            notifyInChannel: btx.message.channel,
            requesterUser: interaction.user,
            sourceMessage: btx.message,
          };

          interaction.client.emit('exportBanList', exportBanOptions);

          return interaction.editReply({ embeds: [statusEmbed] });
        }
        return btx.editReply({
          embeds: [
            {
              title: '**Export Cancelled**',
              color: COLORS.whiteGray,
            },
          ],
          components: [],
        });
      });
  }
}
