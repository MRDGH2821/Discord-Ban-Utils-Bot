import { ApplyOptions } from "@sapphire/decorators";
import { isGuildMember } from "@sapphire/discord.js-utilities";
import { Command } from "@sapphire/framework";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  MessageFlags,
  bold,
} from "discord.js";

@ApplyOptions<Command.Options>({
  name: "ban",
  description: "Bans a user",
  requiredClientPermissions: "BanMembers",
  requiredUserPermissions: "BanMembers",
  preconditions: ["GuildOnly"],
})
export default class UserCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description,
      defaultMemberPermissions: "BanMembers",
      default_member_permissions: "BanMembers",
      dmPermission: false,
      dm_permission: false,
      type: ApplicationCommandType.ChatInput,
      options: [
        {
          name: "user",
          description: "The user to ban",
          type: ApplicationCommandOptionType.User,
          required: true,
        },
        {
          name: "reason",
          description: "The reason for the ban",
          type: ApplicationCommandOptionType.String,
          required: true,
          autocomplete: true,
        },
        {
          name: "delete-messages",
          description: "The number of days to delete messages for",
          type: ApplicationCommandOptionType.Integer,
          required: false,
          maxValue: 7,
          max_value: 7,
        },
      ],
    });
  }

  public override async autocompleteRun(
    interaction: Command.AutocompleteInteraction
  ) {
    const val = interaction.options.getFocused();

    const possibleReasons = [
      "Spamming in chat",
      "Raiding the server",
      "Posted NSFW",
      "Harassing other users",
      "Advertising without permission",
      "Malicious Bot",
      `Banned by ${interaction.user.tag} on ${new Date().toDateString()}`,
    ].filter((reason) => reason.toLowerCase().includes(val.toLowerCase()));
    
    return interaction.respond(
      possibleReasons.map((reason) => ({
        name: reason,
        value: reason,
      }))
    );
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    const convict = interaction.options.getMember("user");
    const reason = interaction.options.getString("reason", true);
    const deleteMsgDays =
      interaction.options.getInteger("delete-messages") || 7;

    if (!interaction.inGuild() || !interaction.guild) {
      return interaction.reply({
        content: "This command can only be used in a guild.",
        flags: MessageFlags.Ephemeral,
      });
    }

    if (!isGuildMember(convict)) {
      return interaction.reply({
        content: "The user you provided is not a member of this guild.",
        flags: MessageFlags.Ephemeral,
      });
    }

    if (!convict.bannable) {
      return interaction.reply({
        content: "I cannot ban this user.",
        flags: MessageFlags.Ephemeral,
      });
    }

    convict.ban({ deleteMessageSeconds: deleteMsgDays, reason });
    return interaction.reply({
      embeds: [
        {
          title: bold("Ban Hammer Dropped!"),
          description: `\`${convict.user.tag}\` ${convict} is banned from this server.`,
          thumbnail: {
            url: convict.user.displayAvatarURL(),
          },
          fields: [
            {
              name: bold("Reason"),
              value: reason,
            },
            {
              name: bold("Convict ID"),
              value: convict.id,
            },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    });
  }
}
