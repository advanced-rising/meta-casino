import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { getMoney, addMoney, subtractMoney } from '@/utils/money'

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

  const setMoney = (v: number) => { setMoneyLocal(v); onMoneyChange?.(v) }
  useEffect(() => { const m = getMoney(); setMoneyLocal(m); onMoneyChange?.(m) }, [])

  // 배수 계산: 안전 타일을 열수록 배수 증가
  const calcMultiplier = useCallback((picks: number) => {
    if (picks === 0) return 1
    let mult = 1
    const safe = TOTAL - mineCount
    for (let i = 0; i < picks; i++) {
      mult *= (safe - i) > 0 ? TOTAL / (safe - i) : 1
    }
    return Math.round(mult * 100) / 100
  }, [mineCount])

  const startGame = () => {
    if (money < bet) return
    setMoney(subtractMoney(bet))

    // 지뢰 배치
    const mineSet = new Set<number>()
    while (mineSet.size < mineCount) {
      mineSet.add(Math.floor(Math.random() * TOTAL))
    }
    setMines(mineSet)
    setBoard(Array(TOTAL).fill('hidden'))
    setRevealed(0)
    setGameOver(false)
    setCashedOut(false)
    setCurrentMultiplier(1)
    setPlaying(true)
  }

  const revealTile = (idx: number) => {
    if (!playing || gameOver || cashedOut || board[idx] !== 'hidden') return

    const newBoard = [...board]

    if (mines.has(idx)) {
      // 지뢰!
      newBoard[idx] = 'mine'
      // 모든 지뢰 공개
      mines.forEach((m) => { newBoard[m] = 'mine' })
      setBoard(newBoard)
      setGameOver(true)
      setPlaying(false)
      setMoney(getMoney())
    } else {
      // 보석!
      newBoard[idx] = 'gem'
      const newRevealed = revealed + 1
      setBoard(newBoard)
      setRevealed(newRevealed)
      setCurrentMultiplier(calcMultiplier(newRevealed))

      // 전부 열면 자동 캐시아웃
      if (newRevealed >= TOTAL - mineCount) {
        const winAmount = Math.floor(bet * calcMultiplier(newRevealed))
        setMoney(addMoney(winAmount))
        setCashedOut(true)
        setPlaying(false)
      }
    }
  }

  const cashOut = () => {
    if (!playing || revealed === 0) return
    const winAmount = Math.floor(bet * currentMultiplier)
    setMoney(addMoney(winAmount))
    setCashedOut(true)
    setPlaying(false)
    // 지뢰 공개
    const newBoard = [...board]
    mines.forEach((m) => { newBoard[m] = 'mine' })
    setBoard(newBoard)
  }

  const potentialWin = Math.floor(bet * currentMultiplier)

  return (
    <div className='h-[calc(100vh-52px)] flex flex-col items-center justify-center gap-[14px]'>
      <div className='rounded-[20px] p-[24px] flex flex-col items-center gap-[12px]'
        style={{
          background: 'linear-gradient(180deg, #0a2540 0%, #061a2e 50%, #0a2540 100%)',
          border: '4px solid #c9a84c',
          boxShadow: '0 0 60px rgba(201,168,76,0.1), inset 0 0 40px rgba(0,0,0,0.5)',
        }}>

        <span style={{ color: '#c9a84c', fontSize: '24px', fontWeight: 900, letterSpacing: '4px' }}>
          💎 MINES 💣
        </span>

        {/* 5x5 그리드 */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${GRID}, 60px)`, gap: '4px' }}>
          {board.map((cell, idx) => (
            <motion.button
              key={idx}
              onClick={() => revealTile(idx)}
              disabled={!playing || cell !== 'hidden'}
              whileHover={cell === 'hidden' && playing ? { scale: 1.08 } : {}}
              whileTap={cell === 'hidden' && playing ? { scale: 0.95 } : {}}
              className='w-[60px] h-[60px] rounded-[8px] flex items-center justify-center text-[24px] font-bold disabled:cursor-default'
              style={{
                background: cell === 'hidden'
                  ? (playing ? 'linear-gradient(145deg, #1a3a5c, #0d2440)' : '#152535')
                  : cell === 'gem'
                    ? 'linear-gradient(145deg, #1a5a3a, #0d4028)'
                    : 'linear-gradient(145deg, #5a1a1a, #400d0d)',
                border: cell === 'hidden'
                  ? (playing ? '2px solid #2a5a8c' : '2px solid #1a3050')
                  : cell === 'gem'
                    ? '2px solid #2ecc71'
                    : '2px solid #e74c3c',
                boxShadow: cell === 'gem' ? '0 0 12px rgba(46,204,113,0.4)' : cell === 'mine' ? '0 0 12px rgba(231,76,60,0.4)' : 'none',
              }}>
              {cell === 'gem' && '💎'}
              {cell === 'mine' && '💣'}
              {cell === 'hidden' && playing && <span style={{ color: '#2a5a8c', fontSize: '16px' }}>?</span>}
            </motion.button>
          ))}
        </div>

        {/* 결과/상태 */}
        <div className='h-[36px] flex items-center justify-center'>
          {cashedOut && (
            <motion.div initial={{ scale: 0.5 }} animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}
              style={{ color: '#ffd700', fontSize: '22px', fontWeight: 900, textShadow: '0 0 15px rgba(255,215,0,0.5)' }}>
              💰 CASH OUT +${potentialWin.toLocaleString()} (x{currentMultiplier})
            </motion.div>
          )}
          {gameOver && !cashedOut && (
            <motion.div initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              style={{ color: '#e74c3c', fontSize: '22px', fontWeight: 900 }}>
              💥 BOOM! -${bet.toLocaleString()}
            </motion.div>
          )}
          {playing && revealed > 0 && (
            <div style={{ color: '#4ade80', fontSize: '16px', fontWeight: 700 }}>
              x{currentMultiplier} → ${potentialWin.toLocaleString()}
            </div>
          )}
        </div>

        {/* 설정 */}
        {!playing && (
          <>
            <div className='flex items-center gap-[8px]'>
              <span style={{ color: '#c9a84c', fontSize: '11px', fontWeight: 700 }}>BET</span>
              {BET_OPTIONS.map((v) => (
                <button key={v} onClick={() => setBet(v)}
                  className='px-[12px] py-[5px] rounded-[4px] text-[12px] font-bold'
                  style={{
                    background: bet === v ? 'linear-gradient(180deg, #c9a84c, #8B6914)' : '#1a2a3a',
                    color: bet === v ? '#1a0f08' : '#666',
                    border: bet === v ? '2px solid #ffd700' : '1px solid #2a4a6a',
                  }}>
                  ${v >= 1000 ? `${v / 1000}K` : v}
                </button>
              ))}
              <input type='number' min={1} value={bet}
                onChange={(e) => { const v = parseInt(e.target.value) || 0; if (v >= 0) setBet(v) }}
                className='w-[80px] h-[28px] rounded-[4px] text-[12px] text-center font-bold outline-none'
                style={{ background: '#0a1a2a', color: '#ffd700', border: '1px solid #c9a84c' }}
              />
            </div>
            <div className='flex items-center gap-[8px]'>
              <span style={{ color: '#c9a84c', fontSize: '11px', fontWeight: 700 }}>MINES</span>
              {MINE_OPTIONS.map((m) => (
                <button key={m} onClick={() => setMineCount(m)}
                  className='px-[10px] py-[5px] rounded-[4px] text-[12px] font-bold'
                  style={{
                    background: mineCount === m ? '#e74c3c' : '#1a2a3a',
                    color: mineCount === m ? 'white' : '#666',
                    border: mineCount === m ? '2px solid #e74c3c' : '1px solid #2a4a6a',
                  }}>
                  {m}
                </button>
              ))}
            </div>
          </>
        )}

        {/* 액션 */}
        <div className='flex items-center gap-[10px]'>
          {!playing ? (
            <button onClick={startGame} disabled={money < bet}
              className='w-[200px] h-[48px] rounded-full text-[16px] font-bold disabled:opacity-30'
              style={{
                background: 'linear-gradient(180deg, #2ecc71, #1e8449)',
                color: 'white', border: '3px solid #c9a84c', letterSpacing: '2px',
              }}>
              START
            </button>
          ) : (
            <button onClick={cashOut} disabled={revealed === 0}
              className='w-[200px] h-[48px] rounded-full text-[16px] font-bold disabled:opacity-30'
              style={{
                background: revealed > 0 ? 'linear-gradient(180deg, #f39c12, #d68910)' : '#333',
                color: 'white', border: '3px solid #c9a84c',
                boxShadow: revealed > 0 ? '0 0 15px rgba(243,156,18,0.4)' : 'none',
              }}>
              💰 CASH OUT x{currentMultiplier}
            </button>
          )}
        </div>

        <div className='text-[12px]' style={{ color: '#888' }}>
          BALANCE <span style={{ color: '#4ade80', fontWeight: 700, fontSize: '15px' }}>${money.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}

export default Mines
