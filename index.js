var google = require('googleapis');
var bigquery = google.bigquery('v2');
var projectId = process.env.PROJECT_ID;
var datasetId = process.env.DATASET_ID;
var tableId = process.env.TABLE_ID;
var key = process.env.GOOGLE_API_CREDENTIALS;

var client = new google.auth.JWT(
  key.client_email,
  null,
  key.private_key,
  ['https://www.googleapis.com/auth/bigquery'],
  null
);

client.authorize(function(err, tokens) {
  if (err) {
    console.log(err);
    return;
  }
  console.log("google client is authorized");
});

var record = function(key, value, timestamp) {
  // https://cloud.google.com/bigquery/docs/reference/v2/jobs/insert
  var request = {
    projectId: projectId,
    datasetId: datasetId,
    auth: client,
    dryRun: true,
    resource: {
      mimeType: "application/json",
      configuration: {
        load: {
          autodetect: true,
          createDisposition: 'CREATE_IF_NEEDED',
          writeDisposition: 'WRITE_APPEND',
          destinationTable: {
            projectId: projectId,
            datasetId: datasetId,
            tableId: tableId
          },
          sourceFormat: 'NEWLINE_DELIMITED_JSON'
        }
      }
    },
    media: {
      mimeType: "*/*",
      body: JSON.stringify({key: key, value: value, timestamp: timestamp})
    }
  };
  bigquery.jobs.insert(request, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
    }
  });
}

module.exports.run = function() {
  record("foo.bar", 123, new Date().toISOString())
}
