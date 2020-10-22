const pg = require("pg");

const pgConfig = {
  host: "odyssey.cnp1wrwnpclp.us-east-2.rds.amazonaws.com",
  port: 5432,
  user: "postgres",
  password: "never2$$chip",
  database: "odyssey",
  statement_timeout: 3000,
  connectionTimeoutMillis: 30000,
};

let pgPool = new pg.Pool(pgConfig);
pgPool
  .connect()
  .then((res) => {
    console.log("connected!");
  })
  .catch((err) => {
    console.log(err);
  });
