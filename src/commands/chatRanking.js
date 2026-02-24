import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getRanking } from '../data/chatCountStore.js';

export default {
  data: new SlashCommandBuilder()
    .setName('채팅랭킹')
    .setDescription('기간 동안 가장 많은 채팅을 한 사람 순위를 보여줍니다.')
    .addIntegerOption((opt) =>
      opt
        .setName('기간')
        .setDescription('집계할 기간(일). 기본값: 30일')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(365)
    )
    .addIntegerOption((opt) =>
      opt
        .setName('상위')
        .setDescription('표시할 상위 인원 수 (기본 10명)')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(30)
    )
    .addBooleanOption((opt) =>
      opt
        .setName('공개')
        .setDescription('true면 모두에게 보이게, false면 나만 보기 (기본: 나만 보기)')
        .setRequired(false)
    ),
  async execute(interaction) {
    const days = interaction.options.getInteger('기간') ?? 30;
    const topN = interaction.options.getInteger('상위') ?? 10;
    const isPublic = interaction.options.getBoolean('공개') ?? false;

    await interaction.deferReply({ ephemeral: !isPublic });

    const guildId = interaction.guildId;
    const ranking = getRanking(guildId, days);

    if (ranking.length === 0) {
      await interaction.editReply({
        content: `지난 **${days}일** 동안 집계된 채팅이 없습니다.\n(봇이 켜져 있는 동안의 메시지만 집계됩니다.)`,
      });
      return;
    }

    const top = ranking.slice(0, topN);
    const medal = ['🥇', '🥈', '🥉'];
    const lines = top.map((r, i) => {
      const icon = medal[i] || `\`${i + 1}.\``;
      return `${icon} <@${r.userId}> — **${r.count.toLocaleString()}**회`;
    });

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`💬 채팅 랭킹 (최근 ${days}일)`)
      .setDescription(lines.join('\n'))
      .setFooter({
        text: `봇이 수집한 메시지만 집계됩니다. • /채팅랭킹 기간:[일] 상위:[명] 공개:[true/false]`,
      })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
