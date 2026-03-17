import Game from '@/components/games/War'
import GameLayout from '@/components/layout/GameLayout'
import { useState } from 'react'
export default function Page() {
  const [money, setMoney] = useState(0)
  return (
    <GameLayout title='WAR' theme='red' money={money} onMoneyChange={setMoney}>
      <Game onMoneyChange={setMoney} />
    </GameLayout>
  )
}
