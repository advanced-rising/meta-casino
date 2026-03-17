import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getMoney, addMoney, subtractMoney } from '@/utils/money'

const WIRE_COLORS = ['🔴', '🔵', '🟢', '🟡', '🟣']
const BET_OPTIONS = [100, 500, 1000, 2000]
const MAX_WIRES = 5
const MULTIPLIERS = [1.5, 2.5, 4, 7, 15]

const BombDefuse = ({ onMoneyChange }: { onMoneyChange?: (m: number) => void }) => {
  const [money, setMoneyLocal] = useState(0)
  const [bet, setBet] = useState(100)
  const [playing, setPlaying] = useState(false)
  const [bombWire, setBombWire] = useState(0)
  const [cut, setCut] = useState<Record<number, boolean>>({})
  const [cutCount, setCutCount] = useState(0)
  const [exploded, setExploded] = useState(false)
  const [result, setResult] = useState<'win' | 'lose' | null>(null)
  const [history, setHistory] = useState<{ cuts: number; profit: number }[]>([])

  const setMoney = (v: number) => { setMoneyLocal(v); onMoneyChange?.(v) }
  useEffect(() => { const m = getMoney(); setMoneyLocal(m); onMoneyChange?.(m) }, [])

  const start = () => {
    if (money < bet) return
    setMoney(subtractMoney(bet))
    setBombWire(Math.floor(Math.random() * MAX_WIRES))
    setCut({}); setCutCount(0); setExploded(false); setResult(null); setPlaying(true)
  }

  const cutWire = (idx: number) => {
    if (!playing || cut[idx]) return
    if (idx === bombWire) {
      setCut({ ...cut, [idx]: true }); setExploded(true); setResult('lose'); setPlaying(false)
      setHistory((prev) => [{ cuts: cutCount, profit: -bet }, ...prev.slice(0, 29)])
      setMoney(getMoney())
    } else {
      const newCut = { ...cut, [idx]: true }; const newCount = cutCount + 1
      setCut(newCut); setCutCount(newCount)
      if (newCount >= MAX_WIRES - 1) {
        const win = Math.floor(bet * MULTIPLIERS[MAX_WIRES - 2])
        setMoney(addMoney(win)); setResult('win'); setPlaying(false)
        setHistory((prev) => [{ cuts: newCount, profit: win - bet }, ...prev.slice(0, 29)])
      }
    }
  }

  const cashOut = () => {
    if (!playing || cutCount === 0) return
    const win = Math.floor(bet * MULTIPLIERS[cutCount - 1])
    setMoney(addMoney(win)); setResult('win'); setPlaying(false)
    setHistory((prev) => [{ cuts: cutCount, profit: win - bet }, ...prev.slice(0, 29)])
  }

  const currentMult = cutCount > 0 ? MULTIPLIERS[cutCount - 1] : 1
  const totalProfit = history.reduce((s, h) => s + h.profit, 0)

  return (
    <div className='h-[calc(100vh-102px)] flex overflow-hidden'>
      <div className='flex-1 flex flex-col items-center justify-center gap-[12px] px-[8px]'>
        <div className='flex flex-col items-center gap-[12px] p-[12px]'>
          <span className='arcade-title neon-text' style={{ '--neon-color': '#e74c3c', color: '#ffd700', fontSize: '20px', fontWeight: 900 } as any}>💣 BOMB DEFUSE</span>

          {/* 폭탄 */}
          <motion.div animate={exploded ? { rotate: [0, 5, -5, 5, 0], scale: [1, 1.2, 0.8, 1] } : {}} transition={{ duration: 0.3 }}
            className='text-[60px]'>{exploded ? '💥' : '💣'}</motion.div>

          {/* 전선 */}
          <div className='flex gap-[8px]'>
            {WIRE_COLORS.map((color, i) => (
              <motion.button key={i} onClick={() => cutWire(i)} disabled={!playing || !!cut[i]}
                whileHover={playing && !cut[i] ? { scale: 1.1 } : {}}
                className='w-[50px] h-[70px] rounded-[8px] flex flex-col items-center justify-center gap-[4px] text-[24px] disabled:cursor-default'
                style={{
                  background: cut[i] ? (i === bombWire ? '#e74c3c22' : '#2ecc7122') : '#ffffff0a',
                  border: cut[i] ? `2px solid ${i === bombWire ? '#e74c3c' : '#2ecc71'}` : '1px solid #ffffff11',
                  opacity: cut[i] ? 0.6 : 1,
                  textDecoration: cut[i] ? 'line-through' : 'none',
                }}>
                {color}
                {cut[i] && <span className='text-[12px]'>{i === bombWire ? '💀' : '✅'}</span>}
              </motion.button>
            ))}
          </div>

          <div className='h-[26px] flex items-center justify-center'>
            {playing && cutCount > 0 && <span className='arcade-title' style={{ color: '#4ade80', fontSize: '14px' }}>x{currentMult} → ${Math.floor(bet * currentMult).toLocaleString()}</span>}
            {result === 'win' && <motion.span animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: 3, duration: 0.3 }} className='arcade-title' style={{ color: '#ffd700', fontSize: '18px', fontWeight: 900 }}>🎉 +${Math.floor(bet * currentMult - bet).toLocaleString()}</motion.span>}
            {result === 'lose' && <span className='arcade-title' style={{ color: '#e74c3c', fontSize: '16px' }}>💥 BOOM!</span>}
          </div>

          {playing && cutCount > 0 ? (
            <button onClick={cashOut} className='arcade-btn px-[20px] py-[8px] rounded-full text-[14px] font-bold'
              >💰 CASH OUT x{currentMult}</button>
          ) : !playing ? (
            <>
              <div className='flex items-center gap-[6px] flex-wrap justify-center'>
                {BET_OPTIONS.map((v) => (<button key={v} onClick={() => setBet(v)} className='arcade-btn px-[10px] py-[4px] rounded-[4px] text-[11px] font-bold'
                  style={{ background: bet === v ? '#c9a84c' : '#2a0a0a', color: bet === v ? '#000' : '#666' }}>${v >= 1000 ? `${v / 1000}K` : v}</button>))}
                <input type='number' min={1} value={bet} onChange={(e) => { const v = parseInt(e.target.value) || 0; if (v >= 0) setBet(v) }}
                  className='w-[60px] h-[24px] rounded-[4px] text-[10px] text-center font-bold outline-none' style={{ background: '#1a0505', color: '#ffd700', border: '1px solid #c9a84c' }} />
              </div>
              <button onClick={start} disabled={money < bet} className='arcade-btn w-full max-w-[160px] h-[40px] rounded-full text-[14px] font-bold disabled:opacity-30'
                >START</button>
            </>
          ) : null}

          <div className='arcade-title text-[11px]' style={{ color: '#888' }}>BAL <span style={{ color: '#4ade80', fontWeight: 700 }}>${money.toLocaleString()}</span></div>
        </div>
      </div>
      <div className='hidden lg:flex flex-col w-[200px] overflow-y-auto py-[12px] px-[10px] gap-[10px]' style={{ background: '#1a0505', borderLeft: '1px solid #c9a84c22' }}>
        <div className='rounded-[8px] p-[10px]' style={{ background: '#2a0a0a' }}>
          <div className='arcade-title text-[10px] mb-[4px]' style={{ color: '#c9a84c' }}>PAYOUTS</div>
          {MULTIPLIERS.map((m, i) => (<div key={i} className='flex justify-between text-[10px] mb-[1px]'><span style={{ color: '#888' }}>{i + 1} cuts</span><span style={{ color: '#ffd700' }}>x{m}</span></div>))}
        </div>
        <div className='rounded-[8px] p-[10px] flex-1' style={{ background: '#2a0a0a' }}>
          <div className='arcade-title text-[10px] mb-[4px]' style={{ color: '#c9a84c' }}>HISTORY</div>
          <div className='flex flex-col gap-[2px] max-h-[300px] overflow-y-auto'>
            {history.map((h, i) => (<div key={i} className='flex justify-between px-[4px] py-[1px]'>
              <span style={{ color: '#888', fontSize: '10px' }}>{h.cuts}cuts</span>
              <span style={{ color: h.profit > 0 ? '#ffd700' : '#e74c3c', fontSize: '10px' }}>{h.profit > 0 ? `+$${h.profit}` : `-$${Math.abs(h.profit)}`}</span>
            </div>))}
          </div>
        </div>
      </div>
    </div>
  )
}
export default BombDefuse
