import { authActions } from './auth.slice';
import store, { AppThunk } from '../store';
import { AuthLoginType, AuthSetupState, AuthStatus } from './auth.types';
import messaging from '@react-native-firebase/messaging';
import auth from '@react-native-firebase/auth';
import { uiActions } from '../ui/ui.slice';
import { Network } from '../../util';
import {
  InterestedTopics,
  PartialUser,
  User,
  userFromPartial,
} from '../models/user';
import { UIService } from '../ui/ui';
import { LoginHandler } from '../../util/LoginHandler';
import Age, { AgeResult } from '../models/setup/age';
import Address, { AddressResult } from '../models/setup/address';
import { StorageService } from '../storage';

module AuthenticationService {
  /**
   * initializes current user state by getting data from persistent storage
   */
  export const initialize = () => {
    const user = StorageService.user();
    return authActions.initializeUser({ user });
  };

  export const loginUser = (user: User, status: AuthStatus): AppThunk => async (
    dispatch
  ) => {
    dispatch(StorageService.update({ user }));
    let state = AuthSetupState.name;
    if (user.name != '') {
      state = AuthSetupState.age;
    }
    dispatch(authActions.loginUser({ user, setupState: state, status }));
  };

  /**
   * Logs user in
   * @param type
   */
  export const login = (type: AuthLoginType): AppThunk => async (dispatch) => {
    let user: PartialUser;
    switch (type) {
      case 'apple':
        user = await LoginHandler.loginWithApple();
        break;
      case 'google':
        user = await LoginHandler.loginWithGoogle();
        break;
      case 'anonymous':
        user = await LoginHandler.loginAnonymously();
        break;
    }

    // show loading UI screen
    dispatch(uiActions.progressChanged({ visible: true }));

    if (user.uid && !user.anonymous) {
      // user is valid
      let exists = await Network.userExists(user.uid);
      if (exists) {
        // user has logged in previously
        let user = await Network.refresh();
        if (user) {
          // user successfully refreshed
          dispatch(loginUser(user[0], AuthStatus.authenticated));
        } else {
          dispatch(
            UIService.setError("Couldn't fetch user information from server.")
          );
        }
      } else {
        // user has not logged in previously
        dispatch(
          loginUser(
            userFromPartial(user),
            AuthStatus.authenticatedSetupRequired
          )
        );
      }
    } else if (user.anonymous) {
      await Network.createUser(userFromPartial(user));
      dispatch(
        loginUser(userFromPartial(user), AuthStatus.authenticatedAnonymously)
      );
    } else {
      // an error ocurred
      dispatch(uiActions.error({ error: "Couldn't sign user in." }));
    }

    // clear loading screen
    dispatch(uiActions.progressChanged({ visible: false }));
  };

  export const logout = (): AppThunk => async (dispatch) => {
    try {
      dispatch(StorageService.logout());
      await auth().signOut();
    } catch (err) {
      err;
    }
    dispatch(authActions.logoutUser());
  };

  export const submitName = (pure: string): AppThunk => async (dispatch) => {
    if (pure.length > 0) {
      dispatch(authActions.nameSubmitted({ name: pure }));
    } else {
      dispatch(uiActions.error({ error: 'Please enter a valid name!' }));
    }
  };

  export const submitAge = (pure: string): AppThunk => async (dispatch) => {
    let age = new Age(pure);
    let result = age.validate();
    if (result === AgeResult.valid) {
      dispatch(authActions.ageSubmitted({ age: age.formatted() }));
    } else if (result === AgeResult.invalid) {
      dispatch(uiActions.error({ error: 'Please enter a valid age.' }));
    } else if (result === AgeResult.under13) {
      dispatch(
        uiActions.error({ error: 'You must be at least 13 years old!' })
      );
    }
  };

  export const submitAddress = (pure: string): AppThunk => async (dispatch) => {
    let address = new Address(pure);
    let result = address.validate();
    if (result === AddressResult.valid) {
      dispatch(authActions.addressSubmitted({ address: address.formatted() }));
    } else if (result === AddressResult.invalid) {
      dispatch(uiActions.error({ error: 'Please enter a valid address.' }));
    }
  };

  export const submitTopics = (topics: InterestedTopics): AppThunk => async (
    dispatch
  ) => {
    dispatch(authActions.topicsSubmitted({ topics }));
  };

  export const createUser = (): AppThunk => async (dispatch) => {
    dispatch(uiActions.progressChanged({ visible: true }));

    let user = getUser();
    let status = await Network.createUser(user);
    let x = await Network.refresh();
    if (x) {
      user = x[0];
    }
    dispatch(uiActions.progressChanged({ visible: false }));

    if (status) {
      // if creation was successful, show home page
      dispatch(loginUser(user, AuthStatus.authenticated));
    } else {
      dispatch(
        uiActions.error({
          error: "We couldn't process your account creation at this time.",
        })
      );
    }
  };

  export const getUser = (): User => {
    return userFromPartial(store.getState().auth.user);
  };

  export const getSetupState = (): AuthSetupState => {
    return store.getState().auth.setupState;
  };

  export const setSetupState = (state: AuthSetupState): AppThunk => async (
    dispatch
  ) => {
    dispatch(authActions.setSetupState(state));
  };
}
export default AuthenticationService;
