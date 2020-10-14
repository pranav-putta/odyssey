import AsyncStorage from '@react-native-community/async-storage';
import { User } from '.';
import { Representative } from './Representative';

const keyUser = 'kOdysseyUser';
const keyRepresentative = 'kOdysseyRepresentative'

export async function storeUser(user: User) {
  try {
    await AsyncStorage.setItem(keyUser, JSON.stringify(user));
  } catch (err) {
    throw err;
  }
}

export async function storeRepresentative(data: any) {
  let reps = data.officials
  let parsed = []
  
}

export async function fetchUser(): Promise<User> {
  let out = await AsyncStorage.getItem(keyUser);
  return JSON.parse(out || '');
}
