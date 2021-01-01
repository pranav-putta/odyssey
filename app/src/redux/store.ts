import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';
import appReducer, { AppState } from './reducer';

const store = configureStore({
  reducer: appReducer,
});

export type AppDispatch = typeof store.dispatch;
export type AppThunk = ThunkAction<void, AppState, unknown, Action<string>>;

export default store;
