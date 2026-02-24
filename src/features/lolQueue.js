import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { config } from '../config.js';

const TRIGGER_TEXTS = ['/롤 협곡 5인큐', '롤 협곡 5인큐'];

/** messageId -> { participants, starterId, starterTag, limit, gameName } */
const queueState = new Map();

function buildEmbed(participants, starterTag, limit, gameName) {
  const list =
    participants.length === 0
      ? '—'
      : participants.map((id, i) => `${i + 1}. <@${id}>`).join('\n');
  const title = `🎮 롤 ${gameName} ${limit}인큐`;

  return new EmbedBuilder()
    .setColor(0x1f8b4c)
    .setTitle(title)
    .setDescription(`참가하려면 **참가** 버튼을 눌러주세요. (선착순 ${limit}명)`)
    .addFields({
      name: `참가자 (${participants.length}/${limit})`,
      value: list,
    })
    .setFooter({ text: `개설: ${starterTag}` })
    .setTimestamp();
}

function buildButtons(joinDisabled = false) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('lolqueue')
      .setLabel('참가')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(joinDisabled),
    new ButtonBuilder()
      .setCustomId('lolqueue_cancel')
      .setLabel('참가 취소')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('lolqueue_close')
      .setLabel('모집종료')
      .setStyle(ButtonStyle.Danger)
  );
}

/**
 * 슬래시 명령용: 멘션·임베드·버튼 payload 생성
 * @param {string} starterTag
 * @param {number} limit - 모집 인원
 * @param {string} gameName - 게임 종류 (예: 협곡, 증바람)
 */
export function createQueuePayload(starterTag, limit, gameName) {
  const embed = buildEmbed([], starterTag, limit, gameName);
  const row = buildButtons(false);
  const payload = { embeds: [embed], components: [row] };
  const roleId = gameName === '증바람' ? config.roleIdAram : config.roleIdCoop;
  if (roleId) payload.content = `<@&${roleId}>`;
  return payload;
}

/**
 * 슬래시 명령용: 보낸 메시지 ID로 큐 등록 (버튼 클릭 시 사용)
 */
export function registerQueue(messageId, starterId, starterTag, limit, gameName) {
  queueState.set(messageId, {
    participants: [],
    starterId,
    starterTag,
    limit,
    gameName,
  });
}

/**
 * "/롤 협곡 5인큐" 메시지인지 확인
 */
export function isTriggerMessage(content) {
  const trimmed = (content || '').trim();
  return TRIGGER_TEXTS.some((t) => trimmed === t);
}

/**
 * 메시지에 반응해 멘션 + 버튼 메시지 전송 ("롤 협곡 5인큐" 전용)
 */
export async function handleMessage(message) {
  if (message.author.bot || !message.guild) return;

  const mentionPart = config.roleIdCoop
    ? `<@&${config.roleIdCoop}>`
    : '';

  const embed = buildEmbed([], message.author.tag, 5, '협곡');
  const row = buildButtons(false);

  const payload = { embeds: [embed], components: [row] };
  if (mentionPart) payload.content = mentionPart;

  const sent = await message.reply(payload);
  queueState.set(sent.id, {
    participants: [],
    starterId: message.author.id,
    starterTag: message.author.tag,
    limit: 5,
    gameName: '협곡',
  });
}

/**
 * 참가 / 참가 취소 버튼 클릭 처리
 */
export async function handleButton(interaction) {
  const customId = interaction.customId;
  if (!interaction.isButton() || (customId !== 'lolqueue' && customId !== 'lolqueue_cancel' && customId !== 'lolqueue_close')) return false;

  const msgId = interaction.message.id;
  const state = queueState.get(msgId);

  if (!state) {
    await interaction.reply({
      content: '이 큐는 만료되었거나 더 이상 사용할 수 없습니다.',
      ephemeral: true,
    }).catch(() => {});
    return true;
  }

  if (customId === 'lolqueue_close') {
    if (interaction.user.id !== state.starterId) {
      await interaction.reply({
        content: '모집을 종료할 수 있는 권한이 없습니다. (개설자만 가능)',
        ephemeral: true,
      }).catch(() => {});
      return true;
    }
    queueState.delete(msgId);
    await interaction.reply({
      content: '모집이 종료되었습니다.',
      ephemeral: true,
    }).catch(() => {});
    await interaction.message.delete().catch(() => {});
    return true;
  }

  await interaction.deferUpdate();

  if (customId === 'lolqueue_cancel') {
    const idx = state.participants.indexOf(interaction.user.id);
    if (idx === -1) {
      await interaction.followUp({
        content: '참가한 상태가 아닙니다.',
        ephemeral: true,
      }).catch(() => {});
      return true;
    }
    state.participants.splice(idx, 1);
  } else {
    // 참가
    if (state.participants.includes(interaction.user.id)) {
      await interaction.followUp({
        content: '이미 참가하셨습니다.',
        ephemeral: true,
      }).catch(() => {});
      return true;
    }
    const limit = state.limit ?? 5;
    if (state.participants.length >= limit) {
      await interaction.followUp({
        content: '참가 인원이 마감되었습니다.',
        ephemeral: true,
      }).catch(() => {});
      return true;
    }
    state.participants.push(interaction.user.id);
  }

  const limit = state.limit ?? 5;
  const gameName = state.gameName ?? '협곡';
  const embed = buildEmbed(state.participants, state.starterTag, limit, gameName);
  const joinDisabled = state.participants.length >= limit;
  const row = buildButtons(joinDisabled);

  await interaction.message.edit({ embeds: [embed], components: [row] }).catch(() => {});

  return true;
}
