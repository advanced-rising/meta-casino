import Plinko from '@/components/games/Plinko'
import GameLayout from '@/components/layout/GameLayout'
import { useState } from 'react'

export default function PlinkoPage() {
  const [money, setMoney] = useState(0)
  return (
    <GameLayout title='PLINKO' theme='blue' money={money} onMoneyChange={setMoney}>
      <Plinko onMoneyChange={setMoney} />
    </GameLayout>
  )
}
