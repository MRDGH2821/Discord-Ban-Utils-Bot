import { ApplyOptions } from '@sapphire/decorators';
import { Command, container } from '@sapphire/framework';
import { ApplicationCommandOptionType, MessageFlags, PermissionFlagsBits } from 'discord.js';

@ApplyOptions<Command.Options>({
  name: 'test',
  description: 'An experimental slash command',
  preconditions: ['GuildOnly'],
  requiredUserPermissions: PermissionFlagsBits.Administrator,
})
export default class UserCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      {
        name: this.name,
        description: this.description,
        options: [
          {
            name: 'db-test',
            description: 'A db test',
            required: true,
            type: ApplicationCommandOptionType.String,
          },
        ],
      },
      {
        guildIds: ['897498649410560032', '897849061980373022'],
      },
    );
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    if (!interaction.inGuild() || !interaction.inCachedGuild()) {
      return interaction.reply({
        content: 'Please use this command inside server',
        flags: MessageFlags.Ephemeral,
      });
    }

    const { options } = interaction;
    const dbTest = options.getString('db-test', true);

    this.container.logger.debug(dbTest);

    return interaction.reply({
      content: `dbTest: ${dbTest}`,
    });
  }
}

container.stores.loadPiece({
  name: UserCommand.name,
  piece: UserCommand,
  store: 'commands',
});
