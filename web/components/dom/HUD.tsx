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
      {/* 우측 상단 */}
      <div className='fixed top-[8px] right-[10px] z-[200] flex items-center gap-[4px]'>
        <div className='glass-dark flex items-center gap-[6px] px-[12px] py-[6px]'>
          <Coins size={13} color='#22c55e' />
          <span className='text-[13px] font-bold' style={{ color: '#fff' }}>${money.toLocaleString()}</span>
          {nextChargeMs <= 0
            ? <Zap size={11} color='#22c55e' />
            : <span className='text-[9px]' style={{ color: '#555' }}>{formatTime(nextChargeMs)}</span>
          }
        </div>

        <button onClick={() => { setShowInfo(!showInfo); setShowSettings(false) }}
          className='glass-dark flex items-center px-[8px] py-[6px] transition-all hover:bg-white/10'
          style={{ color: showInfo ? '#fff' : '#666' }}>
          <Info size={14} />
        </button>

        <button onClick={() => { setShowSettings(!showSettings); setShowInfo(false) }}
          className='glass-dark flex items-center px-[8px] py-[6px] transition-all hover:bg-white/10'
          style={{ color: showSettings ? '#fff' : '#666' }}>
          <Settings size={14} />
        </button>
      </div>

      {chargeNotif && (
        <div className='fixed top-[44px] right-[10px] z-[200] glass-dark px-[12px] py-[5px]'>
          <span className='text-[12px] font-medium' style={{ color: '#22c55e' }}>⚡ {chargeNotif} 충전됨</span>
        </div>
      )}

      {/* 정보 패널 */}
      {showInfo && (
        <div className='fixed top-[44px] right-[10px] z-[200] glass-dark p-[14px] w-[300px] max-h-[80vh] overflow-y-auto'>
          <div className='text-[12px] font-bold mb-[8px]' style={{ color: '#fff' }}>가이드</div>
          <div className='flex flex-col gap-[8px] text-[10px]' style={{ color: '#aaa' }}>

            <div className='glass p-[8px]'>
              <span className='text-[10px] font-semibold' style={{ color: '#fff' }}>조작법</span>
              <div className='grid grid-cols-2 gap-x-[8px] gap-y-[2px] mt-[4px]'>
                <span style={{ color: '#888' }}>이동</span><span>W/A/S/D 또는 조이스틱</span>
                <span style={{ color: '#888' }}>달리기</span><span>Shift 또는 조이스틱 끝까지</span>
                <span style={{ color: '#888' }}>점프</span><span>Space (짧게)</span>
                <span style={{ color: '#888' }}>비행</span><span>Space 꾹 (누르는 동안)</span>
                <span style={{ color: '#888' }}>입장</span><span>E키 또는 클릭</span>
                <span style={{ color: '#888' }}>클릭이동</span><span>바닥 클릭</span>
              </div>
            </div>

            <div className='glass p-[8px]'>
              <span className='text-[10px] font-semibold' style={{ color: '#fff' }}>머니</span>
              <p>초기 $10,000 / 1시간마다 $5,000 자동 충전</p>
            </div>

            <div className='glass p-[8px]'>
              <span className='text-[10px] font-semibold' style={{ color: '#fff' }}>카지노 게임 (11)</span>
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

            <div className='glass p-[8px]'>
              <span className='text-[10px] font-semibold' style={{ color: '#fff' }}>아케이드 게임 (7)</span>
              <div className='flex flex-col gap-[3px] mt-[4px]'>
                {[
                  ['✊', 'RPS', '가위바위보 연승 도전, 캐시아웃'],
                  ['🏇', 'Horse Race', '5마리 경주, 배당 x2.5~x8'],
                  ['🏗️', 'Tower', '8층 탑, 함정 피해 올라가기, x1.4~x25'],
                  ['🎫', 'Scratch Card', '9칸 스크래치, 3매치 당첨'],
                  ['🎯', 'Limbo', '목표 배수 설정, 높을수록 고위험'],
                  ['🎨', 'Color Predict', '빨x2/초x3/보x5 색 예측'],
                  ['💣', 'Bomb Defuse', '5선 중 폭탄선 피하기, x1.5~x15'],
                  ['🎱', 'Keno', '번호 뽑기 로또, 최대 x2000'],
                  ['⚔️', 'War', '카드 대결, 높은 카드 승'],
                  ['🔢', 'Number Guess', '숫자 맞추기, x1.2~x5'],
                  ['🔫', 'Wheel of Death', '6발 생존, x1.5~x25'],
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
        <div className='fixed top-[44px] right-[10px] z-[200] glass-dark p-[14px] w-[200px]'>
          <div className='text-[12px] font-bold mb-[8px]' style={{ color: '#fff' }}>설정</div>
          <button onClick={() => { resetMoney(); setMoneyState(getMoney()) }}
            className='w-full text-[11px] px-[8px] py-[6px] rounded-[8px] mb-[6px] font-medium transition-all hover:bg-white/10'
            style={{ background: 'rgba(255,255,255,0.06)', color: '#ef4444' }}>
            머니 초기화 ($10,000)
          </button>
          <p className='text-[9px]' style={{ color: '#555' }}>
            충전: ${CHARGE_CONFIG.amount.toLocaleString()} / 1시간
          </p>
        </div>
      )}
    </>
  )
}

export default HUD
