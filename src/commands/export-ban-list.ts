import { ApplyOptions } from "@sapphire/decorators";
import { Command, container } from "@sapphire/framework";
import {
  type APIEmbed,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ButtonStyle,
  ComponentType,
  PermissionFlagsBits,
} from "discord.js";
import { COLORS, SERVER_ONLY } from "../lib/Constants.js";
import type { BanExportOptions } from "../lib/typeDefs.js";
import { emitBotEvent } from "../lib/utils.js";

const PIECE_NAME = "export-ban-list";
@ApplyOptions<Command.Options>({
  name: PIECE_NAME,
  description: "Exports ban list as link(s)",
  requiredClientPermissions: [
    PermissionFlagsBits.ViewAuditLog,
    PermissionFlagsBits.BanMembers,
    PermissionFlagsBits.EmbedLinks,
  ],
  preconditions: ["GuildOnly"],
  detailedDescription: {
    help: "Exports all the bans of current server as a list of links.",
  },
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
          name: "include-reason",
          description: "Export the ban list with ban reason (default: true)",
          type: ApplicationCommandOptionType.Boolean,
          required: false,
        },
        {
          name: "ignore-filter-list",
          description: "Ignore the filter list (default: false)",
          type: ApplicationCommandOptionType.Boolean,
          required: false,
        },
      ],
    });
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction,
  ) {
    const reasonFlag = interaction.options.getBoolean("include-reason");
    const includeReason = reasonFlag ?? true;
    const shouldIgnoreFilterList =
      interaction.options.getBoolean("ignore-filter-list") ?? false;

    if (
      !interaction.guild ||
      !interaction.inGuild() ||
      !interaction.inCachedGuild()
    ) {
      return interaction.reply({ content: SERVER_ONLY, ephemeral: true });
    }

    return interaction
      .reply({
        embeds: [
          {
            title: "**Confirm Export**",
            description:
              "Exporting a ban list may take a long time and cannot be cancelled once started. \nAre you sure you want to export?",
          },
        ],
        components: [
          {
            type: ComponentType.ActionRow,
            components: [
              {
                type: ComponentType.Button,
                style: ButtonStyle.Success,
                label: "Yes",
                custom_id: "export-ban-list-yes",
              },
              {
                type: ComponentType.Button,
                style: ButtonStyle.Danger,
                label: "No",
                custom_id: "export-ban-list-no",
              },
            ],
          },
        ],
      })
      .then(async (iRes) =>
        iRes.awaitMessageComponent({
          filter(btx) {
            return btx.user.id === interaction.user.id;
          },
          componentType: ComponentType.Button,
          dispose: true,
        }),
      )
      .then(async (btx) => {
        if (btx.customId === "export-ban-list-yes") {
          const statusEmbed: APIEmbed = {
            title: "**Ban List export Scheduled**",
            color: COLORS.lightGray,
            description: `Ban list export is scheduled. You will be notified in this channel when it's done.\n\nFilter list is ${
              shouldIgnoreFilterList ? "ignored" : "applied"
            }`,
            timestamp: new Date().toISOString(),
          };

          const exportBanOptions: BanExportOptions = {
            sourceGuild: btx.guild,
            includeReason,
            requesterUser: interaction.user,
            sourceMessage: btx.message,
            shouldIgnoreFilterList,
          };

          emitBotEvent("banListExport", exportBanOptions);

          // interaction.client.emit('exportBanList', exportBanOptions);

          return interaction.editReply({
            embeds: [statusEmbed],
            components: [],
          });
        }

        return btx.editReply({
          embeds: [{ title: "**Export Cancelled**", color: COLORS.lightGray }],
          components: [],
        });
      });
  }
}

void container.stores.loadPiece({
  name: PIECE_NAME,
  piece: UserCommand,
  store: "commands",
});
