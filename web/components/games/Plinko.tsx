import React, { useState, useEffect, useRef } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { getMoney, addMoney, subtractMoney } from '@/utils/money'

const BET_OPTIONS = [100, 500, 1000, 2000]
const ROWS = 10
const SLOTS = ROWS + 1

// 배율 (가운데 낮고, 양 끝 높음)
const MULTIPLIERS = [8, 4, 2, 1.5, 1, 0.5, 1, 1.5, 2, 4, 8]
const SLOT_COLORS = ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6', '#3498db', '#2ecc71', '#f1c40f', '#e67e22', '#e74c3c']

const Plinko = ({ onMoneyChange }: { onMoneyChange?: (m: number) => void }) => {
  const [money, setMoneyLocal] = useState(0)
  const [bet, setBet] = useState(100)
  const [dropping, setDropping] = useState(false)
  const [ballPath, setBallPath] = useState<{ x: number; y: number }[]>([])
  const [result, setResult] = useState<{ slot: number; mult: number } | null>(null)
  const [history, setHistory] = useState<{ mult: number; profit: number }[]>([])
  const ballControls = useAnimation()

  const setMoney = (v: number) => { setMoneyLocal(v); onMoneyChange?.(v) }
  useEffect(() => { const m = getMoney(); setMoneyLocal(m); onMoneyChange?.(m) }, [])

  const PEG_SPACING = 32
  const BOARD_WIDTH = (ROWS + 2) * PEG_SPACING

  const drop = () => {
    if (dropping || money < bet) return
    setMoney(subtractMoney(bet))
    setDropping(true); setResult(null)

    // 공 경로 시뮬레이션
    const path: { x: number; y: number }[] = []
    let pos = 0 // 중앙 기준 좌우 오프셋
    const startX = BOARD_WIDTH / 2

    path.push({ x: startX, y: 0 })

    for (let row = 0; row < ROWS; row++) {
      // 좌 또는 우로 떨어짐 (약간의 랜덤 편향)
      const goRight = Math.random() > 0.5
      pos += goRight ? 1 : -1
      const x = startX + pos * (PEG_SPACING / 2)
      const y = (row + 1) * (PEG_SPACING + 4)
      path.push({ x, y })
    }

    setBallPath(path)

    // 최종 슬롯 계산
    const finalSlot = Math.floor((pos + ROWS) / 2)
    const clampedSlot = Math.max(0, Math.min(SLOTS - 1, finalSlot))

    // 공 애니메이션 (경로 따라)
    const animateStep = async () => {
      for (let i = 0; i < path.length; i++) {
        await ballControls.start({
          x: path[i].x - startX,
          y: path[i].y,
          transition: { duration: 0.15, ease: 'easeIn' },
        })
      }

      // 결과
      const mult = MULTIPLIERS[clampedSlot]
      const win = Math.floor(bet * mult)
      setResult({ slot: clampedSlot, mult })

      if (win > 0) { setMoney(addMoney(win)) } else { setMoney(getMoney()) }
      setHistory((prev) => [{ mult, profit: win - bet }, ...prev.slice(0, 29)])
      setDropping(false)
    }

    animateStep()
  }

  const totalProfit = history.reduce((s, h) => s + h.profit, 0)

  return (
    <div className='h-[calc(100vh-52px)] flex overflow-hidden'>
      <div className='flex-1 flex flex-col items-center justify-center gap-[10px] overflow-y-auto py-[12px] px-[8px]'>
        <div className='arcade-box p-[20px] flex flex-col items-center gap-[10px]'
          style={{ background: 'linear-gradient(180deg, #0a1a3a 0%, #050d20 50%, #0a1a3a 100%)' }}>

          <span className='arcade-title neon-text' style={{ '--neon-color': '#f39c12', color: '#ffd700', fontSize: '22px', fontWeight: 900 } as any}>
            📐 PLINKO
          </span>

          {/* 보드 */}
          <div className='relative' style={{ width: BOARD_WIDTH, height: ROWS * (PEG_SPACING + 4) + 50, overflow: 'hidden' }}>
            {/* 핀(못) */}
            {Array.from({ length: ROWS }, (_, row) =>
              Array.from({ length: row + 3 }, (_, col) => {
                const x = BOARD_WIDTH / 2 - ((row + 2) * PEG_SPACING) / 2 + col * PEG_SPACING
                const y = (row + 1) * (PEG_SPACING + 4) - PEG_SPACING / 2
                return (
                  <div key={`${row}-${col}`} className='absolute w-[6px] h-[6px] rounded-full'
                    style={{ left: x - 3, top: y - 3, background: '#c9a84c' }} />
                )
              })
            )}

            {/* 공 */}
            <motion.div animate={ballControls}
              className='absolute w-[12px] h-[12px] rounded-full z-10'
              style={{ left: BOARD_WIDTH / 2 - 6, top: -6, background: '#e74c3c', boxShadow: '0 0 8px rgba(231,76,60,0.6)' }} />

            {/* 하단 슬롯 */}
            <div className='absolute bottom-0 left-0 right-0 flex'>
              {MULTIPLIERS.map((mult, i) => (
                <div key={i} className='flex-1 h-[36px] flex items-center justify-center text-[10px] font-bold'
                  style={{
                    background: result?.slot === i ? SLOT_COLORS[i] : `${SLOT_COLORS[i]}66`,
                    color: '#fff',
                    border: result?.slot === i ? '2px solid #ffd700' : '1px solid #ffffff22',
                    boxShadow: result?.slot === i ? '0 0 12px rgba(255,215,0,0.5)' : 'none',
                  }}>
                  x{mult}
                </div>
              ))}
            </div>
          </div>

          {/* 결과 */}
          <div className='h-[30px] flex items-center justify-center'>
            {result && (
              <motion.span animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: 3, duration: 0.4 }}
                className='arcade-title' style={{
                  color: result.mult >= 2 ? '#ffd700' : result.mult >= 1 ? '#4ade80' : '#e74c3c',
                  fontSize: '20px', fontWeight: 900,
                }}>
                x{result.mult} → ${Math.floor(bet * result.mult).toLocaleString()}
              </motion.span>
            )}
          </div>

          {/* 컨트롤 */}
          {!dropping && (
            <div className='flex items-center gap-[6px]'>
              <span className='arcade-title' style={{ color: '#c9a84c', fontSize: '10px' }}>BET</span>
              {BET_OPTIONS.map((v) => (
                <button key={v} onClick={() => setBet(v)}
                  className='arcade-btn px-[10px] py-[4px] rounded-[4px] text-[11px] font-bold'
                  style={{ background: bet === v ? '#c9a84c' : '#0a1a3a', color: bet === v ? '#000' : '#666',
                    border: bet === v ? '2px solid #ffd700' : '1px solid #1a3a6a' }}>
                  ${v >= 1000 ? `${v / 1000}K` : v}
                </button>
              ))}
              <input type='number' min={1} value={bet} onChange={(e) => { const v = parseInt(e.target.value) || 0; if (v >= 0) setBet(v) }}
                className='w-[70px] h-[26px] rounded-[4px] text-[11px] text-center font-bold outline-none'
                style={{ background: '#050d20', color: '#ffd700', border: '1px solid #c9a84c' }} />
            </div>
          )}

          <button onClick={drop} disabled={dropping || money < bet}
            className='arcade-btn w-[180px] h-[46px] rounded-full text-[16px] font-bold disabled:opacity-30'
            style={{ background: dropping ? '#333' : 'linear-gradient(180deg, #f39c12, #d68910)', color: 'white', border: '3px solid #c9a84c' }}>
            {dropping ? '⏳' : '📐 DROP'}
          </button>

          <div className='arcade-title text-[11px]' style={{ color: '#888' }}>
            BAL <span style={{ color: '#4ade80', fontWeight: 700, fontSize: '14px' }}>${money.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 사이드 패널 */}
      <div className='hidden lg:flex flex-col w-[240px] overflow-y-auto py-[12px] px-[10px] gap-[10px]'
        style={{ background: '#050d20', borderLeft: '2px solid #c9a84c33' }}>
        <div className='arcade-box p-[10px]' style={{ background: '#0a1a3a' }}>
          <div className='arcade-title text-[10px] mb-[6px]' style={{ color: '#c9a84c' }}>MULTIPLIERS</div>
          <div className='flex flex-wrap gap-[4px]'>
            {MULTIPLIERS.map((m, i) => (
              <div key={i} className='px-[6px] py-[2px] rounded-[3px] text-[10px] font-bold text-white'
                style={{ background: SLOT_COLORS[i] }}>x{m}</div>
            ))}
          </div>
        </div>
        <div className='arcade-box p-[10px]' style={{ background: '#0a1a3a' }}>
          <div className='arcade-title text-[10px] mb-[6px]' style={{ color: '#c9a84c' }}>STATS</div>
          {[
            ['DROPS', history.length, '#fff'],
            ['PROFIT', `${totalProfit >= 0 ? '+' : ''}$${totalProfit.toLocaleString()}`, totalProfit >= 0 ? '#ffd700' : '#e74c3c'],
          ].map(([l, v, c]) => (
            <div key={l as string} className='flex justify-between text-[11px] mb-[2px]'>
              <span style={{ color: '#888' }}>{l}</span><span style={{ color: c as string }}>{v}</span>
            </div>
          ))}
        </div>
        <div className='arcade-box p-[10px] flex-1' style={{ background: '#0a1a3a' }}>
          <div className='arcade-title text-[10px] mb-[6px]' style={{ color: '#c9a84c' }}>HISTORY</div>
          <div className='flex flex-col gap-[2px] max-h-[300px] overflow-y-auto'>
            {history.map((h, i) => (
              <div key={i} className='flex justify-between px-[4px] py-[2px] rounded-[2px]'
                style={{ background: h.profit > 0 ? '#0a2a1a' : 'transparent' }}>
                <span style={{ color: '#888', fontSize: '10px' }}>x{h.mult}</span>
                <span className='arcade-title' style={{ color: h.profit > 0 ? '#ffd700' : '#e74c3c', fontSize: '10px' }}>
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
