import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store'

export interface SpaceTypes {
  space: boolean
  roulette: boolean
}

export type GameSpace = 'roulette'

const initialState: SpaceTypes = {
  space: false,
  roulette: false,
}

export const spaceSlice = createSlice({
  name: 'space',
  initialState,
  reducers: {
    enterSpace: (state) => {
      state.space = true
      // state[action.payload] = true
    },
    leaveSpace: (state) => {
      state.space = false
      // state[action.payload] = false
    },
  },
})

export const { enterSpace, leaveSpace } = spaceSlice.actions

export const selectSpace = (state: RootState) => state.space

export default spaceSlice.reducer
