# META CASINO - 게임 개발 가이드

새로운 게임을 추가할 때 참고하는 가이드.

---

## 새 게임 추가 절차

### Step 1: 게임 페이지

`web/pages/space/{game-name}.tsx`:

```tsx
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { getMoney } from '@/utils/money'
import MyGame from '@/components/games/MyGame'

export default function MyGamePage() {
  const router = useRouter()
  const [money, setMoney] = useState(0)
  useEffect(() => setMoney(getMoney()), [])

  return (
    <div className='fixed top-0 w-screen h-screen z-[9000] bg-[#1a1a2e]'>
      <div className='flex items-center justify-between px-[20px] py-[10px] bg-[#16213e]'>
        <button className='bg-[#e94560] text-white px-[16px] py-[8px] rounded-[8px]'
          onClick={() => router.push('/')}>필드이동</button>
        <h2 className='text-white text-[18px] font-bold'>My Game</h2>
        <div className='text-white'>💰 {money.toLocaleString()}</div>
      </div>
      <MyGame onMoneyChange={setMoney} />
    </div>
  )
}
```

### Step 2: 게임 로직 컴포넌트

`web/components/games/MyGame.tsx`:

```tsx
import { getMoney, addMoney, subtractMoney } from '@/utils/money'

const MyGame = ({ onMoneyChange }) => {
  const handleWin = (amount) => {
    const newMoney = addMoney(amount)
    onMoneyChange(newMoney)
  }
  const handleLose = (amount) => {
    const newMoney = subtractMoney(amount)
    onMoneyChange(newMoney)
  }
  // 게임 UI...
}
```

### Step 3: 필드에 게임장 추가

`web/models/Field.tsx`에 랜드마크 배치:

```tsx
<StoneHenge // 또는 새 3D 모델
  position={[-15, 0.4, -10]}
  onClick={() => {
    openModal(EnterSpace, {
      props: { spaceName: 'My Game', onClick: () => router.push('/space/my-game') }
    })
  }}
/>
```

---

## 머니 시스템

```tsx
import { getMoney, addMoney, subtractMoney, resetMoney } from '@/utils/money'

getMoney()              // 현재 잔액
addMoney(5000)          // +5000, 반환: 갱신된 잔액
subtractMoney(3000)     // -3000 (0 미만 안됨)
resetMoney()            // 10,000으로 초기화
```

- localStorage 저장
- 1시간마다 5,000 자동 충전 (HUD에서 자동 처리)

---

## 맵 좌표

맵 크기: 50x50 (반경 25), 보이지 않는 벽으로 경계.

현재 오브젝트 배치:
- `[10, 0.4, 0]` - 룰렛 StoneHenge
- `[-5 ~ 5, 0, -8 ~ 5]` - 장애물 박스
- `[-10, 0.25~1.25, -8~-4]` - 계단식 장애물

비어있는 추천 위치:
- `[-15, 0.4, -10]` - 좌측 하단
- `[15, 0.4, -15]` - 우측 상단
- `[-15, 0.4, 10]` - 좌측 상단

---

## 기존 게임 참고: 룰렛

```
web/pages/space/roulette.tsx       ← 페이지
web/components/games/Roulette.tsx  ← 게임 (배팅 + 결과 + 머니 연동)
web/components/roulette/Wheel.tsx  ← 휠 애니메이션 (anime.js)
web/components/roulette/Global.tsx ← 타입 정의
```

룰렛 기능:
- 칩 선택 (100, 500, 1K, 5K)
- 숫자/색상/홀짝/하이로 배팅
- anime.js 스핀 애니메이션
- 당첨금 자동 계산 + 머니 반영
- 히스토리 표시

---

## 추가 가능한 게임

| 게임 | 난이도 | 배당 |
|------|--------|------|
| 슬롯 머신 | ★☆☆ | CSS 릴 애니메이션 |
| 블랙잭 | ★★☆ | 카드 로직 + AI 딜러 |
| 하이로우 | ★☆☆ | 다음 카드 높/낮 예측 |
| 주사위 | ★☆☆ | 홀짝/합 맞추기 |
| 바카라 | ★★☆ | 플레이어 vs 뱅커 |

---

## 체크리스트

- [ ] `web/pages/space/{name}.tsx` 페이지
- [ ] `web/components/games/{Name}.tsx` 게임 컴포넌트
- [ ] `web/models/Field.tsx`에 랜드마크 추가
- [ ] `@/utils/money`로 머니 연동
- [ ] 필드 복귀 버튼 (`router.push('/')`)
- [ ] 잔액 표시
