import { SlashCommandBuilder } from 'discord.js';
import { createQueuePayload, registerQueue } from '../features/lolQueue.js';

const GAME_NAME = '배그';

export default {
  data: new SlashCommandBuilder()
    .setName('치킨')
    .setDescription('배그 모집을 시작합니다. (명령을 친 사람이 자동 참가)')
    .addIntegerOption((opt) =>
      opt
        .setName('players')
        .setDescription('모집 인원 2~4명. 비우면 5명')
        .setRequired(false)
        .setMinValue(2)
        .setMaxValue(4)
    ),
  async execute(interaction) {
    try {
      const limitRaw = interaction.options.getInteger('players');
      const limit = typeof limitRaw === 'number' && limitRaw >= 2 && limitRaw <= 4 ? limitRaw : 4;
      const starterId = interaction.user.id;

      const payload = createQueuePayload(interaction.user.tag, limit, GAME_NAME, starterId);
      const replyOptions = {
        embeds: payload.embeds,
        components: payload.components,
        fetchReply: true,
      };
      if (payload.content) replyOptions.content = payload.content;

      const sent = await interaction.reply(replyOptions);
      registerQueue(sent.id, interaction.user.id, interaction.user.tag, limit, GAME_NAME, [starterId]);
    } catch (err) {
      console.error('/치킨 실행 오류:', err);
      const msg = { content: `오류: ${err.message}`, ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(msg).catch(() => {});
      } else {
        await interaction.reply(msg).catch(() => {});
      }
    }
  },
};
