import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { APIEmbed, ApplicationCommandOptionType, PermissionsBitField } from 'discord.js';
import { COLORS } from '../lib/Constants';

@ApplyOptions<Command.Options>({
  name: 'help',
  description: 'Provides help for commands',
  detailedDescription: {
    help: 'Provides detailed description of commands with other necessary info',
  },
})
export default class UserCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description,
      options: [
        {
          name: 'command',
          description: 'Put command name to see its detailed description',
          type: ApplicationCommandOptionType.String,
          required: true,
          autocomplete: true,
        },
      ],
    });
  }

  public override async autocompleteRun(interaction: Command.AutocompleteInteraction) {
    const cmd = interaction.options.getFocused();

    const commandsList = this.container.stores
      .get('commands')
      .map((command) => command.name)
      .filter((command) => command.toLowerCase().includes(cmd.toLowerCase()));

    return interaction.respond(
      commandsList.map((cmdName) => ({
        name: cmdName,
        value: cmdName,
      })),
    );
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const cmdName = interaction.options.getString('command', true);

    const command = this.container.stores.get('commands').get(cmdName);

    if (!command) return interaction.reply({ content: 'Command not found', ephemeral: true });

    const embed: APIEmbed = {
      title: command.name,
      description: command.description,
      color: COLORS.charcoalInvisible,
      fields: [
        {
          name: 'Detailed description',
          value: command.detailedDescription?.help ?? 'None',
        },
        {
          name: 'Permissions required by bot',
          value:
            new PermissionsBitField(command.options.requiredClientPermissions)
              .toArray()
              .join(', ') ?? 'None',
        },
        {
          name: 'Required user permissions',
          value:
            new PermissionsBitField(command.options.requiredUserPermissions).toArray().join(', ')
            ?? 'None',
        },
      ],
    };

    return interaction.reply({ embeds: [embed] });
  }
}
