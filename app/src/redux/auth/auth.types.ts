import { InterestedTopics, PartialUser, User } from '../models/user';

export enum AuthStatus {
  unknown,
  authenticated,
  authenticatedSetupRequired,
  authenticatedAnonymously,
  unauthenticated,
}

export interface AuthState {
  status: AuthStatus;
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

export interface AuthTopicsSubmittedPayload {
  topics: InterestedTopics;
}
