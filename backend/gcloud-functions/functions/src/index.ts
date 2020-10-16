import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as pg from "pg";
import axios from "axios";
import * as qs from "querystring";

admin.initializeApp();

const pgConfig: pg.PoolConfig = {
  host: "odyssey.cnp1wrwnpclp.us-east-2.rds.amazonaws.com",
  port: 5432,
  user: "postgres",
  password: "never2$$chip",
  database: "odyssey",
};

const currentVersion = 0.1;

function sendError(message: string) {
  return { result: null, error: message };
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
 * @param uuid
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

/**
 * generate a random set of bills from database
 */
exports.randomBills = functions.https.onCall((data, ctx) => {
  let pgPool = new pg.Pool(pgConfig);
  pgPool
    .query("select * from public.bills order by random() limit 20")
    .then((out) => {
      return { result: out.rows, error: null };
    })
    .catch((err) => {
      return { result: [], error: err };
    });
});

/**
 * get user information with specified uuid
 */
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

/**
 * pulls user data, representative data, and if
 * any other information has to be updated
 */
exports.refresh = functions.https.onCall(async (data, context) => {
  let uuid = context.auth?.uid;
  let version = data.version;
  if (uuid) {
    let doc = await admin.firestore().collection("users").doc(uuid).get();
    let userData = await doc.data();

    let response = {
      user: userData,
      reps: [],
      error: "",
      version: currentVersion,
      data: {},
    };

    // retrieve rep data from axios
    if (!userData) {
      return sendError("couldn't find user in firestore!");
    } else if (!userData.address) {
      return sendError("couldn't find address in user data!");
    }
    let repData = await axios.get(
      "https://x9jfkp4yfh.execute-api.us-east-2.amazonaws.com/prod/get-reps",
      {
        params: {
          address: userData.address,
        },
      }
    );
    if (repData.status == 200) {
      response.reps = repData.data;
    } else {
      response.error = "couldn't find reps";
    }

    // if data version is not up to date, update stuff
    if (version && version != currentVersion) {
      response.data = {};
    }
    return response;
  } else {
    return sendError("couldn't find user identifier!");
  }
});

/**
 * takes address as input and queries google civic info
 * and corresponding AWS RDS member info
 * @param event any
 */
export const get_reps = async (event: any = {}): Promise<any> => {
  /**
   * uses goolge civic info api to find representatives matching address
   * @param address address to query
   */
  function findReps(address: string) {
    let params = {
      key: "AIzaSyBjX1sd05v_36BG6gmnhUqe3PsSrAnXHlw",
      address: address,
      includeOffices: true,
      levels: "administrativeArea1",
    };
    let ext =
      qs.stringify(params) +
      "&roles=legislatorUpperBody&roles=legislatorLowerBody";
    let url =
      "https://civicinfo.googleapis.com/civicinfo/v2/representatives?" + ext;
    return axios.get(url);
  }

  try {
    let rawReps = await findReps(event["queryStringParameters"].address);
    console.log(JSON.stringify(rawReps.data));
    let officials: any[] = rawReps.data.officials;
    let ids: number[] = [];
    officials.forEach((element: any) => {
      if (
        element.hasOwnProperty("urls") &&
        Array.isArray(element.urls) &&
        element.urls.length > 0
      ) {
        ids.push(
          Number.parseInt(
            new URLSearchParams(element.urls[0]).get("MemberID") || "0"
          )
        );
      }
    });

    // create query
    let params = [];
    for (var i = 1; i <= ids.length; i++) {
      params.push("$" + i);
    }

    let pgPool = new pg.Pool(pgConfig);
    let members = await pgPool.query(
      `select * from public.members where member_id in (${params.join(", ")})`,
      ids
    );
    await pgPool.end();

    const response = {
      members: members.rows,
    };
    return { statusCode: 200, body: JSON.stringify(response) };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "couldn't find representatives" }),
    };
  }
};
