import ColorPredict from '@/components/games/ColorPredict'
import GameLayout from '@/components/layout/GameLayout'
import { useState } from 'react'
export default function Page() {
  const [money, setMoney] = useState(0)
  return (
    <GameLayout title='COLOR PREDICT' theme='purple' money={money} onMoneyChange={setMoney}>
      <ColorPredict onMoneyChange={setMoney} />
    </GameLayout>
  )
}
