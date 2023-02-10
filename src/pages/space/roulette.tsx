import Roulette from '@/components/games/Roulette'
import { leaveSpace } from '@/redux/slices/space'
import { useAppDispatch } from '@/redux/storeHooks'
import { useRouter } from 'next/router'
import React from 'react'

const RoulettePage = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  return (
    <div className='fixed top-0 w-screen h-screen z-[9000]'>
      <button
        onClick={() => {
          dispatch(leaveSpace())
          router.push('/')
        }}>
        필드이동
      </button>
      <Roulette />
    </div>
  )
}

export default RoulettePage
