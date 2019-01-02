const { StatsdHandler } = require('./src/statsd-handler')
const { isValid } = require('./src/credential-validator')

// statsd entrypoint
module.exports.init = function(startup_time, config, events, logger) {
  let options = config.bigquery;
  let credentials = options.credentials;
  logger = logger || console;

  if(!isValid(credentials)) {
    logger.log("failed to initialize due missing authentication credentials");
    return false;
  }

  let handler = StatsdHandler(options || {}, logger);

  events.on("flush", async (ts, metrics) =>
    await handler.flush(ts, metrics)
  );

  events.on("status", handler.status);
  return true;
};
