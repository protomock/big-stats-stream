import test from "ava";
import sinon from "sinon";
import MockInjector from "mock-injector";
const { mock, clear } = MockInjector(__dirname);
const { BigQueryWriter } = mock("../src/big-query-writer");
const { StatsdHandler } = clear("../src/statsd-handler");

let subject, bigQueryWriterMock, logger;
test.beforeEach(() => {
  bigQueryWriterMock = {
    write: sinon.stub()
  };
  bigQueryWriterMock.write.returns("some-response");

  BigQueryWriter.returns(bigQueryWriterMock);

  subject = StatsdHandler({}, 'some-logger');
});

test("StatsdHandler when creating an instance should create bigquerywriter with the default options", t => {
    t.deepEqual(BigQueryWriter.firstCall.args, [{}, 'some-logger'])
});

test("StatsdHandler when flushing, should flush the counters with rate and count", t => {
  let response = subject.flush(1234567, {
    counter_rates: {
      "some.counter_example": 2.5
    },
    counters: {
      "statsd.metrics_received": 1,
      "some.counter_example": 20
    }
  });
  t.deepEqual(response, "some-response");
  t.deepEqual(bigQueryWriterMock.write.firstCall.args, [
    1234567,
    [
      {
        key: "some.counter_example.rate",
        metric_type: "counter",
        suffix: "rate",
        timestamp: "1970-01-15T06:56:07.000Z",
        value: "2.5"
      },
      {
        key: "some.counter_example.count",
        metric_type: "counter",
        suffix: "count",
        timestamp: "1970-01-15T06:56:07.000Z",
        value: "20.0"
      }
    ]
  ]);
});

test("StatsdHandler when flushing, should flush the timerData with count and provided timer metrics", t => {
  let response = subject.flush(1234567, {
    timer_data: {
      "some.timer": {
        count: 2,
        start: 1234567,
        end: 2134556
      }
    },
    counters: {
      "statsd.metrics_received": 1
    }
  });
  t.deepEqual(response, "some-response");
  t.deepEqual(bigQueryWriterMock.write.secondCall.args, [
    1234567,
    [
      {
        key: "some.timer.count",
        metric_type: "timer",
        suffix: "count",
        timestamp: "1970-01-15T06:56:07.000Z",
        value: "2.0"
      },
      {
        key: "some.timer.start",
        metric_type: "timer",
        suffix: "start",
        timestamp: "1970-01-15T06:56:07.000Z",
        value: "1234567.0"
      },
      {
        key: "some.timer.end",
        metric_type: "timer",
        suffix: "end",
        timestamp: "1970-01-15T06:56:07.000Z",
        value: "2134556.0"
      }
    ]
  ]);
});

test("StatsdHandler when flushing, should flush the gauges with gauged metric", t => {
  let response = subject.flush(1234567, {
    gauges: {
      "some.gauge": 12003
    },
    counters: {
      "statsd.metrics_received": 1
    }
  });
  t.deepEqual(response, "some-response");
  t.deepEqual(bigQueryWriterMock.write.thirdCall.args, [
    1234567,
    [
      {
        key: "some.gauge",
        metric_type: "gauge",
        suffix: "gauge",
        timestamp: "1970-01-15T06:56:07.000Z",
        value: "12003.0"
      }
    ]
  ]);
});

test("StatsdHandler when flushing, should flush the sets total size", t => {
    let response = subject.flush(1234567, {
      sets: {
        "some.set": new Set([1,2,3,4])
      },
      counters: {
        "statsd.metrics_received": 1
      }
    });
    t.deepEqual(response, "some-response");
    t.deepEqual(bigQueryWriterMock.write.getCall(3).args, [
      1234567,
      [
        {
          key: "some.set.count",
          metric_type: "set",
          suffix: "count",
          timestamp: "1970-01-15T06:56:07.000Z",
          value: "4.0"
        }
      ]
    ]);
});
