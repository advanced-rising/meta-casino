import Limbo from '@/components/games/Limbo'
import GameLayout from '@/components/layout/GameLayout'
import { useState } from 'react'
export default function Page() {
  const [money, setMoney] = useState(0)
  return (
    <GameLayout title='LIMBO' theme='blue' money={money} onMoneyChange={setMoney}>
      <Limbo onMoneyChange={setMoney} />
    </GameLayout>
  )
}
