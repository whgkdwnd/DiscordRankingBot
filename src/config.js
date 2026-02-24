import 'dotenv/config';

/**
 * 봇 설정
 * .env 파일을 로드하며, 없으면 process.env 값 사용
 */
export const config = {
  token: process.env.DISCORD_TOKEN,
  guildId: process.env.GUILD_ID || null,
  /** /협곡 시 멘션할 역할 ID (.env의 ROLE_ID_COOP) */
  roleIdCoop: process.env.ROLE_ID_COOP || null,
  /** /증바람 시 멘션할 역할 ID (.env의 ROLE_ID_ARAM) */
  roleIdAram: process.env.ROLE_ID_ARAM || null,
};

export function validateConfig() {
  if (!config.token || config.token === 'your_bot_token_here') {
    throw new Error(
      'DISCORD_TOKEN이 설정되지 않았습니다. .env 파일을 만들고 토큰을 넣어주세요. (.env.example 참고)'
    );
  }
}
