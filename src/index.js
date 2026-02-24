import { Client, Events, GatewayIntentBits, Collection } from 'discord.js';
import { config, validateConfig } from './config.js';
import { loadCommands } from './commands/loadCommands.js';
import * as chatCountStore from './data/chatCountStore.js';
import * as lolQueue from './features/lolQueue.js';

validateConfig();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // "/롤 협곡 5인큐" 등 메시지 내용 확인용
  ],
});

client.commands = new Collection();

async function main() {
  await loadCommands(client);

  client.once(Events.ClientReady, (c) => {
    console.log(`✅ 봇 로그인: ${c.user.tag}`);
    console.log(`   서버 수: ${c.guilds.cache.size}`);
    chatCountStore.scheduleSave();
  });

  process.on('beforeExit', () => chatCountStore.stopSave());

  client.on(Events.MessageCreate, (message) => {
    if (message.author.bot || !message.guildId) return;
    chatCountStore.increment(message.guildId, message.author.id);
    if (lolQueue.isTriggerMessage(message.content)) {
      lolQueue.handleMessage(message).catch((err) => console.error('롤 큐 처리 오류:', err));
      return;
    }
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isButton() && (await lolQueue.handleButton(interaction))) return;
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(err);
      const reply = { content: '명령 실행 중 오류가 발생했습니다.', ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(reply).catch(() => {});
      } else {
        await interaction.reply(reply).catch(() => {});
      }
    }
  });

  await client.login(config.token);
}

main().catch((err) => {
  console.error('봇 시작 실패:', err.message);
  process.exit(1);
});
