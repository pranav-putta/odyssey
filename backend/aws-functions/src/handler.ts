import axios from "axios";
import pg from "pg";
import qs from "querystring";

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

  const pgConfig: pg.PoolConfig = {
    host: "odyssey.cnp1wrwnpclp.us-east-2.rds.amazonaws.com",
    port: 5432,
    user: "postgres",
    password: "never2$$chip",
    database: "odyssey",
  };

  let address = "261 dover circle, lake forest";
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
  /*
  let pgPool = new pg.Pool(pgConfig);
  let members = await pgPool.query(
    `select * from public.members where member_id=(${params.join(", ")})`, ids
  );
  await pgPool.end()
*/
  return {
    members: ids,
  };
};
