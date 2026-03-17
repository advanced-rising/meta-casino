import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getMoney, addMoney, subtractMoney } from '@/utils/money'

const PRIZES = ['🍒', '💎', '7️⃣', '⭐', '🔔', '👑']
const PRIZE_MULT: Record<string, number> = { '🍒': 2, '💎': 10, '7️⃣': 25, '⭐': 5, '🔔': 3, '👑': 50 }
const BET_OPTIONS = [100, 500, 1000, 2000]

const generateCard = (): string[] => {
  // 25% 확률로 3매치 보장
  if (Math.random() < 0.25) {
    const winner = PRIZES[Math.floor(Math.random() * PRIZES.length)]
    const card = Array.from({ length: 9 }, () => PRIZES[Math.floor(Math.random() * PRIZES.length)])
    const positions = [0, 1, 2, 3, 4, 5, 6, 7, 8].sort(() => Math.random() - 0.5).slice(0, 3)
    positions.forEach((p) => { card[p] = winner })
    return card
  }
  return Array.from({ length: 9 }, () => PRIZES[Math.floor(Math.random() * PRIZES.length)])
}

const ScratchCard = ({ onMoneyChange }: { onMoneyChange?: (m: number) => void }) => {
  const [money, setMoneyLocal] = useState(0)
  const [bet, setBet] = useState(100)
  const [card, setCard] = useState<string[]>(generateCard())
  const [scratched, setScratched] = useState<boolean[]>(Array(9).fill(false))
  const [playing, setPlaying] = useState(false)
  const [result, setResult] = useState<{ symbol: string; count: number; win: number } | null>(null)
  const [history, setHistory] = useState<{ win: number; profit: number }[]>([])

  const setMoney = (v: number) => { setMoneyLocal(v); onMoneyChange?.(v) }
  useEffect(() => { const m = getMoney(); setMoneyLocal(m); onMoneyChange?.(m) }, [])

  const buyCard = () => {
    if (money < bet) return
    setMoney(subtractMoney(bet))
    setCard(generateCard()); setScratched(Array(9).fill(false)); setResult(null); setPlaying(true)
  }

  const scratch = (idx: number) => {
    if (!playing || scratched[idx]) return
    const newScratched = [...scratched]; newScratched[idx] = true; setScratched(newScratched)

    // 모두 긁었는지 체크
    if (newScratched.every(Boolean)) checkResult(newScratched)
  }

  const scratchAll = () => {
    if (!playing) return
    const all = Array(9).fill(true); setScratched(all); checkResult(all)
  }

  const checkResult = (s: boolean[]) => {
    const counts: Record<string, number> = {}
    card.forEach((sym) => { counts[sym] = (counts[sym] || 0) + 1 })
    const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
    if (best[1] >= 3) {
      const mult = PRIZE_MULT[best[0]] || 2
      const win = bet * mult
      setResult({ symbol: best[0], count: best[1], win })
      setMoney(addMoney(win))
      setHistory((prev) => [{ win, profit: win - bet }, ...prev.slice(0, 29)])
    } else {
      setResult({ symbol: '', count: 0, win: 0 })
      setHistory((prev) => [{ win: 0, profit: -bet }, ...prev.slice(0, 29)])
      setMoney(getMoney())
    }
    setPlaying(false)
  }

  const totalProfit = history.reduce((s, h) => s + h.profit, 0)

  return (
    <div className='h-[calc(100vh-102px)] flex overflow-hidden'>
      <div className='flex-1 flex flex-col items-center justify-center gap-[10px] px-[8px]'>
        <div className='rounded-[12px] p-[20px] flex flex-col items-center gap-[10px]'
          >
          <span className='arcade-title neon-text' style={{ '--neon-color': '#f39c12', color: '#ffd700', fontSize: '20px', fontWeight: 900 } as any}>🎫 SCRATCH CARD</span>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 70px)', gap: '4px' }}>
            {card.map((sym, i) => (
              <motion.button key={i} onClick={() => scratch(i)} disabled={!playing || scratched[i]}
                whileHover={playing && !scratched[i] ? { scale: 1.05 } : {}}
                whileTap={playing && !scratched[i] ? { scale: 0.95 } : {}}
                className='w-[70px] h-[70px] rounded-[8px] flex items-center justify-center text-[28px] disabled:cursor-default'
                style={{
                  background: scratched[i] ? '#1a1a0a' : 'linear-gradient(145deg, #c9a84c, #8B6914)',
                  border: scratched[i] && result && result.symbol === sym && result.count >= 3 ? '2px solid #ffd700' : '1px solid #ffffff11',
                  boxShadow: scratched[i] && result && result.symbol === sym ? '0 0 10px rgba(255,215,0,0.4)' : 'none',
                }}>
                {scratched[i] ? sym : '✨'}
              </motion.button>
            ))}
          </div>

          {playing && <button onClick={scratchAll} className='arcade-btn text-[11px] px-[12px] py-[4px] rounded-[4px]' style={{ background: '#333', color: '#888' }}>SCRATCH ALL</button>}

          <div className='h-[28px] flex items-center justify-center'>
            {result && result.win > 0 && (
              <motion.span animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: 3, duration: 0.3 }}
                className='arcade-title' style={{ color: '#ffd700', fontSize: '20px', fontWeight: 900 }}>
                {result.symbol}x{result.count} → +${result.win.toLocaleString()}
              </motion.span>
            )}
            {result && result.win === 0 && <span className='arcade-title' style={{ color: '#555', fontSize: '14px' }}>NO MATCH</span>}
          </div>

          {!playing && (
            <div className='flex items-center gap-[6px] flex-wrap justify-center'>
              <span className='arcade-title' style={{ color: '#c9a84c', fontSize: '10px' }}>BET</span>
              {BET_OPTIONS.map((v) => (
                <button key={v} onClick={() => setBet(v)} className='arcade-btn px-[10px] py-[4px] rounded-[4px] text-[11px] font-bold'
                  style={{ background: bet === v ? '#c9a84c' : '#2a1a00', color: bet === v ? '#000' : '#666' }}>${v >= 1000 ? `${v / 1000}K` : v}</button>
              ))}
            </div>
          )}

          <button onClick={buyCard} disabled={playing || money < bet} className='arcade-btn w-full max-w-[160px] h-[40px] rounded-full text-[14px] font-bold disabled:opacity-30'
            style={{ background: playing ? '#333' : 'linear-gradient(180deg, #f39c12, #d68910)', color: 'white' }}>
            {playing ? 'SCRATCHING...' : '🎫 BUY CARD'}
          </button>

          <div className='arcade-title text-[11px]' style={{ color: '#888' }}>BAL <span style={{ color: '#4ade80', fontWeight: 700 }}>${money.toLocaleString()}</span></div>
        </div>
      </div>
      <div className='hidden lg:flex flex-col w-[200px] overflow-y-auto py-[12px] px-[10px] gap-[10px]' style={{ background: '#1a0f00', borderLeft: '1px solid #c9a84c22' }}>
        <div className='rounded-[8px] p-[10px]' style={{ background: '#2a1a00' }}>
          <div className='arcade-title text-[10px] mb-[4px]' style={{ color: '#c9a84c' }}>PRIZES (3+ match)</div>
          {PRIZES.map((p) => (<div key={p} className='flex justify-between text-[11px] mb-[1px]'><span>{p}</span><span style={{ color: '#ffd700' }}>x{PRIZE_MULT[p]}</span></div>))}
        </div>
        <div className='rounded-[8px] p-[10px] flex-1' style={{ background: '#2a1a00' }}>
          <div className='arcade-title text-[10px] mb-[4px]' style={{ color: '#c9a84c' }}>HISTORY</div>
          <div className='flex flex-col gap-[2px] max-h-[300px] overflow-y-auto'>
            {history.map((h, i) => (<div key={i} className='flex justify-between px-[4px] py-[1px]'>
              <span style={{ color: h.profit > 0 ? '#ffd700' : '#e74c3c', fontSize: '10px' }}>{h.profit > 0 ? `+$${h.profit}` : `-$${Math.abs(h.profit)}`}</span>
            </div>))}
          </div>
        </div>
      </div>
    </div>
  )
}
export default ScratchCard
