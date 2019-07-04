const culqiPaymentProcess = require('./culqi');

/**
 * 
 * @param {Object} req - http request object
 * @param {Object} firestore
 * @returns {Promise} - if the payment was successful returns true and the new req object. Otherwise, returns false.
 * @example
 * const newReq = await paymentProcess(req);
 */
const paymentProcess = (req, firestore) => { 
  switch (process.env.PAYMENT_PROCESSOR) {
    case 'CULQI':
      return culqiPaymentProcess(req, firestore);
  
    default:
      console.error('Didn\'t find any payment processor');
      throw 0;
  }
};

module.exports = paymentProcess;