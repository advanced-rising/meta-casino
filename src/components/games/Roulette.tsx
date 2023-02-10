import { leaveSpace } from '@/redux/slices/space'
import { useAppDispatch } from '@/redux/storeHooks'
import React, { useRef } from 'react'
import { GameStages, RouletteWrapperState } from '../roulette/Global'
import Wheel from '../roulette/Wheel'

const Roulette = () => {
  const dispatch = useAppDispatch()

  const rouletteWheelNumbers = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29,
    7, 28, 12, 35, 3, 26,
  ]

  const numberRef = useRef<HTMLInputElement>()
  const state: RouletteWrapperState = {
    rouletteData: {
      numbers: rouletteWheelNumbers,
    },
    chipsData: {
      selectedChip: null,
      placedChips: new Map(),
    },
    number: {
      next: null,
    },
    winners: [],
    history: [],
    stage: GameStages.NONE,
    username: '',
    endTime: 0,
    progressCountdown: 0,
    time_remaining: 0,
  }

  const blackNumbers = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 29, 28, 31, 33, 35]
  return <Wheel rouletteData={state.rouletteData} number={state.number} />
}

export default Roulette
