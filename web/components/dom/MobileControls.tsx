import React, { useRef, useCallback, useEffect, useState } from 'react'

interface MobileControlsProps {
  onInput: (input: { forward: boolean; backward: boolean; left: boolean; right: boolean; run: boolean }) => void
  onJump: () => void
  onInteract: () => void
}

const MobileControls = ({ onInput, onJump, onInteract }: MobileControlsProps) => {
  const [isMobile, setIsMobile] = useState(false)
  const joystickRef = useRef<HTMLDivElement>(null)
  const knobRef = useRef<HTMLDivElement>(null)
  const touching = useRef(false)
  const center = useRef({ x: 0, y: 0 })

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768)
  }, [])

  const handleStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    touching.current = true
    const rect = joystickRef.current?.getBoundingClientRect()
    if (rect) {
      center.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    }
  }, [])

  const handleMove = useCallback((e: React.TouchEvent) => {
    if (!touching.current || !knobRef.current) return
    e.preventDefault()

    const touch = e.touches[0]
    const dx = touch.clientX - center.current.x
    const dy = touch.clientY - center.current.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    const maxDist = 40

    // 노브 위치 제한
    const clampedDist = Math.min(dist, maxDist)
    const angle = Math.atan2(dy, dx)
    const nx = Math.cos(angle) * clampedDist
    const ny = Math.sin(angle) * clampedDist
    knobRef.current.style.transform = `translate(${nx}px, ${ny}px)`

    // 입력 계산
    const threshold = 15
    const run = dist > maxDist * 0.8
    onInput({
      forward: dy < -threshold,
      backward: dy > threshold,
      left: dx < -threshold,
      right: dx > threshold,
      run,
    })
  }, [onInput])

  const handleEnd = useCallback(() => {
    touching.current = false
    if (knobRef.current) {
      knobRef.current.style.transform = 'translate(0px, 0px)'
    }
    onInput({ forward: false, backward: false, left: false, right: false, run: false })
  }, [onInput])

  if (!isMobile) return null

  return (
    <div className='fixed bottom-0 left-0 right-0 z-[300] pointer-events-none' style={{ touchAction: 'none' }}>
      {/* 조이스틱 - 좌측 하단 */}
      <div
        ref={joystickRef}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        className='absolute bottom-[30px] left-[30px] w-[120px] h-[120px] rounded-full pointer-events-auto flex items-center justify-center'
        style={{
          background: 'rgba(255,255,255,0.1)',
          border: '2px solid rgba(255,255,255,0.25)',
          touchAction: 'none',
        }}>
        <div
          ref={knobRef}
          className='w-[50px] h-[50px] rounded-full'
          style={{
            background: 'rgba(255,255,255,0.4)',
            border: '2px solid rgba(255,255,255,0.5)',
            transition: touching.current ? 'none' : 'transform 0.15s ease',
          }}
        />
      </div>

      {/* 액션 버튼 - 우측 하단 */}
      <div className='absolute bottom-[30px] right-[20px] flex flex-col gap-[10px] pointer-events-auto'>
        {/* 점프 */}
        <button
          onTouchStart={(e) => { e.preventDefault(); onJump() }}
          className='w-[60px] h-[60px] rounded-full flex items-center justify-center text-[20px] font-bold'
          style={{
            background: 'rgba(52,152,219,0.5)',
            border: '2px solid rgba(52,152,219,0.7)',
            color: 'white',
            touchAction: 'none',
          }}>
          ⬆
        </button>

        {/* 입장 (E키 대체) */}
        <button
          onTouchStart={(e) => { e.preventDefault(); onInteract() }}
          className='w-[60px] h-[60px] rounded-full flex items-center justify-center text-[16px] font-bold'
          style={{
            background: 'rgba(46,204,113,0.5)',
            border: '2px solid rgba(46,204,113,0.7)',
            color: 'white',
            touchAction: 'none',
          }}>
          E
        </button>
      </div>
    </div>
  )
}

export default MobileControls
