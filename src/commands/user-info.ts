import { ApplyOptions } from "@sapphire/decorators";
import { Command, container } from "@sapphire/framework";
import {
  ActionRowBuilder,
  type APIEmbed,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ComponentType,
  OAuth2Scopes,
  PermissionFlagsBits,
  time,
} from "discord.js";
import { COLORS, EMPTY_STRING } from "../lib/Constants.js";
import { jumpLink } from "../lib/utils.js";

const PIECE_NAME = "user-info";
@ApplyOptions<Command.Options>({
  name: PIECE_NAME,
  description: "Info about user",
  detailedDescription: {
    help: "Tells information about a user",
  },
})
export default class UserCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description,
      options: [
        {
          name: "user",
          description: "Put user ID or Select a user to see their info",
          type: ApplicationCommandOptionType.User,
          required: true,
        },
      ],
    });
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction,
  ) {
    const user = interaction.options.getUser("user", true);
    const embed: APIEmbed = {
      title: "**User info**",
      color: COLORS.lightGray,
      thumbnail: {
        url: user.displayAvatarURL(),
      },
      author: {
        name: user.username,
        icon_url: user.displayAvatarURL(),
        url: jumpLink(user),
      },
      url: jumpLink(user),
      fields: [
        {
          name: "Username",
          value: user.bot ? user.tag : user.username,
          inline: true,
        },
        {
          name: "User ID",
          value: user.id,
          inline: true,
        },
        {
          name: "Account created on",
          value: `${time(user.createdAt)} (${time(user.createdAt, "R")})`,
          inline: true,
        },
      ],
      timestamp: new Date().toISOString(),
    };

    const inviteButton = new ButtonBuilder({
      type: ComponentType.Button,
      label: "Invite the bot in your Server!",
      style: 5,
      url: this.container.client.generateInvite({
        scopes: [
          OAuth2Scopes.Bot,
          OAuth2Scopes.ApplicationsCommands,
          OAuth2Scopes.Guilds,
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
          PermissionFlagsBits.ViewAuditLog,
          PermissionFlagsBits.ViewChannel,
        ],
      }),
    });

    const inviteButtonRow = new ActionRowBuilder<ButtonBuilder>({
      type: ComponentType.ActionRow,
      components: [inviteButton],
    });

    if (!interaction.inGuild() || !interaction.guild) {
      const iRes = await interaction.reply({ embeds: [embed] });
      if (!user.bot) {
        return iRes.edit({
          components: [inviteButtonRow],
        });
      }

      return iRes;
    }

    const member = await interaction.guild.members.fetch(user);
    const mod = await interaction.guild.members.fetch(
      interaction.member.user.id,
    );

    embed.fields?.push({
      name: "**Display name**",
      value: member.displayName,
      inline: true,
    });

    const { joinedAt, communicationDisabledUntil } = member;
    if (joinedAt) {
      embed.fields?.push({
        name: "**Joined on**",
        value: `${time(joinedAt)} (${time(joinedAt, "R")})`,
        inline: true,
      });
    }

    const isActuallyMod = mod.permissions.has(
      PermissionFlagsBits.ModerateMembers,
    );

    if (isActuallyMod) {
      embed.fields?.push({
        name: EMPTY_STRING,
        value: EMPTY_STRING,
      });

      const botModStats = `Can Ban: \`${member.bannable}\`\nCan Kick: \`${member.kickable}\`\nCan Moderate (timeout, etc.): \`${member.moderatable}\`\nIs above ${member}: \`${member.manageable}\``;

      embed.fields?.push({
        name: `**Powers of ${this.container.client.user?.tag}**`,
        value: botModStats,
        inline: true,
      });

      const userModStats = `Can Ban: \`${mod.permissions.has(
        PermissionFlagsBits.BanMembers,
      )}\`\nCan Kick: \`${mod.permissions.has(
        PermissionFlagsBits.KickMembers,
      )}\`\nCan Moderate (timeout, etc.): \`${mod.permissions.has(
        PermissionFlagsBits.ModerateMembers,
      )}\`\nIs above ${member}: \`${
        mod.roles.highest.comparePositionTo(member.roles.highest) > 0
      }\``;

      embed.fields?.push({
        name: "**Your Powers**",
        value: userModStats,
        inline: true,
      });

      embed.fields?.push({
        name: "**Top 5 Roles**",
        value: member.roles.cache
          .sort((a, b) => b.position - a.position)
          .filter((role) => !role.managed)
          .map((role) => role.toString())
          .filter((roleMention) => roleMention !== "@everyone")
          .splice(0, 5)
          .join(" "),
      });

      if (communicationDisabledUntil) {
        embed.fields?.push({
          name: "**In Timeout until**",
          value: `${time(communicationDisabledUntil)} (${time(communicationDisabledUntil, "R")})`,
          inline: true,
        });
      }
    }

    const component = new ActionRowBuilder<ButtonBuilder>();
    if (isActuallyMod) {
      component.addComponents(inviteButton);
    }

    return interaction.reply({
      embeds: [embed],
      components: [inviteButtonRow],
    });
  }
}

void container.stores.loadPiece({
  name: PIECE_NAME,
  piece: UserCommand,
  store: "commands",
});
