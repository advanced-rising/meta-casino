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

// 잭팟: 5x5 전체 같은 심볼이면 잭팟
const JACKPOT_MULT = 500
const isJackpot = (g: string[][]) => {
  const first = g[0][0]
  return g.every((col) => col.every((s) => s === first))
}

const SlotMachine = ({ onMoneyChange }: { onMoneyChange?: (m: number) => void }) => {
  const [money, setMoneyLocal] = useState(0)
  const [bet, setBet] = useState(100)
  const [jackpotHit, setJackpotHit] = useState(false)
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
      let { total, cells, lineCount } = checkWins(fg)

      // 잭팟 체크
      if (isJackpot(fg)) {
        total = bet * JACKPOT_MULT
        lineCount = 9
        for (let i = 0; i < 25; i++) cells.add(i)
        setJackpotHit(true)
        setTimeout(() => setJackpotHit(false), 6000)
      } else {
        setJackpotHit(false)
      }

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

  // 총 수익/손실 계산
  const totalProfit = gameHistory.reduce((sum, h) => sum + (h.win > 0 ? h.win - h.bet : -h.bet), 0)

  return (
    <div className='h-[calc(100vh-52px)] flex overflow-hidden'>
      {/* 좌측: 슬롯 머신 */}
      <div className='flex-1 flex flex-col items-center justify-center gap-[10px] lg:overflow-hidden overflow-y-auto py-[12px] px-[8px]'>
        {/* 잭팟 배너 */}
        {jackpotHit && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className='arcade-title text-center'
            style={{ color: '#ffd700', fontSize: '32px', fontWeight: 900, textShadow: '0 0 30px rgba(255,215,0,0.8), 0 0 60px rgba(255,215,0,0.4)' }}>
            🎰 JACKPOT!! 🎰
          </motion.div>
        )}

        <div className='arcade-box p-[16px] flex flex-col items-center gap-[8px]'
          style={{ background: 'linear-gradient(180deg, #4a1068 0%, #220840 40%, #3a1058 100%)' }}>

          <div className='flex items-center gap-[6px]'>
            <span className='text-[16px]'>⭐</span>
            <span className='arcade-title neon-text' style={{ '--neon-color': '#c9a84c', color: '#ffd700', fontSize: '22px', fontWeight: 900 } as any}>
              PACHISLOT 777
            </span>
            <span className='text-[16px]'>⭐</span>
          </div>

          {/* 릴 */}
          <div className='p-[6px] rounded-[10px] relative'
            style={{ background: '#111', border: '3px solid #c9a84c', boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.8)' }}>
            <div className='flex gap-[2px]'>
              {Array.from({ length: COLS }, (_, c) => (
                <Column key={c} symbols={grid[c]} colIdx={c} spinSignal={spinSignal}
                  finalSymbols={nextGrid.current[c] || grid[c]} onDone={onColDone} speed={autoSpin ? speed : 1} />
              ))}
            </div>
            {!spinning && winCells.size > 0 && (
              <div className='absolute inset-[6px] pointer-events-none'
                style={{ display: 'grid', gridTemplateColumns: `repeat(${COLS}, ${CELL}px)`, gap: '2px' }}>
                {Array.from({ length: ROWS * COLS }, (_, idx) => {
                  const w = isWin(Math.floor(idx / COLS), idx % COLS)
                  return <div key={idx} style={{ width: CELL, height: CELL, borderRadius: 4,
                    background: w ? 'rgba(255,215,0,0.2)' : 'transparent',
                    boxShadow: w ? '0 0 16px rgba(255,215,0,0.6)' : 'none',
                    animation: w ? 'winGlow 0.8s ease infinite alternate' : 'none',
                  }} />
                })}
              </div>
            )}
            {lastResult === 'win' && !spinning && (
              <div className='absolute inset-0 rounded-[10px] pointer-events-none'
                style={{ background: 'radial-gradient(circle, rgba(255,215,0,0.12) 0%, transparent 70%)', animation: 'winFlash 1.5s ease infinite' }} />
            )}
          </div>

          {/* 결과 */}
          <div className='h-[32px] flex items-center justify-center'>
            {lastResult === 'win' && winAmount > 0 && (
              <motion.div className='flex items-center gap-[6px]'
                animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}>
                <span className='text-[18px]'>🎉</span>
                <span className='arcade-title' style={{ color: '#ffd700', fontSize: '22px', fontWeight: 900, textShadow: '0 0 15px rgba(255,215,0,0.5)' }}>
                  +${winAmount.toLocaleString()}
                </span>
                <span className='text-[10px] px-[4px] py-[1px] rounded-[3px]' style={{ background: '#ffd70033', color: '#ffd700' }}>
                  {winLineCount}L
                </span>
                <span className='text-[18px]'>🎉</span>
              </motion.div>
            )}
            {lastResult === 'lose' && <span className='arcade-title' style={{ color: '#444', fontSize: '12px' }}>MISS</span>}
          </div>

          {/* 컨트롤 */}
          <div className='flex items-center gap-[6px] flex-wrap justify-center'>
            <span className='arcade-title' style={{ color: '#c9a84c', fontSize: '10px' }}>BET</span>
            {BET_OPTIONS.map((v) => (
              <button key={v} onClick={() => !spinning && setBet(v)}
                className='arcade-btn px-[10px] py-[4px] rounded-[4px] text-[11px] font-bold'
                style={{ background: bet === v ? '#c9a84c' : '#222', color: bet === v ? '#000' : '#666', border: bet === v ? '2px solid #ffd700' : '1px solid #444' }}>
                ${v >= 1000 ? `${v / 1000}K` : v}
              </button>
            ))}
            <input type='number' min={1} disabled={spinning} value={bet}
              onChange={(e) => { const v = parseInt(e.target.value) || 0; if (v >= 0) setBet(v) }}
              className='w-[70px] h-[26px] rounded-[4px] text-[11px] text-center font-bold outline-none'
              style={{ background: '#111', color: '#ffd700', border: '1px solid #c9a84c' }} />
          </div>

          <div className='flex items-center gap-[8px]'>
            <button onClick={spin} disabled={spinning || money < bet || autoSpin}
              className='arcade-btn w-[140px] h-[44px] rounded-full text-[15px] font-bold disabled:opacity-30'
              style={{ background: spinning ? '#333' : 'linear-gradient(180deg, #e74c3c, #a93226)',
                color: 'white', border: '3px solid #c9a84c', letterSpacing: '2px' }}>
              {spinning ? '⏳' : '🎰 SPIN'}
            </button>
            <button onClick={toggleAuto} disabled={spinning && !autoSpin}
              className='arcade-btn w-[80px] h-[44px] rounded-full text-[12px] font-bold disabled:opacity-30'
              style={{ background: autoSpin ? '#27ae60' : '#333', color: autoSpin ? '#fff' : '#888',
                border: autoSpin ? '3px solid #2ecc71' : '2px solid #555' }}>
              {autoSpin ? `x${speed} (${autoCount})` : 'AUTO'}
            </button>
            {autoSpin && (
              <div className='flex gap-[3px]'>
                {[1, 2, 3, 5].map((s) => (
                  <button key={s} onClick={() => setSpeed(s)}
                    className='arcade-btn w-[30px] h-[30px] rounded-[4px] text-[10px] font-bold'
                    style={{ background: speed === s ? '#c9a84c' : '#222', color: speed === s ? '#000' : '#555',
                      border: speed === s ? '1px solid #ffd700' : '1px solid #444' }}>
                    {s}x
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className='arcade-title text-[11px]' style={{ color: '#888' }}>
            BAL <span style={{ color: '#4ade80', fontWeight: 700, fontSize: '14px' }}>${money.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 우측: 정보 패널 (데스크탑) */}
      <div className='hidden lg:flex flex-col w-[300px] overflow-y-auto py-[12px] px-[10px] gap-[10px]'
        style={{ background: '#0d0518', borderLeft: '2px solid #c9a84c33' }}>

        {/* 잭팟 정보 */}
        <div className='arcade-box p-[10px] text-center' style={{ background: '#1a0a2e' }}>
          <div className='arcade-title text-[10px]' style={{ color: '#c9a84c' }}>JACKPOT (25매치)</div>
          <div className='arcade-title text-[20px] font-bold neon-text' style={{ '--neon-color': '#e74c3c', color: '#ffd700' } as any}>
            x{JACKPOT_MULT}
          </div>
          <div className='text-[10px]' style={{ color: '#666' }}>전체 5x5 동일 심볼</div>
        </div>

        {/* 통계 */}
        <div className='arcade-box p-[10px]' style={{ background: '#1a0a2e' }}>
          <div className='arcade-title text-[10px] mb-[6px]' style={{ color: '#c9a84c' }}>STATS</div>
          <div className='flex justify-between text-[11px] mb-[2px]'>
            <span style={{ color: '#888' }}>SPINS</span>
            <span style={{ color: '#fff' }}>{gameHistory.length}</span>
          </div>
          <div className='flex justify-between text-[11px] mb-[2px]'>
            <span style={{ color: '#888' }}>WINS</span>
            <span style={{ color: '#2ecc71' }}>{gameHistory.filter((h) => h.win > 0).length}</span>
          </div>
          <div className='flex justify-between text-[11px]'>
            <span style={{ color: '#888' }}>PROFIT</span>
            <span style={{ color: totalProfit >= 0 ? '#ffd700' : '#e74c3c' }}>
              {totalProfit >= 0 ? '+' : ''}${totalProfit.toLocaleString()}
            </span>
          </div>
        </div>

        {/* 심볼 배당 */}
        <div className='arcade-box p-[10px]' style={{ background: '#1a0a2e' }}>
          <div className='arcade-title text-[10px] mb-[6px]' style={{ color: '#c9a84c' }}>PAYOUTS</div>
          {SYMBOLS.map((s) => (
            <div key={s} className='flex justify-between items-center text-[11px] mb-[1px]'>
              <span className='text-[16px]'>{s}</span>
              <div className='flex gap-[8px]'>
                <span style={{ color: '#888' }}>3x{SYMBOL_MULT[s]}</span>
                <span style={{ color: '#c9a84c' }}>4x{SYMBOL_MULT[s] * 3}</span>
                <span style={{ color: '#ffd700' }}>5x{SYMBOL_MULT[s] * 10}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 라인 패턴 */}
        <div className='arcade-box p-[10px]' style={{ background: '#1a0a2e' }}>
          <div className='arcade-title text-[10px] mb-[6px]' style={{ color: '#c9a84c' }}>LINES ({LINE_DEFS.length})</div>
          <div className='grid grid-cols-3 gap-[4px]'>
            {LINE_DEFS.map((line, li) => (
              <div key={li} className='flex items-center gap-[4px]'>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 6px)', gap: '1px' }}>
                  {Array.from({ length: 25 }, (_, idx) => (
                    <div key={idx} style={{ width: 6, height: 6, borderRadius: 1,
                      background: line.includes(idx) ? LINE_COLORS[li] : '#1a1a1a' }} />
                  ))}
                </div>
                <span style={{ color: LINE_COLORS[li], fontSize: '8px' }}>{LINE_NAMES[li]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 히스토리 */}
        <div className='arcade-box p-[10px] flex-1' style={{ background: '#1a0a2e' }}>
          <div className='arcade-title text-[10px] mb-[6px]' style={{ color: '#c9a84c' }}>HISTORY</div>
          <div className='flex flex-col gap-[2px] max-h-[200px] overflow-y-auto'>
            {gameHistory.length === 0 && <span style={{ color: '#333', fontSize: '10px' }}>No spins yet</span>}
            {gameHistory.map((h, i) => (
              <div key={i} className='flex items-center gap-[6px] px-[4px] py-[1px] rounded-[2px]'
                style={{ background: h.win > 0 ? '#1a3a1a' : 'transparent' }}>
                <span style={{ color: '#444', fontSize: '9px', minWidth: '16px' }}>#{i + 1}</span>
                <span style={{ color: '#666', fontSize: '10px' }}>${h.bet}</span>
                {h.win > 0 ? (
                  <span style={{ color: '#ffd700', fontSize: '10px', fontWeight: 700 }}>+${h.win.toLocaleString()} ({h.lines}L)</span>
                ) : (
                  <span style={{ color: '#333', fontSize: '9px' }}>-</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* INFO 토글 (모바일만) */}
      <button onClick={() => setShowInfo(!showInfo)}
        className='lg:hidden text-[11px] px-[12px] py-[4px] rounded-[4px]'
        style={{ background: showInfo ? '#c9a84c' : '#222', color: showInfo ? '#1a0f08' : '#888', border: '1px solid #c9a84c44' }}>
        {showInfo ? '닫기' : '📋 배당 & 라인 & 기록'}
      </button>

      {showInfo && (<div className='lg:hidden'>
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
      </div>)}
    </div>
  )
}

export default SlotMachine
