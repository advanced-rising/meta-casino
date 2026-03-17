import HorseRace from '@/components/games/HorseRace'
import GameLayout from '@/components/layout/GameLayout'
import { useState } from 'react'
export default function Page() {
  const [money, setMoney] = useState(0)
  return (
    <GameLayout title='HORSE RACE' theme='green' money={money} onMoneyChange={setMoney}>
      <HorseRace onMoneyChange={setMoney} />
    </GameLayout>
  )
}
