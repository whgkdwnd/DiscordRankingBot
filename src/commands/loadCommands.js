import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * src/commands 폴더에서 *.js 명령 파일을 읽어 client.commands에 등록
 */
export async function loadCommands(client) {
  const commandsPath = join(__dirname);
  const files = readdirSync(commandsPath).filter((f) => f.endsWith('.js') && f !== 'loadCommands.js');

  for (const file of files) {
    const filePath = join(commandsPath, file);
    const cmd = (await import(pathToFileURL(filePath).href)).default;
    if (cmd?.data?.name) {
      client.commands.set(cmd.data.name, cmd);
      console.log(`  명령 로드: /${cmd.data.name}`);
    }
  }
}
