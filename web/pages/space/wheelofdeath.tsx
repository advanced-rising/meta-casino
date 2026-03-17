import Game from '@/components/games/WheelOfDeath'
import GameLayout from '@/components/layout/GameLayout'
import { useState } from 'react'
export default function Page() {
  const [money, setMoney] = useState(0)
  return (
    <GameLayout title='WHEEL OF DEATH' theme='red' money={money} onMoneyChange={setMoney}>
      <Game onMoneyChange={setMoney} />
    </GameLayout>
  )
}
