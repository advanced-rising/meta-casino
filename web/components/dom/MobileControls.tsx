import React, { useRef, useCallback, useEffect, useState } from 'react'

export interface MobileInput {
  dx: number
  dy: number
  magnitude: number
  active: boolean
}

interface MobileControlsProps {
  mobileInputRef: React.MutableRefObject<MobileInput>
  onJump: () => void
  onInteract: () => void
}

const MobileControls = ({ mobileInputRef, onJump, onInteract }: MobileControlsProps) => {
  const [isMobile, setIsMobile] = useState(false)
  const [forward, setForward] = useState(false)
  const [backward, setBackward] = useState(false)

  // 화면 스와이프로 방향 전환
  const swipeStart = useRef<{ x: number; y: number } | null>(null)
  const swipeActive = useRef(false)

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768)
  }, [])

  // 화면 중앙 영역 스와이프 → 카메라/캐릭터 회전
  useEffect(() => {
    if (!isMobile) return

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      // 하단 버튼 영역 제외 (하단 150px)
      if (touch.clientY > window.innerHeight - 150) return
      // 상단 HUD 영역 제외
      if (touch.clientY < 60) return
      swipeStart.current = { x: touch.clientX, y: touch.clientY }
      swipeActive.current = true
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!swipeActive.current || !swipeStart.current) return
      const touch = e.touches[0]
      const dx = touch.clientX - swipeStart.current.x

      // 좌우 스와이프 → 회전 (dx를 정규화)
      const sensitivity = 0.008
      mobileInputRef.current = {
        dx: dx * sensitivity,
        dy: forward ? -1 : backward ? 1 : 0,
        magnitude: forward || backward ? 1 : Math.abs(dx * sensitivity) > 0.1 ? 0.3 : 0,
        active: forward || backward || Math.abs(dx) > 10,
      }

      swipeStart.current = { x: touch.clientX, y: touch.clientY }
    }

    const handleTouchEnd = () => {
      swipeActive.current = false
      swipeStart.current = null
      if (!forward && !backward) {
        mobileInputRef.current = { dx: 0, dy: 0, magnitude: 0, active: false }
      }
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: false })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isMobile, forward, backward, mobileInputRef])

  // 전진/후진 버튼 상태 → mobileInput 반영
  useEffect(() => {
    if (forward) {
      mobileInputRef.current = { ...mobileInputRef.current, dy: -1, magnitude: 1, active: true }
    } else if (backward) {
      mobileInputRef.current = { ...mobileInputRef.current, dy: 1, magnitude: 0.6, active: true }
    } else if (!swipeActive.current) {
      mobileInputRef.current = { dx: 0, dy: 0, magnitude: 0, active: false }
    }
  }, [forward, backward, mobileInputRef])

  if (!isMobile) return null

  return (
    <div className='fixed bottom-0 left-0 right-0 z-[300] pointer-events-none' style={{ touchAction: 'none' }}>
      {/* 좌측: 이동 버튼 */}
      <div className='absolute bottom-[20px] left-[16px] flex flex-col gap-[8px] pointer-events-auto'>
        {/* 전진 */}
        <button
          onTouchStart={(e) => { e.preventDefault(); setForward(true) }}
          onTouchEnd={() => setForward(false)}
          className='w-[64px] h-[64px] rounded-[14px] flex items-center justify-center text-[22px] transition-all active:scale-95'
          style={{
            background: forward ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#fff', touchAction: 'none',
          }}>
          ▲
        </button>
        {/* 후진 */}
        <button
          onTouchStart={(e) => { e.preventDefault(); setBackward(true) }}
          onTouchEnd={() => setBackward(false)}
          className='w-[64px] h-[64px] rounded-[14px] flex items-center justify-center text-[22px] transition-all active:scale-95'
          style={{
            background: backward ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#fff', touchAction: 'none',
          }}>
          ▼
        </button>
      </div>

      {/* 중앙 하단: 스와이프 안내 */}
      <div className='absolute bottom-[8px] left-1/2 -translate-x-1/2 pointer-events-none'>
        <span className='text-[9px]' style={{ color: 'rgba(255,255,255,0.2)' }}>← 화면 스와이프로 방향전환 →</span>
      </div>

      {/* 우측: 액션 버튼 */}
      <div className='absolute bottom-[20px] right-[16px] flex flex-col gap-[8px] pointer-events-auto'>
        <button
          onTouchStart={(e) => { e.preventDefault(); onJump() }}
          className='w-[56px] h-[56px] rounded-[14px] flex items-center justify-center text-[13px] font-bold transition-all active:scale-95'
          style={{
            background: 'rgba(59,130,246,0.3)',
            border: '1px solid rgba(59,130,246,0.4)',
            color: '#93c5fd', touchAction: 'none',
          }}>
          점프
        </button>
        <button
          onTouchStart={(e) => { e.preventDefault(); onInteract() }}
          className='w-[56px] h-[56px] rounded-[14px] flex items-center justify-center text-[13px] font-bold transition-all active:scale-95'
          style={{
            background: 'rgba(34,197,94,0.3)',
            border: '1px solid rgba(34,197,94,0.4)',
            color: '#86efac', touchAction: 'none',
          }}>
          입장
        </button>
      </div>
    </div>
  )
}

export default MobileControls
