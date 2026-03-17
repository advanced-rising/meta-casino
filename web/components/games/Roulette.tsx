import React, { useState, useEffect, useCallback } from 'react'
import Wheel from '../roulette/Wheel'
import { getMoney, addMoney, subtractMoney } from '@/utils/money'

const ROULETTE_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18,
  29, 7, 28, 12, 35, 3, 26,
]
const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]

type BetType = 'number' | 'red' | 'black' | 'odd' | 'even' | 'low' | 'high'
interface Bet { type: BetType; value?: number; amount: number }

const CHIP_VALUES = [100, 500, 1000, 5000]
const CHIP_COLORS: Record<number, string> = { 100: '#9b59b6', 500: '#e67e22', 1000: '#2980b9', 5000: '#2c3e50' }

const getNumberColor = (n: number) => n === 0 ? '#1a8a3a' : RED_NUMBERS.includes(n) ? '#c0392b' : '#1a1a1a'

const Roulette = ({ onMoneyChange }: { onMoneyChange?: (m: number) => void }) => {
  const [money, setMoneyLocal] = useState(0)
  const [selectedChip, setSelectedChip] = useState(100)
  const [bets, setBets] = useState<Bet[]>([])
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<number | null>(null)
  const [winAmount, setWinAmount] = useState(0)
  const [history, setHistory] = useState<number[]>([])
  const [gameHistory, setGameHistory] = useState<{ number: number; bet: number; win: number }[]>([])
  const [spinNumber, setSpinNumber] = useState<{ next: any }>({ next: null })
  const [showResult, setShowResult] = useState(false)

  const setMoney = (v: number) => { setMoneyLocal(v); onMoneyChange?.(v) }
  useEffect(() => { const m = getMoney(); setMoneyLocal(m); onMoneyChange?.(m) }, [])

  const totalBet = bets.reduce((s, b) => s + b.amount, 0)
  const getBetOn = (type: BetType, value?: number) => bets.find((b) => b.type === type && b.value === value)?.amount || 0

  const placeBet = (type: BetType, value?: number) => {
    if (spinning || money - totalBet < selectedChip) return
    setBets((prev) => {
      const ex = prev.find((b) => b.type === type && b.value === value)
      if (ex) return prev.map((b) => (b.type === type && b.value === value ? { ...b, amount: b.amount + selectedChip } : b))
      return [...prev, { type, value, amount: selectedChip }]
    })
  }

  const isWinningBet = useCallback((bet: Bet, wn: number): boolean => {
    const isRed = RED_NUMBERS.includes(wn)
    switch (bet.type) {
      case 'number': return bet.value === wn
      case 'red': return isRed
      case 'black': return !isRed && wn !== 0
      case 'odd': return wn % 2 === 1
      case 'even': return wn % 2 === 0 && wn !== 0
      case 'low': return wn >= 1 && wn <= 18
      case 'high': return wn >= 19 && wn <= 36
      default: return false
    }
  }, [])

  const getMultiplier = (type: BetType) => type === 'number' ? 36 : 2

  const spin = () => {
    if (spinning || bets.length === 0) return
    setMoney(subtractMoney(totalBet))
    setSpinning(true); setResult(null); setWinAmount(0); setShowResult(false)
    const winningNumber = ROULETTE_NUMBERS[Math.floor(Math.random() * ROULETTE_NUMBERS.length)]
    setSpinNumber({ next: winningNumber.toString() })
    setTimeout(() => {
      setResult(winningNumber)
      setHistory((prev) => [winningNumber, ...prev.slice(0, 29)])
      setGameHistory((prev) => [{ number: winningNumber, bet: totalBet, win: totalWin }, ...prev.slice(0, 29)])
      let totalWin = 0
      bets.forEach((bet) => { if (isWinningBet(bet, winningNumber)) totalWin += bet.amount * getMultiplier(bet.type) })
      if (totalWin > 0) { setMoney(addMoney(totalWin)); setWinAmount(totalWin) }
      else { setMoney(getMoney()) }
      setBets([]); setSpinning(false); setShowResult(true)
      setTimeout(() => setShowResult(false), 4000)
    }, 5500)
  }

  const row1 = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36]
  const row2 = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35]
  const row3 = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34]

  return (
    <div className='h-[calc(100vh-102px)] flex overflow-hidden'>
      <div className='flex-1 overflow-y-auto flex flex-col items-center py-[10px] gap-[10px] px-[8px]'>
      {/* 휠 + 결과 */}
      <div className='flex items-center gap-[16px]'>
        {/* 휠 */}
        <div className='relative' style={{ transform: 'scale(0.75)', transformOrigin: 'center' }}>
          <Wheel rouletteData={{ numbers: ROULETTE_NUMBERS }} number={spinNumber} />
        </div>

        {/* 결과 + 히스토리 */}
        <div className='flex flex-col gap-[8px] min-w-[100px]'>
          {showResult && result !== null && (
            <div className='flex items-center gap-[8px]'>
              <div className='w-[40px] h-[40px] rounded-full flex items-center justify-center text-white text-[16px] font-bold'
                style={{ background: getNumberColor(result), border: '2px solid #c9a84c' }}>{result}</div>
              {winAmount > 0
                ? <span style={{ color: '#ffd700', fontSize: '16px', fontWeight: 800 }}>+${winAmount.toLocaleString()}</span>
                : <span style={{ color: '#666', fontSize: '13px' }}>No Win</span>}
            </div>
          )}
          <div className='flex flex-wrap gap-[2px] max-w-[120px]'>
            {history.slice(0, 15).map((n, i) => (
              <div key={i} className='w-[20px] h-[20px] rounded-full flex items-center justify-center text-white text-[8px] font-bold'
                style={{ background: getNumberColor(n), opacity: 1 - i * 0.04 }}>{n}</div>
            ))}
          </div>
        </div>
      </div>

      {/* 배팅 보드 */}
      <div className='rounded-[8px] p-[10px] w-full max-w-[700px] overflow-x-auto'
        style={{ background: '#0d5a0d', border: '3px solid #c9a84c', boxShadow: '0 0 30px rgba(0,0,0,0.5)' }}>
        {/* 0 */}
        <button onClick={() => placeBet('number', 0)} disabled={spinning}
          className='w-full h-[36px] rounded-[3px] text-white text-[14px] font-bold hover:brightness-125 disabled:opacity-40 mb-[2px] relative'
          style={{ background: '#1a8a3a', border: '1px solid #ffffff33' }}>
          0 {getBetOn('number', 0) > 0 && <span className='absolute right-[6px] text-yellow-300 text-[11px]'>${getBetOn('number', 0)}</span>}
        </button>

        {/* 3행 숫자 */}
        {[row1, row2, row3].map((row, ri) => (
          <div key={ri} className='flex gap-[2px] mb-[2px]'>
            {row.map((n) => {
              const bet = getBetOn('number', n)
              return (
                <button key={n} onClick={() => placeBet('number', n)} disabled={spinning}
                  className='flex-1 h-[50px] rounded-[2px] text-white text-[15px] font-bold hover:brightness-150 disabled:opacity-40 relative'
                  style={{ background: getNumberColor(n), border: bet > 0 ? '2px solid #ffd700' : '1px solid #ffffff22' }}>
                  {n}
                  {bet > 0 && (
                    <div className='absolute -top-[1px] -right-[1px] min-w-[20px] h-[18px] rounded-full px-[3px] text-[9px] flex items-center justify-center font-bold text-black'
                      style={{ background: '#ffd700' }}>
                      {bet >= 1000 ? `${bet / 1000}k` : bet}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        ))}

        {/* 외부 배팅 */}
        <div className='grid grid-cols-6 gap-[2px] mt-[4px]'>
          {[
            { label: '1-18', type: 'low' as BetType, bg: '' },
            { label: 'EVEN', type: 'even' as BetType, bg: '' },
            { label: 'RED', type: 'red' as BetType, bg: '#c0392b' },
            { label: 'BLK', type: 'black' as BetType, bg: '#1a1a1a' },
            { label: 'ODD', type: 'odd' as BetType, bg: '' },
            { label: '19-36', type: 'high' as BetType, bg: '' },
          ].map(({ label, type, bg }) => {
            const bet = getBetOn(type)
            return (
              <button key={type} onClick={() => placeBet(type)} disabled={spinning}
                className='h-[42px] text-white text-[12px] font-bold rounded-[2px] hover:brightness-125 disabled:opacity-40'
                style={{ background: bg || '#0a3a0a', border: bet > 0 ? '2px solid #ffd700' : '1px solid #ffffff22' }}>
                {label}
                {bet > 0 && <div className='text-[10px] text-yellow-300'>${bet.toLocaleString()}</div>}
              </button>
            )
          })}
        </div>
      </div>

      {/* 배팅 현황 */}
      {bets.length > 0 && (
        <div className='w-full max-w-[700px] rounded-[6px] px-[10px] py-[6px]'
          style={{ background: '#0a2a0a', border: '1px solid #c9a84c44' }}>
          <div className='flex flex-wrap gap-[4px]'>
            <span className='text-[10px] mr-[4px]' style={{ color: '#c9a84c', lineHeight: '22px' }}>BETS:</span>
            {bets.map((bet, i) => (
              <div key={i} className='flex items-center gap-[3px] px-[6px] py-[1px] rounded-[3px]'
                style={{ background: bet.type === 'number' ? getNumberColor(bet.value!) : '#0a3a0a', border: '1px solid #ffffff33' }}>
                <span className='text-white text-[10px] font-bold'>{bet.type === 'number' ? `#${bet.value}` : bet.type.toUpperCase()}</span>
                <span className='text-yellow-300 text-[10px]'>${bet.amount}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 하단: 칩 + 액션 */}
      <div className='flex items-center gap-[16px]'>
        <div className='flex gap-[6px]'>
          {CHIP_VALUES.map((v) => (
            <button key={v} onClick={() => setSelectedChip(v)}
              className='w-[42px] h-[42px] rounded-full text-white text-[10px] font-bold'
              style={{
                background: `radial-gradient(circle at 35% 35%, ${CHIP_COLORS[v]}dd, ${CHIP_COLORS[v]})`,
                border: selectedChip === v ? '3px solid #ffd700' : '2px dashed #ffffff44',
                transform: selectedChip === v ? 'scale(1.15)' : 'scale(1)',
                boxShadow: selectedChip === v ? '0 0 10px rgba(255,215,0,0.4)' : 'none',
              }}>
              {v >= 1000 ? `${v / 1000}K` : v}
            </button>
          ))}
          <input type='number' min={1} value={selectedChip}
            onChange={(e) => { const v = parseInt(e.target.value) || 0; if (v > 0) setSelectedChip(v) }}
            className='w-[70px] h-[36px] rounded-[4px] text-[12px] text-center font-bold outline-none'
            style={{ background: '#0d2a0d', color: '#ffd700', border: '1px solid #c9a84c' }}
          />
        </div>

        <div className='text-[12px]' style={{ color: '#aaa' }}>
          BET <span style={{ color: '#ffd700' }}>${totalBet.toLocaleString()}</span>
          {' / '}BAL <span style={{ color: '#4ade80' }}>${money.toLocaleString()}</span>
        </div>

        <button onClick={() => { if (!spinning) setBets([]) }} disabled={spinning}
          className='px-[12px] py-[6px] text-[11px] font-bold rounded-[4px] disabled:opacity-30'
          style={{ background: '#333', color: '#ccc', border: '1px solid #555' }}>CLEAR</button>

        <button onClick={spin} disabled={spinning || bets.length === 0}
          className='px-[24px] py-[8px] text-[14px] font-bold rounded-[4px] hover:scale-105 disabled:opacity-30'
          style={{
            background: spinning ? '#555' : 'linear-gradient(180deg, #c9a84c 0%, #8B6914 100%)',
            color: spinning ? '#aaa' : '#1a0f08',
            border: '2px solid #c9a84c',
          }}>
          {spinning ? 'SPINNING...' : 'SPIN'}
        </button>
      </div>
      </div>

      {/* 우측: 정보 패널 (데스크탑) */}
      <div className='hidden lg:flex flex-col w-[260px] overflow-y-auto py-[12px] px-[10px] gap-[10px]'
        style={{ background: '#0d1f0d', borderLeft: '2px solid #c9a84c33' }}>

        <div className='arcade-box p-[10px]' style={{ background: '#0a2a0a' }}>
          <div className='arcade-title text-[10px] mb-[6px]' style={{ color: '#c9a84c' }}>STATS</div>
          {[
            ['SPINS', gameHistory.length, '#fff'],
            ['WINS', gameHistory.filter((h) => h.win > 0).length, '#2ecc71'],
            ['PROFIT', `${(gameHistory.reduce((s, h) => s + (h.win > 0 ? h.win - h.bet : -h.bet), 0) >= 0 ? '+' : '')}$${gameHistory.reduce((s, h) => s + (h.win > 0 ? h.win - h.bet : -h.bet), 0).toLocaleString()}`,
              gameHistory.reduce((s, h) => s + (h.win > 0 ? h.win - h.bet : -h.bet), 0) >= 0 ? '#ffd700' : '#e74c3c'],
          ].map(([label, val, color]) => (
            <div key={label as string} className='flex justify-between text-[11px] mb-[2px]'>
              <span style={{ color: '#888' }}>{label}</span><span style={{ color: color as string }}>{val}</span>
            </div>
          ))}
        </div>

        <div className='arcade-box p-[10px]' style={{ background: '#0a2a0a' }}>
          <div className='arcade-title text-[10px] mb-[4px]' style={{ color: '#c9a84c' }}>NUMBER HISTORY</div>
          <div className='flex flex-wrap gap-[3px]'>
            {history.map((n, i) => (
              <div key={i} className='w-[22px] h-[22px] rounded-full flex items-center justify-center text-white text-[9px] font-bold'
                style={{ background: getNumberColor(n) }}>
                {n}
              </div>
            ))}
          </div>
        </div>

        <div className='arcade-box p-[10px] flex-1' style={{ background: '#0a2a0a' }}>
          <div className='arcade-title text-[10px] mb-[4px]' style={{ color: '#c9a84c' }}>GAME LOG</div>
          <div className='flex flex-col gap-[2px] max-h-[250px] overflow-y-auto'>
            {gameHistory.length === 0 && <span style={{ color: '#333', fontSize: '10px' }}>No spins yet</span>}
            {gameHistory.map((h, i) => (
              <div key={i} className='flex items-center justify-between px-[4px] py-[2px] rounded-[2px]'
                style={{ background: h.win > 0 ? '#0a2a1a' : 'transparent' }}>
                <div className='flex items-center gap-[4px]'>
                  <span style={{ color: '#444', fontSize: '9px' }}>#{i + 1}</span>
                  <div className='w-[18px] h-[18px] rounded-full flex items-center justify-center text-[8px] font-bold text-white'
                    style={{ background: getNumberColor(h.number) }}>{h.number}</div>
                </div>
                <span className='arcade-title' style={{ color: h.win > 0 ? '#ffd700' : '#e74c3c', fontSize: '10px' }}>
                  {h.win > 0 ? `+$${h.win.toLocaleString()}` : `-$${h.bet}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Roulette
