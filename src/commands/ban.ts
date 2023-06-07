import { ApplyOptions } from "@sapphire/decorators";

import { Command } from "@sapphire/framework";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from "discord.js";

@ApplyOptions<Command.Options>({
  name: "ban",
  description: "Bans a user",
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
          required: false,
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

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    return interaction.reply({ content: "Hello world!" });
  }
}
