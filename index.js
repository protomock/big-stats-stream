const { StatsdHandler } = require('./src/statsd-handler')
const { isValid } = require('./src/credential-validator')

// statsd entrypoint
module.exports.init = function(startup_time, config, events, logger) {
  let options = config.bigquery;
  let credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  logger = logger || console;

  if(!isValid(credentials)) {
    logger.log("Please Set GOOGLE_APPLICATION_CREDENTIALS environment variable");
    return false;
  }

  let handler = StatsdHandler(options || {}, logger);

  events.on("flush", async (ts, metrics) =>
    await handler.flush(ts, metrics)
  );

  events.on("status", handler.status);
  return true;
};
