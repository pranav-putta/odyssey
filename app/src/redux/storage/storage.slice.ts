import { createSlice } from '@reduxjs/toolkit';
import { updateStorage } from './storage.reducers';
import { emptyUser } from '../models/user';
import { StorageState } from './storage.types';

export const initialState: StorageState = {
  feed: [],
  lastRefresh: 0,
  configRefresh: 0,
  loggedIn: false,
  notifications: [],
  representatives: [],
  user: emptyUser(),
  appLaunchCount: 0,
};

const storageSlice = createSlice({
  name: 'storage',
  initialState,
  reducers: {
    updateStorage,
  },
});

export const storageActions = storageSlice.actions;
export default storageSlice.reducer;
