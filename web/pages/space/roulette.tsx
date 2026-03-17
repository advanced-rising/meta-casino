import Roulette from '@/components/games/Roulette'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { getMoney } from '@/utils/money'

const RoulettePage = () => {
  const router = useRouter()
  const [money, setMoney] = useState(0)

  useEffect(() => {
    setMoney(getMoney())
  }, [])

  return (
    <div className='fixed top-0 w-screen h-screen z-[9000]'
      style={{ background: 'radial-gradient(ellipse at center, #1a3a1a 0%, #0d1f0d 60%, #050d05 100%)' }}>
      {/* 상단 바 */}
      <div className='flex items-center justify-between px-[24px] h-[52px]'
        style={{ background: 'linear-gradient(180deg, #2a1810 0%, #1a0f08 100%)', borderBottom: '2px solid #8B6914' }}>
        <button
          className='text-[13px] px-[14px] py-[6px] rounded-[4px] font-bold transition-all hover:scale-105'
          style={{ background: 'linear-gradient(180deg, #c9a84c 0%, #8B6914 100%)', color: '#1a0f08' }}
          onClick={() => router.push('/')}>
          EXIT
        </button>
        <div className='flex items-center gap-[12px]'>
          <span style={{ color: '#c9a84c', fontSize: '20px', fontWeight: 800, letterSpacing: '3px', textShadow: '0 0 10px rgba(201,168,76,0.3)' }}>
            CASINO ROULETTE
          </span>
        </div>
        <div className='flex items-center gap-[8px] px-[16px] py-[6px] rounded-[4px]'
          style={{ background: 'linear-gradient(180deg, #1a3a1a 0%, #0d1f0d 100%)', border: '1px solid #c9a84c' }}>
          <span style={{ color: '#c9a84c', fontSize: '13px' }}>BALANCE</span>
          <span style={{ color: '#ffd700', fontSize: '15px', fontWeight: 700 }}>${money.toLocaleString()}</span>
        </div>
      </div>
      <Roulette onMoneyChange={setMoney} />
    </div>
  )
}

export default RoulettePage
