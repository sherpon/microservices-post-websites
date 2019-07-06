/**
 * https://www.culqi.com/docs/#/suscripciones/inicio
 * https://www.culqi.com/api/
 */

const axios = require('axios');
const saveUserPaymentProcessor = require('../db/saveUserPaymentProcessor');

const CULQI_API_ENDPOINT = 'https://api.culqi.com/v2';

/**
 * 
 * @param {String} firstName 
 * @param {String} lastName 
 * @param {String} address 
 * @param {String} addressCity 
 * @param {String} countryCode 
 * @param {String} email 
 * @param {String} phoneNumber 
 * @returns {Primise} - returns the customer id.
 */
const culqiCreateCustomer = (firstName, lastName, address, addressCity, countryCode, email, phoneNumber) => {
  return new Promise((resolve, reject) => {
    axios({
      method: 'post',
      baseURL: `${CULQI_API_ENDPOINT}/customers`,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${process.env.PAYMENT_PROCESSOR_PRIVATE_KEY}`
      },
      data: {
        first_name: firstName,
        last_name: lastName,
        address: address,
        address_city: addressCity,
        country_code: countryCode,
        email: email,
        phone_number: phoneNumber,
      }
    })
    .then(response => {
      if (response.status===201) {
        const customerId = response.data.id;
        resolve(customerId);
      } else {
        console.error('culqiCreateCustomer returned a status different than 201');
        reject('culqiCreateCustomer returned a status different than 201');
      }
    })
    .catch(error => {
      console.error(error);
      reject(error);
    });
  });
};

/**
 * 
 * @param {String} customerId 
 * @param {String} tokenId 
 * @returns {Promise} - returns card's id
 */
const culqiCreateCard = (customerId, tokenId) => {
  return new Promise((resolve, reject) => {
    axios({
      method: 'post',
      baseURL: `${CULQI_API_ENDPOINT}/cards`,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${process.env.PAYMENT_PROCESSOR_PRIVATE_KEY}`
      },
      data: {
        customer_id: customerId,
        token_id: tokenId,
      }
    })
    .then(response => {
      if (response.status===201) {
        const cardId = response.data.id;
        resolve(cardId);
      } else {
        console.error('culqiCreateCard returned a status different than 201');
        reject('culqiCreateCard returned a status different than 201');
      }
    })
    .catch(error => {
      console.error(error);
      reject(error);
    });
  });
};

/**
 * 
 * @param {String} cardId 
 * @param {String} planId 
 * @returns {Promise} - returns subscription's id
 */
const culqiCreateSubscription = (cardId, planId) => {
  return new Promise((resolve, reject) => {
    axios({
      method: 'post',
      baseURL: `${CULQI_API_ENDPOINT}/cards`,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${process.env.PAYMENT_PROCESSOR_PRIVATE_KEY}`
      },
      data: {
        card_id: cardId,
        plan_id: planId,
      }
    })
    .then(response => {
      if (response.status===201) {
        const subscriptionId = response.data.id;
        resolve(subscriptionId);
      } else {
        console.error('culqiCreateCard returned a status different than 201');
        reject('culqiCreateCard returned a status different than 201');
      }
    })
    .catch(error => {
      console.error(error);
      reject(error);
    });
  });
};

/**
 * 
 * @param {Object} req - http object request
 * @param {Object} firestore
 * @returns {Promise} - if the payment was successful returns true and the new req object. Otherwise, returns false.
 * @example
 * const newReq = await paymentProcess(req);
 */
const culqiPaymentProcess = (req, firestore) => {
  return new Promise( async (resolve, reject) => {
    try {
      let paymentProcessorParameters = req.body.paymentProcessorParameters;
      if (paymentProcessorParameters.customerId==='') {
        paymentProcessorParameters.customerId = await culqiCreateCustomer(
          paymentProcessorParameters.firstName, 
          paymentProcessorParameters.lastName, 
          paymentProcessorParameters.address, 
          paymentProcessorParameters.addressCity, 
          paymentProcessorParameters.countryCode, 
          paymentProcessorParameters.email, 
          paymentProcessorParameters.phoneNumber
        );
        
      }
      const cardId = await culqiCreateCard(paymentProcessorParameters.customerId, paymentProcessorParameters.tokenId);
      const subscriptionId = await culqiCreateSubscription(cardId, paymentProcessorParameters.planId);
      await saveUserPaymentProcessor(firestore, req.query.userId, {
        cardId: cardId,
        customerId: paymentProcessorParameters.customerId,
        firstName: paymentProcessorParameters.firstName, 
        lastName: paymentProcessorParameters.lastName, 
        address: paymentProcessorParameters.address, 
        addressCity: paymentProcessorParameters.addressCity, 
        countryCode: paymentProcessorParameters.countryCode, 
        email: paymentProcessorParameters.email, 
        phoneNumber: paymentProcessorParameters.phoneNumber
      });
      const websitePaymentProcessor = {
        planId: paymentProcessorParameters.planId,
        subscriptionId: subscriptionId,
      };
      req.websitePaymentProcessor = websitePaymentProcessor;
      resolve(req);
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
};

module.exports = culqiPaymentProcess;