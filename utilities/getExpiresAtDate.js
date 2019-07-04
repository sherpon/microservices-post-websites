
/**
 * @returns {Date} - get expiry date. Is the next month.
 */
const getExpiresAtDate = () => {
  const today = new Date();
  const expiryDate = new Date(today.setMonth(today.getMonth()+1));
  return expiryDate;
};

module.exports = getExpiresAtDate;