import Dice from '@/components/games/Dice'
import GameLayout from '@/components/layout/GameLayout'
import { useState } from 'react'

export default function DicePage() {
  const [money, setMoney] = useState(0)
  return (
    <GameLayout title='DICE' theme='green' money={money} onMoneyChange={setMoney}>
      <Dice onMoneyChange={setMoney} />
    </GameLayout>
  )
}
