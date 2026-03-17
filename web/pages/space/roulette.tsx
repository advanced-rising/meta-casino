import Roulette from '@/components/games/Roulette'
import GameLayout from '@/components/layout/GameLayout'
import { useState } from 'react'

export default function RoulettePage() {
  const [money, setMoney] = useState(0)
  return (
    <GameLayout title='CASINO ROULETTE' theme='green' money={money} onMoneyChange={setMoney}>
      <Roulette onMoneyChange={setMoney} />
    </GameLayout>
  )
}
