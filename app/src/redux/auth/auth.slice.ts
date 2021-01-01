import { createSlice } from '@reduxjs/toolkit';
import { AuthState, AuthStatus } from './auth.types';
import {
  initializeUser,
  loginUser,
  logoutUser,
  ageSubmitted,
  addressSubmitted,
  topicsSubmitted
} from './auth.reducers';

const initialState: AuthState = {
  status: AuthStatus.unknown,
  user: {},
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    initializeUser,
    loginUser,
    logoutUser,
    ageSubmitted,
    addressSubmitted,
    topicsSubmitted
  },
});

export const authActions = authSlice.actions;
export default authSlice.reducer;
