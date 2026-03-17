import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getMoney, addMoney, subtractMoney } from '@/utils/money'
import { loadHistory, saveHistory } from '@/utils/gameHistory'

const BET_OPTIONS = [100, 500, 1000, 2000]
const SUITS = ['♠', '♥', '♦', '♣']
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
const suitColor = (s: string) => s === '♥' || s === '♦' ? '#e74c3c' : '#1a1a1a'

interface Card { rank: string; suit: string }

const drawCard = (): Card => ({
  rank: RANKS[Math.floor(Math.random() * 13)],
  suit: SUITS[Math.floor(Math.random() * 4)],
})

const cardValue = (cards: Card[]): number => {
  let total = 0; let aces = 0
  for (const c of cards) {
    if (c.rank === 'A') { aces++; total += 11 }
    else if (['K', 'Q', 'J'].includes(c.rank)) total += 10
    else total += parseInt(c.rank)
  }
  while (total > 21 && aces > 0) { total -= 10; aces-- }
  return total
}

const CardView = ({ card, hidden = false }: { card: Card; hidden?: boolean }) => (
  <motion.div initial={{ scale: 0, rotateY: 180 }} animate={{ scale: 1, rotateY: 0 }} transition={{ duration: 0.3 }}
    className='w-[48px] h-[68px] sm:w-[60px] sm:h-[84px] rounded-[6px] flex flex-col items-center justify-center shrink-0'
    style={{
      background: hidden ? 'linear-gradient(145deg, #1a3a8a, #0a1a4a)' : '#fff',
      border: '2px solid #c9a84c', boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    }}>
    {hidden ? <span style={{ fontSize: '20px', color: '#c9a84c' }}>?</span> : (
      <>
        <span style={{ fontSize: '15px', fontWeight: 800, color: suitColor(card.suit) }}>{card.rank}</span>
        <span style={{ fontSize: '14px', color: suitColor(card.suit) }}>{card.suit}</span>
      </>
    )}
  </motion.div>
)

const Blackjack = ({ onMoneyChange }: { onMoneyChange?: (m: number) => void }) => {
  const [money, setMoneyLocal] = useState(0)
  const [bet, setBet] = useState(100)
  const [playing, setPlaying] = useState(false)
  const [playerCards, setPlayerCards] = useState<Card[]>([])
  const [dealerCards, setDealerCards] = useState<Card[]>([])
  const [showDealer, setShowDealer] = useState(false)
  const [gameResult, setGameResult] = useState<'win' | 'lose' | 'push' | 'blackjack' | null>(null)
  const [history, setHistory] = useState<{ result: string; profit: number }[]>(() => loadHistory('blackjack'))

  const setMoney = (v: number) => { setMoneyLocal(v); onMoneyChange?.(v) }
  useEffect(() => { const m = getMoney(); setMoneyLocal(m); onMoneyChange?.(m) }, [])
  useEffect(() => { saveHistory('blackjack', history) }, [history])

  const deal = () => {
    if (money < bet) return
    setMoney(subtractMoney(bet))
    const p = [drawCard(), drawCard()]
    const d = [drawCard(), drawCard()]
    setPlayerCards(p); setDealerCards(d)
    setShowDealer(false); setGameResult(null); setPlaying(true)

    // 블랙잭 체크
    if (cardValue(p) === 21) {
      setTimeout(() => endGame(p, d), 500)
    }
  }

  const hit = () => {
    if (!playing) return
    const newCards = [...playerCards, drawCard()]
    setPlayerCards(newCards)
    if (cardValue(newCards) > 21) {
      setTimeout(() => endGame(newCards, dealerCards), 300)
    }
  }

  const stand = () => {
    if (!playing) return
    // 딜러 턴
    let dc = [...dealerCards]
    while (cardValue(dc) < 17) dc.push(drawCard())
    setDealerCards(dc)
    endGame(playerCards, dc)
  }

  const doubleDown = () => {
    if (!playing || money < bet) return
    const originalBet = bet
    setMoney(subtractMoney(bet))
    const newCards = [...playerCards, drawCard()]
    setPlayerCards(newCards)
    let dc = [...dealerCards]
    while (cardValue(dc) < 17) dc.push(drawCard())
    setDealerCards(dc)
    setTimeout(() => endGame(newCards, dc, originalBet * 2), 300)
  }

  const endGame = (pCards: Card[], dCards: Card[], currentBet = bet) => {
    setShowDealer(true); setPlaying(false)
    const pv = cardValue(pCards); const dv = cardValue(dCards)
    let result: 'win' | 'lose' | 'push' | 'blackjack'
    let profit: number

    if (pv > 21) { result = 'lose'; profit = -currentBet }
    else if (pv === 21 && pCards.length === 2) {
      if (dv === 21 && dCards.length === 2) { result = 'push'; profit = 0; setMoney(addMoney(currentBet)) }
      else { result = 'blackjack'; profit = Math.floor(currentBet * 1.5); setMoney(addMoney(currentBet + profit)) }
    }
    else if (dv > 21) { result = 'win'; profit = currentBet; setMoney(addMoney(currentBet * 2)) }
    else if (pv > dv) { result = 'win'; profit = currentBet; setMoney(addMoney(currentBet * 2)) }
    else if (pv === dv) { result = 'push'; profit = 0; setMoney(addMoney(currentBet)) }
    else { result = 'lose'; profit = -currentBet }

    if (result !== 'blackjack' && result !== 'win' && result !== 'push') setMoney(getMoney())

    setGameResult(result)
    setHistory((prev) => [{ result, profit }, ...prev.slice(0, 29)])
  }

  const pv = cardValue(playerCards)
  const totalProfit = history.reduce((s, h) => s + h.profit, 0)

  return (
    <div className='h-[calc(100vh-80px)] sm:h-[calc(100vh-102px)] flex overflow-hidden'>
      <div className='flex-1 flex flex-col items-center justify-center gap-[12px] px-[8px]'>
        <div className='flex flex-col items-center gap-[8px] p-[8px] sm:gap-[12px] sm:p-[12px]'
          >

          <span className='arcade-title neon-text' style={{ '--neon-color': '#2ecc71', color: '#ffd700', fontSize: '16px', fontWeight: 900 } as any}>
            🃏 BLACKJACK
          </span>

          {/* 딜러 */}
          <div className='flex flex-col items-center gap-[4px]'>
            <span className='arcade-title text-[10px]' style={{ color: '#c9a84c' }}>
              DEALER {showDealer && `(${cardValue(dealerCards)})`}
            </span>
            <div className='flex gap-[6px]'>
              {dealerCards.map((c, i) => (
                <CardView key={i} card={c} hidden={!showDealer && i === 1} />
              ))}
              {dealerCards.length === 0 && <div className='w-[48px] h-[68px] sm:w-[60px] sm:h-[84px] rounded-[6px]' style={{ border: '2px dashed #333' }} />}
            </div>
          </div>

          <div className='w-[200px] h-[1px]' style={{ background: '#c9a84c44' }} />

          {/* 플레이어 */}
          <div className='flex flex-col items-center gap-[4px]'>
            <span className='arcade-title text-[10px]' style={{ color: '#c9a84c' }}>
              YOU ({pv}) {pv === 21 && playerCards.length === 2 && '🎉 BLACKJACK!'}
            </span>
            <div className='flex gap-[6px]'>
              {playerCards.map((c, i) => <CardView key={i} card={c} />)}
              {playerCards.length === 0 && <div className='w-[48px] h-[68px] sm:w-[60px] sm:h-[84px] rounded-[6px]' style={{ border: '2px dashed #333' }} />}
            </div>
          </div>

          {/* 결과 */}
          <div className='h-[22px] flex items-center justify-center'>
            {gameResult === 'blackjack' && (
              <motion.span animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 0.5 }}
                className='arcade-title' style={{ color: '#ffd700', fontSize: '16px', fontWeight: 900, textShadow: '0 0 15px rgba(255,215,0,0.5)' }}>
                🎉 BLACKJACK! x2.5
              </motion.span>
            )}
            {gameResult === 'win' && <span className='arcade-title' style={{ color: '#2ecc71', fontSize: '16px', fontWeight: 800 }}>WIN! +${bet}</span>}
            {gameResult === 'lose' && <span className='arcade-title' style={{ color: '#e74c3c', fontSize: '18px' }}>BUST!</span>}
            {gameResult === 'push' && <span className='arcade-title' style={{ color: '#888', fontSize: '16px' }}>PUSH (반환)</span>}
          </div>

          {/* 액션 */}
          {playing ? (
            <div className='flex items-center gap-[8px]'>
              <button onClick={hit} className='arcade-btn px-[20px] py-[8px] rounded-[8px] text-[14px] font-bold'
                >
                HIT
              </button>
              <button onClick={stand} className='arcade-btn px-[20px] py-[8px] rounded-[8px] text-[14px] font-bold'
                >
                STAND
              </button>
              {playerCards.length === 2 && money >= bet && (
                <button onClick={doubleDown} className='arcade-btn px-[16px] py-[8px] rounded-[8px] text-[12px] font-bold'
                  >
                  x2
                </button>
              )}
            </div>
          ) : (
            <>
              <div className='flex items-center gap-[6px] flex-wrap justify-center'>
                <span className='arcade-title' style={{ color: '#c9a84c', fontSize: '10px' }}>BET</span>
                {BET_OPTIONS.map((v) => (
                  <button key={v} onClick={() => setBet(v)}
                    className='arcade-btn px-[6px] py-[3px] rounded-[6px] text-[10px] font-bold'
                    style={{ background: bet === v ? '#c9a84c' : '#0a2a0a', color: bet === v ? '#000' : '#666',
                      border: bet === v ? '2px solid #ffd700' : '1px solid #2a4a2a' }}>
                    ${v >= 1000 ? `${v / 1000}K` : v}
                  </button>
                ))}
                <input type='number' min={1} value={bet} onChange={(e) => { const v = parseInt(e.target.value) || 0; if (v > 0) setBet(v) }}
                  className='w-[55px] h-[24px] rounded-[4px] text-[11px] text-center font-bold outline-none'
                  style={{ background: '#061a06', color: '#ffd700', border: '1px solid #c9a84c' }} />
              </div>
              <button onClick={deal} disabled={money < bet}
                className='arcade-btn w-full max-w-full max-w-[180px] h-[38px] rounded-full text-[16px] font-bold disabled:opacity-30'
                >
                DEAL
              </button>
            </>
          )}

          <div className='text-[10px]' style={{ color: '#666' }}>
            BAL <span style={{ color: '#4ade80', fontWeight: 700, fontSize: '14px' }}>${money.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className='hidden lg:flex flex-col w-[240px] overflow-y-auto py-[12px] px-[10px] gap-[10px]'
        style={{ background: '#061a06', borderLeft: '2px solid #c9a84c33' }}>
        <div className='arcade-box p-[10px]' style={{ background: '#0a2a0a' }}>
          <div className='arcade-title text-[10px] mb-[6px]' style={{ color: '#c9a84c' }}>RULES</div>
          <div className='text-[9px]' style={{ color: '#888', fontFamily: 'Pretendard, sans-serif' }}>
            <p>21에 가까이 but 넘지 않기</p>
            <p>A=1or11, K/Q/J=10</p>
            <p>BJ(21 2장)=x2.5</p>
            <p>HIT=카드추가, STAND=멈춤</p>
            <p>x2=더블다운(배팅2배+1장)</p>
          </div>
        </div>
        <div className='arcade-box p-[10px]' style={{ background: '#0a2a0a' }}>
          <div className='arcade-title text-[10px] mb-[6px]' style={{ color: '#c9a84c' }}>STATS</div>
          {[
            ['HANDS', history.length, '#fff'],
            ['WINS', history.filter((h) => h.profit > 0).length, '#2ecc71'],
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
                style={{ background: h.profit > 0 ? '#0a2a1a' : 'transparent' }}>
                <span style={{ color: h.result === 'blackjack' ? '#ffd700' : h.profit > 0 ? '#2ecc71' : h.profit === 0 ? '#888' : '#e74c3c', fontSize: '10px' }}>
                  {h.result.toUpperCase()}
                </span>
                <span className='arcade-title' style={{ color: h.profit > 0 ? '#ffd700' : h.profit === 0 ? '#888' : '#e74c3c', fontSize: '10px' }}>
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

export default Blackjack
