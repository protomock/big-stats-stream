module.exports = {
  isValid: credentials => {
    return (
      credentials !== undefined &&
      credentials !== ""
    );
  }
};
