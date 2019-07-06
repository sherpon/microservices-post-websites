const axios = require('axios');

/**
 * 
 * @param {object} config - the website config file
 */
const virtualhostCreator = (config) => {
  return new Promise((resolve, reject) => {
    const configuration = {
      method: 'post',
      baseURL: `${process.env.CREATOR_ENDPOINT}`,
      headers: {},
      data: config
    };
    axios(configuration)
    .then((response) => {
      resolve(response.status);
    })
    .catch((error) => {
      reject(error)
    });
  });
};

module.exports = virtualhostCreator;