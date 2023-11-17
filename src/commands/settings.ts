import { ApplyOptions } from '@sapphire/decorators';
import { container } from '@sapphire/framework';
import { Subcommand } from '@sapphire/plugin-subcommands';
import { codeBlock } from '@sapphire/utilities';
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ChannelType,
  ComponentType,
  PermissionFlagsBits,
  TextChannel,
  type APIEmbed,
  type APISelectMenuOption,
} from 'discord.js';
import { COLORS, SERVER_ONLY, WEBHOOK_ICON } from '../lib/Constants';
import Database from '../lib/Database';
import { SettingsDescription } from '../lib/SettingsData';
import type { SettingsParameter } from '../lib/typeDefs';
import { getWebhook, selectedSettingsValidator } from '../lib/utils';

interface SettingsOpt extends APISelectMenuOption {
  value: SettingsParameter;
}
@ApplyOptions<Subcommand.Options>({
  name: 'settings',
  description: 'Configure bot settings',
  subcommands: [
    {
      name: 'set',
      type: 'method',
      chatInputRun: 'subChatInputRun',
    },
    {
      name: 'view',
      type: 'method',
      async chatInputRun(interaction) {
        if (!interaction.inGuild() || !interaction.guild) {
          return interaction.reply({
            content: SERVER_ONLY,
            ephemeral: true,
          });
        }

        const force = interaction.options.getBoolean('force') || false;

        const settings = await Database.getSettings(interaction.guildId, force);
        if (!settings) {
          const text = force
            ? 'Even refreshing settings cache forcefully'
            : '(If this is a mistake, then please use force option)';
          return interaction.reply({
            content: `No settings configured.\n${text}`,
            ephemeral: true,
          });
        }
        const webhook = await getWebhook(interaction.guildId, settings.webhookId);

        return interaction.reply({
          embeds: [
            {
              title: 'Settings',
              description: `${codeBlock('m', `${settings}`)}\nChannel: ${webhook?.channel}`,
              color: COLORS.lightGray,
            },
          ],
        });
      },
    },
  ],
  preconditions: ['GuildOnly'],
  requiredUserPermissions: PermissionFlagsBits.ManageGuild,
  detailedDescription: {
    help: `Configure bot settings.\nAvailable settings:\n${codeBlock(
      'json',
      JSON.stringify(SettingsDescription, null, 2),
    )}`,
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
          name: 'set',
          description: 'Sets a setting',
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: 'log_channel',
              description: 'Choose a log channel',
              type: ApplicationCommandOptionType.Channel,
              channel_types: [ChannelType.GuildText],
              channelTypes: [ChannelType.GuildText],
              required: true,
            },
          ],
        },
        {
          name: 'view',
          description: 'View settings',
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: 'force',
              description: 'Force refresh settings, if you believe you have set settings',
              type: ApplicationCommandOptionType.Boolean,
            },
          ],
        },
      ],
    });
  }

  // eslint-disable-next-line class-methods-use-this
  public async subChatInputRun(interaction: Subcommand.ChatInputCommandInteraction) {
    const channel = interaction.options.getChannel<ChannelType.GuildText>('log_channel', true);

    const settingsEmbed: APIEmbed = {
      title: '**Setting up**',
      description: `Selected Channel: ${channel}\n\nPlease select which notifications you would like to enable.`,
      color: COLORS.charcoalInvisible,
    };

    const settingOptions: SettingsOpt[] = [
      {
        label: 'Ban Log',
        value: 'sendBanLog',
        description: 'Send a Ban Log (excludes mass bans)',
      },
      {
        label: 'Unban Log',
        value: 'sendUnbanLog',
        description: 'Send an Unban Log',
      },
      {
        label: 'Exit Log',
        value: 'sendExitLog',
        description: 'Send a log when A user leaves the server',
      },
      {
        label: 'Join Log',
        value: 'sendJoinLog',
        description: 'Send a log when A user joins the server',
      },
      {
        label: 'Kick Log',
        value: 'sendKickLog',
        description: 'Send a log when A user is kicked out from the server',
      },
      {
        label: 'Timeout Log',
        value: 'sendTimeoutLog',
        description: 'Send a log when A user is timed out',
      },
      {
        label: 'UnTimeout Log',
        value: 'sendUnTimeoutLog',
        description: 'Send a log when A user is un-timed out',
      },
      {
        label: 'Un/Ban Import Log',
        value: 'sendImportLog',
        description: 'Send a log when a un/ban list is imported',
      },
      {
        label: 'Ban Export Log',
        value: 'sendBanExportLog',
        description: 'Send a log when a ban list is exported',
      },
      {
        label: 'Ban Copy Log',
        value: 'sendBanCopyLog',
        description: 'Send a log when bans are copied from another server (Incoming bans)',
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
                custom_id: 'selected-settings',
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
          dispose: true,
        }),
      )
      .then(async (selectMenu) => {
        const parsedSettings = selectedSettingsValidator.parse(selectMenu.values);

        this.container.logger.debug(parsedSettings);

        await interaction.editReply({
          embeds: [
            {
              title: '**New settings applied!**',
              color: COLORS.charcoalInvisible,
              description: `These are the new settings you have applied.\nLogging Channel: ${channel}\n\n${codeBlock(
                'm',
                `${parsedSettings}`,
              )}`,
            },
          ],
          components: [],
        });

        return parsedSettings;
      })
      .then(async (settings) => {
        const webhook = await this.getOrCreateWebhook(channel);
        const data = await Database.newServerSetting({
          guildId: channel.guildId,
          webhookId: webhook.id,
        });
        return data.modifySettings(settings);
      })
      .then(() =>
        interaction.followUp({
          content: 'Settings have been saved successfully!',
          ephemeral: true,
        }),
      );
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
          myWebhooks.filter((w) => w.id !== selectedWebhook.id).map((w) => w.delete()),
        );
      }
      return selectedWebhook.edit({
        name: 'Ban Utils Logs',
        avatar: WEBHOOK_ICON,
        channel: channel.id,
        reason: 'Updating a webhook for Ban Utils bot',
      });
    }
    return channel.createWebhook({
      name: 'Ban Utils Logs',
      avatar: WEBHOOK_ICON,
      reason: 'Creating a webhook for Ban Utils bot',
    });
  }
}

void container.stores.loadPiece({
  name: UserCommand.name,
  piece: UserCommand,
  store: 'commands',
});
