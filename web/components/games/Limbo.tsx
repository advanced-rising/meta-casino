import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getMoney, addMoney, subtractMoney } from '@/utils/money'

const BET_OPTIONS = [100, 500, 1000, 2000]

const Limbo = ({ onMoneyChange }: { onMoneyChange?: (m: number) => void }) => {
  const [money, setMoneyLocal] = useState(0)
  const [bet, setBet] = useState(100)
  const [target, setTarget] = useState(2.0)
  const [playing, setPlaying] = useState(false)
  const [result, setResult] = useState<number | null>(null)
  const [won, setWon] = useState<boolean | null>(null)
  const [history, setHistory] = useState<{ target: number; result: number; profit: number }[]>([])

  const setMoney = (v: number) => { setMoneyLocal(v); onMoneyChange?.(v) }
  useEffect(() => { const m = getMoney(); setMoneyLocal(m); onMoneyChange?.(m) }, [])

  const play = () => {
    if (money < bet || playing) return
    setMoney(subtractMoney(bet)); setPlaying(true); setResult(null); setWon(null)

    setTimeout(() => {
      const r = Math.random()
      const val = Math.max(1, Math.round((1 / (r + 0.01)) * 100) / 100)
      setResult(val)
      const w = val >= target
      setWon(w)
      if (w) { const win = Math.floor(bet * target); setMoney(addMoney(win)); setHistory((prev) => [{ target, result: val, profit: win - bet }, ...prev.slice(0, 29)]) }
      else { setMoney(getMoney()); setHistory((prev) => [{ target, result: val, profit: -bet }, ...prev.slice(0, 29)]) }
      setPlaying(false)
    }, 800)
  }

  const winChance = Math.min(99, Math.round((1 / target) * 100))
  const totalProfit = history.reduce((s, h) => s + h.profit, 0)

  return (
    <div className='h-[calc(100vh-102px)] flex overflow-hidden'>
      <div className='flex-1 flex flex-col items-center justify-center gap-[12px] px-[8px]'>
        <div className='flex flex-col items-center gap-[12px] p-[12px]'>
          <span className='arcade-title neon-text' style={{ '--neon-color': '#3498db', color: '#ffd700', fontSize: '20px', fontWeight: 900 } as any}>🎯 LIMBO</span>

          <div className='w-[200px] h-[120px] rounded-[12px] flex items-center justify-center' style={{ background: '#111', border: '1px solid #333' }}>
            <motion.span key={result} initial={{ scale: 3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }}
              className='arcade-title' style={{ fontSize: '48px', fontWeight: 900, color: won ? '#2ecc71' : result ? '#e74c3c' : '#333' }}>
              {result ? `${result.toFixed(2)}x` : '?'}
            </motion.span>
          </div>

          <div className='flex items-center gap-[8px]'>
            <span className='arcade-title text-[11px]' style={{ color: '#c9a84c' }}>TARGET</span>
            <input type='range' min={1.1} max={100} step={0.1} value={target} onChange={(e) => setTarget(parseFloat(e.target.value))} className='w-[120px]' style={{ accentColor: '#3498db' }} />
            <input type='number' min={1.1} step={0.1} value={target} onChange={(e) => setTarget(Math.max(1.1, parseFloat(e.target.value) || 1.1))}
              className='w-[60px] h-[26px] rounded-[4px] text-[12px] text-center font-bold outline-none' style={{ background: '#111', color: '#ffd700', border: '1px solid #3498db' }} />
            <span className='arcade-title text-[10px]' style={{ color: '#888' }}>{winChance}%</span>
          </div>

          <div className='h-[24px]'>{won === true && <span className='arcade-title' style={{ color: '#ffd700', fontSize: '18px' }}>🎯 +${Math.floor(bet * target - bet).toLocaleString()}</span>}
            {won === false && <span className='arcade-title' style={{ color: '#e74c3c', fontSize: '14px' }}>MISS</span>}</div>

          {!playing && (
            <div className='flex items-center gap-[6px] flex-wrap justify-center'>
              {BET_OPTIONS.map((v) => (<button key={v} onClick={() => setBet(v)} className='arcade-btn px-[10px] py-[4px] rounded-[4px] text-[11px] font-bold'
                style={{ background: bet === v ? '#c9a84c' : '#0a0a2a', color: bet === v ? '#000' : '#666' }}>${v >= 1000 ? `${v / 1000}K` : v}</button>))}
              <input type='number' min={1} value={bet} onChange={(e) => { const v = parseInt(e.target.value) || 0; if (v >= 0) setBet(v) }}
                className='w-[60px] h-[24px] rounded-[4px] text-[10px] text-center font-bold outline-none' style={{ background: '#05051a', color: '#ffd700', border: '1px solid #c9a84c' }} />
            </div>
          )}
          <button onClick={play} disabled={playing || money < bet} className='arcade-btn w-full max-w-[160px] h-[42px] rounded-full text-[15px] font-bold disabled:opacity-30'
            style={{ background: playing ? '#333' : 'linear-gradient(180deg, #3498db, #2471a3)', color: 'white' }}>{playing ? '...' : '🎯 PLAY'}</button>
          <div className='arcade-title text-[11px]' style={{ color: '#888' }}>BAL <span style={{ color: '#4ade80', fontWeight: 700 }}>${money.toLocaleString()}</span></div>
        </div>
      </div>
      <div className='hidden lg:flex flex-col w-[200px] overflow-y-auto py-[12px] px-[10px] gap-[10px]' style={{ background: '#05051a', borderLeft: '1px solid #c9a84c22' }}>
        <div className='rounded-[8px] p-[10px]' style={{ background: '#0a0a2a' }}>
          <div className='arcade-title text-[10px] mb-[4px]' style={{ color: '#c9a84c' }}>STATS</div>
          {[['PLAYS', history.length, '#fff'], ['PROFIT', `${totalProfit >= 0 ? '+' : ''}$${totalProfit.toLocaleString()}`, totalProfit >= 0 ? '#ffd700' : '#e74c3c']
          ].map(([l, v, c]) => (<div key={l as string} className='flex justify-between text-[11px] mb-[1px]'><span style={{ color: '#888' }}>{l}</span><span style={{ color: c as string }}>{v}</span></div>))}
        </div>
        <div className='rounded-[8px] p-[10px] flex-1' style={{ background: '#0a0a2a' }}>
          <div className='arcade-title text-[10px] mb-[4px]' style={{ color: '#c9a84c' }}>HISTORY</div>
          <div className='flex flex-col gap-[2px] max-h-[300px] overflow-y-auto'>
            {history.map((h, i) => (<div key={i} className='flex justify-between px-[4px] py-[1px]'>
              <span style={{ color: h.profit > 0 ? '#2ecc71' : '#e74c3c', fontSize: '10px' }}>{h.result.toFixed(2)}x/{h.target}x</span>
              <span style={{ color: h.profit > 0 ? '#ffd700' : '#e74c3c', fontSize: '10px' }}>{h.profit > 0 ? `+$${h.profit}` : `-$${Math.abs(h.profit)}`}</span>
            </div>))}
          </div>
        </div>
      </div>
    </div>
  )
}
export default Limbo
