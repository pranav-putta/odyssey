import { Notification } from './notification';

export type InterestedTopics = { [key: string]: boolean };
export type LikedBills = { [key: string]: boolean };
export interface User {
  address: string;
  age: number;
  name: string;
  interestedTopics: InterestedTopics;
  uid: string;
  liked: LikedBills;
  pfp_url: string;
  created_time: number;
  email: string;
  anonymous: boolean;
  notifications: Notification[];
}

export function userFromPartial(user: PartialUser): User {
  return {
    address: user.address ?? '',
    age: user.age ?? 0,
    created_time: user.created_time ?? Date.now(),
    email: user.email ?? '',
    interestedTopics: user.interestedTopics ?? {},
    liked: user.liked ?? {},
    name: user.name ?? '',
    pfp_url: user.pfp_url ?? '',
    uid: user.uid ?? '',
    anonymous: user.anonymous ?? true,
    notifications: user.notifications ?? [],
  };
}

export function emptyUser() {
  return userFromPartial({});
}

export type PartialUser = Partial<User>;
