import AsyncStorage from '@react-native-community/async-storage';
import { User } from '../models';
import { Bill } from '../models/Bill';
import { Notification } from '../models/Notification';
import { Representative } from '../models/Representative';

const keyUser = 'kOdysseyUser';
const keyRepresentatives = 'kOdysseyRepresentatives';
const keyDataVersion = 'kOdysseyDataVersion';
const keyCategories = 'kOdysseyCategories';
const keyConfigFetchTime = 'keyConfigFetchTime';
const keyNotification = 'keyNotification';

export async function storeUser(user: User) {
  try {
    await AsyncStorage.setItem(keyUser, JSON.stringify(user));
  } catch (err) {
    throw err;
  }
}

export async function storeBillLike(bill: Bill, liked: boolean) {
  let user = await fetchUser();
  if (!user.liked) {
    user.liked = {};
  }
  user.liked[bill.number] = liked;
  await storeUser(user);
}

export async function storeRepresentative(reps: Representative[]) {
  try {
    await AsyncStorage.setItem(keyRepresentatives, JSON.stringify(reps));
  } catch (err) {
    throw err;
  }
}

export async function storeCategories(categories: any) {
  try {
    await AsyncStorage.setItem(keyCategories, JSON.stringify(categories));
  } catch (err) {
    throw err;
  }
}

export async function storeDataVersion(version: number) {
  try {
    await AsyncStorage.setItem(keyDataVersion, JSON.stringify(version));
  } catch (err) {
    throw err;
  }
}

export async function storeConfigFetchTime(time: number) {
  try {
    await AsyncStorage.setItem(keyConfigFetchTime, JSON.stringify(time));
  } catch (err) {
    throw err;
  }
}

export async function storeNotification(notification?: string) {
  try {
    await AsyncStorage.setItem(keyNotification, notification || '');
  } catch (err) {
    throw err;
  }
}

export async function removeNotification() {
  try {
    await AsyncStorage.removeItem(keyNotification);
  } catch (err) {
    throw err;
  }
}

export async function fetchUser(): Promise<User> {
  let out = await AsyncStorage.getItem(keyUser);
  return JSON.parse(out || '{}');
}

export async function fetchRepresentatives(): Promise<Representative[]> {
  let out = await AsyncStorage.getItem(keyRepresentatives);
  return JSON.parse(out || '{}');
}

export async function fetchDataVersion(): Promise<number> {
  let out = await AsyncStorage.getItem(keyDataVersion);
  return Number.parseFloat(out || '0');
}
export async function getConfigFetchTime() {
  let out = await AsyncStorage.getItem(keyConfigFetchTime);
  return Number.parseFloat(out || '21600');
}

export async function getNotification(): Promise<Notification | undefined> {
  let out = await AsyncStorage.getItem(keyNotification);
  if (out) {
    console.log('true' + JSON.parse(out));
    return JSON.parse(out);
  }
  return undefined;
}
