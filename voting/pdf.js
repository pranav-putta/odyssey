const fs = require("fs");
const { type } = require("os");
const pdf = require("pdf-parse");

const request = require("request").defaults({ encoding: null });

request.get(
  "https://www.ilga.gov/legislation/votehistory/101/house/10100SB0117_05212019_009000T.pdf",
  function (error, response, body) {
    if (!error && response.statusCode == 200) {
      let dataBuffer = Buffer.from(body);

      pdf(dataBuffer).then(function (data) {
        let votes = data.text;
        let individual = votes.split(/[\s,]+/);
        individual = individual.filter((item) => item);

        let record = new Map();
        let mapper = {
          Y: 0,
          N: 1,
          E: 2,
          NV: 3,
        };

        for (i = 0; i < individual.length; i++) {
          if (
            !(
              Object.keys(mapper).includes(individual[i]) &&
              individual[i + 1] != "-"
            )
          ) {
            continue;
          }
          record[individual[i + 1]] = mapper[individual[i]];
        }
        console.log(record);
        console.log(record.size);
      });
    }
  }
);
