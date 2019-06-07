const axios = require('axios');

/**
 * 
 * @param {object} config - the website config file
 */
const virtualhostCreator = (config) => {
  return axios({
    method: 'post',
    url: `${process.env.VIRTUALHOST_CREATOR_ENDPOINT}`,
    headers: {},
    data: config
  });
};

module.exports = virtualhostCreator;