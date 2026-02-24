import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const DATA_DIR = join(__dirname, '..', '..', 'data');
const FILE_PATH = join(DATA_DIR, 'chatCounts.json');

/**
 * 구조: { [guildId]: { [userId]: { [dateStr]: count } } }
 * dateStr = "YYYY-MM-DD" (UTC 기준일)
 */
let store = {};

function load() {
  try {
    if (existsSync(FILE_PATH)) {
      const raw = readFileSync(FILE_PATH, 'utf8');
      store = JSON.parse(raw);
    } else {
      store = {};
    }
  } catch (e) {
    console.warn('채팅 집계 파일 로드 실패, 빈 저장소로 시작:', e.message);
    store = {};
  }
}

function save() {
  try {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(FILE_PATH, JSON.stringify(store, null, 0), 'utf8');
  } catch (e) {
    console.error('채팅 집계 저장 실패:', e.message);
  }
}

/** 오늘 날짜 문자열 (UTC) */
function todayStr() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

/**
 * 해당 길드·유저의 오늘 채팅 수 +1
 */
export function increment(guildId, userId) {
  if (!store[guildId]) store[guildId] = {};
  if (!store[guildId][userId]) store[guildId][userId] = {};
  const key = todayStr();
  store[guildId][userId][key] = (store[guildId][userId][key] || 0) + 1;
}

/**
 * 지난 N일간의 채팅 수 랭킹 (많은 순)
 * @param {string} guildId
 * @param {number} days
 * @returns {Array<{ userId: string, count: number }>}
 */
export function getRanking(guildId, days) {
  const guild = store[guildId];
  if (!guild) return [];

  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - Math.max(0, days - 1));
  start.setUTCHours(0, 0, 0, 0);
  end.setUTCHours(23, 59, 59, 999);

  const totalByUser = {};

  for (const userId of Object.keys(guild)) {
    let sum = 0;
    for (const dateStr of Object.keys(guild[userId])) {
      const d = new Date(dateStr + 'T12:00:00Z');
      if (d >= start && d <= end) sum += guild[userId][dateStr];
    }
    if (sum > 0) totalByUser[userId] = sum;
  }

  return Object.entries(totalByUser)
    .map(([userId, count]) => ({ userId, count }))
    .sort((a, b) => b.count - a.count);
}

let saveTimer = null;
const SAVE_INTERVAL_MS = 60 * 1000; // 1분마다 저장

export function scheduleSave() {
  if (saveTimer) return;
  saveTimer = setInterval(() => {
    save();
  }, SAVE_INTERVAL_MS);
}

export function stopSave() {
  if (saveTimer) {
    clearInterval(saveTimer);
    saveTimer = null;
  }
  save();
}

// 시작 시 로드
load();

export { save };
