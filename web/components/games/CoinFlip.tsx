import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getMoney, addMoney, subtractMoney } from '@/utils/money'
import { loadHistory, saveHistory } from '@/utils/gameHistory'

const BET_OPTIONS = [100, 500, 1000, 5000]

const CoinFlip = ({ onMoneyChange }: { onMoneyChange?: (m: number) => void }) => {
  const [money, setMoneyLocal] = useState(0)
  const [bet, setBet] = useState(100)
  const [flipping, setFlipping] = useState(false)
  const [result, setResult] = useState<'heads' | 'tails' | null>(null)
  const [choice, setChoice] = useState<'heads' | 'tails' | null>(null)
  const [won, setWon] = useState<boolean | null>(null)
  const [history, setHistory] = useState<{ choice: string; result: string; profit: number }[]>(() => loadHistory('coinflip'))
  const [flipAngle, setFlipAngle] = useState(0)

  const setMoney = (v: number) => { setMoneyLocal(v); onMoneyChange?.(v) }
  useEffect(() => { const m = getMoney(); setMoneyLocal(m); onMoneyChange?.(m) }, [])
  useEffect(() => { saveHistory('coinflip', history) }, [history])

  const flip = (side: 'heads' | 'tails') => {
    if (flipping || money < bet) return
    setChoice(side)
    setMoney(subtractMoney(bet))
    setFlipping(true); setResult(null); setWon(null)

    const outcome: 'heads' | 'tails' = Math.random() < 0.5 ? 'heads' : 'tails'
    const rotations = 5 + Math.floor(Math.random() * 3) // 5~7 회전
    const finalAngle = rotations * 360 + (outcome === 'tails' ? 180 : 0)
    setFlipAngle(finalAngle)

    setTimeout(() => {
      setResult(outcome)
      const isWin = side === outcome
      setWon(isWin)
      if (isWin) {
        setMoney(addMoney(bet * 2))
        setHistory((prev) => [{ choice: side, result: outcome, profit: bet }, ...prev.slice(0, 29)])
      } else {
        setMoney(getMoney())
        setHistory((prev) => [{ choice: side, result: outcome, profit: -bet }, ...prev.slice(0, 29)])
      }
      setFlipping(false)
    }, 2000)
  }

  const totalProfit = history.reduce((s, h) => s + h.profit, 0)
  const headsCount = history.filter((h) => h.result === 'heads').length
  const tailsCount = history.filter((h) => h.result === 'tails').length

  return (
    <div className='h-[calc(100vh-80px)] sm:h-[calc(100vh-102px)] flex overflow-hidden'>
      <div className='flex-1 flex flex-col items-center justify-center gap-[8px] sm:gap-[14px] px-[8px]'>
        <div className='arcade-box p-[10px] sm:p-[10px] sm:p-[18px] flex flex-col items-center gap-[8px] sm:gap-[14px]'
          >

          <span className='arcade-title neon-text' style={{ '--neon-color': '#f39c12', color: '#ffd700', fontSize: '16px', fontWeight: 900 } as any}>
            🪙 COIN FLIP
          </span>

          {/* 3D 동전 */}
          <div className='relative w-[120px] h-[120px] sm:w-[160px] sm:h-[160px] flex items-center justify-center' style={{ perspective: '800px' }}>
            <motion.div
              animate={{ rotateY: flipping ? flipAngle : (result === 'tails' ? 180 : 0) }}
              transition={{ duration: 2, ease: [0.17, 0.67, 0.12, 0.99] }}
              className='relative w-[100px] h-[100px] sm:w-[130px] sm:h-[130px]'
              style={{ transformStyle: 'preserve-3d' }}>
              {/* 앞면 (HEAD) */}
              <div className='absolute w-full h-full rounded-full flex flex-col items-center justify-center'
                style={{
                  background: 'radial-gradient(circle at 35% 35%, #ffd700, #c9a84c, #8B6914)',
                  border: '5px solid #8B6914',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.4), inset 0 2px 8px rgba(255,255,255,0.3)',
                  backfaceVisibility: 'hidden',
                }}>
                <span style={{ fontSize: '36px' }}>👑</span>
                <span style={{ fontSize: '11px', color: '#5a3a00', fontWeight: 900, letterSpacing: '2px' }}>HEAD</span>
              </div>
              {/* 뒷면 (TAIL) */}
              <div className='absolute w-full h-full rounded-full flex flex-col items-center justify-center'
                style={{
                  background: 'radial-gradient(circle at 35% 35%, #e0e0e0, #a0a0a0, #666)',
                  border: '5px solid #666',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.4), inset 0 2px 8px rgba(255,255,255,0.2)',
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}>
                <span style={{ fontSize: '36px' }}>🌙</span>
                <span style={{ fontSize: '11px', color: '#333', fontWeight: 900, letterSpacing: '2px' }}>TAIL</span>
              </div>
            </motion.div>
          </div>

          {/* 결과 */}
          <div className='h-[36px] flex items-center justify-center'>
            {won === true && (
              <motion.span animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 0.6 }}
                className='arcade-title' style={{ color: '#ffd700', fontSize: '17px', fontWeight: 800, textShadow: '0 0 15px rgba(255,215,0,0.5)' }}>
                🎉 WIN +${bet.toLocaleString()}
              </motion.span>
            )}
            {won === false && (
              <span className='arcade-title' style={{ color: '#e74c3c', fontSize: '18px' }}>
                {result === 'heads' ? '👑 HEAD' : '🌙 TAIL'} — LOSE
              </span>
            )}
            {!flipping && won === null && (
              <span className='arcade-title' style={{ color: '#555', fontSize: '13px' }}>앞(HEAD) 또는 뒤(TAIL)를 선택</span>
            )}
          </div>

          {/* 배팅 */}
          <div className='flex items-center gap-[6px] flex-wrap justify-center'>
            <span className='arcade-title' style={{ color: '#c9a84c', fontSize: '10px' }}>BET</span>
            {BET_OPTIONS.map((v) => (
              <button key={v} onClick={() => !flipping && setBet(v)}
                className='arcade-btn px-[6px] py-[3px] rounded-[6px] text-[10px] font-bold'
                style={{ background: bet === v ? '#c9a84c' : '#1a1a0a', color: bet === v ? '#000' : '#666', border: bet === v ? '2px solid #ffd700' : '1px solid #3a3a1a' }}>
                ${v >= 1000 ? `${v / 1000}K` : v}
              </button>
            ))}
            <input type='number' min={1} value={bet} disabled={flipping}
              onChange={(e) => { const v = parseInt(e.target.value) || 0; if (v > 0) setBet(v) }}
              className='w-[55px] h-[24px] rounded-[4px] text-[11px] text-center font-bold outline-none'
              style={{ background: '#0a0a00', color: '#ffd700', border: '1px solid #c9a84c' }} />
          </div>

          {/* 선택 버튼 */}
          <div className='flex items-center gap-[16px]'>
            <button onClick={() => flip('heads')} disabled={flipping || money < bet}
              className='arcade-btn w-[120px] h-[50px] rounded-[12px] text-[15px] font-bold disabled:opacity-30'
              >
              👑 HEAD
            </button>
            <button onClick={() => flip('tails')} disabled={flipping || money < bet}
              className='arcade-btn w-[120px] h-[50px] rounded-[12px] text-[15px] font-bold disabled:opacity-30'
              >
              🌙 TAIL
            </button>
          </div>

          <div className='text-[10px]' style={{ color: '#666' }}>
            BAL <span style={{ color: '#4ade80', fontWeight: 700, fontSize: '14px' }}>${money.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 사이드 패널 */}
      <div className='hidden lg:flex flex-col w-[240px] overflow-y-auto py-[12px] px-[10px] gap-[10px]'
        style={{ background: '#1a0f00', borderLeft: '2px solid #c9a84c33' }}>
        <div className='arcade-box p-[10px]' style={{ background: '#2a1a00' }}>
          <div className='arcade-title text-[10px] mb-[6px]' style={{ color: '#c9a84c' }}>STATS</div>
          {[
            ['FLIPS', history.length, '#fff'],
            ['👑 HEAD', headsCount, '#ffd700'],
            ['🌙 TAIL', tailsCount, '#c0c0c0'],
            ['PROFIT', `${totalProfit >= 0 ? '+' : ''}$${totalProfit.toLocaleString()}`, totalProfit >= 0 ? '#ffd700' : '#e74c3c'],
          ].map(([l, v, c]) => (
            <div key={l as string} className='flex justify-between text-[11px] mb-[2px]'>
              <span style={{ color: '#888' }}>{l}</span><span style={{ color: c as string }}>{v}</span>
            </div>
          ))}
        </div>
        <div className='arcade-box p-[10px] flex-1' style={{ background: '#2a1a00' }}>
          <div className='arcade-title text-[10px] mb-[6px]' style={{ color: '#c9a84c' }}>HISTORY</div>
          <div className='flex flex-col gap-[2px] max-h-[300px] overflow-y-auto'>
            {history.map((h, i) => (
              <div key={i} className='flex justify-between px-[4px] py-[2px] rounded-[2px]'
                style={{ background: h.profit > 0 ? '#1a2a0a' : '#2a0a0a' }}>
                <span style={{ color: '#888', fontSize: '10px' }}>{h.result === 'heads' ? '👑' : '🌙'}</span>
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

export default CoinFlip
