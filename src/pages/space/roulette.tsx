import Roulette from '@/components/games/Roulette'
import { leaveSpace } from '@/redux/slices/space'
import { useAppDispatch } from '@/redux/storeHooks'
import { socket } from '@/utils/context'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

const RoulettePage = () => {
  const router = useRouter()

  return (
    <div className='fixed top-0 w-screen h-screen z-[9000]'>
      <button
        onClick={() => {
          router.push('/')
        }}>
        필드이동
      </button>
      <Roulette />
    </div>
  )
}

export default RoulettePage
