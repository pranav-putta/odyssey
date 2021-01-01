import { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import {
  UIErrorPayload,
  UIProgressChangedPayload,
  UIState,
  UIStatus,
} from './ui.types';

type AuthReducer<T> = CaseReducer<UIState, PayloadAction<T>>;

export const progressChanged: AuthReducer<UIProgressChangedPayload> = (
  state,
  action
) => {
  const { visible } = action.payload;
  if (visible) {
    state.status = UIStatus.loading;
  } else {
    state.status = UIStatus.stable;
  }
};

export const error: AuthReducer<UIErrorPayload> = (state, action) => {
  state.status = UIStatus.error;
  state.message = action.payload.error;
};

export const completed: AuthReducer<void> = (state, action) => {
  state.status = UIStatus.completed;
};

export const stable: AuthReducer<void> = (state, action) => {
  state.status = UIStatus.stable;
};
