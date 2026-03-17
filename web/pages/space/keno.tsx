import Game from '@/components/games/Keno'
import GameLayout from '@/components/layout/GameLayout'
import { useState } from 'react'
export default function Page() {
  const [money, setMoney] = useState(0)
  return (
    <GameLayout title='KENO' theme='blue' money={money} onMoneyChange={setMoney}>
      <Game onMoneyChange={setMoney} />
    </GameLayout>
  )
}
