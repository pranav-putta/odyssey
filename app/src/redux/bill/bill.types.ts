import { Bill, BillMetadata } from '../../models/Bill';
import { BillData } from '../../models/BillData';

export enum BillStatusCode {
  refreshed,
  refreshing,
  unknown,
}

export interface BillRefreshedState {
  code: BillStatusCode.refreshed;
  meta: BillMetadata;
  bill: Bill;
  billData: BillData;
}

export interface BillUnknownState {
  code: BillStatusCode.unknown;
  meta?: BillMetadata;
  bill?: Bill;
  billData?: BillData;
}

export interface BillRefreshingState {
  meta: BillMetadata;
  bill?: Bill;
  code: BillStatusCode.refreshing;
}

export interface BillState {
  status: BillRefreshedState | BillUnknownState | BillRefreshingState;
}

export interface BillRefreshFinishedPayload {
  bill: Bill;
  data: BillData;
  meta: BillMetadata;
}

export interface BillRefreshingPayload {
  meta: BillMetadata;
  bill?: Bill;
}
