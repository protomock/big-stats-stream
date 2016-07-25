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
