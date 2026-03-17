import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { getMoney, addMoney, subtractMoney } from '@/utils/money'

const BET_OPTIONS = [100, 500, 1000, 2000]

const Crash = ({ onMoneyChange }: { onMoneyChange?: (m: number) => void }) => {
  const [money, setMoneyLocal] = useState(0)
  const [bet, setBet] = useState(100)
  const [playing, setPlaying] = useState(false)
  const [multiplier, setMultiplier] = useState(1.0)
  const [crashed, setCrashed] = useState(false)
  const [cashedOut, setCashedOut] = useState(false)
  const [cashOutMult, setCashOutMult] = useState(1.0)
  const [crashPoint, setCrashPoint] = useState(1.0)
  const [history, setHistory] = useState<{ mult: number; won: boolean; profit: number }[]>([])
  const [autoCashOut, setAutoCashOut] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const multiplierRef = useRef(1.0)

  const setMoney = (v: number) => { setMoneyLocal(v); onMoneyChange?.(v) }
  useEffect(() => { const m = getMoney(); setMoneyLocal(m); onMoneyChange?.(m) }, [])

  const generateCrashPoint = () => {
    const r = Math.random()
    if (r < 0.03) return 1.0
    return Math.max(1.0, Math.floor(100 / (r * 100)) * 100) / 100
  }

  const startGame = () => {
    if (money < bet || playing) return
    setMoney(subtractMoney(bet))
    const cp = generateCrashPoint()
    setCrashPoint(cp); setMultiplier(1.0); multiplierRef.current = 1.0
    setCrashed(false); setCashedOut(false); setCashOutMult(1.0); setPlaying(true)

    intervalRef.current = setInterval(() => {
      multiplierRef.current += 0.01 + multiplierRef.current * 0.005
      multiplierRef.current = Math.round(multiplierRef.current * 100) / 100
      setMultiplier(multiplierRef.current)
      if (autoCashOut > 0 && multiplierRef.current >= autoCashOut) { doCashOut(); return }
      if (multiplierRef.current >= cp) {
        clearInterval(intervalRef.current!)
        setCrashed(true); setPlaying(false); setMultiplier(cp); setMoney(getMoney())
        setHistory((prev) => [{ mult: cp, won: false, profit: -bet }, ...prev.slice(0, 29)])
      }
    }, 50)
  }

  const doCashOut = useCallback(() => {
    if (!playing || cashedOut || crashed) return
    if (intervalRef.current) clearInterval(intervalRef.current)
    const m = multiplierRef.current
    const winAmount = Math.floor(bet * m)
    setCashedOut(true); setCashOutMult(m); setPlaying(false)
    setMoney(addMoney(winAmount))
    setHistory((prev) => [{ mult: m, won: true, profit: winAmount - bet }, ...prev.slice(0, 29)])
  }, [playing, cashedOut, crashed, bet])

  useEffect(() => { return () => { if (intervalRef.current) clearInterval(intervalRef.current) } }, [])

  const graphHeight = Math.min(280, (multiplier - 1) * 60)
  const graphColor = crashed ? '#e74c3c' : cashedOut ? '#2ecc71' : '#3498db'

  // 통계
  const totalGames = history.length
  const wins = history.filter((h) => h.won).length
  const totalProfit = history.reduce((s, h) => s + h.profit, 0)
  const bestMult = history.length > 0 ? Math.max(...history.filter((h) => h.won).map((h) => h.mult), 0) : 0

  return (
    <div className='h-[calc(100vh-102px)] flex overflow-hidden'>
      {/* 좌측: 게임 */}
      <div className='flex-1 flex flex-col items-center justify-center gap-[10px] overflow-y-auto py-[12px] px-[8px]'>
        <div className='flex flex-col items-center gap-[10px] p-[10px]'
          >

          <span className='arcade-title neon-text' style={{ '--neon-color': '#e74c3c', color: '#ffd700', fontSize: '22px', fontWeight: 900 } as any}>
            🚀 CRASH
          </span>

          {/* 그래프 */}
          <div className='relative w-full max-w-[340px] h-[240px] sm:h-[280px] rounded-[10px] overflow-hidden flex items-end justify-center'
            style={{ background: '#0a0a0a', border: '2px solid #333' }}>
            <motion.div animate={{ height: graphHeight }} transition={{ duration: 0.05 }}
              className='w-[180px] rounded-t-[6px]'
              style={{ background: `linear-gradient(180deg, ${graphColor}, ${graphColor}44)`, boxShadow: `0 0 30px ${graphColor}44` }} />

            <div className='absolute inset-0 flex items-center justify-center'>
              <motion.span key={crashed ? 'c' : 'l'}
                initial={crashed ? { scale: 3, opacity: 0 } : {}} animate={crashed ? { scale: 1, opacity: 1 } : {}}
                className='arcade-title'
                style={{ fontSize: crashed || cashedOut ? '44px' : '52px', fontWeight: 900,
                  color: crashed ? '#e74c3c' : cashedOut ? '#2ecc71' : '#fff',
                  textShadow: `0 0 30px ${graphColor}88` }}>
                {multiplier.toFixed(2)}x
              </motion.span>
            </div>

            {crashed && (
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                className='absolute bottom-[16px] text-center'>
                <span className='arcade-title' style={{ color: '#e74c3c', fontSize: '18px' }}>CRASHED!</span>
              </motion.div>
            )}
            {cashedOut && (
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                className='absolute bottom-[16px] text-center'>
                <span className='arcade-title' style={{ color: '#ffd700', fontSize: '16px' }}>
                  +${Math.floor(bet * cashOutMult).toLocaleString()}
                </span>
              </motion.div>
            )}
            {!playing && !crashed && !cashedOut && (
              <div className='absolute inset-0 flex items-center justify-center'>
                <span className='arcade-title' style={{ color: '#333', fontSize: '14px' }}>PRESS START</span>
              </div>
            )}
          </div>

          {/* 최근 결과 (인라인) */}
          <div className='flex gap-[3px] flex-wrap justify-center max-w-[340px] lg:hidden'>
            {history.slice(0, 10).map((h, i) => (
              <span key={i} className='arcade-title px-[5px] py-[1px] rounded-[3px] text-[9px]'
                style={{ background: h.won ? '#2ecc7122' : h.mult < 1.5 ? '#e74c3c22' : '#22222244',
                  color: h.won ? '#2ecc71' : h.mult < 1.5 ? '#e74c3c' : '#555' }}>
                {h.mult.toFixed(2)}x
              </span>
            ))}
          </div>

          {/* 컨트롤 */}
          {!playing && (
            <>
              <div className='flex items-center gap-[6px] flex-wrap justify-center'>
                <span className='arcade-title' style={{ color: '#c9a84c', fontSize: '10px' }}>BET</span>
                {BET_OPTIONS.map((v) => (
                  <button key={v} onClick={() => setBet(v)}
                    className='arcade-btn px-[10px] py-[4px] rounded-[4px] text-[11px] font-bold'
                    style={{ background: bet === v ? '#c9a84c' : '#1a1a1a', color: bet === v ? '#000' : '#666',
                      border: bet === v ? '2px solid #ffd700' : '1px solid #333' }}>
                    ${v >= 1000 ? `${v / 1000}K` : v}
                  </button>
                ))}
                <input type='number' min={1} value={bet}
                  onChange={(e) => { const v = parseInt(e.target.value) || 0; if (v >= 0) setBet(v) }}
                  className='w-[70px] h-[26px] rounded-[4px] text-[11px] text-center font-bold outline-none'
                  style={{ background: '#111', color: '#ffd700', border: '1px solid #c9a84c' }} />
              </div>
              <div className='flex items-center gap-[6px] flex-wrap justify-center'>
                <span className='arcade-title' style={{ color: '#c9a84c', fontSize: '10px' }}>AUTO</span>
                {[0, 1.5, 2, 3, 5, 10].map((v) => (
                  <button key={v} onClick={() => setAutoCashOut(v)}
                    className='arcade-btn px-[8px] py-[4px] rounded-[4px] text-[10px] font-bold'
                    style={{ background: autoCashOut === v ? '#2ecc71' : '#1a1a1a', color: autoCashOut === v ? '#fff' : '#666',
                      border: autoCashOut === v ? '2px solid #2ecc71' : '1px solid #333' }}>
                    {v === 0 ? 'OFF' : `${v}x`}
                  </button>
                ))}
              </div>
            </>
          )}

          <div className='flex items-center gap-[10px]'>
            {!playing ? (
              <button onClick={startGame} disabled={money < bet}
                className='arcade-btn w-full max-w-full max-w-[180px] h-[44px] rounded-full text-[16px] font-bold disabled:opacity-30'
                >
                🚀 START
              </button>
            ) : (
              <button onClick={doCashOut}
                className='arcade-btn w-full max-w-full max-w-[180px] h-[44px] rounded-full text-[16px] font-bold'
                style={{ background: 'linear-gradient(180deg, #f39c12, #d68910)', color: 'white', border: '3px solid #c9a84c',
                  boxShadow: '0 0 20px rgba(243,156,18,0.5)', animation: 'winPulse 0.4s ease infinite' }}>
                💰 x{multiplier.toFixed(2)}
              </button>
            )}
          </div>

          <div className='arcade-title text-[11px]' style={{ color: '#888' }}>
            BAL <span style={{ color: '#4ade80', fontWeight: 700, fontSize: '14px' }}>${money.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 우측: 정보 패널 (데스크탑) */}
      <div className='hidden lg:flex flex-col w-[280px] overflow-y-auto py-[12px] px-[10px] gap-[10px]'
        style={{ background: '#0d0505', borderLeft: '2px solid #c9a84c33' }}>

        <div className='arcade-box p-[10px]' style={{ background: '#1a0a0a' }}>
          <div className='arcade-title text-[10px] mb-[6px]' style={{ color: '#c9a84c' }}>STATS</div>
          <div className='flex justify-between text-[11px] mb-[2px]'>
            <span style={{ color: '#888' }}>GAMES</span><span style={{ color: '#fff' }}>{totalGames}</span>
          </div>
          <div className='flex justify-between text-[11px] mb-[2px]'>
            <span style={{ color: '#888' }}>WINS</span><span style={{ color: '#2ecc71' }}>{wins}</span>
          </div>
          <div className='flex justify-between text-[11px] mb-[2px]'>
            <span style={{ color: '#888' }}>WIN RATE</span>
            <span style={{ color: '#fff' }}>{totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0}%</span>
          </div>
          <div className='flex justify-between text-[11px] mb-[2px]'>
            <span style={{ color: '#888' }}>BEST</span>
            <span style={{ color: '#ffd700' }}>{bestMult > 0 ? `${bestMult.toFixed(2)}x` : '-'}</span>
          </div>
          <div className='flex justify-between text-[11px]'>
            <span style={{ color: '#888' }}>PROFIT</span>
            <span style={{ color: totalProfit >= 0 ? '#ffd700' : '#e74c3c' }}>
              {totalProfit >= 0 ? '+' : ''}${totalProfit.toLocaleString()}
            </span>
          </div>
        </div>

        <div className='arcade-box p-[10px]' style={{ background: '#1a0a0a' }}>
          <div className='arcade-title text-[10px] mb-[6px]' style={{ color: '#c9a84c' }}>MULTIPLIER TIERS</div>
          {[{ label: '1.5x+', color: '#888' }, { label: '2x+', color: '#3498db' }, { label: '5x+', color: '#2ecc71' }, { label: '10x+', color: '#f39c12' }, { label: '50x+', color: '#e74c3c' }, { label: '100x+', color: '#ffd700' }].map(({ label, color }) => (
            <div key={label} className='flex justify-between text-[10px] mb-[1px]'>
              <span style={{ color }}>{label}</span>
              <span style={{ color: '#666' }}>
                {history.filter((h) => h.won && h.mult >= parseFloat(label)).length}회
              </span>
            </div>
          ))}
        </div>

        <div className='arcade-box p-[10px] flex-1' style={{ background: '#1a0a0a' }}>
          <div className='arcade-title text-[10px] mb-[6px]' style={{ color: '#c9a84c' }}>HISTORY</div>
          <div className='flex flex-col gap-[2px] max-h-[300px] overflow-y-auto'>
            {history.length === 0 && <span style={{ color: '#333', fontSize: '10px' }}>No games yet</span>}
            {history.map((h, i) => (
              <div key={i} className='flex items-center justify-between px-[4px] py-[2px] rounded-[2px]'
                style={{ background: h.won ? '#1a3a1a' : '#2a0a0a' }}>
                <div className='flex items-center gap-[6px] flex-wrap justify-center'>
                  <span style={{ color: '#444', fontSize: '9px' }}>#{i + 1}</span>
                  <span className='arcade-title' style={{ color: h.won ? '#2ecc71' : '#e74c3c', fontSize: '11px' }}>
                    {h.mult.toFixed(2)}x
                  </span>
                </div>
                <span style={{ color: h.profit >= 0 ? '#ffd700' : '#e74c3c', fontSize: '10px', fontWeight: 700 }}>
                  {h.profit >= 0 ? '+' : ''}${h.profit.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Crash
