import Crash from '@/components/games/Crash'
import GameLayout from '@/components/layout/GameLayout'
import { useState } from 'react'

export default function CrashPage() {
  const [money, setMoney] = useState(0)
  return (
    <GameLayout title='CRASH' theme='red' money={money} onMoneyChange={setMoney}>
      <Crash onMoneyChange={setMoney} />
    </GameLayout>
  )
}
