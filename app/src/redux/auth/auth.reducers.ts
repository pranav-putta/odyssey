import { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import Age from '../models/age';
import {
  AuthAddressSubmittedPayload,
  AuthAgeSubmittedPayload,
  AuthInitializeUserPayload,
  AuthNameSubmittedPayload,
  AuthSetupState,
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

    if (user.name && user.name != '') {
      state.setupState = AuthSetupState.age;
    } else {
      state.setupState = AuthSetupState.name;
    }
  } else {
    state.status = AuthStatus.unauthenticated;
  }
};

export const loginUser: AuthReducer<AuthState> = (state, action) => {
  const { status, setupState, user } = action.payload;
  state.status = status;
  state.user = user;
  state.setupState = setupState;
};

export const logoutUser: AuthReducer<void> = (state, action) => {
  state.user = {};
  state.status = AuthStatus.unauthenticated;
};

export const nameSubmitted: AuthReducer<AuthNameSubmittedPayload> = (
  state,
  action
) => {
  state.user.name = action.payload.name;
  state.setupState = AuthSetupState.age;
};

export const ageSubmitted: AuthReducer<AuthAgeSubmittedPayload> = (
  state,
  action
) => {
  state.user.age = action.payload.age;
  state.setupState = AuthSetupState.address;
};

export const addressSubmitted: AuthReducer<AuthAddressSubmittedPayload> = (
  state,
  action
) => {
  state.user.address = action.payload.address;
  state.setupState = AuthSetupState.topics;
};
export const topicsSubmitted: AuthReducer<AuthTopicsSubmittedPayload> = (
  state,
  action
) => {
  state.user.interestedTopics = action.payload.topics;
  state.setupState = AuthSetupState.complete;
};

export const setSetupState: AuthReducer<AuthSetupState> = (state, action) => {
  state.setupState = action.payload;
};
