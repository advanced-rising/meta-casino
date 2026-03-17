# META CASINO - 프로젝트 개요

## 소개

**META CASINO**는 3D 메타버스 기반의 실시간 멀티플레이어 카지노 웹 애플리케이션이다. 사용자는 3D 가상 공간에서 캐릭터를 조작하며 돌아다니고, 다른 플레이어와 실시간 채팅을 하며, 룰렛 등의 카지노 게임을 즐길 수 있다.

---

## 기술 스택

| 카테고리 | 기술 |
|---------|------|
| **프레임워크** | Next.js 15 (Pages Router, Turbopack) |
| **언어** | TypeScript 5.9 |
| **3D 렌더링** | Three.js 0.175, React Three Fiber 9, @react-three/drei 10 |
| **물리 엔진** | @react-three/cannon 6 |
| **실시간 통신** | Socket.io 4.8 (클라이언트 + 서버 통합) |
| **상태 관리** | Redux Toolkit 2, use-immer |
| **폼 처리** | Formik + Yup |
| **스타일링** | Tailwind CSS 4 |
| **UI** | Headless UI, Heroicons |
| **애니메이션** | anime.js |
| **서버** | 커스텀 서버 (Next.js + Socket.io 통합) |
| **React** | React 19 |

---

## 프로젝트 구조

```
meta-casino/
├── web/                          ← 프론트엔드 + 서버 통합
│   ├── server.ts                 # 커스텀 서버 (Next.js + Socket.io)
│   ├── server-handler/           # Socket.io 핸들러
│   │   ├── SocketRoom.ts         # 채팅/방 관리
│   │   ├── SocketThree.ts        # 캐릭터 위치 동기화
│   │   └── rooms.ts              # 방 데이터 저장소
│   ├── pages/                    # Next.js 페이지
│   ├── components/               # React 컴포넌트
│   │   ├── dom/HUD.tsx           # 머니/설정 HUD
│   │   ├── dom/Message.tsx       # 채팅
│   │   ├── games/Roulette.tsx    # 룰렛
│   │   └── modal/EnterSpace.tsx  # 게임장 진입 모달
│   ├── models/                   # 3D 모델
│   │   ├── Field.tsx             # 맵 (경계벽, 오브젝트 배치)
│   │   ├── Character.tsx         # 플레이어 + 다른유저 캐릭터
│   │   └── ui/                   # 3D 오브젝트 (박스, 벽, 나무 등)
│   ├── utils/
│   │   ├── money.ts              # 머니 시스템 (localStorage)
│   │   ├── socketEvents.ts       # 소켓 이벤트 상수
│   │   └── context.ts            # 소켓 싱글톤
│   ├── public/                   # 정적 에셋
│   └── styles/index.css          # Tailwind v4
├── docs/                         ← 문서
└── package.json                  ← 루트
```

---

## 핵심 기능

### 캐릭터 조작
| 키 | 동작 |
|---|------|
| WASD / 화살표 | 이동 |
| Shift | 달리기 |
| Space | 점프 (물리) |
| E | 춤 |

### 멀티플레이어
- 다른 유저 캐릭터 실시간 표시 + 닉네임 (금색)
- 실시간 채팅 + 입장 알림

### 머니
- localStorage 저장, 기본 10,000
- 1시간마다 5,000 자동 충전
- 우측 상단 HUD

### 맵
- 50x50 크기, 보이지 않는 물리 벽 경계
- 장애물 박스 (점프하여 올라가기 가능)
- 계단식 장애물, 나무 장식

---

## 실행

```bash
cd web && yarn install --ignore-engines && yarn dev
```

접속: http://localhost:6100
