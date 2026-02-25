import { SlashCommandBuilder } from 'discord.js';
import { createQueuePayload, registerQueue } from '../features/lolQueue.js';

export default {
  data: new SlashCommandBuilder()
    .setName('멤버모으기')
    .setDescription('주제와 인원을 정해 모집합니다. (명령을 친 사람이 자동 참가)')
    .addStringOption((opt) =>
      opt
        .setName('topic')
        .setDescription('주제 (예: 치킨시켜먹기, 영화보기)')
        .setRequired(true)
    )
    .addIntegerOption((opt) =>
      opt
        .setName('players')
        .setDescription('모집 인원 2~10명. 비우면 5명')
        .setRequired(false)
        .setMinValue(2)
        .setMaxValue(10)
    ),
  async execute(interaction) {
    const topicRaw = interaction.options.getString('topic');
    const gameName = (topicRaw && topicRaw.trim()) || '모집';
    const limitRaw = interaction.options.getInteger('players');
    const limit = typeof limitRaw === 'number' && limitRaw >= 2 && limitRaw <= 10 ? limitRaw : 5;
    const starterId = interaction.user.id;

    const payload = createQueuePayload(interaction.user.tag, limit, gameName, starterId);
    const replyOptions = {
      embeds: payload.embeds,
      components: payload.components,
      fetchReply: true,
    };
    if (payload.content) replyOptions.content = payload.content;

    const sent = await interaction.reply(replyOptions);
    registerQueue(sent.id, interaction.user.id, interaction.user.tag, limit, gameName, [starterId]);
  },
};
