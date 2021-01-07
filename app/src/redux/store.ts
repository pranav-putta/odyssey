import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';
import { persistStore } from 'redux-persist';
import appReducer, { AppState } from './reducer';

const store = configureStore({
  reducer: appReducer,
});
export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
export type AppThunk = ThunkAction<void, AppState, unknown, Action<string>>;

export default store;
