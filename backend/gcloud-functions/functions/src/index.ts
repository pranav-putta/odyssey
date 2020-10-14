import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as pg from "pg";
import { stringify } from "querystring";
import axios from "axios";

admin.initializeApp();

const pgConfig: pg.PoolConfig = {
  host: "odyssey.cnp1wrwnpclp.us-east-2.rds.amazonaws.com",
  port: 5432,
  user: "postgres",
  password: "never2$$chip",
  database: "odyssey",
};

export function findReps(address: string) {
  let params = {
    key: "AIzaSyBjX1sd05v_36BG6gmnhUqe3PsSrAnXHlw",
    address: address,
    includeOffices: true,
    levels: "administrativeArea1",
  };
  let ext =
    stringify(params) + "&roles=legislatorUpperBody&roles=legislatorLowerBody";
  let url =
    "https://civicinfo.googleapis.com/civicinfo/v2/representatives?" + ext;
  return axios.get(url);
}

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

exports.randomBills = functions.https.onRequest((req, res) => {
  let pgPool = new pg.Pool(pgConfig);
  pgPool
    .query("select * from public.bills order by random() limit 20")
    .then((out) => {
      res.send({ out: out.rows });
    })
    .catch((err) => {
      res.send({ error: err });
    });
});

exports.getUser = functions.https.onCall((data, context) => {
  const uuid = data.uuid;

  return admin
    .firestore()
    .collection("users")
    .doc(uuid)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return { result: doc.data(), error: null };
      } else {
        return { result: false, error: null };
      }
    })
    .catch((err) => {
      return { result: "", error: err };
    });
});

exports.getReps = functions.https.onRequest(async (req, res) => {
  let address = "261 dover circle, lake forest";
  let rawReps = await findReps(address);

  let officials = rawReps.data.officials;
  let id = new URLSearchParams(officials[0].urls[0]).get("MemberID");

  let pgPool = new pg.Pool(pgConfig);
  let member = await pgPool.query(
    `select * from public.members where member_id=${id}`
  );
  res.send({ reps: member.rows, error: null });
});
