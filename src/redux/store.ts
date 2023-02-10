import { configureStore, ThunkAction, Action, combineReducers } from '@reduxjs/toolkit'

import space from './slices/space'

export const store = configureStore({
  reducer: {
    space,
  },
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>
