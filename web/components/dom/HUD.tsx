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
    <div className='fixed top-[10px] right-[10px] z-[200] flex flex-col items-end gap-[8px]'>
      {/* Money display */}
      <div className='flex items-center gap-[8px] bg-[#000000aa] rounded-[8px] px-[12px] py-[6px]'>
        <span className='text-[16px]'>💰</span>
        <span className='text-white text-[14px] font-bold'>{money.toLocaleString()}</span>
      </div>

      {/* Next charge timer */}
      <div className='flex items-center gap-[6px] bg-[#000000aa] rounded-[8px] px-[12px] py-[4px]'>
        <span className='text-[12px]'>⏰</span>
        <span className='text-[#aaa] text-[11px]'>
          {nextChargeMs <= 0 ? '충전 가능!' : `다음 충전: ${formatTime(nextChargeMs)}`}
        </span>
      </div>

      {/* Settings button */}
      <button
        className='bg-[#000000aa] rounded-[8px] px-[12px] py-[4px] text-white text-[14px] hover:bg-[#000000cc]'
        onClick={() => setShowSettings(!showSettings)}>
        ⚙️
      </button>

      {/* Settings dropdown */}
      {showSettings && (
        <div className='bg-[#000000dd] rounded-[8px] px-[16px] py-[12px] flex flex-col gap-[8px] min-w-[180px]'>
          <p className='text-[#ccc] text-[12px]'>설정</p>
          <button
            className='bg-[#333] text-white text-[12px] px-[8px] py-[4px] rounded hover:bg-[#555]'
            onClick={handleReset}>
            머니 초기화 (10,000)
          </button>
          <div className='text-[#888] text-[10px]'>
            <p>충전: {CHARGE_CONFIG.amount.toLocaleString()} / 1시간</p>
            <p>조작: WASD 이동, Shift 달리기</p>
            <p>Space 점프, E 춤</p>
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
