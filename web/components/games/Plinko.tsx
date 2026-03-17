import React, { useState, useEffect, useRef } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { getMoney, addMoney, subtractMoney } from '@/utils/money'

const BET_OPTIONS = [100, 500, 1000, 2000]
const BALL_COUNT_OPTIONS = [1, 3, 5, 10, 20]
const ROWS = 10
const SLOTS = ROWS + 1

const MULTIPLIERS = [8, 4, 2, 1.5, 1, 0.5, 1, 1.5, 2, 4, 8]
const SLOT_COLORS = ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6', '#3498db', '#2ecc71', '#f1c40f', '#e67e22', '#e74c3c']

const PEG_SPACING = 30
const BOARD_WIDTH = (ROWS + 2) * PEG_SPACING
const BOARD_HEIGHT = ROWS * (PEG_SPACING + 4) + 50

// 공 하나의 경로 시뮬레이션
const simulateBall = () => {
  const startX = BOARD_WIDTH / 2
  const path: { x: number; y: number }[] = [{ x: startX, y: 0 }]
  let pos = 0
  for (let row = 0; row < ROWS; row++) {
    pos += Math.random() > 0.5 ? 1 : -1
    path.push({ x: startX + pos * (PEG_SPACING / 2), y: (row + 1) * (PEG_SPACING + 4) })
  }
  const slot = Math.max(0, Math.min(SLOTS - 1, Math.floor((pos + ROWS) / 2)))
  return { path, slot, mult: MULTIPLIERS[slot] }
}

// 개별 공 컴포넌트
const Ball = ({ path, delay, onDone, color }: {
  path: { x: number; y: number }[]; delay: number; onDone: (slot: number) => void; color: string
}) => {
  const controls = useAnimation()
  const startX = BOARD_WIDTH / 2
  const slot = useRef(0)

  useEffect(() => {
    const run = async () => {
      await new Promise((r) => setTimeout(r, delay))
      for (let i = 0; i < path.length; i++) {
        await controls.start({
          x: path[i].x - startX,
          y: path[i].y,
          transition: { duration: 0.12, ease: 'easeIn' },
        })
      }
      // 슬롯 계산
      const lastX = path[path.length - 1].x
      const s = Math.round((lastX - PEG_SPACING) / (BOARD_WIDTH / SLOTS))
      slot.current = Math.max(0, Math.min(SLOTS - 1, s))
      onDone(slot.current)
    }
    run()
  }, [])

  return (
    <motion.div animate={controls}
      className='absolute rounded-full z-10'
      style={{
        width: 10, height: 10, left: startX - 5, top: -5,
        background: color,
        boxShadow: `0 0 6px ${color}88`,
      }} />
  )
}

const Plinko = ({ onMoneyChange }: { onMoneyChange?: (m: number) => void }) => {
  const [money, setMoneyLocal] = useState(0)
  const [bet, setBet] = useState(100)
  const [ballCount, setBallCount] = useState(1)
  const [dropping, setDropping] = useState(false)
  const [balls, setBalls] = useState<{ id: number; path: { x: number; y: number }[]; slot: number; mult: number }[]>([])
  const [slotHits, setSlotHits] = useState<Record<number, number>>({})
  const [totalWin, setTotalWin] = useState(0)
  const [totalBet, setTotalBet] = useState(0)
  const [history, setHistory] = useState<{ balls: number; totalBet: number; totalWin: number; profit: number }[]>([])
  const doneCount = useRef(0)
  const winAccum = useRef(0)

  const setMoney = (v: number) => { setMoneyLocal(v); onMoneyChange?.(v) }
  useEffect(() => { const m = getMoney(); setMoneyLocal(m); onMoneyChange?.(m) }, [])

  const drop = () => {
    const cost = bet * ballCount
    if (dropping || money < cost) return
    setMoney(subtractMoney(cost))
    setDropping(true); setSlotHits({}); setTotalWin(0); setTotalBet(cost)
    doneCount.current = 0; winAccum.current = 0

    const newBalls = Array.from({ length: ballCount }, (_, i) => {
      const sim = simulateBall()
      return { id: i, ...sim }
    })
    setBalls(newBalls)
  }

  const onBallDone = (slot: number) => {
    const mult = MULTIPLIERS[slot]
    const win = Math.floor(bet * mult)
    winAccum.current += win
    setSlotHits((prev) => ({ ...prev, [slot]: (prev[slot] || 0) + 1 }))

    doneCount.current++
    if (doneCount.current >= ballCount) {
      // 모든 공 완료
      const tw = winAccum.current
      if (tw > 0) setMoney(addMoney(tw))
      else setMoney(getMoney())
      setTotalWin(tw)
      const cost = bet * ballCount
      setHistory((prev) => [{ balls: ballCount, totalBet: cost, totalWin: tw, profit: tw - cost }, ...prev.slice(0, 29)])
      setDropping(false)
    }
  }

  const BALL_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#e91e63', '#1abc9c', '#e67e22']
  const profit = totalWin - totalBet
  const totalProfit = history.reduce((s, h) => s + h.profit, 0)

  return (
    <div className='h-[calc(100vh-52px)] flex overflow-hidden'>
      <div className='flex-1 flex flex-col items-center gap-[8px] overflow-y-auto py-[10px] px-[8px]'>
        <div className='flex flex-col items-center gap-[8px] p-[8px]'
          style={{ background: 'linear-gradient(180deg, #0a1a3a 0%, #050d20 50%, #0a1a3a 100%)' }}>

          <span className='arcade-title neon-text' style={{ '--neon-color': '#f39c12', color: '#ffd700', fontSize: '20px', fontWeight: 900 } as any}>
            📐 PLINKO
          </span>

          {/* 보드 */}
          <div className='relative' style={{ width: BOARD_WIDTH, height: BOARD_HEIGHT, overflow: 'hidden' }}>
            {/* 핀 */}
            {Array.from({ length: ROWS }, (_, row) =>
              Array.from({ length: row + 3 }, (_, col) => {
                const x = BOARD_WIDTH / 2 - ((row + 2) * PEG_SPACING) / 2 + col * PEG_SPACING
                const y = (row + 1) * (PEG_SPACING + 4) - PEG_SPACING / 2
                return <div key={`${row}-${col}`} className='absolute w-[5px] h-[5px] rounded-full' style={{ left: x - 2.5, top: y - 2.5, background: '#c9a84c' }} />
              })
            )}

            {/* 공들 */}
            {dropping && balls.map((b) => (
              <Ball key={b.id} path={b.path} delay={b.id * 150} color={BALL_COLORS[b.id % BALL_COLORS.length]} onDone={onBallDone} />
            ))}

            {/* 하단 슬롯 */}
            <div className='absolute bottom-0 left-0 right-0 flex'>
              {MULTIPLIERS.map((mult, i) => {
                const hits = slotHits[i] || 0
                return (
                  <div key={i} className='flex-1 h-[34px] flex flex-col items-center justify-center relative'
                    style={{
                      background: hits > 0 ? SLOT_COLORS[i] : `${SLOT_COLORS[i]}44`,
                      border: hits > 0 ? '2px solid #ffd700' : '1px solid #ffffff11',
                      boxShadow: hits > 0 ? '0 0 10px rgba(255,215,0,0.4)' : 'none',
                    }}>
                    <span className='text-[9px] font-bold text-white'>x{mult}</span>
                    {hits > 0 && <span className='text-[8px] text-yellow-300'>{hits}</span>}
                  </div>
                )
              })}
            </div>
          </div>

          {/* 결과 */}
          <div className='h-[28px] flex items-center justify-center'>
            {!dropping && totalWin > 0 && (
              <motion.span animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: 3, duration: 0.3 }}
                className='arcade-title' style={{ color: profit >= 0 ? '#ffd700' : '#e74c3c', fontSize: '18px', fontWeight: 900 }}>
                {profit >= 0 ? `🎉 +$${profit.toLocaleString()}` : `-$${Math.abs(profit).toLocaleString()}`}
                <span className='text-[12px] ml-[6px]' style={{ color: '#888' }}>({ballCount}balls)</span>
              </motion.span>
            )}
          </div>

          {/* 컨트롤 */}
          {!dropping && (
            <>
              <div className='flex items-center gap-[6px] flex-wrap justify-center'>
                <span className='arcade-title' style={{ color: '#c9a84c', fontSize: '10px' }}>BET/BALL</span>
                {BET_OPTIONS.map((v) => (
                  <button key={v} onClick={() => setBet(v)}
                    className='arcade-btn px-[8px] py-[3px] rounded-[4px] text-[10px] font-bold'
                    style={{ background: bet === v ? '#c9a84c' : '#0a1a3a', color: bet === v ? '#000' : '#666', border: bet === v ? '2px solid #ffd700' : '1px solid #1a3a6a' }}>
                    ${v >= 1000 ? `${v / 1000}K` : v}
                  </button>
                ))}
                <input type='number' min={1} value={bet} onChange={(e) => { const v = parseInt(e.target.value) || 0; if (v >= 0) setBet(v) }}
                  className='w-[60px] h-[24px] rounded-[4px] text-[10px] text-center font-bold outline-none'
                  style={{ background: '#050d20', color: '#ffd700', border: '1px solid #c9a84c' }} />
              </div>

              <div className='flex items-center gap-[6px]'>
                <span className='arcade-title' style={{ color: '#c9a84c', fontSize: '10px' }}>BALLS</span>
                {BALL_COUNT_OPTIONS.map((n) => (
                  <button key={n} onClick={() => setBallCount(n)}
                    className='arcade-btn px-[10px] py-[3px] rounded-[4px] text-[11px] font-bold'
                    style={{ background: ballCount === n ? '#f39c12' : '#0a1a3a', color: ballCount === n ? '#000' : '#666', border: ballCount === n ? '2px solid #ffd700' : '1px solid #1a3a6a' }}>
                    {n}
                  </button>
                ))}
              </div>

              <div className='arcade-title text-[11px]' style={{ color: '#888' }}>
                TOTAL: <span style={{ color: '#ffd700' }}>${(bet * ballCount).toLocaleString()}</span>
              </div>
            </>
          )}

          <button onClick={drop} disabled={dropping || money < bet * ballCount}
            className='arcade-btn w-[180px] h-[42px] rounded-full text-[15px] font-bold disabled:opacity-30'
            style={{ background: dropping ? '#333' : 'linear-gradient(180deg, #f39c12, #d68910)', color: 'white', border: '3px solid #c9a84c' }}>
            {dropping ? `⏳ ${doneCount.current}/${ballCount}` : `📐 DROP x${ballCount}`}
          </button>

          <div className='arcade-title text-[11px]' style={{ color: '#888' }}>
            BAL <span style={{ color: '#4ade80', fontWeight: 700, fontSize: '13px' }}>${money.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 사이드 패널 */}
      <div className='hidden lg:flex flex-col w-[240px] overflow-y-auto py-[12px] px-[10px] gap-[10px]'
        style={{ background: '#050d20', borderLeft: '2px solid #c9a84c33' }}>
        <div className='arcade-box p-[10px]' style={{ background: '#0a1a3a' }}>
          <div className='arcade-title text-[10px] mb-[4px]' style={{ color: '#c9a84c' }}>MULTIPLIERS</div>
          <div className='flex flex-wrap gap-[3px]'>
            {MULTIPLIERS.map((m, i) => (
              <div key={i} className='px-[5px] py-[1px] rounded-[2px] text-[9px] font-bold text-white' style={{ background: SLOT_COLORS[i] }}>x{m}</div>
            ))}
          </div>
        </div>
        <div className='arcade-box p-[10px]' style={{ background: '#0a1a3a' }}>
          <div className='arcade-title text-[10px] mb-[4px]' style={{ color: '#c9a84c' }}>STATS</div>
          {[
            ['DROPS', history.length, '#fff'],
            ['TOTAL BALLS', history.reduce((s, h) => s + h.balls, 0), '#3498db'],
            ['PROFIT', `${totalProfit >= 0 ? '+' : ''}$${totalProfit.toLocaleString()}`, totalProfit >= 0 ? '#ffd700' : '#e74c3c'],
          ].map(([l, v, c]) => (
            <div key={l as string} className='flex justify-between text-[11px] mb-[1px]'>
              <span style={{ color: '#888' }}>{l}</span><span style={{ color: c as string }}>{v}</span>
            </div>
          ))}
        </div>
        <div className='arcade-box p-[10px] flex-1' style={{ background: '#0a1a3a' }}>
          <div className='arcade-title text-[10px] mb-[4px]' style={{ color: '#c9a84c' }}>HISTORY</div>
          <div className='flex flex-col gap-[2px] max-h-[300px] overflow-y-auto'>
            {history.map((h, i) => (
              <div key={i} className='flex justify-between px-[4px] py-[2px] rounded-[2px]'
                style={{ background: h.profit > 0 ? '#0a2a1a' : 'transparent' }}>
                <span style={{ color: '#888', fontSize: '10px' }}>{h.balls}balls</span>
                <span className='arcade-title' style={{ color: h.profit >= 0 ? '#ffd700' : '#e74c3c', fontSize: '10px' }}>
                  {h.profit >= 0 ? `+$${h.profit}` : `-$${Math.abs(h.profit)}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Plinko
