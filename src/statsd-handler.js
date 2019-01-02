const { BigQueryWriter } = require("./big-query-writer");
const { isStatsdMetric, createRow } = require("./statsd-utils");

const StatsdHandler = function(options, logger) {
  const counterMetric =
    options.counterMetricName !== undefined
      ? options.counterMetricName
      : "counter";
  const timerMetric =
    options.timerMetricName !== undefined ? options.timerMetricName : "timer";
  const gaugeMetric =
    options.guageMetricName !== undefined ? options.guageMetricName : "gauge";
  const setMetric =
    options.setMetricName !== undefined ? options.setMetricName : "set";

  const writer = BigQueryWriter(options, logger);

  return {
    flush: (ts, metrics) => {
      let counters = metrics.counters;
      // do nothing if there's nothing to do
      if (parseInt(counters["statsd.metrics_received"]) < 1) {
        return;
      }

      let time = new Date(ts * 1000).toISOString();
      let rows = [];
      let gauges = metrics.gauges;
      let timers = metrics.timers;
      let sets = metrics.sets;
      let counterRates = metrics.counter_rates;
      let timerData = metrics.timer_data;
      let statsdMetrics = metrics.statsd_metrics;

      function sanitize(key) {
        return key
          .replace(/\s+/g, "_")
          .replace(/\//g, "-")
          .replace(/[^a-zA-Z_\-0-9\.]/g, "");
      }

      // counters
      for (key in counters) {
        if (isStatsdMetric(key)) {
          continue;
        }
        let value = counters[key];

        if (value == 0) {
          continue;
        }

        let valuePerSecond = counterRates[key];
        let namespace = [sanitize(key)];
        rows.push(
          createRow(
            counterMetric,
            namespace.concat("rate").join("."),
            valuePerSecond,
            time
          )
        );
        rows.push(
          createRow(
            counterMetric,
            namespace.concat("count").join("."),
            value,
            time
          )
        );
      }

      // timers
      for (key in timerData) {
        if (isStatsdMetric(key)) {
          continue;
        }

        if (timerData[key].count == 0) {
          continue;
        }

        let namespace = [sanitize(key)];
        for (timerDataKey in timerData[key]) {
          let value = timerData[key][timerDataKey];
          if (typeof value === "number") {
            rows.push(
              createRow(
                timerMetric,
                namespace.concat(timerDataKey).join("."),
                value,
                time
              )
            );
          } else {
            // TODO: subkeys
          }
        }
      }

      // guages
      for (key in gauges) {
        if (isStatsdMetric(key)) {
          continue;
        }
        let namespace = [sanitize(key)];
        rows.push(
          createRow(gaugeMetric, namespace.join("."), gauges[key], time)
        );
      }

      // sets
      for (key in sets) {
        if (isStatsdMetric(key)) {
          continue;
        }
        let namespace = [sanitize(key)];
        rows.push(
          createRow(
            setMetric,
            namespace.join(".") + ".count",
            sets[key].size,
            time
          )
        );
      }

      return writer.write(ts, rows);
    },
    status: writeCb => {
      // TODO: write status
    }
  };
};

module.exports = { StatsdHandler };
