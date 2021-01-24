import { createSlice } from '@reduxjs/toolkit';
import {
  UIEvent,
  UIScreenCode,
  UIState,
  UIStatus,
  UIStatusCode,
} from './ui.types';
import {
  progressChanged,
  error,
  stable,
  servicesLoaded,
  setState,
} from './ui.reducers';

const initialState: UIState = {
  status: { code: UIStatusCode.stable },
  screen: { code: UIScreenCode.splash },
  firstDataRefresh: false,
  servicesLoaded: false,
  lastEvent: UIEvent.none,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    progressChanged,
    error,
    stable,
    servicesLoaded,
    setState,
  },
});

export const uiActions = uiSlice.actions;
export default uiSlice.reducer;
