import { Representative } from '../../models';
import { Bill } from '../../models/Bill';
import { Notification } from '../models';
import { Committee, Committees } from '../models/committee';
import { User } from '../models/user';

export interface StorageState {
  user: User;
  representatives: Representative[];
  notifications: Notification[];
  committees: Committees;
  loggedIn: boolean;
  lastRefresh: number;
  appLaunchCount: number;
  configRefresh: number;
  tutorialSeen: boolean;
}
export type StoragePayload = Partial<StorageState>;
