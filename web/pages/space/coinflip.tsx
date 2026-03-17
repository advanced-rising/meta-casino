import CoinFlip from '@/components/games/CoinFlip'
import GameLayout from '@/components/layout/GameLayout'
import { useState } from 'react'

export default function CoinFlipPage() {
  const [money, setMoney] = useState(0)
  return (
    <GameLayout title='COIN FLIP' theme='gold' money={money} onMoneyChange={setMoney}>
      <CoinFlip onMoneyChange={setMoney} />
    </GameLayout>
  )
}
