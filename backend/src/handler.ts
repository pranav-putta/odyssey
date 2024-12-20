import axios from "axios";
import pg from "pg";
import qs from "querystring";
import * as fb from "./firebase";
import * as aws from "aws-sdk";
import awsconfig from "./aws.config";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import busboy from "busboy";
import admin from "firebase-admin";
import { v4 as uuidv4 } from "uuid";

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

fb.init();

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
  let data = JSON.parse(event.body);

  if (data && data.uid && typeof data.uid === "string") {
    // set up dynamodb client
    aws.config.update(awsconfig.aws_remote_config);
    var client = new aws.DynamoDB.DocumentClient();

    const params: DocumentClient.QueryInput = {
      TableName: awsconfig.aws_user_table_name,
      KeyConditionExpression: "uid = :uid",
      ExpressionAttributeValues: {
        ":uid": data.uid,
      },
    };
    // look for document with specified uid
    let query = await client.query(params).promise();
    console.log("uid " + data.uid);
    console.log(query.$response);

    if (((!query.$response.error && query.Count) || 0) > 0) {
      return createSuccess({ result: true });
    } else {
      return createSuccess({ result: false });
    }
  } else {
    return createError("couldn't find uid!");
  }
};

export const get_user = async (event: any = {}): Promise<any> => {};

/**
 * creates a new entry in users table with the supplied info
 * @param event user information
 */
export const new_user = async (event: any = {}): Promise<any> => {
  console.log("HERE");
  let data = JSON.parse(event.body);
  if (!data) {
    return createError("post data could not be parsed");
  } else if (!data.token) {
    return createError("user token not found!");
  } else if (!data.user) {
    return createError("user data not found!");
  }

  // verify that user exists within the database
  if (!(await fb.verifyUser(data.token))) {
    return createError("specified user doesn't exist in database!");
  }

  if (!data.user) {
    return createError("no user information provided!");
  }

  // set up dynamodb client
  aws.config.update(awsconfig.aws_remote_config);
  var client = new aws.DynamoDB.DocumentClient();

  let photoURL =
    data.user.pfp_url != ""
      ? data.user.pfp_url
      : "https://cdn.business2community.com/wp-content/uploads/2017/08/blank-profile-picture-973460_640.png";
  console.log("User: " + data.user);

  // upload temp image
  let image = await axios.get(photoURL, { responseType: "arraybuffer" });
  let s3Data = await new aws.S3.ManagedUpload({
    params: {
      Bucket: "odyssey-user-pfp",
      Key: data.user.uid + "_pfp.jpg",
      Body: image.data,
      ACL: "public-read",
    },
  }).promise();
  if (!s3Data.Location) {
    return createError("unable to upload pfp");
  }
  // insert user into database
  data.user.pfp_url = s3Data.Location;
  data.user.liked = {};
  const params: DocumentClient.PutItemInput = {
    TableName: awsconfig.aws_user_table_name,
    Item: data.user,
  };
  let response = await client.put(params).promise();
  if (response.$response.error) {
    return createError(JSON.stringify(response.$response.error));
  }
  return createSuccess({ result: true });
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
      key: "AIzaSyD2Z2NUt7iCykcEIeRHS77jI2zSIPn0b6g",
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
    let divisions: any = rawReps.data.divisions;
    let officials: any[] = rawReps.data.officials;
    let ids: number[] = [];

    let districts: number[] = [];
    Object.keys(divisions).forEach((div) => {
      let divParts = div.split(":");
      districts.push(Number.parseInt(divParts[divParts.length - 1]));
    });

    // todo: update this for new detection protocol
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
export const load_bill_feed = async (event: any = {}): Promise<any> => {
  let data = JSON.parse(event.body);

  let topics: string[] = [];
  if (data.topics) {
    topics = Object.keys(data.topics).filter((key) => data.topics[key]);
  }

  let query = "(";
  topics.forEach((topic, i) => {
    query += `'${topic}'`;
    if (i != topics.length - 1) {
      query += ", ";
    }
  });
  query += ")";

  let pgPool = new pg.Pool(pgConfig);
  let bills = await pgPool.query(
    `select * from
    ((select * from public.bills where category in ${query} and viewable=true order by random() limit 20)
    union all
    (select * from public.bills  where category not in ${query} and viewable=true order by created desc limit 0))a
    order by random()`
  );
  await pgPool.end();

  const response = {
    bills: bills.rows,
  };
  return { statusCode: 200, body: JSON.stringify(response) };
};

/**
 * generates random bill
 * @param event
 */
export const liked_bills = async (event: any = {}): Promise<any> => {
  let data = JSON.parse(event.body);
  let likedBills = data.user.liked;

  let ids: string[] = [];
  Object.keys(likedBills).forEach((val) => {
    if (likedBills[val]) {
      ids.push(val);
    }
  });

  let params = [];
  for (var i = 1; i <= ids.length; i++) {
    params.push("$" + i);
  }

  let pgPool = new pg.Pool(pgConfig);
  let bills = await pgPool.query(
    "select * from public.bills where number IN (" + params.join(",") + ")",
    ids
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
    TableName: awsconfig.aws_user_table_name,
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

enum SearchBy {
  title,
  category,
  number,
}

export const search = async (event: any = {}): Promise<any> => {
  // todo: when returning data, only return actions 0 and len - 1
  let pgPool = new pg.Pool(pgConfig);
  let data = JSON.parse(event.body);

  let searchBy = data.searchBy;
  let searchQuery: string = data.query;

  let query = `select * from public.bills where ${searchBy} ILIKE '%${searchQuery}%' limit 25`;
  console.log(query);
  let bills = await pgPool.query(query);
  await pgPool.end();

  const response = {
    bills: bills.rows,
  };

  return { statusCode: 200, body: JSON.stringify(response) };
};

export const like = async (event: any = {}): Promise<any> => {
  let data = JSON.parse(event.body);
  let uid = data.uid;
  let billID = data.bill_id;
  let liked = data.liked;

  // set up dynamodb client
  aws.config.update(awsconfig.aws_remote_config);
  var client = new aws.DynamoDB.DocumentClient();

  const existParams: DocumentClient.UpdateItemInput = {
    TableName: awsconfig.aws_user_table_name,
    Key: {
      uid: uid,
    },
    UpdateExpression: "set #liked = :val",
    ConditionExpression: "attribute_not_exists(#liked)",
    ExpressionAttributeNames: {
      "#liked": "liked",
    },
    ExpressionAttributeValues: {
      ":val": {},
    },
  };
  let response;
  try {
    response = await client.update(existParams).promise();
    if (response.$response.error) {
      return createError(JSON.stringify(response.$response.error));
    }
  } catch (err) {
    // ignore error
  }

  const params: DocumentClient.UpdateItemInput = {
    TableName: awsconfig.aws_user_table_name,
    Key: {
      uid: uid,
    },
    UpdateExpression: "set liked.#bill_id = :liked",
    ExpressionAttributeNames: {
      "#bill_id": billID,
    },
    ExpressionAttributeValues: {
      ":liked": liked,
    },
  };
  response = await client.update(params).promise();
  if (response.$response.error) {
    return createError(JSON.stringify(response.$response.error));
  } else {
    return createSuccess({ result: true });
  }
};

export const vote = async (event: any = {}): Promise<any> => {
  let data = JSON.parse(event.body);
  let uid = data.uid;
  let billID: number = data.bill_id;
  let vote = data.vote;

  // set up dynamodb client
  aws.config.update(awsconfig.aws_remote_config);
  var client = new aws.DynamoDB.DocumentClient();

  // check if bill exists
  const exists: DocumentClient.QueryInput = {
    TableName: awsconfig.aws_voting_table_name,
    KeyConditionExpression: "bill_id = :bill_id",
    ExpressionAttributeValues: {
      ":bill_id": billID.toString(),
    },
  };
  // look for document with specified uid
  let query = await client.query(exists).promise();

  let response;
  if (((!query.$response.error && query.Count) || 0) > 0) {
    // bill exists, so update
    const params: DocumentClient.UpdateItemInput = {
      TableName: awsconfig.aws_voting_table_name,
      Key: {
        bill_id: billID.toString(),
      },
      UpdateExpression: "set #votes.#uid = :vote",
      ExpressionAttributeNames: {
        "#votes": "votes",
        "#uid": uid,
      },
      ExpressionAttributeValues: {
        ":vote": vote,
      },
    };
    response = await client.update(params).promise();
  } else {
    let input: { [key: string]: string } = {};
    input[uid] = vote;
    // bill doesn't exist, so create
    const params: DocumentClient.UpdateItemInput = {
      TableName: awsconfig.aws_voting_table_name,
      Key: {
        bill_id: billID.toString(),
      },
      UpdateExpression: "set #votes = :vote, #comments = :comments",
      ExpressionAttributeNames: {
        "#votes": "votes",
        "#comments": "comments",
      },
      ExpressionAttributeValues: {
        ":vote": input,
        ":comments": {},
      },
    };
    response = await client.update(params).promise();
  }

  if (response.$response.error) {
    return createError(JSON.stringify(response.$response.error));
  } else {
    return createSuccess({ result: true });
  }
};

export const add_comment = async (event: any = {}): Promise<any> => {
  let data = JSON.parse(event.body);
  let uid = data.uid;
  let billID: number = data.bill_id;
  let comment = data.comment;
  comment.uid = uid;

  // set up dynamodb client
  aws.config.update(awsconfig.aws_remote_config);
  var client = new aws.DynamoDB.DocumentClient();

  // check if bill exists
  const exists: DocumentClient.QueryInput = {
    TableName: awsconfig.aws_voting_table_name,
    KeyConditionExpression: "bill_id = :bill_id",
    ExpressionAttributeValues: {
      ":bill_id": billID.toString(),
    },
  };
  // look for document with specified uid
  let query = await client.query(exists).promise();

  let response;
  if (((!query.$response.error && query.Count) || 0) > 0) {
    // bill exists, so update
    const params: DocumentClient.UpdateItemInput = {
      TableName: awsconfig.aws_voting_table_name,
      Key: {
        bill_id: billID.toString(),
      },
      UpdateExpression: "set #comments.#uid = :comment",
      ExpressionAttributeNames: {
        "#comments": "comments",
        "#uid": comment.cid,
      },
      ExpressionAttributeValues: {
        ":comment": comment,
      },
    };
    response = await client.update(params).promise();
  } else {
    let input: { [key: string]: Comment } = {};
    input[comment.cid] = comment;
    // bill doesn't exist, so create
    const params: DocumentClient.UpdateItemInput = {
      TableName: awsconfig.aws_voting_table_name,
      Key: {
        bill_id: billID.toString(),
      },
      UpdateExpression: "set #votes = :vote, #comments = :comments",
      ExpressionAttributeNames: {
        "#votes": "votes",
        "#comments": "comments",
      },
      ExpressionAttributeValues: {
        ":vote": {},
        ":comments": input,
      },
    };
    response = await client.update(params).promise();
  }

  if (response.$response.error) {
    return createError(JSON.stringify(response.$response.error));
  } else {
    return createSuccess({ result: true });
  }
};

export const get_bill_data = async (event: any = {}): Promise<any> => {
  let data = JSON.parse(event.body);
  let billID: number = data.bill_id;

  // set up dynamodb client
  aws.config.update(awsconfig.aws_remote_config);
  var client = new aws.DynamoDB.DocumentClient();

  // check if bill exists
  const exists: DocumentClient.GetItemInput = {
    TableName: awsconfig.aws_voting_table_name,
    Key: {
      bill_id: billID.toString(),
    },
  };
  // look for document with specified uid
  let query = await client.get(exists).promise();
  if (query.$response.data && query.$response.data.Item) {
    // bill exists
    return createSuccess({
      success: true,
      bill: query.$response.data.Item,
    });
  } else {
    // send empty response
    console.log("here");
    return createSuccess({
      success: true,
      bill: { bill_id: billID, comments: [], votes: {} },
    });
  }
};

export const like_comment = async (event: any = {}): Promise<any> => {
  let data = JSON.parse(event.body);
  let billID: number = data.bill_id;
  let uid: string = data.uid;
  let liked: boolean = data.liked;

  // set up dynamodb client
  aws.config.update(awsconfig.aws_remote_config);
  var client = new aws.DynamoDB.DocumentClient();
  // bill exists, so update
  const params: DocumentClient.UpdateItemInput = {
    TableName: awsconfig.aws_voting_table_name,
    Key: {
      bill_id: billID.toString(),
    },
    UpdateExpression: "set #comments.#cid.likes.#uid = :value",
    ExpressionAttributeNames: {
      "#comments": "comments",
      "#cid": data.cid,
      "#uid": uid,
    },
    ExpressionAttributeValues: {
      ":value": liked,
    },
  };
  let response = await client.update(params).promise();
  if (response.$response.error) {
    return createError(JSON.stringify(response.$response.error));
  } else {
    return createSuccess({ result: true });
  }
};

export const delete_comment = async (event: any = {}): Promise<any> => {
  let data = JSON.parse(event.body);
  let cid: string = data.cid;
  let billID: number = data.bill_id;

  // set up dynamodb client
  aws.config.update(awsconfig.aws_remote_config);
  var client = new aws.DynamoDB.DocumentClient();
  // bill exists, so update
  const params: DocumentClient.UpdateItemInput = {
    TableName: awsconfig.aws_voting_table_name,
    Key: {
      bill_id: billID.toString(),
    },
    UpdateExpression: "remove #comments.#cid",
    ExpressionAttributeNames: {
      "#comments": "comments",
      "#cid": cid,
    },
  };
  let response = await client.update(params).promise();
  if (response.$response.error) {
    return createError(JSON.stringify(response.$response.error));
  } else {
    return createSuccess({ result: true });
  }
};

export const upload_pfp = async (event: any = {}): Promise<any> => {
  return new Promise<any>((resolve, reject) => {
    // get content type
    let contentType = event.headers["content-type"];
    if (!contentType) {
      contentType = event.headers["Content-Type"];
    }

    // setup busboy
    const result: { [key: string]: string } = {};
    const b = new busboy({ headers: { "content-type": contentType } });
    b.on("file", (field, file, fileName, enc, mimetype) => {
      file.on("data", (data) => {
        result.image = data;
      });
      file.on("end", () => {
        result.filename = fileName;
        result.contentType = mimetype;
      });
    });

    b.on("field", (field, val) => {
      result[field] = val;
    });

    b.on("finish", () => {
      // data successfully received
      if (result.image) {
        // upload to S3
        aws.config.update(awsconfig.aws_remote_config);
        return new aws.S3.ManagedUpload({
          params: {
            Bucket: "odyssey-user-pfp",
            Key: result.filename,
            Body: result.image,
            ACL: "public-read",
          },
        })
          .promise()
          .then(() => {
            resolve(createSuccess({ result: true }));
          });
      }
    });
    b.on("error", (error: any) => {
      console.log(error);
      reject(error);
    });
    b.write(event.body, event.isBase64Encoded ? "base64" : "binary");
    b.end();
  });
};

export const update_profile = async (event: any = {}): Promise<any> => {
  let data = JSON.parse(event.body);
  let uid = data.uid;
  let name = data.name;
  let address = data.address;
  let email = data.email;

  // set up dynamodb client
  aws.config.update(awsconfig.aws_remote_config);
  var client = new aws.DynamoDB.DocumentClient();
  // bill exists, so update
  const params: DocumentClient.UpdateItemInput = {
    TableName: awsconfig.aws_user_table_name,
    Key: {
      uid: uid,
    },
    UpdateExpression: "set #name = :name, #address = :address, #email = :email",
    ExpressionAttributeNames: {
      "#name": "name",
      "#address": "address",
      "#email": "email",
    },
    ExpressionAttributeValues: {
      ":name": name,
      ":address": address,
      ":email": email,
    },
  };
  let response = await client.update(params).promise();
  if (response.$response.error) {
    return createError(JSON.stringify(response.$response.error));
  } else {
    return createSuccess({ result: true });
  }
};

export const fetch_bill = async (event: any = {}): Promise<any> => {
  interface BillMetadata {
    assembly: number;
    chamber: string;
    number: number;
  }

  enum Vote {
    None = -1,
    Yes = 0,
    No = 1,
  }

  interface BillVotes {
    [uid: string]: Vote;
  }

  interface Comment {
    uid: string;
    text: string;
    likes: { [uid: string]: boolean };
    name: string;
    date: number;
  }

  interface BillData {
    bill_id: string;
    votes: BillVotes;
    comments: Comment[];
  }

  let data = JSON.parse(event.body);
  let bill: BillMetadata = data.bill;

  let id = bill.assembly + bill.chamber + bill.number;

  // set up dynamodb client
  aws.config.update(awsconfig.aws_remote_config);
  var client = new aws.DynamoDB.DocumentClient();

  // check if bill exists
  const exists: DocumentClient.GetItemInput = {
    TableName: awsconfig.aws_voting_table_name,
    Key: {
      bill_id: id,
    },
  };
  // look for document with specified uid
  let query = await client.get(exists).promise();
  let billData: BillData = { bill_id: id, comments: [], votes: {} };
  if (query.$response.data && query.$response.data.Item) {
    // bill exists
    billData = query.$response.data.Item as BillData;
  }

  // fetch actual bill data
  let pgPool = new pg.Pool(pgConfig);
  let bills = await pgPool.query(
    `select * from public.bills where assembly=${bill.assembly} and chamber='${bill.chamber}' and number=${bill.number} limit 1`
  );
  await pgPool.end();

  const response = {
    data: billData,
    bills: bills.rows[0],
  };

  return createSuccess(response);
};

/**
 * generates committees
 * @param event
 */
export const fetch_committees = async (event: any = {}): Promise<any> => {
  let pgPool = new pg.Pool(pgConfig);
  let committees = await pgPool.query(`select * from public.committees`);
  await pgPool.end();

  const response = {
    committees: committees.rows,
  };
  return { statusCode: 200, body: JSON.stringify(response) };
};

export const delete_user = async (event: any = {}): Promise<any> => {};
export const email_rep = async (event: any = {}): Promise<any> => {};

interface Notification {
  BillInfo: {
    Number: number;
    Assembly: number;
    Chamber: string;
    URL: string;
  };
  Text: String;
}

export const send_notifications = async (event: any = {}): Promise<any> => {
  let data = JSON.parse(event.body);
  let notifications: Notification[] = data.notifications;

  for (let i = 0; i < notifications.length; i++) {
    let notification = notifications[i];

    let bill = notification.BillInfo;
    let id = bill.Assembly + bill.Chamber + bill.Number;
    console.log("Sending: " + JSON.stringify(notification));
    await admin
      .messaging()
      .sendToTopic(id, {
        notification: {
          title: "Bill Update",
          body: notification.Text.toString(),
          sound: "default",
        },
      })
      .then((response) => {
        console.log(response.messageId);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  return { statusCode: 200, body: JSON.stringify({}) };
};
