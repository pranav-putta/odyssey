import { InterestedTopics, PartialUser, User } from '../models/user';

export enum AuthStatus {
  unknown,
  authenticated,
  authenticatedSetupRequired,
  authenticatedAnonymously,
  unauthenticated,
}

export enum AuthSetupState {
  name = 0,
  age = 1,
  address = 2,
  topics = 3,
  complete = 4,
}

export const AuthSetupStateOrdinal = [
  AuthSetupState.name,
  AuthSetupState.age,
  AuthSetupState.address,
  AuthSetupState.topics,
  AuthSetupState.complete,
];

export interface AuthState {
  status: AuthStatus;
  setupState: AuthSetupState;
  user: PartialUser;
}

export type AuthLoginType = 'apple' | 'google' | 'anonymous';

export interface AuthInitializeUserPayload {
  user?: PartialUser;
}

export interface AuthAgeSubmittedPayload {
  age: number;
}

export interface AuthAddressSubmittedPayload {
  address: string;
}

export interface AuthNameSubmittedPayload {
  name: string;
}

export interface AuthTopicsSubmittedPayload {
  topics: InterestedTopics;
}
