import React, { Fragment, useEffect, useRef, useState } from 'react'

import { useRouter } from 'next/router'
import { Dialog, Transition } from '@headlessui/react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface InitialPropsTypes {
  timeOut?: number
  onClick?: () => Promise<void> | void
  spaceName: string
}

interface ModalProps {
  modalOpen: boolean
  onClose?: () => void
  props: InitialPropsTypes
}

/**
 * @param {number} timeOut 자동으로 닫히는 시간ms
 * @param {() => Promise<void> | void} onClick
 * @returns
 */
export default function EnterSpace({ modalOpen, onClose, props }: ModalProps) {
  const { onClick, timeOut, spaceName } = props
  const router = useRouter()
  useEffect(() => {
    timeOut && setTimeout(() => onClose && onClose(), timeOut)
  }, [])

  return (
    <div className='fixed inset-0 top-0 left-0 flex items-center justify-center w-screen h-screen z-[9999] bg-[#00000011]'>
      {/* Full-screen container to center the panel */}
      <div className='flex items-center justify-center w-full p-4'>
        <div className=' bg-white rounded-lg w-[300px] h-[180px] px-[8px]'>
          <div className='flex items-center justify-center w-full text-xl font-bold pt-[20px]'>
            <p className='flex items-center justify-center w-full'>게임장에 입장하시겠습니까?</p>
          </div>
          <div className='flex items-center justify-center pt-[20px]'>
            <p className=''>게임이름 : {spaceName}</p>
          </div>
          <div className='flex w-full pt-[40px] gap-[8px]'>
            <button
              className='w-1/2 px-4 font-bold text-white bg-blue-400 rounded-md py-[8px] hover:bg-blue-300'
              onClick={onClose}>
              머무르기
            </button>
            <button
              className='w-1/2 px-4 font-bold text-white bg-red-400 rounded-md py-[8px] hover:bg-red-300'
              onClick={() => {
                onClick()
                onClose()
              }}>
              도박하기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
