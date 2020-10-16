import functions, { firebase } from '@react-native-firebase/functions';
import {
  fetchDataVersion,
  storeDataVersion,
  storeRepresentative,
  storeUser,
  User,
} from '../models';
import NetInfo from '@react-native-community/netinfo';
import Axios from 'axios';
import auth from '@react-native-firebase/auth';
import { Bill } from '../models/Bill';

export async function isNetworkAvailable() {
  const response = await NetInfo.fetch();
  return response.isConnected;
}

const awsURLs = {
  userExists:
    'https://tde26c6cp5.execute-api.us-east-2.amazonaws.com/prod/user-exists',
  newUser:
    'https://tde26c6cp5.execute-api.us-east-2.amazonaws.com/prod/new-user',
  refresh:
    'https://tde26c6cp5.execute-api.us-east-2.amazonaws.com/prod/refresh',
  randBills:
    'https://tde26c6cp5.execute-api.us-east-2.amazonaws.com/prod/rand-bills',
};

/**
 * refreshes all pertinent user data in the background
 */
export async function refresh(): Promise<any> {
  if (!isNetworkAvailable()) {
    return {};
  }
  let version = await fetchDataVersion();
  Axios.post(awsURLs.refresh, {
    uid: firebase.auth().currentUser?.uid,
    version: version,
  })
    .then((res) => {
      let user: User = res.data.userData;
      let reps = res.data.reps;
      let version = res.data.version;
      storeUser(user);
      storeRepresentative(reps);
      storeDataVersion(version);
    })
    .catch((err) => {});
}

export async function userExists(uid: string): Promise<boolean> {
  if (!isNetworkAvailable()) {
    return false;
  }

  let response = await Axios.get(awsURLs.userExists, { params: { uid: uid } });
  if (response.status == 200 && response.data.result) {
    return true;
  } else {
    return false;
  }
}

export async function createUser(user: any): Promise<boolean> {
  if (!isNetworkAvailable()) {
    return false;
  }

  let id = await firebase.auth().currentUser?.getIdToken(true);
  return Axios.post(awsURLs.newUser, {
    token: id,
    user: user,
  })
    .then((response) => {
      if (response.status == 200 && response.data.result) {
        return true;
      } else {
        return false;
      }
    })
    .catch((err) => {
      console.log(JSON.stringify(err));
      return false;
    });
}

export async function randomBills(): Promise<Bill[]> {
  if (!isNetworkAvailable()) {
    return [];
  }
  return Axios.get(awsURLs.randBills)
    .then((response) => {
      if (response.status == 200) {
        return response.data.bills;
      } else {
        return [];
      }
    })
    .catch((err) => {
      console.log(JSON.stringify(err));
      return [];
    });
}
