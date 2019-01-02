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
