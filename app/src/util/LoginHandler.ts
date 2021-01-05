import appleAuth from '@invertase/react-native-apple-authentication';
import { GoogleSignin } from '@react-native-community/google-signin';
import { Alert, Platform } from 'react-native';
import auth from '@react-native-firebase/auth';
import { PartialUser } from '../redux/models/user';

export module LoginHandler {
  export async function loginWithApple(): Promise<PartialUser> {
    if (!appleAuth.isSupported) {
      throw 'Sign in with Apple is not supported by this device!';
    }
    if (Platform.OS == 'ios') {
      return loginWithAppleIOS();
    } else if (Platform.OS == 'android') {
      return loginWithAppleAndroid();
    } else {
      throw 'unexpected platform';
    }
  }

  async function loginWithAppleIOS(): Promise<PartialUser> {
    const appleAuthReqResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
    });

    if (!appleAuthReqResponse.identityToken) {
      throw 'apple auth rejected';
    }

    const { identityToken, nonce } = appleAuthReqResponse;
    const appleCredential = auth.AppleAuthProvider.credential(
      identityToken,
      nonce
    );

    let user = await auth().signInWithCredential(appleCredential);
    return {
      email: user.user.email ?? '',
      name: user.user.displayName ?? '',
      uid: user.user.uid,
      anonymous: false,
    };
  }

  async function loginWithAppleAndroid(): Promise<PartialUser> {
    throw 'not yet implemnted';
  }

  export async function loginWithGoogle(): Promise<PartialUser> {
    GoogleSignin.configure({
      webClientId:
        '794143535695-tho878efsv75bbl3ni3h3t1di54ak9cv.apps.googleusercontent.com',
    });

    // Get the users ID token
    const { idToken } = await GoogleSignin.signIn();

    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    // Sign-in the user with the credential
    let user = await auth().signInWithCredential(googleCredential);
    return {
      email: user.user.email ?? '',
      name: user.user.displayName ?? '',
      pfp_url: user.user.photoURL ?? undefined,
      uid: user.user.uid,
      anonymous: false,
    };
  }

  export async function loginAnonymously(): Promise<PartialUser> {
    let user = await auth().signInAnonymously();
    return {
      uid: user.user.uid,
      anonymous: true,
    };
  }
}
