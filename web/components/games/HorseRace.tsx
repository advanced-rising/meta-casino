import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { getMoney, addMoney, subtractMoney } from '@/utils/money'

const HORSES = [
  { id: 1, name: 'THUNDER', emoji: '🐎', color: '#e74c3c', odds: 2.5 },
  { id: 2, name: 'STORM', emoji: '🏇', color: '#3498db', odds: 3.0 },
  { id: 3, name: 'SHADOW', emoji: '🐴', color: '#2ecc71', odds: 4.0 },
  { id: 4, name: 'BLAZE', emoji: '🦄', color: '#f39c12', odds: 5.0 },
  { id: 5, name: 'SPIRIT', emoji: '🐎', color: '#9b59b6', odds: 8.0 },
]

const BET_OPTIONS = [100, 500, 1000, 2000]
const TRACK_WIDTH = 100 // %

const HorseRace = ({ onMoneyChange }: { onMoneyChange?: (m: number) => void }) => {
  const [money, setMoneyLocal] = useState(0)
  const [bet, setBet] = useState(100)
  const [selectedHorse, setSelectedHorse] = useState(1)
  const [racing, setRacing] = useState(false)
  const [positions, setPositions] = useState<number[]>(HORSES.map(() => 0))
  const [winner, setWinner] = useState<number | null>(null)
  const [result, setResult] = useState<{ won: boolean; profit: number } | null>(null)
  const [history, setHistory] = useState<{ horse: string; won: boolean; profit: number }[]>([])
  const raceRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const setMoney = (v: number) => { setMoneyLocal(v); onMoneyChange?.(v) }
  useEffect(() => { const m = getMoney(); setMoneyLocal(m); onMoneyChange?.(m) }, [])

  const startRace = () => {
    if (racing || money < bet) return
    setMoney(subtractMoney(bet)); setRacing(true); setWinner(null); setResult(null)
    setPositions(HORSES.map(() => 0))

    raceRef.current = setInterval(() => {
      setPositions((prev) => {
        const next = prev.map((p) => p + Math.random() * 3 + 0.5)
        const winIdx = next.findIndex((p) => p >= TRACK_WIDTH)
        if (winIdx >= 0) {
          clearInterval(raceRef.current!)
          const winHorse = HORSES[winIdx]
          setWinner(winHorse.id)
          const won = winHorse.id === selectedHorse
          const profit = won ? Math.floor(bet * winHorse.odds) - bet : -bet
          if (won) setMoney(addMoney(Math.floor(bet * winHorse.odds)))
          else setMoney(getMoney())
          setResult({ won, profit })
          setHistory((prev) => [{ horse: winHorse.name, won, profit }, ...prev.slice(0, 29)])
          setRacing(false)
          return next.map((p, i) => i === winIdx ? TRACK_WIDTH : Math.min(p, TRACK_WIDTH - 1))
        }
        return next
      })
    }, 80)
  }

  useEffect(() => { return () => { if (raceRef.current) clearInterval(raceRef.current) } }, [])
  const totalProfit = history.reduce((s, h) => s + h.profit, 0)

  return (
    <div className='h-[calc(100vh-52px)] flex overflow-hidden'>
      <div className='flex-1 flex flex-col items-center justify-center gap-[10px] overflow-y-auto py-[10px] px-[8px]'>
        <div className='rounded-[12px] p-[20px] flex flex-col items-center gap-[10px] w-full max-w-[600px]'
          style={{ background: 'linear-gradient(180deg, #1a2a0a, #0d1a05)' }}>

          <span className='arcade-title neon-text' style={{ '--neon-color': '#2ecc71', color: '#ffd700', fontSize: '20px', fontWeight: 900 } as any}>
            🏇 HORSE RACE
          </span>

          {/* 트랙 */}
          <div className='w-full flex flex-col gap-[4px]'>
            {HORSES.map((horse, i) => (
              <div key={horse.id} className='flex items-center gap-[6px]'>
                <span className='arcade-title text-[9px] w-[60px]' style={{ color: horse.color }}>{horse.name}</span>
                <div className='flex-1 h-[28px] rounded-[4px] relative' style={{ background: '#111', border: `1px solid ${horse.color}33` }}>
                  {/* 트랙 라인 */}
                  <div className='absolute right-0 top-0 bottom-0 w-[2px]' style={{ background: '#ffd70066' }} />
                  {/* 말 */}
                  <motion.div animate={{ left: `${Math.min(positions[i], 95)}%` }}
                    transition={{ duration: 0.08 }}
                    className='absolute top-[2px] text-[20px]'
                    style={{ filter: winner === horse.id ? 'drop-shadow(0 0 6px gold)' : 'none' }}>
                    {horse.emoji}
                  </motion.div>
                </div>
                <span className='arcade-title text-[9px] w-[30px]' style={{ color: selectedHorse === horse.id ? '#ffd700' : '#555' }}>
                  x{horse.odds}
                </span>
              </div>
            ))}
          </div>

          {/* 결과 */}
          <div className='h-[28px] flex items-center justify-center'>
            {result && (
              <motion.span animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: 3, duration: 0.3 }}
                className='arcade-title' style={{ color: result.won ? '#ffd700' : '#e74c3c', fontSize: '18px', fontWeight: 900 }}>
                {result.won ? `🏆 +$${(result.profit + bet).toLocaleString()}` : `💨 ${HORSES.find(h => h.id === winner)?.name} 승리!`}
              </motion.span>
            )}
          </div>

          {/* 배팅 */}
          {!racing && (
            <>
              <div className='flex items-center gap-[4px] flex-wrap justify-center'>
                <span className='arcade-title' style={{ color: '#c9a84c', fontSize: '10px' }}>HORSE</span>
                {HORSES.map((h) => (
                  <button key={h.id} onClick={() => setSelectedHorse(h.id)}
                    className='arcade-btn px-[8px] py-[4px] rounded-[4px] text-[10px] font-bold'
                    style={{ background: selectedHorse === h.id ? h.color : '#1a2a0a', color: selectedHorse === h.id ? '#fff' : '#666' }}>
                    {h.emoji} {h.name}
                  </button>
                ))}
              </div>
              <div className='flex items-center gap-[6px]'>
                <span className='arcade-title' style={{ color: '#c9a84c', fontSize: '10px' }}>BET</span>
                {BET_OPTIONS.map((v) => (
                  <button key={v} onClick={() => setBet(v)} className='arcade-btn px-[10px] py-[4px] rounded-[4px] text-[11px] font-bold'
                    style={{ background: bet === v ? '#c9a84c' : '#1a2a0a', color: bet === v ? '#000' : '#666' }}>
                    ${v >= 1000 ? `${v / 1000}K` : v}
                  </button>
                ))}
                <input type='number' min={1} value={bet} onChange={(e) => { const v = parseInt(e.target.value) || 0; if (v >= 0) setBet(v) }}
                  className='w-[70px] h-[26px] rounded-[4px] text-[11px] text-center font-bold outline-none'
                  style={{ background: '#0d1a05', color: '#ffd700', border: '1px solid #c9a84c' }} />
              </div>
            </>
          )}

          <button onClick={startRace} disabled={racing || money < bet}
            className='arcade-btn w-[180px] h-[44px] rounded-full text-[15px] font-bold disabled:opacity-30'
            style={{ background: racing ? '#333' : 'linear-gradient(180deg, #2ecc71, #1e8449)', color: 'white' }}>
            {racing ? '🏇 RACING...' : '🏇 START'}
          </button>

          <div className='arcade-title text-[11px]' style={{ color: '#888' }}>
            BAL <span style={{ color: '#4ade80', fontWeight: 700, fontSize: '13px' }}>${money.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className='hidden lg:flex flex-col w-[220px] overflow-y-auto py-[12px] px-[10px] gap-[10px]'
        style={{ background: '#0d1a05', borderLeft: '1px solid #c9a84c22' }}>
        <div className='rounded-[8px] p-[10px]' style={{ background: '#1a2a0a' }}>
          <div className='arcade-title text-[10px] mb-[4px]' style={{ color: '#c9a84c' }}>ODDS</div>
          {HORSES.map((h) => (
            <div key={h.id} className='flex justify-between text-[11px] mb-[1px]'>
              <span style={{ color: h.color }}>{h.emoji} {h.name}</span>
              <span style={{ color: '#ffd700' }}>x{h.odds}</span>
            </div>
          ))}
        </div>
        <div className='rounded-[8px] p-[10px]' style={{ background: '#1a2a0a' }}>
          <div className='arcade-title text-[10px] mb-[4px]' style={{ color: '#c9a84c' }}>STATS</div>
          {[['RACES', history.length, '#fff'],
            ['PROFIT', `${totalProfit >= 0 ? '+' : ''}$${totalProfit.toLocaleString()}`, totalProfit >= 0 ? '#ffd700' : '#e74c3c']
          ].map(([l, v, c]) => (
            <div key={l as string} className='flex justify-between text-[11px] mb-[1px]'>
              <span style={{ color: '#888' }}>{l}</span><span style={{ color: c as string }}>{v}</span>
            </div>
          ))}
        </div>
        <div className='rounded-[8px] p-[10px] flex-1' style={{ background: '#1a2a0a' }}>
          <div className='arcade-title text-[10px] mb-[4px]' style={{ color: '#c9a84c' }}>HISTORY</div>
          <div className='flex flex-col gap-[2px] max-h-[300px] overflow-y-auto'>
            {history.map((h, i) => (
              <div key={i} className='flex justify-between px-[4px] py-[1px]'>
                <span style={{ color: '#888', fontSize: '10px' }}>{h.horse}</span>
                <span style={{ color: h.won ? '#ffd700' : '#e74c3c', fontSize: '10px' }}>
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

export default HorseRace
