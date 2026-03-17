import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getMoney, addMoney, subtractMoney } from '@/utils/money'

const BET_OPTIONS = [100, 500, 1000, 2000]
type BetType = 'over' | 'under' | 'exact'

// 주사위 도트 위치 (3x3 그리드 기준, 1~6)
const DOT_PATTERNS: Record<number, [number, number][]> = {
  1: [[1,1]],
  2: [[0,0],[2,2]],
  3: [[0,0],[1,1],[2,2]],
  4: [[0,0],[0,2],[2,0],[2,2]],
  5: [[0,0],[0,2],[1,1],[2,0],[2,2]],
  6: [[0,0],[0,1],[0,2],[2,0],[2,1],[2,2]],
}

const DiceFace = ({ value, size = 70 }: { value: number; size?: number }) => {
  const dots = DOT_PATTERNS[value] || []
  const cell = size / 4
  return (
    <div className='rounded-[10px] relative' style={{ width: size, height: size, background: '#fff', border: '3px solid #c9a84c', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
      {dots.map(([col, row], i) => (
        <div key={i} className='absolute rounded-full' style={{
          width: cell * 0.7, height: cell * 0.7, background: '#1a1a1a',
          left: cell * 0.65 + col * cell, top: cell * 0.65 + row * cell,
        }} />
      ))}
    </div>
  )
}

const Dice = ({ onMoneyChange }: { onMoneyChange?: (m: number) => void }) => {
  const [money, setMoneyLocal] = useState(0)
  const [bet, setBet] = useState(100)
  const [target, setTarget] = useState(7) // 2~12
  const [betType, setBetType] = useState<BetType>('over')
  const [rolling, setRolling] = useState(false)
  const [dice1, setDice1] = useState(1)
  const [dice2, setDice2] = useState(1)
  const [result, setResult] = useState<'win' | 'lose' | null>(null)
  const [winAmount, setWinAmount] = useState(0)
  const [shaking, setShaking] = useState(false)
  const [history, setHistory] = useState<{ d1: number; d2: number; total: number; profit: number }[]>([])

  const setMoney = (v: number) => { setMoneyLocal(v); onMoneyChange?.(v) }
  useEffect(() => { const m = getMoney(); setMoneyLocal(m); onMoneyChange?.(m) }, [])

  // 배당 계산
  const getMultiplier = () => {
    if (betType === 'exact') return 6
    // over/under: target이 극단일수록 배당 높음
    const prob = betType === 'over'
      ? Array.from({ length: 11 }, (_, i) => i + 2).filter((v) => v > target).length / 11
      : Array.from({ length: 11 }, (_, i) => i + 2).filter((v) => v < target).length / 11
    return prob > 0 ? Math.max(1.2, Math.round((1 / prob) * 100) / 100) : 10
  }

  const roll = () => {
    if (rolling || money < bet) return
    setMoney(subtractMoney(bet))
    setRolling(true); setResult(null); setWinAmount(0); setShaking(true)

    // 흔들기 애니메이션
    const shakeInterval = setInterval(() => {
      setDice1(Math.floor(Math.random() * 6) + 1)
      setDice2(Math.floor(Math.random() * 6) + 1)
    }, 80)

    setTimeout(() => {
      clearInterval(shakeInterval)
      setShaking(false)

      const d1 = Math.floor(Math.random() * 6) + 1
      const d2 = Math.floor(Math.random() * 6) + 1
      setDice1(d1); setDice2(d2)
      const total = d1 + d2

      let won = false
      if (betType === 'over') won = total > target
      else if (betType === 'under') won = total < target
      else won = total === target

      const mult = getMultiplier()
      const win = won ? Math.floor(bet * mult) : 0

      if (won) { setMoney(addMoney(win)); setWinAmount(win); setResult('win') }
      else { setMoney(getMoney()); setResult('lose') }

      setHistory((prev) => [{ d1, d2, total, profit: won ? win - bet : -bet }, ...prev.slice(0, 29)])
      setRolling(false)
    }, 1500)
  }

  const totalProfit = history.reduce((s, h) => s + h.profit, 0)

  return (
    <div className='h-[calc(100vh-52px)] flex overflow-hidden'>
      <div className='flex-1 flex flex-col items-center justify-center gap-[12px] px-[8px]'>
        <div className='flex flex-col items-center gap-[12px] p-[12px]'
          style={{ background: 'linear-gradient(180deg, #1a2a0a 0%, #0d1a05 50%, #1a2a0a 100%)' }}>

          <span className='arcade-title neon-text' style={{ '--neon-color': '#2ecc71', color: '#ffd700', fontSize: '22px', fontWeight: 900 } as any}>
            🎲 DICE
          </span>

          {/* 주사위 */}
          <div className='flex items-center gap-[20px]'>
            <motion.div animate={shaking ? { rotate: [0, 15, -15, 10, -10, 0], scale: [1, 1.1, 0.9, 1.05, 1] } : {}}
              transition={{ duration: 0.3, repeat: shaking ? Infinity : 0 }}>
              <DiceFace value={dice1} size={80} />
            </motion.div>
            <span className='arcade-title text-[20px]' style={{ color: '#c9a84c' }}>+</span>
            <motion.div animate={shaking ? { rotate: [0, -15, 15, -10, 10, 0], scale: [1, 0.9, 1.1, 0.95, 1] } : {}}
              transition={{ duration: 0.3, repeat: shaking ? Infinity : 0, delay: 0.05 }}>
              <DiceFace value={dice2} size={80} />
            </motion.div>
            <span className='arcade-title text-[20px]' style={{ color: '#c9a84c' }}>=</span>
            <span className='arcade-title text-[36px] font-bold' style={{ color: '#ffd700' }}>{dice1 + dice2}</span>
          </div>

          {/* 결과 */}
          <div className='h-[30px] flex items-center justify-center'>
            {result === 'win' && (
              <motion.span animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 0.6 }}
                className='arcade-title' style={{ color: '#ffd700', fontSize: '20px', fontWeight: 900, textShadow: '0 0 10px rgba(255,215,0,0.5)' }}>
                🎉 +${winAmount.toLocaleString()}
              </motion.span>
            )}
            {result === 'lose' && <span className='arcade-title' style={{ color: '#e74c3c', fontSize: '16px' }}>MISS!</span>}
          </div>

          {/* 배팅 타입 + 타겟 */}
          {!rolling && (
            <>
              <div className='flex items-center gap-[6px]'>
                <span className='arcade-title' style={{ color: '#c9a84c', fontSize: '10px' }}>TYPE</span>
                {[
                  { label: `OVER ${target}`, type: 'over' as BetType },
                  { label: `UNDER ${target}`, type: 'under' as BetType },
                  { label: `EXACT ${target}`, type: 'exact' as BetType },
                ].map(({ label, type }) => (
                  <button key={type} onClick={() => setBetType(type)}
                    className='arcade-btn px-[10px] py-[5px] rounded-[4px] text-[11px] font-bold'
                    style={{ background: betType === type ? '#c9a84c' : '#1a2a0a', color: betType === type ? '#000' : '#666',
                      border: betType === type ? '2px solid #ffd700' : '1px solid #2a4a2a' }}>
                    {label}
                  </button>
                ))}
              </div>

              <div className='flex items-center gap-[6px]'>
                <span className='arcade-title' style={{ color: '#c9a84c', fontSize: '10px' }}>TARGET</span>
                <input type='range' min={2} max={12} value={target} onChange={(e) => setTarget(parseInt(e.target.value))}
                  className='w-[120px]' style={{ accentColor: '#c9a84c' }} />
                <span className='arcade-title text-[14px] font-bold' style={{ color: '#ffd700' }}>{target}</span>
                <span className='arcade-title text-[11px]' style={{ color: '#4ade80' }}>x{getMultiplier()}</span>
              </div>

              <div className='flex items-center gap-[6px]'>
                <span className='arcade-title' style={{ color: '#c9a84c', fontSize: '10px' }}>BET</span>
                {BET_OPTIONS.map((v) => (
                  <button key={v} onClick={() => setBet(v)}
                    className='arcade-btn px-[10px] py-[4px] rounded-[4px] text-[11px] font-bold'
                    style={{ background: bet === v ? '#c9a84c' : '#1a2a0a', color: bet === v ? '#000' : '#666',
                      border: bet === v ? '2px solid #ffd700' : '1px solid #2a4a2a' }}>
                    ${v >= 1000 ? `${v / 1000}K` : v}
                  </button>
                ))}
                <input type='number' min={1} value={bet} onChange={(e) => { const v = parseInt(e.target.value) || 0; if (v >= 0) setBet(v) }}
                  className='w-[70px] h-[26px] rounded-[4px] text-[11px] text-center font-bold outline-none'
                  style={{ background: '#0a1a05', color: '#ffd700', border: '1px solid #c9a84c' }} />
              </div>
            </>
          )}

          <button onClick={roll} disabled={rolling || money < bet}
            className='arcade-btn w-[180px] h-[46px] rounded-full text-[16px] font-bold disabled:opacity-30'
            style={{ background: rolling ? '#333' : 'linear-gradient(180deg, #2ecc71, #1e8449)', color: 'white', border: '3px solid #c9a84c' }}>
            {rolling ? '🎲...' : '🎲 ROLL'}
          </button>

          <div className='arcade-title text-[11px]' style={{ color: '#888' }}>
            BAL <span style={{ color: '#4ade80', fontWeight: 700, fontSize: '14px' }}>${money.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className='hidden lg:flex flex-col w-[260px] overflow-y-auto py-[12px] px-[10px] gap-[10px]'
        style={{ background: '#0d1a05', borderLeft: '2px solid #c9a84c33' }}>
        <div className='arcade-box p-[10px]' style={{ background: '#1a2a0a' }}>
          <div className='arcade-title text-[10px] mb-[6px]' style={{ color: '#c9a84c' }}>STATS</div>
          {[
            ['ROLLS', history.length, '#fff'],
            ['WINS', history.filter((h) => h.profit > 0).length, '#2ecc71'],
            ['PROFIT', `${totalProfit >= 0 ? '+' : ''}$${totalProfit.toLocaleString()}`, totalProfit >= 0 ? '#ffd700' : '#e74c3c'],
          ].map(([l, v, c]) => (
            <div key={l as string} className='flex justify-between text-[11px] mb-[2px]'>
              <span style={{ color: '#888' }}>{l}</span><span style={{ color: c as string }}>{v}</span>
            </div>
          ))}
        </div>
        <div className='arcade-box p-[10px] flex-1' style={{ background: '#1a2a0a' }}>
          <div className='arcade-title text-[10px] mb-[6px]' style={{ color: '#c9a84c' }}>HISTORY</div>
          <div className='flex flex-col gap-[2px] max-h-[300px] overflow-y-auto'>
            {history.map((h, i) => (
              <div key={i} className='flex justify-between px-[4px] py-[2px] rounded-[2px]'
                style={{ background: h.profit > 0 ? '#0a2a1a' : 'transparent' }}>
                <span style={{ color: '#888', fontSize: '10px' }}>[{h.d1}]+[{h.d2}]={h.total}</span>
                <span className='arcade-title' style={{ color: h.profit > 0 ? '#ffd700' : '#e74c3c', fontSize: '10px' }}>
                  {h.profit > 0 ? `+$${h.profit}` : `-$${Math.abs(h.profit)}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dice
