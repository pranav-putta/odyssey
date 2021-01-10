import { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import {
  BillRefreshFinishedPayload,
  BillRefreshingPayload,
  BillState,
  BillStatusCode,
} from './bill.types';

type BillReducer<T> = CaseReducer<BillState, PayloadAction<T>>;

/**
 * sets bill feed to refreshed and sets feed
 * @param state
 * @param action
 */
export const billRefreshed: BillReducer<BillRefreshFinishedPayload> = (
  state,
  action
) => {
  const { bill, data, meta } = action.payload;
  state.status = { code: BillStatusCode.refreshed, bill, billData: data, meta };
};

/**
 * sets bill status to refreshing
 * @param state
 * @param action
 */
export const billRefreshing: BillReducer<BillRefreshingPayload> = (
  state,
  action
) => {
  state.status = {
    code: BillStatusCode.refreshing,
    meta: action.payload.meta,
    bill: action.payload.bill,
  };
};

export const billClear: BillReducer<void> = (state, action) => {
  state.status.code = BillStatusCode.unknown;
};
