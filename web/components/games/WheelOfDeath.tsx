import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getMoney, addMoney, subtractMoney } from '@/utils/money'
const BET_OPTIONS = [100, 500, 1000, 2000]
const CHAMBERS = 6
const MULTIPLIERS = [1.5, 2, 3, 5, 10, 25]

const WheelOfDeath = ({ onMoneyChange }: { onMoneyChange?: (m: number) => void }) => {
  const [money, setMoneyLocal] = useState(0)
  const [bet, setBet] = useState(100)
  const [playing, setPlaying] = useState(false)
  const [round, setRound] = useState(0)
  const [bullet, setBullet] = useState(0)
  const [result, setResult] = useState<'survive'|'dead'|null>(null)
  const [spinning, setSpinning] = useState(false)
  const [history, setHistory] = useState<{rounds:number;profit:number}[]>([])
  const setMoney = (v: number) => { setMoneyLocal(v); onMoneyChange?.(v) }
  useEffect(() => { const m = getMoney(); setMoneyLocal(m); onMoneyChange?.(m) }, [])

  const start = () => {
    if (money < bet) return
    setMoney(subtractMoney(bet))
    setBullet(Math.floor(Math.random() * CHAMBERS))
    setRound(0); setResult(null); setPlaying(true)
  }

  const pull = () => {
    if (!playing || spinning) return
    setSpinning(true); setResult(null)
    setTimeout(() => {
      if (round === bullet) {
        setResult('dead'); setPlaying(false)
        setHistory(prev => [{ rounds: round, profit: -bet }, ...prev.slice(0, 29)])
        setMoney(getMoney())
      } else {
        setResult('survive'); setRound(round + 1)
        if (round + 1 >= CHAMBERS - 1) {
          const win = Math.floor(bet * MULTIPLIERS[CHAMBERS - 2])
          setMoney(addMoney(win)); setPlaying(false)
          setHistory(prev => [{ rounds: CHAMBERS - 1, profit: win - bet }, ...prev.slice(0, 29)])
        }
      }
      setSpinning(false)
    }, 800)
  }

  const cashOut = () => {
    if (!playing || round === 0) return
    const win = Math.floor(bet * MULTIPLIERS[round - 1])
    setMoney(addMoney(win)); setPlaying(false)
    setHistory(prev => [{ rounds: round, profit: win - bet }, ...prev.slice(0, 29)])
  }

  const currentMult = round > 0 ? MULTIPLIERS[round - 1] : 1

  return (
    <div className='h-[calc(100vh-52px)] flex overflow-hidden'>
      <div className='flex-1 flex flex-col items-center justify-center gap-[12px] px-[8px]'>
        <span className='text-[18px] font-bold' style={{ color: '#fff' }}>🔫 WHEEL OF DEATH</span>

        {/* 실린더 */}
        <div className='flex gap-[6px]'>
          {Array.from({ length: CHAMBERS }, (_, i) => (
            <motion.div key={i} animate={spinning && i === round ? { rotate: 360 } : {}} transition={{ duration: 0.5 }}
              className='w-[40px] h-[40px] rounded-full flex items-center justify-center text-[16px]'
              style={{
                background: i < round ? '#22c55e22' : i === round && result === 'dead' ? '#ef444444' : 'rgba(255,255,255,0.06)',
                border: i === round ? '2px solid #fff' : '1px solid rgba(255,255,255,0.08)',
              }}>
              {i < round ? '✓' : i === round && result === 'dead' ? '💀' : '?'}
            </motion.div>
          ))}
        </div>

        {playing && round > 0 && <span className='text-[13px]' style={{ color: '#22c55e' }}>생존 {round}회 → x{currentMult}</span>}

        <div className='h-[24px]'>
          {result === 'survive' && <span className='text-[16px] font-bold' style={{ color: '#22c55e' }}>CLICK! 생존!</span>}
          {result === 'dead' && <motion.span initial={{ scale: 2 }} animate={{ scale: 1 }} className='text-[20px] font-bold' style={{ color: '#ef4444' }}>💀 BANG!</motion.span>}
        </div>

        {playing ? (
          <div className='flex gap-[8px]'>
            <button onClick={pull} disabled={spinning} className='arcade-btn px-[24px] py-[10px] rounded-[12px] text-[14px] font-bold disabled:opacity-30'
              style={{ background: '#ef4444', color: '#fff' }}>{spinning ? '...' : '🔫 PULL'}</button>
            {round > 0 && <button onClick={cashOut} className='arcade-btn px-[20px] py-[10px] rounded-[12px] text-[13px] font-bold'
              style={{ background: '#22c55e', color: '#fff' }}>💰 x{currentMult}</button>}
          </div>
        ) : (
          <>
            <div className='flex items-center gap-[6px]'>
              {BET_OPTIONS.map(v => (<button key={v} onClick={() => setBet(v)} className='arcade-btn px-[10px] py-[4px] rounded-[8px] text-[11px] font-bold'
                style={{ background: bet === v ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.04)', color: bet === v ? '#fff' : '#666' }}>${v >= 1000 ? `${v/1000}K` : v}</button>))}
            </div>
            <button onClick={start} disabled={money < bet} className='arcade-btn w-[160px] h-[40px] rounded-[12px] text-[14px] font-bold disabled:opacity-30'
              style={{ background: '#ef4444', color: 'white' }}>START</button>
          </>
        )}
        <div className='text-[11px]' style={{ color: '#888' }}>$ <span style={{ color: '#22c55e' }}>{money.toLocaleString()}</span></div>
      </div>
      <div className='hidden lg:flex flex-col w-[200px] overflow-y-auto py-[12px] px-[10px] gap-[10px]' style={{ background: 'rgba(0,0,0,0.3)', borderLeft: '1px solid rgba(255,255,255,0.04)' }}>
        <div className='glass p-[10px]'><div className='text-[10px] font-semibold mb-[4px]' style={{ color: '#fff' }}>배당</div>
          {MULTIPLIERS.map((m, i) => (<div key={i} className='flex justify-between text-[10px]'><span style={{ color: '#888' }}>{i+1}생존</span><span style={{ color: '#22c55e' }}>x{m}</span></div>))}
        </div>
        <div className='glass p-[10px] flex-1'><div className='text-[10px] font-semibold mb-[4px]' style={{ color: '#fff' }}>기록</div>
          {history.map((h, i) => (<div key={i} className='flex justify-between text-[10px]'><span style={{ color: '#888' }}>{h.rounds}R</span><span style={{ color: h.profit > 0 ? '#22c55e' : '#ef4444' }}>{h.profit > 0 ? `+$${h.profit}` : `-$${Math.abs(h.profit)}`}</span></div>))}
        </div>
      </div>
    </div>
  )
}
export default WheelOfDeath
