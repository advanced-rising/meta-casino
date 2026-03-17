import RPS from '@/components/games/RPS'
import GameLayout from '@/components/layout/GameLayout'
import { useState } from 'react'
export default function Page() {
  const [money, setMoney] = useState(0)
  return (
    <GameLayout title='ROCK PAPER SCISSORS' theme='gold' money={money} onMoneyChange={setMoney}>
      <RPS onMoneyChange={setMoney} />
    </GameLayout>
  )
}
