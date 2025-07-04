import { ApplyOptions } from "@sapphire/decorators";
import { Command, container } from "@sapphire/framework";
import {
  ApplicationCommandType,
  ApplicationIntegrationType,
  InteractionContextType,
  Message,
} from "discord.js";

const PIECE_NAME = "ping";
@ApplyOptions<Command.Options>({
  name: PIECE_NAME,
  description: "ping pong",
  detailedDescription: {
    help: "Check how fast the bot can respond to you.\nLower the number, the faster is the response.\n(Measures bot's network latency, not bot's ability to do things fast.",
  },
})
export default class UserCommand extends Command {
  // Register Chat Input and Context Menu command
  public override registerApplicationCommands(registry: Command.Registry) {
    // Create shared integration types and contexts
    // These allow the command to be used in guilds and DMs
    const integrationTypes: ApplicationIntegrationType[] = [
      ApplicationIntegrationType.GuildInstall,
      ApplicationIntegrationType.UserInstall,
    ];
    const contexts: InteractionContextType[] = [
      InteractionContextType.BotDM,
      InteractionContextType.Guild,
      InteractionContextType.PrivateChannel,
    ];

    // Register slash command
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description,
      integrationTypes,
      contexts,
    });

    // Register context menu command available from any message
    registry.registerContextMenuCommand({
      name: this.name,
      type: ApplicationCommandType.Message,
      integrationTypes,
      contexts,
    });

    // Register context menu command available from any user
    registry.registerContextMenuCommand({
      name: this.name,
      type: ApplicationCommandType.User,
      integrationTypes,
      contexts,
    });
  }

  // Message command
  public override async messageRun(message: Message) {
    return this.sendPing(message);
  }

  // Chat Input (slash) command
  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction,
  ) {
    return this.sendPing(interaction);
  }

  // Context Menu command
  public override async contextMenuRun(
    interaction: Command.ContextMenuCommandInteraction,
  ) {
    return this.sendPing(interaction);
  }

  private async sendPing(
    interactionOrMessage:
      | Command.ChatInputCommandInteraction
      | Command.ContextMenuCommandInteraction
      | Message,
  ) {
    const pingMessage = await interactionOrMessage
      .reply({
        content: "Ping?",
        withResponse: true,
      })
      .then((msg) => {
        if (msg instanceof Message) {
          return msg;
        }

        return msg.interaction;
      });

    const content = `Pong! Bot Latency ${Math.round(
      this.container.client.ws.ping,
    )}ms. API Latency ${pingMessage.createdTimestamp - interactionOrMessage.createdTimestamp}ms.`;

    if (interactionOrMessage instanceof Message) {
      return interactionOrMessage.edit({ content });
    }

    return interactionOrMessage.editReply({
      content,
    });
  }
}

void container.stores.loadPiece({
  name: PIECE_NAME,
  piece: UserCommand,
  store: "commands",
});
