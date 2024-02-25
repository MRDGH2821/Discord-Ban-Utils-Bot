import type { SapphireClient } from '@sapphire/framework';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  OAuth2Scopes,
  PermissionFlagsBits,
} from 'discord.js';

export const BOT_SUPPORT_SERVER_INVITE_LINK = 'https://discord.gg/HeFAqYgGr8';
export function invitation(client: SapphireClient) {
  const botInviteLink = client.generateInvite({
    scopes: [
      OAuth2Scopes.Bot,
      OAuth2Scopes.ApplicationsCommands,
      OAuth2Scopes.Guilds,
      OAuth2Scopes.ApplicationsCommands,
      OAuth2Scopes.ApplicationsCommandsUpdate,
      OAuth2Scopes.GuildsMembersRead,
    ],
    permissions: [
      PermissionFlagsBits.AttachFiles,
      PermissionFlagsBits.BanMembers,
      PermissionFlagsBits.EmbedLinks,
      PermissionFlagsBits.KickMembers,
      PermissionFlagsBits.ManageWebhooks,
      PermissionFlagsBits.ModerateMembers,
      PermissionFlagsBits.SendMessages,
      PermissionFlagsBits.SendMessagesInThreads,
      PermissionFlagsBits.UseExternalEmojis,
      PermissionFlagsBits.UseExternalStickers,
      PermissionFlagsBits.ViewAuditLog,
      PermissionFlagsBits.ViewChannel,
    ],
  });

  const inviteRow = new ActionRowBuilder<ButtonBuilder>().addComponents([
    new ButtonBuilder().setURL(botInviteLink).setLabel('Invite me').setStyle(ButtonStyle.Link),
    new ButtonBuilder()
      .setURL(BOT_SUPPORT_SERVER_INVITE_LINK)
      .setLabel('Support server')
      .setStyle(ButtonStyle.Link),
  ]);

  return {
    botInviteLink,
    inviteRow,
  };
}
