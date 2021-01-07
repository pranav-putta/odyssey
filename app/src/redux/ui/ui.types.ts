export enum UIStatus {
  loading,
  stable,
  error,
  completed,
}

export interface UIState {
  status: UIStatus;
  servicesLoaded: boolean;
  message?: string;
}

export interface UIProgressChangedPayload {
  visible: boolean;
}

export interface UIErrorPayload {
  error: string;
}
