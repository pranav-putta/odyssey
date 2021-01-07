import { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import {
  UIErrorPayload,
  UIProgressChangedPayload,
  UIState,
  UIStatus,
} from './ui.types';

type UIReducer<T> = CaseReducer<UIState, PayloadAction<T>>;

export const progressChanged: UIReducer<UIProgressChangedPayload> = (
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

export const error: UIReducer<UIErrorPayload> = (state, action) => {
  state.status = UIStatus.error;
  state.message = action.payload.error;
};

export const completed: UIReducer<void> = (state, action) => {
  state.status = UIStatus.completed;
};

export const stable: UIReducer<void> = (state, action) => {
  state.status = UIStatus.stable;
};

export const servicesLoaded: UIReducer<void> = (state, action) => {
  state.servicesLoaded = true;
};
