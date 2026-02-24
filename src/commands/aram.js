import { SlashCommandBuilder } from 'discord.js';
import { createQueuePayload, registerQueue } from '../features/lolQueue.js';

const GAME_NAME = '증바람';

export default {
  data: new SlashCommandBuilder()
    .setName('증바람')
    .setDescription('롤 증바람 모집을 시작합니다.')
    .addIntegerOption((opt) =>
      opt
        .setName('players')
        .setDescription('모집 인원 2~10명. 비우면 5명')
        .setRequired(false)
        .setMinValue(2)
        .setMaxValue(10)
    ),
  async execute(interaction) {
    const limitRaw = interaction.options.getInteger('players');
    const limit = typeof limitRaw === 'number' && limitRaw >= 2 && limitRaw <= 10 ? limitRaw : 5;

    const payload = createQueuePayload(interaction.user.tag, limit, GAME_NAME);
    const sent = await interaction.reply({ ...payload, fetchReply: true });
    registerQueue(sent.id, interaction.user.id, interaction.user.tag, limit, GAME_NAME);
  },
};
