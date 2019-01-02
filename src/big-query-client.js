const { BigQuery } = require("@google-cloud/bigquery");

module.exports = {
  BigQueryClient: options => {
    const credentials = options.credentials;
    const projectId = options.projectId;
    const datasetId = options.datasetId;
    const tableId = options.tableId;
    const bq = new BigQuery({ projectId, credentials });

    return {
      insert: rows => {
        return bq
          .dataset(datasetId)
          .table(tableId)
          .insert(rows);
      }
    }
  }
}
