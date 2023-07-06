import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { ApplicationCommandOptionType, time, type APIEmbed } from 'discord.js';
import { COLORS } from '../lib/Constants';

@ApplyOptions<Command.Options>({
  name: 'user-info',
  description: 'A basic slash command',
})
export default class UserCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description,
      options: [
        {
          name: 'user',
          description: 'Put user ID or Select a user to see their info',
          type: ApplicationCommandOptionType.User,
          required: true,
        },
      ],
    });
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const user = interaction.options.getUser('user', true);
    const embed: APIEmbed = {
      title: '**User info**',
      color: COLORS.whiteGray,
      thumbnail: {
        url: user.displayAvatarURL(),
      },
      fields: [
        {
          name: 'User ID',
          value: user.id,
        },
        {
          name: 'Account created on',
          value: `${time(user.createdAt)} (${time(user.createdAt, 'R')})`,
        },
      ],
      timestamp: new Date().toISOString(),
    };
    if (interaction.channel?.isDMBased()) {
      embed.fields?.push({
        name: '**Can this user invite the bot?**',
        value: `${!user.bot}`,
      });
    }
    const member = await interaction.guild?.members.fetch(user);

    if (member) {
      const botModStats = `Can Ban: ${member.bannable}\nCan Kick: ${member.kickable}\nCan Moderate (timeout, etc.): ${member.moderatable}\nIs above: ${member.manageable}`;
    }
  }
}
