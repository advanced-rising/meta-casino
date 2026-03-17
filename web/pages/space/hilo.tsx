import HiLo from '@/components/games/HiLo'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { getMoney } from '@/utils/money'

export default function HiLoPage() {
  const router = useRouter()
  const [money, setMoney] = useState(0)
  useEffect(() => setMoney(getMoney()), [])

  return (
    <div className='fixed top-0 w-screen h-screen z-[9000]'
      style={{ background: 'radial-gradient(ellipse at center, #0a3a0a 0%, #061a06 60%, #030d03 100%)' }}>
      <div className='flex items-center justify-between px-[24px] h-[52px]'
        style={{ background: 'linear-gradient(180deg, #0a3a0a 0%, #061a06 100%)', borderBottom: '2px solid #c9a84c' }}>
        <button className='arcade-btn text-[13px] px-[14px] py-[6px] rounded-[4px] font-bold'
          style={{ background: 'linear-gradient(180deg, #c9a84c, #8B6914)', color: '#1a0f08' }}
          onClick={() => router.push('/')}>EXIT</button>
        <span className='arcade-title' style={{ color: '#c9a84c', fontSize: '20px', fontWeight: 800, letterSpacing: '3px' }}>HI-LO</span>
        <div className='flex items-center gap-[8px] px-[16px] py-[6px] rounded-[4px]'
          style={{ background: '#0a3a0a', border: '1px solid #c9a84c' }}>
          <span className='arcade-title' style={{ color: '#c9a84c', fontSize: '13px' }}>BAL</span>
          <span style={{ color: '#ffd700', fontSize: '15px', fontWeight: 700 }}>${money.toLocaleString()}</span>
        </div>
      </div>
      <HiLo onMoneyChange={setMoney} />
    </div>
  )
}
