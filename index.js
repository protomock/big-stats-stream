var google = require('googleapis');
var bigquery = google.bigquery('v2');

var projectId = "meetup-prod";
var datasetId = "blt_timings";
var key = require("./google-auth-credentials.json");

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

module.exports.run = function() {
  // https://cloud.google.com/bigquery/docs/reference/v2/jobs/insert
  var request = {
    projectId: projectId,
    datasetId: datasetId,
    auth: client,
    resource: { }
  }
  bigquery.datasets.insert(request, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
    }
  });
}
