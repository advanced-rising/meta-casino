import React, { useEffect, useRef } from 'react'
import { useImmer } from 'use-immer'

export default function TextGroup() {
  const messages = [
    'META CASINO에 오신것을 환영합니다!',
    'WASD로 이동, Space로 점프, E로 춤',
    '랜드마크를 클릭하면 게임장에 입장합니다',
  ]

  const [state, setState] = useImmer({
    translate: 100,
    visible: true,
    needTransition: true,
  })

  const intervalRef = useRef<ReturnType<typeof setInterval>>(null)

  useEffect(() => {
    if (state.translate <= -(100 * messages.length)) {
      setState((draft) => {
        draft.visible = false
        draft.translate = 150
        draft.needTransition = false
      })
    }
    if (state.translate > 110) {
      setState((draft) => {
        draft.visible = true
        draft.needTransition = true
      })
    }

    intervalRef.current = setInterval(() => {
      setState((draft) => {
        draft.translate -= 1
      })
    }, 80)

    return () => clearInterval(intervalRef.current!)
  }, [state, setState])

  return (
    <div className='fixed top-[44px] left-0 right-0 z-[140] overflow-hidden h-[24px] bg-[#000000aa]'>
      <ul
        style={{
          transform: `translateX(${state.translate}%)`,
          visibility: state.visible ? 'visible' : 'hidden',
          transition: state.needTransition ? 'all 0.1s linear' : 'none',
        }}
        className='flex gap-[40px] whitespace-nowrap m-0 p-0 list-none'>
        {messages.map((msg, i) => (
          <li key={i} className='text-yellow-300 text-[12px] leading-[24px]'>
            {msg}
          </li>
        ))}
      </ul>
    </div>
  )
}
