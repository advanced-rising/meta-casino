import { createSlice } from '@reduxjs/toolkit'
import { ElementType } from 'react'
import { RootState } from '../store'

export interface ModalState {
  openedModals: { Component: ElementType; props: any }[]
}

const initialState: ModalState = {
  openedModals: [],
}

export const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    openModal: (state, action) => {
      const { Component, props } = action.payload
      state.openedModals = [...state.openedModals, { Component, props }]
    },
    closeModal: (state, action) => {
      const { Component } = action.payload
      state.openedModals = state.openedModals.filter((modal) => modal.Component !== Component)
    },
  },
})

export const { openModal, closeModal } = modalSlice.actions

export const selectModal = (state: RootState) => state.modal

export default modalSlice.reducer
