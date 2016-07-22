var google = require('googleapis');
var bq = google.bigquery('v2');

var Writer = function(options) {
  var key = options.key;
  var projectId = options.projectId;
  var datasetId = options.datasetId;
  var tableId = options.tableId;
  var auth = new google.auth.JWT(
    key.client_email,
    null,
    key.private_key,
    ['https://www.googleapis.com/auth/bigquery'],
    null
  );

  auth.authorize(function(err, tokens) {
    if (err) {
      console.log("failed to authorize client");
      console.log(err);
      return;
    }
    console.log("google client is authorized");
  });

  var write = function(key, value, timestamp) {
    // https://cloud.google.com/bigquery/docs/reference/v2/jobs/insert
    var request = {
      projectId: projectId,
      datasetId: datasetId,
      auth: auth,
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
        // TODO: multiple rows
        body: JSON.stringify({key: key, value: value, timestamp: timestamp})
      }
    };
    bq.jobs.insert(request, function (err, result) {
      if (err) {
        console.log(err);
      } else {
        console.log(result);
      }
    });
  }

  // statsd interface

  return {
    flush: function(ts, metrics) {
      // TODO: format and write to bq
    },

    status: function(writeCb) {
      // TODO: write status
    },
    write: write
  }
}

// statsd entrypoint
module.exports.init = function(startup_time, config, events, logger) {
  var writer = Writer(config.bigquery || {});
  events.on('flush', writer.flush);
  events.on('status', writer.status);
}

// test
module.exports.run = function() {
  var writer = Writer({
    projectId: process.env.PROJECT_ID,
    datasetId: process.env.DATASET_ID,
    tableId: process.env.TABLE_ID,
    key: JSON.parse(process.env.GOOGLE_API_CREDENTIALS)
  })
  writer.write("foo.bar", 123, new Date().toISOString())
}
