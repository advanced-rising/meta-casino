import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getMoney, addMoney, subtractMoney } from '@/utils/money'
const BET_OPTIONS = [100, 500, 1000, 2000]

const NumberGuess = ({ onMoneyChange }: { onMoneyChange?: (m: number) => void }) => {
  const [money, setMoneyLocal] = useState(0)
  const [bet, setBet] = useState(100)
  const [target, setTarget] = useState(0)
  const [guess, setGuess] = useState(50)
  const [playing, setPlaying] = useState(false)
  const [hints, setHints] = useState<string[]>([])
  const [attempts, setAttempts] = useState(0)
  const [result, setResult] = useState<'win'|null>(null)
  const [history, setHistory] = useState<{attempts:number;profit:number}[]>([])
  const setMoney = (v: number) => { setMoneyLocal(v); onMoneyChange?.(v) }
  useEffect(() => { const m = getMoney(); setMoneyLocal(m); onMoneyChange?.(m) }, [])

  const start = () => {
    if (money < bet) return
    setMoney(subtractMoney(bet))
    setTarget(Math.floor(Math.random() * 100) + 1)
    setGuess(50); setHints([]); setAttempts(0); setResult(null); setPlaying(true)
  }

  const makeGuess = () => {
    if (!playing) return
    const a = attempts + 1; setAttempts(a)
    if (guess === target) {
      const mult = a <= 3 ? 5 : a <= 5 ? 3 : a <= 7 ? 2 : 1.2
      const win = Math.floor(bet * mult)
      setMoney(addMoney(win)); setResult('win'); setPlaying(false)
      setHints(prev => [...prev, `${guess} = 정답! (${a}번, x${mult})`])
      setHistory(prev => [{ attempts: a, profit: win - bet }, ...prev.slice(0, 29)])
    } else if (a >= 10) {
      setPlaying(false); setHints(prev => [...prev, `게임 오버! 정답: ${target}`])
      setHistory(prev => [{ attempts: a, profit: -bet }, ...prev.slice(0, 29)])
      setMoney(getMoney())
    } else {
      setHints(prev => [...prev, `${guess} → ${guess < target ? '더 높아!' : '더 낮아!'}`])
    }
  }

  return (
    <div className='h-[calc(100vh-52px)] flex overflow-hidden'>
      <div className='flex-1 flex flex-col items-center justify-center gap-[12px] px-[8px]'>
        <span className='text-[18px] font-bold' style={{ color: '#fff' }}>🔢 NUMBER GUESS</span>
        <div className='text-[11px]' style={{ color: '#888' }}>1~100 숫자를 맞춰보세요 (10회 이내)</div>

        {playing && (
          <>
            <div className='flex items-center gap-[8px]'>
              <input type='range' min={1} max={100} value={guess} onChange={e => setGuess(parseInt(e.target.value))} className='w-[180px]' />
              <span className='text-[24px] font-bold w-[50px] text-center' style={{ color: '#fff' }}>{guess}</span>
            </div>
            <button onClick={makeGuess} className='arcade-btn px-[24px] py-[8px] rounded-[12px] text-[14px] font-bold'
              style={{ background: '#3b82f6', color: '#fff' }}>GUESS ({attempts}/10)</button>
          </>
        )}

        <div className='flex flex-col gap-[2px] max-h-[200px] overflow-y-auto w-[250px]'>
          {hints.map((h, i) => (<div key={i} className='text-[11px] px-[8px] py-[2px] rounded-[4px]'
            style={{ background: 'rgba(255,255,255,0.04)', color: h.includes('정답') ? '#22c55e' : h.includes('오버') ? '#ef4444' : '#fff' }}>{h}</div>))}
        </div>

        {result && <span className='text-[18px] font-bold' style={{ color: '#22c55e' }}>🎉 +${Math.floor(bet * (attempts <= 3 ? 5 : attempts <= 5 ? 3 : attempts <= 7 ? 2 : 1.2)).toLocaleString()}</span>}

        {!playing && (
          <div className='flex items-center gap-[6px]'>
            {BET_OPTIONS.map(v => (<button key={v} onClick={() => setBet(v)} className='arcade-btn px-[10px] py-[4px] rounded-[8px] text-[11px] font-bold'
              style={{ background: bet === v ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.04)', color: bet === v ? '#fff' : '#666' }}>${v >= 1000 ? `${v/1000}K` : v}</button>))}
          </div>
        )}
        {!playing && <button onClick={start} disabled={money < bet} className='arcade-btn w-[160px] h-[40px] rounded-[12px] text-[14px] font-bold disabled:opacity-30'
          style={{ background: '#a855f7', color: 'white' }}>START</button>}
        <div className='text-[11px]' style={{ color: '#888' }}>$ <span style={{ color: '#22c55e' }}>{money.toLocaleString()}</span></div>
      </div>
      <div className='hidden lg:flex flex-col w-[200px] overflow-y-auto py-[12px] px-[10px] gap-[10px]' style={{ background: 'rgba(0,0,0,0.3)', borderLeft: '1px solid rgba(255,255,255,0.04)' }}>
        <div className='glass p-[10px]'><div className='text-[10px] font-semibold mb-[4px]' style={{ color: '#fff' }}>배당</div>
          {[['1~3회', 'x5'], ['4~5회', 'x3'], ['6~7회', 'x2'], ['8~10회', 'x1.2']].map(([l, v], i) => (
            <div key={i} className='flex justify-between text-[10px]'><span style={{ color: '#888' }}>{l}</span><span style={{ color: '#22c55e' }}>{v}</span></div>))}
        </div>
        <div className='glass p-[10px] flex-1'><div className='text-[10px] font-semibold mb-[4px]' style={{ color: '#fff' }}>기록</div>
          {history.map((h, i) => (<div key={i} className='flex justify-between text-[10px]'><span style={{ color: '#888' }}>{h.attempts}회</span><span style={{ color: h.profit > 0 ? '#22c55e' : '#ef4444' }}>{h.profit > 0 ? `+$${h.profit}` : `-$${Math.abs(h.profit)}`}</span></div>))}
        </div>
      </div>
    </div>
  )
}
export default NumberGuess
