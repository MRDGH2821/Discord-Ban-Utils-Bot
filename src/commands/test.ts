import { ApplyOptions } from "@sapphire/decorators";
import type { Command } from "@sapphire/framework";
import { container } from "@sapphire/framework";
import { Subcommand } from "@sapphire/plugin-subcommands";
import {
  ApplicationCommandOptionType,
  MessageFlags,
  PermissionFlagsBits,
} from "discord.js";

const PIECE_NAME = "test";
@ApplyOptions<Subcommand.Options>({
  name: PIECE_NAME,
  description: "An experimental slash command",
  preconditions: ["GuildOnly"],
  requiredUserPermissions: PermissionFlagsBits.Administrator,
})
export default class UserCommand extends Subcommand {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      {
        name: this.name,
        description: this.description,
        options: [
          {
            name: "string-input",
            description: "A string test",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
              {
                name: "text",
                description: "A string test",
                type: ApplicationCommandOptionType.String,
                required: true,
              },
            ],
          },
        ],
      },
      {
        guildIds: ["897498649410560032", "897849061980373022"],
      },
    );
  }

  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    if (!interaction.inGuild() || !interaction.inCachedGuild()) {
      await interaction.reply({
        content: "Please use this command inside server",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const { options } = interaction;
    const dbTest = options.getString("text", true);

    container.logger.debug(dbTest);
    await interaction.reply({ content: dbTest });
    throw new Error("Test error");
  }
}

void container.stores.loadPiece({
  name: PIECE_NAME,
  piece: UserCommand,
  store: "commands",
});
