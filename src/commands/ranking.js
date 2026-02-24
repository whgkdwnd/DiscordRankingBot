import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

/**
 * 랭킹 명령 예시.
 * 나중에 게임/음악/경제 등 실제 랭킹 소스를 연동할 수 있도록 구조만 잡아둠.
 */
export default {
  data: new SlashCommandBuilder()
    .setName('랭킹')
    .setDescription('등록된 랭킹 종류를 보여주거나, 특정 랭킹을 조회합니다.')
    .addStringOption((opt) =>
      opt
        .setName('종류')
        .setDescription('조회할 랭킹 종류')
        .setRequired(false)
        .addChoices(
          { name: '목록 보기', value: 'list' }
          // 여기에 나중에 랭킹 종류 추가: 예) 게임, 음악, 경제 ...
        )
    ),
  async execute(interaction) {
    const kind = interaction.options.getString('종류') ?? 'list';

    if (kind === 'list') {
      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle('📊 랭킹 봇')
        .setDescription('현재 사용 가능한 랭킹이 없습니다. 곧 다양한 랭킹을 추가할 예정입니다.')
        .addFields({
          name: '예정 기능',
          value: '• 게임/음악/경제 등 외부 API 연동\n• 서버 내 활동 랭킹\n• 커스텀 랭킹 등',
        })
        .setFooter({ text: '/랭킹 종류:[목록] 에서 선택해 주세요.' });

      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    // 나중에 kind 값에 따라 실제 랭킹 데이터 조회
    await interaction.reply({ content: `"${kind}" 랭킹은 아직 준비 중입니다.`, ephemeral: true });
  },
};
