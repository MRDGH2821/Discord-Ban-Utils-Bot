import { ApplyOptions } from '@sapphire/decorators';
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
import { COLORS, WEBHOOK_ICON } from '../lib/Constants';
import Database from '../lib/Database';
import type { SettingsParameter } from '../lib/typeDefs';
import { selectedSettingsValidator } from '../lib/utils';

interface SettingsOpt extends APISelectMenuOption {
  value: SettingsParameter;
}
@ApplyOptions<Subcommand.Options>({
  name: 'settings',
  description: 'A basic command',
  subcommands: [
    {
      name: 'set',
      type: 'method',
      chatInputRun: 'subChatInputRun',
    },
  ],
  requiredUserPermissions: PermissionFlagsBits.ManageGuild,
})
export default class UserCommand extends Subcommand {
  registerApplicationCommands(registry: Subcommand.Registry) {
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
      ],
    });
  }

  // eslint-disable-next-line class-methods-use-this
  public async subChatInputRun(interaction: Subcommand.ChatInputCommandInteraction) {
    const channel = interaction.options.getChannel<ChannelType.GuildText>('log_channel', true);

    const settingsEmbed: APIEmbed = {
      title: '**Setting up**',
      description: `Selected Channel: ${channel}\n\nPlease select which notifications you would like to enable.`,
      color: COLORS.invisible,
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
        label: 'Ban Import Log',
        value: 'sendBanImportLog',
        description: 'Send a log when a ban list is imported',
      },
      {
        label: 'Ban Export Log',
        value: 'sendBanExportLog',
        description: 'Send a log when a ban list is exported',
      },
      {
        label: 'Ban Copy Log',
        value: 'sendBanCopyLog',
        description: 'Send a log when bans are copied from another server',
      },
      {
        label: 'Mass Ban Log',
        value: 'sendMassBanLog',
        description: 'Send a log when a mass ban is performed',
      },
      {
        label: 'Mass Unban Log',
        value: 'sendMassUnbanLog',
        description: 'Send a log when a mass unban is performed',
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
        }))
      .then(async (selectMenu) => {
        const parsedSettings = selectedSettingsValidator.parse(selectMenu.values);

        this.container.logger.debug(parsedSettings);

        await interaction.editReply({
          embeds: [
            {
              title: '**New settings applied!**',
              color: COLORS.invisible,
              description: `These are the new settings you have applied.\nLogging Channel: ${channel}\n\n${codeBlock(
                'json',
                JSON.stringify(parsedSettings, null, 2),
              )}`,
            },
          ],
          components: [],
        });

        return parsedSettings;
      })
      .then(async (settings) => {
        const webhook = await this.getWebhook(channel);
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
        }));
  }

  public async getWebhook(channel: TextChannel, cleanUp = true) {
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