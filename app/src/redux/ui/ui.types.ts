import { Bill, BillMetadata } from '../../models/Bill';
import { BillData } from '../../models/BillData';

export enum UIStatusCode {
  loading,
  stable,
  error,
}

export enum UIScreenCode {
  splash,
  login,
  setup,
  home,
  bill,
  rep,
}

interface ErrorStatus {
  code: UIStatusCode.error;
  message?: string;
}

interface StableStatus {
  code: UIStatusCode.stable;
}

interface LoadingStatus {
  code: UIStatusCode.loading;
}

export type UIStatus = ErrorStatus | StableStatus | LoadingStatus;

interface UIScreenHome {
  code: UIScreenCode.home;
}

interface UIScreenLogin {
  code: UIScreenCode.login;
}

interface UIScreenSetup {
  code: UIScreenCode.setup;
}

interface UIScreenSplash {
  code: UIScreenCode.splash;
}

interface UIScreenBill {
  code: UIScreenCode.bill;
  meta: BillMetadata;
  bill?: Bill;
  billData?: BillData;
}

export type UIScreen =
  | UIScreenHome
  | UIScreenBill
  | UIScreenLogin
  | UIScreenSetup
  | UIScreenSplash;

export interface UIState {
  status: UIStatus;
  screen: UIScreen;
  servicesLoaded: boolean;
  firstDataRefresh: boolean;
}

export interface UIProgressChangedPayload {
  visible: boolean;
}

export interface UIErrorPayload {
  error: string;
}
