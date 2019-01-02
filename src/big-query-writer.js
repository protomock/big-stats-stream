const { BigQueryClient } = require("../src/big-query-client");

function BigQueryWriter(options, logger) {
    const client = BigQueryClient(options)

    return {
        write: (timestamp, rows) => {
            return client
              .insert(rows)
              .then(() => {
                logger.log(`Inserted ${rows.length} rows`);
              })
              .catch(err => {
                if (err && err.name === "PartialFailureError") {
                  if (err.errors && err.errors.length > 0) {
                    logger.log("Insert errors:");
                    err.errors.forEach(err => logger.log((JSON.stringify(err))));
                  }
                } else {
                  logger.log("ERROR:", JSON.stringify(err));
                }
              });
          }
    }
}

module.exports = { BigQueryWriter }