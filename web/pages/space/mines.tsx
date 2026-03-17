import Mines from '@/components/games/Mines'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { getMoney } from '@/utils/money'

export default function MinesPage() {
  const router = useRouter()
  const [money, setMoney] = useState(0)
  useEffect(() => setMoney(getMoney()), [])

  return (
    <div className='fixed top-0 w-screen h-screen z-[9000]'
      style={{ background: 'radial-gradient(ellipse at center, #0a2540 0%, #061a2e 60%, #030d18 100%)' }}>
      <div className='flex items-center justify-between px-[24px] h-[52px]'
        style={{ background: 'linear-gradient(180deg, #0d2a4a 0%, #061a2e 100%)', borderBottom: '2px solid #c9a84c' }}>
        <button className='text-[13px] px-[14px] py-[6px] rounded-[4px] font-bold hover:scale-105'
          style={{ background: 'linear-gradient(180deg, #c9a84c 0%, #8B6914 100%)', color: '#1a0f08' }}
          onClick={() => router.push('/')}>EXIT</button>
        <span style={{ color: '#c9a84c', fontSize: '20px', fontWeight: 800, letterSpacing: '3px' }}>MINES</span>
        <div className='flex items-center gap-[8px] px-[16px] py-[6px] rounded-[4px]'
          style={{ background: '#0a2540', border: '1px solid #c9a84c' }}>
          <span style={{ color: '#c9a84c', fontSize: '13px' }}>BALANCE</span>
          <span style={{ color: '#ffd700', fontSize: '15px', fontWeight: 700 }}>${money.toLocaleString()}</span>
        </div>
      </div>
      <Mines onMoneyChange={setMoney} />
    </div>
  )
}
