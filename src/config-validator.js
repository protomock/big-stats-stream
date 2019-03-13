const fs = require('fs')

module.exports = {
  isValid: options => {
    let credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    let credentials = (credentialsPath === undefined) ? undefined : JSON.parse(fs.readFileSync(credentialsPath))

    let credentialsIsValid = (
        credentials !== undefined &&
        credentials.auth_provider_x509_cert_url !== undefined &&
        credentials.auth_uri !== undefined &&
        credentials.client_email !== undefined &&
        credentials.client_id !== undefined &&
        credentials.client_x509_cert_url !== undefined &&
        credentials.private_key !== undefined &&
        credentials.private_key_id !== undefined &&
        credentials.project_id !== undefined &&
        credentials.token_uri !== undefined &&
        credentials.type !== undefined
    )

    let configIsValid = (
        options !== undefined &&
        options.projectId !== undefined &&
        options.projectId !== "" &&
        options.datasetId !== undefined &&
        options.datasetId!== "" &&
        options.tableId !== undefined &&
        options.tableId !== ""
    )

    return credentialsIsValid && configIsValid;
  }
};
