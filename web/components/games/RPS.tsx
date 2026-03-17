import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getMoney, addMoney, subtractMoney } from '@/utils/money'

const CHOICES = [
  { id: 'rock', emoji: '✊', label: 'ROCK', beats: 'scissors' },
  { id: 'paper', emoji: '✋', label: 'PAPER', beats: 'rock' },
  { id: 'scissors', emoji: '✌️', label: 'SCISSORS', beats: 'paper' },
]

const BET_OPTIONS = [100, 500, 1000, 2000]

const RPS = ({ onMoneyChange }: { onMoneyChange?: (m: number) => void }) => {
  const [money, setMoneyLocal] = useState(0)
  const [bet, setBet] = useState(100)
  const [streak, setStreak] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [playerChoice, setPlayerChoice] = useState<string | null>(null)
  const [cpuChoice, setCpuChoice] = useState<string | null>(null)
  const [result, setResult] = useState<'win' | 'lose' | 'draw' | null>(null)
  const [shaking, setShaking] = useState(false)
  const [history, setHistory] = useState<{ result: string; streak: number; profit: number }[]>([])

  const setMoney = (v: number) => { setMoneyLocal(v); onMoneyChange?.(v) }
  useEffect(() => { const m = getMoney(); setMoneyLocal(m); onMoneyChange?.(m) }, [])

  const multiplier = 1 + streak * 0.5
  const potentialWin = Math.floor(bet * multiplier * 2)

  const play = (choice: string) => {
    if (shaking || money < bet) return
    if (!playing) { setMoney(subtractMoney(bet)); setPlaying(true) }

    setPlayerChoice(choice); setCpuChoice(null); setResult(null); setShaking(true)

    setTimeout(() => {
      const cpu = CHOICES[Math.floor(Math.random() * 3)]
      setCpuChoice(cpu.id); setShaking(false)

      const playerData = CHOICES.find(c => c.id === choice)!
      if (playerData.beats === cpu.id) {
        const newStreak = streak + 1
        setStreak(newStreak); setResult('win')
      } else if (cpu.beats === choice) {
        setResult('lose'); setPlaying(false)
        setHistory((prev) => [{ result: 'lose', streak, profit: -bet }, ...prev.slice(0, 29)])
        setStreak(0); setMoney(getMoney())
      } else {
        setResult('draw') // 무승부 = 다시
      }
    }, 800)
  }

  const cashOut = () => {
    if (!playing || streak === 0) return
    const win = potentialWin
    setMoney(addMoney(win)); setPlaying(false)
    setHistory((prev) => [{ result: 'cashout', streak, profit: win - bet }, ...prev.slice(0, 29)])
    setStreak(0); setResult(null); setPlayerChoice(null); setCpuChoice(null)
  }

  const totalProfit = history.reduce((s, h) => s + h.profit, 0)

  return (
    <div className='h-[calc(100vh-80px)] sm:h-[calc(100vh-102px)] flex overflow-hidden'>
      <div className='flex-1 flex flex-col items-center justify-center gap-[12px] px-[8px]'>
        <div className='flex flex-col items-center gap-[8px] p-[8px] sm:gap-[12px] sm:p-[12px]'
          >

          <span className='arcade-title neon-text' style={{ '--neon-color': '#f39c12', color: '#ffd700', fontSize: '16px', fontWeight: 800 } as any}>
            ✊✋✌️ ROCK PAPER SCISSORS
          </span>

          {/* 대결 */}
          <div className='flex items-center gap-[30px]'>
            <div className='flex flex-col items-center gap-[4px]'>
              <span className='arcade-title text-[10px]' style={{ color: '#3498db' }}>YOU</span>
              <motion.div animate={shaking ? { rotate: [0, -20, 20, -20, 20, 0] } : {}} transition={{ duration: 0.4, repeat: shaking ? Infinity : 0 }}
                className='w-[80px] h-[80px] rounded-[12px] flex items-center justify-center'
                style={{ background: '#fff1', fontSize: '50px' }}>
                {playerChoice ? CHOICES.find(c => c.id === playerChoice)?.emoji : '❓'}
              </motion.div>
            </div>
            <span className='arcade-title text-[18px]' style={{ color: '#c9a84c' }}>VS</span>
            <div className='flex flex-col items-center gap-[4px]'>
              <span className='arcade-title text-[10px]' style={{ color: '#e74c3c' }}>CPU</span>
              <motion.div animate={shaking ? { rotate: [0, 20, -20, 20, -20, 0] } : {}} transition={{ duration: 0.4, repeat: shaking ? Infinity : 0 }}
                className='w-[80px] h-[80px] rounded-[12px] flex items-center justify-center'
                style={{ background: '#fff1', fontSize: '50px' }}>
                {cpuChoice ? CHOICES.find(c => c.id === cpuChoice)?.emoji : '❓'}
              </motion.div>
            </div>
          </div>

          {/* 연승 + 결과 */}
          {playing && streak > 0 && (
            <div className='arcade-title text-[13px]' style={{ color: '#4ade80' }}>
              🔥 {streak}연승! x{multiplier.toFixed(1)} → ${potentialWin.toLocaleString()}
            </div>
          )}
          <div className='h-[24px] flex items-center justify-center'>
            {result === 'win' && <span className='arcade-title' style={{ color: '#2ecc71', fontSize: '18px' }}>WIN! 계속 도전?</span>}
            {result === 'lose' && <span className='arcade-title' style={{ color: '#e74c3c', fontSize: '18px' }}>LOSE! -${bet}</span>}
            {result === 'draw' && <span className='arcade-title' style={{ color: '#888', fontSize: '16px' }}>DRAW! 다시!</span>}
          </div>

          {/* 선택 */}
          <div className='flex items-center gap-[12px]'>
            {CHOICES.map((c) => (
              <button key={c.id} onClick={() => play(c.id)} disabled={shaking || (!playing && money < bet)}
                className='arcade-btn w-[70px] h-[70px] rounded-[12px] flex flex-col items-center justify-center gap-[2px] disabled:opacity-30 hover:scale-110'
                style={{ background: '#fff1', fontSize: '32px' }}>
                {c.emoji}
                <span className='text-[8px]' style={{ color: '#888' }}>{c.label}</span>
              </button>
            ))}
          </div>

          {/* 캐시아웃 */}
          {playing && streak > 0 && (
            <button onClick={cashOut} className='arcade-btn px-[20px] py-[8px] rounded-full text-[14px] font-bold'
              >
              💰 CASH OUT ${potentialWin.toLocaleString()}
            </button>
          )}

          {!playing && (
            <div className='flex items-center gap-[6px] flex-wrap justify-center'>
              <span className='arcade-title' style={{ color: '#c9a84c', fontSize: '10px' }}>BET</span>
              {BET_OPTIONS.map((v) => (
                <button key={v} onClick={() => setBet(v)} className='arcade-btn px-[6px] py-[3px] rounded-[6px] text-[10px] font-bold'
                  style={{ background: bet === v ? '#c9a84c' : '#1a1a0a', color: bet === v ? '#000' : '#666' }}>
                  ${v >= 1000 ? `${v / 1000}K` : v}
                </button>
              ))}
              <input type='number' min={1} value={bet} onChange={(e) => { const v = parseInt(e.target.value) || 0; if (v >= 0) setBet(v) }}
                className='w-[55px] h-[24px] rounded-[4px] text-[11px] text-center font-bold outline-none'
                style={{ background: '#0a0a00', color: '#ffd700', border: '1px solid #c9a84c' }} />
            </div>
          )}

          <div className='text-[10px]' style={{ color: '#666' }}>
            BAL <span style={{ color: '#4ade80', fontWeight: 700, fontSize: '13px' }}>${money.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className='hidden lg:flex flex-col w-[220px] overflow-y-auto py-[12px] px-[10px] gap-[10px]'
        style={{ background: '#1a0f00', borderLeft: '1px solid #c9a84c22' }}>
        <div className='rounded-[8px] p-[10px]' style={{ background: '#2a1a00' }}>
          <div className='arcade-title text-[10px] mb-[4px]' style={{ color: '#c9a84c' }}>RULES</div>
          <div className='text-[9px]' style={{ color: '#888' }}>
            <p>가위바위보 연승 도전!</p>
            <p>이기면 배수 +0.5x 증가</p>
            <p>지면 배팅금 잃음</p>
            <p>무승부 = 무료 재도전</p>
            <p>언제든 CASH OUT 가능</p>
          </div>
        </div>
        <div className='rounded-[8px] p-[10px]' style={{ background: '#2a1a00' }}>
          <div className='arcade-title text-[10px] mb-[4px]' style={{ color: '#c9a84c' }}>STATS</div>
          {[['GAMES', history.length, '#fff'], ['BEST', history.length > 0 ? `${Math.max(...history.map(h => h.streak), 0)}연승` : '-', '#ffd700'],
            ['PROFIT', `${totalProfit >= 0 ? '+' : ''}$${totalProfit.toLocaleString()}`, totalProfit >= 0 ? '#ffd700' : '#e74c3c']
          ].map(([l, v, c]) => (
            <div key={l as string} className='flex justify-between text-[11px] mb-[1px]'>
              <span style={{ color: '#888' }}>{l}</span><span style={{ color: c as string }}>{v}</span>
            </div>
          ))}
        </div>
        <div className='rounded-[8px] p-[10px] flex-1' style={{ background: '#2a1a00' }}>
          <div className='arcade-title text-[10px] mb-[4px]' style={{ color: '#c9a84c' }}>HISTORY</div>
          <div className='flex flex-col gap-[2px] max-h-[300px] overflow-y-auto'>
            {history.map((h, i) => (
              <div key={i} className='flex justify-between px-[4px] py-[1px]'>
                <span style={{ color: '#888', fontSize: '10px' }}>{h.streak}연승</span>
                <span style={{ color: h.profit > 0 ? '#ffd700' : '#e74c3c', fontSize: '10px' }}>
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

export default RPS
