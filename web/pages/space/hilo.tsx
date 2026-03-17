import HiLo from '@/components/games/HiLo'
import GameLayout from '@/components/layout/GameLayout'
import { useState } from 'react'

export default function HiLoPage() {
  const [money, setMoney] = useState(0)
  return (
    <GameLayout title='HI-LO' theme='green' money={money} onMoneyChange={setMoney}>
      <HiLo onMoneyChange={setMoney} />
    </GameLayout>
  )
}
