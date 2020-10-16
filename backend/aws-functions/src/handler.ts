import axios from "axios";
import pg from "pg";
import qs from "querystring";
import * as fb from "./firebase";
import * as aws from "aws-sdk";
import awsconfig from "./aws.config";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

const current_version = 1;

const pgConfig: pg.PoolConfig = {
  host: "odyssey.cnp1wrwnpclp.us-east-2.rds.amazonaws.com",
  port: 5432,
  user: "postgres",
  password: "never2$$chip",
  database: "odyssey",
  statement_timeout: 3000,
  connectionTimeoutMillis: 10000,
};

/**
 * generates an error response message
 * @param message message to display
 */
function createError(message: string) {
  return {
    statusCode: 400,
    body: JSON.stringify({ error: message }),
  };
}

/**
 * generates a successful response message
 * @param result data to show
 */
function createSuccess(result: any) {
  return {
    statusCode: 200,
    body: JSON.stringify({ error: null, ...result }),
  };
}

/**
 * checks if the specified user uid exists in the database
 * @param event
 */
export const user_exists = async (event: any = {}): Promise<any> => {
  let data = event["queryStringParameters"];

  if (data && data.uid && typeof data.uid === "string") {
    // set up dynamodb client
    aws.config.update(awsconfig.aws_remote_config);
    var client = new aws.DynamoDB.DocumentClient();

    const params: DocumentClient.QueryInput = {
      TableName: awsconfig.aws_table_name,
      KeyConditionExpression: "uid = :uid",
      ExpressionAttributeValues: {
        ":uid": data.uid,
      },
    };
    // look for document with specified uid
    let query = await client.query(params).promise();
    if (((!query.$response.error && query.Count) || 0) > 0) {
      return createSuccess({ result: true });
    } else {
      return createSuccess({ result: false });
    }
  } else {
    return createError("couldn't find uid!");
  }
};

/**
 * creates a new entry in users table with the supplied info
 * @param event user information
 */
export const new_user = async (event: any = {}): Promise<any> => {
  let data = JSON.parse(event.body);
  if (!data) {
    return createError("post data could not be parsed");
  } else if (!data.token) {
    return createError("user token not found!");
  } else if (!data.user) {
    return createError("user data not found!");
  }

  // verify that user exists within the database
  fb.init();
  if (!(await fb.verifyUser(data.token))) {
    return createError("specified user doesn't exist in database!");
  }

  if (!data.user) {
    return createError("no user information provided!");
  }

  // set up dynamodb client
  aws.config.update(awsconfig.aws_remote_config);
  var client = new aws.DynamoDB.DocumentClient();

  const params: DocumentClient.PutItemInput = {
    TableName: awsconfig.aws_table_name,
    Item: data.user,
  };
  let response = await client.put(params).promise();
  if (response.$response.error) {
    return createError(JSON.stringify(response.$response.error));
  } else {
    return createSuccess({ result: true });
  }
};

/**
 * takes address as input and queries google civic info
 * and corresponding AWS RDS member info
 * @param event supply address
 */
const get_reps = async (address: string) => {
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
    let rawReps = await findReps(address);
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

    return members.rows;
  } catch (error) {
    console.log(error);
    return [];
  }
};

/**
 * generates random bill
 * @param event
 */
export const rand_bills = async (event: any = {}): Promise<any> => {
  //let uuid = event["queryStringParameters"].uuid;
  let pgPool = new pg.Pool(pgConfig);
  let bills = await pgPool.query(
    "select * from public.bills where category != 'Other' and category != 'DNE' order by random() limit 20"
  );
  await pgPool.end();

  const response = {
    bills: bills.rows,
  };
  return { statusCode: 200, body: JSON.stringify(response) };
};

export const refresh = async (event: any = {}): Promise<any> => {
  interface ResponseBody {
    userData: any;
    version: number;
    reps: any[];
    error: string;
    data: any;
  }
  let data = JSON.parse(event.body);
  if (!data) {
    return createError("post data could not be parsed");
  }
  let uid = data.uid;
  // set up dynamodb client
  aws.config.update(awsconfig.aws_remote_config);
  var client = new aws.DynamoDB.DocumentClient();

  const params: DocumentClient.QueryInput = {
    TableName: awsconfig.aws_table_name,
    KeyConditionExpression: "uid = :uid",
    ExpressionAttributeValues: {
      ":uid": data.uid,
    },
  };
  // look for document with specified uid
  return await client
    .query(params)
    .promise()
    .then(async (response) => {
      if ((response.Count || 0) < 1 || !response.Items) {
        return createError("no matching users found");
      }
      // create return body
      let body: ResponseBody = {
        userData: response.Items[0],
        version: current_version,
        reps: [],
        error: "",
        data: {},
      };
      // check address
      if (!body.userData.address) {
        return createError("address not found");
      }
      // get reps
      let reps = await get_reps(body.userData.address);
      if (!reps) {
        body.error = "reps couldn't be found";
      }
      body.reps = reps;

      // if data version is not up to date, return new documents
      if (data.version && data.version != current_version) {
        body.data = {};
      }

      return createSuccess(body);
    })
    .catch((err) => {
      return createError(JSON.stringify(err));
    });
};
