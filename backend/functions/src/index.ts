import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

/*
 * this backend function verifies if the user with the
 * specified uuid exists
 */
exports.userExists = functions.https.onCall((data, context) => {
  const uuid = data.uuid;
  return admin
    .firestore()
    .collection("users")
    .doc(uuid)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return { result: true, error: null };
      } else {
        return { result: false, error: null };
      }
    })
    .catch((error) => {
      return { result: false, error: error };
    });
});

/*
 * generate new user in database
 */
exports.newUser = functions.https.onCall((data, context) => {
  const uuid = data.uuid;

  return admin
    .firestore()
    .collection("users")
    .doc(uuid)
    .set(data)
    .then(() => {
      return { result: true, error: null };
    })
    .catch((err) => {
      return { result: true, error: err };
    });
});
