const { StatsdHandler } = require('./src/statsd-handler')
const { isValid } = require('./src/config-validator')

// statsd entrypoint
module.exports.init = function(startup_time, config, events, logger) {
  let l = logger || console;
  let options = config.bigquery;

  if(!isValid(options)) {
    l.log("Please set GOOGLE_APPLICATION_CREDENTIALS environment variable");
    return false;
  }

  let handler = StatsdHandler(options || {}, l);

  events.on("flush", async (ts, metrics) =>
    await handler.flush(ts, metrics)
  );

  events.on("status", handler.status);
  return true;
};
