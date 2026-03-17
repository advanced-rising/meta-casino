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

const THEMES: Record<string, { bg: string; accent: string; glow: string }> = {
  green: { bg: '#080e08', accent: '#22c55e', glow: 'rgba(34,197,94,0.15)' },
  purple: { bg: '#0c0812', accent: '#a855f7', glow: 'rgba(168,85,247,0.15)' },
  blue: { bg: '#080a12', accent: '#3b82f6', glow: 'rgba(59,130,246,0.15)' },
  red: { bg: '#0e0808', accent: '#ef4444', glow: 'rgba(239,68,68,0.15)' },
  gold: { bg: '#0e0c08', accent: '#eab308', glow: 'rgba(234,179,8,0.15)' },
  dark: { bg: '#0a0a0a', accent: '#a3a3a3', glow: 'rgba(163,163,163,0.1)' },
}

const GameLayout = ({ children, title, theme, onMoneyChange, money: propMoney }: GameLayoutProps) => {
  const router = useRouter()
  const [money, setMoney] = useState(propMoney ?? 0)
  const t = THEMES[theme]

  useEffect(() => { if (propMoney !== undefined) setMoney(propMoney) }, [propMoney])
  useEffect(() => { if (propMoney === undefined) setMoney(getMoney()) }, [])

  return (
    <div className='fixed top-0 w-screen h-screen z-[9000] overflow-hidden' style={{ background: t.bg }}>
      {/* 배경 글로우 */}
      <div className='absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none'
        style={{ background: `radial-gradient(ellipse, ${t.glow} 0%, transparent 70%)` }} />

      {/* 게임 HUD 상단바 */}
      <div className='relative flex items-center justify-between px-[12px] h-[48px] z-10'
        style={{ background: 'rgba(0,0,0,0.6)', borderBottom: `1px solid rgba(255,255,255,0.04)` }}>

        <button onClick={() => router.push('/')}
          className='flex items-center gap-[4px] px-[10px] py-[6px] rounded-[8px] text-[12px] transition-all hover:bg-white/5'
          style={{ color: '#666' }}>
          <ArrowLeft size={14} />
        </button>

        {/* 타이틀 */}
        <div className='absolute left-1/2 -translate-x-1/2'>
          <span className='text-[14px] font-bold tracking-wider' style={{ color: t.accent }}>{title}</span>
        </div>

        {/* 스코어 (잔액) */}
        <div className='flex items-center gap-[4px] px-[10px] py-[4px] rounded-[8px]'
          style={{ background: 'rgba(255,255,255,0.04)' }}>
          <span className='text-[10px]' style={{ color: '#555' }}>$</span>
          <span className='game-score text-[15px]' style={{ color: '#fff' }}>{money.toLocaleString()}</span>
        </div>
      </div>

      {/* 게임 */}
      <div className='relative z-10'>{children}</div>

      {/* 하단 광고 */}
      <div className='fixed bottom-0 left-0 right-0 z-20 flex items-center justify-center h-[32px] sm:h-[50px]'
        style={{ background: 'rgba(0,0,0,0.7)', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
        <div id='game-ad-slot' className='w-full max-w-[728px] h-[50px] flex items-center justify-center' />
      </div>
    </div>
  )
}

export default GameLayout
