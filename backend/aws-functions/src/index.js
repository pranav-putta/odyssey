"use strict";

const axios = require("axios");
const pg = require("pg");
const qs = require("querystring")

const pgConfig = {
  host: "odyssey.cnp1wrwnpclp.us-east-2.rds.amazonaws.com",
  port: 5432,
  user: "postgres",
  password: "never2$$chip",
  database: "odyssey",
};

function findReps(address) {
  let params = {
    key: "AIzaSyBjX1sd05v_36BG6gmnhUqe3PsSrAnXHlw",
    address: address,
    includeOffices: true,
    levels: "administrativeArea1",
  };
  let ext =
    qs.stringify(params) + "&roles=legislatorUpperBody&roles=legislatorLowerBody";
  let url =
    "https://civicinfo.googleapis.com/civicinfo/v2/representatives?" + ext;
  return axios.get(url);
}

module.exports.helloWorld = (event, context, callback) => {
  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*", // Required for CORS support to work
    },
    body: JSON.stringify({
      message: "Go Serverless v1.0! Your function executed successfully!",
      input: event,
    }),
  };

  callback(null, response);
};

module.exports.getReps = async (event, context, callback) => {
  let address = "261 dover circle, lake forest";
  const promise = new Promise(async function(resolve, reject) {
    let rawReps = await findReps(address);

    let officials = rawReps.data.officials;
    let id = new URLSearchParams(officials[0].urls[0]).get("MemberID");
/*
    let pgPool = new pg.Pool(pgConfig);
    let member = await pgPool.query(
      `select * from public.members where member_id=${id}`
    );
*/
    const response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Required for CORS support to work
      },
      body: JSON.stringify({
        reps: id,
        error: null,
      }),
    };
    resolve(response)
  });
  return promise;
};
