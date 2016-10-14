var events = require("events");
var bigStats = require("..");

exports.testInit = function(test) {
  test.ok(
    !bigStats.init(
      new Date(), { bigquery: {} }, new events.EventEmitter(), undefined
    ),
    "init requires a credentials"
  );

  test.ok(
    !bigStats.init(
      new Date(), { bigquery: { credentials: { } } }, new events.EventEmitter(), undefined
    ),
    "init requires a credentials.client_email"
  );

  test.ok(
    !bigStats.init(
      new Date(), { bigquery: { credentials: { client_email: "foo@google.com" } } }, new events.EventEmitter(), undefined
    ),
    "init requires a credentials.private_key"
  );

  //console.log(bigStats);
  //test.expect(1);
  //test.ok(true, "this assertion should pass");
  test.done();
};

exports.testNewRow = function(test) {
  const key = "statsd.my.metric.sum";
  const type = "timer";
  const value = "1.0";
  const timestamp = "123";

  const expected = {
    "metric_type": type,
    "key": key,
    "value": value,
    "timestamp": timestamp,
    "suffix": "sum"
  };

  const actual = bigStats.newRow(type, key, value, timestamp);
  test.deepEqual(actual, expected, "new row object off");
  test.done();
}

exports.testNewRowFloatValue = function(test) {
  const key = "statsd.my.metric.sum";
  const type = "timer";
  const value = "1";
  const timestamp = "123";

  const expected = "1.0";

  const actual = bigStats.newRow(type, key, value, timestamp);
  test.equal(actual.value + "", expected, "new row object off");
  test.done();
}
