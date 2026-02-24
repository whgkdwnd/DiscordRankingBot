import { REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { config, validateConfig } from './config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function deploy() {
  validateConfig();

  const commandsPath = join(__dirname, 'commands');
  const files = readdirSync(commandsPath).filter((f) => f.endsWith('.js') && f !== 'loadCommands.js');

  const commands = [];
  for (const file of files) {
    const cmd = (await import(pathToFileURL(join(commandsPath, file)).href)).default;
    if (cmd?.data) commands.push(cmd.data.toJSON());
  }

  const rest = new REST().setToken(config.token);
  const body = { body: commands };

  try {
    if (config.guildId) {
      await rest.put(Routes.applicationGuildCommands(await getAppId(), config.guildId), body);
      console.log(`✅ 길드 명령 등록 완료 (${config.guildId}): ${commands.length}개`);
    } else {
      await rest.put(Routes.applicationCommands(await getAppId()), body);
      console.log(`✅ 글로벌 명령 등록 완료: ${commands.length}개 (전파에 최대 1시간 소요될 수 있음)`);
    }
  } catch (e) {
    console.error('명령 등록 실패:', e);
    process.exit(1);
  }
}

async function getAppId() {
  const rest = new REST().setToken(config.token);
  const app = await rest.get(Routes.oauth2CurrentApplication());
  return app.id;
}

deploy();
