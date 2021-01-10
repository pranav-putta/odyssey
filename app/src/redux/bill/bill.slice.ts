import { createSlice } from '@reduxjs/toolkit';
import { BillState, BillStatusCode } from './bill.types';
import { billRefreshed, billRefreshing, billClear } from './bill.reducers';

const initialState: BillState = {
  status: {
    code: BillStatusCode.unknown,
  },
};

const billSlice = createSlice({
  name: 'bill',
  initialState,
  reducers: {
    billRefreshed,
    billRefreshing,
    billClear,
  },
});

export const billActions = billSlice.actions;
export default billSlice.reducer;
