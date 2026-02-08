import { configureStore } from '@reduxjs/toolkit'
import rootReducer from './rootReducer'
import { metricsApi } from './api/metricsApi'

export const store = configureStore({
  reducer: {
    ...rootReducer,
    [metricsApi.reducerPath]: metricsApi.reducer
  },
  middleware: (getDefault) =>
    getDefault({ serializableCheck: false }).concat(metricsApi.middleware)
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch