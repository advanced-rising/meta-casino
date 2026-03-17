import React, { useState, useEffect, useRef } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { getMoney, addMoney, subtractMoney } from '@/utils/money'

const BET_OPTIONS = [100, 500, 1000, 2000]

const SEGMENTS = [
  { label: 'x1', mult: 1, color: '#e74c3c' },
  { label: 'x2', mult: 2, color: '#3498db' },
  { label: 'x1', mult: 1, color: '#e74c3c' },
  { label: 'x3', mult: 3, color: '#2ecc71' },
  { label: 'x1', mult: 1, color: '#e74c3c' },
  { label: 'x2', mult: 2, color: '#3498db' },
  { label: 'x1', mult: 1, color: '#e74c3c' },
  { label: 'x5', mult: 5, color: '#f39c12' },
  { label: 'x1', mult: 1, color: '#e74c3c' },
  { label: 'x2', mult: 2, color: '#3498db' },
  { label: 'x1', mult: 1, color: '#e74c3c' },
  { label: 'x10', mult: 10, color: '#9b59b6' },
  { label: 'x1', mult: 1, color: '#e74c3c' },
  { label: 'x2', mult: 2, color: '#3498db' },
  { label: 'x1', mult: 1, color: '#e74c3c' },
  { label: 'x20', mult: 20, color: '#ffd700' },
]

const FortuneWheel = ({ onMoneyChange }: { onMoneyChange?: (m: number) => void }) => {
  const [money, setMoneyLocal] = useState(0)
  const [bet, setBet] = useState(100)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<{ label: string; mult: number } | null>(null)
  const [winAmount, setWinAmount] = useState(0)
  const [history, setHistory] = useState<{ label: string; profit: number }[]>([])
  const controls = useAnimation()
  const currentAngle = useRef(0)

  const setMoney = (v: number) => { setMoneyLocal(v); onMoneyChange?.(v) }
  useEffect(() => { const m = getMoney(); setMoneyLocal(m); onMoneyChange?.(m) }, [])

  const spin = () => {
    if (spinning || money < bet) return
    setMoney(subtractMoney(bet))
    setSpinning(true); setResult(null); setWinAmount(0)

    const segIndex = Math.floor(Math.random() * SEGMENTS.length)
    const segAngle = (segIndex / SEGMENTS.length) * 360
    const spins = 5 + Math.floor(Math.random() * 3) // 5~7 바퀴
    const finalAngle = currentAngle.current + spins * 360 + segAngle

    controls.start({
      rotate: finalAngle,
      transition: { duration: 4, ease: [0.17, 0.67, 0.12, 0.99] },
    }).then(() => {
      currentAngle.current = finalAngle % 360
      const seg = SEGMENTS[segIndex]
      setResult(seg)
      const win = bet * seg.mult
      if (win > bet) {
        setMoney(addMoney(win)); setWinAmount(win)
      } else {
        setMoney(addMoney(win)); setWinAmount(win) // x1은 원금 반환
      }
      setHistory((prev) => [{ label: seg.label, profit: win - bet }, ...prev.slice(0, 29)])
      setSpinning(false)
    })
  }

  const segAngle = 360 / SEGMENTS.length
  const totalProfit = history.reduce((s, h) => s + h.profit, 0)

  return (
    <div className='h-[calc(100vh-52px)] flex overflow-hidden'>
      <div className='flex-1 flex flex-col items-center justify-center gap-[12px] px-[8px]'>
        <div className='flex flex-col items-center gap-[10px] p-[10px]'
          style={{ background: 'linear-gradient(180deg, #2a0a2a 0%, #1a0520 50%, #2a0a2a 100%)' }}>

          <span className='arcade-title neon-text' style={{ '--neon-color': '#e91e63', color: '#ffd700', fontSize: '22px', fontWeight: 900 } as any}>
            🎡 FORTUNE WHEEL
          </span>

          {/* 휠 */}
          <div className='relative w-[280px] h-[280px]'>
            {/* 포인터 */}
            <div className='absolute top-[-12px] left-1/2 -translate-x-1/2 z-10'
              style={{ width: 0, height: 0, borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: '20px solid #ffd700' }} />

            <motion.div animate={controls} className='w-[280px] h-[280px] rounded-full relative'
              style={{ border: '4px solid #c9a84c', boxShadow: '0 0 30px rgba(201,168,76,0.3)' }}>
              {SEGMENTS.map((seg, i) => {
                const startAngle = i * segAngle
                const endAngle = startAngle + segAngle
                const midAngle = ((startAngle + endAngle) / 2 - 90) * (Math.PI / 180)
                const labelR = 100
                return (
                  <div key={i}>
                    {/* 세그먼트 색상 */}
                    <div className='absolute' style={{
                      width: '100%', height: '100%', borderRadius: '50%',
                      background: `conic-gradient(from ${startAngle}deg, ${seg.color} 0deg, ${seg.color} ${segAngle}deg, transparent ${segAngle}deg)`,
                      clipPath: 'circle(50%)',
                    }} />
                    {/* 라벨 */}
                    <span className='absolute font-bold text-white' style={{
                      fontSize: '11px', left: `${140 + Math.cos(midAngle) * labelR}px`, top: `${140 + Math.sin(midAngle) * labelR}px`,
                      transform: 'translate(-50%, -50%)',
                      textShadow: '0 0 3px #000',
                    }}>{seg.label}</span>
                  </div>
                )
              })}
              {/* 중앙 */}
              <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40px] h-[40px] rounded-full'
                style={{ background: '#c9a84c', border: '3px solid #ffd700', boxShadow: '0 0 10px rgba(201,168,76,0.5)' }} />
            </motion.div>
          </div>

          {/* 결과 */}
          <div className='h-[32px] flex items-center justify-center'>
            {result && (
              <motion.span animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 0.6 }}
                className='arcade-title' style={{
                  color: winAmount > bet ? '#ffd700' : '#888',
                  fontSize: winAmount > bet ? '22px' : '16px', fontWeight: 900,
                  textShadow: winAmount > bet ? '0 0 10px rgba(255,215,0,0.5)' : 'none',
                }}>
                {result.label} → ${winAmount.toLocaleString()}
              </motion.span>
            )}
          </div>

          {!spinning && (
            <div className='flex items-center gap-[6px]'>
              <span className='arcade-title' style={{ color: '#c9a84c', fontSize: '10px' }}>BET</span>
              {BET_OPTIONS.map((v) => (
                <button key={v} onClick={() => setBet(v)}
                  className='arcade-btn px-[10px] py-[4px] rounded-[4px] text-[11px] font-bold'
                  style={{ background: bet === v ? '#c9a84c' : '#2a0a2a', color: bet === v ? '#000' : '#666',
                    border: bet === v ? '2px solid #ffd700' : '1px solid #4a2a4a' }}>
                  ${v >= 1000 ? `${v / 1000}K` : v}
                </button>
              ))}
              <input type='number' min={1} value={bet} onChange={(e) => { const v = parseInt(e.target.value) || 0; if (v >= 0) setBet(v) }}
                className='w-[70px] h-[26px] rounded-[4px] text-[11px] text-center font-bold outline-none'
                style={{ background: '#1a0520', color: '#ffd700', border: '1px solid #c9a84c' }} />
            </div>
          )}

          <button onClick={spin} disabled={spinning || money < bet}
            className='arcade-btn w-[180px] h-[46px] rounded-full text-[16px] font-bold disabled:opacity-30'
            style={{ background: spinning ? '#333' : 'linear-gradient(180deg, #e91e63, #c2185b)', color: 'white', border: '3px solid #c9a84c' }}>
            {spinning ? '🎡...' : '🎡 SPIN'}
          </button>

          <div className='arcade-title text-[11px]' style={{ color: '#888' }}>
            BAL <span style={{ color: '#4ade80', fontWeight: 700, fontSize: '14px' }}>${money.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className='hidden lg:flex flex-col w-[240px] overflow-y-auto py-[12px] px-[10px] gap-[10px]'
        style={{ background: '#1a0520', borderLeft: '2px solid #c9a84c33' }}>
        <div className='arcade-box p-[10px]' style={{ background: '#2a0a2a' }}>
          <div className='arcade-title text-[10px] mb-[6px]' style={{ color: '#c9a84c' }}>PRIZES</div>
          {Array.from(new Map(SEGMENTS.map((s) => [s.label, s])).values()).sort((a, b) => a.mult - b.mult).map((s) => (
            <div key={s.label} className='flex justify-between text-[11px] mb-[1px]'>
              <div className='flex items-center gap-[4px]'>
                <div className='w-[10px] h-[10px] rounded-[2px]' style={{ background: s.color }} />
                <span style={{ color: '#fff' }}>{s.label}</span>
              </div>
              <span style={{ color: '#c9a84c' }}>{SEGMENTS.filter((x) => x.label === s.label).length}/{SEGMENTS.length}</span>
            </div>
          ))}
        </div>
        <div className='arcade-box p-[10px]' style={{ background: '#2a0a2a' }}>
          <div className='arcade-title text-[10px] mb-[6px]' style={{ color: '#c9a84c' }}>STATS</div>
          {[
            ['SPINS', history.length, '#fff'],
            ['PROFIT', `${totalProfit >= 0 ? '+' : ''}$${totalProfit.toLocaleString()}`, totalProfit >= 0 ? '#ffd700' : '#e74c3c'],
          ].map(([l, v, c]) => (
            <div key={l as string} className='flex justify-between text-[11px] mb-[2px]'>
              <span style={{ color: '#888' }}>{l}</span><span style={{ color: c as string }}>{v}</span>
            </div>
          ))}
        </div>
        <div className='arcade-box p-[10px] flex-1' style={{ background: '#2a0a2a' }}>
          <div className='arcade-title text-[10px] mb-[6px]' style={{ color: '#c9a84c' }}>HISTORY</div>
          <div className='flex flex-col gap-[2px] max-h-[300px] overflow-y-auto'>
            {history.map((h, i) => (
              <div key={i} className='flex justify-between px-[4px] py-[2px] rounded-[2px]'
                style={{ background: h.profit > 0 ? '#1a2a1a' : 'transparent' }}>
                <span style={{ color: '#888', fontSize: '10px' }}>{h.label}</span>
                <span className='arcade-title' style={{ color: h.profit > 0 ? '#ffd700' : '#e74c3c', fontSize: '10px' }}>
                  {h.profit > 0 ? `+$${h.profit}` : h.profit === 0 ? '$0' : `-$${Math.abs(h.profit)}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FortuneWheel
