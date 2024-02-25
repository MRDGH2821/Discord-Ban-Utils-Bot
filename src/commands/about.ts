import { ApplyOptions } from '@sapphire/decorators';
import { Command, container } from '@sapphire/framework';
import { DurationFormatter } from '@sapphire/time-utilities';
import { COLORS } from '../lib/Constants';
import { invitation, supportRow } from '../lib/DynamicConstants';
import { formatCmdName } from '../lib/utils';

const PIECE_NAME = 'about';
@ApplyOptions<Command.Options>({
  name: PIECE_NAME,
  description: 'About the bot',
  detailedDescription: {
    help: 'Provides information about the bot.',
  },
})
export default class UserCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description,
    });
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const helpCmd = (await interaction.client.application.commands.fetch()).find(
      (cmd) => cmd.name === 'help',
    );
    return interaction.reply({
      embeds: [
        {
          title: 'About the bot',
          description: `${interaction.client.user.username} was made with one objective:\nTo make it easy to transfer bans from one server to another.\n\nTo get started, invite me to your server and use the ${formatCmdName(helpCmd?.name || 'help', helpCmd!.id)} command to see the list of commands.`,
          fields: [
            {
              name: 'Ping (Websocket)',
              value: `${interaction.client.ws.ping}ms`,
              inline: true,
            },
            {
              name: 'Uptime',
              value: new DurationFormatter().format(interaction.client.uptime),
              inline: true,
            },
            {
              name: 'Servers',
              value: `Server Count: ${interaction.client.guilds.cache.size}\nShards: ${interaction.client.shard?.count}`,
            },
            {
              name: 'Help the Developer!',
              value: 'If you like the bot, consider donating to help keep the bot running!',
            },
          ],
          color: COLORS.lightGray,
        },
      ],
      components: [(await invitation(this.container.client)).inviteRow, supportRow],
    });
  }
}

void container.stores.loadPiece({
  name: PIECE_NAME,
  piece: UserCommand,
  store: 'commands',
});
