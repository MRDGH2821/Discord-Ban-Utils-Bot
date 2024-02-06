import { ApplyOptions } from '@sapphire/decorators';
import { Subcommand } from '@sapphire/plugin-subcommands';
import { ApplicationCommandOptionType, userMention } from 'discord.js';
import { SERVER_ONLY } from '../lib/Constants';
import db from '../lib/Database';

@ApplyOptions<Subcommand.Options>({
  name: 'exclusion-list',
  description: 'Exclude certain user IDs from being exported or imported',
  requiredUserPermissions: [['BanMembers', 'ManageGuild']],
  preconditions: ['GuildOnly'],
  detailedDescription: {
    help: 'Exclude certain user IDs from being exported or imported.\nImport Exclusion list will exclude the user IDs from being imported via ban import & mass ban. Useful when some users are good inside but not outside.\nExport Exclusion list will exclude the user IDs from being exported via ban export & mass ban. Useful when some users were banned due to server reasons but are good otherwise.',
  },
  subcommands: [
    {
      name: 'view',
      type: 'method',
      async chatInputRun(interaction) {
        if (!interaction.inGuild() || !interaction.guild) {
          return interaction.reply({
            content: SERVER_ONLY,
            ephemeral: true,
          });
        }
        await interaction.deferReply({ ephemeral: true });
        const { guildId } = interaction;
        const dbList = await db.exclusionList.get(guildId);
        if (!dbList) return interaction.editReply('No user IDs are excluded from export or import');

        const { exportExclusion, importExclusion } = dbList.data;
        const exportExclusionList = exportExclusion.map((userId) => userMention(userId)).join(', ');
        const importExclusionList = importExclusion.map((userId) => userMention(userId)).join(', ');

        return interaction.editReply({
          embeds: [
            {
              title: 'Exclusion List',
              description: `**Export Exclusion List:**\n${exportExclusionList || 'None'}\n\n**Import Exclusion List:**\n${importExclusionList || 'None'}`,
            },
          ],
        });
      },
    },
  ],
})
export default class UserCommand extends Subcommand {
  registerApplicationCommands(registry: Subcommand.Registry) {
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description,
      options: [
        {
          name: 'view',
          description: 'View exclusion list',
          type: ApplicationCommandOptionType.Subcommand,
        },
      ],
    });
  }
  // ToDo: add `exclusion-list add` and `exclusion-list remove` subcommands

  public async subChatInputRun(interaction: Subcommand.ChatInputCommandInteraction) {
    this.container.logger.info('subChatInputRun');
    interaction.deferReply();
  }
}
