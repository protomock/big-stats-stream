// const bigStats = require("..");
// const logger = {
//   log: function(message) {}
// }

// exports.testInit = function(test) {
//   test.ok(
//     !bigStats.init(
//       new Date(), { bigquery: {} }, new events.EventEmitter(), logger
//     ),
//     "init requires a credentials"
//   );

//   test.ok(
//     !bigStats.init(
//       new Date(), { bigquery: { credentials: { } } }, new events.EventEmitter(), logger
//     ),
//     "init requires a credentials.client_email"
//   );

//   test.ok(
//     !bigStats.init(
//       new Date(), { bigquery: { credentials: { client_email: "foo@google.com" } } }, new events.EventEmitter(), logger
//     ),
//     "init requires a credentials.private_key"
//   );

//   //console.log(bigStats);
//   //test.expect(1);
//   //test.ok(true, "this assertion should pass");
//   test.done();
// };

// exports.testNewRow = function(test) {
//   const key = "statsd.my.metric.sum";
//   const type = "timer";
//   const value = "1.0";
//   const timestamp = "123";

//   const expected = {
//     "metric_type": type,
//     "key": key,
//     "value": value,
//     "timestamp": timestamp,
//     "suffix": "sum"
//   };

//   const actual = bigStats.newRow(type, key, value, timestamp);
//   test.deepEqual(actual, expected, "new row object off");
//   test.done();
// }

// exports.testNewRowFloatValue = function(test) {
//   const key = "statsd.my.metric.sum";
//   const type = "timer";
//   const value = "1";
//   const timestamp = "123";

//   const expected = "1.0";

//   const actual = bigStats.newRow(type, key, value, timestamp);
//   test.equal(actual.value + "", expected, "new row object off");
//   test.done();
// }

import test from 'ava';
import events from "events";
import sinon from 'sinon';
import MockInjector from 'mock-injector'
const { mock, clear } = MockInjector(__dirname)
const { StatsdHandler } = mock('../src/statsd-handler')
const BigStats = clear('..')

test('Init when credentials are valid, should create statsd handler and set the events handler', t => {
  let config = {
    bigquery: {
      credentials: {
        client_email: 'some-email',
        private_key: 'some-key'
      }
    }
  }
  let emitter = new events.EventEmitter()
  let statsdHandlerMock = {
    flush: sinon.stub(),
    status: sinon.stub()
  }

  StatsdHandler.returns(statsdHandlerMock)

  let success = BigStats.init(123456, config, emitter, { log: sinon.stub() })
  emitter.emit('flush', 'some-ts', 'some-metrics')
  emitter.emit('status', 'some-write-cb')

  t.deepEqual(statsdHandlerMock.flush.firstCall.args,['some-ts','some-metrics'])
  t.deepEqual(statsdHandlerMock.status.firstCall.args, ['some-write-cb'])
  t.true(success)
});

test('Init when credentials are invalid, should not create handler', t => {
  let config = {
    bigquery: {
      credentials: {
        client_email: 'some-email'
      }
    }
  }
  let logger = { log: sinon.stub() }
  let success = BigStats.init(123456, config, 'some-emitter', logger)
  t.deepEqual(logger.log.firstCall.args, ["failed to initialize due missing authentication credentials"])
  t.false(success)
});

test('Init when when logger is not provided, uses console', t => {
  let config = {
    bigquery: {
      credentials: {
        client_email: 'some-email'
      }
    }
  }
  let consoleSpy = sinon.spy(console, 'log')
  let success = BigStats.init(123456, config, 'some-emitter')
  t.deepEqual(consoleSpy.firstCall.args, ["failed to initialize due missing authentication credentials"])
  t.false(success)
});
