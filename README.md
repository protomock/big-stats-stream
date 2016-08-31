# big stats [![Build Status](https://travis-ci.org/meetup/big-stats.svg?branch=master)](https://travis-ci.org/meetup/big-stats) [![NPM Version](https://img.shields.io/npm/v/big-stats.svg)](https://npmjs.org/package/big-stats)

> a google [big query](https://cloud.google.com/bigquery/) backend for [statsd](https://github.com/etsy/statsd#readme)

## usage

Big stats can be npm installed onto your statsd host and then referenced in your statsd
server's configuration under backends

```json
cat config.json
{
  bigquery: {
    credentials: {
       ...
    },
    projectId: "your-gcp-project-id",
    datasetId: "your_big_query_data_set_id",
    tableId: "your_big_query_table_id"
  }
  , backends: ["big-stats"],
  , ...
}
```

Big stats is configured through a `bigquery` section of your statsd server configuration.

The "credentials" should be a set of google API service account credentials acquired
through your google cloud console.

"projectId" and "datasetId" must be predefined in your console [bigquery](https://bigquery.cloud.google.com/)

"tableId" must be provided in as configuration by does not need to be preconfigured
in your google cloud console. big-stats will create the table on the fly if not
previously present.

You can optionally provide a "flushInterval" (in seconds) for how often you wish to flush to bigquery. The default is `104` seconds which factors in BigQuery's [1000 job per day quota limit](https://cloud.google.com/bigquery/quota-policy#import). Note than statsd flushes in `10` second intervals by default.

## schema

Big stats assumes a 4 column schema

| name        | data type   |description                 |
|-------------|-------------|----------------------------|
| timestamp   | TIMESTAMP   | time stat was flushed      |
| value       | FLOAT       | value associated with stat |
| key         | STRING      | user defined stat key      |
| metric_type | STRING      | metric type                |

Only user define stats will be published to big query. Statsd internal metrics,
those prefixed with `statsd.`, will be omitted.

Meetup 2016
