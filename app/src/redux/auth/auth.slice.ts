import { createSlice } from '@reduxjs/toolkit';
import { AuthSetupState, AuthState, AuthStatus } from './auth.types';
import {
  initializeUser,
  loginUser,
  logoutUser,
  ageSubmitted,
  addressSubmitted,
  topicsSubmitted,
  nameSubmitted,
  setSetupState,
} from './auth.reducers';

const initialState: AuthState = {
  status: AuthStatus.unknown,
  setupState: AuthSetupState.name,
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
    topicsSubmitted,
    nameSubmitted,
    setSetupState,
  },
});

export const authActions = authSlice.actions;
export default authSlice.reducer;
