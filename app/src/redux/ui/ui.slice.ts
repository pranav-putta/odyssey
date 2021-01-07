import { createSlice } from '@reduxjs/toolkit';
import { UIState, UIStatus } from './ui.types';
import {
  progressChanged,
  error,
  completed,
  stable,
  servicesLoaded,
} from './ui.reducers';

const initialState: UIState = {
  status: UIStatus.stable,
  servicesLoaded: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    progressChanged,
    error,
    completed,
    stable,
    servicesLoaded,
  },
});

export const uiActions = uiSlice.actions;
export default uiSlice.reducer;
