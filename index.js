var google = require('googleapis');
var bq = google.bigquery('v2');

var newRow = function(key, value, timestamp) {
  return { "key": key, "value": value, "timestamp": timestamp }
}

var statsdMetic = function(name) {
  return name.startsWith("statsd.")
}

var Writer = function(options, logger) {
  var log = logger || console;
  // big query table info
  var key = options.key;
  var projectId = options.projectId;
  var datasetId = options.datasetId;
  var tableId = options.tableId;
  // stat key prefixes
  var globalNamespace = [options.globalPrefix !== undefined ? options.globalPrefix : "stats"];
  var counterNamespace = globalNamespace.concat(options.counterPrefix !== undefined ? options.counterPrefix : "counters");
  var timerNamespace = globalNamespace.concat(options.timerPrefix !== undefined ? options.timerPrefix : "timers");
  var gaugeNamespace = globalNamespace.concat(options.guagePrefix !== undefined ? options.guagePrefix : "gauges");
  var setNamespace = globalNamespace.concat(options.setPrefix !== undefined ? options.setPrefix : "sets");

  var auth = new google.auth.JWT(
    key.client_email,
    null,
    key.private_key,
    ['https://www.googleapis.com/auth/bigquery'],
    null
  );

  auth.authorize(function(err, tokens) {
    if (err) {
      log.log("failed to authorize client");
      log.log(err);
      return;
    }
    log.log("google client is authorized");
  });

  var write = function(rows) {
    // https://cloud.google.com/bigquery/docs/reference/v2/jobs/insert
    var request = {
      projectId: projectId,
      datasetId: datasetId,
      auth: auth,
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
        body: rows.map(JSON.stringify).join("\n")
      }
    };
    log.log("submitting insert job")
    console.log(request.media.body);
    bq.jobs.insert(request, function (err, result) {
      if (err) {
        log.log("failed to submit bigquery insert job")
        log.log(err);
      } else {
        log.log("bigquery job accepted")
      }
    });
  }

  // statsd interface
  var flush = function(ts, metrics) {
    console.log(metrics)
    var counters = metrics.counters;
    // do nothing if there's nothing to do
    if (parseInt(counters["statsd.metrics_received"]) < 1) {
      console.log("no metrics received")
      return
    }

    var time = new Date(ts * 1000).toISOString();
    var rows = [];
    var gauges = metrics.gauges;
    var timers = metrics.timers;
    var sets = metrics.sets;
    var counterRates = metrics.counter_rates;
    var timerData = metrics.timer_data;
    var statsdMetrics = metrics.statsd_metrics;

    function sanitize(key) {
      return key.replace(/\s+/g, '_')
                 .replace(/\//g, '-')
                 .replace(/[^a-zA-Z_\-0-9\.]/g, '');
    }

    // counters
    for (key in counters) {
      if (statsdMetic(key)) {
        continue
      }
      var value = counters[key];
      var valuePerSecond = counterRates[key];
      var namespace = counterNamespace.concat(sanitize(key));
      rows.push(newRow(namespace.concat('rate').join("."), valuePerSecond, time));
      rows.push(newRow(namespace.concat('count').join("."), value, time));
    }

    // timers
    for (key in timerData) {
      if (statsdMetic(key)) {
        continue
      }
      var namespace = timerNamespace.concat(sanitize(key));
      for (timerDataKey in timerData[key]) {
        var value = timerData[key][timerDataKey];
        if (typeof(value) === 'number') {
          rows.push(newRow(namespace.concat(timerDataKey).join("."), value, time))
        } else {
            // TODO: subkeys
        }
      }
    }

    // guages
    for (key in gauges) {
      if (statsdMetic(key)) {
        continue
      }
      var namespace = gaugeNamespace.concat(sanitize(key));
      rows.push(newRow(namespace.join("."), gauges[key], time));
    }

    // sets
    for (key in sets) {
      if (statsdMetic(key)) {
        continue
      }
      var namespace = setNamespace.concat(sanitize(key));
      rows.push(newRow(namespace.join(".") + '.count', sets[key].size(), time));
    }
    // TODO: write to bq
    console.log(rows);
    write(rows);
  };

  var status = function(writeCb) {
    // TODO: write status
  };

  // public api
  return {
    flush: flush,
    status: status,
    write: write
  }
}

// statsd entrypoint
module.exports.init = function(startup_time, config, events, logger) {
  var writer = Writer(config.bigquery || {}, logger);
  events.on('flush', writer.flush);
  events.on('status', writer.status);
  return true;
}

// test
module.exports.run = function() {
  var writer = Writer({
    projectId: process.env.PROJECT_ID,
    datasetId: process.env.DATASET_ID,
    tableId: process.env.TABLE_ID,
    key: JSON.parse(process.env.GOOGLE_API_CREDENTIALS)
  })
  writer.write([newRow("foo.bar", 123.0, new Date().toISOString())])
}
