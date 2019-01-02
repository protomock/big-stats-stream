import test from "ava";
import sinon from "sinon";
import MockInjector from "mock-injector";
const { mock, clear } = MockInjector(__dirname);
const { BigQueryClient } = mock("../src/big-query-client");
const { BigQueryWriter } = clear("../src/big-query-writer");

let subject, logger, bigQueryClientMock;
test.beforeEach(() => {
  logger = {
    log: sinon.stub()
  };
  bigQueryClientMock = {
    insert: sinon.stub()
  };

  BigQueryClient.returns(bigQueryClientMock);

  subject = BigQueryWriter("some-options", logger);
});

test("BigQueryWriter write should stream write to bigquery", async t => {
  bigQueryClientMock.insert.resolves();
  let response = await subject.write(1234567, [{ id: 1 }, { id: 2 }]);

  t.deepEqual(bigQueryClientMock.insert.firstCall.args, [
    [{ id: 1 }, { id: 2 }]
  ]);
  t.deepEqual(logger.log.firstCall.args, ["Inserted 2 rows"]);
});

test("BigQueryWriter write when fails with PartialFailureError should log all failures", async t => {
  bigQueryClientMock.insert.rejects({
    name: "PartialFailureError",
    errors: [{ name: "some-error" }, { name: "some-error-2" }]
  });

  await subject.write(1234567, [{ id: 1 }, { id: 2 }]);

  t.deepEqual(bigQueryClientMock.insert.secondCall.args, [
    [{ id: 1 }, { id: 2 }]
  ]);
  t.deepEqual(logger.log.secondCall.args, ["Insert errors:"]);
  t.deepEqual(logger.log.thirdCall.args, [
    JSON.stringify({ name: "some-error" })
  ]);
  t.deepEqual(logger.log.getCall(3).args, [
    JSON.stringify({ name: "some-error-2" })
  ]);
});

test("BigQueryWriter write when fails with other error should failure", async t => {
  bigQueryClientMock.insert.rejects({
    name: "OtherError"
  });

  await subject.write(1234567, [{ id: 1 }, { id: 2 }]);

  t.deepEqual(bigQueryClientMock.insert.secondCall.args, [
    [{ id: 1 }, { id: 2 }]
  ]);
  t.deepEqual(logger.log.getCall(4).args, [
    "ERROR:",
    JSON.stringify({
      name: "OtherError"
    })
  ]);
});
