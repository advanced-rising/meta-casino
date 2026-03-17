import Plinko from '@/components/games/Plinko'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { getMoney } from '@/utils/money'
export default function PlinkoPage() {
  const router = useRouter()
  const [money, setMoney] = useState(0)
  useEffect(() => setMoney(getMoney()), [])
  return (
    <div className='fixed top-0 w-screen h-screen z-[9000]' style={{ background: 'radial-gradient(ellipse at center, #0a1a3a 0%, #050d20 60%, #020510 100%)' }}>
      <div className='flex items-center justify-between px-[24px] h-[52px]' style={{ background: '#050d20', borderBottom: '2px solid #c9a84c' }}>
        <button className='arcade-btn text-[13px] px-[14px] py-[6px] rounded-[4px] font-bold' style={{ background: 'linear-gradient(180deg, #c9a84c, #8B6914)', color: '#1a0f08' }} onClick={() => router.push('/')}>EXIT</button>
        <span className='arcade-title' style={{ color: '#c9a84c', fontSize: '20px', fontWeight: 800 }}>PLINKO</span>
        <span style={{ color: '#ffd700', fontSize: '15px', fontWeight: 700 }}>${money.toLocaleString()}</span>
      </div>
      <Plinko onMoneyChange={setMoney} />
    </div>
  )
}
