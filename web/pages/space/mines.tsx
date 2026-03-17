import Mines from '@/components/games/Mines'
import GameLayout from '@/components/layout/GameLayout'
import { useState } from 'react'

export default function MinesPage() {
  const [money, setMoney] = useState(0)
  return (
    <GameLayout title='MINES' theme='blue' money={money} onMoneyChange={setMoney}>
      <Mines onMoneyChange={setMoney} />
    </GameLayout>
  )
}
