import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getMoney, addMoney, subtractMoney } from '@/utils/money'

const CARDS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
const SUITS = ['♠', '♥', '♦', '♣']
const SUIT_COLORS: Record<string, string> = { '♠': '#1a1a1a', '♥': '#e74c3c', '♦': '#e74c3c', '♣': '#1a1a1a' }
const cardValue = (c: string) => CARDS.indexOf(c) + 1
const BET_OPTIONS = [100, 500, 1000, 2000]

const randomCard = () => ({ rank: CARDS[Math.floor(Math.random() * 13)], suit: SUITS[Math.floor(Math.random() * 4)] })

const HiLo = ({ onMoneyChange }: { onMoneyChange?: (m: number) => void }) => {
  const [money, setMoneyLocal] = useState(0)
  const [bet, setBet] = useState(100)
  const [playing, setPlaying] = useState(false)
  const [currentCard, setCurrentCard] = useState(randomCard())
  const [nextCard, setNextCard] = useState<{ rank: string; suit: string } | null>(null)
  const [streak, setStreak] = useState(0)
  const [result, setResult] = useState<'win' | 'lose' | null>(null)
  const [history, setHistory] = useState<{ streak: number; profit: number }[]>([])
  const [showNext, setShowNext] = useState(false)

  const setMoney = (v: number) => { setMoneyLocal(v); onMoneyChange?.(v) }
  useEffect(() => { const m = getMoney(); setMoneyLocal(m); onMoneyChange?.(m) }, [])

  const multiplier = 1 + streak * 0.8
  const potentialWin = Math.floor(bet * multiplier)

  const start = () => {
    if (money < bet) return
    setMoney(subtractMoney(bet))
    setCurrentCard(randomCard())
    setNextCard(null); setStreak(0); setResult(null); setPlaying(true); setShowNext(false)
  }

  const guess = (higher: boolean) => {
    if (!playing) return
    const next = randomCard()
    setNextCard(next); setShowNext(true)

    const curr = cardValue(currentCard.rank)
    const nxt = cardValue(next.rank)
    const correct = higher ? nxt >= curr : nxt <= curr

    setTimeout(() => {
      if (correct) {
        setStreak((s) => s + 1)
        setCurrentCard(next); setNextCard(null); setShowNext(false)
      } else {
        setResult('lose'); setPlaying(false)
        setHistory((prev) => [{ streak, profit: -bet }, ...prev.slice(0, 29)])
        setMoney(getMoney())
      }
    }, 1200)
  }

  const cashOut = () => {
    if (!playing || streak === 0) return
    const win = potentialWin
    setMoney(addMoney(win)); setResult('win'); setPlaying(false)
    setHistory((prev) => [{ streak, profit: win - bet }, ...prev.slice(0, 29)])
  }

  const totalProfit = history.reduce((s, h) => s + h.profit, 0)

  return (
    <div className='h-[calc(100vh-52px)] flex overflow-hidden'>
      <div className='flex-1 flex flex-col items-center justify-center gap-[14px] px-[8px]'>
        <div className='arcade-box p-[24px] flex flex-col items-center gap-[12px]'
          style={{ background: 'linear-gradient(180deg, #0a3a0a 0%, #061a06 50%, #0a3a0a 100%)' }}>

          <span className='arcade-title neon-text' style={{ '--neon-color': '#2ecc71', color: '#ffd700', fontSize: '22px', fontWeight: 900 } as any}>
            🃏 HI-LO
          </span>

          {/* 카드 영역 */}
          <div className='flex items-center gap-[20px]'>
            {/* 현재 카드 */}
            <motion.div className='w-[130px] h-[180px] rounded-[10px] flex flex-col items-center justify-center'
              style={{ background: '#fff', border: '3px solid #c9a84c', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
              <span style={{ fontSize: '42px', fontWeight: 900, color: SUIT_COLORS[currentCard.suit] }}>
                {currentCard.rank}
              </span>
              <span style={{ fontSize: '32px', color: SUIT_COLORS[currentCard.suit] }}>{currentCard.suit}</span>
            </motion.div>

            {/* VS */}
            <span className='arcade-title text-[18px]' style={{ color: '#c9a84c' }}>VS</span>

            {/* 다음 카드 */}
            <motion.div
              animate={showNext ? { rotateY: 0 } : { rotateY: 180 }}
              transition={{ duration: 0.5 }}
              className='w-[130px] h-[180px] rounded-[10px] flex flex-col items-center justify-center'
              style={{
                background: showNext && nextCard ? '#fff' : 'linear-gradient(145deg, #1a3a8a, #0a1a4a)',
                border: '3px solid #c9a84c', boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
              }}>
              {showNext && nextCard ? (
                <>
                  <span style={{ fontSize: '42px', fontWeight: 900, color: SUIT_COLORS[nextCard.suit] }}>{nextCard.rank}</span>
                  <span style={{ fontSize: '32px', color: SUIT_COLORS[nextCard.suit] }}>{nextCard.suit}</span>
                </>
              ) : (
                <span style={{ fontSize: '40px', color: '#c9a84c' }}>?</span>
              )}
            </motion.div>
          </div>

          {/* 연속 + 배수 */}
          {playing && (
            <div className='arcade-title text-[13px]' style={{ color: '#4ade80' }}>
              STREAK: {streak} → x{multiplier.toFixed(1)} (${potentialWin.toLocaleString()})
            </div>
          )}

          {/* 결과 */}
          <div className='h-[32px] flex items-center justify-center'>
            {result === 'win' && (
              <motion.span animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 0.6 }}
                className='arcade-title' style={{ color: '#ffd700', fontSize: '22px', fontWeight: 900, textShadow: '0 0 15px rgba(255,215,0,0.5)' }}>
                💰 +${potentialWin.toLocaleString()} ({streak}연승)
              </motion.span>
            )}
            {result === 'lose' && (
              <span className='arcade-title' style={{ color: '#e74c3c', fontSize: '18px' }}>💔 WRONG! {streak}연승에서 탈락</span>
            )}
          </div>

          {/* 컨트롤 */}
          {!playing ? (
            <>
              <div className='flex items-center gap-[6px]'>
                <span className='arcade-title' style={{ color: '#c9a84c', fontSize: '10px' }}>BET</span>
                {BET_OPTIONS.map((v) => (
                  <button key={v} onClick={() => setBet(v)}
                    className='arcade-btn px-[10px] py-[4px] rounded-[4px] text-[11px] font-bold'
                    style={{ background: bet === v ? '#c9a84c' : '#1a2a1a', color: bet === v ? '#000' : '#666', border: bet === v ? '2px solid #ffd700' : '1px solid #2a4a2a' }}>
                    ${v >= 1000 ? `${v / 1000}K` : v}
                  </button>
                ))}
                <input type='number' min={1} value={bet}
                  onChange={(e) => { const v = parseInt(e.target.value) || 0; if (v >= 0) setBet(v) }}
                  className='w-[70px] h-[26px] rounded-[4px] text-[11px] text-center font-bold outline-none'
                  style={{ background: '#0a1a0a', color: '#ffd700', border: '1px solid #c9a84c' }} />
              </div>
              <button onClick={start} disabled={money < bet}
                className='arcade-btn w-[180px] h-[44px] rounded-full text-[15px] font-bold disabled:opacity-30'
                style={{ background: 'linear-gradient(180deg, #2ecc71, #1e8449)', color: 'white', border: '3px solid #c9a84c' }}>
                DEAL
              </button>
            </>
          ) : (
            <div className='flex items-center gap-[10px]'>
              <button onClick={() => guess(true)} disabled={showNext}
                className='arcade-btn w-[100px] h-[48px] rounded-[10px] text-[14px] font-bold disabled:opacity-30'
                style={{ background: 'linear-gradient(180deg, #3498db, #2471a3)', color: 'white', border: '3px solid #c9a84c' }}>
                ⬆ HIGH
              </button>
              {streak > 0 && (
                <button onClick={cashOut} disabled={showNext}
                  className='arcade-btn w-[100px] h-[48px] rounded-[10px] text-[13px] font-bold disabled:opacity-30'
                  style={{ background: 'linear-gradient(180deg, #f39c12, #d68910)', color: 'white', border: '3px solid #c9a84c' }}>
                  💰 x{multiplier.toFixed(1)}
                </button>
              )}
              <button onClick={() => guess(false)} disabled={showNext}
                className='arcade-btn w-[100px] h-[48px] rounded-[10px] text-[14px] font-bold disabled:opacity-30'
                style={{ background: 'linear-gradient(180deg, #e74c3c, #c0392b)', color: 'white', border: '3px solid #c9a84c' }}>
                ⬇ LOW
              </button>
            </div>
          )}

          <div className='arcade-title text-[11px]' style={{ color: '#888' }}>
            BAL <span style={{ color: '#4ade80', fontWeight: 700, fontSize: '14px' }}>${money.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 사이드 패널 */}
      <div className='hidden lg:flex flex-col w-[260px] overflow-y-auto py-[12px] px-[10px] gap-[10px]'
        style={{ background: '#061a06', borderLeft: '2px solid #c9a84c33' }}>
        <div className='arcade-box p-[10px]' style={{ background: '#0a2a0a' }}>
          <div className='arcade-title text-[10px] mb-[6px]' style={{ color: '#c9a84c' }}>RULES</div>
          <div className='text-[10px]' style={{ color: '#888', fontFamily: 'Courier New, monospace' }}>
            <p>다음 카드가 높을지 낮을지 맞추기</p>
            <p>연속 정답 → 배수 증가</p>
            <p>원할 때 CASH OUT 가능</p>
            <p>같은 숫자 = 무조건 정답</p>
          </div>
        </div>
        <div className='arcade-box p-[10px]' style={{ background: '#0a2a0a' }}>
          <div className='arcade-title text-[10px] mb-[6px]' style={{ color: '#c9a84c' }}>STATS</div>
          {[
            ['GAMES', history.length, '#fff'],
            ['BEST', history.length > 0 ? `${Math.max(...history.map((h) => h.streak))}연승` : '-', '#ffd700'],
            ['PROFIT', `${totalProfit >= 0 ? '+' : ''}$${totalProfit.toLocaleString()}`, totalProfit >= 0 ? '#ffd700' : '#e74c3c'],
          ].map(([l, v, c]) => (
            <div key={l as string} className='flex justify-between text-[11px] mb-[2px]'>
              <span style={{ color: '#888' }}>{l}</span><span style={{ color: c as string }}>{v}</span>
            </div>
          ))}
        </div>
        <div className='arcade-box p-[10px] flex-1' style={{ background: '#0a2a0a' }}>
          <div className='arcade-title text-[10px] mb-[6px]' style={{ color: '#c9a84c' }}>HISTORY</div>
          <div className='flex flex-col gap-[2px] max-h-[300px] overflow-y-auto'>
            {history.map((h, i) => (
              <div key={i} className='flex justify-between px-[4px] py-[2px] rounded-[2px]'
                style={{ background: h.profit > 0 ? '#0a2a1a' : '#1a0a0a' }}>
                <span style={{ color: '#888', fontSize: '10px' }}>#{i + 1} ({h.streak}연승)</span>
                <span className='arcade-title' style={{ color: h.profit > 0 ? '#ffd700' : '#e74c3c', fontSize: '10px' }}>
                  {h.profit > 0 ? `+$${h.profit.toLocaleString()}` : `-$${Math.abs(h.profit)}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HiLo
