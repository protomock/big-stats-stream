import test from 'ava';
const { isValid } = require('../src/config-validator')

test('Returns true when config is valid', t => {
  process.env.GOOGLE_APPLICATION_CREDENTIALS='./test/fixtures/fake-service-account.json'
  let options = {
    projectId: "-",
    datasetId: "-",
    tableId: "-"
  }
  t.true(isValid(options))
});

test('Returns false when options is undefined', t => {
  process.env.GOOGLE_APPLICATION_CREDENTIALS='./test/fixtures/fake-service-account.json'
  let options = undefined

  t.false(isValid(options))
});

test('Returns false when options is missing projectId', t => {
  process.env.GOOGLE_APPLICATION_CREDENTIALS='./test/fixtures/fake-service-account.json'
  let options = {
    datasetId: "-",
    tableId: "-"
  }

  t.false(isValid(options))

  options.projectId = ""
  t.false(isValid(options))
});

test('Returns false when options is missing datasetId', t => {
  process.env.GOOGLE_APPLICATION_CREDENTIALS='./test/fixtures/fake-service-account.json'
  let options = {
    projectId: "-",
    tableId: "-"
  }

  t.false(isValid(options))

  options.datasetId = ""
  t.false(isValid(options))
});

test('Returns false when options is missing tableId', t => {
  process.env.GOOGLE_APPLICATION_CREDENTIALS='./test/fixtures/fake-service-account.json'
  let options = {
    projectId: "-",
    datasetId: "-"
  }

  t.false(isValid(options))

  options.tableId = ""
  t.false(isValid(options))
});

test('Returns false when credentialPath is missing', t => {
  delete process.env.GOOGLE_APPLICATION_CREDENTIALS
  let options = {
    projectId: "-",
    datasetId: "-",
    tableId: "-"
  }

  t.false(isValid(options))
});

test('Returns false when credential from credentialPath is missing auth_provider_x509_cert_url', t => {
  process.env.GOOGLE_APPLICATION_CREDENTIALS='./test/fixtures/fake-service-account-missing-auth-provider-x509-cert-url.json'
  let options = {
    projectId: "-",
    datasetId: "-",
    tableId: "-"
  }

  t.false(isValid(options))
});

test('Returns false when credential from credentialPath is missing auth_uri', t => {
  process.env.GOOGLE_APPLICATION_CREDENTIALS='./test/fixtures/fake-service-account-missing-auth-uri.json'
  let options = {
    projectId: "-",
    datasetId: "-",
    tableId: "-"
  }

  t.false(isValid(options))
});

test('Returns false when credential from credentialPath is missing client_email', t => {
  process.env.GOOGLE_APPLICATION_CREDENTIALS='./test/fixtures/fake-service-account-missing-client-email.json'
  let options = {
    projectId: "-",
    datasetId: "-",
    tableId: "-"
  }

  t.false(isValid(options))
});

test('Returns false when credential from credentialPath is missing client_id', t => {
  process.env.GOOGLE_APPLICATION_CREDENTIALS='./test/fixtures/fake-service-account-missing-client-id.json'
  let options = {
    projectId: "-",
    datasetId: "-",
    tableId: "-"
  }

  t.false(isValid(options))
});

test('Returns false when credential from credentialPath is missing client_x509_cert_url', t => {
  process.env.GOOGLE_APPLICATION_CREDENTIALS='./test/fixtures/fake-service-account-missing-client-x509-cert-url.json'
  let options = {
    projectId: "-",
    datasetId: "-",
    tableId: "-"
  }

  t.false(isValid(options))
});

test('Returns false when credential from credentialPath is missing private_key', t => {
  process.env.GOOGLE_APPLICATION_CREDENTIALS='./test/fixtures/fake-service-account-missing-private-key.json'
  let options = {
    projectId: "-",
    datasetId: "-",
    tableId: "-"
  }

  t.false(isValid(options))
});

test('Returns false when credential from credentialPath is missing private_key_id', t => {
  process.env.GOOGLE_APPLICATION_CREDENTIALS='./test/fixtures/fake-service-account-missing-private-key-id.json'
  let options = {
    projectId: "-",
    datasetId: "-",
    tableId: "-"
  }

  t.false(isValid(options))
});

test('Returns false when credential from credentialPath is missing project_id', t => {
  process.env.GOOGLE_APPLICATION_CREDENTIALS='./test/fixtures/fake-service-account-missing-project-id.json'
  let options = {
    projectId: "-",
    datasetId: "-",
    tableId: "-"
  }

  t.false(isValid(options))
});

test('Returns false when credential from credentialPath is missing token_uri', t => {
  process.env.GOOGLE_APPLICATION_CREDENTIALS='./test/fixtures/fake-service-account-missing-token-uri.json'
  let options = {
    projectId: "-",
    datasetId: "-",
    tableId: "-"
  }

  t.false(isValid(options))
});

test('Returns false when credential from credentialPath is missing type', t => {
  process.env.GOOGLE_APPLICATION_CREDENTIALS='./test/fixtures/fake-service-account-missing-type.json'
  let options = {
    projectId: "-",
    datasetId: "-",
    tableId: "-"
  }

  t.false(isValid(options))
});
