import React, { useEffect, useState } from 'react'
import { Coins, Info, Settings, Zap } from 'lucide-react'
import { getMoney, checkAndCharge, getTimeUntilNextCharge, resetMoney, CHARGE_CONFIG } from '@/utils/money'

const HUD = () => {
  const [money, setMoneyState] = useState(0)
  const [nextChargeMs, setNextChargeMs] = useState(0)
  const [showInfo, setShowInfo] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [chargeNotif, setChargeNotif] = useState('')

  useEffect(() => {
    const result = checkAndCharge()
    setMoneyState(getMoney())
    if (result.charged) {
      setChargeNotif(`+${result.amount.toLocaleString()}`)
      setTimeout(() => setChargeNotif(''), 3000)
    }
    setNextChargeMs(result.nextChargeMs)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = getTimeUntilNextCharge()
      setNextChargeMs(remaining)
      if (remaining <= 0) {
        const result = checkAndCharge()
        if (result.charged) {
          setMoneyState(getMoney())
          setChargeNotif(`+${result.amount.toLocaleString()}`)
          setTimeout(() => setChargeNotif(''), 3000)
        }
        setNextChargeMs(result.nextChargeMs)
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const sync = setInterval(() => setMoneyState(getMoney()), 2000)
    return () => clearInterval(sync)
  }, [])

  const formatTime = (ms: number) => {
    const sec = Math.ceil(ms / 1000)
    return `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, '0')}`
  }

  return (
    <>
      {/* 우측 상단 일자 배열 */}
      <div className='fixed top-[6px] right-[10px] z-[200] flex items-center gap-[6px]'>
        {/* 머니 */}
        <div className='arcade-box flex items-center gap-[6px] px-[12px] py-[5px]' style={{ background: '#000000cc' }}>
          <Coins size={14} color='#ffd700' style={{ animation: 'coinBounce 1.5s ease infinite' }} />
          <span className='arcade-title text-[13px] font-bold' style={{ color: '#ffd700' }}>{money.toLocaleString()}</span>
          {nextChargeMs <= 0
            ? <Zap size={12} color='#2ecc71' />
            : <span className='arcade-title text-[9px]' style={{ color: '#555' }}>{formatTime(nextChargeMs)}</span>
          }
        </div>

        {/* 정보 */}
        <button onClick={() => { setShowInfo(!showInfo); setShowSettings(false) }}
          className='arcade-btn flex items-center gap-[4px] px-[10px] py-[5px] rounded-[8px] text-[11px]'
          style={{ background: showInfo ? '#c9a84c' : '#000000cc', color: showInfo ? '#000' : '#888', border: '2px solid #c9a84c44' }}>
          <Info size={14} />
        </button>

        {/* 설정 */}
        <button onClick={() => { setShowSettings(!showSettings); setShowInfo(false) }}
          className='arcade-btn flex items-center gap-[4px] px-[10px] py-[5px] rounded-[8px] text-[11px]'
          style={{ background: showSettings ? '#c9a84c' : '#000000cc', color: showSettings ? '#000' : '#888', border: '2px solid #c9a84c44' }}>
          <Settings size={14} />
        </button>
      </div>

      {/* 충전 알림 */}
      {chargeNotif && (
        <div className='fixed top-[42px] right-[10px] z-[200] arcade-box px-[12px] py-[4px]'
          style={{ background: '#ffd70022', animation: 'winPulse 0.5s ease infinite' }}>
          <span className='arcade-title text-[12px]' style={{ color: '#ffd700' }}>⚡ {chargeNotif} CHARGED!</span>
        </div>
      )}

      {/* 정보 패널 */}
      {showInfo && (
        <div className='fixed top-[42px] right-[10px] z-[200] arcade-box p-[16px] w-[280px]' style={{ background: '#000000ee' }}>
          <div className='arcade-title text-[11px] mb-[8px]' style={{ color: '#c9a84c' }}>HOW TO PLAY</div>
          <div className='flex flex-col gap-[6px] text-[10px]' style={{ fontFamily: 'Courier New, monospace', color: '#aaa' }}>
            <div>
              <span style={{ color: '#ffd700' }}>이동</span>
              <p>PC: WASD / 화살표키</p>
              <p>모바일: 좌측 조이스틱</p>
            </div>
            <div>
              <span style={{ color: '#ffd700' }}>달리기</span>
              <p>PC: Shift 누른 채 이동</p>
              <p>모바일: 조이스틱 끝까지</p>
            </div>
            <div>
              <span style={{ color: '#ffd700' }}>점프</span>
              <p>PC: Space</p>
              <p>모바일: ⬆ 버튼</p>
            </div>
            <div>
              <span style={{ color: '#ffd700' }}>게임장 입장</span>
              <p>게임장 근처에서 E키 또는 입장 버튼</p>
            </div>
            <div>
              <span style={{ color: '#ffd700' }}>클릭 이동</span>
              <p>바닥을 클릭하면 해당 위치로 이동</p>
            </div>
            <div style={{ borderTop: '1px solid #333', paddingTop: '6px', marginTop: '2px' }}>
              <span style={{ color: '#ffd700' }}>게임 목록</span>
              <p>🎰 Roulette - 룰렛 테이블</p>
              <p>🎰 Slot Machine - 보라색 캐비넷</p>
              <p>💎 Mines - 보석 바위</p>
              <p>🚀 Crash - 로켓 발사대</p>
            </div>
            <div style={{ borderTop: '1px solid #333', paddingTop: '6px', marginTop: '2px' }}>
              <span style={{ color: '#ffd700' }}>머니</span>
              <p>기본 $10,000 / 1시간마다 $5,000 충전</p>
            </div>
          </div>
        </div>
      )}

      {/* 설정 패널 */}
      {showSettings && (
        <div className='fixed top-[42px] right-[10px] z-[200] arcade-box p-[14px] w-[200px]' style={{ background: '#000000ee' }}>
          <div className='arcade-title text-[10px] mb-[6px]' style={{ color: '#c9a84c' }}>SETTINGS</div>
          <button onClick={() => { resetMoney(); setMoneyState(getMoney()) }}
            className='arcade-btn w-full text-[11px] px-[8px] py-[5px] rounded-[4px] mb-[6px]'
            style={{ background: '#333', color: '#ffd700', border: '1px solid #c9a84c44' }}>
            RESET $10,000
          </button>
          <div className='arcade-title text-[9px]' style={{ color: '#555' }}>
            <p>CHARGE: ${CHARGE_CONFIG.amount.toLocaleString()} / 1HR</p>
          </div>
        </div>
      )}
    </>
  )
}

export default HUD
