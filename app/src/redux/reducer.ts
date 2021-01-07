import { combineReducers } from '@reduxjs/toolkit';
import auth from './auth/auth.slice';
import ui from './ui/ui.slice';
import feed from './feed/feed.slice';
import storage from './storage/storage.slice';
import {
  persistStore,
  persistReducer,
  persistCombineReducers,
} from 'redux-persist';
import AsyncStorage from '@react-native-community/async-storage';

const appReducer = persistCombineReducers(
  { key: 'persist-root', storage: AsyncStorage, blacklist: ['ui'] },
  {
    auth,
    ui,
    feed,
    storage,
  }
);

export type AppState = ReturnType<typeof appReducer>;
export default appReducer;
