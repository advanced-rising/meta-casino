import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { getMoney, addMoney, subtractMoney } from '@/utils/money'
import { loadHistory, saveHistory } from '@/utils/gameHistory'

const GRID = 5
const TOTAL = GRID * GRID
const MINE_OPTIONS = [1, 3, 5, 7, 10]
const BET_OPTIONS = [100, 500, 1000, 2000]

const Mines = ({ onMoneyChange }: { onMoneyChange?: (m: number) => void }) => {
  const [money, setMoneyLocal] = useState(0)
  const [bet, setBet] = useState(100)
  const [mineCount, setMineCount] = useState(3)
  const [playing, setPlaying] = useState(false)
  const [board, setBoard] = useState<('hidden' | 'gem' | 'mine')[]>(Array(TOTAL).fill('hidden'))
  const [mines, setMines] = useState<Set<number>>(new Set())
  const [revealed, setRevealed] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [cashedOut, setCashedOut] = useState(false)
  const [currentMultiplier, setCurrentMultiplier] = useState(1)
  const [history, setHistory] = useState<{ gems: number; mult: number; profit: number; mines: number }[]>(() => loadHistory('mines'))

  const setMoney = (v: number) => { setMoneyLocal(v); onMoneyChange?.(v) }
  useEffect(() => { const m = getMoney(); setMoneyLocal(m); onMoneyChange?.(m) }, [])
  useEffect(() => { saveHistory('mines', history) }, [history])

  const calcMultiplier = useCallback((picks: number) => {
    if (picks === 0) return 1
    let mult = 1
    const safe = TOTAL - mineCount
    for (let i = 0; i < picks; i++) {
      mult *= (safe - i) > 0 ? (TOTAL - i) / (safe - i) : 1
    }
    return Math.round(mult * 100) / 100
  }, [mineCount])

  const startGame = () => {
    if (money < bet) return
    setMoney(subtractMoney(bet))
    const mineSet = new Set<number>()
    while (mineSet.size < mineCount) mineSet.add(Math.floor(Math.random() * TOTAL))
    setMines(mineSet); setBoard(Array(TOTAL).fill('hidden')); setRevealed(0)
    setGameOver(false); setCashedOut(false); setCurrentMultiplier(1); setPlaying(true)
  }

  const revealTile = (idx: number) => {
    if (!playing || gameOver || cashedOut || board[idx] !== 'hidden') return
    const newBoard = [...board]
    if (mines.has(idx)) {
      newBoard[idx] = 'mine'
      mines.forEach((m) => { newBoard[m] = 'mine' })
      setBoard(newBoard); setGameOver(true); setPlaying(false); setMoney(getMoney())
      setHistory((prev) => [{ gems: revealed, mult: 0, profit: -bet, mines: mineCount }, ...prev.slice(0, 29)])
    } else {
      newBoard[idx] = 'gem'
      const newRevealed = revealed + 1
      setBoard(newBoard); setRevealed(newRevealed)
      const mult = calcMultiplier(newRevealed)
      setCurrentMultiplier(mult)
      if (newRevealed >= TOTAL - mineCount) {
        const winAmount = Math.floor(bet * mult)
        setMoney(addMoney(winAmount)); setCashedOut(true); setPlaying(false)
        setHistory((prev) => [{ gems: newRevealed, mult, profit: winAmount - bet, mines: mineCount }, ...prev.slice(0, 29)])
      }
    }
  }

  const cashOut = () => {
    if (!playing || revealed === 0) return
    const winAmount = Math.floor(bet * currentMultiplier)
    setMoney(addMoney(winAmount)); setCashedOut(true); setPlaying(false)
    const newBoard = [...board]; mines.forEach((m) => { newBoard[m] = 'mine' }); setBoard(newBoard)
    setHistory((prev) => [{ gems: revealed, mult: currentMultiplier, profit: winAmount - bet, mines: mineCount }, ...prev.slice(0, 29)])
  }

  const potentialWin = Math.floor(bet * currentMultiplier)
  const totalGames = history.length
  const wins = history.filter((h) => h.profit > 0).length
  const totalProfit = history.reduce((s, h) => s + h.profit, 0)
  const bestMult = history.length > 0 ? Math.max(...history.filter((h) => h.mult > 0).map((h) => h.mult), 0) : 0

  return (
    <div className='h-[calc(100vh-80px)] sm:h-[calc(100vh-102px)] flex overflow-hidden'>
      {/* 좌측: 게임 */}
      <div className='flex-1 flex flex-col items-center justify-center gap-[10px] overflow-y-auto py-[12px] px-[8px]'>
        <div className='flex flex-col items-center gap-[10px] p-[10px]'
          >

          <span className='arcade-title neon-text' style={{ '--neon-color': '#3498db', color: '#ffd700', fontSize: '16px', fontWeight: 900 } as any}>
            💎 MINES 💣
          </span>

          {/* 5x5 그리드 */}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${GRID}, minmax(40px, 58px))`, gap: '4px' }}>
            {board.map((cell, idx) => (
              <motion.button key={idx} onClick={() => revealTile(idx)}
                disabled={!playing || cell !== 'hidden'}
                whileHover={cell === 'hidden' && playing ? { scale: 1.06 } : {}}
                whileTap={cell === 'hidden' && playing ? { scale: 0.95 } : {}}
                className='w-[40px] h-[40px] sm:w-[58px] sm:h-[58px] rounded-[8px] flex items-center justify-center text-[22px] font-bold disabled:cursor-default'
                style={{
                  background: cell === 'hidden' ? (playing ? 'linear-gradient(145deg, #1a3a5c, #0d2440)' : '#152535')
                    : cell === 'gem' ? 'linear-gradient(145deg, #1a5a3a, #0d4028)' : 'linear-gradient(145deg, #5a1a1a, #400d0d)',
                  border: cell === 'hidden' ? (playing ? '2px solid #2a5a8c' : '2px solid #1a3050')
                    : cell === 'gem' ? '2px solid #2ecc71' : '2px solid #e74c3c',
                  boxShadow: cell === 'gem' ? '0 0 12px rgba(46,204,113,0.4)' : cell === 'mine' ? '0 0 12px rgba(231,76,60,0.4)' : 'none',
                }}>
                {cell === 'gem' && '💎'}
                {cell === 'mine' && '💣'}
                {cell === 'hidden' && playing && <span style={{ color: '#2a5a8c', fontSize: '14px' }}>?</span>}
              </motion.button>
            ))}
          </div>

          {/* 결과 */}
          <div className='h-[34px] flex items-center justify-center'>
            {cashedOut && (
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}
                className='arcade-title' style={{ color: '#ffd700', fontSize: '16px', fontWeight: 800, textShadow: '0 0 15px rgba(255,215,0,0.5)' }}>
                💰 +${potentialWin.toLocaleString()} (x{currentMultiplier})
              </motion.div>
            )}
            {gameOver && !cashedOut && (
              <motion.div initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className='arcade-title' style={{ color: '#e74c3c', fontSize: '16px', fontWeight: 800 }}>
                💥 BOOM!
              </motion.div>
            )}
            {playing && revealed > 0 && (
              <div className='arcade-title' style={{ color: '#4ade80', fontSize: '14px' }}>
                x{currentMultiplier} → ${potentialWin.toLocaleString()}
              </div>
            )}
          </div>

          {/* 설정 */}
          {!playing && (
            <>
              <div className='flex items-center gap-[6px] flex-wrap justify-center'>
                <span className='arcade-title' style={{ color: '#c9a84c', fontSize: '10px' }}>BET</span>
                {BET_OPTIONS.map((v) => (
                  <button key={v} onClick={() => setBet(v)}
                    className='arcade-btn px-[6px] py-[3px] rounded-[6px] text-[10px] font-bold'
                    style={{ background: bet === v ? '#c9a84c' : '#1a2a3a', color: bet === v ? '#000' : '#666',
                      border: bet === v ? '2px solid #ffd700' : '1px solid #2a4a6a' }}>
                    ${v >= 1000 ? `${v / 1000}K` : v}
                  </button>
                ))}
                <input type='number' min={1} value={bet}
                  onChange={(e) => { const v = parseInt(e.target.value) || 0; if (v > 0) setBet(v) }}
                  className='w-[55px] h-[24px] rounded-[4px] text-[11px] text-center font-bold outline-none'
                  style={{ background: '#0a1a2a', color: '#ffd700', border: '1px solid #c9a84c' }} />
              </div>
              <div className='flex items-center gap-[6px] flex-wrap justify-center'>
                <span className='arcade-title' style={{ color: '#c9a84c', fontSize: '10px' }}>MINES</span>
                {MINE_OPTIONS.map((m) => (
                  <button key={m} onClick={() => setMineCount(m)}
                    className='arcade-btn px-[8px] py-[4px] rounded-[4px] text-[11px] font-bold'
                    style={{ background: mineCount === m ? '#e74c3c' : '#1a2a3a', color: mineCount === m ? '#fff' : '#666',
                      border: mineCount === m ? '2px solid #e74c3c' : '1px solid #2a4a6a' }}>
                    {m}
                  </button>
                ))}
              </div>
            </>
          )}

          <div className='flex items-center gap-[10px]'>
            {!playing ? (
              <button onClick={startGame} disabled={money < bet}
                className='arcade-btn w-full max-w-[180px] h-[38px] rounded-full text-[15px] font-bold disabled:opacity-30'
                >
                START
              </button>
            ) : (
              <button onClick={cashOut} disabled={revealed === 0}
                className='arcade-btn w-full max-w-[180px] h-[38px] rounded-full text-[15px] font-bold disabled:opacity-30'
                style={{ background: revealed > 0 ? 'linear-gradient(180deg, #f39c12, #d68910)' : '#333', color: 'white', border: '3px solid #c9a84c',
                  boxShadow: revealed > 0 ? '0 0 15px rgba(243,156,18,0.4)' : 'none' }}>
                💰 CASH OUT x{currentMultiplier}
              </button>
            )}
          </div>

          <div className='text-[10px]' style={{ color: '#666' }}>
            BAL <span style={{ color: '#4ade80', fontWeight: 700, fontSize: '14px' }}>${money.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 우측: 정보 패널 */}
      <div className='hidden lg:flex flex-col w-[280px] overflow-y-auto py-[12px] px-[10px] gap-[10px]'
        style={{ background: '#061a2e', borderLeft: '2px solid #c9a84c33' }}>

        <div className='arcade-box p-[10px]' style={{ background: '#0a2540' }}>
          <div className='arcade-title text-[10px] mb-[6px]' style={{ color: '#c9a84c' }}>STATS</div>
          {[
            ['GAMES', totalGames, '#fff'],
            ['WINS', wins, '#2ecc71'],
            ['WIN RATE', `${totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0}%`, '#fff'],
            ['BEST', bestMult > 0 ? `x${bestMult}` : '-', '#ffd700'],
            ['PROFIT', `${totalProfit >= 0 ? '+' : ''}$${totalProfit.toLocaleString()}`, totalProfit >= 0 ? '#ffd700' : '#e74c3c'],
          ].map(([label, val, color]) => (
            <div key={label as string} className='flex justify-between text-[11px] mb-[2px]'>
              <span style={{ color: '#888' }}>{label}</span><span style={{ color: color as string }}>{val}</span>
            </div>
          ))}
        </div>

        <div className='arcade-box p-[10px]' style={{ background: '#0a2540' }}>
          <div className='arcade-title text-[10px] mb-[6px]' style={{ color: '#c9a84c' }}>MULTIPLIER TABLE</div>
          <div className='text-[10px]' style={{ color: '#888' }}>지뢰 {mineCount}개 기준:</div>
          {[1, 2, 3, 5, 8, 12, TOTAL - mineCount].filter((v, i, a) => v <= TOTAL - mineCount && a.indexOf(v) === i).map((picks) => (
            <div key={picks} className='flex justify-between text-[10px] mb-[1px]'>
              <span style={{ color: '#aaa' }}>💎 x{picks}</span>
              <span style={{ color: '#ffd700' }}>x{calcMultiplier(picks)}</span>
            </div>
          ))}
        </div>

        <div className='arcade-box p-[10px] flex-1' style={{ background: '#0a2540' }}>
          <div className='arcade-title text-[10px] mb-[6px]' style={{ color: '#c9a84c' }}>HISTORY</div>
          <div className='flex flex-col gap-[2px] max-h-[300px] overflow-y-auto'>
            {history.length === 0 && <span style={{ color: '#333', fontSize: '10px' }}>No games yet</span>}
            {history.map((h, i) => (
              <div key={i} className='flex items-center justify-between px-[4px] py-[2px] rounded-[2px]'
                style={{ background: h.profit > 0 ? '#0a2a1a' : '#1a0a0a' }}>
                <div className='flex items-center gap-[4px]'>
                  <span style={{ color: '#444', fontSize: '9px' }}>#{i + 1}</span>
                  <span style={{ color: '#aaa', fontSize: '10px' }}>💣{h.mines}</span>
                  <span style={{ color: '#3498db', fontSize: '10px' }}>💎{h.gems}</span>
                </div>
                <span className='arcade-title' style={{ color: h.profit > 0 ? '#ffd700' : '#e74c3c', fontSize: '10px' }}>
                  {h.profit > 0 ? `+$${h.profit.toLocaleString()}` : 'BOOM'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Mines
