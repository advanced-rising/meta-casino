import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getMoney, addMoney, subtractMoney } from '@/utils/money'
const RANKS = ['2','3','4','5','6','7','8','9','10','J','Q','K','A']
const SUITS = ['♠','♥','♦','♣']
const suitColor = (s: string) => s === '♥' || s === '♦' ? '#ef4444' : '#fff'
const drawCard = () => ({ rank: RANKS[Math.floor(Math.random() * 13)], suit: SUITS[Math.floor(Math.random() * 4)] })
const rankVal = (r: string) => RANKS.indexOf(r)
const BET_OPTIONS = [100, 500, 1000, 2000]

const War = ({ onMoneyChange }: { onMoneyChange?: (m: number) => void }) => {
  const [money, setMoneyLocal] = useState(0)
  const [bet, setBet] = useState(100)
  const [playerCard, setPlayerCard] = useState<{rank:string;suit:string}|null>(null)
  const [dealerCard, setDealerCard] = useState<{rank:string;suit:string}|null>(null)
  const [result, setResult] = useState<'win'|'lose'|'war'|null>(null)
  const [dealing, setDealing] = useState(false)
  const [history, setHistory] = useState<{result:string;profit:number}[]>([])
  const setMoney = (v: number) => { setMoneyLocal(v); onMoneyChange?.(v) }
  useEffect(() => { const m = getMoney(); setMoneyLocal(m); onMoneyChange?.(m) }, [])

  const deal = () => {
    if (dealing || money < bet) return
    setMoney(subtractMoney(bet)); setDealing(true); setResult(null)
    setTimeout(() => {
      const p = drawCard(); const d = drawCard()
      setPlayerCard(p); setDealerCard(d)
      const pv = rankVal(p.rank); const dv = rankVal(d.rank)
      let r: 'win'|'lose'|'war'; let profit: number
      if (pv > dv) { r = 'win'; profit = bet; setMoney(addMoney(bet * 2)) }
      else if (pv < dv) { r = 'lose'; profit = -bet; setMoney(getMoney()) }
      else { r = 'war'; profit = Math.floor(bet * 0.5); setMoney(addMoney(bet + profit)) } // 타이=1.5배
      setResult(r)
      setHistory(prev => [{ result: r, profit }, ...prev.slice(0, 29)])
      setDealing(false)
    }, 600)
  }

  const CardView = ({ card }: { card: {rank:string;suit:string} }) => (
    <motion.div initial={{ scale: 0, rotateY: 180 }} animate={{ scale: 1, rotateY: 0 }} transition={{ duration: 0.3 }}
      className='w-[60px] h-[85px] sm:w-[80px] sm:h-[110px] rounded-[8px] flex flex-col items-center justify-center'
      style={{ background: '#fff', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
      <span style={{ fontSize: '28px', fontWeight: 900, color: suitColor(card.suit) }}>{card.rank}</span>
      <span style={{ fontSize: '20px', color: suitColor(card.suit) }}>{card.suit}</span>
    </motion.div>
  )

  return (
    <div className='h-[calc(100vh-80px)] sm:h-[calc(100vh-102px)] flex overflow-hidden'>
      <div className='flex-1 flex flex-col items-center justify-center gap-[8px] sm:gap-[14px] px-[8px]'>
        <span className='text-[18px] font-bold' style={{ color: '#fff' }}>⚔️ WAR</span>
        <div className='flex items-center gap-[30px]'>
          <div className='flex flex-col items-center gap-[4px]'>
            <span className='text-[10px]' style={{ color: '#3b82f6' }}>YOU</span>
            {playerCard ? <CardView card={playerCard} /> : <div className='w-[60px] h-[85px] sm:w-[80px] sm:h-[110px] rounded-[8px]' style={{ background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.1)' }} />}
          </div>
          <span className='text-[16px] font-bold' style={{ color: '#555' }}>VS</span>
          <div className='flex flex-col items-center gap-[4px]'>
            <span className='text-[10px]' style={{ color: '#ef4444' }}>DEALER</span>
            {dealerCard ? <CardView card={dealerCard} /> : <div className='w-[60px] h-[85px] sm:w-[80px] sm:h-[110px] rounded-[8px]' style={{ background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.1)' }} />}
          </div>
        </div>
        <div className='h-[24px]'>
          {result === 'win' && <span className='text-[18px] font-bold' style={{ color: '#22c55e' }}>WIN! +${bet}</span>}
          {result === 'lose' && <span className='text-[16px] font-bold' style={{ color: '#ef4444' }}>LOSE</span>}
          {result === 'war' && <span className='text-[16px] font-bold' style={{ color: '#eab308' }}>WAR! (TIE x1.5)</span>}
        </div>
        {!dealing && (
          <div className='flex items-center gap-[6px] flex-wrap justify-center'>
            {BET_OPTIONS.map(v => (<button key={v} onClick={() => setBet(v)} className='arcade-btn px-[6px] py-[3px] rounded-[6px] text-[10px] font-bold'
              style={{ background: bet === v ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.04)', color: bet === v ? '#fff' : '#666' }}>${v >= 1000 ? `${v/1000}K` : v}</button>))}
          </div>
        )}
        <button onClick={deal} disabled={dealing || money < bet} className='arcade-btn w-full max-w-[160px] h-[36px] rounded-[12px] text-[14px] font-bold disabled:opacity-30'
          style={{ background: '#ef4444', color: 'white' }}>{dealing ? '...' : '⚔️ BATTLE'}</button>
        <div className='text-[11px]' style={{ color: '#888' }}>$ <span style={{ color: '#22c55e' }}>{money.toLocaleString()}</span></div>
      </div>
      <div className='hidden lg:flex flex-col w-[200px] overflow-y-auto py-[12px] px-[10px] gap-[10px]' style={{ background: 'rgba(0,0,0,0.3)', borderLeft: '1px solid rgba(255,255,255,0.04)' }}>
        <div className='glass p-[10px]'><div className='text-[10px] font-semibold mb-[4px]' style={{ color: '#fff' }}>규칙</div>
          <div className='text-[9px]' style={{ color: '#888' }}><p>높은 카드 승리 (x2)</p><p>같으면 WAR (x1.5)</p><p>A가 최고</p></div></div>
        <div className='glass p-[10px] flex-1'><div className='text-[10px] font-semibold mb-[4px]' style={{ color: '#fff' }}>기록</div>
          {history.map((h, i) => (<div key={i} className='flex justify-between text-[10px]'><span style={{ color: h.result === 'win' ? '#22c55e' : h.result === 'war' ? '#eab308' : '#ef4444' }}>{h.result}</span><span style={{ color: h.profit > 0 ? '#22c55e' : '#ef4444' }}>{h.profit > 0 ? `+$${h.profit}` : `-$${Math.abs(h.profit)}`}</span></div>))}
        </div>
      </div>
    </div>
  )
}
export default War
