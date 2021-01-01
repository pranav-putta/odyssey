export enum UIStatus {
  loading,
  stable,
  error,
  completed,
}

export interface UIState {
  status: UIStatus;
  message?: string;
}

export interface UIProgressChangedPayload {
  visible: boolean;
}

export interface UIErrorPayload {
  error: string;
}
