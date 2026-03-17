import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Coins } from 'lucide-react'
import { getMoney } from '@/utils/money'

interface GameLayoutProps {
  children: React.ReactNode
  title: string
  theme: 'green' | 'purple' | 'blue' | 'red' | 'gold' | 'dark'
  onMoneyChange?: (m: number) => void
  money?: number
}

const THEME_COLORS = {
  green: { bg1: '#0a3a0a', bg2: '#061a06', bg3: '#030d03', accent: '#2ecc71', border: '#1a5a1a' },
  purple: { bg1: '#2a0a2a', bg2: '#1a0520', bg3: '#0d0210', accent: '#9b59b6', border: '#4a1a4a' },
  blue: { bg1: '#0a1a3a', bg2: '#050d20', bg3: '#020510', accent: '#3498db', border: '#1a3a6a' },
  red: { bg1: '#2a0a0a', bg2: '#1a0505', bg3: '#0d0202', accent: '#e74c3c', border: '#5a1a1a' },
  gold: { bg1: '#2a1a00', bg2: '#1a0f00', bg3: '#0d0800', accent: '#f39c12', border: '#5a3a0a' },
  dark: { bg1: '#1a1a1a', bg2: '#0d0d0d', bg3: '#050505', accent: '#c9a84c', border: '#333' },
}

const GameLayout = ({ children, title, theme, onMoneyChange, money: propMoney }: GameLayoutProps) => {
  const router = useRouter()
  const [money, setMoney] = useState(propMoney ?? 0)
  const colors = THEME_COLORS[theme]

  useEffect(() => {
    if (propMoney !== undefined) setMoney(propMoney)
  }, [propMoney])

  useEffect(() => {
    if (propMoney === undefined) setMoney(getMoney())
  }, [])

  return (
    <div className='fixed top-0 w-screen h-screen z-[9000] overflow-hidden'
      style={{ background: `radial-gradient(ellipse at center, ${colors.bg1} 0%, ${colors.bg2} 60%, ${colors.bg3} 100%)` }}>

      {/* 네온 코너 장식 */}
      <div className='absolute top-0 left-0 w-[80px] h-[80px] pointer-events-none'
        style={{ borderTop: `2px solid ${colors.accent}44`, borderLeft: `2px solid ${colors.accent}44` }} />
      <div className='absolute top-0 right-0 w-[80px] h-[80px] pointer-events-none'
        style={{ borderTop: `2px solid ${colors.accent}44`, borderRight: `2px solid ${colors.accent}44` }} />
      <div className='absolute bottom-0 left-0 w-[80px] h-[80px] pointer-events-none'
        style={{ borderBottom: `2px solid ${colors.accent}44`, borderLeft: `2px solid ${colors.accent}44` }} />
      <div className='absolute bottom-0 right-0 w-[80px] h-[80px] pointer-events-none'
        style={{ borderBottom: `2px solid ${colors.accent}44`, borderRight: `2px solid ${colors.accent}44` }} />

      {/* 배경 파티클 */}
      <div className='absolute inset-0 pointer-events-none overflow-hidden'>
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i} className='absolute rounded-full'
            style={{
              width: 2 + Math.random() * 3,
              height: 2 + Math.random() * 3,
              background: `${colors.accent}33`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `floatParticle ${5 + Math.random() * 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }} />
        ))}
      </div>

      {/* 상단 바 */}
      <div className='relative flex items-center justify-between px-[20px] h-[52px] z-10'
        style={{
          background: `linear-gradient(180deg, ${colors.bg1}ee, ${colors.bg2}ee)`,
          borderBottom: `2px solid ${colors.accent}66`,
          boxShadow: `0 2px 20px ${colors.accent}22`,
        }}>
        {/* EXIT */}
        <button className='arcade-btn text-[12px] px-[14px] py-[6px] rounded-[6px] font-bold flex items-center gap-[4px] hover:scale-105'
          style={{
            background: `linear-gradient(180deg, ${colors.accent}, ${colors.accent}88)`,
            color: '#000', border: '2px solid #c9a84c',
            boxShadow: `0 0 10px ${colors.accent}44`,
          }}
          onClick={() => router.push('/')}>
          ← EXIT
        </button>

        {/* 타이틀 */}
        <div className='absolute left-1/2 -translate-x-1/2 flex items-center gap-[8px]'>
          <div className='arcade-title text-[18px] font-bold'
            style={{
              color: '#ffd700',
              textShadow: `0 0 10px ${colors.accent}88, 0 0 20px ${colors.accent}44`,
              letterSpacing: '3px',
            }}>
            {title}
          </div>
        </div>

        {/* 머니 */}
        <div className='flex items-center gap-[6px] px-[14px] py-[5px] rounded-[6px]'
          style={{
            background: `${colors.bg3}cc`,
            border: `1px solid ${colors.accent}66`,
            boxShadow: `inset 0 0 10px ${colors.bg3}`,
          }}>
          <Coins size={14} color='#ffd700' />
          <span className='arcade-title text-[14px] font-bold' style={{ color: '#ffd700' }}>
            ${money.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 사이드 네온 라인 */}
      <div className='absolute left-0 top-[52px] bottom-0 w-[2px] pointer-events-none'
        style={{ background: `linear-gradient(180deg, ${colors.accent}44, transparent 30%, transparent 70%, ${colors.accent}44)` }} />
      <div className='absolute right-0 top-[52px] bottom-0 w-[2px] pointer-events-none'
        style={{ background: `linear-gradient(180deg, ${colors.accent}44, transparent 30%, transparent 70%, ${colors.accent}44)` }} />

      {/* 게임 콘텐츠 */}
      <div className='relative z-10'>
        {children}
      </div>
    </div>
  )
}

export default GameLayout
