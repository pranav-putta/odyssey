import { Representative } from '../../models';
import { Bill } from '../../models/Bill';
import { Notification } from '../models';
import { User } from '../models/user';

export interface StorageState {
  user: User;
  representatives: Representative[];
  notifications: Notification[];
  loggedIn: boolean;
  lastRefresh: number;
  appLaunchCount: number;
  configRefresh: number;
}
export type StoragePayload = Partial<StorageState>;
