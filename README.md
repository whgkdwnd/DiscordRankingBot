# DiscordRankingBot

디스코드에서 각종 랭킹을 수집하고 알려주는 봇입니다.

## 요구 사항

- Node.js 18 이상
- 디스코드 봇 토큰

## 설치

```bash
npm install
```

## 설정

1. [Discord Developer Portal](https://discord.com/developers/applications)에서 애플리케이션을 만들고 봇을 생성합니다.
2. 봇 토큰을 복사한 뒤, 프로젝트 루트에 `.env` 파일을 만듭니다.

```bash
# .env.example을 복사 후 값 수정
copy .env.example .env
```

3. `.env` 내용 예시:

```
DISCORD_TOKEN=여기에_봇_토큰_입력
GUILD_ID=테스트용_서버_ID  # 선택. 넣으면 해당 서버에만 슬래시 명령이 즉시 반영됨
```

4. 슬래시 명령을 디스코드에 등록합니다. **`.env`에 `GUILD_ID`(테스트 서버 ID)를 넣어두면 해당 서버에만 명령이 즉시 반영됩니다.** (비우면 글로벌 등록이라 반영에 최대 1시간 걸릴 수 있음)

```bash
npm run deploy
```

5. 봇을 초대할 때 **반드시** 초대 URL에 **`applications.commands`** 권한이 포함되어 있어야 슬래시 명령이 뜹니다.  
   개발자 포털 → **OAuth2** → **URL 생성기**에서 **SCOPES**에 `bot`과 `applications.commands` 체크 후 생성한 링크로 초대합니다.

6. 봇을 초대한 뒤 봇을 실행합니다.  
   **롤 5인큐** 기능(`/롤 협곡 5인큐` 메시지 감지)을 쓰려면 개발자 포털 **Bot** → **Privileged Gateway Intents**에서 **Message Content Intent**를 켜야 합니다.

```bash
npm start
```

### 슬래시 명령(/)이 안 뜰 때

1. **`npm run deploy` 실행했는지** 확인하고, `.env`에 **`GUILD_ID`**(명령을 쓸 서버 ID)를 넣은 상태에서 다시 `npm run deploy` 실행.
2. 봇 초대 링크에 **`applications.commands`** 스코프가 포함됐는지 확인. 없으면 새 초대 링크를 만들어서(Scope에 `bot` + `applications.commands` 체크) 봇을 다시 초대하거나, 서버에서 봇 내보내기 후 새 링크로 다시 초대.
3. 디스코드 클라이언트를 완전히 끄고 다시 켜기.
4. 채널에서 `/` 입력 후 봇 이름이 보이면 그걸로 명령 선택.

개발 시 자동 재시작:

```bash
npm run dev
```

## 명령어

| 명령어 | 설명 |
|--------|------|
| `/채팅랭킹` | 기간별 채팅 수 상위 랭킹 (기간·상위 인원·공개 여부 옵션) |
| `/협곡` | 롤 협곡 모집 (인원 옵션, 비우면 5명) |
| `/증바람` | 롤 증바람 모집 (인원 옵션, 비우면 5명) |
| `/치킨` | 배그 모집 (인원 옵션, 비우면 5명) |

**채팅 랭킹**: 봇이 **켜져 있는 동안** 보이는 메시지만 집계합니다. 기본 기간 30일, 최대 365일까지 임의 설정 가능.

### 롤 5인큐

- **슬래시 명령**: `/협곡`, `/증바람`, `/치킨` (배그). 각각 인원 비우면 5명, `players` 옵션으로 2~10명 지정 가능. **명령을 친 사람은 자동으로 참가자에 포함**됩니다.
- **채팅 트리거**: 채널에 **`/롤 협곡 5인큐`** 또는 **`롤 협곡 5인큐`** 라고 입력하면 협곡 5인큐로 생성됩니다. (Message Content Intent 필요)

선착순 4명이 **참가** 버튼을 누르면 참가자 목록이 갱신되고, 4명이 차면 버튼이 비활성화됩니다.

- **멘션할 역할**: `.env`에 `ROLE_ID_LOL_QUEUE=역할ID`를 넣으면 해당 역할이 멘션됩니다. 비우면 멘션 없이 버튼만 표시됩니다.
- 역할 ID는 디스코드에서 개발자 모드 켜기 → 서버 설정 → 역할 → 해당 역할 우클릭 → **역할 ID 복사**로 확인할 수 있습니다.

## 프로젝트 구조

```
src/
  index.js           # 봇 진입점
  config.js          # 설정 (.env 로드)
  deploy-commands.js # 슬래시 명령 등록 스크립트
  commands/          # 슬래시 명령 정의
    loadCommands.js  # 명령 자동 로드
    chatRanking.js   # 채팅 랭킹
    coop.js          # /협곡
    aram.js          # /증바람
    chicken.js       # /치킨 (배그)
  data/
    chatCountStore.js # 채팅 수 저장 (data/chatCounts.json에 영속)
  features/
    lolQueue.js       # 롤 5인큐 (메시지 트리거 + 참가 버튼)
```

새 랭킹을 넣을 때는 `src/commands/`에 새 명령 파일을 추가하거나, `chatRanking.js`에서 외부 API/DB를 연동해 구현하면 됩니다.

## 라이선스

MIT
