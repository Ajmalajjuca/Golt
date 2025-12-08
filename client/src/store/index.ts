import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import priceReducer from './priceSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    price: priceReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
