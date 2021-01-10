import { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import {
  UIErrorPayload,
  UIProgressChangedPayload,
  UIState,
  UIStatusCode,
} from './ui.types';

type UIReducer<T> = CaseReducer<UIState, PayloadAction<T>>;

export const progressChanged: UIReducer<UIProgressChangedPayload> = (
  state,
  action
) => {
  const { visible } = action.payload;
  if (visible) {
    state.status = { code: UIStatusCode.loading };
  } else {
    state.status = { code: UIStatusCode.stable };
  }
};

export const error: UIReducer<UIErrorPayload> = (state, action) => {
  state.status = { code: UIStatusCode.error };
  state.status.message = action.payload.error;
};

export const stable: UIReducer<void> = (state, action) => {
  state.status = { code: UIStatusCode.stable };
};

export const servicesLoaded: UIReducer<void> = (state, action) => {
  state.servicesLoaded = true;
};

export const setState: UIReducer<Partial<UIState>> = (state, action) => {
  Object.assign(state, action.payload);
};
