# META CASINO - 프로젝트 개요

## 소개

3D 메타버스 기반 카지노 아케이드. 캐릭터를 조작하며 필드를 탐험하고, 18개 게임장에 입장하여 다양한 카지노/아케이드 게임을 즐길 수 있다.

---

## 기술 스택

| 카테고리 | 기술 |
|---------|------|
| 프레임워크 | Next.js 15 (Pages Router, Turbopack) |
| 언어 | TypeScript 5.9 |
| 3D | Three.js 0.175, React Three Fiber 9, @react-three/drei 10 |
| 애니메이션 | Framer Motion 12 |
| 실시간 | Socket.io 4.8 (선택적, Vercel 배포 시 비활성) |
| 상태관리 | Redux Toolkit 2 |
| 스타일 | Tailwind CSS 4, Pretendard 폰트 |
| 아이콘 | Lucide React |
| 머니 | localStorage 기반 |
| 배포 | Vercel (싱글플레이) |

---

## 프로젝트 구조

```
meta-casino/
├── web/                           ← 프론트엔드 + 서버 통합
│   ├── server.ts                  # 커스텀 서버 (Next.js + Socket.io)
│   ├── server-handler/            # Socket.io 핸들러
│   ├── pages/
│   │   ├── index.tsx              # 메인 (3D 필드)
│   │   └── space/                 # 게임 페이지 (18개)
│   │       ├── roulette.tsx
│   │       ├── slot.tsx
│   │       ├── mines.tsx
│   │       ├── crash.tsx
│   │       ├── hilo.tsx
│   │       ├── coinflip.tsx
│   │       ├── dice.tsx
│   │       ├── wheel.tsx
│   │       ├── plinko.tsx
│   │       ├── blackjack.tsx
│   │       ├── baccarat.tsx
│   │       ├── rps.tsx
│   │       ├── horserace.tsx
│   │       ├── tower.tsx
│   │       ├── scratch.tsx
│   │       ├── limbo.tsx
│   │       ├── colorpredict.tsx
│   │       └── bombdefuse.tsx
│   ├── components/
│   │   ├── games/                 # 게임 컴포넌트 (18개)
│   │   ├── dom/                   # UI (HUD, Message, MobileControls)
│   │   ├── layout/GameLayout.tsx  # 게임 공통 레이아웃
│   │   ├── canvas/                # 3D 씬
│   │   ├── modal/                 # 모달
│   │   └── roulette/              # 룰렛 전용
│   ├── models/
│   │   ├── Field.tsx              # 3D 맵 (100x100, 조형물, 도로, 벽)
│   │   ├── Character.tsx          # 캐릭터 (이동, 물리, 비행, 카메라)
│   │   └── ui/
│   │       ├── GameLandmarks.tsx  # 13개 게임 3D 랜드마크
│   │       ├── Lights.tsx         # 태양광 (캐릭터 추적)
│   │       └── ...
│   ├── utils/
│   │   ├── money.ts              # 머니 시스템 (localStorage, 자동 충전)
│   │   ├── mapData.ts            # 맵 블럭/충돌/게임장 데이터
│   │   ├── socketEvents.ts       # 소켓 이벤트 상수
│   │   └── context.ts            # 소켓 싱글톤
│   ├── styles/index.css          # Tailwind v4 + 아케이드 애니메이션
│   ├── public/                   # 3D 모델, 이미지
│   └── package.json
├── docs/                         ← 문서
└── package.json                  ← 루트
```

---

## 게임 목록 (18개)

### 카지노 게임 (11)

| 게임 | 설명 | 최대 배당 |
|------|------|----------|
| 🎰 Roulette | 숫자/색상/홀짝 배팅 | x36 |
| 🎰 Slot Machine | 5x5 빠칭코, 잭팟, 오토, x1~x5 배속 | x500 (잭팟) |
| 💎 Mines | 5x5 보석 찾기, 지뢰 피하기, 캐시아웃 | 가변 |
| 🚀 Crash | 배수 상승, 터지기 전 캐시아웃 | 무제한 |
| 🃏 Hi-Lo | 다음 카드 높/낮 맞추기, 연승 배수 | 연승 |
| 🪙 Coin Flip | 3D 동전 뒤집기 | x2 |
| 🎲 Dice | 주사위 2개, Over/Under/Exact | 가변 |
| 🎡 Fortune Wheel | 16칸 바퀴 스핀 | x20 |
| 📐 Plinko | 구슬 낙하, 1~20개 동시 | x8 |
| 🃏 Blackjack | Hit/Stand/Double Down | x2.5 (BJ) |
| 🃏 Baccarat | Player/Banker/Tie 배팅 | x9 (Tie) |

### 아케이드 게임 (7)

| 게임 | 설명 | 최대 배당 |
|------|------|----------|
| ✊ Rock Paper Scissors | 가위바위보 연승, 캐시아웃 | 연승 |
| 🏇 Horse Race | 5마리 경주, 말 선택 | x8 |
| 🏗️ Tower | 8층 탑, 함정 피해 올라가기 | x25 |
| 🎫 Scratch Card | 9칸 스크래치, 3매치 | x50 |
| 🎯 Limbo | 목표 배수 설정, 랜덤 결과 | 무제한 |
| 🎨 Color Predict | 빨/초/보 색 예측 | x5 |
| 💣 Bomb Defuse | 5선 중 폭탄선 피하기 | x15 |

---

## 맵 & 캐릭터

### 조작법

| 입력 | PC | 모바일 |
|------|-----|--------|
| 이동 | WASD (W=앞, A=좌회전, D=우회전, S=후진) | 조이스틱 (위=앞, 좌우=회전) |
| 달리기 | Shift | 조이스틱 끝까지 |
| 점프 | Space (짧게) | ⬆ 버튼 |
| 비행 | Space 꾹 (누르는 동안 비행) | - |
| 입장 | E키 또는 UI 클릭 | 입장 버튼 |
| 클릭 이동 | 바닥 클릭 | - |

### 맵 구성 (100x100)

- 십자형 메인 도로 + 4개 외곽 순환 도로
- 18개 게임장 (고유 3D 랜드마크 + 근접 시 Sparkles)
- 나무 40+, 가로등 16, 벤치 12, 화단 12
- 동상 4개 (교차로), 아치 게이트 4개
- 중앙 분수
- 전망대 2개 (높이 3, 비행으로 올라감)
- 중간 플랫폼 2개
- 갈색 돌 벽 경계 + 금색 캡

### 물리

- AABB 충돌: 모든 오브젝트 (~100개 박스)
- 점프/비행 중에도 충돌 적용
- 캐릭터 위치 localStorage 저장/복원

### 카메라

- MMORPG 3인칭: 캐릭터 뒤에서 따라감
- 회전 시 부드러운 lerp (0.03)
- 게임 복귀 시 즉시 카메라 배치

---

## 머니 시스템

- 초기: $10,000
- 1시간마다 $5,000 자동 충전
- localStorage 영구 저장
- HUD에 잔액 + 충전 타이머 표시
- 설정에서 리셋 가능

---

## UI/UX

- **GameLayout**: 게임별 테마 색상 (green/purple/blue/red/gold/dark), 네온 장식, 파티클 배경
- **HUD**: 우측 상단 (머니 | 정보 | 설정), Lucide 아이콘
- **아케이드 스타일**: Pretendard 폰트, 네온 글로우, arcade-title/arcade-btn 클래스
- **데스크탑**: 게임 좌측 + 정보 패널 우측
- **모바일**: 가상 조이스틱 + 액션 버튼

---

## 실행

```bash
cd web && yarn install --ignore-engines && yarn dev
```

http://localhost:6100

## 배포

- Vercel: `web/` 루트 디렉토리
- Socket.io 없이 싱글플레이 동작
- `NEXT_PUBLIC_SOCKET_URL` 설정 시 멀티플레이어 활성화
