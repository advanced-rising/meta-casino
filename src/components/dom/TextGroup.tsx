import cls from '@/utils/cls'
import React, { useEffect, useRef } from 'react'
import { useImmer } from 'use-immer'

export default function TextGroup() {
  const [state, setState] = useImmer({
    nums: [
      'R3F + Socket.io 으로 구현한 META CASINO에 오신것을 환영합니다.',
      '바로 위의 하얀색 테두리를 통해 실시간 소통이 가능합니다.',
      '각각의 랜드마크를 클릭하면, 게임장으로 입장을 하실 수 있습니다.',
    ],
    current: 2,
    needTransition: true,
    direction: '',
    translate: 100,
    visible: true,
  })

  const intervalRef = useRef<any>()

  useEffect(() => {
    if (state.translate === -(100 * state.nums.length)) {
      setState((draft) => {
        draft.visible = false
        draft.translate = 150
        draft.needTransition = false
      })
    }
    if (-state.translate > -150 && state.translate > 110) {
      setState((draft) => {
        draft.visible = true
        draft.needTransition = true
      })
    }

    intervalRef.current = setInterval(() => {
      setState((draft) => {
        draft.translate -= 1
      })
    }, 100)

    return () => clearInterval(intervalRef.current)
  }, [state, setState])

  return (
    <div className='fixed w-full text-red-900 z-[1000] pt-[300px]'>
      <div className='flex flex-col items-center justify-center w-full overflow-hidden'>
        <ul
          style={{
            transform: `translateX(${state.translate}%)`,
            visibility: state.visible ? 'visible' : 'hidden',
            transition: state.needTransition ? 'all 0.2s ease 0s' : 'none',
          }}
          className={cls(`flex w-full p-0 m-0 text-red-400 stroke-custom font-bold text-lg stroke-black gap-[20px] `)}>
          {state.nums.map((item, i) => (
            <li className='flex items-center justify-center flex-shrink-0 ' key={i}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
