import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('봇 지연 시간(ms)을 알려줍니다.'),
  async execute(interaction) {
    const sent = await interaction.reply({ content: '측정 중...', fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    await interaction.editReply(`🏓 Pong! 지연: **${latency}ms**`);
  },
};
