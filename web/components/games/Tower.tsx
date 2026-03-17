import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getMoney, addMoney, subtractMoney } from '@/utils/money'

const BET_OPTIONS = [100, 500, 1000, 2000]
const COLS = 3
const MAX_FLOORS = 8
const MULTIPLIERS = [1.4, 2, 3, 4.5, 7, 11, 17, 25]

const Tower = ({ onMoneyChange }: { onMoneyChange?: (m: number) => void }) => {
  const [money, setMoneyLocal] = useState(0)
  const [bet, setBet] = useState(100)
  const [playing, setPlaying] = useState(false)
  const [floor, setFloor] = useState(0)
  const [traps, setTraps] = useState<number[]>([])
  const [revealed, setRevealed] = useState<Record<number, 'safe' | 'trap'>>({})
  const [result, setResult] = useState<'win' | 'lose' | null>(null)
  const [history, setHistory] = useState<{ floor: number; profit: number }[]>([])

  const setMoney = (v: number) => { setMoneyLocal(v); onMoneyChange?.(v) }
  useEffect(() => { const m = getMoney(); setMoneyLocal(m); onMoneyChange?.(m) }, [])

  const start = () => {
    if (money < bet) return
    setMoney(subtractMoney(bet))
    // 각 층에 1개 함정
    const t: number[] = []
    for (let i = 0; i < MAX_FLOORS; i++) t.push(Math.floor(Math.random() * COLS))
    setTraps(t); setFloor(0); setRevealed({}); setResult(null); setPlaying(true)
  }

  const pick = (col: number) => {
    if (!playing) return
    const key = floor * COLS + col
    if (traps[floor] === col) {
      // 함정!
      const newRevealed = { ...revealed, [key]: 'trap' as const }
      // 모든 함정 공개
      traps.forEach((t, i) => { newRevealed[i * COLS + t] = 'trap' })
      setRevealed(newRevealed); setResult('lose'); setPlaying(false)
      setHistory((prev) => [{ floor, profit: -bet }, ...prev.slice(0, 29)])
      setMoney(getMoney())
    } else {
      setRevealed({ ...revealed, [key]: 'safe' })
      const nextFloor = floor + 1
      if (nextFloor >= MAX_FLOORS) {
        // 최상층!
        const win = Math.floor(bet * MULTIPLIERS[MAX_FLOORS - 1])
        setMoney(addMoney(win)); setResult('win'); setPlaying(false)
        setHistory((prev) => [{ floor: nextFloor, profit: win - bet }, ...prev.slice(0, 29)])
      }
      setFloor(nextFloor)
    }
  }

  const cashOut = () => {
    if (!playing || floor === 0) return
    const win = Math.floor(bet * MULTIPLIERS[floor - 1])
    setMoney(addMoney(win)); setResult('win'); setPlaying(false)
    // 함정 공개
    const newRevealed = { ...revealed }
    traps.forEach((t, i) => { newRevealed[i * COLS + t] = 'trap' })
    setRevealed(newRevealed)
    setHistory((prev) => [{ floor, profit: win - bet }, ...prev.slice(0, 29)])
  }

  const currentMult = floor > 0 ? MULTIPLIERS[floor - 1] : 1
  const totalProfit = history.reduce((s, h) => s + h.profit, 0)

  return (
    <div className='h-[calc(100vh-80px)] sm:h-[calc(100vh-102px)] flex overflow-hidden'>
      <div className='flex-1 flex flex-col items-center justify-center gap-[10px] px-[8px]'>
        <div className='rounded-[12px] p-[10px] sm:p-[18px] flex flex-col items-center gap-[8px]'
          >
          <span className='arcade-title neon-text' style={{ '--neon-color': '#9b59b6', color: '#ffd700', fontSize: '16px', fontWeight: 800 } as any}>🏗️ TOWER</span>

          {/* 타워 */}
          <div className='flex flex-col-reverse gap-[3px]'>
            {Array.from({ length: MAX_FLOORS }, (_, f) => (
              <div key={f} className='flex gap-[3px]'>
                {Array.from({ length: COLS }, (_, c) => {
                  const key = f * COLS + c
                  const state = revealed[key]
                  const isCurrentFloor = f === floor && playing
                  return (
                    <motion.button key={c} onClick={() => isCurrentFloor && pick(c)} disabled={!isCurrentFloor}
                      whileHover={isCurrentFloor ? { scale: 1.1 } : {}}
                      className='w-[60px] h-[36px] rounded-[4px] flex items-center justify-center text-[14px] font-bold disabled:cursor-default'
                      style={{
                        background: state === 'safe' ? '#2ecc7133' : state === 'trap' ? '#e74c3c33'
                          : isCurrentFloor ? '#9b59b644' : f < floor ? '#ffffff08' : '#ffffff04',
                        border: isCurrentFloor ? '2px solid #9b59b6' : state ? `1px solid ${state === 'safe' ? '#2ecc71' : '#e74c3c'}44` : '1px solid #ffffff0a',
                        color: '#fff',
                      }}>
                      {state === 'safe' ? '💎' : state === 'trap' ? '💀' : isCurrentFloor ? '?' : ''}
                    </motion.button>
                  )
                })}
                <span className='arcade-title text-[9px] w-[35px] flex items-center justify-end' style={{ color: f < floor ? '#4ade80' : '#555' }}>
                  x{MULTIPLIERS[f]}
                </span>
              </div>
            ))}
          </div>

          <div className='h-[26px] flex items-center justify-center'>
            {playing && floor > 0 && <span className='arcade-title' style={{ color: '#4ade80', fontSize: '14px' }}>FLOOR {floor} → x{currentMult}</span>}
            {result === 'win' && <motion.span animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: 3, duration: 0.3 }} className='arcade-title' style={{ color: '#ffd700', fontSize: '15px', fontWeight: 800 }}>🏆 +${Math.floor(bet * currentMult).toLocaleString()}</motion.span>}
            {result === 'lose' && <span className='arcade-title' style={{ color: '#e74c3c', fontSize: '16px' }}>💀 TRAPPED!</span>}
          </div>

          {playing && floor > 0 ? (
            <button onClick={cashOut} className='arcade-btn px-[20px] py-[8px] rounded-full text-[14px] font-bold'
              >
              💰 CASH OUT x{currentMult}
            </button>
          ) : !playing ? (
            <>
              <div className='flex items-center gap-[6px] flex-wrap justify-center'>
                <span className='arcade-title' style={{ color: '#c9a84c', fontSize: '10px' }}>BET</span>
                {BET_OPTIONS.map((v) => (
                  <button key={v} onClick={() => setBet(v)} className='arcade-btn px-[6px] py-[3px] rounded-[6px] text-[10px] font-bold'
                    style={{ background: bet === v ? '#c9a84c' : '#1a1a2e', color: bet === v ? '#000' : '#666' }}>${v >= 1000 ? `${v / 1000}K` : v}</button>
                ))}
                <input type='number' min={1} value={bet} onChange={(e) => { const v = parseInt(e.target.value) || 0; if (v >= 0) setBet(v) }}
                  className='w-[50px] h-[22px] rounded-[4px] text-[10px] text-center font-bold outline-none'
                  style={{ background: '#0d0d1a', color: '#ffd700', border: '1px solid #c9a84c' }} />
              </div>
              <button onClick={start} disabled={money < bet} className='arcade-btn w-full max-w-[160px] h-[36px] rounded-full text-[14px] font-bold disabled:opacity-30'
                >CLIMB</button>
            </>
          ) : null}

          <div className='text-[10px]' style={{ color: '#666' }}>BAL <span style={{ color: '#4ade80', fontWeight: 700 }}>${money.toLocaleString()}</span></div>
        </div>
      </div>
      <div className='hidden lg:flex flex-col w-[200px] overflow-y-auto py-[12px] px-[10px] gap-[10px]' style={{ background: '#0d0d1a', borderLeft: '1px solid #c9a84c22' }}>
        <div className='rounded-[8px] p-[10px]' style={{ background: '#1a1a2e' }}>
          <div className='arcade-title text-[10px] mb-[4px]' style={{ color: '#c9a84c' }}>STATS</div>
          {[['CLIMBS', history.length, '#fff'], ['PROFIT', `${totalProfit >= 0 ? '+' : ''}$${totalProfit.toLocaleString()}`, totalProfit >= 0 ? '#ffd700' : '#e74c3c']
          ].map(([l, v, c]) => (<div key={l as string} className='flex justify-between text-[11px] mb-[1px]'><span style={{ color: '#888' }}>{l}</span><span style={{ color: c as string }}>{v}</span></div>))}
        </div>
        <div className='rounded-[8px] p-[10px] flex-1' style={{ background: '#1a1a2e' }}>
          <div className='arcade-title text-[10px] mb-[4px]' style={{ color: '#c9a84c' }}>HISTORY</div>
          <div className='flex flex-col gap-[2px] max-h-[300px] overflow-y-auto'>
            {history.map((h, i) => (<div key={i} className='flex justify-between px-[4px] py-[1px]'><span style={{ color: '#888', fontSize: '10px' }}>F{h.floor}</span><span style={{ color: h.profit > 0 ? '#ffd700' : '#e74c3c', fontSize: '10px' }}>{h.profit > 0 ? `+$${h.profit}` : `-$${Math.abs(h.profit)}`}</span></div>))}
          </div>
        </div>
      </div>
    </div>
  )
}
export default Tower
