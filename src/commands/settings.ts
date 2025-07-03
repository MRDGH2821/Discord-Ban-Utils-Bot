import { ApplyOptions } from "@sapphire/decorators";
import { container } from "@sapphire/framework";
import { Subcommand } from "@sapphire/plugin-subcommands";
import { codeBlock } from "@sapphire/utilities";
import type { APIEmbed, APISelectMenuOption, TextChannel } from "discord.js";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ChannelType,
  ComponentType,
  PermissionFlagsBits,
} from "discord.js";
import { COLORS, SERVER_ONLY, WEBHOOK_ICON } from "../lib/Constants.js";
import db from "../lib/Database.js";
import type { SettingsParameter } from "../lib/typeDefs.js";
import {
  debugErrorEmbed,
  debugErrorFile,
  emitBotEvent,
  getWebhook,
  selectedSettingsValidator,
  settingFormatter,
  SettingsDescription,
} from "../lib/utils.js";

const PIECE_NAME = "settings";
interface SettingsOpt extends APISelectMenuOption {
  value: SettingsParameter;
}
@ApplyOptions<Subcommand.Options>({
  name: PIECE_NAME,
  description: "Configure bot settings",
  subcommands: [
    {
      name: "set",
      type: "method",
      chatInputRun: "subChatInputRun",
    },
    {
      name: "view",
      type: "method",
      async chatInputRun(interaction) {
        if (!interaction.inGuild() || !interaction.guild) {
          return interaction.reply({
            content: SERVER_ONLY,
            ephemeral: true,
          });
        }
        await interaction.deferReply({
          ephemeral: true,
        });

        const settings = await db.servers
          .get(interaction.guildId)
          .then((v) => v?.data);
        if (!settings) {
          return interaction.editReply({
            content: "No settings configured.",
          });
        }
        const webhook = await getWebhook(
          interaction.guildId,
          settings.webhookId,
        );

        return interaction.editReply({
          embeds: [
            {
              title: "Settings",
              description: `${codeBlock("m", settingFormatter(settings))}\nChannel: ${webhook?.channel}`,
              color: COLORS.lightGray,
            },
          ],
        });
      },
    },
  ],
  preconditions: ["GuildOnly"],
  requiredUserPermissions: PermissionFlagsBits.ManageGuild,
  detailedDescription: {
    help: `Configure bot settings.\nAvailable settings:\n${codeBlock(
      "json",
      JSON.stringify(SettingsDescription, null, 2),
    )}`,
    subcommands: [
      {
        name: "set",
        description: "Set a setting",
        help: "Select which log messages you want to enable/disable",
      },
      {
        name: "view",
        description: "View settings",
        help: "View currently configured settings in this server",
      },
    ],
  },
})
export default class UserCommand extends Subcommand {
  override registerApplicationCommands(registry: Subcommand.Registry) {
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description,
      defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
      dm_permission: false,
      dmPermission: false,
      type: ApplicationCommandType.ChatInput,
      options: [
        {
          name: "set",
          description: "Sets a setting",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "log_channel",
              description: "Choose a log channel",
              type: ApplicationCommandOptionType.Channel,
              channel_types: [ChannelType.GuildText],
              channelTypes: [ChannelType.GuildText],
              required: true,
            },
          ],
        },
        {
          name: "view",
          description: "View settings",
          type: ApplicationCommandOptionType.Subcommand,
        },
      ],
    });
  }

  public async subChatInputRun(
    interaction: Subcommand.ChatInputCommandInteraction,
  ) {
    const channel = interaction.options.getChannel<ChannelType.GuildText>(
      "log_channel",
      true,
    );

    const settingsEmbed: APIEmbed = {
      title: "**Setting up**",
      description: `Selected Channel: ${channel}\n\nPlease select which notifications you would like to enable.`,
      color: COLORS.charcoalInvisible,
    };

    const settingOptions: SettingsOpt[] = [
      {
        label: "Ban Log",
        value: "sendBanLog",
        description: "Send a Ban Log (excludes mass bans)",
      },
      {
        label: "Unban Log",
        value: "sendUnbanLog",
        description: "Send an Unban Log",
      },
      {
        label: "Exit Log",
        value: "sendExitLog",
        description: "Send a log when A user leaves the server",
      },
      {
        label: "Join Log",
        value: "sendJoinLog",
        description: "Send a log when A user joins the server",
      },
      {
        label: "Kick Log",
        value: "sendKickLog",
        description: "Send a log when A user is kicked out from the server",
      },
      {
        label: "Timeout Log",
        value: "sendTimeoutLog",
        description: "Send a log when A user is timed out",
      },
      {
        label: "UnTimeout Log",
        value: "sendUnTimeoutLog",
        description: "Send a log when A user is un-timed out",
      },
      {
        label: "Un/Ban Import Log",
        value: "sendImportLog",
        description: "Send a log when a un/ban list is imported",
      },
      {
        label: "Ban Export Log",
        value: "sendBanExportLog",
        description: "Send a log when a ban list is exported",
      },
      {
        label: "Mass Ban Log",
        value: "sendMassBanLog",
        description: "Send a log when a mass ban is performed",
      },
      {
        label: "Mass Unban Log",
        value: "sendMassUnbanLog",
        description: "Send a log when a mass unban is performed",
      },
    ];

    return interaction
      .reply({
        embeds: [settingsEmbed],
        components: [
          {
            type: ComponentType.ActionRow,
            components: [
              {
                type: ComponentType.StringSelect,
                custom_id: "selected-settings",
                min_values: 1,
                max_values: settingOptions.length,
                options: settingOptions,
              },
            ],
          },
        ],
      })
      .then((msg) =>
        msg.awaitMessageComponent({
          componentType: ComponentType.StringSelect,
          filter: (i) => i.user.id === interaction.user.id,
        }),
      )
      .then(async (selectMenu) => {
        const parsedSettings = selectedSettingsValidator.parse(
          selectMenu.values,
        );

        this.container.logger.debug(parsedSettings);

        await interaction.editReply({
          embeds: [
            {
              title: "**New settings applied!**",
              color: COLORS.charcoalInvisible,
              description: `These are the new settings you have applied.\nLogging Channel: ${channel}\n\n${codeBlock(
                "m",
                JSON.stringify(parsedSettings, null, 2),
              )}`,
            },
          ],
          components: [],
        });

        return parsedSettings;
      })
      .then((settings) =>
        this.getOrCreateWebhook(channel).then((webhook) => ({
          settings,
          webhook,
        })),
      )
      .then(({ settings, webhook }) =>
        db.servers
          .get(channel.guildId)
          .then((v) => ({ settings, webhook, oldSettings: v?.data })),
      )
      .then(({ settings, webhook, oldSettings }) =>
        db.servers
          .upset(channel.guildId, {
            guildId: channel.guildId,
            webhookId: webhook.id,
            ...settings,
          })
          .then((v) => v.get())
          .then((v) => v!.data)
          .then((newSettings) =>
            emitBotEvent("botSettingsUpdate", {
              oldSettings,
              newSettings,
            }),
          ),
      )
      .then(() =>
        interaction.followUp({
          content: "Settings have been saved successfully!",
          ephemeral: true,
        }),
      )
      .catch((error: Error) => {
        this.container.logger.error(error);
        const errEmb = debugErrorEmbed({
          checks: [
            {
              question: "Can you manage guild",
              result:
                interaction.memberPermissions?.has(
                  PermissionFlagsBits.BanMembers,
                ) || false,
            },
            {
              question: "Inside server",
              result: interaction.inGuild(),
            },
          ],
          description: "There was an error while setting up settings",
          error,
          inputs: [
            {
              name: "channel",
              value: `${channel}`,
            },
          ],
          solution:
            "Please retry after some time. Or contact the developer with error file.",
          title: "**An error occurred**",
        });
        const errFile = debugErrorFile(error);
        return interaction.editReply({
          embeds: [errEmb],
          files: [errFile],
          components: [],
        });
      });
  }

  public async getOrCreateWebhook(channel: TextChannel, cleanUp = true) {
    const webhooks = await channel.guild.fetchWebhooks();
    const myWebhooks = webhooks
      .filter((w) => w.owner?.id === this.container.client.user?.id)
      .sort((a, b) => b.createdTimestamp - a.createdTimestamp);

    const selectedWebhook = myWebhooks.first();
    if (selectedWebhook) {
      if (cleanUp) {
        await Promise.all(
          myWebhooks
            .filter((w) => w.id !== selectedWebhook.id)
            .map((w) => w.delete()),
        );
      }
      return selectedWebhook.edit({
        name: "Ban Utils Logs",
        avatar: WEBHOOK_ICON,
        channel: channel.id,
        reason: "Updating a webhook for Ban Utils bot",
      });
    }
    return channel.createWebhook({
      name: "Ban Utils Logs",
      avatar: WEBHOOK_ICON,
      reason: "Creating a webhook for Ban Utils bot",
    });
  }
}

void container.stores.loadPiece({
  name: PIECE_NAME,
  piece: UserCommand,
  store: "commands",
});
