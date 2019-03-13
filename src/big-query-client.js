const { BigQuery } = require("@google-cloud/bigquery");

module.exports = {
  BigQueryClient: options => {
    const projectId = options.projectId;
    const datasetId = options.datasetId;
    const tableId = options.tableId;
    const bq = new BigQuery({ projectId });

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
