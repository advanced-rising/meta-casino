import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getMoney, addMoney, subtractMoney } from '@/utils/money'
import { loadHistory, saveHistory } from '@/utils/gameHistory'
const BET_OPTIONS = [100, 500, 1000, 2000]
const TOTAL = 40
const DRAW_COUNT = 10
// 배당표: [선택 수][적중 수] = 배율
const PAYOUT_TABLE: Record<number, Record<number, number>> = {
  1: { 1: 3 },
  2: { 1: 1, 2: 6 },
  3: { 2: 2, 3: 16 },
  4: { 2: 1, 3: 5, 4: 30 },
  5: { 2: 1, 3: 3, 4: 12, 5: 60 },
  6: { 3: 2, 4: 5, 5: 25, 6: 100 },
  7: { 3: 1, 4: 3, 5: 12, 6: 50, 7: 200 },
  8: { 4: 2, 5: 8, 6: 30, 7: 100, 8: 500 },
  9: { 4: 1, 5: 5, 6: 20, 7: 80, 8: 250, 9: 1000 },
  10: { 4: 1, 5: 3, 6: 10, 7: 40, 8: 200, 9: 500, 10: 2000 },
}
const getPayoutMult = (pickCount: number, hits: number): number => {
  return PAYOUT_TABLE[pickCount]?.[hits] || 0
}

const Keno = ({ onMoneyChange }: { onMoneyChange?: (m: number) => void }) => {
  const [money, setMoneyLocal] = useState(0)
  const [bet, setBet] = useState(100)
  const [picks, setPicks] = useState<Set<number>>(new Set())
  const [drawn, setDrawn] = useState<Set<number>>(new Set())
  const [playing, setPlaying] = useState(false)
  const [result, setResult] = useState<{ hits: number; win: number } | null>(null)
  const [history, setHistory] = useState<{ hits: number; profit: number }[]>(() => loadHistory('keno'))
  const setMoney = (v: number) => { setMoneyLocal(v); onMoneyChange?.(v) }
  useEffect(() => { const m = getMoney(); setMoneyLocal(m); onMoneyChange?.(m) }, [])
  useEffect(() => { saveHistory('keno', history) }, [history])

  const toggle = (n: number) => {
    if (playing) return
    const p = new Set(picks)
    if (p.has(n)) p.delete(n); else if (p.size < 10) p.add(n)
    setPicks(p)
  }

  const play = () => {
    if (picks.size === 0 || money < bet) return
    setMoney(subtractMoney(bet)); setPlaying(true); setResult(null); setDrawn(new Set())
    const nums = new Set<number>()
    while (nums.size < DRAW_COUNT) nums.add(Math.floor(Math.random() * TOTAL) + 1)
    let i = 0; const arr = Array.from(nums)
    const interval = setInterval(() => {
      setDrawn(new Set(arr.slice(0, i + 1)))
      i++
      if (i >= DRAW_COUNT) {
        clearInterval(interval)
        const hits = arr.filter(n => picks.has(n)).length
        const mult = getPayoutMult(picks.size, hits)
        const win = bet * mult
        if (win > 0) setMoney(addMoney(win))
        else setMoney(getMoney())
        setResult({ hits, win })
        setHistory(prev => [{ hits, profit: win > 0 ? win - bet : -bet }, ...prev.slice(0, 29)])
        setPlaying(false)
      }
    }, 200)
  }

  return (
    <div className='h-[calc(100vh-80px)] sm:h-[calc(100vh-102px)] flex overflow-hidden'>
      <div className='flex-1 flex flex-col items-center justify-center gap-[8px] overflow-y-auto py-[8px] px-[8px]'>
        <div className='flex flex-col items-center gap-[8px] p-[8px]'>
          <span className='text-[18px] font-bold' style={{ color: '#fff' }}>🎱 KENO</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, minmax(28px, 36px))', gap: '3px' }}>
            {Array.from({ length: TOTAL }, (_, i) => i + 1).map(n => {
              const picked = picks.has(n); const hit = drawn.has(n); const isHit = picked && hit
              return (
                <button key={n} onClick={() => toggle(n)} disabled={playing}
                  className='h-[36px] rounded-[6px] text-[12px] font-bold transition-all'
                  style={{
                    background: isHit ? '#22c55e' : hit ? '#ef4444' : picked ? '#3b82f6' : 'rgba(255,255,255,0.06)',
                    color: isHit || hit || picked ? '#fff' : '#666',
                    border: picked ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.06)',
                  }}>{n}</button>
              )
            })}
          </div>
          <div className='text-[11px]' style={{ color: '#888' }}>선택: {picks.size}/10</div>
          <div className='h-[24px] flex items-center'>
            {result && <motion.span animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: 3, duration: 0.3 }}
              className='text-[16px] font-bold' style={{ color: result.win > 0 ? '#22c55e' : '#ef4444' }}>
              {result.hits}개 적중! {result.win > 0 ? `+$${result.win.toLocaleString()}` : 'MISS'}
            </motion.span>}
          </div>
          {!playing && (
            <div className='flex items-center gap-[6px] flex-wrap justify-center'>
              {BET_OPTIONS.map(v => (<button key={v} onClick={() => setBet(v)} className='arcade-btn px-[6px] py-[3px] rounded-[6px] text-[10px] font-bold'
                style={{ background: bet === v ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.04)', color: bet === v ? '#fff' : '#666' }}>${v >= 1000 ? `${v/1000}K` : v}</button>))}
              <input type='number' min={1} value={bet} onChange={e => { const v = parseInt(e.target.value) || 0; if (v > 0) setBet(v) }}
                className='w-[50px] h-[22px] rounded-[8px] text-[10px] text-center font-bold outline-none' style={{ background: 'rgba(255,255,255,0.06)', color: '#fff', border: 'none' }} />
            </div>
          )}
          <button onClick={play} disabled={playing || picks.size === 0 || money < bet}
            className='arcade-btn w-full max-w-[160px] h-[36px] rounded-[12px] text-[14px] font-bold disabled:opacity-30'
            style={{ background: '#3b82f6', color: 'white' }}>{playing ? 'DRAWING...' : 'DRAW'}</button>
          <div className='text-[11px]' style={{ color: '#888' }}>$ <span style={{ color: '#22c55e' }}>{money.toLocaleString()}</span></div>
        </div>
      </div>
      <div className='hidden lg:flex flex-col w-[200px] overflow-y-auto py-[12px] px-[10px] gap-[10px]' style={{ background: 'rgba(0,0,0,0.3)', borderLeft: '1px solid rgba(255,255,255,0.04)' }}>
        <div className='glass p-[10px]'><div className='text-[10px] font-semibold mb-[4px]' style={{ color: '#fff' }}>배당표 ({picks.size}선택)</div>
          {picks.size > 0 && PAYOUT_TABLE[picks.size] ? Object.entries(PAYOUT_TABLE[picks.size]).map(([k,v]) => (<div key={k} className='flex justify-between text-[10px]'><span style={{ color: '#888' }}>{k}적중</span><span style={{ color: '#22c55e' }}>x{v}</span></div>)) : <span style={{ color: '#666', fontSize: '10px' }}>숫자를 선택하세요</span>}
        </div>
        <div className='glass p-[10px] flex-1'><div className='text-[10px] font-semibold mb-[4px]' style={{ color: '#fff' }}>기록</div>
          {history.map((h, i) => (<div key={i} className='flex justify-between text-[10px]'><span style={{ color: '#888' }}>{h.hits}hits</span><span style={{ color: h.profit > 0 ? '#22c55e' : '#ef4444' }}>{h.profit > 0 ? `+$${h.profit}` : `-$${Math.abs(h.profit)}`}</span></div>))}
        </div>
      </div>
    </div>
  )
}
export default Keno
