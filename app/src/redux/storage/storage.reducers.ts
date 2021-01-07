import { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { StoragePayload, StorageState } from './storage.types';

type StorageReducer<T> = CaseReducer<StorageState, PayloadAction<T>>;

/**
 * updates local storage data
 * @param state
 * @param action
 */
export const updateStorage: StorageReducer<StoragePayload> = (
  state,
  action
) => {
  Object.assign(state, action.payload);
};
