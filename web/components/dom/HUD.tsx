import React, { useEffect, useState, useCallback } from 'react'
import { getMoney, checkAndCharge, getTimeUntilNextCharge, resetMoney, CHARGE_CONFIG } from '@/utils/money'

const HUD = () => {
  const [money, setMoneyState] = useState(0)
  const [nextChargeMs, setNextChargeMs] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [chargeNotification, setChargeNotification] = useState('')

  // Init money + check charge on mount
  useEffect(() => {
    const result = checkAndCharge()
    setMoneyState(getMoney())
    if (result.charged) {
      setChargeNotification(`+${result.amount.toLocaleString()} 충전 완료!`)
      setTimeout(() => setChargeNotification(''), 3000)
    }
    setNextChargeMs(result.nextChargeMs)
  }, [])

  // Update timer every second
  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = getTimeUntilNextCharge()
      setNextChargeMs(remaining)

      // Auto charge when timer reaches 0
      if (remaining <= 0) {
        const result = checkAndCharge()
        if (result.charged) {
          setMoneyState(getMoney())
          setChargeNotification(`+${result.amount.toLocaleString()} 충전 완료!`)
          setTimeout(() => setChargeNotification(''), 3000)
        }
        setNextChargeMs(result.nextChargeMs)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Sync money periodically (in case game pages modify it)
  useEffect(() => {
    const sync = setInterval(() => {
      setMoneyState(getMoney())
    }, 2000)
    return () => clearInterval(sync)
  }, [])

  const formatTime = (ms: number) => {
    const totalSec = Math.ceil(ms / 1000)
    const min = Math.floor(totalSec / 60)
    const sec = totalSec % 60
    return `${min}:${sec.toString().padStart(2, '0')}`
  }

  const handleReset = () => {
    resetMoney()
    setMoneyState(getMoney())
    setShowSettings(false)
  }

  return (
    <div className='fixed top-[48px] right-[10px] z-[200] flex flex-col items-end gap-[6px]'>
      {/* Money */}
      <div className='arcade-box flex items-center gap-[8px] px-[14px] py-[6px]' style={{ background: '#000000cc' }}>
        <span className='text-[14px]' style={{ animation: 'coinBounce 1.5s ease infinite' }}>💰</span>
        <span className='arcade-title text-[14px] font-bold' style={{ color: '#ffd700' }}>{money.toLocaleString()}</span>
      </div>

      {/* Timer */}
      <div className='flex items-center gap-[6px] px-[12px] py-[3px] rounded-[6px]' style={{ background: '#000000aa', border: '1px solid #333' }}>
        <span className='text-[10px]'>⏰</span>
        <span className='arcade-title text-[10px]' style={{ color: nextChargeMs <= 0 ? '#2ecc71' : '#888' }}>
          {nextChargeMs <= 0 ? 'READY!' : formatTime(nextChargeMs)}
        </span>
      </div>

      {/* Settings */}
      <button
        className='arcade-btn px-[10px] py-[3px] rounded-[6px] text-[12px]'
        style={{ background: '#000000aa', border: '1px solid #333', color: '#888' }}
        onClick={() => setShowSettings(!showSettings)}>
        ⚙
      </button>

      {showSettings && (
        <div className='arcade-box p-[12px] flex flex-col gap-[6px] min-w-[180px]' style={{ background: '#000000ee' }}>
          <p className='arcade-title text-[10px]' style={{ color: '#c9a84c' }}>SETTINGS</p>
          <button
            className='arcade-btn text-[11px] px-[8px] py-[4px] rounded-[4px]'
            style={{ background: '#333', color: '#ffd700', border: '1px solid #c9a84c44' }}
            onClick={handleReset}>
            RESET $10,000
          </button>
          <div className='text-[9px]' style={{ color: '#666', fontFamily: 'Courier New, monospace' }}>
            <p>CHARGE: ${CHARGE_CONFIG.amount.toLocaleString()} / 1HR</p>
            <p>MOVE: WASD | RUN: SHIFT</p>
            <p>JUMP: SPACE | ENTER: E</p>
          </div>
        </div>
      )}

      {/* Charge notification */}
      {chargeNotification && (
        <div className='bg-[#FFD700] text-black rounded-[8px] px-[16px] py-[8px] text-[14px] font-bold animate-pulse'>
          {chargeNotification}
        </div>
      )}
    </div>
  )
}

export default HUD
