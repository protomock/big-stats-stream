module.exports = {
  isValid: credentials => {
    return (
      credentials !== undefined &&
      credentials.client_email !== undefined &&
      credentials.private_key !== undefined
    );
  }
};
