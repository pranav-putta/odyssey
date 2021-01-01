import { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import Age from '../models/age';
import {
  AuthAddressSubmittedPayload,
  AuthAgeSubmittedPayload,
  AuthInitializeUserPayload,
  AuthState,
  AuthStatus,
  AuthTopicsSubmittedPayload,
} from './auth.types';

type AuthReducer<T> = CaseReducer<AuthState, PayloadAction<T>>;

export const initializeUser: AuthReducer<AuthInitializeUserPayload> = (
  state,
  action
) => {
  const { user } = action.payload;
  if (user && user.uid != '') {
    state.user = user;
    if (user.anonymous) {
      state.status = AuthStatus.authenticatedAnonymously;
    } else if (user.age == 0) {
      state.status = AuthStatus.authenticatedSetupRequired;
    } else {
      state.status = AuthStatus.authenticated;
    }
  } else {
    state.status = AuthStatus.unauthenticated;
  }
};

export const loginUser: AuthReducer<AuthState> = (state, action) => {
  const { status, user } = action.payload;
  state.status = status;
  state.user = user;
};

export const logoutUser: AuthReducer<void> = (state, action) => {
  console.log('here');
  state.user = {};
  state.status = AuthStatus.unauthenticated;
};

export const ageSubmitted: AuthReducer<AuthAgeSubmittedPayload> = (
  state,
  action
) => {
  state.user.age = action.payload.age;
};

export const addressSubmitted: AuthReducer<AuthAddressSubmittedPayload> = (
  state,
  action
) => {
  state.user.address = action.payload.address;
};
export const topicsSubmitted: AuthReducer<AuthTopicsSubmittedPayload> = (
  state,
  action
) => {
  state.user.interestedTopics = action.payload.topics;
};
