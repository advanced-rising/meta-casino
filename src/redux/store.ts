import { configureStore, ThunkAction, Action, combineReducers } from '@reduxjs/toolkit'

import space from './slices/space'
import modal from './slices/modal'

export const store = configureStore({
  reducer: {
    space,
    modal,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>
