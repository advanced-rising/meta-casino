import Tower from '@/components/games/Tower'
import GameLayout from '@/components/layout/GameLayout'
import { useState } from 'react'
export default function Page() {
  const [money, setMoney] = useState(0)
  return (
    <GameLayout title='TOWER' theme='purple' money={money} onMoneyChange={setMoney}>
      <Tower onMoneyChange={setMoney} />
    </GameLayout>
  )
}
