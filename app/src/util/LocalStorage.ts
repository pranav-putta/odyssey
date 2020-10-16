import AsyncStorage from '@react-native-community/async-storage';
import { User } from '../models';
import { Category } from '../models/Category';
import { Representative } from '../models/Representative';
import categories from './default/categories.json';

const keyUser = 'kOdysseyUser';
const keyRepresentatives = 'kOdysseyRepresentatives';
const keyDataVersion = 'kOdysseyDataVersion';
const keyCategories = 'kOdysseyCategories';

export async function storeUser(user: User) {
  try {
    await AsyncStorage.setItem(keyUser, JSON.stringify(user));
  } catch (err) {
    throw err;
  }
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

export async function fetchCategories(): Promise<any> {
  let out = await AsyncStorage.getItem(keyCategories);
  return out ? JSON.parse(out) : <any>categories;
}
