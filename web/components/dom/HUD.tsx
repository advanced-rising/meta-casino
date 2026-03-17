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
        <div className='fixed top-[42px] right-[10px] z-[200] rounded-[12px] p-[14px] w-[300px] max-h-[80vh] overflow-y-auto' style={{ background: '#000000ee' }}>
          <div className='arcade-title text-[11px] mb-[8px]' style={{ color: '#c9a84c' }}>GUIDE</div>
          <div className='flex flex-col gap-[8px] text-[10px]' style={{ fontFamily: 'Pretendard, sans-serif', color: '#aaa' }}>

            <div className='rounded-[6px] p-[8px]' style={{ background: '#ffffff08' }}>
              <span className='arcade-title text-[10px]' style={{ color: '#ffd700' }}>조작법</span>
              <div className='grid grid-cols-2 gap-x-[8px] gap-y-[2px] mt-[4px]'>
                <span style={{ color: '#888' }}>이동</span><span>W/A/S/D 또는 조이스틱</span>
                <span style={{ color: '#888' }}>달리기</span><span>Shift 또는 조이스틱 끝까지</span>
                <span style={{ color: '#888' }}>점프</span><span>Space (짧게)</span>
                <span style={{ color: '#888' }}>비행</span><span>Space 꾹 (누르는 동안)</span>
                <span style={{ color: '#888' }}>입장</span><span>E키 또는 클릭</span>
                <span style={{ color: '#888' }}>클릭이동</span><span>바닥 클릭</span>
              </div>
            </div>

            <div className='rounded-[6px] p-[8px]' style={{ background: '#ffffff08' }}>
              <span className='arcade-title text-[10px]' style={{ color: '#ffd700' }}>머니</span>
              <p>초기 $10,000 / 1시간마다 $5,000 자동 충전</p>
            </div>

            <div className='rounded-[6px] p-[8px]' style={{ background: '#ffffff08' }}>
              <span className='arcade-title text-[10px]' style={{ color: '#ffd700' }}>카지노 게임 (11)</span>
              <div className='flex flex-col gap-[3px] mt-[4px]'>
                {[
                  ['🎰', 'Roulette', '숫자/색상 배팅, 최대 x36'],
                  ['🎰', 'Slot Machine', '5x5 빠칭코, 잭팟 x500, 오토+배속'],
                  ['💎', 'Mines', '보석 찾기, 지뢰 피하기, 캐시아웃'],
                  ['🚀', 'Crash', '배수 상승, 터지기 전 캐시아웃'],
                  ['🃏', 'Hi-Lo', '다음 카드 높/낮 맞추기, 연승 배수'],
                  ['🪙', 'Coin Flip', '3D 동전 뒤집기, x2'],
                  ['🎲', 'Dice', '주사위 2개, Over/Under/Exact'],
                  ['🎡', 'Fortune Wheel', '16칸 바퀴, x1~x20'],
                  ['📐', 'Plinko', '구슬 낙하, 1~20개 동시, x0.5~x8'],
                  ['🃏', 'Blackjack', 'Hit/Stand/Double, BJ=x2.5'],
                  ['🃏', 'Baccarat', 'Player/Banker/Tie, x2/x1.95/x9'],
                ].map(([emoji, name, desc], i) => (
                  <div key={i} className='flex gap-[4px]'>
                    <span>{emoji}</span>
                    <span style={{ color: '#fff', minWidth: '80px' }}>{name}</span>
                    <span style={{ color: '#666' }}>{desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className='rounded-[6px] p-[8px]' style={{ background: '#ffffff08' }}>
              <span className='arcade-title text-[10px]' style={{ color: '#ffd700' }}>아케이드 게임 (7)</span>
              <div className='flex flex-col gap-[3px] mt-[4px]'>
                {[
                  ['✊', 'RPS', '가위바위보 연승 도전, 캐시아웃'],
                  ['🏇', 'Horse Race', '5마리 경주, 배당 x2.5~x8'],
                  ['🏗️', 'Tower', '8층 탑, 함정 피해 올라가기, x1.4~x25'],
                  ['🎫', 'Scratch Card', '9칸 스크래치, 3매치 당첨'],
                  ['🎯', 'Limbo', '목표 배수 설정, 높을수록 고위험'],
                  ['🎨', 'Color Predict', '빨x2/초x3/보x5 색 예측'],
                  ['💣', 'Bomb Defuse', '5선 중 폭탄선 피하기, x1.5~x15'],
                ].map(([emoji, name, desc], i) => (
                  <div key={i} className='flex gap-[4px]'>
                    <span>{emoji}</span>
                    <span style={{ color: '#fff', minWidth: '80px' }}>{name}</span>
                    <span style={{ color: '#666' }}>{desc}</span>
                  </div>
                ))}
              </div>
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
