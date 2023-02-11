import { useState } from 'react'

import { useAppSelector } from '@/redux/storeHooks'
import useModals from '@/hooks/useModals'

export interface AnimationTypes {
  isAnimation: boolean
  animationTime: number
  animation: string
  transition: string
}

const Modals = () => {
  const openedModals = useAppSelector((state) => state.modal.openedModals)
  const { closeModal } = useModals()

  const ANIMATION_TIME = 150

  return (
    <>
      {openedModals.map((modal, index) => {
        const { Component, props } = modal
        const onClose = () => {
          setTimeout(() => {
            closeModal(Component)
          }, ANIMATION_TIME)
        }
        return <Component key={index} modalOpen onClose={onClose} {...props} />
      })}
    </>
  )
}

export default Modals
