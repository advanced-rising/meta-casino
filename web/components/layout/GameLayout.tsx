import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { ArrowLeft } from 'lucide-react'
import { getMoney } from '@/utils/money'

interface GameLayoutProps {
  children: React.ReactNode
  title: string
  theme: 'green' | 'purple' | 'blue' | 'red' | 'gold' | 'dark'
  onMoneyChange?: (m: number) => void
  money?: number
}

const THEME_COLORS = {
  green: { bg: '#0c1a0c', accent: '#22c55e' },
  purple: { bg: '#140a1e', accent: '#a855f7' },
  blue: { bg: '#0a1225', accent: '#3b82f6' },
  red: { bg: '#1a0808', accent: '#ef4444' },
  gold: { bg: '#1a1408', accent: '#eab308' },
  dark: { bg: '#0a0a0a', accent: '#a3a3a3' },
}

const GameLayout = ({ children, title, theme, onMoneyChange, money: propMoney }: GameLayoutProps) => {
  const router = useRouter()
  const [money, setMoney] = useState(propMoney ?? 0)
  const colors = THEME_COLORS[theme]

  useEffect(() => { if (propMoney !== undefined) setMoney(propMoney) }, [propMoney])
  useEffect(() => { if (propMoney === undefined) setMoney(getMoney()) }, [])

  return (
    <div className='fixed top-0 w-screen h-screen z-[9000] overflow-hidden' style={{ background: colors.bg }}>

      {/* 상단 바 - 글래스모피즘 */}
      <div className='relative flex items-center justify-between px-[16px] h-[48px] z-10'
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>

        <button onClick={() => router.push('/')}
          className='flex items-center gap-[6px] px-[12px] py-[6px] rounded-[8px] text-[12px] font-medium transition-all hover:bg-white/10'
          style={{ color: '#aaa' }}>
          <ArrowLeft size={14} />
          <span>나가기</span>
        </button>

        <span className='absolute left-1/2 -translate-x-1/2 text-[15px] font-bold tracking-wide' style={{ color: '#fff' }}>
          {title}
        </span>

        <div className='flex items-center gap-[6px] px-[12px] py-[5px] rounded-[8px]'
          style={{ background: 'rgba(255,255,255,0.06)' }}>
          <span className='text-[11px]' style={{ color: '#888' }}>$</span>
          <span className='text-[14px] font-bold' style={{ color: colors.accent }}>{money.toLocaleString()}</span>
        </div>
      </div>

      {/* 게임 콘텐츠 */}
      <div className='relative z-10'>
        {children}
      </div>

      {/* 하단 광고 영역 */}
      <div className='fixed bottom-0 left-0 right-0 z-20 flex items-center justify-center'
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div id='game-ad-slot' className='w-full max-w-[728px] h-[50px] sm:h-[50px] flex items-center justify-center'
          style={{ color: '#333', fontSize: '11px' }}>
          {/* 광고 스크립트가 이 영역을 채움 */}
        </div>
      </div>
    </div>
  )
}

export default GameLayout
