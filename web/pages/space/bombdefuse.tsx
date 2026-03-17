import BombDefuse from '@/components/games/BombDefuse'
import GameLayout from '@/components/layout/GameLayout'
import { useState } from 'react'
export default function Page() {
  const [money, setMoney] = useState(0)
  return (
    <GameLayout title='BOMB DEFUSE' theme='red' money={money} onMoneyChange={setMoney}>
      <BombDefuse onMoneyChange={setMoney} />
    </GameLayout>
  )
}
