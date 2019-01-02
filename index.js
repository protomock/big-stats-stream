var google = require('googleapis');
var bq = google.bigquery('v2');

var newRow = function(type, key, value, timestamp) {
  var suffix = key.split('.').pop()
  return {
    "metric_type": type,
    "key": key,
    "value": parseFloat(value).toFixed(1),
    "timestamp": timestamp,
    "suffix": suffix
  }
}

var statsdMetic = function(name) {
  return name.indexOf("statsd.") === 0
}

var Writer = function(options, logger) {
  var log = logger || console;
  // flush interval
  // defaults to 120 to avoid reaching quota limits
  // on number of jobs/day (currently 1000)
  // assuming 1440 minutes in a day,
  // 1440 / 1000 = 1.44 minutes or 104 seconds, 120 to be safe
  // https://cloud.google.com/bigquery/quota-policy#import
  var flushInterval = options.flushInterval || 120;
  // last time we flushed
  var lastFlush;
  // internal buffer
  var buffer = [];

  // big query table info
  var credentials = options.credentials;
  var projectId = options.projectId;
  var datasetId = options.datasetId;
  var tableId = options.tableId;

  // stat metric names
  // defines the "metric_type" vaule associated with a recorded stat
  var counterMetic = options.counterMetricName !== undefined ? options.counterMetricName : "counter";
  var timerMetric = options.timerMetricName !== undefined ? options.timerMetricName : "timer";
  var gaugeMetric = options.guageMetricName !== undefined ? options.guageMetricName : "gauge";
  var setMetric = options.setMetricName !== undefined ? options.setMetricName : "set";

  if (credentials === undefined || credentials.client_email === undefined || credentials.private_key === undefined) {
    log.log("failed to initialize due missing authentication credentials")
    return;
  }
  var auth = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
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

  var shouldBuffer = function(timestamp) {
    return lastFlush !== undefined && (timestamp - lastFlush) < flushInterval;
  }

  var write = function(timestamp, rows) {
    if (shouldBuffer(timestamp)) {
      log.log("buffering...")
      buffer = buffer.concat(rows)
      return;
    }
    rows = buffer.concat(rows);
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
    bq.jobs.insert(request, function (err, result) {
      if (err) {
        log.log("failed to submit bigquery insert job")
        log.log(err);
      } else {
        log.log("submitted job inserting " + rows.length + " rows")
        log.log("With results: " + result)
      }
    });
    lastFlush = timestamp;
    buffer = [];
  }

  // statsd interface
  var flush = function(ts, metrics) {
    var counters = metrics.counters;
    // do nothing if there's nothing to do
    if (parseInt(counters["statsd.metrics_received"]) < 1) {
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

      if (value == 0) {
        continue;
      }

      var valuePerSecond = counterRates[key];
      var namespace = [sanitize(key)];
      rows.push(newRow(counterMetic, namespace.concat('rate').join("."), valuePerSecond, time));
      rows.push(newRow(counterMetic, namespace.concat('count').join("."), value, time));
    }

    // timers
    for (key in timerData) {
      if (statsdMetic(key)) {
        continue
      }

      if (timerData[key].count == 0) {
        continue;
      }

      var namespace = [sanitize(key)];
      for (timerDataKey in timerData[key]) {
        var value = timerData[key][timerDataKey];
        if (typeof(value) === 'number') {
          rows.push(newRow(timerMetric, namespace.concat(timerDataKey).join("."), value, time))
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
      var namespace = [sanitize(key)];
      rows.push(newRow(gaugeMetric, namespace.join("."), gauges[key], time));
    }

    // sets
    for (key in sets) {
      if (statsdMetic(key)) {
        continue
      }
      var namespace = [sanitize(key)];
      rows.push(newRow(setMetric, namespace.join(".") + '.count', sets[key].size(), time));
    }

    // perform write
    write(ts, rows);
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
  if (writer === undefined) {
    return false;
  }
  events.on('flush', writer.flush);
  events.on('status', writer.status);
  return true;
}

module.exports.newRow = newRow;
