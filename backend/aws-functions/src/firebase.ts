import admin, { ServiceAccount } from "firebase-admin";

import * as serviceAccount from "./serviceAccountKey.json";

export function init() {
  admin.initializeApp({
    credential: admin.credential.cert(<any>serviceAccount),
    databaseURL: "https://odyssey-4329f.firebaseio.com",
  });
}

export async function verifyUser(id: string): Promise<boolean> {
  return admin
    .auth()
    .verifyIdToken(id)
    .then(() => {
      return true;
    })
    .catch(() => {
      return false;
    });
}
