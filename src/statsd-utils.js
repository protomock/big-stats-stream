module.exports = {
    isStatsdMetric: (name) => name.indexOf("statsd.") === 0,
    createRow: (metric_type, key, value, timestamp) => {
        let suffix = key.split(".").pop()
        value = parseFloat(value).toFixed(1)     
        return {
          metric_type,
          key,
          value,
          timestamp,
          suffix
        }
      }
}