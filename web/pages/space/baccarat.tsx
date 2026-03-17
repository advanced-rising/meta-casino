import Baccarat from '@/components/games/Baccarat'
import GameLayout from '@/components/layout/GameLayout'
import { useState } from 'react'
export default function Page() {
  const [money, setMoney] = useState(0)
  return (
    <GameLayout title='BACCARAT' theme='green' money={money} onMoneyChange={setMoney}>
      <Baccarat onMoneyChange={setMoney} />
    </GameLayout>
  )
}
