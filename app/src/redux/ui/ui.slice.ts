import { createSlice } from '@reduxjs/toolkit';
import { UIState, UIStatus } from './ui.types';
import { progressChanged, error, completed, stable } from './ui.reducers';

const initialState: UIState = {
  status: UIStatus.stable,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    progressChanged,
    error,
    completed,
    stable
  },
});

export const uiActions = uiSlice.actions;
export default uiSlice.reducer;
