import { createSlice } from '@reduxjs/toolkit';
import { updateStorage, updateBillLiked } from './storage.reducers';
import { emptyUser } from '../models/user';
import { StorageState } from './storage.types';

export const initialState: StorageState = {
  lastRefresh: 0,
  configRefresh: 0,
  loggedIn: false,
  notifications: [],
  representatives: [],
  committees: {},
  user: emptyUser(),
  appLaunchCount: 0,
  tutorialSeen: false,
};

const storageSlice = createSlice({
  name: 'storage',
  initialState,
  reducers: {
    updateStorage,
    updateBillLiked,
  },
});

export const storageActions = storageSlice.actions;
export default storageSlice.reducer;
