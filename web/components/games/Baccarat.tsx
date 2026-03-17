import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getMoney, addMoney, subtractMoney } from '@/utils/money'

const SUITS = ['♠', '♥', '♦', '♣']
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
const suitColor = (s: string) => s === '♥' || s === '♦' ? '#e74c3c' : '#1a1a1a'

interface Card { rank: string; suit: string }
const drawCard = (): Card => ({ rank: RANKS[Math.floor(Math.random() * 13)], suit: SUITS[Math.floor(Math.random() * 4)] })
const cardPoint = (c: Card) => { if (['10','J','Q','K'].includes(c.rank)) return 0; if (c.rank === 'A') return 1; return parseInt(c.rank) }
const handTotal = (cards: Card[]) => cards.reduce((s, c) => s + cardPoint(c), 0) % 10

type BetSide = 'player' | 'banker' | 'tie'
const BET_OPTIONS = [100, 500, 1000, 2000]

const CardView = ({ card }: { card: Card }) => (
  <motion.div initial={{ scale: 0, rotateY: 180 }} animate={{ scale: 1, rotateY: 0 }} transition={{ duration: 0.3 }}
    className='w-[52px] h-[72px] rounded-[5px] flex flex-col items-center justify-center shrink-0'
    style={{ background: '#fff', border: '2px solid #c9a84c', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>
    <span style={{ fontSize: '16px', fontWeight: 900, color: suitColor(card.suit) }}>{card.rank}</span>
    <span style={{ fontSize: '12px', color: suitColor(card.suit) }}>{card.suit}</span>
  </motion.div>
)

const Baccarat = ({ onMoneyChange }: { onMoneyChange?: (m: number) => void }) => {
  const [money, setMoneyLocal] = useState(0)
  const [bet, setBet] = useState(100)
  const [betSide, setBetSide] = useState<BetSide>('player')
  const [playing, setPlaying] = useState(false)
  const [playerCards, setPlayerCards] = useState<Card[]>([])
  const [bankerCards, setBankerCards] = useState<Card[]>([])
  const [result, setResult] = useState<{ winner: string; profit: number } | null>(null)
  const [history, setHistory] = useState<{ winner: string; side: string; profit: number }[]>([])

  const setMoney = (v: number) => { setMoneyLocal(v); onMoneyChange?.(v) }
  useEffect(() => { const m = getMoney(); setMoneyLocal(m); onMoneyChange?.(m) }, [])

  const deal = () => {
    if (money < bet || playing) return
    setMoney(subtractMoney(bet)); setPlaying(true); setResult(null)

    const pc = [drawCard(), drawCard()]
    const bc = [drawCard(), drawCard()]

    // 3번째 카드 규칙 (간소화)
    const pt = handTotal(pc); const bt = handTotal(bc)
    if (pt <= 5) pc.push(drawCard())
    if (bt <= 5) bc.push(drawCard())

    setPlayerCards(pc); setBankerCards(bc)

    setTimeout(() => {
      const pf = handTotal(pc); const bf = handTotal(bc)
      const winner = pf > bf ? 'player' : bf > pf ? 'banker' : 'tie'
      let profit = -bet

      if (winner === 'tie') {
        if (betSide === 'tie') { profit = bet * 8; setMoney(addMoney(bet * 9)) }
        else { profit = 0; setMoney(addMoney(bet)) } // 타이 시 원금 반환
      } else if (winner === betSide) {
        const mult = winner === 'banker' ? 0.95 : 1
        profit = Math.floor(bet * mult)
        setMoney(addMoney(bet + profit))
      } else {
        setMoney(getMoney())
      }

      setResult({ winner, profit })
      setHistory((prev) => [{ winner, side: betSide, profit }, ...prev.slice(0, 29)])
      setPlaying(false)
    }, 1000)
  }

  const totalProfit = history.reduce((s, h) => s + h.profit, 0)

  return (
    <div className='h-[calc(100vh-52px)] flex overflow-hidden'>
      <div className='flex-1 flex flex-col items-center justify-center gap-[10px] px-[8px]'>
        <div className='rounded-[12px] p-[20px] flex flex-col items-center gap-[10px]'
          >

          <span className='arcade-title neon-text' style={{ '--neon-color': '#c9a84c', color: '#ffd700', fontSize: '20px', fontWeight: 900 } as any}>
            🃏 BACCARAT
          </span>

          {/* 카드 영역 */}
          <div className='flex gap-[40px]'>
            <div className='flex flex-col items-center gap-[4px]'>
              <span className='arcade-title text-[10px]' style={{ color: '#3498db' }}>PLAYER ({playerCards.length > 0 ? handTotal(playerCards) : '-'})</span>
              <div className='flex gap-[4px] min-h-[72px]'>
                {playerCards.map((c, i) => <CardView key={i} card={c} />)}
              </div>
            </div>
            <div className='flex items-center'><span className='arcade-title' style={{ color: '#555', fontSize: '14px' }}>VS</span></div>
            <div className='flex flex-col items-center gap-[4px]'>
              <span className='arcade-title text-[10px]' style={{ color: '#e74c3c' }}>BANKER ({bankerCards.length > 0 ? handTotal(bankerCards) : '-'})</span>
              <div className='flex gap-[4px] min-h-[72px]'>
                {bankerCards.map((c, i) => <CardView key={i} card={c} />)}
              </div>
            </div>
          </div>

          {/* 결과 */}
          <div className='h-[28px] flex items-center justify-center'>
            {result && (
              <motion.span animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: 3, duration: 0.3 }}
                className='arcade-title' style={{ color: result.profit > 0 ? '#ffd700' : result.profit === 0 ? '#888' : '#e74c3c', fontSize: '18px', fontWeight: 900 }}>
                {result.winner.toUpperCase()} WIN! {result.profit > 0 ? `+$${result.profit}` : result.profit === 0 ? 'PUSH' : `-$${bet}`}
              </motion.span>
            )}
          </div>

          {/* 배팅 */}
          {!playing && (
            <>
              <div className='flex items-center gap-[8px]'>
                <span className='arcade-title' style={{ color: '#c9a84c', fontSize: '10px' }}>SIDE</span>
                {(['player', 'banker', 'tie'] as BetSide[]).map((side) => (
                  <button key={side} onClick={() => setBetSide(side)}
                    className='arcade-btn px-[14px] py-[6px] rounded-[6px] text-[12px] font-bold'
                    style={{
                      background: betSide === side ? (side === 'player' ? '#3498db' : side === 'banker' ? '#e74c3c' : '#2ecc71') : '#1a2a1a',
                      color: betSide === side ? '#fff' : '#666',
                      border: betSide === side ? '2px solid #ffd700' : '1px solid #333',
                    }}>
                    {side === 'player' ? 'PLAYER x2' : side === 'banker' ? 'BANKER x1.95' : 'TIE x9'}
                  </button>
                ))}
              </div>
              <div className='flex items-center gap-[6px]'>
                <span className='arcade-title' style={{ color: '#c9a84c', fontSize: '10px' }}>BET</span>
                {BET_OPTIONS.map((v) => (
                  <button key={v} onClick={() => setBet(v)} className='arcade-btn px-[10px] py-[4px] rounded-[4px] text-[11px] font-bold'
                    style={{ background: bet === v ? '#c9a84c' : '#1a2a1a', color: bet === v ? '#000' : '#666' }}>
                    ${v >= 1000 ? `${v / 1000}K` : v}
                  </button>
                ))}
                <input type='number' min={1} value={bet} onChange={(e) => { const v = parseInt(e.target.value) || 0; if (v >= 0) setBet(v) }}
                  className='w-[70px] h-[26px] rounded-[4px] text-[11px] text-center font-bold outline-none'
                  style={{ background: '#051505', color: '#ffd700', border: '1px solid #c9a84c' }} />
              </div>
            </>
          )}

          <button onClick={deal} disabled={playing || money < bet}
            className='arcade-btn w-[180px] h-[44px] rounded-full text-[15px] font-bold disabled:opacity-30'
            >
            {playing ? '...' : 'DEAL'}
          </button>

          <div className='arcade-title text-[11px]' style={{ color: '#888' }}>
            BAL <span style={{ color: '#4ade80', fontWeight: 700, fontSize: '13px' }}>${money.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className='hidden lg:flex flex-col w-[220px] overflow-y-auto py-[12px] px-[10px] gap-[10px]'
        style={{ background: '#051505', borderLeft: '1px solid #c9a84c22' }}>
        <div className='rounded-[8px] p-[10px]' style={{ background: '#0a2a0a' }}>
          <div className='arcade-title text-[10px] mb-[4px]' style={{ color: '#c9a84c' }}>STATS</div>
          {[['HANDS', history.length, '#fff'], ['P WINS', history.filter(h => h.winner === 'player').length, '#3498db'],
            ['B WINS', history.filter(h => h.winner === 'banker').length, '#e74c3c'], ['TIES', history.filter(h => h.winner === 'tie').length, '#2ecc71'],
            ['PROFIT', `${totalProfit >= 0 ? '+' : ''}$${totalProfit.toLocaleString()}`, totalProfit >= 0 ? '#ffd700' : '#e74c3c'],
          ].map(([l, v, c]) => (
            <div key={l as string} className='flex justify-between text-[11px] mb-[1px]'>
              <span style={{ color: '#888' }}>{l}</span><span style={{ color: c as string }}>{v}</span>
            </div>
          ))}
        </div>
        <div className='rounded-[8px] p-[10px] flex-1' style={{ background: '#0a2a0a' }}>
          <div className='arcade-title text-[10px] mb-[4px]' style={{ color: '#c9a84c' }}>HISTORY</div>
          <div className='flex flex-col gap-[2px] max-h-[300px] overflow-y-auto'>
            {history.map((h, i) => (
              <div key={i} className='flex justify-between px-[4px] py-[1px] rounded-[2px]'
                style={{ background: h.profit > 0 ? '#0a2a1a' : 'transparent' }}>
                <span style={{ color: h.winner === 'player' ? '#3498db' : h.winner === 'banker' ? '#e74c3c' : '#2ecc71', fontSize: '10px' }}>
                  {h.winner[0].toUpperCase()}
                </span>
                <span style={{ color: h.profit > 0 ? '#ffd700' : h.profit === 0 ? '#555' : '#e74c3c', fontSize: '10px' }}>
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

export default Baccarat
