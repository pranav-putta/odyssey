import AsyncStorage from '@react-native-community/async-storage';
import { User } from '../redux/models/user';

export module PersistentStorage {
  const keyUser = 'kUser';
  const keyLoggedIn = 'kLoggedIn';
  const keyLastRefresh = 'kLastRefresh';

  /// RETRIEVAL

  /**
   * retrieves stored user
   */
  export async function getUser(): Promise<User | undefined> {
    let raw = await AsyncStorage.getItem(keyUser);
    if (raw) {
      return JSON.parse(raw)[0];
    }
    return undefined;
  }

  /**
   * retrieves stored refresh time or 0
   */
  export async function getLastRefreshTime(): Promise<number> {
    let raw = await AsyncStorage.getItem(keyLastRefresh);
    if (raw) {
      return Number.parseInt(raw);
    }

    return 0;
  }

  // STORAGE

  /**
   * stores user into asyncstorage
   * @param user
   */
  export async function storeUser(user: User) {
    await AsyncStorage.setItem(keyLoggedIn, 'true');
    await AsyncStorage.setItem(keyUser, JSON.stringify(user));
  }

  /**
   * clears user from asyncstorage
   */
  export async function logout() {
    await AsyncStorage.setItem(keyLoggedIn, 'false');
    await AsyncStorage.setItem(keyUser, '');
  }

  /**
   * checks if user is logged in
   */
  export async function isUserLoggedIn(): Promise<boolean> {
    let out = await AsyncStorage.getItem(keyLoggedIn);
    return out ? JSON.parse(out) : false;
  }

  /**
   * retrieves last refresh time
   * @param last last refresh
   */
  export async function storeLastRefreshTime(last: number) {
    await AsyncStorage.setItem(keyLastRefresh, last.toString());
  }
}
