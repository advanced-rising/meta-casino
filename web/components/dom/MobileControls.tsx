import React, { useRef, useCallback, useEffect, useState } from 'react'

export interface MobileInput {
  angle: number    // 라디안 (조이스틱 방향)
  magnitude: number // 0~1 (세기, 0이면 정지)
  active: boolean
}

interface MobileControlsProps {
  mobileInputRef: React.MutableRefObject<MobileInput>
  onJump: () => void
  onInteract: () => void
}

const MobileControls = ({ mobileInputRef, onJump, onInteract }: MobileControlsProps) => {
  const [isMobile, setIsMobile] = useState(false)
  const joystickRef = useRef<HTMLDivElement>(null)
  const knobRef = useRef<HTMLDivElement>(null)
  const center = useRef({ x: 0, y: 0 })

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768)
  }, [])

  const handleStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    const rect = joystickRef.current?.getBoundingClientRect()
    if (rect) {
      center.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    }
  }, [])

  const handleMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    const dx = touch.clientX - center.current.x
    const dy = touch.clientY - center.current.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    const maxDist = 45

    const clampedDist = Math.min(dist, maxDist)
    const angle = Math.atan2(dx, -dy) // 위=0, 우=π/2 (3D 좌표계 기준)

    // 노브 이동
    if (knobRef.current) {
      const nx = (dx / Math.max(dist, 1)) * clampedDist
      const ny = (dy / Math.max(dist, 1)) * clampedDist
      knobRef.current.style.transform = `translate(${nx}px, ${ny}px)`
    }

    const magnitude = Math.min(dist / maxDist, 1)
    mobileInputRef.current = {
      angle,
      magnitude: magnitude > 0.15 ? magnitude : 0, // 데드존
      active: magnitude > 0.15,
    }
  }, [mobileInputRef])

  const handleEnd = useCallback(() => {
    if (knobRef.current) {
      knobRef.current.style.transform = 'translate(0px, 0px)'
    }
    mobileInputRef.current = { angle: 0, magnitude: 0, active: false }
  }, [mobileInputRef])

  if (!isMobile) return null

  return (
    <div className='fixed bottom-0 left-0 right-0 z-[300] pointer-events-none' style={{ touchAction: 'none' }}>
      {/* 조이스틱 */}
      <div
        ref={joystickRef}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        className='absolute bottom-[30px] left-[30px] w-[120px] h-[120px] rounded-full pointer-events-auto flex items-center justify-center'
        style={{
          background: 'rgba(255,255,255,0.08)',
          border: '2px solid rgba(255,255,255,0.2)',
          touchAction: 'none',
        }}>
        <div
          ref={knobRef}
          className='w-[50px] h-[50px] rounded-full'
          style={{
            background: 'rgba(255,255,255,0.35)',
            border: '2px solid rgba(255,255,255,0.5)',
          }}
        />
      </div>

      {/* 버튼 */}
      <div className='absolute bottom-[30px] right-[20px] flex flex-col gap-[12px] pointer-events-auto'>
        <button
          onTouchStart={(e) => { e.preventDefault(); onJump() }}
          className='w-[56px] h-[56px] rounded-full flex items-center justify-center text-[18px]'
          style={{
            background: 'rgba(52,152,219,0.4)',
            border: '2px solid rgba(52,152,219,0.6)',
            color: 'white', touchAction: 'none',
          }}>
          ⬆
        </button>
        <button
          onTouchStart={(e) => { e.preventDefault(); onInteract() }}
          className='w-[56px] h-[56px] rounded-full flex items-center justify-center text-[14px] font-bold'
          style={{
            background: 'rgba(46,204,113,0.4)',
            border: '2px solid rgba(46,204,113,0.6)',
            color: 'white', touchAction: 'none',
          }}>
          입장
        </button>
      </div>
    </div>
  )
}

export default MobileControls
