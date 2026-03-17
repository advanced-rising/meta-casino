import FortuneWheel from '@/components/games/Wheel'
import GameLayout from '@/components/layout/GameLayout'
import { useState } from 'react'

export default function WheelPage() {
  const [money, setMoney] = useState(0)
  return (
    <GameLayout title='FORTUNE WHEEL' theme='purple' money={money} onMoneyChange={setMoney}>
      <FortuneWheel onMoneyChange={setMoney} />
    </GameLayout>
  )
}
