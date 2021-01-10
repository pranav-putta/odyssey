import { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { Bill, BillHandler } from '../../models/Bill';
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

export const updateBillLiked: StorageReducer<{ bill: Bill; liked: boolean }> = (
  state,
  action
) => {
  let { bill, liked } = action.payload;
  let id = BillHandler.id(bill);
  state.user.liked[id] = liked;
};
