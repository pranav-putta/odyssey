import functions, { firebase } from '@react-native-firebase/functions';
import {
  fetchDataVersion,
  fetchUser,
  profile_picture_url_default,
  storeBillLike,
  storeDataVersion,
  storeRepresentative,
  storeUser,
  User,
} from '../models';
import NetInfo from '@react-native-community/netinfo';
import Axios from 'axios';
import auth from '@react-native-firebase/auth';
import { Bill } from '../models/Bill';
import { BillData, Comment, Vote } from '../models/BillData';
import ImageResizer from 'react-native-image-resizer';

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
  search: 'https://tde26c6cp5.execute-api.us-east-2.amazonaws.com/prod/search',
  like: 'https://tde26c6cp5.execute-api.us-east-2.amazonaws.com/prod/like',
  likedBills:
    'https://tde26c6cp5.execute-api.us-east-2.amazonaws.com/prod/liked-bills',
  billData:
    'https://tde26c6cp5.execute-api.us-east-2.amazonaws.com/prod/get-bill-data',
  vote: 'https://tde26c6cp5.execute-api.us-east-2.amazonaws.com/prod/vote',
  addComment:
    'https://tde26c6cp5.execute-api.us-east-2.amazonaws.com/prod/add-comment',
  likeComment:
    'https://tde26c6cp5.execute-api.us-east-2.amazonaws.com/prod/like-comment',
  deleteComment:
    'https://tde26c6cp5.execute-api.us-east-2.amazonaws.com/prod/delete-comment',
  uploadPFP:
    'https://tde26c6cp5.execute-api.us-east-2.amazonaws.com/prod/upload-pfp',
};

/**
 * refreshes all pertinent user data in the background
 */
export async function refresh(): Promise<any> {
  if (!isNetworkAvailable()) {
    return {};
  }
  let version = await fetchDataVersion();
  return Axios.post(awsURLs.refresh, {
    uid: firebase.auth().currentUser?.uid,
    version: version,
  })
    .then((res) => {
      let user: User = res.data.userData;
      let reps = res.data.reps;
      let version = res.data.version;
      if (user && !user.pfp_url) {
        user.pfp_url = profile_picture_url_default;
      }
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

export async function likedBills(): Promise<Bill[]> {
  if (!isNetworkAvailable()) {
    return [];
  }
  return Axios.post(awsURLs.likedBills, { user: await fetchUser() })
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

export async function search(searchBy: string, query: string): Promise<Bill[]> {
  if (!isNetworkAvailable()) {
    return [];
  }
  return Axios.post(awsURLs.search, { searchBy: searchBy, query: query })
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

/**
 * convert bill number to bill identifier
 */
export async function likeBill(bill: Bill, liked: boolean): Promise<any> {
  if (!isNetworkAvailable()) {
    return [];
  }
  let user = await fetchUser();
  let uid = user.uid;
  return Axios.post(awsURLs.like, {
    bill_id: bill.number,
    uid: uid,
    liked: liked,
  })
    .then((response) => {
      if (response.status == 200) {
        return true;
      } else {
        return [];
      }
    })
    .catch((err) => {
      console.log(JSON.stringify(err));
      return [];
    });
}

export async function getBillData(bill: Bill): Promise<BillData> {
  if (!isNetworkAvailable()) {
    return {
      bill_id: bill.number,
      comments: [],
      votes: {},
    };
  }
  return Axios.post(awsURLs.billData, {
    bill_id: bill.number,
  })
    .then((response) => {
      if (response.status == 200) {
        return response.data.bill;
      } else {
        return {
          bill_id: bill.number,
          comments: [],
          votes: {},
        };
      }
    })
    .catch((err) => {
      console.log(JSON.stringify(err));
      return [];
    });
}

export async function setBillVote(bill: Bill, vote: Vote): Promise<any> {
  if (!isNetworkAvailable()) {
    return false;
  }
  let user = await fetchUser();
  let uid = user.uid;
  return Axios.post(awsURLs.vote, {
    bill_id: bill.number,
    uid: uid,
    vote: vote,
  })
    .then((response) => {
      if (response.status == 200) {
        return true;
      } else {
        return [];
      }
    })
    .catch((err) => {
      console.log(JSON.stringify(err));
      return [];
    });
}

export async function addComment(
  bill: Bill,
  comment: Comment
): Promise<boolean> {
  if (!isNetworkAvailable()) {
    return false;
  }
  let user = await fetchUser();
  let uid = user.uid;
  return Axios.post(awsURLs.addComment, {
    bill_id: bill.number,
    uid: uid,
    comment: comment,
  })
    .then((response) => {
      if (response.status == 200) {
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

export async function likeComment(
  bill: Bill,
  index: number,
  value: boolean
): Promise<boolean> {
  if (!isNetworkAvailable()) {
    return false;
  }
  let user = await fetchUser();
  let uid = user.uid;
  return Axios.post(awsURLs.likeComment, {
    bill_id: bill.number,
    uid: uid,
    comment_index: index,
    liked: value,
  })
    .then((response) => {
      if (response.status == 200) {
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

export async function uploadPFP(user: User, photo: string) {
  const data = {
    uri: photo,
    text: 'image/jpeg',
    name: `${user.uid}_pfp.jpg`,
  };
  if (!isNetworkAvailable()) {
    return false;
  }

  var body = new FormData();
  body.append('uid', user.uid);
  body.append('pfp', data);
  return Axios.post('http://localhost:3000/prod/upload-pfp', body)
    .then((response) => {
      if (response.status == 200) {
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

export async function deleteComment(
  bill: Bill,
  commentIndex: number
): Promise<boolean> {
  if (!isNetworkAvailable()) {
    return false;
  }
  return Axios.post(awsURLs.deleteComment, {
    comment_index: commentIndex,
    bill_id: bill.number,
  })
    .then((response) => {
      if (response.status == 200) {
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
