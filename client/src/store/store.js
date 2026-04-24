import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import pollReducer from './pollSlice';
import adminReducer from './adminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    poll: pollReducer,
    admin: adminReducer,
  },
});
