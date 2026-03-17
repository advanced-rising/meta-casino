import Blackjack from '@/components/games/Blackjack'
import GameLayout from '@/components/layout/GameLayout'
import { useState } from 'react'

export default function BlackjackPage() {
  const [money, setMoney] = useState(0)
  return (
    <GameLayout title='BLACKJACK' theme='green' money={money} onMoneyChange={setMoney}>
      <Blackjack onMoneyChange={setMoney} />
    </GameLayout>
  )
}
