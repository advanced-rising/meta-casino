import SlotMachine from '@/components/games/SlotMachine'
import GameLayout from '@/components/layout/GameLayout'
import { useState } from 'react'

export default function SlotPage() {
  const [money, setMoney] = useState(0)
  return (
    <GameLayout title='PACHISLOT 777' theme='purple' money={money} onMoneyChange={setMoney}>
      <SlotMachine onMoneyChange={setMoney} />
    </GameLayout>
  )
}
