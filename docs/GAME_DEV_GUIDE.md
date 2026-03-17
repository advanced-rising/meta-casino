# META CASINO - 게임 개발 가이드

---

## 새 게임 추가 (4단계)

### 1. 게임 컴포넌트

`web/components/games/MyGame.tsx`:

```tsx
import { useState, useEffect } from 'react'
import { getMoney, addMoney, subtractMoney } from '@/utils/money'

const BET_OPTIONS = [100, 500, 1000, 2000]

const MyGame = ({ onMoneyChange }: { onMoneyChange?: (m: number) => void }) => {
  const [money, setMoneyLocal] = useState(0)
  const [bet, setBet] = useState(100)
  const setMoney = (v: number) => { setMoneyLocal(v); onMoneyChange?.(v) }
  useEffect(() => { const m = getMoney(); setMoneyLocal(m); onMoneyChange?.(m) }, [])

  return (
    <div className='h-[calc(100vh-52px)] flex overflow-hidden'>
      <div className='flex-1 flex flex-col items-center justify-center gap-[12px] px-[8px]'>
        {/* 게임 UI */}
      </div>
      {/* 데스크탑 사이드 패널 */}
      <div className='hidden lg:flex flex-col w-[220px] overflow-y-auto py-[12px] px-[10px] gap-[10px]'
        style={{ background: '#0d0d0d', borderLeft: '1px solid #c9a84c22' }}>
        {/* 통계, 히스토리 */}
      </div>
    </div>
  )
}
export default MyGame
```

### 2. 페이지

`web/pages/space/mygame.tsx`:

```tsx
import MyGame from '@/components/games/MyGame'
import GameLayout from '@/components/layout/GameLayout'
import { useState } from 'react'

export default function Page() {
  const [money, setMoney] = useState(0)
  return (
    <GameLayout title='MY GAME' theme='green' money={money} onMoneyChange={setMoney}>
      <MyGame onMoneyChange={setMoney} />
    </GameLayout>
  )
}
```

**테마 옵션**: `green`, `purple`, `blue`, `red`, `gold`, `dark`

### 3. 맵 등록

`web/utils/mapData.ts`의 `GAME_SPACES`에 추가:

```ts
{ id: 'mygame', name: 'My Game 🎮', position: [x, 0, z], route: '/space/mygame', radius: 3 },
```

충돌 박스도 `MAP_BLOCKS`에 추가:

```ts
[x, 0, z, 1.5, 1.5, 1.5],  // mygame
```

### 4. 3D 랜드마크

`web/models/ui/GameLandmarks.tsx`에 컴포넌트 추가 후 `Field.tsx`에서 import + 배치.

`web/components/dom/HUD.tsx`의 게임 목록에도 추가.

---

## 머니 API

```ts
import { getMoney, addMoney, subtractMoney, resetMoney } from '@/utils/money'

getMoney()           // 현재 잔액
addMoney(5000)       // +5000 (반환: 갱신된 잔액)
subtractMoney(3000)  // -3000 (0 미만 불가)
resetMoney()         // $10,000으로 초기화
```

- 1시간마다 $5,000 자동 충전 (HUD에서 자동 처리)

---

## GameLayout 테마

| 테마 | 배경 | 게임 |
|------|------|------|
| green | 다크 그린 | 룰렛, 블랙잭, 바카라, 하이로, 다이스, 경마 |
| purple | 다크 퍼플 | 슬롯, 포춘휠 |
| blue | 다크 블루 | 마인즈, 플링코, 림보 |
| red | 다크 레드 | 크래시, 폭탄해체 |
| gold | 다크 골드 | 코인플립, 스크래치, 가위바위보 |
| dark | 다크 | 기본 |

---

## 맵 좌표

현재 게임장 배치:

```
              -Z (위)
               │
  [-30,0]BJ   [0,-18]Mines  [18,-15]HiLo  [30,-20]Plinko
               │
  [-25,-25]RPS  중앙분수[0,0]               [25,-25]Horse
               │
  [-18,-12]Crash [-10,-35]Color            [35,-10]MidPlat
               │
  [-15,15]Slot [0,25]Baccarat [15,0]Roulette
               │
  [-20,20]Dice [15,18]Coin  [20,20]Wheel  [35,10]Tower
               │
  [-35,-10]Scratch          [35,35]Bomb    [10,35]Limbo
               │
              +Z (아래)
```

비어있는 추천 위치: `[-35, 0, 35]`, `[40, 0, 0]`, `[0, 0, -35]`

---

## 기존 게임 패턴 참고

### 캐시아웃형 (Mines, Crash, Tower, RPS, Hi-Lo, Bomb Defuse)

```
배팅 → 진행 중 배수 증가 → 캐시아웃 또는 실패
```

### 즉시 결과형 (Roulette, Coin Flip, Dice, Limbo, Color Predict)

```
배팅 → 선택 → 결과 → 당첨/꽝
```

### 애니메이션형 (Slot, Fortune Wheel, Plinko, Horse Race)

```
배팅 → 스핀/낙하/레이스 애니메이션 → 결과
```

### 카드형 (Blackjack, Baccarat, Hi-Lo)

```
배팅 → 카드 딜 → 선택(Hit/Stand) → 결과
```

---

## 체크리스트

- [ ] `web/components/games/` 게임 컴포넌트
- [ ] `web/pages/space/` 페이지 (GameLayout 래핑)
- [ ] `web/utils/mapData.ts` GAME_SPACES + MAP_BLOCKS 추가
- [ ] `web/models/ui/GameLandmarks.tsx` 3D 랜드마크
- [ ] `web/models/Field.tsx` 랜드마크 import + 배치 + Sparkles
- [ ] `web/components/dom/HUD.tsx` 게임 목록 추가
- [ ] 데스크탑 사이드 패널 (통계 + 히스토리)
- [ ] 직접 입력 배팅
- [ ] `@/utils/money` 머니 연동
