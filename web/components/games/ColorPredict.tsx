import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getMoney, addMoney, subtractMoney } from '@/utils/money'

const COLORS = [
  { id: 'red', emoji: '🔴', color: '#e74c3c', mult: 2 },
  { id: 'green', emoji: '🟢', color: '#2ecc71', mult: 3 },
  { id: 'purple', emoji: '🟣', color: '#9b59b6', mult: 5 },
]
const BET_OPTIONS = [100, 500, 1000, 2000]

const weightedRandom = () => {
  const r = Math.random()
  if (r < 0.45) return COLORS[0] // red 45%
  if (r < 0.80) return COLORS[1] // green 35%
  return COLORS[2] // purple 20%
}

const ColorPredict = ({ onMoneyChange }: { onMoneyChange?: (m: number) => void }) => {
  const [money, setMoneyLocal] = useState(0)
  const [bet, setBet] = useState(100)
  const [rolling, setRolling] = useState(false)
  const [choice, setChoice] = useState<string | null>(null)
  const [result, setResult] = useState<typeof COLORS[0] | null>(null)
  const [won, setWon] = useState<boolean | null>(null)
  const [recentColors, setRecentColors] = useState<typeof COLORS[0][]>([])
  const [history, setHistory] = useState<{ color: string; profit: number }[]>([])

  const setMoney = (v: number) => { setMoneyLocal(v); onMoneyChange?.(v) }
  useEffect(() => { const m = getMoney(); setMoneyLocal(m); onMoneyChange?.(m) }, [])

  const play = (colorId: string) => {
    if (rolling || money < bet) return
    setMoney(subtractMoney(bet)); setChoice(colorId); setRolling(true); setResult(null); setWon(null)

    // 빠르게 색 변경 애니메이션
    let ticks = 0
    const interval = setInterval(() => {
      setResult(COLORS[Math.floor(Math.random() * 3)])
      ticks++
      if (ticks > 15) {
        clearInterval(interval)
        const final = weightedRandom()
        setResult(final)
        const w = final.id === colorId
        setWon(w)
        setRecentColors((prev) => [final, ...prev.slice(0, 19)])
        if (w) { const win = bet * final.mult; setMoney(addMoney(win)); setHistory((prev) => [{ color: final.id, profit: win - bet }, ...prev.slice(0, 29)]) }
        else { setMoney(getMoney()); setHistory((prev) => [{ color: final.id, profit: -bet }, ...prev.slice(0, 29)]) }
        setRolling(false)
      }
    }, 100)
  }

  const totalProfit = history.reduce((s, h) => s + h.profit, 0)

  return (
    <div className='h-[calc(100vh-52px)] flex overflow-hidden'>
      <div className='flex-1 flex flex-col items-center justify-center gap-[12px] px-[8px]'>
        <div className='rounded-[12px] p-[24px] flex flex-col items-center gap-[12px]' style={{ background: 'linear-gradient(180deg, #1a0a1a, #0d050d)' }}>
          <span className='arcade-title neon-text' style={{ '--neon-color': '#e91e63', color: '#ffd700', fontSize: '20px', fontWeight: 900 } as any}>🎨 COLOR PREDICT</span>

          {/* 결과 원 */}
          <motion.div animate={rolling ? { scale: [1, 1.2, 1] } : {}} transition={{ repeat: rolling ? Infinity : 0, duration: 0.3 }}
            className='w-[100px] h-[100px] rounded-full flex items-center justify-center text-[40px]'
            style={{ background: result ? result.color : '#333', border: '4px solid #c9a84c', boxShadow: result ? `0 0 30px ${result.color}66` : 'none' }}>
            {result ? result.emoji : '❓'}
          </motion.div>

          {/* 최근 결과 */}
          <div className='flex gap-[3px]'>
            {recentColors.slice(0, 15).map((c, i) => (
              <div key={i} className='w-[16px] h-[16px] rounded-full' style={{ background: c.color, opacity: 1 - i * 0.05 }} />
            ))}
          </div>

          <div className='h-[24px]'>
            {won === true && <motion.span animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: 3, duration: 0.3 }} className='arcade-title' style={{ color: '#ffd700', fontSize: '20px', fontWeight: 900 }}>+${(bet * (result?.mult || 2) - bet).toLocaleString()}</motion.span>}
            {won === false && <span className='arcade-title' style={{ color: '#e74c3c', fontSize: '14px' }}>WRONG!</span>}
          </div>

          {/* 선택 */}
          <div className='flex items-center gap-[12px]'>
            {COLORS.map((c) => (
              <button key={c.id} onClick={() => play(c.id)} disabled={rolling || money < bet}
                className='arcade-btn w-[80px] h-[60px] rounded-[10px] flex flex-col items-center justify-center gap-[2px] disabled:opacity-30 hover:scale-110'
                style={{ background: `${c.color}33`, border: choice === c.id ? `2px solid ${c.color}` : '1px solid #ffffff11' }}>
                <span className='text-[24px]'>{c.emoji}</span>
                <span className='text-[10px]' style={{ color: c.color }}>x{c.mult}</span>
              </button>
            ))}
          </div>

          {!rolling && (
            <div className='flex items-center gap-[6px]'>
              {BET_OPTIONS.map((v) => (<button key={v} onClick={() => setBet(v)} className='arcade-btn px-[10px] py-[4px] rounded-[4px] text-[11px] font-bold'
                style={{ background: bet === v ? '#c9a84c' : '#1a0a1a', color: bet === v ? '#000' : '#666' }}>${v >= 1000 ? `${v / 1000}K` : v}</button>))}
              <input type='number' min={1} value={bet} onChange={(e) => { const v = parseInt(e.target.value) || 0; if (v >= 0) setBet(v) }}
                className='w-[60px] h-[24px] rounded-[4px] text-[10px] text-center font-bold outline-none' style={{ background: '#0d050d', color: '#ffd700', border: '1px solid #c9a84c' }} />
            </div>
          )}
          <div className='arcade-title text-[11px]' style={{ color: '#888' }}>BAL <span style={{ color: '#4ade80', fontWeight: 700 }}>${money.toLocaleString()}</span></div>
        </div>
      </div>
      <div className='hidden lg:flex flex-col w-[200px] overflow-y-auto py-[12px] px-[10px] gap-[10px]' style={{ background: '#0d050d', borderLeft: '1px solid #c9a84c22' }}>
        <div className='rounded-[8px] p-[10px]' style={{ background: '#1a0a1a' }}>
          <div className='arcade-title text-[10px] mb-[4px]' style={{ color: '#c9a84c' }}>ODDS</div>
          {COLORS.map((c) => (<div key={c.id} className='flex justify-between text-[11px] mb-[1px]'><span style={{ color: c.color }}>{c.emoji} {c.id.toUpperCase()}</span><span style={{ color: '#ffd700' }}>x{c.mult}</span></div>))}
        </div>
        <div className='rounded-[8px] p-[10px]' style={{ background: '#1a0a1a' }}>
          <div className='arcade-title text-[10px] mb-[4px]' style={{ color: '#c9a84c' }}>STATS</div>
          {[['PLAYS', history.length, '#fff'], ['PROFIT', `${totalProfit >= 0 ? '+' : ''}$${totalProfit.toLocaleString()}`, totalProfit >= 0 ? '#ffd700' : '#e74c3c']
          ].map(([l, v, c]) => (<div key={l as string} className='flex justify-between text-[11px] mb-[1px]'><span style={{ color: '#888' }}>{l}</span><span style={{ color: c as string }}>{v}</span></div>))}
        </div>
      </div>
    </div>
  )
}
export default ColorPredict
