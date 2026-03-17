import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { getMoney, addMoney, subtractMoney } from '@/utils/money'

const SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '🔔', '💎', '7️⃣', '⭐']
const COLS = 5
const ROWS = 5
const CELL = 56
const EXTRA = 30

const LINE_DEFS = [
  [0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24],
  [0,6,12,18,24],[4,8,12,16,20],
  [0,6,12,8,4],[20,16,12,6,0],
]

const LINE_NAMES = [
  '가로 1행', '가로 2행', '가로 3행', '가로 4행', '가로 5행',
  '대각 ↘', '대각 ↗',
  'V자 ↓', 'V자 ↑',
]

const LINE_COLORS = [
  '#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#3498db',
  '#9b59b6', '#e91e63',
  '#1abc9c', '#ff6348',
]

// 배당: 3매치 기본, 4매치 x3, 5매치 x10
const SYMBOL_MULT: Record<string, number> = {
  '7️⃣':50,'💎':25,'⭐':15,'🔔':10,'🍇':6,'🍊':4,'🍋':3,'🍒':2,
}

// 심볼 가중치: 낮은 심볼이 더 자주 나옴 → 당첨 확률 UP
const WEIGHTED_POOL: string[] = [
  '🍒','🍒','🍒','🍒','🍒','🍒',   // 6
  '🍋','🍋','🍋','🍋','🍋',         // 5
  '🍊','🍊','🍊','🍊','🍊',         // 5
  '🍇','🍇','🍇','🍇',              // 4
  '🔔','🔔','🔔',                    // 3
  '⭐','⭐',                          // 2
  '💎',                               // 1
  '7️⃣',                               // 1
]

const BET_OPTIONS = [100, 500, 1000, 2000]
const randSym = () => WEIGHTED_POOL[Math.floor(Math.random() * WEIGHTED_POOL.length)]

/**
 * 열 컴포넌트: framer-motion animate로 세로 스크롤
 * 스트립 = 현재 5개 + 랜덤 EXTRA개 + 최종 5개
 * 초기 y=0 (현재 5개 보임) → y=-(EXTRA+ROWS)*CELL (최종 5개 보임) → 완료 후 y=0으로 리셋 (최종을 현재로)
 */
const Column = ({ symbols, colIdx, spinSignal, finalSymbols, onDone, speed = 1 }: {
  symbols: string[]
  colIdx: number
  spinSignal: number
  finalSymbols: string[]
  onDone: () => void
  speed?: number
}) => {
  const controls = useAnimation()
  const [strip, setStrip] = useState<string[]>(symbols)
  const isSpinning = useRef(false)

  useEffect(() => {
    if (spinSignal === 0) return
    if (isSpinning.current) return
    isSpinning.current = true

    // 스트립 구축
    const mid = Array.from({ length: EXTRA + colIdx * 4 }, () => randSym())
    const full = [...symbols, ...mid, ...finalSymbols]
    setStrip(full)

    const scrollY = (full.length - ROWS) * CELL
    const delay = (colIdx * 0.2) / speed
    const duration = (1.5 + colIdx * 0.3) / speed

    controls.set({ y: 0 })

    controls.start({
      y: -scrollY,
      transition: {
        delay,
        duration,
        ease: [0.08, 0.82, 0.17, 1],
      },
    }).then(() => {
      // 애니메이션 완료: 스트립을 최종 결과만으로 교체 + y=0
      controls.set({ y: 0 })
      setStrip(finalSymbols)
      isSpinning.current = false
      onDone()
    })
  }, [spinSignal])

  // 외부에서 symbols가 변경되면 (grid 업데이트) 동기화
  useEffect(() => {
    if (!isSpinning.current) setStrip(symbols)
  }, [symbols])

  return (
    <div style={{ width: CELL, height: CELL * ROWS, overflow: 'hidden' }}>
      <motion.div animate={controls} className='flex flex-col'>
        {strip.map((sym, i) => (
          <div key={i} className='flex items-center justify-center shrink-0'
            style={{ width: CELL, height: CELL, fontSize: 28 }}>
            {sym}
          </div>
        ))}
      </motion.div>
    </div>
  )
}

const SlotMachine = ({ onMoneyChange }: { onMoneyChange?: (m: number) => void }) => {
  const [money, setMoneyLocal] = useState(0)
  const [bet, setBet] = useState(100)
  const [spinning, setSpinning] = useState(false)
  const [grid, setGrid] = useState<string[][]>(
    () => Array.from({ length: COLS }, () => Array.from({ length: ROWS }, () => randSym()))
  )
  const [winAmount, setWinAmount] = useState(0)
  const [winCells, setWinCells] = useState<Set<number>>(new Set())
  const [lastResult, setLastResult] = useState<string | null>(null)
  const [winLineCount, setWinLineCount] = useState(0)
  const [autoSpin, setAutoSpin] = useState(false)
  const [autoCount, setAutoCount] = useState(0)
  const [spinSignal, setSpinSignal] = useState(0)
  const [speed, setSpeed] = useState(1)
  const [showInfo, setShowInfo] = useState(false)
  const [gameHistory, setGameHistory] = useState<{ win: number; lines: number; bet: number }[]>([])
  const speedRef = useRef(1)
  const stoppedCols = useRef(0)
  const nextGrid = useRef<string[][]>([])
  const autoRef = useRef(false)

  const setMoney = (v: number) => { setMoneyLocal(v); onMoneyChange?.(v) }
  useEffect(() => { const m = getMoney(); setMoneyLocal(m); onMoneyChange?.(m) }, [])
  useEffect(() => { autoRef.current = autoSpin }, [autoSpin])
  useEffect(() => { speedRef.current = speed }, [speed])

  const checkWins = useCallback((g: string[][]): { total: number; cells: Set<number>; lineCount: number } => {
    const flat: string[] = []
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) flat.push(g[c][r])
    let total = 0; const cells = new Set<number>(); let lineCount = 0
    for (const line of LINE_DEFS) {
      const syms = line.map((i) => flat[i])
      let mc = 1
      for (let i = 1; i < syms.length; i++) { if (syms[i] === syms[0]) mc++; else break }
      if (mc >= 3) {
        // 3매치=x1, 4매치=x3, 5매치=x10
        const matchBonus = mc === 3 ? 1 : mc === 4 ? 3 : 10
        total += bet * (SYMBOL_MULT[syms[0]] || 2) * matchBonus
        line.slice(0, mc).forEach((i) => cells.add(i))
        lineCount++
      }
    }
    return { total, cells, lineCount }
  }, [bet])

  const onColDone = useCallback(() => {
    stoppedCols.current++
    if (stoppedCols.current >= COLS) {
      const fg = nextGrid.current
      setGrid(fg.map((c) => [...c]))
      const { total, cells, lineCount } = checkWins(fg)
      setWinCells(cells); setWinLineCount(lineCount)
      if (total > 0) { setMoney(addMoney(total)); setWinAmount(total); setLastResult('win') }
      else { setMoney(getMoney()); setWinAmount(0); setLastResult('lose') }
      setGameHistory((prev) => [{ win: total, lines: lineCount, bet }, ...prev.slice(0, 29)])
      setSpinning(false)
      if (autoRef.current) {
        setAutoCount((c) => c + 1)
        setTimeout(() => { if (autoRef.current) doSpin() }, 1800 / speedRef.current)
      }
    }
  }, [bet, checkWins])

  const doSpin = useCallback(() => {
    if (getMoney() < bet) { setAutoSpin(false); return }
    setMoney(subtractMoney(bet))
    setSpinning(true); setWinAmount(0); setWinCells(new Set()); setLastResult(null); setWinLineCount(0)
    stoppedCols.current = 0
    nextGrid.current = Array.from({ length: COLS }, () => Array.from({ length: ROWS }, () => randSym()))
    setSpinSignal((s) => s + 1)
  }, [bet])

  const spin = () => { if (!spinning && money >= bet) doSpin() }
  const toggleAuto = () => {
    if (autoSpin) { setAutoSpin(false); setAutoCount(0) }
    else { setAutoSpin(true); setAutoCount(0); if (!spinning) doSpin() }
  }

  const isWin = (row: number, col: number) => winCells.has(row * COLS + col)

  return (
    <div className='h-[calc(100vh-52px)] flex flex-col items-center gap-[12px] overflow-y-auto py-[16px]'>
      <div className='rounded-[20px] p-[20px] flex flex-col items-center gap-[10px]'
        style={{
          background: 'linear-gradient(180deg, #4a1068 0%, #220840 40%, #3a1058 100%)',
          border: '4px solid #c9a84c',
          boxShadow: '0 0 60px rgba(201,168,76,0.15), inset 0 0 40px rgba(0,0,0,0.5)',
        }}>

        <div className='flex items-center gap-[8px]'>
          <span className='text-[20px]'>⭐</span>
          <span style={{ color: '#ffd700', fontSize: '26px', fontWeight: 900, textShadow: '0 0 20px rgba(255,215,0,0.5)', letterSpacing: '4px' }}>
            PACHISLOT 777
          </span>
          <span className='text-[20px]'>⭐</span>
        </div>

        {/* 릴 - 항상 같은 5열 구조 */}
        <div className='p-[8px] rounded-[12px] relative'
          style={{ background: '#111', border: '3px solid #c9a84c', boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.8)' }}>

          <div className='flex gap-[2px]'>
            {Array.from({ length: COLS }, (_, c) => (
              <Column key={c}
                symbols={grid[c]}
                colIdx={c}
                spinSignal={spinSignal}
                finalSymbols={nextGrid.current[c] || grid[c]}
                onDone={onColDone}
                speed={autoSpin ? speed : 1}
              />
            ))}
          </div>

          {/* 당첨 셀 오버레이 */}
          {!spinning && winCells.size > 0 && (
            <div className='absolute inset-[8px] pointer-events-none'
              style={{ display: 'grid', gridTemplateColumns: `repeat(${COLS}, ${CELL}px)`, gap: '2px' }}>
              {Array.from({ length: ROWS * COLS }, (_, idx) => {
                const r = Math.floor(idx / COLS); const c = idx % COLS; const w = isWin(r, c)
                return <div key={idx} style={{
                  width: CELL, height: CELL, borderRadius: 4,
                  background: w ? 'rgba(255,215,0,0.2)' : 'transparent',
                  boxShadow: w ? '0 0 16px rgba(255,215,0,0.6)' : 'none',
                  animation: w ? 'winGlow 0.8s ease infinite alternate' : 'none',
                }} />
              })}
            </div>
          )}

          {lastResult === 'win' && !spinning && (
            <div className='absolute inset-0 rounded-[12px] pointer-events-none'
              style={{ background: 'radial-gradient(circle, rgba(255,215,0,0.12) 0%, transparent 70%)', animation: 'winFlash 1.5s ease infinite' }} />
          )}
        </div>

        {/* 결과 */}
        <div className='h-[40px] flex items-center justify-center'>
          {lastResult === 'win' && winAmount > 0 && (
            <motion.div className='flex items-center gap-[8px]'
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [1, 1.1, 1], opacity: 1 }}
              transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}>
              <span className='text-[22px]'>🎰</span>
              <span className='text-[22px]'>🎉</span>
              <span style={{ color: '#ffd700', fontSize: '26px', fontWeight: 900, textShadow: '0 0 20px rgba(255,215,0,0.7), 0 0 40px rgba(255,215,0,0.3)' }}>
                +${winAmount.toLocaleString()}
              </span>
              <span className='text-[12px] px-[6px] py-[2px] rounded-[4px]' style={{ background: '#ffd70033', color: '#ffd700' }}>
                {winLineCount}LINE{winLineCount > 1 ? 'S' : ''}
              </span>
              <span className='text-[22px]'>🎉</span>
              <span className='text-[22px]'>🎰</span>
            </motion.div>
          )}
          {lastResult === 'lose' && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: '#444', fontSize: '13px' }}>MISS</motion.span>
          )}
        </div>

        {/* 배팅 */}
        <div className='flex items-center gap-[8px]'>
          <span style={{ color: '#c9a84c', fontSize: '11px', fontWeight: 700 }}>BET</span>
          {BET_OPTIONS.map((v) => (
            <button key={v} onClick={() => !spinning && setBet(v)}
              className='px-[12px] py-[5px] rounded-[4px] text-[12px] font-bold'
              style={{
                background: bet === v ? 'linear-gradient(180deg, #c9a84c, #8B6914)' : '#222',
                color: bet === v ? '#1a0f08' : '#666',
                border: bet === v ? '2px solid #ffd700' : '1px solid #444',
              }}>
              ${v >= 1000 ? `${v / 1000}K` : v}
            </button>
          ))}
        </div>

        <div className='flex items-center gap-[10px]'>
          <button onClick={spin} disabled={spinning || money < bet || autoSpin}
            className='w-[160px] h-[48px] rounded-full text-[17px] font-bold disabled:opacity-30'
            style={{
              background: spinning ? '#333' : 'linear-gradient(180deg, #e74c3c, #a93226)',
              color: 'white', border: '3px solid #c9a84c', letterSpacing: '2px',
              boxShadow: spinning ? 'none' : '0 4px 15px rgba(231,76,60,0.4)',
            }}>
            {spinning ? '⏳' : '🎰 SPIN'}
          </button>
          <button onClick={toggleAuto} disabled={spinning && !autoSpin}
            className='w-[100px] h-[48px] rounded-full text-[13px] font-bold disabled:opacity-30'
            style={{
              background: autoSpin ? 'linear-gradient(180deg, #27ae60, #1e8449)' : '#333',
              color: autoSpin ? 'white' : '#888',
              border: autoSpin ? '3px solid #2ecc71' : '2px solid #555',
              boxShadow: autoSpin ? '0 0 12px rgba(46,204,113,0.4)' : 'none',
            }}>
            {autoSpin ? `AUTO (${autoCount})` : 'AUTO'}
          </button>

          {/* 배속 (AUTO 중에만 활성) */}
          {autoSpin && (
            <div className='flex gap-[4px]'>
              {[1, 2, 3, 5].map((s) => (
                <button key={s} onClick={() => setSpeed(s)}
                  className='w-[36px] h-[36px] rounded-[6px] text-[11px] font-bold'
                  style={{
                    background: speed === s ? '#c9a84c' : '#333',
                    color: speed === s ? '#1a0f08' : '#666',
                    border: speed === s ? '2px solid #ffd700' : '1px solid #555',
                  }}>
                  x{s}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className='text-[12px]' style={{ color: '#888' }}>
          BALANCE <span style={{ color: '#4ade80', fontWeight: 700, fontSize: '15px' }}>${money.toLocaleString()}</span>
        </div>
      </div>

      {/* INFO 토글 */}
      <button onClick={() => setShowInfo(!showInfo)}
        className='text-[11px] px-[12px] py-[4px] rounded-[4px]'
        style={{ background: showInfo ? '#c9a84c' : '#222', color: showInfo ? '#1a0f08' : '#888', border: '1px solid #c9a84c44' }}>
        {showInfo ? '닫기' : '📋 배당 & 라인 & 기록'}
      </button>

      {showInfo && (
        <div className='rounded-[10px] p-[14px] max-w-[600px] w-full flex flex-col gap-[10px]'
          style={{ background: '#150825', border: '1px solid #c9a84c33' }}>

          {/* 심볼 배당 */}
          <div>
            <div className='text-[10px] mb-[4px]' style={{ color: '#c9a84c' }}>심볼 배당</div>
            <div className='flex gap-[8px] flex-wrap'>
              {SYMBOLS.map((s) => (
                <div key={s} className='flex items-center gap-[3px] px-[6px] py-[2px] rounded-[4px]' style={{ background: '#1a0a2e' }}>
                  <span className='text-[16px]'>{s}</span>
                  <span style={{ color: '#c9a84c', fontSize: '10px' }}>x{SYMBOL_MULT[s]}</span>
                </div>
              ))}
            </div>
            <div className='flex gap-[10px] mt-[4px]'>
              <span style={{ color: '#888', fontSize: '10px' }}>3매치=x1</span>
              <span style={{ color: '#c9a84c', fontSize: '10px' }}>4매치=x3</span>
              <span style={{ color: '#ffd700', fontSize: '10px' }}>5매치=x10</span>
            </div>
          </div>

          {/* 라인 패턴 */}
          <div>
            <div className='text-[10px] mb-[4px]' style={{ color: '#c9a84c' }}>당첨 라인 패턴 ({LINE_DEFS.length}개)</div>
            <div className='grid grid-cols-3 gap-[6px]'>
              {LINE_DEFS.map((line, li) => (
                <div key={li} className='flex items-center gap-[6px] px-[6px] py-[4px] rounded-[4px]' style={{ background: '#0d0518' }}>
                  {/* 5x5 미니 그리드 */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 8px)', gap: '1px' }}>
                    {Array.from({ length: 25 }, (_, idx) => (
                      <div key={idx} style={{
                        width: 8, height: 8, borderRadius: 2,
                        background: line.includes(idx) ? LINE_COLORS[li] : '#1a1a1a',
                      }} />
                    ))}
                  </div>
                  <span style={{ color: LINE_COLORS[li], fontSize: '9px', fontWeight: 700 }}>{LINE_NAMES[li]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 히스토리 */}
          {gameHistory.length > 0 && (
            <div>
              <div className='text-[10px] mb-[4px]' style={{ color: '#c9a84c' }}>최근 기록</div>
              <div className='flex flex-col gap-[2px] max-h-[120px] overflow-y-auto'>
                {gameHistory.map((h, i) => (
                  <div key={i} className='flex items-center gap-[8px] px-[6px] py-[2px] rounded-[3px]'
                    style={{ background: h.win > 0 ? '#1a3a1a' : '#1a1a1a' }}>
                    <span className='text-[10px]' style={{ color: '#666', minWidth: '20px' }}>#{i + 1}</span>
                    <span className='text-[10px]' style={{ color: '#888' }}>${h.bet}</span>
                    {h.win > 0 ? (
                      <>
                        <span style={{ color: '#ffd700', fontSize: '11px', fontWeight: 700 }}>+${h.win.toLocaleString()}</span>
                        <span style={{ color: '#4ade80', fontSize: '9px' }}>{h.lines}line</span>
                      </>
                    ) : (
                      <span style={{ color: '#555', fontSize: '10px' }}>MISS</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SlotMachine
