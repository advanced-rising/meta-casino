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
  const [history, setHistory] = useState<{ mult: number; won: boolean }[]>([])
  const [autoCashOut, setAutoCashOut] = useState(0) // 0 = off
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const multiplierRef = useRef(1.0)

  const setMoney = (v: number) => { setMoneyLocal(v); onMoneyChange?.(v) }
  useEffect(() => { const m = getMoney(); setMoneyLocal(m); onMoneyChange?.(m) }, [])

  // 크래시 포인트 생성 (하우스 엣지 3%)
  const generateCrashPoint = () => {
    const r = Math.random()
    if (r < 0.03) return 1.0 // 3% 즉사
    return Math.max(1.0, Math.floor(100 / (r * 100)) * 100) / 100
  }

  const startGame = () => {
    if (money < bet || playing) return
    setMoney(subtractMoney(bet))

    const cp = generateCrashPoint()
    setCrashPoint(cp)
    setMultiplier(1.0)
    multiplierRef.current = 1.0
    setCrashed(false)
    setCashedOut(false)
    setCashOutMult(1.0)
    setPlaying(true)

    // 배수 증가
    intervalRef.current = setInterval(() => {
      multiplierRef.current += 0.01 + multiplierRef.current * 0.005
      multiplierRef.current = Math.round(multiplierRef.current * 100) / 100

      setMultiplier(multiplierRef.current)

      // 자동 캐시아웃 체크
      if (autoCashOut > 0 && multiplierRef.current >= autoCashOut) {
        doCashOut()
        return
      }

      // 크래시!
      if (multiplierRef.current >= cp) {
        clearInterval(intervalRef.current!)
        setCrashed(true)
        setPlaying(false)
        setMultiplier(cp)
        setMoney(getMoney())
        setHistory((prev) => [{ mult: cp, won: false }, ...prev.slice(0, 19)])
      }
    }, 50)
  }

  const doCashOut = useCallback(() => {
    if (!playing || cashedOut || crashed) return
    if (intervalRef.current) clearInterval(intervalRef.current)

    const m = multiplierRef.current
    const winAmount = Math.floor(bet * m)
    setCashedOut(true)
    setCashOutMult(m)
    setPlaying(false)
    setMoney(addMoney(winAmount))
    setHistory((prev) => [{ mult: m, won: true }, ...prev.slice(0, 19)])
  }, [playing, cashedOut, crashed, bet])

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  // 그래프 높이 (최대 300px)
  const graphHeight = Math.min(300, (multiplier - 1) * 60)
  const graphColor = crashed ? '#e74c3c' : cashedOut ? '#2ecc71' : '#3498db'

  return (
    <div className='h-[calc(100vh-52px)] flex flex-col items-center justify-center gap-[14px]'>
      <div className='rounded-[20px] p-[24px] flex flex-col items-center gap-[12px]'
        style={{
          background: 'linear-gradient(180deg, #1a0a0a 0%, #0d0505 50%, #1a0a0a 100%)',
          border: '4px solid #c9a84c',
          boxShadow: '0 0 60px rgba(201,168,76,0.1), inset 0 0 40px rgba(0,0,0,0.5)',
          minWidth: '400px',
        }}>

        <span style={{ color: '#c9a84c', fontSize: '24px', fontWeight: 900, letterSpacing: '4px' }}>
          🚀 CRASH
        </span>

        {/* 그래프 영역 */}
        <div className='relative w-[360px] h-[300px] rounded-[12px] overflow-hidden flex items-end justify-center'
          style={{ background: '#0a0a0a', border: '2px solid #333' }}>

          {/* 배수 그래프 바 */}
          <motion.div
            animate={{ height: graphHeight }}
            transition={{ duration: 0.05 }}
            className='w-[200px] rounded-t-[8px]'
            style={{
              background: `linear-gradient(180deg, ${graphColor}, ${graphColor}44)`,
              boxShadow: `0 0 30px ${graphColor}44`,
            }}
          />

          {/* 배수 표시 */}
          <div className='absolute inset-0 flex items-center justify-center'>
            <motion.span
              key={crashed ? 'crashed' : 'live'}
              initial={crashed ? { scale: 3, opacity: 0 } : {}}
              animate={crashed ? { scale: 1, opacity: 1 } : {}}
              style={{
                fontSize: crashed || cashedOut ? '48px' : '56px',
                fontWeight: 900,
                color: crashed ? '#e74c3c' : cashedOut ? '#2ecc71' : '#fff',
                textShadow: `0 0 30px ${graphColor}88`,
              }}>
              {multiplier.toFixed(2)}x
            </motion.span>
          </div>

          {/* 상태 메시지 */}
          {crashed && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              className='absolute bottom-[20px] text-center'>
              <span style={{ color: '#e74c3c', fontSize: '20px', fontWeight: 700 }}>CRASHED!</span>
            </motion.div>
          )}
          {cashedOut && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              className='absolute bottom-[20px] text-center'>
              <span style={{ color: '#ffd700', fontSize: '18px', fontWeight: 700 }}>
                +${Math.floor(bet * cashOutMult).toLocaleString()}
              </span>
            </motion.div>
          )}

          {/* 대기 중 */}
          {!playing && !crashed && !cashedOut && (
            <div className='absolute inset-0 flex items-center justify-center'>
              <span style={{ color: '#555', fontSize: '18px' }}>START를 눌러 시작</span>
            </div>
          )}
        </div>

        {/* 히스토리 */}
        <div className='flex gap-[4px] flex-wrap justify-center max-w-[360px]'>
          {history.slice(0, 12).map((h, i) => (
            <span key={i} className='px-[6px] py-[2px] rounded-[4px] text-[10px] font-bold'
              style={{
                background: h.won ? '#2ecc7133' : h.mult < 1.5 ? '#e74c3c33' : '#33333366',
                color: h.won ? '#2ecc71' : h.mult < 1.5 ? '#e74c3c' : '#888',
              }}>
              {h.mult.toFixed(2)}x
            </span>
          ))}
        </div>

        {/* 설정 */}
        {!playing && (
          <>
            <div className='flex items-center gap-[8px]'>
              <span style={{ color: '#c9a84c', fontSize: '11px', fontWeight: 700 }}>BET</span>
              {BET_OPTIONS.map((v) => (
                <button key={v} onClick={() => setBet(v)}
                  className='px-[12px] py-[5px] rounded-[4px] text-[12px] font-bold'
                  style={{
                    background: bet === v ? 'linear-gradient(180deg, #c9a84c, #8B6914)' : '#1a1a1a',
                    color: bet === v ? '#1a0f08' : '#666',
                    border: bet === v ? '2px solid #ffd700' : '1px solid #333',
                  }}>
                  ${v >= 1000 ? `${v / 1000}K` : v}
                </button>
              ))}
              <input type='number' min={1} value={bet}
                onChange={(e) => { const v = parseInt(e.target.value) || 0; if (v >= 0) setBet(v) }}
                className='w-[80px] h-[28px] rounded-[4px] text-[12px] text-center font-bold outline-none'
                style={{ background: '#111', color: '#ffd700', border: '1px solid #c9a84c' }}
              />
            </div>

            <div className='flex items-center gap-[8px]'>
              <span style={{ color: '#c9a84c', fontSize: '11px', fontWeight: 700 }}>AUTO</span>
              {[0, 1.5, 2, 3, 5, 10].map((v) => (
                <button key={v} onClick={() => setAutoCashOut(v)}
                  className='px-[10px] py-[5px] rounded-[4px] text-[11px] font-bold'
                  style={{
                    background: autoCashOut === v ? '#2ecc71' : '#1a1a1a',
                    color: autoCashOut === v ? 'white' : '#666',
                    border: autoCashOut === v ? '2px solid #2ecc71' : '1px solid #333',
                  }}>
                  {v === 0 ? 'OFF' : `${v}x`}
                </button>
              ))}
            </div>
          </>
        )}

        {/* 액션 */}
        <div className='flex items-center gap-[10px]'>
          {!playing ? (
            <button onClick={startGame} disabled={money < bet}
              className='w-[200px] h-[50px] rounded-full text-[17px] font-bold disabled:opacity-30'
              style={{
                background: 'linear-gradient(180deg, #3498db, #2471a3)',
                color: 'white', border: '3px solid #c9a84c', letterSpacing: '2px',
                boxShadow: '0 4px 15px rgba(52,152,219,0.4)',
              }}>
              🚀 START
            </button>
          ) : (
            <button onClick={doCashOut}
              className='w-[200px] h-[50px] rounded-full text-[17px] font-bold'
              style={{
                background: 'linear-gradient(180deg, #f39c12, #d68910)',
                color: 'white', border: '3px solid #c9a84c',
                boxShadow: '0 0 20px rgba(243,156,18,0.5)',
                animation: 'winPulse 0.4s ease infinite',
              }}>
              💰 x{multiplier.toFixed(2)}
            </button>
          )}
        </div>

        <div className='text-[12px]' style={{ color: '#888' }}>
          BALANCE <span style={{ color: '#4ade80', fontWeight: 700, fontSize: '15px' }}>${money.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}

export default Crash
