import ScratchCard from '@/components/games/ScratchCard'
import GameLayout from '@/components/layout/GameLayout'
import { useState } from 'react'
export default function Page() {
  const [money, setMoney] = useState(0)
  return (
    <GameLayout title='SCRATCH CARD' theme='gold' money={money} onMoneyChange={setMoney}>
      <ScratchCard onMoneyChange={setMoney} />
    </GameLayout>
  )
}
